
import { Hono } from 'hono';
import type { Bindings, Variables } from '../types/env';

const publicApi = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 🌍 공개 API: 에이전트 목록 조회 (회원가입용)
publicApi.get('/agents', async (c) => {
    try {
        // Get all active agents with their basic info
        const agentsQuery = `
      SELECT 
        a.id,
        a.agency_name,
        a.primary_regions,
        a.experience_years,
        u.name as user_name,
        u.email
      FROM agents a
      INNER JOIN users u ON a.user_id = u.id
      WHERE u.status = 'approved'
      ORDER BY a.agency_name ASC
    `;

        const result = await c.env.DB.prepare(agentsQuery).all();

        // Parse JSON fields
        const agents = (result.results || []).map((agent: any) => ({
            id: agent.id,
            agency_name: agent.agency_name,
            user_name: agent.user_name,
            primary_regions: agent.primary_regions ? JSON.parse(agent.primary_regions as string) : [],
            experience_years: agent.experience_years
        }));

        return c.json({
            success: true,
            agents
        });
    } catch (error) {
        console.error('Error fetching agents list:', error);
        return c.json({
            success: false,
            error: 'Failed to fetch agents list'
        }, 500);
    }
});

// Public API for matching page - Get jobseekers list
publicApi.get('/matching/jobseekers', async (c) => {
    try {
        const limit = Math.min(parseInt(c.req.query('limit') || '100'), 100)

        const jobseekers = await c.env.DB.prepare(`
      SELECT 
        js.id,
        js.first_name,
        js.last_name,
        js.nationality,
        js.experience_years,
        js.major,
        js.skills,
        js.preferred_location,
        js.salary_expectation,
        js.visa_status
      FROM jobseekers js
      LEFT JOIN users u ON js.user_id = u.id
      WHERE u.status = 'approved' OR u.status IS NULL
      ORDER BY js.created_at DESC
      LIMIT ?
    `).bind(limit).all()

        return c.json({
            success: true,
            data: jobseekers.results
        })
    } catch (error) {
        console.error('Error fetching public jobseekers:', error)
        return c.json({
            success: false,
            message: 'Error fetching jobseekers'
        }, 500)
    }
})

export default publicApi;
