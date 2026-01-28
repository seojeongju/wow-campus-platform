-- Migration: Add agent relationship to companies
-- Description: Allows companies to have an assigned agent
-- Date: 2025-10-18

-- Add agent_id column to companies table
ALTER TABLE companies ADD COLUMN agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_companies_agent ON companies(agent_id);
