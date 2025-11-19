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
      // New recruitment fields
      representative_name,
      recruitment_positions,
      recruitment_count,
      employment_types,
      minimum_salary,
      required_qualifications,
      support_items
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
    
    // Update company profile with all fields including new recruitment fields
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
      // New fields with proper defaults
      representative_name || '',
      recruitment_positions || '[]',
      recruitment_count !== undefined ? recruitment_count : 0,
      employment_types || '[]',
      minimum_salary !== undefined ? minimum_salary : 0,
      required_qualifications || '{}',
      support_items || '{}',
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
