
import { Hono } from 'hono';
import { authMiddleware, optionalAuth, requireAdmin } from '../middleware/auth';
import type { Bindings, Variables } from '../types/env';

const dashboard = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 구직자 대시보드 API
dashboard.get('/jobseeker', authMiddleware, async (c) => {
    const user = c.get('user');

    if (!user || user.user_type !== 'jobseeker') {
        return c.json({ success: false, message: '구직자만 접근 가능합니다.' }, 403);
    }

    try {
        // 구직자 ID 조회
        const jobseeker = await c.env.DB.prepare(`
      SELECT id FROM jobseekers WHERE user_id = ?
    `).bind(user.id).first();

        if (!jobseeker) {
            return c.json({ success: false, message: '구직자 프로필을 찾을 수 없습니다.' }, 404);
        }

        // 대시보드 데이터 조회
        const [applicationsCount, interviewCount, recentApplications] = await Promise.all([
            // 지원한 공고 수
            c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM applications WHERE jobseeker_id = ?
      `).bind(jobseeker.id).first(),

            // 면접 제안 수
            c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM applications 
        WHERE jobseeker_id = ? AND status = 'interview'
      `).bind(jobseeker.id).first(),

            // 최근 지원 현황
            c.env.DB.prepare(`
        SELECT 
          a.id,
          a.status,
          a.applied_at,
          j.title as job_title,
          j.location,
          c.company_name
        FROM applications a
        JOIN job_postings j ON a.job_posting_id = j.id
        JOIN companies c ON j.company_id = c.id  
        WHERE a.jobseeker_id = ?
        ORDER BY a.applied_at DESC
        LIMIT 5
      `).bind(jobseeker.id).all()
        ]);

        return c.json({
            success: true,
            data: {
                applications_count: applicationsCount?.count || 0,
                profile_views: 87, // 추후 구현
                interview_offers: interviewCount?.count || 0,
                rating: 4.8, // 추후 구현
                recent_applications: recentApplications.results || []
            }
        });

    } catch (error) {
        console.error('Dashboard API error:', error);
        return c.json({ success: false, message: '대시보드 데이터 조회 실패' }, 500);
    }
});

export default dashboard;
