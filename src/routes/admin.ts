// Admin routes for WOW-CAMPUS Work Platform
// Provides administrative functions for user management, statistics, and system configuration

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { Bindings, Variables } from '../types/env';
import { getCurrentTimestamp } from '../utils/database';
import { authMiddleware, requireAdmin } from '../middleware/auth';

const admin = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply authentication and admin authorization to all routes
admin.use('*', authMiddleware);
admin.use('*', requireAdmin);

// ===================================
// 사용자 관리 API
// ===================================

/**
 * GET /api/admin/test-db
 * 데이터베이스 연결 및 테이블 확인 테스트
 */
admin.get('/test-db', async (c) => {
  try {
    console.log('🧪 Testing database connection...');

    // Test 1: Check if DB is available
    if (!c.env.DB) {
      throw new Error('DB binding is not available');
    }
    console.log('✅ DB binding exists');

    // Test 2: Simple query
    const testResult = await c.env.DB.prepare('SELECT 1 as test').first();
    console.log('✅ Simple query works:', testResult);

    // Test 3: Check users table
    const usersCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
    console.log('✅ Users table exists, count:', usersCount);

    // Test 4: Check tables
    const tables = await c.env.DB.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
    `).all();
    console.log('✅ Tables found:', tables.results);

    // Test 5: Sample user
    const sampleUser = await c.env.DB.prepare('SELECT id, email, user_type, status FROM users LIMIT 1').first();
    console.log('✅ Sample user:', sampleUser);

    return c.json({
      success: true,
      data: {
        dbBinding: 'OK',
        simpleQuery: testResult,
        usersCount: usersCount?.count || 0,
        tables: tables.results,
        sampleUser
      }
    });
  } catch (error: any) {
    console.error('❌ DB test failed:', error);
    return c.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, 500);
  }
});

/**
 * GET /api/admin/users
 * 전체 사용자 목록 조회 (검색, 필터링, 페이지네이션)
 */
admin.get('/users', async (c) => {
  try {
    // Check if DB binding is available
    if (!c.env?.DB) {
      console.error('❌ DB binding not available!');
      console.error('Environment:', c.env);
      throw new HTTPException(500, {
        message: 'Database binding is not configured. Please check Cloudflare Pages settings.'
      });
    }

    const {
      page = '1',
      limit = '20',
      user_type,
      status,
      search,
      // Jobseeker filters
      nationality,
      visa_status,
      korean_level,
      education_level,
      experience_years,
      preferred_location,
      // Company filters
      company_size,
      industry,
      address,
      // Agent filters
      specialization,
      languages,
      countries_covered
    } = c.req.query();

    console.log('📊 Admin users query:', {
      page, limit, user_type, status, search,
      nationality, visa_status, korean_level, education_level, experience_years, preferred_location,
      company_size, industry, address,
      specialization, languages, countries_covered
    });

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Determine if we need to join with profile tables
    const needJobseekerJoin = nationality || visa_status || korean_level || education_level || experience_years || preferred_location;
    const needCompanyJoin = company_size || industry || address;
    const needAgentJoin = specialization || languages || countries_covered;

    // Build FROM clause with appropriate JOINs
    let fromClause = 'users u';
    if (needJobseekerJoin) {
      fromClause += ' LEFT JOIN jobseekers j ON u.id = j.user_id';
    }
    if (needCompanyJoin) {
      fromClause += ' LEFT JOIN companies c ON u.id = c.user_id';
    }
    if (needAgentJoin) {
      fromClause += ' LEFT JOIN agents a ON u.id = a.user_id';
    }

    // Build query dynamically
    let whereClause = [];
    let bindings: any[] = [];

    if (user_type) {
      whereClause.push('u.user_type = ?');
      bindings.push(user_type);
    }

    if (status) {
      whereClause.push('u.status = ?');
      bindings.push(status);
    }

    if (search) {
      whereClause.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      const searchTerm = `%${search}%`;
      bindings.push(searchTerm, searchTerm, searchTerm);
    }

    // Jobseeker-specific filters
    if (nationality) {
      whereClause.push('j.nationality = ?');
      bindings.push(nationality);
    }
    if (visa_status) {
      whereClause.push('j.visa_status = ?');
      bindings.push(visa_status);
    }
    if (korean_level) {
      whereClause.push('j.korean_level = ?');
      bindings.push(korean_level);
    }
    if (education_level) {
      whereClause.push('j.education_level LIKE ?');
      bindings.push(`%${education_level}%`);
    }
    if (experience_years) {
      const [min, max] = experience_years.split('-').map(Number);
      if (max) {
        whereClause.push('j.experience_years BETWEEN ? AND ?');
        bindings.push(min, max);
      } else {
        whereClause.push('j.experience_years >= ?');
        bindings.push(min);
      }
    }
    if (preferred_location) {
      whereClause.push('j.preferred_location LIKE ?');
      bindings.push(`%${preferred_location}%`);
    }

    // Company-specific filters
    if (company_size) {
      whereClause.push('c.company_size = ?');
      bindings.push(company_size);
    }
    if (industry) {
      whereClause.push('c.industry LIKE ?');
      bindings.push(`%${industry}%`);
    }
    if (address) {
      whereClause.push('c.address LIKE ?');
      bindings.push(`%${address}%`);
    }

    // Agent-specific filters
    if (specialization) {
      whereClause.push('a.specialization LIKE ?');
      bindings.push(`%${specialization}%`);
    }
    if (languages) {
      whereClause.push('a.languages LIKE ?');
      bindings.push(`%${languages}%`);
    }
    if (countries_covered) {
      whereClause.push('a.countries_covered LIKE ?');
      bindings.push(`%${countries_covered}%`);
    }

    const whereSQL = whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : '';

    console.log('🔍 WHERE clause:', whereSQL);
    console.log('🔢 Bindings:', bindings);

    // Get total count
    const countQuery = `SELECT COUNT(DISTINCT u.id) as total FROM ${fromClause} ${whereSQL}`;
    console.log('📝 Count query:', countQuery);

    const countResult = await c.env.DB.prepare(countQuery).bind(...bindings).first<{ total: number }>();
    const total = countResult?.total || 0;

    console.log('✅ Total users found:', total);

    // Get users with filters
    const usersQuery = `
      SELECT DISTINCT
        u.id, u.email, u.name, u.phone, u.user_type, u.status,
        u.created_at, u.updated_at, u.last_login_at as last_login
      FROM ${fromClause}
      ${whereSQL}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;

    console.log('📝 Users query:', usersQuery);

    bindings.push(parseInt(limit), offset);
    const { results: users } = await c.env.DB.prepare(usersQuery).bind(...bindings).all();

    console.log('✅ Users retrieved:', users.length);

    // Add organization name for display
    const usersWithOrg = users.map((user: any) => ({
      ...user,
      organization_name: null
    }));

    console.log('✅ Response ready with', usersWithOrg.length, 'users');

    return c.json({
      success: true,
      data: {
        users: usersWithOrg,
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error: any) {
    console.error('❌ Get users error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      name: error.name
    });
    throw new HTTPException(500, {
      message: `사용자 목록을 가져오는 중 오류가 발생했습니다: ${error.message}`
    });
  }
});

/**
 * GET /api/admin/users/pending
 * 승인 대기 중인 사용자 목록
 */
admin.get('/users/pending', async (c) => {
  try {
    const { results: pendingUsers } = await c.env.DB.prepare(`
      SELECT 
        u.id, u.email, u.name, u.phone, u.user_type, u.status,
        u.created_at,
        c.company_name,
        a.agency_name,
        j.nationality
      FROM users u
      LEFT JOIN companies c ON u.id = c.user_id
      LEFT JOIN agents a ON u.id = a.user_id
      LEFT JOIN jobseekers j ON u.id = j.user_id
      WHERE u.status = 'pending'
      ORDER BY u.created_at ASC
    `).all();

    // Add additional_info field based on user_type
    const pendingUsersWithInfo = pendingUsers.map((user: any) => ({
      ...user,
      additional_info: user.user_type === 'company' ? user.company_name :
        user.user_type === 'agent' ? user.agency_name :
          user.user_type === 'jobseeker' ? user.nationality : null
    }));

    return c.json({
      success: true,
      data: {
        pendingUsers: pendingUsersWithInfo,
        count: pendingUsersWithInfo.length
      }
    });
  } catch (error: any) {
    console.error('Get pending users error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    throw new HTTPException(500, {
      message: `승인 대기 목록을 가져오는 중 오류가 발생했습니다: ${error.message}`
    });
  }
});

/**
 * GET /api/admin/users/:id
 * 특정 사용자 상세 정보 조회
 */
admin.get('/users/:id', async (c) => {
  try {
    const userId = c.req.param('id');

    const user = await c.env.DB.prepare(`
      SELECT 
        u.id, u.email, u.name, u.phone, u.user_type, u.status,
        u.created_at, u.updated_at, u.last_login_at as last_login, u.approved_by, u.approved_at
      FROM users u
      WHERE u.id = ?
    `).bind(userId).first();

    if (!user) {
      throw new HTTPException(404, { message: '사용자를 찾을 수 없습니다.' });
    }

    // Get profile based on user type
    let profile = null;

    if (user.user_type === 'company') {
      profile = await c.env.DB.prepare(`
        SELECT * FROM companies WHERE user_id = ?
      `).bind(userId).first();
    } else if (user.user_type === 'jobseeker') {
      profile = await c.env.DB.prepare(`
        SELECT * FROM jobseekers WHERE user_id = ?
      `).bind(userId).first();
    } else if (user.user_type === 'agent') {
      profile = await c.env.DB.prepare(`
        SELECT * FROM agents WHERE user_id = ?
      `).bind(userId).first();
    }

    return c.json({
      success: true,
      data: {
        user,
        profile
      }
    });
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    console.error('Get user detail error:', error);
    throw new HTTPException(500, {
      message: '사용자 정보를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/admin/users/:id/approve
 * 사용자 승인
 */
admin.post('/users/:id/approve', async (c) => {
  try {
    const userId = c.req.param('id');
    const adminUser = c.get('user');
    const currentTime = getCurrentTimestamp();

    // Check if user exists and is pending
    const user = await c.env.DB.prepare(
      'SELECT id, status, email, name FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      throw new HTTPException(404, { message: '사용자를 찾을 수 없습니다.' });
    }

    if (user.status === 'approved') {
      return c.json({
        success: true,
        message: '이미 승인된 사용자입니다.',
        data: { userId }
      });
    }

    // Update user status to approved
    await c.env.DB.prepare(`
      UPDATE users 
      SET status = 'approved', 
          approved_by = ?, 
          approved_at = ?,
          updated_at = ?
      WHERE id = ?
    `).bind(adminUser?.id, currentTime, currentTime, userId).run();

    return c.json({
      success: true,
      message: `${user.name}님의 계정이 승인되었습니다.`,
      data: { userId, email: user.email, name: user.name }
    });
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    console.error('Approve user error:', error);
    throw new HTTPException(500, {
      message: '사용자 승인 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/admin/users/:id/reject
 * 사용자 거부
 */
admin.post('/users/:id/reject', async (c) => {
  try {
    const userId = c.req.param('id');
    const { reason } = await c.req.json();
    const currentTime = getCurrentTimestamp();

    const user = await c.env.DB.prepare(
      'SELECT id, status, email, name FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      throw new HTTPException(404, { message: '사용자를 찾을 수 없습니다.' });
    }

    // Update user status to rejected
    await c.env.DB.prepare(`
      UPDATE users 
      SET status = 'rejected',
          updated_at = ?
      WHERE id = ?
    `).bind(currentTime, userId).run();

    // TODO: Send rejection email with reason

    return c.json({
      success: true,
      message: `${user.name}님의 가입 신청이 거부되었습니다.`,
      data: { userId, reason }
    });
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    console.error('Reject user error:', error);
    throw new HTTPException(500, {
      message: '사용자 거부 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/admin/users/:id/suspend
 * 사용자 계정 정지
 */
admin.post('/users/:id/suspend', async (c) => {
  try {
    const userId = c.req.param('id');
    const { reason } = await c.req.json();
    const currentTime = getCurrentTimestamp();

    const user = await c.env.DB.prepare(
      'SELECT id, status, email, name FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      throw new HTTPException(404, { message: '사용자를 찾을 수 없습니다.' });
    }

    await c.env.DB.prepare(`
      UPDATE users 
      SET status = 'suspended',
          updated_at = ?
      WHERE id = ?
    `).bind(currentTime, userId).run();

    return c.json({
      success: true,
      message: `${user.name}님의 계정이 정지되었습니다.`,
      data: { userId, reason }
    });
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    console.error('Suspend user error:', error);
    throw new HTTPException(500, {
      message: '계정 정지 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/admin/users/:id/activate
 * 정지된 계정 복구
 */
admin.post('/users/:id/activate', async (c) => {
  try {
    const userId = c.req.param('id');
    const currentTime = getCurrentTimestamp();

    const user = await c.env.DB.prepare(
      'SELECT id, status, email, name FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      throw new HTTPException(404, { message: '사용자를 찾을 수 없습니다.' });
    }

    await c.env.DB.prepare(`
      UPDATE users 
      SET status = 'approved',
          updated_at = ?
      WHERE id = ?
    `).bind(currentTime, userId).run();

    return c.json({
      success: true,
      message: `${user.name}님의 계정이 활성화되었습니다.`,
      data: { userId }
    });
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    console.error('Activate user error:', error);
    throw new HTTPException(500, {
      message: '계정 활성화 중 오류가 발생했습니다.'
    });
  }
});

/**
 * PUT /api/admin/users/:id
 * 사용자 정보 수정
 */
admin.put('/users/:id', async (c) => {
  try {
    const userId = c.req.param('id');
    const updates = await c.req.json();
    const currentTime = getCurrentTimestamp();

    const user = await c.env.DB.prepare(
      'SELECT id, user_type FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      throw new HTTPException(404, { message: '사용자를 찾을 수 없습니다.' });
    }

    // Update basic user info
    const { name, phone, status } = updates;
    const updateFields = [];
    const bindings: any[] = [];

    if (name) {
      updateFields.push('name = ?');
      bindings.push(name);
    }
    if (phone) {
      updateFields.push('phone = ?');
      bindings.push(phone);
    }
    if (status) {
      updateFields.push('status = ?');
      bindings.push(status);
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = ?');
      bindings.push(currentTime, userId);

      await c.env.DB.prepare(`
        UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
      `).bind(...bindings).run();
    }

    return c.json({
      success: true,
      message: '사용자 정보가 수정되었습니다.',
      data: { userId }
    });
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    console.error('Update user error:', error);
    throw new HTTPException(500, {
      message: '사용자 정보 수정 중 오류가 발생했습니다.'
    });
  }
});

/**
 * DELETE /api/admin/users/:id
 * 사용자 삭제 (실제로는 상태만 변경)
 */
admin.delete('/users/:id', async (c) => {
  try {
    const userId = c.req.param('id');
    const currentTime = getCurrentTimestamp();

    const user = await c.env.DB.prepare(
      'SELECT id, email, name FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      throw new HTTPException(404, { message: '사용자를 찾을 수 없습니다.' });
    }

    // Soft delete: set status to 'rejected' (schema doesn't allow 'deleted')
    await c.env.DB.prepare(`
      UPDATE users 
      SET status = 'rejected',
          updated_at = ?
      WHERE id = ?
    `).bind(currentTime, userId).run();

    return c.json({
      success: true,
      message: `${user.name}님의 계정이 삭제되었습니다.`,
      data: { userId }
    });
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    console.error('Delete user error:', error);
    throw new HTTPException(500, {
      message: '사용자 삭제 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/admin/users/:id/toggle-status
 * 사용자 상태 토글 (approved ⟷ pending)
 */
admin.post('/users/:id/toggle-status', async (c) => {
  try {
    const userId = c.req.param('id');
    const adminUser = c.get('user');
    const currentTime = getCurrentTimestamp();

    // Get current user status
    const user = await c.env.DB.prepare(
      'SELECT id, status, email, name FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      throw new HTTPException(404, { message: '사용자를 찾을 수 없습니다.' });
    }

    // Determine new status
    let newStatus: string;
    let message: string;

    if (user.status === 'approved') {
      // approved → pending (일시정지)
      newStatus = 'pending';
      message = `${user.name}님의 계정이 일시정지되었습니다. 구인/구직 정보가 노출되지 않습니다.`;

      // Clear approval data when moving to pending
      await c.env.DB.prepare(`
        UPDATE users 
        SET status = ?,
            updated_at = ?
        WHERE id = ?
      `).bind(newStatus, currentTime, userId).run();

    } else if (user.status === 'pending') {
      // pending → approved (활성화)
      newStatus = 'approved';
      message = `${user.name}님의 계정이 활성화되었습니다. 구인/구직 정보가 정상적으로 노출됩니다.`;

      // Set approval data when moving to approved
      await c.env.DB.prepare(`
        UPDATE users 
        SET status = ?,
            approved_by = ?,
            approved_at = ?,
            updated_at = ?
        WHERE id = ?
      `).bind(newStatus, adminUser?.id, currentTime, currentTime, userId).run();

    } else {
      throw new HTTPException(400, {
        message: `현재 상태(${user.status})에서는 토글할 수 없습니다. approved 또는 pending 상태만 토글 가능합니다.`
      });
    }

    return c.json({
      success: true,
      message,
      data: {
        userId,
        oldStatus: user.status,
        newStatus,
        email: user.email,
        name: user.name
      }
    });
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    console.error('Toggle user status error:', error);
    throw new HTTPException(500, {
      message: '사용자 상태 변경 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/admin/users/:id/reset-password
 * 임시 비밀번호 생성 및 설정
 */
admin.post('/users/:id/reset-password', async (c) => {
  try {
    const userId = c.req.param('id');
    const currentTime = getCurrentTimestamp();

    // Get user info
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, user_type FROM users WHERE id = ?'
    ).bind(userId).first<{ id: string; email: string; name: string; user_type: string }>();

    if (!user) {
      throw new HTTPException(404, { message: '사용자를 찾을 수 없습니다.' });
    }

    // Generate temporary password (8 characters: alphanumeric)
    const generateTempPassword = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
      let password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const tempPassword = generateTempPassword();

    // Hash the temporary password
    const { hashPassword } = await import('../utils/auth');
    const hashedPassword = await hashPassword(tempPassword);

    // Update user password and set password_changed_at to null to force password change
    await c.env.DB.prepare(`
      UPDATE users 
      SET password_hash = ?,
          password_changed_at = NULL,
          updated_at = ?
      WHERE id = ?
    `).bind(hashedPassword, currentTime, userId).run();

    return c.json({
      success: true,
      message: '임시 비밀번호가 생성되었습니다.',
      data: {
        userId,
        email: user.email,
        name: user.name,
        tempPassword,
        requirePasswordChange: true
      }
    });
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    console.error('Reset password error:', error);
    throw new HTTPException(500, {
      message: '임시 비밀번호 생성 중 오류가 발생했습니다.'
    });
  }
});

// ===================================
// 통계 및 분석 API
// ===================================

/**
 * GET /api/admin/statistics
 * 전체 플랫폼 통계
 */
admin.get('/statistics', async (c) => {
  try {
    // Get user statistics
    const userStats = await c.env.DB.prepare(`
      SELECT 
        user_type,
        status,
        COUNT(*) as count
      FROM users
      GROUP BY user_type, status
    `).all();

    // Get job postings statistics
    const jobStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM job_postings
    `).first();

    // Get applications statistics
    const applicationStats = await c.env.DB.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM applications
      GROUP BY status
    `).all();

    // Get matches statistics
    const matchStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END) as applied,
        SUM(CASE WHEN status = 'interested' THEN 1 ELSE 0 END) as interested,
        SUM(CASE WHEN status = 'suggested' THEN 1 ELSE 0 END) as suggested
      FROM matches
    `).first();

    // Get successful matches (accepted applications)
    const successfulMatches = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM applications
      WHERE status = 'accepted'
    `).first();

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await c.env.DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        user_type,
        COUNT(*) as count
      FROM users
      WHERE created_at >= ?
      GROUP BY DATE(created_at), user_type
      ORDER BY date DESC
    `).bind(thirtyDaysAgo.toISOString()).all();

    // Get universities statistics
    const universityStats = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM universities
    `).first();

    // Calculate totals
    const totalUsers = userStats.results.reduce((sum: number, stat: any) => sum + stat.count, 0);
    const pendingApprovals = userStats.results
      .filter((stat: any) => stat.status === 'pending')
      .reduce((sum: number, stat: any) => sum + stat.count, 0);

    return c.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byType: userStats.results,
          pendingApprovals
        },
        jobs: jobStats,
        universities: {
          total: universityStats?.total || 0
        },
        applications: applicationStats.results,
        matches: {
          total: matchStats?.total || 0,
          applied: matchStats?.applied || 0,
          interested: matchStats?.interested || 0,
          suggested: matchStats?.suggested || 0,
          successful: successfulMatches?.count || 0
        },
        recentActivity: {
          registrations: recentRegistrations.results
        }
      }
    });
  } catch (error: any) {
    console.error('Get statistics error:', error);
    throw new HTTPException(500, {
      message: '통계 데이터를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/admin/jobs/stats
 * 구인정보 상세 통계
 */
admin.get('/jobs/stats', async (c) => {
  try {
    // 상태별 구인공고 수
    const statusStats = await c.env.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM job_postings
      GROUP BY status
    `).all();

    const stats: any = {
      active: 0,
      pending: 0,
      closed: 0
    };

    statusStats.results.forEach((stat: any) => {
      stats[stat.status] = stat.count;
    });

    // 최근 구인공고 (최대 10개)
    const { results: recentJobs } = await c.env.DB.prepare(`
      SELECT 
        jp.id,
        jp.title,
        jp.status,
        jp.location,
        jp.created_at,
        c.company_name as company
      FROM job_postings jp
      JOIN companies c ON jp.company_id = c.id
      ORDER BY jp.created_at DESC
      LIMIT 10
    `).all();

    return c.json({
      success: true,
      ...stats,
      recentJobs
    });
  } catch (error: any) {
    console.error('Get jobs stats error:', error);
    throw new HTTPException(500, {
      message: '구인정보 통계를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/admin/jobseekers/stats
 * 구직자 상세 통계
 */
admin.get('/jobseekers/stats', async (c) => {
  try {
    // 상태별 구직자 수
    const statusStats = await c.env.DB.prepare(`
      SELECT u.status, COUNT(*) as count
      FROM users u
      WHERE u.user_type = 'jobseeker'
      GROUP BY u.status
    `).all();

    const stats: any = {
      active: 0,
      pending: 0,
      rejected: 0,
      suspended: 0
    };

    statusStats.results.forEach((stat: any) => {
      if (stat.status === 'approved') stats.active = stat.count;
      else stats[stat.status] = stat.count;
    });

    // 국적별 구직자 수
    const { results: nationalityStats } = await c.env.DB.prepare(`
      SELECT j.nationality, COUNT(*) as count
      FROM jobseekers j
      JOIN users u ON j.user_id = u.id
      WHERE u.status = 'approved'
      GROUP BY j.nationality
      ORDER BY count DESC
      LIMIT 10
    `).all();

    // 최근 가입 구직자
    const { results: recentJobseekers } = await c.env.DB.prepare(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.status,
        u.created_at,
        j.nationality,
        j.experience_years
      FROM users u
      JOIN jobseekers j ON u.id = j.user_id
      WHERE u.user_type = 'jobseeker'
      ORDER BY u.created_at DESC
      LIMIT 10
    `).all();

    return c.json({
      success: true,
      ...stats,
      nationalityStats,
      recentJobseekers
    });
  } catch (error: any) {
    console.error('Get jobseekers stats error:', error);
    throw new HTTPException(500, {
      message: '구직자 통계를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/admin/universities/stats
 * 대학교 상세 통계
 */
admin.get('/universities/stats', async (c) => {
  try {
    // 전체 대학교 수
    const totalCount = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM universities
    `).first<{ count: number }>();

    // 지역별 대학교 수
    const { results: regionalStats } = await c.env.DB.prepare(`
      SELECT region, COUNT(*) as count
      FROM universities
      GROUP BY region
      ORDER BY count DESC
    `).all();

    // 파트너십 타입별
    const { results: partnershipStats } = await c.env.DB.prepare(`
      SELECT partnership_type, COUNT(*) as count
      FROM universities
      GROUP BY partnership_type
    `).all();

    // 최근 추가된 대학교
    const { results: recentUniversities } = await c.env.DB.prepare(`
      SELECT 
        id,
        name,
        english_name,
        region,
        partnership_type,
        student_count,
        foreign_student_count,
        created_at
      FROM universities
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    return c.json({
      success: true,
      total: totalCount?.count || 0,
      regionalStats,
      partnershipStats,
      recentUniversities
    });
  } catch (error: any) {
    console.error('Get universities stats error:', error);
    throw new HTTPException(500, {
      message: '대학교 통계를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/admin/matches/stats
 * 매칭 상세 통계
 */
admin.get('/matches/stats', async (c) => {
  try {
    // 지원서 상태별 통계
    const { results: applicationStats } = await c.env.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM applications
      GROUP BY status
    `).all();

    const stats: any = {
      total: 0,
      submitted: 0,
      reviewed: 0,
      interview_scheduled: 0,
      offered: 0,
      accepted: 0,
      rejected: 0
    };

    applicationStats.forEach((stat: any) => {
      stats[stat.status] = stat.count;
      stats.total += stat.count;
    });

    // 최근 매칭 (지원) - 간단한 쿼리로 변경
    const { results: recentMatches } = await c.env.DB.prepare(`
      SELECT 
        id,
        status,
        applied_at as created_at,
        jobseeker_id,
        job_posting_id
      FROM applications
      ORDER BY applied_at DESC
      LIMIT 10
    `).all();

    return c.json({
      success: true,
      ...stats,
      recentMatches
    });
  } catch (error: any) {
    console.error('Get matches stats error:', error);
    console.error('Error details:', error.message, error.stack);
    throw new HTTPException(500, {
      message: '매칭 통계를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/admin/analytics
 * 고급 분석 데이터
 */
admin.get('/analytics', async (c) => {
  try {
    const { period = '30' } = c.req.query();
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // User growth trend
    const userGrowth = await c.env.DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM users
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).bind(daysAgo.toISOString()).all();

    // Job posting trend
    const jobGrowth = await c.env.DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_jobs
      FROM job_postings
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).bind(daysAgo.toISOString()).all();

    // Regional distribution
    const regionalDistribution = await c.env.DB.prepare(`
      SELECT 
        c.location as region,
        COUNT(*) as count
      FROM companies c
      JOIN users u ON c.user_id = u.id AND u.status = 'approved'
      GROUP BY c.location
    `).all();

    return c.json({
      success: true,
      data: {
        userGrowth: userGrowth.results,
        jobGrowth: jobGrowth.results,
        regionalDistribution: regionalDistribution.results,
        period: parseInt(period)
      }
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    throw new HTTPException(500, {
      message: '분석 데이터를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// ===================================
// 협약대학교 관리 API
// ===================================

/**
 * GET /api/admin/universities
 * 협약대학교 목록 조회
 */
admin.get('/universities', async (c) => {
  try {
    const { region, search } = c.req.query();

    let whereClause = [];
    let bindings: any[] = [];

    if (region) {
      whereClause.push('region = ?');
      bindings.push(region);
    }

    if (search) {
      whereClause.push('name LIKE ?');
      bindings.push(`%${search}%`);
    }

    const whereSQL = whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : '';

    const { results: universities } = await c.env.DB.prepare(`
      SELECT * FROM universities ${whereSQL} ORDER BY name ASC
    `).bind(...bindings).all();

    return c.json({
      success: true,
      data: {
        universities,
        count: universities.length
      }
    });
  } catch (error: any) {
    console.error('Get universities error:', error);
    throw new HTTPException(500, {
      message: '대학교 목록을 가져오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/admin/universities
 * 새 협약대학교 추가
 */
admin.post('/universities', async (c) => {
  try {
    const { name, region, ranking, students, partnership_type, logo_url } = await c.req.json();

    if (!name || !region) {
      throw new HTTPException(400, {
        message: '대학교명과 지역은 필수 항목입니다.'
      });
    }

    const currentTime = getCurrentTimestamp();

    const result = await c.env.DB.prepare(`
      INSERT INTO universities (
        name, region, ranking, students, partnership_type, logo_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name, region, ranking || null, students || null,
      partnership_type || '일반협약', logo_url || null,
      currentTime, currentTime
    ).run();

    return c.json({
      success: true,
      message: '협약대학교가 추가되었습니다.',
      data: { id: result.meta.last_row_id }
    }, 201);
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    console.error('Create university error:', error);
    throw new HTTPException(500, {
      message: '대학교 추가 중 오류가 발생했습니다.'
    });
  }
});

/**
 * PUT /api/admin/universities/:id
 * 협약대학교 정보 수정
 */
admin.put('/universities/:id', async (c) => {
  try {
    const universityId = c.req.param('id');
    const updates = await c.req.json();
    const currentTime = getCurrentTimestamp();

    const university = await c.env.DB.prepare(
      'SELECT id FROM universities WHERE id = ?'
    ).bind(universityId).first();

    if (!university) {
      throw new HTTPException(404, { message: '대학교를 찾을 수 없습니다.' });
    }

    const { name, region, ranking, students, partnership_type, logo_url } = updates;

    await c.env.DB.prepare(`
      UPDATE universities 
      SET name = ?, region = ?, ranking = ?, students = ?, 
          partnership_type = ?, logo_url = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      name, region, ranking || null, students || null,
      partnership_type, logo_url || null, currentTime, universityId
    ).run();

    return c.json({
      success: true,
      message: '대학교 정보가 수정되었습니다.',
      data: { id: universityId }
    });
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    console.error('Update university error:', error);
    throw new HTTPException(500, {
      message: '대학교 수정 중 오류가 발생했습니다.'
    });
  }
});

/**
 * DELETE /api/admin/universities/:id
 * 협약대학교 삭제
 */
admin.delete('/universities/:id', async (c) => {
  try {
    const universityId = c.req.param('id');

    const university = await c.env.DB.prepare(
      'SELECT id, name FROM universities WHERE id = ?'
    ).bind(universityId).first();

    if (!university) {
      throw new HTTPException(404, { message: '대학교를 찾을 수 없습니다.' });
    }

    await c.env.DB.prepare(
      'DELETE FROM universities WHERE id = ?'
    ).bind(universityId).run();

    return c.json({
      success: true,
      message: `${university.name}이(가) 삭제되었습니다.`,
      data: { id: universityId }
    });
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    console.error('Delete university error:', error);
    throw new HTTPException(500, {
      message: '대학교 삭제 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/admin/statistics/charts
 * 통계 페이지용 차트 데이터 (월별, 국가별, 지역별 등)
 */
admin.get('/statistics/charts', async (c) => {
  try {
    // 1. 월별 활동 추이 데이터 (최근 10개월)
    const monthlyJobPostings = await c.env.DB.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as count
      FROM job_postings
      WHERE created_at >= date('now', '-10 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month ASC
    `).all();

    const monthlyJobseekers = await c.env.DB.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as count
      FROM jobseekers
      WHERE created_at >= date('now', '-10 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month ASC
    `).all();

    const monthlyMatches = await c.env.DB.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as count
      FROM applications
      WHERE status = 'accepted' AND created_at >= date('now', '-10 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month ASC
    `).all();

    // 2. 국가별 구직자 분포
    const countryDistribution = await c.env.DB.prepare(`
      SELECT 
        COALESCE(nationality, '미정') as country,
        COUNT(*) as count
      FROM jobseekers
      GROUP BY nationality
      ORDER BY count DESC
      LIMIT 10
    `).all();

    // 3. 지역별 구인공고 현황
    const regionDistribution = await c.env.DB.prepare(`
      SELECT 
        COALESCE(location, '미정') as region,
        COUNT(*) as count
      FROM job_postings
      GROUP BY location
      ORDER BY count DESC
      LIMIT 10
    `).all();

    // 4. KPI 카드 데이터
    const totalJobs = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM job_postings'
    ).first();

    const totalJobseekers = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM jobseekers'
    ).first();

    const successfulMatches = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM applications WHERE status = "accepted"'
    ).first();

    const totalCompanies = await c.env.DB.prepare(
      'SELECT COUNT(DISTINCT user_id) as count FROM job_postings'
    ).first();

    return c.json({
      success: true,
      data: {
        kpi: {
          totalJobs: totalJobs?.count || 0,
          totalJobseekers: totalJobseekers?.count || 0,
          successfulMatches: successfulMatches?.count || 0,
          totalCompanies: totalCompanies?.count || 0
        },
        monthly: {
          jobPostings: monthlyJobPostings.results,
          jobseekers: monthlyJobseekers.results,
          matches: monthlyMatches.results
        },
        country: countryDistribution.results,
        region: regionDistribution.results
      }
    });
  } catch (error: any) {
    console.error('Get chart statistics error:', error);
    throw new HTTPException(500, {
      message: '차트 통계 데이터를 가져오는 중 오류가 발생했습니다.'
    });
  }
});



// ===================================
// Dashboard Specific Stats (Consolidated from admin_dashboard.ts)
// ===================================

// 구인정보 통계 상세
admin.get('/jobs/stats', async (c) => {
  try {
    const db = c.env.DB;

    // 상태별 집계
    const stats = await db.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM job_postings
      GROUP BY status
    `).all();

    const statsMap = stats.results.reduce((acc: any, row: any) => {
      acc[row.status] = row.count;
      return acc;
    }, {});

    // 최근 공고 조회
    const recentJobs = await db.prepare(`
      SELECT 
        j.id,
        j.title,
        j.location,
        j.status,
        j.created_at,
        c.company_name as company
      FROM job_postings j
      LEFT JOIN companies c ON j.company_id = c.id
      ORDER BY j.created_at DESC
      LIMIT 10
    `).all();

    return c.json({
      success: true,
      active: statsMap.active || 0,
      pending: statsMap.draft || 0,
      closed: statsMap.closed || 0,
      recentJobs: recentJobs.results
    });
  } catch (error) {
    console.error('Jobs stats error:', error);
    return c.json({
      success: false,
      active: 0,
      pending: 0,
      closed: 0,
      recentJobs: []
    }, 500);
  }
});

// 구직자 통계 상세
admin.get('/jobseekers/stats', async (c) => {
  try {
    const db = c.env.DB;

    // 상태별 구직자 집계
    const activeCount = await db.prepare(`
      SELECT COUNT(*) as count
      FROM users
      WHERE user_type = 'jobseeker' AND status = 'approved'
    `).first();

    const pendingCount = await db.prepare(`
      SELECT COUNT(*) as count
      FROM users
      WHERE user_type = 'jobseeker' AND status = 'pending'
    `).first();

    // 국적별 집계
    const chinaCount = await db.prepare(`
      SELECT COUNT(*) as count
      FROM jobseekers j
      JOIN users u ON j.user_id = u.id
      WHERE j.nationality = '중국' AND u.status = 'approved'
    `).first();

    const totalApproved = activeCount?.count || 0;
    const otherCount = (totalApproved as number) - (chinaCount?.count as number || 0);

    // 최근 가입자
    const recentJobseekers = await db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.status,
        u.created_at,
        j.nationality,
        j.korean_level
      FROM users u
      LEFT JOIN jobseekers j ON u.id = j.user_id
      WHERE u.user_type = 'jobseeker'
      ORDER BY u.created_at DESC
      LIMIT 10
    `).all();

    return c.json({
      success: true,
      total: totalApproved,
      pending: pendingCount?.count || 0,
      china: chinaCount?.count || 0,
      other: otherCount,
      recentJobseekers: recentJobseekers.results
    });
  } catch (error) {
    console.error('Jobseekers stats error:', error);
    return c.json({
      success: false,
      total: 0,
      pending: 0,
      china: 0,
      other: 0,
      recentJobseekers: []
    }, 500);
  }
});

// ===================================
// 문의 관리 API
// ===================================

/**
 * GET /api/admin/inquiries
 * 문의 목록 조회
 */
admin.get('/inquiries', async (c) => {
  try {
    const { page = '1', limit = '20', status, search } = c.req.query();
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM inquiries';
    const conditions = [];
    const bindings: any[] = [];

    if (status) {
      conditions.push('status = ?');
      bindings.push(status);
    }

    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ? OR subject LIKE ?)');
      const searchTerm = `%${search}%`;
      bindings.push(searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sort by created_at desc
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    bindings.push(parseInt(limit), offset);

    // Get Data
    const { results: inquiries } = await c.env.DB.prepare(query).bind(...bindings).all();

    // Get Total Count
    let countQuery = 'SELECT COUNT(*) as total FROM inquiries';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await c.env.DB.prepare(countQuery).bind(...bindings.slice(0, bindings.length - 2)).first<{ total: number }>();

    return c.json({
      success: true,
      data: {
        inquiries,
        total: countResult?.total || 0,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error: any) {
    console.error('Get inquiries error:', error);
    return c.json({ success: false, error: '문의 목록을 가져오는 중 오류가 발생했습니다.' }, 500);
  }
});

/**
 * PUT /api/admin/inquiries/:id
 * 문의 상태 수정
 */
admin.put('/inquiries/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { status, admin_note } = await c.req.json();
    const currentTime = getCurrentTimestamp();

    const updates = [];
    const bindings = [];

    if (status) {
      updates.push('status = ?');
      bindings.push(status);
    }
    if (admin_note !== undefined) {
      updates.push('admin_note = ?');
      bindings.push(admin_note);
    }

    if (updates.length === 0) {
      return c.json({ success: false, error: '수정할 내용이 없습니다.' }, 400);
    }

    updates.push('updated_at = ?');
    bindings.push(currentTime);
    bindings.push(id);

    await c.env.DB.prepare(`UPDATE inquiries SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...bindings)
      .run();

    return c.json({ success: true, message: '문의 상태가 수정되었습니다.' });
  } catch (error: any) {
    console.error('Update inquiry error:', error);
    return c.json({ success: false, error: '문의 상태 수정 중 오류가 발생했습니다.' }, 500);
  }
});

export default admin;
