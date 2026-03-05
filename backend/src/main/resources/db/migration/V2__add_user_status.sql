CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
ALTER TABLE users ADD COLUMN status user_status DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
