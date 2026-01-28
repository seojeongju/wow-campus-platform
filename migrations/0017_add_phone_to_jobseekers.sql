-- Add phone column to jobseekers table
-- Phone was missing from the table recreation in 0016

-- SQLite doesn't support ALTER TABLE ADD COLUMN with constraints easily
-- So we recreate the table again with phone column

CREATE TABLE jobseekers_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nationality TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  phone TEXT,  -- Added phone column
  current_location TEXT,
  visa_status TEXT,
  korean_level TEXT,
  english_level TEXT CHECK (english_level IN ('beginner', 'elementary', 'intermediate', 'advanced', 'native')),
  education_level TEXT,
  major TEXT,
  experience_years INTEGER DEFAULT 0,
  resume_url TEXT,
  portfolio_url TEXT,
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
INSERT INTO jobseekers_new (
  id, user_id, first_name, last_name, nationality, birth_date, gender,
  current_location, visa_status, korean_level, english_level, education_level,
  major, experience_years, resume_url, portfolio_url, preferred_location,
  salary_expectation, available_start_date, bio, skills, profile_views,
  created_at, updated_at
)
SELECT 
  id, user_id, first_name, last_name, nationality, birth_date, gender,
  current_location, visa_status, korean_level, english_level, education_level,
  major, experience_years, resume_url, portfolio_url, preferred_location,
  salary_expectation, available_start_date, bio, skills, profile_views,
  created_at, updated_at
FROM jobseekers;

-- Drop old table
DROP TABLE jobseekers;

-- Rename new table to original name
ALTER TABLE jobseekers_new RENAME TO jobseekers;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_jobseekers_user_id ON jobseekers(user_id);
CREATE INDEX IF NOT EXISTS idx_jobseekers_profile_views ON jobseekers(profile_views);
