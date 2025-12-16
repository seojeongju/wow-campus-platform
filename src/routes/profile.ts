// Profile routes for WOW-CAMPUS Work Platform

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { Bindings, Variables } from '../types/env';
import { authMiddleware, requireCompany } from '../middleware/auth';
import { getCurrentTimestamp } from '../utils/database';

const profile = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get company profile
profile.get('/company', authMiddleware, requireCompany, async (c) => {
  try {
    console.log('[Profile API] GET /company - 시작');

    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, message: 'Unauthorized' }, 401);
    }
    console.log('[Profile API] 사용자 정보:', user ? { id: user.id, user_type: user.user_type } : 'null');

    if (!user) {
      console.error('[Profile API] 사용자 정보 없음');
      return c.json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      }, 401);
    }

    if (!c.env.DB) {
      console.error('[Profile API] DB 객체 없음');
      return c.json({
        success: false,
        message: '데이터베이스 연결 오류'
      }, 500);
    }

    console.log('[Profile API] DB 쿼리 실행 시작, user_id:', user.id);

    // Get company profile
    const companyProfile = await c.env.DB.prepare(`
      SELECT * FROM companies WHERE user_id = ?
    `).bind(user.id).first();

    console.log('[Profile API] 쿼리 결과:', companyProfile ? '프로필 발견' : '프로필 없음');

    if (!companyProfile) {
      return c.json({
        success: false,
        message: '기업 프로필을 찾을 수 없습니다.'
      }, 404);
    }

    console.log('[Profile API] 프로필 반환 성공');
    return c.json({
      success: true,
      profile: companyProfile
    });
  } catch (error) {
    console.error('[Profile API] 기업 프로필 조회 오류:', error);
    console.error('[Profile API] 오류 스택:', error instanceof Error ? error.stack : 'No stack trace');

    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return c.json({
      success: false,
      message: '프로필 조회에 실패했습니다.',
      error: errorMessage,
      stack: errorStack
    }, 500);
  }
});

