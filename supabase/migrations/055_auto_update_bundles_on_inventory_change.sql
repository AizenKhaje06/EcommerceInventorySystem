-- Migration: Auto-update bundle quantities when inventory changes
-- Date: 2026-07-02
-- Description: Create trigger to automatically recalculate bundle quantities when component items are sold, restocked, or reduced

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_bundles_on_inventory_change ON inventory;

-- Create trigger function to update all affected bundles when inventory changes
CREATE OR REPLACE FUNCTION update_bundles_on_inventory_change()
RETURNS TRIGGER AS $$
DECLARE
  affected_bundle_record RECORD;
BEGIN
  -- Find all bundles that contain this inventory item
  FOR affected_bundle_record IN 
    SELECT DISTINCT bi.bundle_id
    FROM bundle_items bi
    WHERE bi.item_id = NEW.id
  LOOP
    -- Recalculate the bundle's quantity based on component availability
    UPDATE bundles
    SET quantity = calculate_bundle_virtual_stock(affected_bundle_record.bundle_id)
    WHERE id = affected_bundle_record.bundle_id;
    
    -- Log the update for debugging
    RAISE NOTICE 'Updated bundle % quantity due to inventory change in item %', 
      affected_bundle_record.bundle_id, NEW.id;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on inventory table
-- This will fire AFTER any UPDATE to inventory quantity
CREATE TRIGGER trigger_update_bundles_on_inventory_change
AFTER UPDATE OF quantity ON inventory
FOR EACH ROW
WHEN (OLD.quantity IS DISTINCT FROM NEW.quantity)
EXECUTE FUNCTION update_bundles_on_inventory_change();

-- Add comments for documentation
COMMENT ON FUNCTION update_bundles_on_inventory_change IS 'Automatically updates bundle quantities when component item quantities change';
COMMENT ON TRIGGER trigger_update_bundles_on_inventory_change ON inventory IS 'Recalculates affected bundle quantities after inventory quantity updates';

-- Initial sync: Update all existing bundles to ensure correct quantities
DO $$
DECLARE
  bundle_record RECORD;
  old_qty INTEGER;
  new_qty INTEGER;
BEGIN
  FOR bundle_record IN SELECT id, quantity FROM bundles WHERE is_active = true
  LOOP
    old_qty := bundle_record.quantity;
    new_qty := calculate_bundle_virtual_stock(bundle_record.id);
    
    UPDATE bundles
    SET quantity = new_qty
    WHERE id = bundle_record.id;
    
    IF old_qty != new_qty THEN
      RAISE NOTICE 'Synced bundle %: % -> % units', bundle_record.id, old_qty, new_qty;
    END IF;
  END LOOP;
END $$;
