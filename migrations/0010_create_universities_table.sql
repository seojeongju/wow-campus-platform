-- Migration: Create universities table for partner university management
-- Date: 2025-10-18
-- Purpose: Store information about partner universities for the admin dashboard

CREATE TABLE IF NOT EXISTS universities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  ranking INTEGER,
  students INTEGER,
  partnership_type TEXT DEFAULT '일반협약',
  logo_url TEXT,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  description TEXT,
  established_year INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create index for faster region-based queries
CREATE INDEX IF NOT EXISTS idx_universities_region ON universities(region);

-- Create index for faster name searches
CREATE INDEX IF NOT EXISTS idx_universities_name ON universities(name);

-- Insert sample universities data
INSERT INTO universities (name, region, ranking, students, partnership_type, created_at, updated_at) VALUES
  ('서울대학교', '서울', 1, 28000, 'MOU협약', datetime('now'), datetime('now')),
  ('연세대학교', '서울', 2, 27000, 'MOU협약', datetime('now'), datetime('now')),
  ('고려대학교', '서울', 3, 26000, 'MOU협약', datetime('now'), datetime('now')),
  ('KAIST', '대전', 4, 10000, 'MOU협약', datetime('now'), datetime('now')),
  ('포항공과대학교', '경북', 5, 3500, 'MOU협약', datetime('now'), datetime('now')),
  ('성균관대학교', '서울', 6, 25000, '일반협약', datetime('now'), datetime('now')),
  ('한양대학교', '서울', 7, 24000, '일반협약', datetime('now'), datetime('now')),
  ('부산대학교', '부산', 8, 22000, '일반협약', datetime('now'), datetime('now')),
  ('경희대학교', '서울', 9, 23000, '일반협약', datetime('now'), datetime('now')),
  ('중앙대학교', '서울', 10, 21000, '일반협약', datetime('now'), datetime('now'));
