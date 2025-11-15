// Applications routes for WOW-CAMPUS Work Platform

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { Bindings, Variables } from '../types/env';
import { authMiddleware, requireJobseekerOrAdmin } from '../middleware/auth';
import { getCurrentTimestamp } from '../utils/database';

const applications = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply to a job posting
applications.post('/', authMiddleware, async (c) => {
  try {
    const currentUser = c.get('user');
    
    // Only jobseekers can apply
    if (currentUser.user_type !== 'jobseeker') {
      throw new HTTPException(403, { 
        message: '구직자만 지원할 수 있습니다.' 
      });
    }
    
    const { job_posting_id, cover_letter } = await c.req.json();
    
    if (!job_posting_id) {
      throw new HTTPException(400, { 
        message: '지원할 공고를 선택해주세요.' 
      });
    }
    
    // Get jobseeker ID
    const jobseekerRecord = await c.env.DB.prepare(
      'SELECT id FROM jobseekers WHERE user_id = ?'
    ).bind(currentUser.id).first();
    
    if (!jobseekerRecord) {
      throw new HTTPException(404, { 
        message: '구직자 프로필이 없습니다. 프로필을 먼저 작성해주세요.' 
      });
    }
    
    const jobseekerId = jobseekerRecord.id;
    
    // Check if job posting exists and is active
    const jobPosting = await c.env.DB.prepare(
      "SELECT id, status FROM job_postings WHERE id = ? AND status = 'active'"
    ).bind(job_posting_id).first();
    
    if (!jobPosting) {
      throw new HTTPException(404, { 
        message: '해당 채용공고를 찾을 수 없거나 마감되었습니다.' 
      });
    }
    
    // Check if already applied
    const existingApplication = await c.env.DB.prepare(
      'SELECT id FROM applications WHERE job_posting_id = ? AND jobseeker_id = ?'
    ).bind(job_posting_id, jobseekerId).first();
    
    if (existingApplication) {
      throw new HTTPException(409, { 
        message: '이미 지원한 공고입니다.' 
      });
    }
    
    // Create application
    const result = await c.env.DB.prepare(`
      INSERT INTO applications (
        job_posting_id, jobseeker_id, status, cover_letter, applied_at, updated_at
      ) VALUES (?, ?, 'submitted', ?, ?, ?)
    `).bind(
      job_posting_id, 
      jobseekerId, 
      cover_letter || null,
      getCurrentTimestamp(),
      getCurrentTimestamp()
    ).run();
    
    if (!result.success) {
      throw new HTTPException(500, { 
        message: '지원 처리 중 오류가 발생했습니다.' 
      });
    }
    
    // Increment job posting applications_count
    try {
      await c.env.DB.prepare(`
        UPDATE job_postings 
        SET applications_count = COALESCE(applications_count, 0) + 1 
        WHERE id = ?
      `).bind(job_posting_id).run();
    } catch (error) {
      // Log error but don't fail the application
      console.error('Failed to update applications_count:', error);
    }
    
    return c.json({
      success: true,
      message: '지원이 완료되었습니다!',
      application_id: result.meta.last_row_id
    }, 201);
    
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Application submission error:', error);
    throw new HTTPException(500, { 
      message: '지원 처리 중 오류가 발생했습니다.' 
    });
  }
});

// Get all applications for current user
applications.get('/', authMiddleware, async (c) => {
  try {
    const currentUser = c.get('user');
    
    let applications;
    
    if (currentUser.user_type === 'jobseeker') {
      // Get jobseeker's applications
      const jobseekerRecord = await c.env.DB.prepare(
        'SELECT id FROM jobseekers WHERE user_id = ?'
      ).bind(currentUser.id).first();
      
      if (!jobseekerRecord) {
        return c.json({
          success: true,
          applications: []
        });
      }
      
      const result = await c.env.DB.prepare(`
        SELECT 
          a.*,
          jp.title as job_title,
          jp.location,
          jp.salary_min,
          jp.salary_max,
          c.company_name
        FROM applications a
        LEFT JOIN job_postings jp ON a.job_posting_id = jp.id
        LEFT JOIN companies c ON jp.company_id = c.id
        WHERE a.jobseeker_id = ?
        ORDER BY a.applied_at DESC
      `).bind(jobseekerRecord.id).all();
      
      applications = result.results;
      
    } else if (currentUser.user_type === 'company') {
      // Get applications to company's job postings
      const companyRecord = await c.env.DB.prepare(
        'SELECT id FROM companies WHERE user_id = ?'
      ).bind(currentUser.id).first();
      
      if (!companyRecord) {
        return c.json({
          success: true,
          applications: []
        });
      }
      
      const result = await c.env.DB.prepare(`
        SELECT 
          a.*,
          jp.title as job_title,
          js.first_name,
          js.last_name,
          js.nationality,
          js.experience_years,
          js.korean_level,
          u.email,
          u.phone
        FROM applications a
        LEFT JOIN job_postings jp ON a.job_posting_id = jp.id
        LEFT JOIN jobseekers js ON a.jobseeker_id = js.id
        LEFT JOIN users u ON js.user_id = u.id
        WHERE jp.company_id = ?
        ORDER BY a.applied_at DESC
      `).bind(companyRecord.id).all();
      
      applications = result.results;
      
    } else if (currentUser.user_type === 'admin') {
      // Admin sees all applications
      const result = await c.env.DB.prepare(`
        SELECT 
          a.*,
          jp.title as job_title,
          c.company_name,
          js.first_name,
          js.last_name,
          u.email
        FROM applications a
        LEFT JOIN job_postings jp ON a.job_posting_id = jp.id
        LEFT JOIN companies c ON jp.company_id = c.id
        LEFT JOIN jobseekers js ON a.jobseeker_id = js.id
        LEFT JOIN users u ON js.user_id = u.id
        ORDER BY a.applied_at DESC
        LIMIT 100
      `).all();
      
      applications = result.results;
      
    } else {
      return c.json({
        success: true,
        applications: []
      });
    }
    
    return c.json({
      success: true,
      applications: applications || []
    });
    
  } catch (error) {
    console.error('Applications fetch error:', error);
    throw new HTTPException(500, { 
      message: 'Failed to fetch applications' 
    });
  }
});

