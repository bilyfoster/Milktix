-- Promo codes table
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    
    -- Discount type: PERCENTAGE, FIXED_AMOUNT, COMP (100% off)
    discount_type VARCHAR(20) NOT NULL,
    
    -- Discount value: percentage (0-100) or fixed amount
    discount_value DECIMAL(10,2) NOT NULL,
    
    -- Scope: GLOBAL (all events) or EVENT_SPECIFIC
    scope VARCHAR(20) DEFAULT 'GLOBAL',
    
    -- Optional: specific event ID
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    
    -- Optional: specific ticket types
    applicable_ticket_types UUID[], -- array of ticket_type IDs
    
    -- Usage limits
    max_uses INTEGER, -- null = unlimited
    max_uses_per_user INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    
    -- Minimum order requirements
    min_tickets INTEGER DEFAULT 1,
    min_amount DECIMAL(10,2), -- minimum order amount
    
    -- Validity period
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Track promo code usage
CREATE TABLE promo_code_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    discount_applied DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX idx_promo_codes_event ON promo_codes(event_id);
CREATE INDEX idx_promo_codes_scope ON promo_codes(scope);
CREATE INDEX idx_promo_code_usage_code ON promo_code_usage(promo_code_id);
CREATE INDEX idx_promo_code_usage_user ON promo_code_usage(user_id);

-- Insert example promo codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, scope, max_uses, end_date, is_active) VALUES
('WELCOME20', '20% off your first order', 'PERCENTAGE', 20, 'GLOBAL', 100, '2026-12-31 23:59:59', true),
('EARLYBIRD', 'Early bird special - $10 off', 'FIXED_AMOUNT', 10, 'EVENT_SPECIFIC', null, '2026-06-30 23:59:59', true),
('COMP2026', 'Complimentary ticket', 'COMP', 100, 'GLOBAL', 50, '2026-12-31 23:59:59', true),
('GROUP5', 'Group discount - 15% off 5+ tickets', 'PERCENTAGE', 15, 'GLOBAL', null, '2026-12-31 23:59:59', true);
