-- Add visa_types field to companies table
-- This allows storing specific visa types that are accepted for company recruitment
-- 작성일: 2025-01-XX

ALTER TABLE companies ADD COLUMN visa_types TEXT DEFAULT '[]';

-- visa_types will store JSON array of visa codes (e.g., ["E-7", "E-9", "F-2", "F-4", "F-5", "F-6", "H-2"])
-- Default is empty array '[]'

