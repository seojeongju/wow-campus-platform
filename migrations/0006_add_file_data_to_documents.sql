-- Add file_data column to documents table for Base64 storage
-- Note: This migration may fail if column already exists (safe to ignore)
-- ALTER TABLE documents ADD COLUMN file_data TEXT;

-- Add index for faster queries (these are idempotent)
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_active ON documents(is_active);
