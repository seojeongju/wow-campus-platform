-- Remove CHECK constraint from korean_level field to support TOPIK levels
-- SQLite doesn't support ALTER TABLE DROP CONSTRAINT, so we need to recreate the table

-- Create new jobseekers table without CHECK constraint on korean_level
CREATE TABLE IF NOT EXISTS jobseekers_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nationality TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  visa_status TEXT,
  korean_level TEXT, -- Removed CHECK constraint to allow TOPIK levels
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Copy existing data if any
INSERT INTO jobseekers_new 
SELECT * FROM jobseekers;

-- Drop old table
DROP TABLE jobseekers;

-- Rename new table
ALTER TABLE jobseekers_new RENAME TO jobseekers;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_jobseekers_user ON jobseekers(user_id);
CREATE INDEX IF NOT EXISTS idx_jobseekers_nationality ON jobseekers(nationality);
CREATE INDEX IF NOT EXISTS idx_jobseekers_location ON jobseekers(preferred_location);
