
import { Hono } from 'hono';
import { authMiddleware, optionalAuth, requireAdmin } from '../middleware/auth';
import type { Bindings, Variables } from '../types/env';

const agents = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 전역(agents.use) 대신 각 라우트별 middleware 적용

/**
 * ==========================================
 * Admin & Public Agent Management Routes
 * ==========================================
 */

// 에이전트 목록 조회 (필터링 지원)
agents.get('/', async (c) => {
  try {
    const db = c.env.DB;
    const region = c.req.query('region');
    const specialization = c.req.query('specialization');
    const status = c.req.query('status');

    // users 테이블과 agents 테이블 조인하여 조회
    let query = `
      SELECT 
        a.*,
        u.email,
        u.name as contact_name,
        u.phone,
        u.status as approval_status,
        u.created_at as registered_at
      FROM agents a
      JOIN users u ON a.user_id = u.id
      WHERE u.user_type = 'agent'
    `;
    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      conditions.push('u.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY a.created_at DESC';

    const result = await db.prepare(query).bind(...params).all();

    // 데이터 변환
    let agentsList = result.results.map((agent: any) => ({
      id: agent.id,
      userId: agent.user_id,
      agencyName: agent.agency_name,
      contactName: agent.contact_name,
      email: agent.email,
      phone: agent.phone,
      licenseNumber: agent.license_number,
      specialization: agent.specialization ? JSON.parse(agent.specialization) : [],
      commissionRate: agent.commission_rate,
      countriesCovered: agent.countries_covered ? JSON.parse(agent.countries_covered) : [],
      languages: agent.languages ? JSON.parse(agent.languages) : [],
      experienceYears: agent.experience_years,
      totalPlacements: agent.total_placements,
      successRate: agent.success_rate,
      approvalStatus: agent.approval_status,
      createdAt: agent.created_at,
      updatedAt: agent.updated_at,
      registeredAt: agent.registered_at
    }));

    // 클라이언트 측 필터링 (specialization)
    if (specialization && specialization !== 'all') {
      agentsList = agentsList.filter((agent: any) =>
        agent.specialization.includes(specialization)
      );
    }

    return c.json({
      success: true,
      agents: agentsList
    });
  } catch (error) {
    console.error('Agents fetch error:', error);
    return c.json({
      success: false,
      message: '에이전트 목록을 불러오는데 실패했습니다.',
      agents: []
    }, 500);
  }
});

// 에이전트 추가 (관리자 전용)
agents.post('/', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const data = await c.req.json();

    // 먼저 users 테이블에 사용자 생성
    const userResult = await db.prepare(`
      INSERT INTO users (
        email, password_hash, user_type, status, name, phone, created_at, updated_at
      ) VALUES (?, ?, 'agent', 'approved', ?, ?, datetime('now'), datetime('now'))
    `).bind(
      data.email,
      'temp_password_hash', // 임시 비밀번호 (추후 이메일로 변경 링크 발송)
      data.contactName,
      data.phone || ''
    ).run();

    const userId = userResult.meta.last_row_id;

    // agents 테이블에 상세 정보 저장
    const agentResult = await db.prepare(`
      INSERT INTO agents (
        user_id, agency_name, license_number, specialization,
        commission_rate, countries_covered, languages,
        experience_years, total_placements, success_rate,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      userId,
      data.agencyName,
      data.licenseNumber || '',
      JSON.stringify(data.specialization || []),
      data.commissionRate || 10.0,
      JSON.stringify(data.countriesCovered || []),
      JSON.stringify(data.languages || []),
      data.experienceYears || 0,
      data.totalPlacements || 0,
      data.successRate || 0.0
    ).run();

    return c.json({
      success: true,
      message: "에이전트가 성공적으로 추가되었습니다.",
      data: {
        id: agentResult.meta.last_row_id,
        userId: userId,
        ...data
      }
    });
  } catch (error) {
    console.error('Agent creation error:', error);
    return c.json({
      success: false,
      message: "에이전트 추가 중 오류가 발생했습니다."
    }, 500);
  }
});

// 에이전트 삭제 (관리자 전용)
agents.delete('/:id', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');

    // agents 테이블에서 user_id 조회
    const agent = await db.prepare('SELECT user_id FROM agents WHERE id = ?').bind(id).first();

    if (agent) {
      // users 테이블에서 삭제 (CASCADE로 agents도 자동 삭제)
      await db.prepare('DELETE FROM users WHERE id = ?').bind(agent.user_id).run();
    }

    return c.json({
      success: true,
      message: `에이전트가 삭제되었습니다.`
    });
  } catch (error) {
    console.error('Agent deletion error:', error);
    return c.json({
      success: false,
      message: "에이전트 삭제 중 오류가 발생했습니다."
    }, 500);
  }
});

// 에이전트 수정 (관리자 전용)
agents.put('/:id', optionalAuth, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const data = await c.req.json();

    // agents 테이블에서 user_id 조회
    const agent = await db.prepare('SELECT user_id FROM agents WHERE id = ?').bind(id).first();

    if (!agent) {
      return c.json({
        success: false,
        message: "에이전트를 찾을 수 없습니다."
      }, 404);
    }

    // users 테이블 업데이트
    await db.prepare(`
      UPDATE users SET
        name = ?,
        email = ?,
        phone = ?,
        status = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      data.contactName,
      data.email,
      data.phone || '',
      data.approvalStatus || 'approved',
      agent.user_id
    ).run();

    // agents 테이블 업데이트
    await db.prepare(`
      UPDATE agents SET
        agency_name = ?,
        license_number = ?,
        specialization = ?,
        commission_rate = ?,
        countries_covered = ?,
        languages = ?,
        experience_years = ?,
        total_placements = ?,
        success_rate = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      data.agencyName,
      data.licenseNumber || '',
      JSON.stringify(data.specialization || []),
      data.commissionRate || 10.0,
      JSON.stringify(data.countriesCovered || []),
      JSON.stringify(data.languages || []),
      data.experienceYears || 0,
      data.totalPlacements || 0,
      data.successRate || 0.0,
      id
    ).run();

    return c.json({
      success: true,
      message: `에이전트가 수정되었습니다.`,
      data: {
        id: parseInt(id),
        ...data
      }
    });
  } catch (error) {
    console.error('Agent update error:', error);
    return c.json({
      success: false,
      message: "에이전트 수정 중 오류가 발생했습니다."
    }, 500);
  }
});


/**
 * ==========================================
 * Agent User Routes (Authenticated)
 * ==========================================
 */

/**
 * Get all jobseekers assigned to the current agent
 * GET /api/agents/jobseekers
 */
agents.get('/jobseekers', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    // Ensure user is an agent
    if (!user || user.user_type !== 'agent') {
      return c.json({
        success: false,
        error: 'Only agents can access this endpoint'
      }, 403);
    }

    // Get agent_id from agents table
    const agentResult = await c.env.DB.prepare(
      'SELECT id FROM agents WHERE user_id = ?'
    ).bind(user.id).first();

    if (!agentResult) {
      return c.json({
        success: false,
        error: 'Agent profile not found'
      }, 404);
    }

    const agentId = agentResult.id;

    // Get query parameters for pagination and filtering
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const status = c.req.query('status') || 'active'; // active, inactive, completed, all
    const offset = (page - 1) * limit;

    // Build query based on status filter
    let whereClause = 'WHERE aj.agent_id = ?';
    const queryParams: any[] = [agentId];

    if (status !== 'all') {
      whereClause += ' AND aj.status = ?';
      queryParams.push(status);
    }

    // Count total assigned jobseekers
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM agent_jobseekers aj 
      ${whereClause}
    `;
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...queryParams)
      .first();
    const total = countResult?.total || 0;

    // Get assigned jobseekers with details
    const jobseekersQuery = `
      SELECT 
        j.*,
        aj.id as assignment_id,
        aj.assigned_date,
        aj.status as assignment_status,
        aj.notes as assignment_notes,
        aj.commission_earned,
        aj.placement_date
      FROM agent_jobseekers aj
      INNER JOIN jobseekers j ON aj.jobseeker_id = j.id
      ${whereClause}
      ORDER BY aj.assigned_date DESC
      LIMIT ? OFFSET ?
    `;

    const jobseekers = await c.env.DB.prepare(jobseekersQuery)
      .bind(...queryParams, limit, offset)
      .all();

    return c.json({
      success: true,
      jobseekers: jobseekers.results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil((total as number) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching assigned jobseekers:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch assigned jobseekers'
    }, 500);
  }
});

