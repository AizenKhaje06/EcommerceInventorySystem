-- Migration: Add bad items breakdown column
-- Date: 2026-07-01
-- Purpose: Track bad items by reason for detailed breakdown display

-- Add JSONB column to store bad items breakdown by reason
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS bad_items_breakdown JSONB DEFAULT '{}';

-- Example structure:
-- {
--   "damage": 50,
--   "defect": 30,
--   "expired": 20,
--   "lost": 10
-- }

-- Create index for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_inventory_bad_items_breakdown ON inventory USING gin(bad_items_breakdown);

-- Comment
COMMENT ON COLUMN inventory.bad_items_breakdown IS 'JSONB object storing bad item quantities by reason';
