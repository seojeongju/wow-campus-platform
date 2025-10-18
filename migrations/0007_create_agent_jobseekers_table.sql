-- Migration: Create agent_jobseekers relationship table
-- Description: Adds table to track which agents manage which jobseekers
-- Date: 2025-10-18

-- Agent-Jobseeker relationship table
CREATE TABLE IF NOT EXISTS agent_jobseekers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INTEGER NOT NULL,
  jobseeker_id INTEGER NOT NULL,
  assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  notes TEXT,
  commission_earned DECIMAL(10,2) DEFAULT 0.00,
  placement_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  FOREIGN KEY (jobseeker_id) REFERENCES jobseekers(id) ON DELETE CASCADE,
  UNIQUE(agent_id, jobseeker_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agent_jobseekers_agent ON agent_jobseekers(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_jobseekers_jobseeker ON agent_jobseekers(jobseeker_id);
CREATE INDEX IF NOT EXISTS idx_agent_jobseekers_status ON agent_jobseekers(status);
CREATE INDEX IF NOT EXISTS idx_agent_jobseekers_assigned_date ON agent_jobseekers(assigned_date);