// Update company profile
profile.put('/company', authMiddleware, requireCompany, async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, message: 'Unauthorized' }, 401);
    }
    const body = await c.req.json();

    const {
      company_name,
      business_number,
      industry,
      company_size,
      founded_year,
      website,
      address,
      description,
      phone,
      representative_name
    } = body;

    // Validate required fields
    if (!company_name) {
      return c.json({
        success: false,
        message: '회사명은 필수입니다.'
      }, 400);
    }

    // Check if company exists
    const existingCompany = await c.env.DB.prepare(`
      SELECT id FROM companies WHERE user_id = ?
    `).bind(user.id).first();

    if (!existingCompany) {
      return c.json({
        success: false,
        message: '기업 프로필을 찾을 수 없습니다.'
      }, 404);
    }

    // 1. Update users table (name, phone)
    // representative_name is stored in users.name
    if (representative_name || phone) {
      const updateFields = [];
      const updateValues = [];

      if (representative_name) {
        updateFields.push('name = ?');
        updateValues.push(representative_name);
      }
      if (phone) {
        updateFields.push('phone = ?');
        updateValues.push(phone);
      }

      if (updateFields.length > 0) {
        updateValues.push(user.id);
        await c.env.DB.prepare(`
          UPDATE users SET ${updateFields.join(', ')}, updated_at = datetime('now') WHERE id = ?
        `).bind(...updateValues).run();
      }
    }

    // 2. Update companies table (only initial schema columns)
    const result = await c.env.DB.prepare(`
      UPDATE companies 
      SET company_name = ?,
          business_number = ?,
          industry = ?,
          company_size = ?,
          founded_year = ?,
          website = ?,
          address = ?,
          description = ?,
          updated_at = ?
      WHERE user_id = ?
    `).bind(
      company_name,
      business_number || null,
      industry || null,
      company_size || null,
      founded_year || null,
      website || null,
      address || null,
      description || null,
      getCurrentTimestamp(),
      user.id
    ).run();

    if (!result.success) {
      throw new Error('프로필 업데이트 실패');
    }

    // Get updated profile
    const updatedProfile = await c.env.DB.prepare(`
      SELECT * FROM companies WHERE user_id = ?
    `).bind(user.id).first();

    return c.json({
      success: true,
      message: '프로필이 성공적으로 수정되었습니다.',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('기업 프로필 수정 오류:', error);
    return c.json({
      success: false,
      message: '프로필 수정에 실패했습니다.',
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ==========================================
// Jobseeker Routes (Merged from profile_extended.ts)
// ==========================================

// 구직자 프로필 생성 (회원가입 후 최초 1회) 및 업데이트
profile.post('/jobseeker', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, message: 'Unauthorized' }, 401);
    }
    const db = c.env.DB;
    const body = await c.req.json();

    console.log('[Profile] POST /jobseeker request body:', body);

    // 이미 프로필이 있는지 확인
    const existing = await db.prepare('SELECT id FROM jobseekers WHERE user_id = ?').bind(user.id).first();

    // 공통 파라미터 (프론트엔드에서 snake_case로 전송됨)
    // D1의 bind()에는 undefined가 전달되면 안 되므로, null 처리 필수
    const params = [
      user.id,
      body.first_name ?? null,
      body.last_name ?? null,
      body.birth_date ?? null,
      body.gender ?? null,
      body.nationality ?? null,
      body.visa_status ?? null, // DB: visa_type
      body.korean_level ?? null,
      body.experience_years ?? 0,
      body.education_level ?? null,
      body.preferred_location ?? null,
      body.current_location ?? null, // Added current_location
      JSON.stringify(body.skills || []),
      body.bio || '',
    ];

    console.log('[Profile] Bind parameters:', params);

    if (existing) {
      // 기존 프로필 업데이트
      const updateQuery = `
        UPDATE jobseekers
        SET first_name = ?,
            last_name = ?,
            birth_date = ?,
            gender = ?,
            nationality = ?,
            visa_status = ?,
            korean_level = ?,
            experience_years = ?,
            education_level = ?,
            preferred_location = ?,
            current_location = ?,
            skills = ?,
            bio = ?,
            updated_at = datetime('now')
        WHERE user_id = ?
      `;

      await db.prepare(updateQuery).bind(
        params[1], // first_name
        params[2], // last_name
        params[3], // birth_date
        params[4], // gender
        params[5], // nationality
        params[6], // visa_status -> visa_type
        params[7], // korean_level
        params[8], // experience_years
        params[9], // education_level
        params[10], // preferred_location
        params[11], // current_location
        params[12], // skills
        params[13], // bio
        user.id
      ).run();

      return c.json({
        success: true,
        message: '프로필이 성공적으로 수정되었습니다.',
        profileId: existing.id
      });
    }

    // 프로필 생성
    const result = await db.prepare(`
      INSERT INTO jobseekers (
        user_id, first_name, last_name, birth_date, gender, nationality,
        visa_status, korean_level, experience_years, education_level,
        preferred_location, current_location, skills, bio,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(...params).run();

    return c.json({
      success: true,
      message: '프로필이 성공적으로 생성되었습니다.',
      profileId: result.meta.last_row_id
    });
  } catch (error) {
    console.error('Profile creation error:', error);
    // 에러 상세 정보 반환
    return c.json({
      success: false,
      message: '프로필 생성 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// 프로필 업데이트 (일반적인 수정)
profile.put('/update', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, message: 'Unauthorized' }, 401);
    }
    const db = c.env.DB;
    const body = await c.req.json();

    console.log('📝 프로필 업데이트 요청:', { userId: user.id, body });

    // 1. Users 테이블 업데이트 (이름, 전화번호)
    if (body.name || body.phone) {
      await db.prepare(`
        UPDATE users 
        SET name = COALESCE(?, name), 
            phone = COALESCE(?, phone),
            updated_at = datetime('now')
        WHERE id = ?
      `).bind(body.name, body.phone, user.id).run();
    }

    // 2. Jobseekers 테이블 업데이트
    // user_type이 jobseeker인 경우에만
    if (user.user_type === 'jobseeker') {
      await db.prepare(`
        UPDATE jobseekers 
        SET 
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          birth_date = COALESCE(?, birth_date),
          gender = COALESCE(?, gender),
          nationality = COALESCE(?, nationality),
          visa_status = COALESCE(?, visa_status),
          current_location = COALESCE(?, current_location),
          korean_level = COALESCE(?, korean_level),
          education_level = COALESCE(?, education_level),
          preferred_location = COALESCE(?, preferred_location),
          skills = COALESCE(?, skills),
          bio = COALESCE(?, bio),
          updated_at = datetime('now')
        WHERE user_id = ?
      `).bind(
        body.first_name ?? null,
        body.last_name ?? null,
        body.birth_date ?? null,
        body.gender ?? null,
        body.nationality ?? null,
        body.visa_status ?? null, // body comes as visa_status
        body.current_location ?? null, // address -> current_location
        body.korean_level ?? null,
        body.education_level ?? null,
        body.preferred_location ?? null,
        body.skills ? JSON.stringify(body.skills) : null,
        body.bio ?? null,
        user.id
      ).run();
    }

    return c.json({
      success: true,
      message: '프로필이 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return c.json({
      success: false,
      message: '프로필 업데이트 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// 프로필 조회 (내 프로필)
profile.get('/jobseeker', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, message: 'Unauthorized' }, 401);
    }
    const db = c.env.DB;

    const profile = await db.prepare(`
      SELECT 
        u.email, u.name, u.phone, u.profile_picture,
        js.*
      FROM users u
      LEFT JOIN jobseekers js ON u.id = js.user_id
      WHERE u.id = ?
    `).bind(user.id).first();

    if (!profile) {
      return c.json({ success: false, message: '프로필을 찾을 수 없습니다.' }, 404);
    }

    // JSON 파싱
    if (profile.skills && typeof profile.skills === 'string') {
      try {
        profile.skills = JSON.parse(profile.skills);
      } catch (e) {
        profile.skills = [];
      }
    }

    return c.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return c.json({ success: false, message: '프로필 조회 중 오류가 발생했습니다.' }, 500);
  }
});

// 보유 기술 목록 조회 (자동완성용 등)
profile.get('/skills', async (c) => {
  // 고정된 스킬 목록 반환하거나 DB에서 조회
  const skills = [
    "JavaScript", "TypeScript", "React", "Vue.js", "Node.js", "Python", "Java",
    "Spring Boot", "SQL", "AWS", "Docker", "Korean", "English", "Chinese",
    "Marketing", "Sales", "Accounting", "Translation"
  ];

  return c.json({
    success: true,
    skills
  });
});

export default profile;
