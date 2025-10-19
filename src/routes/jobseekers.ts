// Job seeker routes for WOW-CAMPUS Work Platform

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { Bindings, Variables } from '../types/env';
import { authMiddleware, requireJobseekerOrAdmin, optionalAuth } from '../middleware/auth';
import { buildPaginatedResponse, getCurrentTimestamp } from '../utils/database';

const jobseekers = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get all job seekers (requires authentication)
jobseekers.get('/', authMiddleware, async (c) => {
  try {
    const currentUser = c.get('user');
    
    // Parse query parameters
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '10'), 100); // Max 100 items per page
    const status = c.req.query('status') || 'active';
    const location = c.req.query('location');
    const skills = c.req.query('skills');
    const experience_level = c.req.query('experience_level');
    const visa_status = c.req.query('visa_status');
    
    // Build query conditions
    const conditions: string[] = [];
    const params: any[] = [];
    
    if (location) {
      conditions.push('js.preferred_location LIKE ?');
      params.push(`%${location}%`);
    }
    
    if (skills) {
      conditions.push('js.skills LIKE ?');
      params.push(`%${skills}%`);
    }
    
    if (experience_level) {
      conditions.push('js.experience_level = ?');
      params.push(experience_level);
    }
    
    if (visa_status) {
      conditions.push('js.visa_status = ?');
      params.push(visa_status);
    }
    
    // Get total count
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobseekers js
      LEFT JOIN users u ON js.user_id = u.id
      ${whereClause}
    `;
    
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...params)
      .first();
    
    const total = countResult?.total as number || 0;
    
    // Get paginated results
    const offset = (page - 1) * limit;
    const orderBy = c.req.query('sort') || 'created_at';
    const sortOrder = c.req.query('order') === 'asc' ? 'ASC' : 'DESC';
    
    const query = `
      SELECT js.*, 
             u.name, u.email, u.phone,
             (SELECT COUNT(*) FROM applications WHERE jobseeker_id = js.id) as applications_count
      FROM jobseekers js
      LEFT JOIN users u ON js.user_id = u.id
      ${whereClause}
      ORDER BY js.${orderBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    const jobseekers = await c.env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all();
    
    // Filter sensitive information based on user type
    const filteredJobseekers = jobseekers.results?.map((js: any) => {
      // Admin can see all information
      if (currentUser?.user_type === 'admin') {
        return js;
      }
      
      // Own profile - full access
      if (currentUser?.id === js.user_id) {
        return js;
      }
      
      // Other users - hide sensitive information
      return {
        ...js,
        email: null,
        phone: null,
        current_location: js.current_location ? js.current_location.split(' ')[0] : null, // Only show city
        birth_date: null,
        resume_url: null,
        portfolio_url: null
      };
    });
    
    return c.json({
      success: true,
      ...buildPaginatedResponse(filteredJobseekers, total, page, limit)
    });
    
  } catch (error) {
    console.error('Job seekers fetch error:', error);
    throw new HTTPException(500, { message: 'Failed to fetch job seekers' });
  }
});

// Get single job seeker by ID (requires authentication)
jobseekers.get('/:id', authMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const currentUser = c.get('user');
    
    const jobseeker = await c.env.DB.prepare(`
      SELECT js.*, 
             u.name, u.email, u.phone,
             (SELECT COUNT(*) FROM applications WHERE jobseeker_id = js.id) as applications_count
      FROM jobseekers js
      LEFT JOIN users u ON js.user_id = u.id
      WHERE js.id = ?
    `).bind(id).first();
    
    if (!jobseeker) {
      throw new HTTPException(404, { message: 'Job seeker not found' });
    }
    
    // Filter sensitive information
    let filteredJobseeker = jobseeker;
    if (currentUser.user_type !== 'admin' && currentUser.id !== jobseeker.user_id) {
      // Hide sensitive information from other users
      filteredJobseeker = {
        ...jobseeker,
        email: null,
        phone: null,
        current_location: jobseeker.current_location ? jobseeker.current_location.split(' ')[0] : null,
        birth_date: null,
        resume_url: null,
        portfolio_url: null
      };
    }
    
    // Get recent applications (only for own profile or admin)
    let recentApplications = [];
    if (currentUser.user_type === 'admin' || currentUser.id === jobseeker.user_id) {
      const applications = await c.env.DB.prepare(`
        SELECT a.*, jp.title as job_title, c.company_name
        FROM applications a
        LEFT JOIN job_postings jp ON a.job_posting_id = jp.id
        LEFT JOIN companies c ON jp.company_id = c.id
        WHERE a.jobseeker_id = ?
        ORDER BY a.applied_at DESC
        LIMIT 5
      `).bind(id).all();
      
      recentApplications = applications.results;
    }
    
    return c.json({
      success: true,
      jobseeker: filteredJobseeker,
      recent_applications: recentApplications
    });
    
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Failed to fetch job seeker' });
  }
});

