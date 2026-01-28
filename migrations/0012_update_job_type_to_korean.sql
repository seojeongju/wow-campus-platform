-- Update job_type values to support Korean
-- This allows Korean values in the job_type field

-- Step 1: Remove the old CHECK constraint (SQLite doesn't support ALTER TABLE DROP CONSTRAINT)
-- We need to recreate the table

-- Create temporary table with Korean job_type values
CREATE TABLE job_postings_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  job_type TEXT NOT NULL CHECK (job_type IN ('정규직', '계약직', '파트타임', '인턴', '프리랜서')),
  job_category TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'KRW',
  visa_sponsorship BOOLEAN DEFAULT FALSE,
  visa_types TEXT,
  korean_required BOOLEAN DEFAULT FALSE,
  experience_level TEXT CHECK (experience_level IN ('entry', 'junior', 'mid', 'senior', 'executive')),
  education_required TEXT,
  skills_required TEXT,
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

-- Copy existing data, converting English values to Korean
INSERT INTO job_postings_new 
SELECT 
  id, company_id, title, description, requirements, responsibilities,
  CASE job_type
    WHEN 'full_time' THEN '정규직'
    WHEN 'part_time' THEN '파트타임'
    WHEN 'contract' THEN '계약직'
    WHEN 'internship' THEN '인턴'
    ELSE job_type
  END as job_type,
  job_category, location, salary_min, salary_max, currency,
  visa_sponsorship, visa_types, korean_required, experience_level, education_required,
  skills_required, benefits, application_deadline, positions_available,
  status, featured, views_count, applications_count, created_at, updated_at
FROM job_postings;

-- Drop old table
DROP TABLE job_postings;

-- Rename new table
ALTER TABLE job_postings_new RENAME TO job_postings;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings(company_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_category ON job_postings(job_category);
CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings(location);
