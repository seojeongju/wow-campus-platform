// Authentication routes for WOW-CAMPUS Work Platform

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { Bindings, Variables } from '../types/env';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/database';
import { hashPassword, verifyPassword, createJWT, sanitizeUser } from '../utils/auth';
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
    
    if (!user_type || !['company', 'jobseeker', 'agent'].includes(user_type)) {
      validationErrors.push('올바른 사용자 유형을 선택해주세요.');
    }
    
    if (!location || typeof location !== 'string') {
      validationErrors.push('지역 선택은 필수입니다.');
    }
    
    if (phone && (typeof phone !== 'string' || !/^[\d-+\s()]+$/.test(phone))) {
      validationErrors.push('올바른 전화번호 형식을 입력해주세요.');
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
            created_at, 
            updated_at
          ) VALUES (?, ?, ?, ?, ?)
        `).bind(userId, name.trim(), location, currentTime, currentTime).run();
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
        `).bind(userId, firstName, lastName, location, currentTime, currentTime).run();
        profileCreated = jobseekerResult.success;
        
      } else if (user_type === 'agent') {
        // Get agent-specific fields from request
        const agentData = requestData.agentData || {};
        const primaryRegions = agentData.primary_regions || [];
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
    
    // 🎫 Create JWT token for automatic login after registration
    const jwtSecret = c.env.JWT_SECRET || 'wow-campus-default-secret';
    const token = await createJWT({
      userId: createdUser.id,
      email: createdUser.email,
      userType: createdUser.user_type,
      name: createdUser.name,
      loginAt: currentTime
    }, jwtSecret);
    
    // 🍪 Set JWT token as HttpOnly cookie for browser navigation
    c.header('Set-Cookie', 
      `wowcampus_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`
    );
    
    // 📊 Success response with JWT token for automatic login
    return c.json({
      success: true,
      message: '회원가입이 완료되었습니다!',
      user: sanitizeUser(createdUser as any),
      profile_created: profileCreated,
      user_type: user_type,
      token: token  // JWT token for automatic login
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
    const { email, password } = requestData;
    
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
    
    // 🎫 Create JWT token with enhanced payload
    const jwtSecret = c.env.JWT_SECRET || 'wow-campus-default-secret';
    const token = await createJWT({
      userId: user.id,
      email: user.email,
      userType: user.user_type,
      name: user.name,
      loginAt: currentTime
    }, jwtSecret);
    
    // 🎯 Get user profile data for complete response
    let profileData = null;
    try {
      const profile = await c.env.DB.prepare(`
        SELECT 
          CASE 
            WHEN u.user_type = 'company' THEN (
              SELECT json_object(
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
    
    // 🍪 Set JWT token as HttpOnly cookie for browser navigation
    c.header('Set-Cookie', 
      `wowcampus_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`
    );
    
    // 📊 Complete success response
    const response: AuthResponse = {
      user: sanitizeUser(user as any),
      token
    };
    
    return c.json({
      success: true,
      message: '로그인에 성공했습니다!',
      user: response.user,
      token: response.token,
      profile: profileData,
      user_type: user.user_type,
      login_time: currentTime
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

// Logout (client-side token removal, but we can track it)
auth.post('/logout', authMiddleware, async (c) => {
  return c.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default auth;