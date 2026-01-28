-- Migration: Update experience_level and education_required to accept Korean values
-- Created: 2025-11-12
-- Description: Change experience_level and education_required columns to accept Korean text values

-- Step 1: Create new table with updated schema
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
  experience_level TEXT,  -- Removed CHECK constraint to allow Korean text
  education_required TEXT,  -- No constraint, allow any text
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

-- Step 2: Copy all data from old table (no conversion needed, just copy)
INSERT INTO job_postings_new 
SELECT * FROM job_postings;

-- Step 3: Drop old table
DROP TABLE job_postings;

-- Step 4: Rename new table to original name
ALTER TABLE job_postings_new RENAME TO job_postings;