/**
 * Get available jobseekers (not assigned to any agent)
 * GET /api/agents/available-jobseekers
 */
agents.get('/available-jobseekers', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    // Ensure user is an agent
    if (!user || user.user_type !== 'agent') {
      return c.json({
        success: false,
        error: 'Only agents can access this endpoint'
      }, 403);
    }

    // Get agent_id from agents table
    console.log('Fetching agent profile for user_id:', user.id);
    const agentResult = await c.env.DB.prepare(
      'SELECT id FROM agents WHERE user_id = ?'
    ).bind(user.id).first();

    if (!agentResult) {
      return c.json({
        success: false,
        error: 'Agent profile not found. Please complete your profile first.'
      }, 404);
    }

    const agentId = agentResult.id;

    const query = c.req.query('q') || '';
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const offset = (page - 1) * limit;

    // Search conditions
    let searchCondition = '';
    const params: any[] = [];

    // Query to find jobseekers NOT in active assignment
    // We check if they exist in agent_jobseekers with status 'active' for THIS agent or ANY agent?
    // Usually 'available' means not assigned to ME or not assigned at all?
    // "j.id NOT IN (SELECT jobseeker_id FROM agent_jobseekers WHERE status = 'active')" implies not assigned at all.

    // Let's stick to the logic: Not assigned to *this* agent? Or globally?
    // The previous code in agents.ts was "status = 'active'".
    // Let's use the code from agents.ts which seemed to check global availability or local?
    // "SELECT jobseeker_id FROM agent_jobseekers WHERE status = 'active'" means NO ACTIVE assignment at all.
    // That means exclusive assignment.

    if (query) {
      searchCondition = `
        AND (
          u.name LIKE ? OR 
          u.email LIKE ? OR 
          u.phone LIKE ?
        )
      `;
      const searchPattern = `%${query}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const sql = `
      SELECT 
        j.id, j.user_id, j.visa_status, j.nationality, j.experience_years, j.korean_level, j.skills,
        u.name, u.email, u.phone, u.created_at
      FROM jobseekers j
      JOIN users u ON j.user_id = u.id
      WHERE u.status = 'approved'
      AND j.id NOT IN (
        SELECT jobseeker_id 
        FROM agent_jobseekers 
        WHERE status = 'active'
      )
      ${searchCondition}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) as total
      FROM jobseekers j
      JOIN users u ON j.user_id = u.id
      WHERE u.status = 'approved'
      AND j.id NOT IN (
        SELECT jobseeker_id 
        FROM agent_jobseekers 
        WHERE status = 'active'
      )
      ${searchCondition}
    `;

    const jobseekers = await c.env.DB.prepare(sql).bind(...params, limit, offset).all();
    const countResult = await c.env.DB.prepare(countSql).bind(...params).first();
    const total = countResult?.total || 0;

    return c.json({
      success: true,
      jobseekers: jobseekers.results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil((total as number) / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching available jobseekers:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch available jobseekers'
    }, 500);
  }
});

/**
 * Assign a jobseeker to the current agent
 * POST /api/agents/jobseekers/:jobseekerId/assign
 */
agents.post('/jobseekers/:jobseekerId/assign', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    // Ensure user is an agent
    if (!user || user.user_type !== 'agent') {
      return c.json({
        success: false,
        error: 'Only agents can assign jobseekers'
      }, 403);
    }

    const jobseekerId = parseInt(c.req.param('jobseekerId'));
    const { notes } = await c.req.json();

    // Get agent_id from agents table
    const agentResult = await c.env.DB.prepare(
      'SELECT id FROM agents WHERE user_id = ?'
    ).bind(user.id).first();

    if (!agentResult) {
      return c.json({
        success: false,
        error: 'Agent profile not found'
      }, 404);
    }

    const agentId = agentResult.id;

    // Check if jobseeker exists
    const jobseekerExists = await c.env.DB.prepare(
      'SELECT id FROM jobseekers WHERE id = ?'
    ).bind(jobseekerId).first();

    if (!jobseekerExists) {
      return c.json({
        success: false,
        error: 'Jobseeker not found'
      }, 404);
    }

    // Check if already assigned
    const existingAssignment = await c.env.DB.prepare(
      'SELECT id, status FROM agent_jobseekers WHERE agent_id = ? AND jobseeker_id = ?'
    ).bind(agentId, jobseekerId).first();

    if (existingAssignment) {
      // If inactive, reactivate it
      if (existingAssignment.status === 'inactive') {
        await c.env.DB.prepare(
          `UPDATE agent_jobseekers 
           SET status = 'active', 
               assigned_date = CURRENT_TIMESTAMP,
               notes = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        ).bind(notes || null, existingAssignment.id).run();

        return c.json({
          success: true,
          message: 'Jobseeker assignment reactivated',
          assignmentId: existingAssignment.id
        });
      } else {
        return c.json({
          success: false,
          error: 'Jobseeker is already assigned to you'
        }, 400);
      }
    }

    // Create new assignment
    const result = await c.env.DB.prepare(
      `INSERT INTO agent_jobseekers (agent_id, jobseeker_id, notes, status, assigned_date)
       VALUES (?, ?, ?, 'active', CURRENT_TIMESTAMP)`
    ).bind(agentId, jobseekerId, notes || null).run();

    return c.json({
      success: true,
      message: 'Jobseeker assigned successfully',
      assignmentId: result.meta.last_row_id
    });
  } catch (error) {
    console.error('Error assigning jobseeker:', error);
    return c.json({
      success: false,
      error: 'Failed to assign jobseeker'
    }, 500);
  }
});

