// Authentication routes for WOW-CAMPUS Work Platform

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getCookie } from 'hono/cookie';
import type { Bindings, Variables } from '../types/env';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/database';
import { hashPassword, verifyPassword, createJWT, createAccessToken, createRefreshToken, hashToken, verifyJWT, sanitizeUser } from '../utils/auth';
import { getCurrentTimestamp } from '../utils/database';
import { authMiddleware } from '../middleware/auth';

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Register new user
auth.post('/register', async (c) => {
  try {
    const requestData = await c.req.json();
    const { email, password, confirmPassword, name, user_type, phone, location } = requestData;

    // 📋 Enhanced Input Validation
    const validationErrors = [];

    if (!email || typeof email !== 'string') {
      validationErrors.push('이메일은 필수 입력 항목입니다.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      validationErrors.push('올바른 이메일 형식을 입력해주세요.');
    }

    if (!password || typeof password !== 'string') {
      validationErrors.push('비밀번호는 필수 입력 항목입니다.');
    } else if (password.length < 6) {
      validationErrors.push('비밀번호는 최소 6자 이상이어야 합니다.');
    } else if (password.length > 128) {
      validationErrors.push('비밀번호는 128자 이하여야 합니다.');
    }

    if (password !== confirmPassword) {
      validationErrors.push('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      validationErrors.push('이름은 필수 입력 항목입니다.');
    } else if (name.trim().length > 100) {
      validationErrors.push('이름은 100자 이하여야 합니다.');
    }

    if (!user_type || !['company', 'jobseeker', 'agent', 'admin'].includes(user_type)) {
      validationErrors.push('올바른 사용자 유형을 선택해주세요.');
    }

    // 구직자는 지역 선택이 선택사항, 기업과 에이전트는 필수
    if (user_type !== 'jobseeker') {
      if (!location || typeof location !== 'string') {
        validationErrors.push('지역 선택은 필수입니다.');
      }
    }

    if (phone && typeof phone === 'string') {
      // 허용 문자: 숫자, +, -, 공백, 괄호
      if (!/^[\d\s+\-()]+$/.test(phone)) {
        validationErrors.push('올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678, +82-10-1234-5678)');
      } else {
        // 최소 7자리, 최대 20자리 (국제 전화번호 포함)
        const cleanPhone = phone.replace(/[\s\-()]/g, '');
        const digitCount = cleanPhone.replace(/\+/g, '').length;
        if (digitCount < 7 || digitCount > 20) {
          validationErrors.push('전화번호는 7자리 이상 20자리 이하여야 합니다.');
        }
      }
    }

    if (validationErrors.length > 0) {
      throw new HTTPException(400, {
        message: validationErrors[0],
        errors: validationErrors
      });
    }

    // 🔍 Check if email already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id, email FROM users WHERE LOWER(email) = LOWER(?)'
    ).bind(email.trim()).first();

    if (existingUser) {
      throw new HTTPException(409, {
        message: '이미 등록된 이메일입니다. 다른 이메일을 사용해주세요.',
        code: 'EMAIL_EXISTS'
      });
    }

    // 🔐 Hash password with enhanced security
    const passwordHash = await hashPassword(password.trim());
    const currentTime = getCurrentTimestamp();

    // 💾 Create user with transaction-like approach
    const userResult = await c.env.DB.prepare(`
      INSERT INTO users (
        email, 
        password_hash, 
        user_type, 
        name, 
        phone, 
        status, 
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      email.trim().toLowerCase(),
      passwordHash,
      user_type,
      name.trim(),
      phone?.trim() || null,
      'approved', // Auto-approve for now
      currentTime,
      currentTime
    ).run();

    if (!userResult.success || !userResult.meta?.last_row_id) {
      throw new HTTPException(500, {
        message: '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        code: 'DB_INSERT_FAILED'
      });
    }

    const userId = userResult.meta.last_row_id;

    // 📝 Create type-specific profile data
    let profileCreated = false;

    try {
      if (user_type === 'company') {
        const companyResult = await c.env.DB.prepare(`
          INSERT INTO companies (
            user_id, 
            company_name, 
            address,
            agent_id,
            created_at, 
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(userId, name.trim(), location, requestData.agent_id || null, currentTime, currentTime).run();
        profileCreated = companyResult.success;

      } else if (user_type === 'jobseeker') {
        // Split name into first and last name (simple split)
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || name.trim();
        const lastName = nameParts.slice(1).join(' ') || '';

        const jobseekerResult = await c.env.DB.prepare(`
          INSERT INTO jobseekers (
            user_id, 
            first_name, 
            last_name,
            current_location,
            created_at, 
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(userId, firstName, lastName, location || null, currentTime, currentTime).run();
        profileCreated = jobseekerResult.success;

        // If agent_id is provided, create agent-jobseeker relationship
        if (requestData.agent_id && jobseekerResult.success) {
          try {
            const jobseekerId = jobseekerResult.meta.last_row_id;
            await c.env.DB.prepare(`
              INSERT INTO agent_jobseekers (
                agent_id, 
                jobseeker_id, 
                status, 
                assigned_date,
                notes,
                created_at,
                updated_at
              ) VALUES (?, ?, 'active', CURRENT_TIMESTAMP, '회원가입 시 선택', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `).bind(requestData.agent_id, jobseekerId).run();
            console.log(`Jobseeker ${jobseekerId} assigned to agent ${requestData.agent_id}`);
          } catch (agentAssignError) {
            console.error('Agent assignment error:', agentAssignError);
            // Don't fail registration if agent assignment fails
          }
        }

      } else if (user_type === 'agent') {
        // Get agent-specific fields from request
        const agentData = requestData.agentData || {};

        // For simple signup form: location field is the primary region
        // For advanced signup: agentData.primary_regions is an array
        let primaryRegions = agentData.primary_regions || [];
        if (primaryRegions.length === 0 && location) {
          // Simple signup form case: location is a single region value
          primaryRegions = [location];
        }

        const languageSkills = agentData.language_skills || {};
        const serviceAreas = agentData.service_areas || [];
        const contactPhone = agentData.contact_phone || phone || null;
        const contactEmail = agentData.contact_email || email.trim();
        const introduction = agentData.introduction || null;

        const agentResult = await c.env.DB.prepare(`
          INSERT INTO agents (
            user_id, 
            agency_name,
            primary_regions,
            language_skills,
            service_areas,
            contact_phone,
            contact_email,
            introduction,
            created_at, 
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          userId,
          name.trim(),
          JSON.stringify(primaryRegions),
          JSON.stringify(languageSkills),
          JSON.stringify(serviceAreas),
          contactPhone,
          contactEmail,
          introduction,
          currentTime,
          currentTime
        ).run();
        profileCreated = agentResult.success;
      }
    } catch (profileError) {
      console.error('Profile creation error:', profileError);
      // Profile creation failure is not critical, continue with user creation
    }

    // 🎯 Get created user data
    const createdUser = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!createdUser) {
      throw new HTTPException(500, {
        message: '회원가입이 완료되지 않았습니다. 다시 시도해주세요.',
        code: 'USER_NOT_FOUND'
      });
    }

    // 🎫 Create Access Token and Refresh Token for automatic login after registration
    const jwtSecret = c.env.JWT_SECRET || 'wow-campus-default-secret';
    const tokenPayload = {
      userId: createdUser.id,
      email: createdUser.email,
      userType: createdUser.user_type,
      name: createdUser.name,
      loginAt: currentTime
    };

    // Access Token 생성 (15분)
    const accessToken = await createAccessToken(tokenPayload, jwtSecret);

    // Refresh Token 생성 (기본 7일)
    const refreshToken = await createRefreshToken(
      { ...tokenPayload, type: 'refresh' },
      jwtSecret,
      false
    );

    // Refresh Token 해시 생성 및 DB 저장
    const refreshTokenHash = await hashToken(refreshToken);
    const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const clientIP = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const userAgent = c.req.header('User-Agent') || 'unknown';

    await c.env.DB.prepare(`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at, device_info, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      createdUser.id,
      refreshTokenHash,
      refreshTokenExpires.toISOString(),
      userAgent.substring(0, 255),
      clientIP
    ).run();

    // 🍪 Set Access Token as HttpOnly cookie (15분)
    const accessTokenMaxAge = 15 * 60;
    c.header('Set-Cookie',
      `wowcampus_token=${accessToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${accessTokenMaxAge}`
    );

    // 🍪 Set Refresh Token as HttpOnly cookie (7일)
    const refreshTokenMaxAge = 7 * 24 * 60 * 60;
    c.header('Set-Cookie',
      `wowcampus_refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${refreshTokenMaxAge}`
    );

    // 📊 Success response with JWT token for automatic login
    return c.json({
      success: true,
      message: '회원가입이 완료되었습니다!',
      user: sanitizeUser(createdUser as any),
      profile_created: profileCreated,
      user_type: user_type,
      token: accessToken,  // Access Token for automatic login
      refreshToken: refreshToken,  // Refresh Token
      expires_in: accessTokenMaxAge
    }, 201);

  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof HTTPException) {
      throw error;
    }

    // Generic error response
    throw new HTTPException(500, {
      message: '회원가입 중 예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Login user
auth.post('/login', async (c) => {
  try {
    const requestData = await c.req.json();
    const { email, password, rememberMe } = requestData;

    // 📋 Enhanced Input Validation
    const validationErrors = [];

    if (!email || typeof email !== 'string') {
      validationErrors.push('이메일을 입력해주세요.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      validationErrors.push('올바른 이메일 형식을 입력해주세요.');
    }

    if (!password || typeof password !== 'string') {
      validationErrors.push('비밀번호를 입력해주세요.');
    } else if (password.length === 0) {
      validationErrors.push('비밀번호를 입력해주세요.');
    }

    if (validationErrors.length > 0) {
      throw new HTTPException(400, {
        message: validationErrors[0],
        errors: validationErrors,
        code: 'VALIDATION_ERROR'
      });
    }

    // 🔍 Get user by email (case-insensitive)
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?)'
    ).bind(email.trim()).first();

    if (!user) {
      throw new HTTPException(401, {
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // 🔐 Verify password
    const isValidPassword = await verifyPassword(password.trim(), user.password_hash as string);

    if (!isValidPassword) {
      throw new HTTPException(401, {
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // ✅ Check account status
    if (user.status === 'pending') {
      throw new HTTPException(403, {
        message: '계정 승인을 기다리고 있습니다. 관리자 승인 후 로그인이 가능합니다.',
        code: 'ACCOUNT_PENDING'
      });
    } else if (user.status === 'suspended') {
      throw new HTTPException(403, {
        message: '계정이 일시 정지되었습니다. 고객센터에 문의해주세요.',
        code: 'ACCOUNT_SUSPENDED'
      });
    } else if (user.status === 'rejected') {
      throw new HTTPException(403, {
        message: '계정이 거부되었습니다. 새로운 계정으로 가입해주세요.',
        code: 'ACCOUNT_REJECTED'
      });
    } else if (user.status !== 'approved') {
      throw new HTTPException(403, {
        message: `계정 상태가 ${user.status}입니다. 고객센터에 문의해주세요.`,
        code: 'ACCOUNT_UNAVAILABLE'
      });
    }

    // 🕰️ Update last login timestamp
    const currentTime = getCurrentTimestamp();
    const updateResult = await c.env.DB.prepare(
      'UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?'
    ).bind(currentTime, currentTime, user.id).run();

    if (!updateResult.success) {
      console.warn(`Failed to update last login for user ${user.id}`);
    }

    // 🎫 Create Access Token (15분 만료) and Refresh Token
    const jwtSecret = c.env.JWT_SECRET || 'wow-campus-default-secret';
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      userType: user.user_type,
      name: user.name,
      loginAt: currentTime
    };

    // Access Token 생성 (15분)
    const accessToken = await createAccessToken(tokenPayload, jwtSecret);

    // Refresh Token 생성 (Remember Me에 따라 7일 또는 30일)
    const refreshToken = await createRefreshToken(
      { ...tokenPayload, type: 'refresh' },
      jwtSecret,
      rememberMe === true
    );

    // Refresh Token 해시 생성 및 DB 저장
    const refreshTokenHash = await hashToken(refreshToken);
    const refreshTokenExpires = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000));

    // 기존 Refresh Token 무효화 (같은 사용자의 다른 기기에서 로그인한 경우)
    await c.env.DB.prepare(
      'UPDATE refresh_tokens SET is_revoked = 1 WHERE user_id = ? AND is_revoked = 0'
    ).bind(user.id).run();

    // 새 Refresh Token 저장
    const clientIP = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const userAgent = c.req.header('User-Agent') || 'unknown';

    await c.env.DB.prepare(`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at, device_info, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      user.id,
      refreshTokenHash,
      refreshTokenExpires.toISOString(),
      userAgent.substring(0, 255),
      clientIP
    ).run();

    // 🎯 Get user profile data for complete response
    let profileData = null;
    try {
      const profile = await c.env.DB.prepare(`
        SELECT 
          CASE 
            WHEN u.user_type = 'company' THEN (
              SELECT json_object(
                'id', c.id,
                'company_name', c.company_name,
                'business_number', c.business_number,
                'industry', c.industry,
                'company_size', c.company_size,
                'address', c.address,
                'website', c.website
              ) FROM companies c WHERE c.user_id = u.id
            )
            WHEN u.user_type = 'jobseeker' THEN (
              SELECT json_object(
                'id', js.id,
                'first_name', js.first_name,
                'last_name', js.last_name,
                'nationality', js.nationality,
                'visa_status', js.visa_status,
                'korean_level', js.korean_level,
                'current_location', js.current_location
              ) FROM jobseekers js WHERE js.user_id = u.id
            )
            WHEN u.user_type = 'agent' THEN (
              SELECT json_object(
                'id', a.id,
                'agency_name', a.agency_name,
                'license_number', a.license_number,
                'specialization', a.specialization
              ) FROM agents a WHERE a.user_id = u.id
            )
          END as profile_data
        FROM users u 
        WHERE u.id = ?
      `).bind(user.id).first();

      if (profile && profile.profile_data) {
        profileData = JSON.parse(profile.profile_data as string);
      }
    } catch (profileError) {
      console.warn('Failed to fetch profile data:', profileError);
      // Non-critical, continue without profile data
    }

    // 🍪 Set Access Token as HttpOnly cookie (15분)
    const accessTokenMaxAge = 15 * 60; // 15분
    const accessTokenCookie = `wowcampus_token=${accessToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${accessTokenMaxAge}`;

    // 🍪 Set Refresh Token as HttpOnly cookie (7일 또는 30일)
    const refreshTokenMaxAge = rememberMe ? (30 * 24 * 60 * 60) : (7 * 24 * 60 * 60);
    const refreshTokenCookie = `wowcampus_refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${refreshTokenMaxAge}`;

    // Set both cookies using append to avoid overwriting
    c.header('Set-Cookie', accessTokenCookie, { append: true });
    c.header('Set-Cookie', refreshTokenCookie, { append: true });

    // 📊 Complete success response
    const response: AuthResponse = {
      user: sanitizeUser(user as any),
      token: accessToken
    };

    return c.json({
      success: true,
      message: '로그인에 성공했습니다!',
      user: response.user,
      token: accessToken,
      refreshToken: refreshToken, // 클라이언트가 localStorage에 저장 (선택사항)
      profile: profileData,
      user_type: user.user_type,
      login_time: currentTime,
      expires_in: accessTokenMaxAge // Access Token 만료 시간 (초)
    });

  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof HTTPException) {
      throw error;
    }

    // Generic error response
    throw new HTTPException(500, {
      message: '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Get current user profile
auth.get('/profile', authMiddleware, async (c) => {
  try {
    const currentUser = c.get('user');

    const user = await c.env.DB.prepare(`
      SELECT u.*, 
        CASE 
          WHEN u.user_type = 'company' THEN (
            SELECT json_object(
              'id', c.id,
              'company_name', c.company_name,
              'business_number', c.business_number,
              'industry', c.industry,
              'company_size', c.company_size,
              'address', c.address,
              'website', c.website,
              'description', c.description
            ) FROM companies c WHERE c.user_id = u.id
          )
          WHEN u.user_type = 'jobseeker' THEN (
            SELECT json_object(
              'id', js.id,
              'first_name', js.first_name,
              'last_name', js.last_name,
              'nationality', js.nationality,
              'visa_status', js.visa_status,
              'korean_level', js.korean_level,
              'english_level', js.english_level,
              'experience_years', js.experience_years,
              'skills', js.skills,
              'bio', js.bio
            ) FROM jobseekers js WHERE js.user_id = u.id
          )
          WHEN u.user_type = 'agent' THEN (
            SELECT json_object(
              'id', a.id,
              'agency_name', a.agency_name,
              'license_number', a.license_number,
              'specialization', a.specialization,
              'commission_rate', a.commission_rate,
              'experience_years', a.experience_years,
              'total_placements', a.total_placements,
              'success_rate', a.success_rate
            ) FROM agents a WHERE a.user_id = u.id
          )
        END as profile_data
      FROM users u 
      WHERE u.id = ?
    `).bind(currentUser!.id).first();

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }

    return c.json({
      success: true,
      user: sanitizeUser(user as any),
      profile: user.profile_data ? JSON.parse(user.profile_data as string) : null
    });

  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Failed to get profile' });
  }
});

// Update user profile
auth.put('/profile', authMiddleware, async (c) => {
  try {
    const currentUser = c.get('user');
    const updateData = await c.req.json();

    // Update user basic info
    const { name, phone, profile_image_url } = updateData;

    if (name || phone || profile_image_url) {
      await c.env.DB.prepare(`
        UPDATE users 
        SET name = COALESCE(?, name),
            phone = COALESCE(?, phone),
            profile_image_url = COALESCE(?, profile_image_url),
            updated_at = ?
        WHERE id = ?
      `).bind(name, phone, profile_image_url, getCurrentTimestamp(), currentUser!.id).run();
    }

    // Update type-specific profile data
    const userType = currentUser!.user_type;

    if (userType === 'company' && updateData.company_data) {
      const companyData = updateData.company_data;
      await c.env.DB.prepare(`
        UPDATE companies 
        SET company_name = COALESCE(?, company_name),
            business_number = COALESCE(?, business_number),
            industry = COALESCE(?, industry),
            company_size = COALESCE(?, company_size),
            address = COALESCE(?, address),
            website = COALESCE(?, website),
            description = COALESCE(?, description),
            founded_year = COALESCE(?, founded_year),
            employee_count = COALESCE(?, employee_count),
            updated_at = ?
        WHERE user_id = ?
      `).bind(
        companyData.company_name,
        companyData.business_number,
        companyData.industry,
        companyData.company_size,
        companyData.address,
        companyData.website,
        companyData.description,
        companyData.founded_year,
        companyData.employee_count,
        getCurrentTimestamp(),
        currentUser!.id
      ).run();
    }

    // Update jobseeker profile data
    if (userType === 'jobseeker' && updateData.profile_data) {
      const profileData = updateData.profile_data;

      // Update jobseeker-specific fields
      await c.env.DB.prepare(`
        UPDATE jobseekers 
        SET first_name = COALESCE(?, first_name),
            last_name = COALESCE(?, last_name),
            nationality = COALESCE(?, nationality),
            birth_date = COALESCE(?, birth_date),
            gender = COALESCE(?, gender),
            visa_status = COALESCE(?, visa_status),
            korean_level = COALESCE(?, korean_level),
            english_level = COALESCE(?, english_level),
            current_location = COALESCE(?, current_location),
            preferred_location = COALESCE(?, preferred_location),
            salary_expectation = COALESCE(?, salary_expectation),
            bio = COALESCE(?, bio),
            skills = COALESCE(?, skills),
            resume_url = COALESCE(?, resume_url),
            portfolio_url = COALESCE(?, portfolio_url),
            updated_at = ?
        WHERE user_id = ?
      `).bind(
        profileData.first_name,
        profileData.last_name,
        profileData.nationality,
        profileData.birth_date,
        profileData.gender,
        profileData.visa_status,
        profileData.korean_level,
        profileData.english_level,
        profileData.current_location,
        profileData.preferred_location,
        profileData.salary_expectation,
        profileData.bio,
        profileData.skills,
        profileData.resume_url,
        profileData.portfolio_url,
        getCurrentTimestamp(),
        currentUser!.id
      ).run();
    }

    return c.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Failed to update profile' });
  }
});

// Refresh Access Token using Refresh Token
auth.post('/refresh', async (c) => {
  try {
    const refreshToken = getCookie(c, 'wowcampus_refresh_token');

    if (!refreshToken) {
      throw new HTTPException(401, {
        message: 'Refresh token이 없습니다.',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }

    const jwtSecret = c.env.JWT_SECRET || 'wow-campus-default-secret';

    // Refresh Token 검증
    let payload;
    try {
      payload = await verifyJWT(refreshToken, jwtSecret);
    } catch (error) {
      throw new HTTPException(401, {
        message: 'Refresh token이 유효하지 않습니다.',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Refresh Token 타입 확인
    if (payload.type !== 'refresh') {
      throw new HTTPException(401, {
        message: '잘못된 토큰 타입입니다.',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // DB에서 Refresh Token 확인
    const refreshTokenHash = await hashToken(refreshToken);
    const storedToken = await c.env.DB.prepare(
      'SELECT * FROM refresh_tokens WHERE token_hash = ? AND is_revoked = 0 AND expires_at > datetime("now")'
    ).bind(refreshTokenHash).first();

    if (!storedToken) {
      throw new HTTPException(401, {
        message: 'Refresh token이 만료되었거나 무효화되었습니다.',
        code: 'REFRESH_TOKEN_INVALID'
      });
    }

    // 사용자 정보 확인
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, user_type, status FROM users WHERE id = ? AND status = ?'
    ).bind(payload.userId, 'approved').first();

    if (!user) {
      throw new HTTPException(401, {
        message: '사용자를 찾을 수 없거나 승인되지 않았습니다.',
        code: 'USER_NOT_FOUND'
      });
    }

    // 새 Access Token 생성
    const currentTime = getCurrentTimestamp();
    const newAccessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
      userType: user.user_type,
      name: user.name,
      loginAt: payload.loginAt || currentTime
    }, jwtSecret);

    // Access Token 쿠키 설정 (15분)
    const accessTokenMaxAge = 15 * 60;
    c.header('Set-Cookie',
      `wowcampus_token=${newAccessToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${accessTokenMaxAge}`
    );

    return c.json({
      success: true,
      token: newAccessToken,
      expires_in: accessTokenMaxAge
    });

  } catch (error) {
    console.error('Token refresh error:', error);

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: '토큰 갱신 중 오류가 발생했습니다.',
      code: 'REFRESH_ERROR'
    });
  }
});

// Logout (토큰 무효화 및 쿠키 삭제)
auth.post('/logout', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const accessToken = getCookie(c, 'wowcampus_token');
    const refreshToken = getCookie(c, 'wowcampus_refresh_token');

    // Access Token을 블랙리스트에 추가
    if (accessToken) {
      try {
        const jwtSecret = c.env.JWT_SECRET || 'wow-campus-default-secret';
        const payload = await verifyJWT(accessToken, jwtSecret);
        const tokenHash = await hashToken(accessToken);
        const expiresAt = new Date(payload.exp * 1000).toISOString();

        await c.env.DB.prepare(`
          INSERT OR IGNORE INTO token_blacklist (token_hash, user_id, expires_at, reason)
          VALUES (?, ?, ?, ?)
        `).bind(tokenHash, user?.id, expiresAt, 'logout').run();
      } catch (error) {
        // 토큰이 이미 만료되었거나 유효하지 않은 경우 무시
        console.warn('Failed to blacklist access token:', error);
      }
    }

    // Refresh Token 무효화
    if (refreshToken) {
      try {
        const refreshTokenHash = await hashToken(refreshToken);
        await c.env.DB.prepare(
          'UPDATE refresh_tokens SET is_revoked = 1 WHERE token_hash = ?'
        ).bind(refreshTokenHash).run();
      } catch (error) {
        console.warn('Failed to revoke refresh token:', error);
      }
    }

    // 쿠키 삭제
    c.header('Set-Cookie',
      'wowcampus_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
    );
    c.header('Set-Cookie',
      'wowcampus_refresh_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
    );

    return c.json({
      success: true,
      message: '로그아웃되었습니다.'
    });

  } catch (error) {
    console.error('Logout error:', error);

    // 에러가 발생해도 쿠키는 삭제
    c.header('Set-Cookie',
      'wowcampus_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
    );
    c.header('Set-Cookie',
      'wowcampus_refresh_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
    );

    return c.json({
      success: true,
      message: '로그아웃되었습니다.'
    });
  }
});

export default auth;