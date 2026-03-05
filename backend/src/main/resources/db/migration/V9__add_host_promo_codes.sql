-- Add host_id column to promo_codes table for HOST_SPECIFIC scope
ALTER TABLE promo_codes 
    ADD COLUMN host_id UUID REFERENCES hosts(id) ON DELETE SET NULL;

-- Create index on host_id for performance
CREATE INDEX idx_promo_codes_host ON promo_codes(host_id);

-- Add index for scope + host_id combination (common query pattern)
CREATE INDEX idx_promo_codes_scope_host ON promo_codes(scope, host_id);
