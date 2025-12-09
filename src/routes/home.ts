
import { Hono } from 'hono';
import type { Bindings, Variables } from '../types/env';

const home = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Latest information API for home page
home.get('/latest-information', async (c) => {
    try {
        // Get latest 3 job postings
        const latestJobs = await c.env.DB.prepare(`
      SELECT 
        jp.id,
        jp.title,
        jp.job_type,
        jp.job_category,
        jp.location,
        c.company_name
      FROM job_postings jp
      LEFT JOIN companies c ON jp.company_id = c.id
      WHERE jp.status = 'active'
      ORDER BY jp.created_at DESC
      LIMIT 3
    `).all();

        // Get latest 5 jobseekers (only approved users) - Increased limit as per original code
        const latestJobseekers = await c.env.DB.prepare(`
      SELECT 
        js.id,
        js.first_name,
        js.last_name,
        js.nationality,
        js.experience_years,
        js.skills,
        js.preferred_location,
        js.bio
      FROM jobseekers js
      JOIN users u ON js.user_id = u.id
      WHERE u.status = 'approved'
      ORDER BY js.created_at DESC
      LIMIT 5
    `).all();

        // Format job data
        const formattedJobs = latestJobs.results.map((job: any) => ({
            id: job.id,
            title: job.title,
            type: job.job_type,
            category: job.job_category,
            location: job.location,
            company: job.company_name || '회사명 비공개'
        }));

        // Format jobseeker data
        const formattedJobseekers = latestJobseekers.results.map((js: any) => {
            let skills = []
            try {
                skills = typeof js.skills === 'string' ? JSON.parse(js.skills) : (js.skills || [])
            } catch (e) {
                skills = []
            }

            const experienceText = js.experience_years === 0 ? '신입' : `${js.experience_years}년 경력`
            const skillsText = Array.isArray(skills) && skills.length > 0
                ? skills.slice(0, 3).join(', ')
                : '기술 미입력'

            return {
                id: js.id,
                name: `${js.first_name || ''} ${js.last_name || ''}`.trim() || '이름 비공개',
                nationality: js.nationality || '국적 비공개',
                experience: experienceText,
                skills: skillsText,
                location: js.preferred_location || '지역 미정'
            }
        });

        return c.json({
            success: true,
            data: {
                latestJobs: formattedJobs,
                latestJobseekers: formattedJobseekers
            }
        });
    } catch (error) {
        console.error('Latest information API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : '';
        console.error('Error details:', { message: errorMessage, stack: errorStack });
        return c.json({
            success: false,
            message: 'Failed to fetch latest information',
            error: errorMessage
        }, 500);
    }
});

export default home;
