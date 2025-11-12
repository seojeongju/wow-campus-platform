// Job posting routes for WOW-CAMPUS Work Platform

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { Bindings, Variables } from '../types/env';
import type { JobSearchParams } from '../types/database';
import { authMiddleware, requireCompanyOrAdmin, optionalAuth } from '../middleware/auth';
import { buildPaginatedResponse, getCurrentTimestamp, buildJobSearchQuery } from '../utils/database';

const jobs = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get all job postings (public with optional auth for personalization)
jobs.get('/', optionalAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    
    // Parse query parameters
    const params: JobSearchParams = {
      keyword: c.req.query('keyword'),
      location: c.req.query('location'),
      job_category: c.req.query('job_category'),
      job_type: c.req.query('job_type'),
      salary_min: c.req.query('salary_min') ? parseInt(c.req.query('salary_min')!) : undefined,
      salary_max: c.req.query('salary_max') ? parseInt(c.req.query('salary_max')!) : undefined,
      experience_level: c.req.query('experience_level'),
      visa_sponsorship: c.req.query('visa_sponsorship') === 'true',
      page: parseInt(c.req.query('page') || '1'),
      limit: Math.min(parseInt(c.req.query('limit') || '10'), 100) // Max 100 items per page
    };
    
    // Build search query
    const { query: baseQuery, searchParams } = buildJobSearchQuery(params);
    
    // Add ordering and pagination
    const orderBy = c.req.query('sort') || 'created_at';
    const sortOrder = c.req.query('order') === 'asc' ? 'ASC' : 'DESC';
    
    const countQuery = baseQuery.replace(
      'SELECT jp.*, c.company_name, c.industry, c.company_size',
      'SELECT COUNT(*) as total'
    );
    
    const fullQuery = `${baseQuery} ORDER BY jp.${orderBy} ${sortOrder} LIMIT ? OFFSET ?`;
    
    // Get total count
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...searchParams)
      .first();
    
    const total = countResult?.total as number || 0;
    
    // Get paginated results
    const offset = (params.page! - 1) * params.limit!;
    const jobs = await c.env.DB.prepare(fullQuery)
      .bind(...searchParams, params.limit, offset)
      .all();
    
    // Update view counts for authenticated users
    if (currentUser && jobs.results.length > 0) {
      const jobIds = jobs.results.map(job => job.id).join(',');
      await c.env.DB.prepare(
        `UPDATE job_postings SET views_count = views_count + 1 WHERE id IN (${jobIds})`
      ).run();
    }
    
    return c.json({
      success: true,
      ...buildPaginatedResponse(jobs.results, total, params.page!, params.limit!)
    });
    
  } catch (error) {
    throw new HTTPException(500, { message: 'Failed to fetch job postings' });
  }
});

// Get single job posting by ID
jobs.get('/:id', optionalAuth, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const currentUser = c.get('user');
    
    const job = await c.env.DB.prepare(`
      SELECT jp.*, 
             c.company_name, c.industry, c.company_size, c.address, c.website,
             u.name as company_contact_name, u.email as company_contact_email,
             (SELECT COUNT(*) FROM applications WHERE job_posting_id = jp.id) as applications_count
      FROM job_postings jp
      LEFT JOIN companies c ON jp.company_id = c.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE jp.id = ? AND jp.status = 'active'
    `).bind(id).first();
    
    if (!job) {
      throw new HTTPException(404, { message: 'Job posting not found' });
    }
    
    // Update view count
    await c.env.DB.prepare(
      'UPDATE job_postings SET views_count = views_count + 1 WHERE id = ?'
    ).bind(id).run();
    
    // Check if current user has applied (if authenticated)
    let hasApplied = false;
    if (currentUser && currentUser.user_type === 'jobseeker') {
      const jobseeker = await c.env.DB.prepare(
        'SELECT id FROM jobseekers WHERE user_id = ?'
      ).bind(currentUser.id).first();
      
      if (jobseeker) {
        const application = await c.env.DB.prepare(
          'SELECT id FROM applications WHERE job_posting_id = ? AND jobseeker_id = ?'
        ).bind(id, jobseeker.id).first();
        
        hasApplied = !!application;
      }
    }
    
    return c.json({
      success: true,
      job,
      has_applied: hasApplied
    });
    
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Failed to fetch job posting' });
  }
});

