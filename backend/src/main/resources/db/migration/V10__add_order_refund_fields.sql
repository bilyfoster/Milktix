-- Add refund fields to orders table
ALTER TABLE orders 
    ADD COLUMN refund_status VARCHAR(20) DEFAULT 'NONE' CHECK (refund_status IN ('NONE', 'PARTIAL', 'FULL')),
    ADD COLUMN refund_amount DECIMAL(19, 2),
    ADD COLUMN refund_reason TEXT,
    ADD COLUMN refund_at TIMESTAMP,
    ADD COLUMN refunded_by UUID;

-- Add cancellation fields to orders table
ALTER TABLE orders 
    ADD COLUMN cancelled_by UUID,
    ADD COLUMN cancel_reason TEXT;

-- Create indexes for refund status (common query pattern for admin filtering)
CREATE INDEX idx_orders_refund_status ON orders(refund_status);

-- Create index for refund date range queries
CREATE INDEX idx_orders_refund_at ON orders(refund_at);

-- Create composite index for admin order queries (status + created date)
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);

-- Create index for cancelled orders
CREATE INDEX idx_orders_cancelled_at ON orders(cancelled_at);
