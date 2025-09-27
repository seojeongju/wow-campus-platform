// Database utility functions for WOW-CAMPUS Work Platform

import type { PaginatedResponse } from '../types/database';

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export function buildWhereClause(conditions: Record<string, any>): { where: string; params: any[] } {
  const clauses: string[] = [];
  const params: any[] = [];
  
  Object.entries(conditions).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'string' && key.includes('search')) {
        clauses.push(`${key.replace('_search', '')} LIKE ?`);
        params.push(`%${value}%`);
      } else {
        clauses.push(`${key} = ?`);
        params.push(value);
      }
    }
  });
  
  return {
    where: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params
  };
}

export function buildOrderClause(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): string {
  if (!sortBy) return 'ORDER BY created_at DESC';
  
  // Validate sortBy to prevent SQL injection
  const allowedColumns = [
    'id', 'name', 'email', 'created_at', 'updated_at', 
    'title', 'salary_min', 'salary_max', 'application_deadline',
    'match_score', 'status'
  ];
  
  if (!allowedColumns.includes(sortBy)) {
    return 'ORDER BY created_at DESC';
  }
  
  return `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
}

export function buildLimitClause(page: number = 1, limit: number = 10): { limitClause: string; offset: number } {
  const offset = (page - 1) * limit;
  return {
    limitClause: `LIMIT ? OFFSET ?`,
    offset
  };
}

// Job matching score calculation
export function calculateMatchScore(
  jobPosting: any,
  jobSeeker: any
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  // Skills matching (40% weight)
  const jobSkills = jobPosting.skills_required ? JSON.parse(jobPosting.skills_required) : [];
  const seekerSkills = jobSeeker.skills ? JSON.parse(jobSeeker.skills) : [];
  
  if (jobSkills.length > 0 && seekerSkills.length > 0) {
    const matchingSkills = jobSkills.filter((skill: string) => 
      seekerSkills.some((seekerSkill: string) => 
        seekerSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    const skillsScore = (matchingSkills.length / jobSkills.length) * 40;
    score += skillsScore;
    reasons.push(`Skills match: ${Math.round(skillsScore)}%`);
  }
  
  // Location preference (20% weight)
  if (jobSeeker.preferred_location && jobPosting.location) {
    const locationMatch = jobSeeker.preferred_location.toLowerCase()
      .includes(jobPosting.location.toLowerCase());
    if (locationMatch) {
      score += 20;
      reasons.push('Location preference: 100%');
    }
  }
  
  // Salary expectation (20% weight)
  if (jobSeeker.salary_expectation && jobPosting.salary_min && jobPosting.salary_max) {
    const salaryFit = jobSeeker.salary_expectation >= jobPosting.salary_min &&
                     jobSeeker.salary_expectation <= jobPosting.salary_max;
    if (salaryFit) {
      score += 20;
      reasons.push('Salary expectation: 100%');
    } else {
      const proximityScore = Math.max(0, 20 - Math.abs(
        jobSeeker.salary_expectation - (jobPosting.salary_min + jobPosting.salary_max) / 2
      ) / 1000000 * 10);
      score += proximityScore;
      reasons.push(`Salary expectation: ${Math.round(proximityScore)}%`);
    }
  }
  
  // Experience level (20% weight)
  if (jobSeeker.experience_years !== undefined && jobPosting.experience_level) {
    const experienceMap: Record<string, number> = {
      'entry': 0,
      'junior': 2,
      'mid': 5,
      'senior': 8,
      'executive': 12
    };
    
    const requiredExp = experienceMap[jobPosting.experience_level] || 0;
    const experienceScore = jobSeeker.experience_years >= requiredExp ? 20 : 
                           Math.max(0, 20 - (requiredExp - jobSeeker.experience_years) * 3);
    score += experienceScore;
    reasons.push(`Experience level: ${Math.round(experienceScore)}%`);
  }
  
  return {
    score: Math.min(100, Math.round(score)),
    reasons
  };
}

// Search query builder for job postings
export function buildJobSearchQuery(params: any): { query: string; searchParams: any[] } {
  const conditions: string[] = ['jp.status = ?'];
  const searchParams: any[] = ['active'];
  
  if (params.keyword) {
    conditions.push('(jp.title LIKE ? OR jp.description LIKE ? OR jp.job_category LIKE ?)');
    const keyword = `%${params.keyword}%`;
    searchParams.push(keyword, keyword, keyword);
  }
  
  if (params.location) {
    conditions.push('jp.location LIKE ?');
    searchParams.push(`%${params.location}%`);
  }
  
  if (params.job_category) {
    conditions.push('jp.job_category = ?');
    searchParams.push(params.job_category);
  }
  
  if (params.job_type) {
    conditions.push('jp.job_type = ?');
    searchParams.push(params.job_type);
  }
  
  if (params.salary_min) {
    conditions.push('(jp.salary_max IS NULL OR jp.salary_max >= ?)');
    searchParams.push(params.salary_min);
  }
  
  if (params.salary_max) {
    conditions.push('(jp.salary_min IS NULL OR jp.salary_min <= ?)');
    searchParams.push(params.salary_max);
  }
  
  if (params.experience_level) {
    conditions.push('jp.experience_level = ?');
    searchParams.push(params.experience_level);
  }
  
  if (params.visa_sponsorship === true) {
    conditions.push('jp.visa_sponsorship = ?');
    searchParams.push(1);
  }
  
  const baseQuery = `
    SELECT jp.*, c.company_name, c.industry, c.company_size
    FROM job_postings jp
    LEFT JOIN companies c ON jp.company_id = c.id
    WHERE ${conditions.join(' AND ')}
  `;
  
  return { query: baseQuery, searchParams };
}