# Fix: Populate Bad Items Breakdown

## Problem
Existing bad items have `bad_item_reason` and `bad_item_quantity` but the `bad_items_breakdown` field is empty `{}`. This causes the Bad Stock table to show all dashes (-) in the breakdown columns.

## Solution
Apply migration `056_populate_bad_items_breakdown.sql` to automatically populate the breakdown field.

## How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open the file: `supabase/migrations/056_populate_bad_items_breakdown.sql`
5. Copy ALL the content
6. Paste into the SQL Editor
7. Click **Run** (or press `Ctrl + Enter`)
8. Wait for success message
9. Check the logs/output for update count

### Option 2: Using psql or Database Client

```bash
# Connect to your database
psql -h your-db-host -U postgres -d postgres

# Run the migration
\i supabase/migrations/056_populate_bad_items_breakdown.sql
```

## What It Does

1. **Finds** all bad items with:
   - `item_status = 'bad'`
   - `bad_item_reason` is NOT NULL
   - `bad_item_quantity > 0`
   - `bad_items_breakdown` is empty or null

2. **Converts** reason text to breakdown key:
   - "Expired" → `expired`
   - "Customer Return" → `customer-return`
   - "Damaged" → `damaged`

3. **Updates** `bad_items_breakdown` with:
   ```json
   { "expired": 150 }
   ```

4. **Shows** sample results in logs

## Example

**BEFORE:**
```
name: FEMFRESH
bad_item_quantity: 150
bad_item_reason: Expired
bad_items_breakdown: {}
```

**AFTER:**
```
name: FEMFRESH
bad_item_quantity: 150
bad_item_reason: Expired
bad_items_breakdown: {"expired": 150}
```

## Expected Results

After running the migration:

**In Bad Stock Table:**
- FEMFRESH: "Expired" column should show **150** in yellow badge
- LIPOCOLLA: "Expired" column should show **100** in yellow badge
- FRESH MASCULINE WASH: "Expired" column should show **400** in yellow badge

## Verification

Run this query to check:

```sql
SELECT 
  name, 
  bad_item_quantity, 
  bad_item_reason, 
  bad_items_breakdown
FROM inventory
WHERE item_status = 'bad'
ORDER BY name;
```

Should show breakdown populated with values instead of `{}`.

## Rollback (if needed)

To revert changes:

```sql
UPDATE inventory
SET bad_items_breakdown = '{}'
WHERE item_status = 'bad';
```

## Notes

- ✅ Safe to run multiple times (idempotent)
- ✅ Only updates items with empty breakdown
- ✅ Does NOT modify items that already have breakdown data
- ✅ Uses existing `bad_item_reason` and `bad_item_quantity`
- ✅ Future reduce operations will automatically populate breakdown correctly

## After Migration

Refresh your Inventory page and filter to "Bad Stock" - you should now see the breakdown columns populated with the correct quantities! 🎉
