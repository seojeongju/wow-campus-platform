-- Create inquiries table for online consultation integration
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER, -- Optional: link to registered user if logged in
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- general, technical, partnership, etc.
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, in_progress, resolved
  admin_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookup by status and email
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);
