
import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Bindings, Variables } from '../types/env';

const profile = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 구직자 프로필 생성 (회원가입 후 최초 1회)
profile.post('/jobseeker', authMiddleware, async (c) => {
    try {
        const user = c.get('user');
        const db = c.env.DB;
        const body = await c.req.json();

        // 이미 프로필이 있는지 확인
        const existing = await db.prepare('SELECT id FROM jobseekers WHERE user_id = ?').bind(user.id).first();

        // 공통 파라미터
        const params = [
            user.id,
            body.firstName,
            body.lastName,
            body.birthDate,
            body.gender,
            body.nationality,
            body.visaStatus,
            body.koreanLevel,
            body.experienceYears || 0,
            body.educationLevel,
            body.preferredLocation,
            body.preferredJobType,
            JSON.stringify(body.skills || []),
            body.bio || '',
        ];

        if (existing) {
            // 기존 프로필 업데이트
            await db.prepare(`
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
            preferred_job_type = ?,
            skills = ?,
            bio = ?,
            updated_at = datetime('now')
        WHERE user_id = ?
      `).bind(
                params[1],
                params[2],
                params[3],
                params[4],
                params[5],
                params[6],
                params[7],
                params[8],
                params[9],
                params[10],
                params[11],
                params[12],
                params[13],
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
        preferred_location, preferred_job_type, skills, bio,
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
        return c.json({ success: false, message: '프로필 생성 중 오류가 발생했습니다.' }, 500);
    }
});

// 프로필 업데이트
profile.put('/update', authMiddleware, async (c) => {
    try {
        const user = c.get('user');
        const db = c.env.DB;
        const body = await c.req.json();

        console.log('📝 프로필 업데이트 요청:', { userId: user.id, body });

        // 트랜잭션 처리가 이상적이지만, D1은 배치 실행으로 대체 가능
        // 여기서는 순차 실행

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
          address = COALESCE(?, address),
          korean_level = COALESCE(?, korean_level),
          education_level = COALESCE(?, education_level),
          preferred_location = COALESCE(?, preferred_location),
          preferred_job_type = COALESCE(?, preferred_job_type),
          skills = COALESCE(?, skills),
          bio = COALESCE(?, bio),
          updated_at = datetime('now')
        WHERE user_id = ?
      `).bind(
                body.firstName,
                body.lastName,
                body.birthDate,
                body.gender,
                body.nationality,
                body.visaStatus,
                body.address,
                body.koreanLevel,
                body.educationLevel,
                body.preferredLocation,
                body.preferredJobType,
                body.skills ? JSON.stringify(body.skills) : null,
                body.bio,
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
