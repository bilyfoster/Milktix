-- Check-in tracking
CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id),
    event_id UUID NOT NULL REFERENCES events(id),
    checked_in_by UUID REFERENCES users(id), -- staff member who checked in
    check_in_method VARCHAR(20) NOT NULL, -- QR_SCAN, MANUAL, API
    check_in_station VARCHAR(100), -- identifier for check-in station/location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    notes TEXT,
    checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reverted_at TIMESTAMP,
    reverted_by UUID REFERENCES users(id),
    revert_reason TEXT
);

-- Check-in stats materialized view helper
CREATE TABLE event_checkin_stats (
    event_id UUID PRIMARY KEY REFERENCES events(id),
    total_tickets INTEGER DEFAULT 0,
    checked_in INTEGER DEFAULT 0,
    no_show INTEGER DEFAULT 0,
    check_in_rate DECIMAL(5,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics events tracking
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL, -- PAGE_VIEW, TICKET_VIEW, CHECKOUT_START, etc.
    event_name VARCHAR(100),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(100),
    event_id UUID REFERENCES events(id), -- if event-related
    ticket_type_id UUID REFERENCES ticket_types(id),
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily sales summary for fast analytics
CREATE TABLE daily_sales_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    date DATE NOT NULL,
    tickets_sold INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0.00,
    orders_count INTEGER DEFAULT 0,
    unique_customers INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, date)
);

-- Indexes for performance
CREATE INDEX idx_checkins_ticket ON check_ins(ticket_id);
CREATE INDEX idx_checkins_event ON check_ins(event_id);
CREATE INDEX idx_checkins_time ON check_ins(checked_in_at);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_event ON analytics_events(event_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);
CREATE INDEX idx_sales_summary_event ON daily_sales_summary(event_id);
CREATE INDEX idx_sales_summary_date ON daily_sales_summary(date);
