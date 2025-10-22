-- Migration: Add international student fields to universities table
-- Date: 2025-10-22
-- Purpose: Add fields for international student recruitment information
-- Related: University form redesign for international students

-- Add basic information fields
ALTER TABLE universities ADD COLUMN english_name TEXT;

-- Add recruitment program fields
ALTER TABLE universities ADD COLUMN language_course INTEGER DEFAULT 0;  -- Boolean as INTEGER
ALTER TABLE universities ADD COLUMN undergraduate_course INTEGER DEFAULT 0;
ALTER TABLE universities ADD COLUMN graduate_course INTEGER DEFAULT 0;

-- Add tuition and scholarship fields
ALTER TABLE universities ADD COLUMN tuition_fee TEXT;
ALTER TABLE universities ADD COLUMN dormitory_fee TEXT;
ALTER TABLE universities ADD COLUMN scholarships TEXT;  -- Changed from JSON to TEXT

-- Add admission requirement fields
ALTER TABLE universities ADD COLUMN korean_requirement TEXT;  -- TOPIK level requirement
ALTER TABLE universities ADD COLUMN english_requirement TEXT;  -- TOEFL/IELTS requirement
ALTER TABLE universities ADD COLUMN admission_requirement TEXT;  -- Other requirements

-- Add facilities and support fields
ALTER TABLE universities ADD COLUMN dormitory INTEGER DEFAULT 0;  -- Boolean as INTEGER
ALTER TABLE universities ADD COLUMN airport_pickup INTEGER DEFAULT 0;
ALTER TABLE universities ADD COLUMN buddy_program INTEGER DEFAULT 0;
ALTER TABLE universities ADD COLUMN korean_language_support INTEGER DEFAULT 0;
ALTER TABLE universities ADD COLUMN career_support INTEGER DEFAULT 0;
ALTER TABLE universities ADD COLUMN part_time_work INTEGER DEFAULT 0;

-- Add student information fields
ALTER TABLE universities ADD COLUMN student_count INTEGER DEFAULT 0;
ALTER TABLE universities ADD COLUMN foreign_student_count INTEGER DEFAULT 0;

-- Add university description fields
ALTER TABLE universities ADD COLUMN features TEXT;  -- Comma-separated or JSON
ALTER TABLE universities ADD COLUMN majors TEXT;  -- Comma-separated or JSON

-- Add admission schedule fields
ALTER TABLE universities ADD COLUMN spring_admission TEXT;  -- Spring semester admission period
ALTER TABLE universities ADD COLUMN fall_admission TEXT;  -- Fall semester admission period

-- Update existing columns for consistency
-- Note: SQLite doesn't support ALTER COLUMN, so we'll use the data as-is
-- The 'partnership_type' column already exists and will be used

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_universities_language_course ON universities(language_course);
CREATE INDEX IF NOT EXISTS idx_universities_undergraduate_course ON universities(undergraduate_course);
CREATE INDEX IF NOT EXISTS idx_universities_graduate_course ON universities(graduate_course);

-- Update sample data with new fields
UPDATE universities 
SET 
  english_name = CASE name
    WHEN '서울대학교' THEN 'Seoul National University'
    WHEN '연세대학교' THEN 'Yonsei University'
    WHEN '고려대학교' THEN 'Korea University'
    WHEN 'KAIST' THEN 'Korea Advanced Institute of Science and Technology'
    WHEN '포항공과대학교' THEN 'Pohang University of Science and Technology'
    WHEN '성균관대학교' THEN 'Sungkyunkwan University'
    WHEN '한양대학교' THEN 'Hanyang University'
    WHEN '부산대학교' THEN 'Pusan National University'
    WHEN '경희대학교' THEN 'Kyung Hee University'
    WHEN '중앙대학교' THEN 'Chung-Ang University'
    ELSE name
  END,
  language_course = 1,
  undergraduate_course = 1,
  graduate_course = 1,
  tuition_fee = '4,000,000원 ~ 8,000,000원',
  dormitory_fee = '300,000원 ~ 600,000원',
  scholarships = '성적우수장학금 30-100%, 외국인장학금 50%, TOPIK 6급 전액장학금',
  korean_requirement = 'TOPIK 3급 이상',
  english_requirement = 'TOEFL 80점 또는 IELTS 6.0',
  dormitory = 1,
  airport_pickup = 1,
  buddy_program = 1,
  korean_language_support = 1,
  career_support = 1,
  part_time_work = 1,
  student_count = students,  -- Copy from old 'students' field
  foreign_student_count = CAST(students * 0.1 AS INTEGER),  -- Estimate 10% international
  features = '글로벌 프로그램, 최신 시설, 산학협력',
  majors = '경영학, 공학, 자연과학, 인문학, 사회과학',
  spring_admission = '11월 ~ 1월',
  fall_admission = '5월 ~ 7월'
WHERE id IS NOT NULL;