/**
 * Unassign a jobseeker from the current agent
 * DELETE /api/agents/jobseekers/:jobseekerId/unassign
 */
agents.delete('/jobseekers/:jobseekerId/unassign', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    // Ensure user is an agent
    if (!user || user.user_type !== 'agent') {
      return c.json({
        success: false,
        error: 'Only agents can unassign jobseekers'
      }, 403);
    }

    const jobseekerId = parseInt(c.req.param('jobseekerId'));

    // Get agent_id from agents table
    const agentResult = await c.env.DB.prepare(
      'SELECT id FROM agents WHERE user_id = ?'
    ).bind(user.id).first();

    if (!agentResult) {
      return c.json({
        success: false,
        error: 'Agent profile not found'
      }, 404);
    }

    const agentId = agentResult.id;

    // Update status to inactive instead of deleting
    const result = await c.env.DB.prepare(
      `UPDATE agent_jobseekers 
       SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
       WHERE agent_id = ? AND jobseeker_id = ? AND status = 'active'`
    ).bind(agentId, jobseekerId).run();

    if (result.meta.changes === 0) {
      return c.json({
        success: false,
        error: 'Assignment not found or already inactive'
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Jobseeker unassigned successfully'
    });
  } catch (error) {
    console.error('Error unassigning jobseeker:', error);
    return c.json({
      success: false,
      error: 'Failed to unassign jobseeker'
    }, 500);
  }
});

