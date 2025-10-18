import { Hono } from 'hono';
import { authMiddleware, requireAgent } from '../middleware/auth';
import type { Env } from '../types';

const agents = new Hono<{ Bindings: Env }>();

// Apply authentication middleware to all agent routes
agents.use('*', authMiddleware);
agents.use('*', requireAgent);

/**
 * Get all jobseekers assigned to the current agent
 * GET /api/agents/jobseekers
 */
agents.get('/jobseekers', async (c) => {
  try {
    const user = c.get('user');
    
    // Ensure user is an agent
    if (user.user_type !== 'agent') {
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
        totalPages: Math.ceil(total / limit)
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
 * Assign a jobseeker to the current agent
 * POST /api/agents/jobseekers/:jobseekerId/assign
 */
agents.post('/jobseekers/:jobseekerId/assign', async (c) => {
  try {
    const user = c.get('user');
    
    // Ensure user is an agent
    if (user.user_type !== 'agent') {
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
agents.delete('/jobseekers/:jobseekerId/unassign', async (c) => {
  try {
    const user = c.get('user');
    
    // Ensure user is an agent
    if (user.user_type !== 'agent') {
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
agents.patch('/jobseekers/:jobseekerId/assignment', async (c) => {
  try {
    const user = c.get('user');
    
    // Ensure user is an agent
    if (user.user_type !== 'agent') {
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
        const successRate = (stats.completed / stats.total) * 100;
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
agents.get('/stats', async (c) => {
  try {
    const user = c.get('user');
    
    // Ensure user is an agent
    if (user.user_type !== 'agent') {
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
 * Search available jobseekers to assign (not currently assigned to this agent)
 * GET /api/agents/available-jobseekers
 */
agents.get('/available-jobseekers', async (c) => {
  try {
    const user = c.get('user');
    
    // Ensure user is an agent
    if (user.user_type !== 'agent') {
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

    // Get query parameters
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const search = c.req.query('search') || '';
    const offset = (page - 1) * limit;

    // Build search query
    let whereClause = `WHERE j.id NOT IN (
      SELECT jobseeker_id FROM agent_jobseekers 
      WHERE agent_id = ? AND status = 'active'
    )`;
    const queryParams: any[] = [agentId];

    if (search) {
      whereClause += ` AND (j.first_name LIKE ? OR j.last_name LIKE ? OR j.nationality LIKE ?)`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Count total available jobseekers
    const countQuery = `SELECT COUNT(*) as total FROM jobseekers j ${whereClause}`;
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...queryParams)
      .first();
    const total = countResult?.total || 0;

    // Get available jobseekers
    const jobseekersQuery = `
      SELECT j.* 
      FROM jobseekers j
      ${whereClause}
      ORDER BY j.created_at DESC
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
        totalPages: Math.ceil(total / limit)
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
 * Get current agent's profile
 * GET /api/agents/profile
 */
agents.get('/profile', async (c) => {
  try {
    const user = c.get('user');
    
    // Ensure user is an agent
    if (user.user_type !== 'agent') {
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
      primary_regions: agentProfile.primary_regions ? JSON.parse(agentProfile.primary_regions) : [],
      language_skills: agentProfile.language_skills ? JSON.parse(agentProfile.language_skills) : {},
      service_areas: agentProfile.service_areas ? JSON.parse(agentProfile.service_areas) : [],
      certifications: agentProfile.certifications ? JSON.parse(agentProfile.certifications) : [],
      specialization: agentProfile.specialization ? JSON.parse(agentProfile.specialization) : [],
      countries_covered: agentProfile.countries_covered ? JSON.parse(agentProfile.countries_covered) : [],
      languages: agentProfile.languages ? JSON.parse(agentProfile.languages) : []
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
agents.put('/profile', async (c) => {
  try {
    const user = c.get('user');
    
    // Ensure user is an agent
    if (user.user_type !== 'agent') {
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

    // Return updated profile
    const updatedProfile = await c.env.DB.prepare(
      `SELECT 
        a.*,
        u.email,
        u.name as user_name
       FROM agents a
       INNER JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`
    ).bind(agentId).first();

    // Parse JSON fields
    const profile = {
      ...updatedProfile,
      primary_regions: updatedProfile.primary_regions ? JSON.parse(updatedProfile.primary_regions) : [],
      language_skills: updatedProfile.language_skills ? JSON.parse(updatedProfile.language_skills) : {},
      service_areas: updatedProfile.service_areas ? JSON.parse(updatedProfile.service_areas) : [],
      certifications: updatedProfile.certifications ? JSON.parse(updatedProfile.certifications) : [],
      specialization: updatedProfile.specialization ? JSON.parse(updatedProfile.specialization) : [],
      countries_covered: updatedProfile.countries_covered ? JSON.parse(updatedProfile.countries_covered) : [],
      languages: updatedProfile.languages ? JSON.parse(updatedProfile.languages) : []
    };

    return c.json({
      success: true,
      message: 'Profile updated successfully',
      profile
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
