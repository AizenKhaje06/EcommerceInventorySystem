-- Fixed products_unified view with bad item tracking
-- Bundles use updated_at instead of last_updated
-- Bundles had category removed in migration 028

DROP VIEW IF EXISTS products_unified CASCADE;

CREATE OR REPLACE VIEW products_unified AS
-- Regular inventory items
SELECT 
  id,
  name,
  category,
  store,
  sales_channel AS "salesChannel",
  quantity,
  cost_price AS "costPrice",
  selling_price AS "sellingPrice",
  reorder_level AS "reorderLevel",
  last_updated AS "lastUpdated",
  image_url AS "imageUrl",
  'regular' AS "productType",
  -- Bad Item Tracking (new columns)
  item_status,
  bad_item_reason,
  bad_item_quantity
FROM inventory

UNION ALL

-- Bundles (no category, uses updated_at, no bad item tracking)
SELECT 
  id,
  name,
  'General' AS category,  -- Default category for bundles since column was removed
  'Bundle' AS store,
  sales_channel AS "salesChannel",
  quantity,
  bundle_cost AS "costPrice",
  bundle_price AS "sellingPrice",
  reorder_level AS "reorderLevel",
  updated_at AS "lastUpdated",  -- Bundles use updated_at not last_updated
  image_url AS "imageUrl",
  'bundle' AS "productType",
  -- Bundles are always 'good' (no bad item tracking for bundles)
  'good' AS item_status,
  NULL AS bad_item_reason,
  0 AS bad_item_quantity
FROM bundles;
