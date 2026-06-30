-- Migration: Add item status tracking for good/bad items
-- Purpose: Track items that have been reduced due to damage, spoilage, etc.
-- Date: 2026-06-30

-- Add item_status column to inventory table
ALTER TABLE inventory
ADD COLUMN IF NOT EXISTS item_status TEXT DEFAULT 'good' CHECK (item_status IN ('good', 'bad'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_item_status ON inventory(item_status);

-- Add comment
COMMENT ON COLUMN inventory.item_status IS 'Item condition: good (sellable) or bad (damaged/spoiled/not sellable)';

-- Add bad_item_reason column to track why item was marked as bad
ALTER TABLE inventory
ADD COLUMN IF NOT EXISTS bad_item_reason TEXT;

COMMENT ON COLUMN inventory.bad_item_reason IS 'Reason why item was marked as bad (e.g., Damage, Spoilage, Quality Rejection)';

-- Add bad_item_quantity column to track how many units are bad
ALTER TABLE inventory
ADD COLUMN IF NOT EXISTS bad_item_quantity INTEGER DEFAULT 0;

COMMENT ON COLUMN inventory.bad_item_quantity IS 'Number of units that are marked as bad/unsellable';
