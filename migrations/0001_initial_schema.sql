-- WOW-CAMPUS Work Platform Database Schema
-- 초기 스키마 생성

-- 사용자 관리 테이블
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('company', 'jobseeker', 'agent', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  name TEXT NOT NULL,
  phone TEXT,
  profile_image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME,
  approved_by INTEGER,
  approved_at DATETIME,
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- 구인기업 상세정보 테이블
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  business_number TEXT UNIQUE,
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('startup', 'small', 'medium', 'large')),
  address TEXT,
  website TEXT,
  description TEXT,
  founded_year INTEGER,
  employee_count INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 구직자 상세정보 테이블
CREATE TABLE IF NOT EXISTS jobseekers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nationality TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  visa_status TEXT,
  korean_level TEXT CHECK (korean_level IN ('beginner', 'elementary', 'intermediate', 'advanced', 'native')),
  english_level TEXT CHECK (english_level IN ('beginner', 'elementary', 'intermediate', 'advanced', 'native')),
  education_level TEXT,
  major TEXT,
  experience_years INTEGER DEFAULT 0,
  resume_url TEXT,
  portfolio_url TEXT,
  current_location TEXT,
  preferred_location TEXT,
  salary_expectation INTEGER,
  available_start_date DATE,
  bio TEXT,
  skills TEXT, -- JSON array of skills
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 에이전트 상세정보 테이블
CREATE TABLE IF NOT EXISTS agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  agency_name TEXT NOT NULL,
  license_number TEXT,
  specialization TEXT, -- JSON array of specializations
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  countries_covered TEXT, -- JSON array of countries
  languages TEXT, -- JSON array of languages
  experience_years INTEGER DEFAULT 0,
  total_placements INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 구인공고 테이블
CREATE TABLE IF NOT EXISTS job_postings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  job_type TEXT NOT NULL CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship')),
  job_category TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'KRW',
  visa_sponsorship BOOLEAN DEFAULT FALSE,
  korean_required BOOLEAN DEFAULT FALSE,
  experience_level TEXT CHECK (experience_level IN ('entry', 'junior', 'mid', 'senior', 'executive')),
  education_required TEXT,
  skills_required TEXT, -- JSON array of required skills
  benefits TEXT,
  application_deadline DATE,
  positions_available INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'expired')),
  featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 구인공고 지원 테이블
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_posting_id INTEGER NOT NULL,
  jobseeker_id INTEGER NOT NULL,
  agent_id INTEGER, -- 에이전트를 통한 지원인 경우
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'interview_scheduled', 'interview_completed', 'offered', 'accepted', 'rejected', 'withdrawn')),
  cover_letter TEXT,
  resume_url TEXT,
  additional_documents TEXT, -- JSON array of document URLs
  interview_date DATETIME,
  interview_notes TEXT,
  feedback TEXT,
  rejection_reason TEXT,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_by INTEGER, -- company user who reviewed
  FOREIGN KEY (job_posting_id) REFERENCES job_postings(id) ON DELETE CASCADE,
  FOREIGN KEY (jobseeker_id) REFERENCES jobseekers(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id),
  UNIQUE(job_posting_id, jobseeker_id) -- 중복 지원 방지
);

-- 매칭 시스템 테이블
CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_posting_id INTEGER NOT NULL,
  jobseeker_id INTEGER NOT NULL,
  agent_id INTEGER, -- 매칭을 주선한 에이전트
  match_score DECIMAL(5,2) DEFAULT 0.00, -- AI 매칭 점수
  match_reasons TEXT, -- JSON array of match reasons
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'viewed', 'interested', 'applied', 'dismissed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_posting_id) REFERENCES job_postings(id) ON DELETE CASCADE,
  FOREIGN KEY (jobseeker_id) REFERENCES jobseekers(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL,
  UNIQUE(job_posting_id, jobseeker_id) -- 중복 매칭 방지
);

-- 유학 과정 정보 테이블
CREATE TABLE IF NOT EXISTS study_programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_type TEXT NOT NULL CHECK (program_type IN ('language_course', 'undergraduate', 'graduate', 'phd')),
  institution_name TEXT NOT NULL,
  program_name TEXT NOT NULL,
  description TEXT,
  duration_months INTEGER,
  tuition_fee INTEGER,
  currency TEXT DEFAULT 'KRW',
  location TEXT,
  language_requirement TEXT,
  academic_requirement TEXT,
  application_deadline DATE,
  start_date DATE,
  capacity INTEGER,
  current_applications INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'full')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 유학 지원 테이블
CREATE TABLE IF NOT EXISTS study_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id INTEGER NOT NULL,
  jobseeker_id INTEGER NOT NULL,
  agent_id INTEGER, -- 에이전트를 통한 지원
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'accepted', 'rejected', 'waitlisted')),
  documents_submitted TEXT, -- JSON array of document types
  application_fee_paid BOOLEAN DEFAULT FALSE,
  notes TEXT,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES study_programs(id) ON DELETE CASCADE,
  FOREIGN KEY (jobseeker_id) REFERENCES jobseekers(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL,
  UNIQUE(program_id, jobseeker_id) -- 중복 지원 방지
);

-- 수수료 관리 테이블
CREATE TABLE IF NOT EXISTS commissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INTEGER NOT NULL,
  application_id INTEGER, -- job application
  study_application_id INTEGER, -- study application
  commission_type TEXT NOT NULL CHECK (commission_type IN ('job_placement', 'study_placement')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'KRW',
  percentage DECIMAL(5,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'disputed')),
  due_date DATE,
  paid_at DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
  FOREIGN KEY (study_application_id) REFERENCES study_applications(id) ON DELETE SET NULL
);

-- 시스템 통계 테이블
CREATE TABLE IF NOT EXISTS system_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stat_date DATE NOT NULL UNIQUE,
  total_users INTEGER DEFAULT 0,
  total_companies INTEGER DEFAULT 0,
  total_jobseekers INTEGER DEFAULT 0,
  total_agents INTEGER DEFAULT 0,
  active_job_postings INTEGER DEFAULT 0,
  total_applications INTEGER DEFAULT 0,
  successful_placements INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  related_id INTEGER, -- 관련 엔티티 ID (job_posting, application 등)
  related_type TEXT, -- 관련 엔티티 타입
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings(company_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_category ON job_postings(job_category);
CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings(location);

CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_applications_jobseeker ON applications(jobseeker_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE INDEX IF NOT EXISTS idx_matches_job ON matches(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_matches_jobseeker ON matches(jobseeker_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);