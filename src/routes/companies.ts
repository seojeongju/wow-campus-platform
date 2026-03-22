
import { Hono } from 'hono';
import { optionalAuth, requireAdmin, authMiddleware } from '../middleware/auth';
import type { Bindings, Variables } from '../types/env';

const companies = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/**
 * ==========================================
 * Admin Company Management Routes
 * ==========================================
 */

// Create Company (Admin only)
companies.post('/', optionalAuth, requireAdmin, async (c) => {
    try {
        const db = c.env.DB;
        const data = await c.req.json();

        // 1. Create User
        const userResult = await db.prepare(`
      INSERT INTO users (
        email, password_hash, user_type, status, name, phone, created_at, updated_at
      ) VALUES (?, ?, 'company', 'approved', ?, ?, datetime('now'), datetime('now'))
    `).bind(
            data.email,
            'temp_password_hash', // Temporary password handling needed
            data.name, // Contact person name
            data.phone || ''
        ).run();

        const userId = userResult.meta.last_row_id;

        // 2. Create Company Profile
        // matching auth.js fields: company_name, business_number, company_address, industry, department, company_size
        // Assuming table structure matches these or similar.
        const companyResult = await db.prepare(`
      INSERT INTO companies (
        user_id, company_name, business_number, address, 
        industry, description, website, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
            userId,
            data.company_name,
            data.business_number,
            data.company_address, // explicit field name from auth.js, assuming mapped to 'address' in db or 'company_address'
            data.industry,
            data.description || '',
            data.website || ''
            // Note: department and company_size might need to be stored in description JSON or separate columns if they exist.
            // For now, mapping basic fields.
        ).run();

        // Update basic fields if columns exist? 
        // Since I can't check schema, I'll stick to safest core fields or check migrations if I could.
        // auth.js maps: company_address -> address seems standard.

        return c.json({
            success: true,
            message: "기업이 성공적으로 추가되었습니다.",
            data: {
                id: companyResult.meta.last_row_id,
                userId: userId,
                tempPassword: 'temp_password_1234' // In real app, generate meaningful temp pass
            }
        });
    } catch (error) {
        console.error('Company creation error:', error);
        return c.json({
            success: false,
            message: "기업 추가 중 오류가 발생했습니다. (이메일 중복 등 확인 필요)"
        }, 500);
    }
});

// Get Companies List (Admin)
companies.get('/', optionalAuth, requireAdmin, async (c) => {
    try {
        const db = c.env.DB;
        // Simple fetch
        const result = await db.prepare(`
            SELECT c.*, u.email, u.name as contact_name, u.phone 
            FROM companies c
            JOIN users u ON c.user_id = u.id
            ORDER BY c.created_at DESC
        `).all();

        return c.json({
            success: true,
            companies: result.results
        });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

export default companies;
