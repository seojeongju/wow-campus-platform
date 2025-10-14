-- Fix korean_level CHECK constraint by recreating table
-- Step 1: Backup existing data
CREATE TABLE IF NOT EXISTS jobseekers_backup AS SELECT * FROM jobseekers;

-- Step 2: Drop old table
DROP TABLE jobseekers;

-- Step 3: Create new table without CHECK constraint on korean_level
CREATE TABLE jobseekers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nationality TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  visa_status TEXT,
  korean_level TEXT, -- No CHECK constraint - accepts any TOPIK level
  english_level TEXT,
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

-- Step 4: Restore data from backup
INSERT INTO jobseekers SELECT * FROM jobseekers_backup;

-- Step 5: Drop backup table
DROP TABLE jobseekers_backup;

-- Step 6: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_jobseekers_user ON jobseekers(user_id);
CREATE INDEX IF NOT EXISTS idx_jobseekers_nationality ON jobseekers(nationality);
CREATE INDEX IF NOT EXISTS idx_jobseekers_location ON jobseekers(preferred_location);
CREATE INDEX IF NOT EXISTS idx_jobseekers_korean_level ON jobseekers(korean_level);
