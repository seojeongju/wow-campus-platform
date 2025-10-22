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
 * GET /api/admin/users
 * 전체 사용자 목록 조회 (검색, 필터링, 페이지네이션)
 */
admin.get('/users', async (c) => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      user_type, 
      status, 
      search 
    } = c.req.query();

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
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
    
    const whereSQL = whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users u ${whereSQL}`;
    const countResult = await c.env.DB.prepare(countQuery).bind(...bindings).first<{ total: number }>();
    const total = countResult?.total || 0;
    
    // Get users with profile data
    const usersQuery = `
      SELECT 
        u.id, u.email, u.name, u.phone, u.user_type, u.status,
        u.created_at, u.updated_at, u.last_login,
        CASE u.user_type
          WHEN 'company' THEN c.company_name
          WHEN 'agent' THEN a.agency_name
          ELSE NULL
        END as organization_name
      FROM users u
      LEFT JOIN companies c ON u.id = c.user_id AND u.user_type = 'company'
      LEFT JOIN agents a ON u.id = a.user_id AND u.user_type = 'agent'
      ${whereSQL}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    bindings.push(parseInt(limit), offset);
    const { results: users } = await c.env.DB.prepare(usersQuery).bind(...bindings).all();
    
    return c.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    throw new HTTPException(500, { 
      message: '사용자 목록을 가져오는 중 오류가 발생했습니다.' 
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
        CASE u.user_type
          WHEN 'company' THEN c.company_name
          WHEN 'agent' THEN a.agency_name
          WHEN 'jobseeker' THEN j.nationality
          ELSE NULL
        END as additional_info
      FROM users u
      LEFT JOIN companies c ON u.id = c.user_id AND u.user_type = 'company'
      LEFT JOIN agents a ON u.id = a.user_id AND u.user_type = 'agent'
      LEFT JOIN jobseekers j ON u.id = j.user_id AND u.user_type = 'jobseeker'
      WHERE u.status = 'pending'
      ORDER BY u.created_at ASC
    `).all();
    
    return c.json({
      success: true,
      data: {
        pendingUsers,
        count: pendingUsers.length
      }
    });
  } catch (error: any) {
    console.error('Get pending users error:', error);
    throw new HTTPException(500, { 
      message: '승인 대기 목록을 가져오는 중 오류가 발생했습니다.' 
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
        u.created_at, u.updated_at, u.last_login, u.approved_by, u.approved_at
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
    
    // Soft delete: set status to 'deleted'
    await c.env.DB.prepare(`
      UPDATE users 
      SET status = 'deleted',
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
        applications: applicationStats.results,
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

export default admin;
