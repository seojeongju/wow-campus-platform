-- Migration: Add agent region and profile fields
-- Description: Add fields for agent regions, contact info, and profile details
-- Date: 2025-10-18

-- Add region and contact fields to agents table
ALTER TABLE agents ADD COLUMN primary_regions TEXT; -- JSON array of regions
ALTER TABLE agents ADD COLUMN language_skills TEXT; -- JSON object {korean: 'advanced', english: 'intermediate', etc}
ALTER TABLE agents ADD COLUMN introduction TEXT; -- Agency introduction
ALTER TABLE agents ADD COLUMN contact_phone TEXT; -- Contact phone number
ALTER TABLE agents ADD COLUMN contact_email TEXT; -- Contact email
ALTER TABLE agents ADD COLUMN certifications TEXT; -- JSON array of certifications
ALTER TABLE agents ADD COLUMN service_areas TEXT; -- JSON array of service specializations

-- Create index for region-based queries
CREATE INDEX IF NOT EXISTS idx_agents_regions ON agents(primary_regions);
