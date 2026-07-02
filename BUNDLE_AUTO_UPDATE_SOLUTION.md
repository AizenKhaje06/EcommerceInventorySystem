# Bundle Auto-Update Solution

## Problem
Bundle product quantities were NOT automatically updating when:
1. Individual items in the bundle are sold (per piece)
2. Individual items in the bundle are restocked
3. Individual items in the bundle are reduced

## Root Cause
The database had a function `calculate_bundle_virtual_stock()` that can calculate how many bundles can be made based on component items, BUT it only triggered when bundle_items were inserted. There was no trigger to recalculate bundle quantities when the inventory table is updated.

## Solution
Created migration `055_auto_update_bundles_on_inventory_change.sql` that:

### 1. Created a Trigger Function
- `update_bundles_on_inventory_change()` - Finds all bundles that contain the changed inventory item and recalculates their quantities

### 2. Created a Trigger
- `trigger_update_bundles_on_inventory_change` - Fires AFTER any UPDATE to the `quantity` column in the `inventory` table
- Only fires when quantity actually changes (performance optimization)

### 3. How It Works
**Example Scenario:**
- Bundle "Starter Pack" contains:
  - 2x Product A
  - 1x Product B
  - 3x Product C

**Inventory:**
- Product A: 10 units (can make 5 bundles)
- Product B: 8 units (can make 8 bundles)
- Product C: 6 units (can make 2 bundles)

**Bundle Quantity:** 2 (limited by Product C)

**When Product A is sold (10 → 8):**
- Trigger fires
- Recalculates bundle: min(8/2, 8/1, 6/3) = min(4, 8, 2) = **2 bundles**
- Bundle quantity stays 2 ✓

**When Product C is restocked (6 → 12):**
- Trigger fires
- Recalculates bundle: min(8/2, 8/1, 12/3) = min(4, 8, 4) = **4 bundles**
- Bundle quantity updates to 4 ✓

**When Product B is reduced (8 → 3):**
- Trigger fires
- Recalculates bundle: min(8/2, 3/1, 12/3) = min(4, 3, 4) = **3 bundles**
- Bundle quantity updates to 3 ✓

### 4. Initial Sync
The migration also includes a one-time sync that updates all existing bundles to ensure their quantities are correct based on current inventory levels.

## How to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire content of `supabase/migrations/055_auto_update_bundles_on_inventory_change.sql`
5. Paste it into the SQL editor
6. Click **Run** or press `Ctrl+Enter`
7. Check for success message

### Option 2: Supabase CLI
```bash
# If you have Supabase CLI linked to your project
npx supabase db push
```

### Option 3: Manual Execution
Connect to your Supabase database using any PostgreSQL client and execute the migration file.

## Verification

After applying the migration, you can verify it's working:

1. **Check if trigger exists:**
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_bundles_on_inventory_change';
```

2. **Test the auto-update:**
```sql
-- Find a bundle and its components
SELECT b.id, b.name, b.quantity as bundle_qty, 
       bi.item_id, i.name as item_name, i.quantity as item_qty, bi.quantity as needed_qty
FROM bundles b
JOIN bundle_items bi ON bi.bundle_id = b.id
JOIN inventory i ON i.id = bi.item_id
WHERE b.is_active = true
LIMIT 1;

-- Update one of the component items
UPDATE inventory SET quantity = quantity - 1 WHERE id = '[item_id_from_above]';

-- Check if bundle quantity auto-updated
SELECT id, name, quantity FROM bundles WHERE id = '[bundle_id_from_above]';
```

## Benefits

✅ **Automatic synchronization** - Bundle quantities always reflect current component availability
✅ **Real-time updates** - No manual recalculation needed
✅ **Prevents overselling** - Bundle quantity is limited by the component with lowest availability
✅ **Works across all operations:**
   - Sales (regular checkout)
   - Restocking
   - Stock reduction
   - Internal usage
   - Transfers
   - Any inventory adjustment

## Technical Details

- **Trigger Type:** AFTER UPDATE
- **Trigger Level:** ROW (fires for each updated row)
- **Trigger Condition:** Only when quantity column changes
- **Performance:** Optimized to only update affected bundles
- **Database Function:** Uses existing `calculate_bundle_virtual_stock()` function

## Notes

- The trigger uses `RAISE NOTICE` for debugging (visible in database logs)
- If a component item quantity becomes 0, the bundle quantity will automatically become 0
- The migration is idempotent (safe to run multiple times)
- No changes needed in application code - everything happens at database level

## Migration File Location
`supabase/migrations/055_auto_update_bundles_on_inventory_change.sql`
