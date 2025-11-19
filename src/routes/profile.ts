// Profile routes for WOW-CAMPUS Work Platform

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { Bindings, Variables } from '../types/env';
import { authMiddleware, requireCompany } from '../middleware/auth';
import { getCurrentTimestamp } from '../utils/database';

const profile = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get company profile
profile.get('/company', authMiddleware, requireCompany, async (c) => {
  try {
    const user = c.get('user');
    
    // Get company profile
    const companyProfile = await c.env.DB.prepare(`
      SELECT * FROM companies WHERE user_id = ?
    `).bind(user.id).first();
    
    if (!companyProfile) {
      return c.json({
        success: false,
        message: '기업 프로필을 찾을 수 없습니다.'
      }, 404);
    }
    
    return c.json({
      success: true,
      profile: companyProfile
    });
  } catch (error) {
    console.error('기업 프로필 조회 오류:', error);
    return c.json({
      success: false,
      message: '프로필 조회에 실패했습니다.'
    }, 500);
  }
});

// Update company profile
profile.put('/company', authMiddleware, requireCompany, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    
    const {
      company_name,
      business_number,
      industry,
      company_size,
      founded_year,
      website,
      address,
      description,
      phone,
      email,
      logo_url,
      // Legacy recruitment fields (still supported)
      representative_name,
      recruitment_positions,
      recruitment_count,
      employment_types,
      minimum_salary,
      required_qualifications,
      support_items,
      // Phase 3A: New job posting detail fields (14 fields)
      e7_visa_code,
      e7_visa_job_name,
      job_title_ko,
      job_title_en,
      job_responsibilities,
      salary_min,
      salary_max,
      contract_type,
      visa_support_level,
      visa_support_details,
      housing_support_type,
      housing_support_amount,
      settlement_support
    } = body;
    
    // Validate required fields
    if (!company_name) {
      return c.json({
        success: false,
        message: '회사명은 필수입니다.'
      }, 400);
    }
    
    if (!representative_name) {
      return c.json({
        success: false,
        message: '대표자명은 필수입니다.'
      }, 400);
    }
    
    // Phase 3A: E-7 visa code validation
    if (e7_visa_code) {
      // Validate E-7 code format (e.g., E-7-1-01-001)
      const e7CodePattern = /^E-7-[1-4](-\d{2})?(-\d{3})?$/;
      if (!e7CodePattern.test(e7_visa_code)) {
        return c.json({
          success: false,
          message: 'E-7 비자 직종 코드 형식이 올바르지 않습니다.'
        }, 400);
      }
      
      // Validate minimum salary based on E-7 category
      if (salary_min !== undefined) {
        let minRequiredSalary = 0;
        
        if (e7_visa_code.startsWith('E-7-1')) {
          minRequiredSalary = 4405; // E-7-1: 44,051,000 won (in 만원)
        } else if (e7_visa_code.startsWith('E-7-2') || e7_visa_code.startsWith('E-7-3')) {
          minRequiredSalary = 2515; // E-7-2/3: 25,150,000 won (in 만원)
        } else if (e7_visa_code.startsWith('E-7-4')) {
          minRequiredSalary = 2600; // E-7-4: 26,000,000 won (in 만원)
        }
        
        if (salary_min < minRequiredSalary) {
          return c.json({
            success: false,
            message: `E-7 비자 ${e7_visa_code} 직종은 최소 연봉 ${minRequiredSalary}만원 이상이어야 합니다.`
          }, 400);
        }
      }
    }
    
    // Check if company exists
    const existingCompany = await c.env.DB.prepare(`
      SELECT id FROM companies WHERE user_id = ?
    `).bind(user.id).first();
    
    if (!existingCompany) {
      return c.json({
        success: false,
        message: '기업 프로필을 찾을 수 없습니다.'
      }, 404);
    }
    
    // Update company profile with all fields including Phase 3A job posting fields
    const result = await c.env.DB.prepare(`
      UPDATE companies 
      SET company_name = ?,
          business_number = ?,
          industry = ?,
          company_size = ?,
          founded_year = ?,
          website = ?,
          address = ?,
          description = ?,
          phone = ?,
          email = ?,
          logo_url = ?,
          representative_name = ?,
          recruitment_positions = ?,
          recruitment_count = ?,
          employment_types = ?,
          minimum_salary = ?,
          required_qualifications = ?,
          support_items = ?,
          e7_visa_code = ?,
          e7_visa_job_name = ?,
          job_title_ko = ?,
          job_title_en = ?,
          job_responsibilities = ?,
          salary_min = ?,
          salary_max = ?,
          contract_type = ?,
          visa_support_level = ?,
          visa_support_details = ?,
          housing_support_type = ?,
          housing_support_amount = ?,
          settlement_support = ?,
          updated_at = ?
      WHERE user_id = ?
    `).bind(
      company_name,
      business_number || null,
      industry || null,
      company_size || null,
      founded_year || null,
      website || null,
      address || null,
      description || null,
      phone || null,
      email || null,
      logo_url || null,
      // Legacy recruitment fields with proper defaults
      representative_name || '',
      recruitment_positions || '[]',
      recruitment_count !== undefined ? recruitment_count : 0,
      employment_types || '[]',
      minimum_salary !== undefined ? minimum_salary : 0,
      required_qualifications || '{}',
      support_items || '{}',
      // Phase 3A: New job posting fields (14 fields)
      e7_visa_code || '',
      e7_visa_job_name || '',
      job_title_ko || '',
      job_title_en || '',
      job_responsibilities || '',
      salary_min !== undefined ? salary_min : 0,
      salary_max !== undefined ? salary_max : 0,
      contract_type || '',
      visa_support_level || '',
      visa_support_details || '',
      housing_support_type || '',
      housing_support_amount !== undefined ? housing_support_amount : 0,
      settlement_support || '[]',
      getCurrentTimestamp(),
      user.id
    ).run();
    
    if (!result.success) {
      throw new Error('프로필 업데이트 실패');
    }
    
    // Get updated profile
    const updatedProfile = await c.env.DB.prepare(`
      SELECT * FROM companies WHERE user_id = ?
    `).bind(user.id).first();
    
    return c.json({
      success: true,
      message: '프로필이 성공적으로 수정되었습니다.',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('기업 프로필 수정 오류:', error);
    return c.json({
      success: false,
      message: '프로필 수정에 실패했습니다.'
    }, 500);
  }
});

export default profile;
