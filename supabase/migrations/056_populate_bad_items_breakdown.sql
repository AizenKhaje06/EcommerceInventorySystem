-- Migration: Populate empty bad_items_breakdown from existing bad_item_reason
-- Date: 2026-07-02
-- Description: Backfill bad_items_breakdown for items that have bad_item_reason but empty breakdown

-- Function to convert reason text to breakdown key
CREATE OR REPLACE FUNCTION get_breakdown_key(reason_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Convert reason text to lowercase and replace spaces with hyphens
  -- Example: "Expired" -> "expired", "Customer Return" -> "customer-return"
  RETURN LOWER(REPLACE(TRIM(reason_text), ' ', '-'));
END;
$$ LANGUAGE plpgsql;

-- Update all bad items that have a reason but empty or null breakdown
DO $$
DECLARE
  item_record RECORD;
  breakdown_key TEXT;
  updated_count INTEGER := 0;
BEGIN
  -- Loop through all bad items with empty breakdown
  FOR item_record IN 
    SELECT id, name, bad_item_quantity, bad_item_reason, bad_items_breakdown
    FROM inventory
    WHERE item_status = 'bad' 
      AND bad_item_reason IS NOT NULL 
      AND bad_item_quantity > 0
      AND (bad_items_breakdown IS NULL OR bad_items_breakdown = '{}' OR bad_items_breakdown = 'null')
  LOOP
    -- Convert reason to breakdown key
    breakdown_key := get_breakdown_key(item_record.bad_item_reason);
    
    -- Create breakdown JSON with the reason as key and quantity as value
    UPDATE inventory
    SET bad_items_breakdown = jsonb_build_object(breakdown_key, item_record.bad_item_quantity)
    WHERE id = item_record.id;
    
    updated_count := updated_count + 1;
    
    RAISE NOTICE 'Updated item %: % -> breakdown[%] = %', 
      item_record.name, 
      item_record.bad_item_reason,
      breakdown_key,
      item_record.bad_item_quantity;
  END LOOP;
  
  RAISE NOTICE 'Total items updated: %', updated_count;
END $$;

-- Drop the temporary function
DROP FUNCTION IF EXISTS get_breakdown_key(TEXT);

-- Add comment
COMMENT ON COLUMN inventory.bad_items_breakdown IS 'JSONB breakdown of bad items by reason. Auto-populated from bad_item_reason for legacy data.';

-- Verify results (this will show in logs)
DO $$
DECLARE
  sample_record RECORD;
BEGIN
  RAISE NOTICE '=== Sample Results After Update ===';
  FOR sample_record IN 
    SELECT name, bad_item_quantity, bad_item_reason, bad_items_breakdown
    FROM inventory
    WHERE item_status = 'bad'
    LIMIT 5
  LOOP
    RAISE NOTICE 'Item: % | Qty: % | Reason: % | Breakdown: %',
      sample_record.name,
      sample_record.bad_item_quantity,
      sample_record.bad_item_reason,
      sample_record.bad_items_breakdown;
  END LOOP;
END $$;
