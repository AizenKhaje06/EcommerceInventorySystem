-- Migration: Add bad_items_breakdown to products_unified view
-- Date: 2026-07-02
-- Description: Include bad item tracking fields in products_unified view for bad stock table

-- Drop existing view
DROP VIEW IF EXISTS products_unified;

-- Recreate view with bad item tracking fields
CREATE VIEW products_unified AS
-- Regular products from inventory
SELECT 
    id,
    name,
    'regular' as "productType",
    category,
    store,
    sales_channel as "salesChannel",
    quantity,
    cost_price as "costPrice",
    selling_price as "sellingPrice",
    reorder_level as "reorderLevel",
    last_updated as "lastUpdated",
    sku,
    image_url as "imageUrl",
    -- Bad Item Tracking (only regular products have these)
    item_status,
    bad_item_reason,
    bad_item_quantity,
    bad_items_breakdown,
    -- Bundle fields (NULL for regular products)
    NULL::decimal as "bundleCost",
    NULL::decimal as "regularPrice",
    NULL::decimal as savings,
    NULL::text as badge
FROM inventory

UNION ALL

-- Bundles (bundles don't have bad item tracking)
SELECT 
    id,
    name,
    'bundle' as "productType",
    'Bundles' as category,
    store,
    sales_channel as "salesChannel",
    quantity,
    bundle_cost as "costPrice",
    bundle_price as "sellingPrice",
    reorder_level as "reorderLevel",
    updated_at as "lastUpdated",
    NULL::text as sku,
    image_url as "imageUrl",
    -- Bad Item Tracking (NULL for bundles)
    'good'::text as item_status,
    NULL::text as bad_item_reason,
    0 as bad_item_quantity,
    '{}'::jsonb as bad_items_breakdown,
    -- Bundle fields
    bundle_cost as "bundleCost",
    regular_price as "regularPrice",
    savings,
    badge
FROM bundles
WHERE is_active = true;

-- Grant permissions
GRANT SELECT ON products_unified TO authenticated, anon;

-- Add comment
COMMENT ON VIEW products_unified IS 'Unified view of regular products and bundles with bad item tracking and consistent camelCase column naming';
