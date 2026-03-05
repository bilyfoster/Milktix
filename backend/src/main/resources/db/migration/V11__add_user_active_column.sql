-- Add active column to users table (complements the status enum)
ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT true;

-- Update existing rows to set active based on status
UPDATE users SET active = (status = 'ACTIVE');

-- Create index for active filter
CREATE INDEX idx_users_active ON users(active);
