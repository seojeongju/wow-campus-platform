// Matching routes for WOW-CAMPUS Work Platform
// AI-based job matching system

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { Bindings, Variables } from '../types/env';
import { authMiddleware } from '../middleware/auth';

const matching = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 매칭 스코어 계산 함수
function calculateMatchingScore(job: any, jobseeker: any): number {
  let score = 0;
  let maxScore = 0;

  // 1. 스킬 매칭 (40점)
  maxScore += 40;
  if (job.skills_required && jobseeker.skills) {
    const jobSkills = typeof job.skills_required === 'string' 
      ? JSON.parse(job.skills_required) 
      : job.skills_required;
    const seekerSkills = typeof jobseeker.skills === 'string'
      ? JSON.parse(jobseeker.skills)
      : jobseeker.skills || [];
    
    if (Array.isArray(jobSkills) && Array.isArray(seekerSkills)) {
      const matchedSkills = jobSkills.filter(skill => 
        seekerSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || 
                             skill.toLowerCase().includes(s.toLowerCase()))
      );
      score += (matchedSkills.length / Math.max(jobSkills.length, 1)) * 40;
    }
  }

  // 2. 위치 매칭 (25점)
  maxScore += 25;
  if (job.location && jobseeker.preferred_location) {
    const jobLocation = job.location.toLowerCase();
    const preferredLocations = jobseeker.preferred_location.toLowerCase().split('/');
    
    if (preferredLocations.some(loc => 
        jobLocation.includes(loc.trim()) || loc.trim().includes(jobLocation)
    )) {
      score += 25;
    } else if (preferredLocations.some(loc => 
        loc.trim().includes('서울') && jobLocation.includes('경기')
    ) || (jobLocation.includes('서울') && preferredLocations.some(loc => 
        loc.trim().includes('경기')
    ))) {
      score += 15; // 인접 지역 부분 점수
    }
  }

  // 3. 경력 매칭 (20점)
  maxScore += 20;
  if (job.experience_level && jobseeker.experience_years !== undefined) {
    const experienceYears = jobseeker.experience_years || 0;
    
    switch (job.experience_level) {
      case 'entry':
        if (experienceYears <= 1) score += 20;
        else if (experienceYears <= 3) score += 15;
        else score += 10;
        break;
      case 'junior':
        if (experienceYears >= 1 && experienceYears <= 3) score += 20;
        else if (experienceYears <= 1 || experienceYears <= 5) score += 15;
        else score += 10;
        break;
      case 'mid':
        if (experienceYears >= 3 && experienceYears <= 7) score += 20;
        else if (experienceYears >= 1 && experienceYears <= 10) score += 15;
        else score += 10;
        break;
      case 'senior':
        if (experienceYears >= 5) score += 20;
        else if (experienceYears >= 3) score += 15;
        else score += 5;
        break;
      default:
        score += 10; // 기본 점수
    }
  }

  // 4. 비자 스폰서십 (10점)
  maxScore += 10;
  if (job.visa_sponsorship) {
    score += 10;
  } else if (jobseeker.visa_status && 
             ['F-2', 'F-5', 'F-6', 'F-4'].includes(jobseeker.visa_status)) {
    score += 10; // 이미 체류 가능한 비자
  }

  // 5. 급여 기대치 (5점)
  maxScore += 5;
  if (job.salary_min && job.salary_max && jobseeker.salary_expectation) {
    const avgSalary = (job.salary_min + job.salary_max) / 2;
    const expectation = jobseeker.salary_expectation;
    
    if (expectation >= job.salary_min && expectation <= job.salary_max) {
      score += 5;
    } else if (Math.abs(expectation - avgSalary) / avgSalary <= 0.2) {
      score += 3; // 20% 오차 범위
    } else if (Math.abs(expectation - avgSalary) / avgSalary <= 0.4) {
      score += 1; // 40% 오차 범위
    }
  }

  // 백분율로 변환 (최대 100점)
  return Math.round((score / maxScore) * 100);
}

