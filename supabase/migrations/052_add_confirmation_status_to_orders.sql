-- Migration: Add Confirmation Status to Orders
-- Date: 2026-06-22
-- Description: Add confirmation_status column for waybill confirmation workflow
-- Purpose: Logistics/Admin confirms waybill receipt before packers can process

-- Step 1: Add confirmation_status column
-- Default 'Confirmed' for existing orders (backward compatibility)
-- New orders will be 'Unconfirmed' by default (handled in application logic)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS confirmation_status TEXT DEFAULT 'Confirmed' CHECK (confirmation_status IN ('Confirmed', 'Unconfirmed'));

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_orders_confirmation_status ON orders(confirmation_status);

-- Step 3: Add comments for documentation
COMMENT ON COLUMN orders.confirmation_status IS 'Waybill confirmation status: Confirmed (waybill received by logistics), Unconfirmed (waybill not yet received)';

-- Step 4: Update existing orders to 'Confirmed' (if any have NULL)
UPDATE orders 
SET confirmation_status = 'Confirmed' 
WHERE confirmation_status IS NULL;