// Get single application detail (company or admin only)
applications.get('/:id', authMiddleware, async (c) => {
  try {
    const applicationId = parseInt(c.req.param('id'));
    const currentUser = c.get('user');
    
    // Get application with all related information
    const application = await c.env.DB.prepare(`
      SELECT 
        a.*,
        jp.title as job_title,
        jp.location as job_location,
        jp.salary_min,
        jp.salary_max,
        jp.company_id,
        js.first_name,
        js.last_name,
        js.nationality,
        js.experience_years,
        js.korean_level,
        js.education,
        js.major,
        js.school,
        js.birth_date,
        js.gender,
        js.address,
        js.skills,
        js.certifications,
        js.languages,
        js.work_eligibility,
        js.visa_status,
        js.available_start_date,
        js.expected_salary,
        js.bio,
        u.email,
        u.phone,
        c.company_name
      FROM applications a
      LEFT JOIN job_postings jp ON a.job_posting_id = jp.id
      LEFT JOIN jobseekers js ON a.jobseeker_id = js.id
      LEFT JOIN users u ON js.user_id = u.id
      LEFT JOIN companies c ON jp.company_id = c.id
      WHERE a.id = ?
    `).bind(applicationId).first();
    
    if (!application) {
      throw new HTTPException(404, { 
        message: '지원 내역을 찾을 수 없습니다.' 
      });
    }
    
    // Check permission
    let hasPermission = false;
    
    if (currentUser.user_type === 'admin') {
      hasPermission = true;
    } else if (currentUser.user_type === 'company') {
      const companyRecord = await c.env.DB.prepare(
        'SELECT id FROM companies WHERE user_id = ?'
      ).bind(currentUser.id).first();
      
      if (companyRecord && companyRecord.id === application.company_id) {
        hasPermission = true;
      }
    } else if (currentUser.user_type === 'jobseeker') {
      // Jobseeker can only view their own applications
      const jobseekerRecord = await c.env.DB.prepare(
        'SELECT id FROM jobseekers WHERE user_id = ?'
      ).bind(currentUser.id).first();
      
      if (jobseekerRecord && jobseekerRecord.id === application.jobseeker_id) {
        hasPermission = true;
      }
    }
    
    if (!hasPermission) {
      throw new HTTPException(403, { 
        message: '이 지원 내역을 볼 권한이 없습니다.' 
      });
    }
    
    return c.json({
      success: true,
      application: application
    });
    
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Application detail fetch error:', error);
    throw new HTTPException(500, { 
      message: '지원 내역 조회 중 오류가 발생했습니다.' 
    });
  }
});

// Update application status (company or admin only)
applications.patch('/:id', authMiddleware, async (c) => {
  try {
    const applicationId = parseInt(c.req.param('id'));
    const currentUser = c.get('user');
    const { status, interview_date, feedback, rejection_reason } = await c.req.json();
    
    // Get application details
    const application = await c.env.DB.prepare(`
      SELECT a.*, jp.company_id
      FROM applications a
      LEFT JOIN job_postings jp ON a.job_posting_id = jp.id
      WHERE a.id = ?
    `).bind(applicationId).first();
    
    if (!application) {
      throw new HTTPException(404, { 
        message: 'Application not found' 
      });
    }
    
    // Check permission
    let hasPermission = false;
    
    if (currentUser.user_type === 'admin') {
      hasPermission = true;
    } else if (currentUser.user_type === 'company') {
      const companyRecord = await c.env.DB.prepare(
        'SELECT id FROM companies WHERE user_id = ?'
      ).bind(currentUser.id).first();
      
      if (companyRecord && companyRecord.id === application.company_id) {
        hasPermission = true;
      }
    }
    
    if (!hasPermission) {
      throw new HTTPException(403, { 
        message: 'Not authorized to update this application' 
      });
    }
    
    // Update application
    const updates: string[] = [];
    const values: any[] = [];
    
    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    
    if (interview_date) {
      updates.push('interview_date = ?');
      values.push(interview_date);
    }
    
    if (feedback) {
      updates.push('feedback = ?');
      values.push(feedback);
    }
    
    if (rejection_reason) {
      updates.push('rejection_reason = ?');
      values.push(rejection_reason);
    }
    
    updates.push('updated_at = ?');
    values.push(getCurrentTimestamp());
    updates.push('reviewed_by = ?');
    values.push(currentUser.id);
    
    values.push(applicationId);
    
    await c.env.DB.prepare(
      `UPDATE applications SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();
    
    return c.json({
      success: true,
      message: 'Application updated successfully'
    });
    
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Application update error:', error);
    throw new HTTPException(500, { 
      message: 'Failed to update application' 
    });
  }
});

export default applications;