// 구직자를 위한 구인공고 매칭 추천
matching.get('/jobs/:jobseekerId', async (c) => {
  try {
    const jobseekerId = c.req.param('jobseekerId');
    
    // 구직자 정보 조회
    const jobseeker = await c.env.DB.prepare(`
      SELECT js.*, u.name, u.email, u.user_type
      FROM jobseekers js
      JOIN users u ON js.user_id = u.id
      WHERE js.id = ?
    `).bind(jobseekerId).first();

    if (!jobseeker) {
      return c.json({ 
        success: false, 
        message: '구직자 정보를 찾을 수 없습니다.' 
      }, 404);
    }

    // 활성 구인공고 조회
    const jobs = await c.env.DB.prepare(`
      SELECT j.*, c.company_name, c.industry, c.company_size
      FROM job_postings j
      JOIN companies c ON j.company_id = c.id
      WHERE j.status = 'active'
      ORDER BY j.created_at DESC
    `).all();

    if (!jobs.results || jobs.results.length === 0) {
      return c.json({
        success: true,
        data: [],
        message: '현재 활성 구인공고가 없습니다.'
      });
    }

    // 각 구인공고에 대해 매칭 점수 계산
    const matchedJobs = jobs.results.map(job => ({
      ...job,
      matching_score: calculateMatchingScore(job, jobseeker),
      match_reasons: getMatchReasons(job, jobseeker)
    }));

    // 매칭 점수 순으로 정렬 (높은 점수부터)
    const sortedMatches = matchedJobs
      .filter(job => job.matching_score > 0)
      .sort((a, b) => b.matching_score - a.matching_score);

    return c.json({
      success: true,
      data: {
        jobseeker: {
          id: jobseeker.id,
          name: jobseeker.name,
          skills: jobseeker.skills ? JSON.parse(jobseeker.skills) : [],
          location: jobseeker.preferred_location,
          experience: jobseeker.experience_years,
          visa_status: jobseeker.visa_status
        },
        matches: sortedMatches.slice(0, 20), // 상위 20개만 반환
        total_matches: sortedMatches.length,
        average_score: Math.round(
          sortedMatches.reduce((sum, job) => sum + job.matching_score, 0) / 
          sortedMatches.length
        )
      }
    });
    
  } catch (error) {
    console.error('Jobseeker matching error:', error);
    return c.json({ 
      success: false, 
      message: '매칭 중 오류가 발생했습니다.' 
    }, 500);
  }
});

// 기업을 위한 구직자 매칭 추천
matching.get('/jobseekers/:jobId', async (c) => {
  try {
    const jobId = c.req.param('jobId');
    console.log('[API] Finding jobseekers for job:', jobId);
    
    // 구인공고 정보 조회
    const job = await c.env.DB.prepare(`
      SELECT j.*, c.company_name, c.industry, c.company_size
      FROM job_postings j
      JOIN companies c ON j.company_id = c.id
      WHERE j.id = ?
    `).bind(jobId).first();

    console.log('[API] Job found:', job ? job.title : 'NOT FOUND');

    if (!job) {
      return c.json({ 
        success: false, 
        message: '구인공고를 찾을 수 없습니다.' 
      }, 404);
    }

    // 승인된 구직자 조회
    const jobseekers = await c.env.DB.prepare(`
      SELECT js.*, u.name, u.email, u.user_type, u.status
      FROM jobseekers js
      JOIN users u ON js.user_id = u.id
      WHERE u.status = 'approved'
      ORDER BY js.created_at DESC
    `).all();

    console.log('[API] Jobseekers found:', jobseekers.results ? jobseekers.results.length : 0);

    if (!jobseekers.results || jobseekers.results.length === 0) {
      return c.json({
        success: true,
        data: {
          job: {
            id: job.id,
            title: job.title,
            company: job.company_name,
            location: job.location
          },
          matches: [],
          total_matches: 0,
          average_score: 0
        },
        message: '현재 등록된 구직자가 없습니다.'
      });
    }

    // 각 구직자에 대해 매칭 점수 계산
    console.log('[API] Calculating matching scores...');
    const matchedJobseekers = jobseekers.results.map((jobseeker, index) => {
      try {
        const score = calculateMatchingScore(job, jobseeker);
        const reasons = getMatchReasons(job, jobseeker);
        console.log(`[API] Jobseeker #${index}: ${jobseeker.name} - Score: ${score}`);
        return {
          ...jobseeker,
          matching_score: score,
          match_reasons: reasons
        };
      } catch (err) {
        console.error(`[API] Error calculating score for jobseeker ${jobseeker.id}:`, err);
        return {
          ...jobseeker,
          matching_score: 0,
          match_reasons: ['계산 오류']
        };
      }
    });

    // 매칭 점수 순으로 정렬
    const sortedMatches = matchedJobseekers
      .filter(seeker => seeker.matching_score > 0)
      .sort((a, b) => b.matching_score - a.matching_score);

    console.log('[API] Total matches with score > 0:', sortedMatches.length);

    const avgScore = sortedMatches.length > 0 
      ? Math.round(sortedMatches.reduce((sum, seeker) => sum + seeker.matching_score, 0) / sortedMatches.length)
      : 0;

    return c.json({
      success: true,
      data: {
        job: {
          id: job.id,
          title: job.title,
          company: job.company_name,
          location: job.location,
          skills_required: job.skills_required ? (typeof job.skills_required === 'string' ? JSON.parse(job.skills_required) : job.skills_required) : [],
          experience_level: job.experience_level
        },
        matches: sortedMatches.slice(0, 20),
        total_matches: sortedMatches.length,
        average_score: avgScore
      }
    });
    
  } catch (error) {
    console.error('[API] Job matching error:', error);
    console.error('[API] Error stack:', error.stack);
    return c.json({ 
      success: false, 
      message: '매칭 중 오류가 발생했습니다: ' + (error.message || String(error))
    }, 500);
  }
});

