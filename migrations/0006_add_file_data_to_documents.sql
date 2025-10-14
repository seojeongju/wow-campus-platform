-- Add file_data column to documents table for Base64 storage
ALTER TABLE documents ADD COLUMN file_data TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_active ON documents(is_active);
