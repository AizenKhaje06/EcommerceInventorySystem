-- ============================================
-- ADD reason COLUMN TO ORDERS TABLE
-- Migration 053
-- ============================================

-- Add reason column to store return/cancellation reason from tracker
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS reason TEXT;

-- Add comment for documentation
COMMENT ON COLUMN orders.reason IS 'Reason for cancelled or returned parcel status (e.g. Customer Refused, Incorrect Address)';

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name = 'reason';