// 전체 매칭 통계
matching.get('/statistics', async (c) => {
  try {
    // 기본 통계 조회
    const stats = await c.env.DB.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM job_postings WHERE status = 'active') as active_jobs,
        (SELECT COUNT(*) FROM jobseekers) as total_jobseekers,
        (SELECT COUNT(*) FROM users WHERE status = 'approved') as approved_users,
        (SELECT COUNT(*) FROM companies c JOIN users u ON c.user_id = u.id WHERE u.status = 'approved') as approved_companies
    `).first();

    // 최근 매칭 성공률 시뮬레이션 (실제로는 applications 테이블에서)
    const matchingStats = {
      total_matches_generated: (stats?.active_jobs || 0) * (stats?.total_jobseekers || 0),
      high_score_matches: Math.round((stats?.active_jobs || 0) * (stats?.total_jobseekers || 0) * 0.15),
      medium_score_matches: Math.round((stats?.active_jobs || 0) * (stats?.total_jobseekers || 0) * 0.35),
      low_score_matches: Math.round((stats?.active_jobs || 0) * (stats?.total_jobseekers || 0) * 0.50),
      average_matching_score: 67
    };

    return c.json({
      success: true,
      data: {
        ...stats,
        ...matchingStats,
        last_updated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Matching statistics error:', error);
    return c.json({ 
      success: false, 
      message: '통계 조회 중 오류가 발생했습니다.' 
    }, 500);
  }
});

// 매칭 이유 생성 함수
function getMatchReasons(job: any, jobseeker: any): string[] {
  const reasons = [];
  
  // 스킬 매칭
  if (job.skills_required && jobseeker.skills) {
    const jobSkills = typeof job.skills_required === 'string' 
      ? JSON.parse(job.skills_required) 
      : job.skills_required;
    const seekerSkills = typeof jobseeker.skills === 'string'
      ? JSON.parse(jobseeker.skills)
      : jobseeker.skills || [];
    
    if (Array.isArray(jobSkills) && Array.isArray(seekerSkills)) {
      const matchedSkills = jobSkills.filter(skill => 
        seekerSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      );
      if (matchedSkills.length > 0) {
        reasons.push(`요구 스킬 매칭: ${matchedSkills.join(', ')}`);
      }
    }
  }
  
  // 위치 매칭
  if (job.location && jobseeker.preferred_location) {
    const jobLocation = job.location.toLowerCase();
    const preferredLocations = jobseeker.preferred_location.toLowerCase();
    
    if (preferredLocations.includes(jobLocation) || jobLocation.includes(preferredLocations)) {
      reasons.push(`희망 근무지역 일치: ${job.location}`);
    }
  }
  
  // 경력 매칭
  if (job.experience_level && jobseeker.experience_years !== undefined) {
    const exp = jobseeker.experience_years || 0;
    let match = false;
    
    switch (job.experience_level) {
      case 'entry':
        if (exp <= 1) { reasons.push('신입/초급 경력 요구사항 충족'); match = true; }
        break;
      case 'junior':
        if (exp >= 1 && exp <= 3) { reasons.push('주니어 경력 요구사항 충족'); match = true; }
        break;
      case 'mid':
        if (exp >= 3 && exp <= 7) { reasons.push('중급 경력 요구사항 충족'); match = true; }
        break;
      case 'senior':
        if (exp >= 5) { reasons.push('시니어 경력 요구사항 충족'); match = true; }
        break;
    }
  }
  
  // 비자 스폰서십
  if (job.visa_sponsorship) {
    reasons.push('비자 스폰서십 제공');
  }
  
  return reasons;
}

export { matching };