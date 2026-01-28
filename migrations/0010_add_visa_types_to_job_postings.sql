-- Add visa_types field to job_postings table
-- This allows storing specific visa types that are accepted for the job posting

ALTER TABLE job_postings ADD COLUMN visa_types TEXT;

-- visa_types will store JSON array of visa codes (e.g., ["F-2", "E-7", "D-10"])
-- NULL means all visa types are accepted (if visa_sponsorship is true)
