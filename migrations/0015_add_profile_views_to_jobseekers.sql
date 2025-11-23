-- Add profile_views column to jobseekers table
-- This tracks how many times a jobseeker's profile has been viewed

ALTER TABLE jobseekers ADD COLUMN profile_views INTEGER DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_jobseekers_profile_views ON jobseekers(profile_views);