// Create new job posting (company only)
jobs.post('/', authMiddleware, requireCompanyOrAdmin, async (c) => {
  try {
    const currentUser = c.get('user');
    const jobData = await c.req.json();
    
    // Get company ID for current user
    let companyId: number;
    
    if (currentUser!.user_type === 'admin') {
      companyId = jobData.company_id;
      if (!companyId) {
        throw new HTTPException(400, { message: 'company_id is required for admin' });
      }
    } else {
      const company = await c.env.DB.prepare(
        'SELECT id FROM companies WHERE user_id = ?'
      ).bind(currentUser!.id).first();
      
      if (!company) {
        throw new HTTPException(404, { message: 'Company profile not found' });
      }
      
      companyId = company.id as number;
    }
    
    // Validate required fields
    const {
      title, description, job_type, job_category, location,
      requirements, responsibilities, salary_min, salary_max,
      visa_sponsorship, korean_required, experience_level,
      education_required, skills_required, benefits,
      application_deadline, positions_available, status
    } = jobData;
    
    if (!title || !description || !job_type || !job_category || !location) {
      throw new HTTPException(400, { 
        message: 'Title, description, job_type, job_category, and location are required' 
      });
    }
    
    // Validate status (must be 'active' or 'draft')
    const jobStatus = status === 'draft' ? 'draft' : 'active';
    
    // Clean and validate data
    const cleanedData = {
      companyId,
      title: title?.trim(),
      description: description?.trim(),
      requirements: requirements?.trim() || null,
      responsibilities: responsibilities?.trim() || null,
      job_type,
      job_category,
      location: location?.trim(),
      salary_min: salary_min || null,
      salary_max: salary_max || null,
      visa_sponsorship: visa_sponsorship ? 1 : 0,
      korean_required: korean_required ? 1 : 0,
      experience_level: experience_level?.trim() || null,
      education_required: education_required?.trim() || null,
      skills_required: skills_required ? JSON.stringify(skills_required) : null,
      benefits: benefits?.trim() || null,
      application_deadline: application_deadline?.trim() || null,
      positions_available: positions_available || 1,
      status: jobStatus
    };
    
    console.log('Creating job posting with cleaned data:', cleanedData);
    
    // Create job posting
    const result = await c.env.DB.prepare(`
      INSERT INTO job_postings (
        company_id, title, description, requirements, responsibilities,
        job_type, job_category, location, salary_min, salary_max, currency,
        visa_sponsorship, korean_required, experience_level, education_required,
        skills_required, benefits, application_deadline, positions_available,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      cleanedData.companyId,
      cleanedData.title,
      cleanedData.description,
      cleanedData.requirements,
      cleanedData.responsibilities,
      cleanedData.job_type,
      cleanedData.job_category,
      cleanedData.location,
      cleanedData.salary_min,
      cleanedData.salary_max,
      'KRW',
      cleanedData.visa_sponsorship,
      cleanedData.korean_required,
      cleanedData.experience_level,
      cleanedData.education_required,
      cleanedData.skills_required,
      cleanedData.benefits,
      cleanedData.application_deadline,
      cleanedData.positions_available,
      cleanedData.status,
      getCurrentTimestamp(),
      getCurrentTimestamp()
    ).run();
    
    if (!result.success) {
      throw new HTTPException(500, { message: 'Failed to create job posting' });
    }
    
    // Get created job posting
    const createdJob = await c.env.DB.prepare(
      'SELECT * FROM job_postings WHERE id = ?'
    ).bind(result.meta.last_row_id).first();
    
    return c.json({
      success: true,
      message: 'Job posting created successfully',
      job: createdJob
    }, 201);
    
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Job posting creation error:', error);
    throw new HTTPException(500, { 
      message: 'Failed to create job posting',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update job posting (company owner or admin)
jobs.put('/:id', authMiddleware, requireCompanyOrAdmin, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const currentUser = c.get('user');
    const updateData = await c.req.json();
    
    // Check if job posting exists and user has permission
    const job = await c.env.DB.prepare(`
      SELECT jp.*, c.user_id as company_user_id
      FROM job_postings jp
      LEFT JOIN companies c ON jp.company_id = c.id
      WHERE jp.id = ?
    `).bind(id).first();
    
    if (!job) {
      throw new HTTPException(404, { message: 'Job posting not found' });
    }
    
    // Check ownership (unless admin)
    if (currentUser!.user_type !== 'admin' && job.company_user_id !== currentUser!.id) {
      throw new HTTPException(403, { message: 'Not authorized to update this job posting' });
    }
    
    // Update job posting
    const fields = [
      'title', 'description', 'requirements', 'responsibilities',
      'job_type', 'job_category', 'location', 'salary_min', 'salary_max',
      'visa_sponsorship', 'korean_required', 'experience_level',
      'education_required', 'benefits', 'application_deadline',
      'positions_available', 'status'
    ];
    
    const updates: string[] = [];
    const values: any[] = [];
    
    fields.forEach(field => {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = ?`);
        if (field === 'skills_required' && Array.isArray(updateData[field])) {
          values.push(JSON.stringify(updateData[field]));
        } else if (field === 'visa_sponsorship' || field === 'korean_required') {
          values.push(updateData[field] ? 1 : 0);
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
      `UPDATE job_postings SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();
    
    // Get updated job posting
    const updatedJob = await c.env.DB.prepare(
      'SELECT * FROM job_postings WHERE id = ?'
    ).bind(id).first();
    
    return c.json({
      success: true,
      message: 'Job posting updated successfully',
      job: updatedJob
    });
    
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Failed to update job posting' });
  }
});

// Delete job posting (company owner or admin)
jobs.delete('/:id', authMiddleware, requireCompanyOrAdmin, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const currentUser = c.get('user');
    
    // Check if job posting exists and user has permission
    const job = await c.env.DB.prepare(`
      SELECT jp.*, c.user_id as company_user_id
      FROM job_postings jp
      LEFT JOIN companies c ON jp.company_id = c.id
      WHERE jp.id = ?
    `).bind(id).first();
    
    if (!job) {
      throw new HTTPException(404, { message: 'Job posting not found' });
    }
    
    // Check ownership (unless admin)
    if (currentUser!.user_type !== 'admin' && job.company_user_id !== currentUser!.id) {
      throw new HTTPException(403, { message: 'Not authorized to delete this job posting' });
    }
    
    // Soft delete by updating status
    await c.env.DB.prepare(
      'UPDATE job_postings SET status = ?, updated_at = ? WHERE id = ?'
    ).bind('closed', getCurrentTimestamp(), id).run();
    
    return c.json({
      success: true,
      message: 'Job posting deleted successfully'
    });
    
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Failed to delete job posting' });
  }
});

// Get company's job postings
jobs.get('/company/:companyId', async (c) => {
  try {
    const companyId = parseInt(c.req.param('companyId'));
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '100'), 100);
    const status = c.req.query('status') || 'active';
    
    const offset = (page - 1) * limit;
    
    // Build query based on status filter
    let countQuery = 'SELECT COUNT(*) as total FROM job_postings WHERE company_id = ?';
    let selectQuery = `
      SELECT jp.*, c.company_name
      FROM job_postings jp
      LEFT JOIN companies c ON jp.company_id = c.id
      WHERE jp.company_id = ?
    `;
    
    const queryParams: any[] = [companyId];
    
    // Add status filter if not 'all'
    if (status !== 'all') {
      countQuery += ' AND status = ?';
      selectQuery += ' AND jp.status = ?';
      queryParams.push(status);
    }
    
    // Get total count
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...queryParams)
      .first();
    
    const total = countResult?.total as number || 0;
    
    // Get job postings
    selectQuery += ' ORDER BY jp.created_at DESC LIMIT ? OFFSET ?';
    const jobs = await c.env.DB.prepare(selectQuery)
      .bind(...queryParams, limit, offset)
      .all();
    
    return c.json({
      success: true,
      ...buildPaginatedResponse(jobs.results, total, page, limit)
    });
    
  } catch (error) {
    console.error('Company jobs fetch error:', error);
    throw new HTTPException(500, { message: 'Failed to fetch company job postings' });
  }
});

export default jobs;