// Create job seeker profile (authenticated user only)
jobseekers.post('/', authMiddleware, async (c) => {
  try {
    const currentUser = c.get('user');
    const jobseekerData = await c.req.json();
    
    // Check if user already has a job seeker profile
    const existing = await c.env.DB.prepare(
      'SELECT id FROM jobseekers WHERE user_id = ?'
    ).bind(currentUser!.id).first();
    
    if (existing) {
      throw new HTTPException(409, { message: 'Job seeker profile already exists' });
    }
    
    // Validate required fields
    const {
      first_name, last_name, birth_date, nationality, visa_status, korean_level, 
      english_level, education_level, major, experience_years, skills, 
      preferred_location, salary_expectation, available_start_date,
      resume_url, portfolio_url, gender, current_location, bio
    } = jobseekerData;
    
    if (!first_name || !last_name) {
      throw new HTTPException(400, { 
        message: 'First name and last name are required' 
      });
    }
    
    // Create job seeker profile
    const result = await c.env.DB.prepare(`
      INSERT INTO jobseekers (
        user_id, first_name, last_name, birth_date, nationality, visa_status, 
        korean_level, english_level, education_level, major, experience_years, 
        skills, preferred_location, salary_expectation, available_start_date,
        resume_url, portfolio_url, gender, current_location, bio,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      currentUser!.id, first_name, last_name, birth_date, nationality, visa_status, 
      korean_level, english_level, education_level, major, experience_years || 0,
      skills ? JSON.stringify(skills) : null,
      preferred_location, salary_expectation, available_start_date,
      resume_url, portfolio_url, gender, current_location, bio,
      getCurrentTimestamp(), getCurrentTimestamp()
    ).run();
    
    if (!result.success) {
      throw new HTTPException(500, { message: 'Failed to create job seeker profile' });
    }
    
    // Get created profile
    const createdProfile = await c.env.DB.prepare(
      'SELECT * FROM jobseekers WHERE id = ?'
    ).bind(result.meta.last_row_id).first();
    
    return c.json({
      success: true,
      message: 'Job seeker profile created successfully',
      jobseeker: createdProfile
    }, 201);
    
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Failed to create job seeker profile' });
  }
});

// Update job seeker profile (owner or admin only)
jobseekers.put('/:id', authMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const currentUser = c.get('user');
    const updateData = await c.req.json();
    
    // Check if profile exists and user has permission
    const jobseeker = await c.env.DB.prepare(
      'SELECT * FROM jobseekers WHERE id = ?'
    ).bind(id).first();
    
    if (!jobseeker) {
      throw new HTTPException(404, { message: 'Job seeker profile not found' });
    }
    
    // Check ownership (unless admin)
    if (currentUser!.user_type !== 'admin' && jobseeker.user_id !== currentUser!.id) {
      throw new HTTPException(403, { message: 'Not authorized to update this profile' });
    }
    
    // Update profile
    const fields = [
      'first_name', 'last_name', 'birth_date', 'nationality', 'visa_status', 
      'korean_level', 'english_level', 'education_level', 'major', 'experience_years', 
      'preferred_location', 'salary_expectation', 'available_start_date',
      'resume_url', 'portfolio_url', 'gender', 'current_location', 'bio'
    ];
    
    const updates: string[] = [];
    const values: any[] = [];
    
    fields.forEach(field => {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = ?`);
        if (field === 'skills' && Array.isArray(updateData[field])) {
          values.push(JSON.stringify(updateData[field]));
        } else {
          values.push(updateData[field]);
        }
      }
    });
    
    if (updates.length === 0) {
      return c.json({
        success: true,
        message: 'No changes to update'
      });
    }
    
    updates.push('updated_at = ?');
    values.push(getCurrentTimestamp(), id);
    
    await c.env.DB.prepare(
      `UPDATE jobseekers SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();
    
    // Get updated profile
    const updatedProfile = await c.env.DB.prepare(
      'SELECT * FROM jobseekers WHERE id = ?'
    ).bind(id).first();
    
    return c.json({
      success: true,
      message: 'Profile updated successfully',
      jobseeker: updatedProfile
    });
    
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Failed to update profile' });
  }
});

export default jobseekers;