/**
 * Update assignment details
 * PATCH /api/agents/jobseekers/:jobseekerId/assignment
 */
agents.patch('/jobseekers/:jobseekerId/assignment', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    // Ensure user is an agent
    if (!user || user.user_type !== 'agent') {
      return c.json({
        success: false,
        error: 'Only agents can update assignments'
      }, 403);
    }

    const jobseekerId = parseInt(c.req.param('jobseekerId'));
    const { notes, status, commission_earned, placement_date } = await c.req.json();

    // Get agent_id from agents table
    const agentResult = await c.env.DB.prepare(
      'SELECT id FROM agents WHERE user_id = ?'
    ).bind(user.id).first();

    if (!agentResult) {
      return c.json({
        success: false,
        error: 'Agent profile not found'
      }, 404);
    }

    const agentId = agentResult.id;

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }
    if (status !== undefined && ['active', 'inactive', 'completed'].includes(status)) {
      updates.push('status = ?');
      params.push(status);
    }
    if (commission_earned !== undefined) {
      updates.push('commission_earned = ?');
      params.push(commission_earned);
    }
    if (placement_date !== undefined) {
      updates.push('placement_date = ?');
      params.push(placement_date);
    }

    if (updates.length === 0) {
      return c.json({
        success: false,
        error: 'No fields to update'
      }, 400);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(agentId, jobseekerId);

    const query = `
      UPDATE agent_jobseekers 
      SET ${updates.join(', ')}
      WHERE agent_id = ? AND jobseeker_id = ?
    `;

    const result = await c.env.DB.prepare(query).bind(...params).run();

    if (result.meta.changes === 0) {
      return c.json({
        success: false,
        error: 'Assignment not found'
      }, 404);
    }

    // If status changed to 'completed', update agent statistics
    if (status === 'completed') {
      await c.env.DB.prepare(
        `UPDATE agents 
         SET total_placements = total_placements + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).bind(agentId).run();

      // Recalculate success rate
      const stats = await c.env.DB.prepare(
        `SELECT 
           COUNT(*) as total,
           SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
         FROM agent_jobseekers
         WHERE agent_id = ?`
      ).bind(agentId).first();

      if (stats && stats.total > 0) {
        const successRate = ((stats.completed as number) / (stats.total as number)) * 100;
        await c.env.DB.prepare(
          'UPDATE agents SET success_rate = ? WHERE id = ?'
        ).bind(successRate, agentId).run();
      }
    }

    return c.json({
      success: true,
      message: 'Assignment updated successfully'
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return c.json({
      success: false,
      error: 'Failed to update assignment'
    }, 500);
  }
});

/**
 * Get agent statistics
 * GET /api/agents/stats
 */
agents.get('/stats', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    // Ensure user is an agent
    if (!user || user.user_type !== 'agent') {
      return c.json({
        success: false,
        error: 'Only agents can access this endpoint'
      }, 403);
    }

    // Get agent_id from agents table
    const agentResult = await c.env.DB.prepare(
      'SELECT id, total_placements, success_rate, commission_rate FROM agents WHERE user_id = ?'
    ).bind(user.id).first();

    if (!agentResult) {
      return c.json({
        success: false,
        error: 'Agent profile not found'
      }, 404);
    }

    const agentId = agentResult.id;

    // Get assignment statistics
    const assignmentStats = await c.env.DB.prepare(
      `SELECT 
         COUNT(*) as total_assigned,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
         SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
         SUM(commission_earned) as total_commission
       FROM agent_jobseekers
       WHERE agent_id = ?`
    ).bind(agentId).first();

    return c.json({
      success: true,
      stats: {
        total_placements: agentResult.total_placements || 0,
        success_rate: agentResult.success_rate || 0,
        commission_rate: agentResult.commission_rate || 0,
        total_assigned: assignmentStats?.total_assigned || 0,
        active_assignments: assignmentStats?.active || 0,
        inactive_assignments: assignmentStats?.inactive || 0,
        completed_assignments: assignmentStats?.completed || 0,
        total_commission: assignmentStats?.total_commission || 0
      }
    });
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch agent statistics'
    }, 500);
  }
});

/**
 * Get current agent's profile
 * GET /api/agents/profile
 */
agents.get('/profile', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    // Ensure user is an agent
    if (!user || user.user_type !== 'agent') {
      return c.json({
        success: false,
        error: 'Only agents can access this endpoint'
      }, 403);
    }

    // Get full agent profile
    const agentProfile = await c.env.DB.prepare(
      `SELECT 
        a.*,
        u.email,
        u.name as user_name
       FROM agents a
       INNER JOIN users u ON a.user_id = u.id
       WHERE a.user_id = ?`
    ).bind(user.id).first();

    if (!agentProfile) {
      return c.json({
        success: false,
        error: 'Agent profile not found'
      }, 404);
    }

    // Parse JSON fields
    const profile = {
      ...agentProfile,
      primary_regions: agentProfile.primary_regions ? JSON.parse(agentProfile.primary_regions as string) : [],
      language_skills: agentProfile.language_skills ? JSON.parse(agentProfile.language_skills as string) : {},
      service_areas: agentProfile.service_areas ? JSON.parse(agentProfile.service_areas as string) : [],
      certifications: agentProfile.certifications ? JSON.parse(agentProfile.certifications as string) : [],
      specialization: agentProfile.specialization ? JSON.parse(agentProfile.specialization as string) : [],
      countries_covered: agentProfile.countries_covered ? JSON.parse(agentProfile.countries_covered as string) : [],
      languages: agentProfile.languages ? JSON.parse(agentProfile.languages as string) : []
    };

    return c.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error fetching agent profile:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch agent profile'
    }, 500);
  }
});

/**
 * Update current agent's profile
 * PUT /api/agents/profile
 */
agents.put('/profile', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    // Ensure user is an agent
    if (!user || user.user_type !== 'agent') {
      return c.json({
        success: false,
        error: 'Only agents can update their profile'
      }, 403);
    }

    const body = await c.req.json();

    // Get agent_id
    const agentResult = await c.env.DB.prepare(
      'SELECT id FROM agents WHERE user_id = ?'
    ).bind(user.id).first();

    if (!agentResult) {
      return c.json({
        success: false,
        error: 'Agent profile not found'
      }, 404);
    }

    const agentId = agentResult.id;

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];

    // Basic fields
    if (body.agency_name !== undefined) {
      updates.push('agency_name = ?');
      params.push(body.agency_name);
    }
    if (body.license_number !== undefined) {
      updates.push('license_number = ?');
      params.push(body.license_number);
    }
    if (body.contact_phone !== undefined) {
      updates.push('contact_phone = ?');
      params.push(body.contact_phone);
    }
    if (body.contact_email !== undefined) {
      updates.push('contact_email = ?');
      params.push(body.contact_email);
    }
    if (body.experience_years !== undefined) {
      updates.push('experience_years = ?');
      params.push(body.experience_years);
    }
    if (body.introduction !== undefined) {
      updates.push('introduction = ?');
      params.push(body.introduction);
    }

    // JSON fields - store as JSON strings
    if (body.primary_regions !== undefined) {
      updates.push('primary_regions = ?');
      params.push(JSON.stringify(body.primary_regions));
    }
    if (body.language_skills !== undefined) {
      updates.push('language_skills = ?');
      params.push(JSON.stringify(body.language_skills));
    }
    if (body.service_areas !== undefined) {
      updates.push('service_areas = ?');
      params.push(JSON.stringify(body.service_areas));
    }
    if (body.certifications !== undefined) {
      updates.push('certifications = ?');
      params.push(JSON.stringify(body.certifications));
    }
    if (body.specialization !== undefined) {
      updates.push('specialization = ?');
      params.push(JSON.stringify(body.specialization));
    }
    if (body.countries_covered !== undefined) {
      updates.push('countries_covered = ?');
      params.push(JSON.stringify(body.countries_covered));
    }
    if (body.languages !== undefined) {
      updates.push('languages = ?');
      params.push(JSON.stringify(body.languages));
    }

    if (updates.length === 0) {
      return c.json({
        success: false,
        error: 'No fields to update'
      }, 400);
    }

    // Add updated_at timestamp
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(agentId);

    // Execute update
    const query = `
      UPDATE agents 
      SET ${updates.join(', ')}
      WHERE id = ?
    `;

    await c.env.DB.prepare(query).bind(...params).run();

    return c.json({
      success: true,
      message: 'Agent profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating agent profile:', error);
    return c.json({
      success: false,
      error: 'Failed to update agent profile'
    }, 500);
  }
});

export default agents;
