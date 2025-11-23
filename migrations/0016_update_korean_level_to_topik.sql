-- Update korean_level field to support TOPIK format
-- Remove CHECK constraint and allow TOPIK 1급~6급, 미응시 format

-- SQLite doesn't support ALTER COLUMN directly, so we need to:
-- 1. Create new table with updated constraint
-- 2. Copy data
-- 3. Drop old table
-- 4. Rename new table

-- Create new jobseekers table with updated korean_level field
CREATE TABLE jobseekers_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nationality TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  visa_status TEXT,
  korean_level TEXT,  -- No CHECK constraint - allows TOPIK format
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
  skills TEXT,
  profile_views INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Copy all data from old table to new table
INSERT INTO jobseekers_new 
SELECT * FROM jobseekers;

-- Drop old table
DROP TABLE jobseekers;

-- Rename new table to original name
ALTER TABLE jobseekers_new RENAME TO jobseekers;

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_jobseekers_profile_views ON jobseekers(profile_views);
