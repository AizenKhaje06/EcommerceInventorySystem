# 🎯 BAD ITEM TRACKING - SUPABASE MIGRATION

## ⚡ QUICK INSTRUCTIONS (2 minutes)

### Step 1: Go to Supabase
Open: https://supabase.com/dashboard

### Step 2: Select Your Project
- Click: **WIHI Asia Inventory System** project

### Step 3: Open SQL Editor
- Left sidebar → Click **"SQL Editor"**
- Click **"New query"** button

### Step 4: Copy and Paste This SQL
```sql
-- Migration: Add Item Status Tracking for Bad/Defective Items
-- Date: 2026-06-30
-- Description: Track items marked as bad/defective (damage, spoilage, etc)
-- Purpose: Separate sellable items from unsellable items in inventory

-- Step 1: Add item status tracking columns
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS item_status TEXT DEFAULT 'good' CHECK (item_status IN ('good', 'bad')),
ADD COLUMN IF NOT EXISTS bad_item_reason TEXT,
ADD COLUMN IF NOT EXISTS bad_item_quantity INTEGER DEFAULT 0;

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_item_status ON inventory(item_status);
CREATE INDEX IF NOT EXISTS idx_inventory_bad_item_reason ON inventory(bad_item_reason);

-- Step 3: Add comments for documentation
COMMENT ON COLUMN inventory.item_status IS 'Item status: good (sellable) or bad (defective/unsellable)';
COMMENT ON COLUMN inventory.bad_item_reason IS 'Reason for marking as bad: Damage, Spoilage, Theft/Loss, Quality Rejection, Customer Return (Defective)';
COMMENT ON COLUMN inventory.bad_item_quantity IS 'Total quantity of bad items accumulated over time';

-- Step 4: Initialize existing items as 'good'
UPDATE inventory 
SET item_status = 'good', 
    bad_item_quantity = 0 
WHERE item_status IS NULL;

-- Step 5: Update products_unified view to include new columns
DROP VIEW IF EXISTS products_unified CASCADE;

CREATE OR REPLACE VIEW products_unified AS
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
  updated_at AS "lastUpdated",
  image_url AS "imageUrl",
  sku,
  'regular' AS "productType",
  -- Bad Item Tracking
  item_status,
  bad_item_reason,
  bad_item_quantity
FROM inventory

UNION ALL

SELECT 
  id,
  name,
  category,
  'Bundle' AS store,
  sales_channel AS "salesChannel",
  quantity,
  bundle_cost AS "costPrice",
  bundle_price AS "sellingPrice",
  reorder_level AS "reorderLevel",
  updated_at AS "lastUpdated",
  image_url AS "imageUrl",
  NULL AS sku,
  'bundle' AS "productType",
  -- Bundles don't have bad item tracking
  'good' AS item_status,
  NULL AS bad_item_reason,
  0 AS bad_item_quantity
FROM bundles;
```

### Step 5: Run the SQL
- Click **"Run"** button (or press `Ctrl + Enter`)

### Step 6: Verify Success
You should see:
```
Success. No rows returned
```

---

## ✅ VERIFICATION

### Check if columns were added:
```sql
-- Run this to verify the columns exist
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'inventory' 
  AND column_name IN ('item_status', 'bad_item_reason', 'bad_item_quantity')
ORDER BY column_name;
```

**Expected Result:**
```
column_name         | data_type | column_default
--------------------|-----------|---------------
bad_item_quantity   | integer   | 0
bad_item_reason     | text      | NULL
item_status         | text      | 'good'
```

### Check existing inventory items:
```sql
-- Check that all existing items are marked as 'good'
SELECT item_status, COUNT(*) as count
FROM inventory 
GROUP BY item_status;
```

**Expected Result:**
```
item_status | count
------------|-------
good        | [number of your existing items]
```

### Verify the view was updated:
```sql
-- Check if products_unified includes new columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products_unified' 
  AND column_name IN ('item_status', 'bad_item_reason', 'bad_item_quantity')
ORDER BY column_name;
```

**Expected Result:**
```
column_name
-------------------
bad_item_quantity
bad_item_reason
item_status
```

---

## 🎯 WHAT THIS DOES

1. **Adds 3 new columns** to `inventory` table:
   - `item_status`: 'good' or 'bad'
   - `bad_item_reason`: Why it was marked as bad
   - `bad_item_quantity`: Running total of bad items

2. **Creates indexes** for fast filtering by status

3. **Initializes existing items** as 'good' (sellable)

4. **Updates products_unified view** to include the new columns

5. **Handles bundles** correctly (bundles are always 'good')

---

## 🔍 WHAT HAPPENS NEXT

After this migration runs, the system will:

1. **When reducing stock with these reasons:**
   - ❌ **Damage** → Marks item as 'bad'
   - ❌ **Spoilage** → Marks item as 'bad'
   - ❌ **Theft/Loss** → Marks item as 'bad'
   - ❌ **Quality Rejection** → Marks item as 'bad'
   - ❌ **Customer Return (Defective)** → Marks item as 'bad'

2. **When reducing stock with these reasons:**
   - ✅ **Internal Use** → Stays 'good'
   - ✅ **Other** → Stays 'good'

3. **In Inventory page:**
   - Red highlighting for bad items
   - "Defective" badge
   - Filter by Good/Bad items

4. **In POS page:**
   - Defective items are HIDDEN
   - Cannot be sold

---

## ❓ WHAT IF...

### Error: "column already exists"
**Meaning:** You already ran this migration before!
**Action:** Nothing needed, it's already done! ✅

### Error: "view products_unified does not exist"
**Meaning:** The view might have been dropped or never created
**Action:** 
1. The migration creates it, so this should be fine
2. If error persists, check if there are other dependent views
3. Run verification queries above to confirm

### Error: "permission denied"
**Meaning:** Your database user doesn't have ALTER TABLE permission
**Action:** 
1. Check you're using the correct project
2. Make sure you're logged in as project owner
3. Contact Supabase support if issue persists

### No error but feature doesn't work
**Check:**
1. Did you hard refresh the browser? (Ctrl + Shift + R)
2. Check browser console for errors
3. Verify columns exist using verification queries above
4. Check if products_unified view includes new columns

---

## 📊 TESTING THE FEATURE

After running the migration, follow the **BAD_ITEM_TEST_GUIDE.md** for complete testing instructions.

**Quick Test:**
1. Go to Inventory page
2. Find a product with stock
3. Click "Adjust Stock" → "Reduce" tab
4. Amount: `5`, Reason: "Damage"
5. Click "Reduce Stock"
6. **Expected:** Row turns RED with "Defective" badge
7. Go to POS page
8. **Expected:** That product is NOT visible

---

## 🚀 SUMMARY

**Migration file:** `053_add_item_status_tracking.sql`
**Time needed:** 2 minutes
**Complexity:** Simple (copy-paste and run)
**Reversible:** Yes (can drop columns if needed)
**Safe:** Uses `IF NOT EXISTS` - won't break if run twice

---

## 🎉 YOU'RE DONE!

After running this SQL:
- ✅ Database schema updated
- ✅ All items initialized as 'good'
- ✅ Feature fully functional
- ✅ Ready to test!

**Next Step:** Follow **BAD_ITEM_TEST_GUIDE.md** to test the feature!

---

*Migration file: supabase/migrations/053_add_item_status_tracking.sql*
*Date: June 30, 2026*
*Status: Ready to run*
