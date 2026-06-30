# Bad Item Tracking Feature - Testing Guide

## ✅ Implementation Complete!

All backend and frontend code is now implemented. Follow these tests to verify everything works correctly.

---

## Prerequisites

**IMPORTANT**: Make sure you've run the database migration in Supabase first!

1. Open Supabase SQL Editor
2. Run the migration file: `supabase/migrations/053_add_item_status_tracking.sql`
3. Verify columns added: `item_status`, `bad_item_reason`, `bad_item_quantity`

If you haven't done this yet, the feature won't work!

---

## Test Scenario 1: Mark Item as Defective (Damage)

### Steps:
1. **Go to Inventory page** (`/dashboard/inventory`)
2. **Find a product** that has stock (quantity > 0)
3. **Click "Adjust Stock"** button for that product
4. **Switch to "Reduce" tab** in the dialog
5. **Enter amount**: `5` (or any number)
6. **Select reason**: "Damage"
7. **Click "Reduce Stock"**

### Expected Results:
- ✅ Success notification appears
- ✅ The product row now has a **RED background**
- ✅ A **"Defective" badge** (red with X icon) appears next to the product name
- ✅ Below the product name, you see: **"Reason: Damage"** in red text
- ✅ The quantity decreased by 5

### Database Verification (Optional):
```sql
SELECT name, item_status, bad_item_reason, bad_item_quantity
FROM inventory
WHERE name = 'YOUR_PRODUCT_NAME';
```
- `item_status` should be `'bad'`
- `bad_item_reason` should be `'Damage'`
- `bad_item_quantity` should be `5` (or your entered amount)

---

## Test Scenario 2: Mark Item as Defective (Spoilage)

### Steps:
1. Find another product
2. Click "Adjust Stock" → "Reduce" tab
3. Amount: `3`
4. Reason: **"Spoilage"**
5. Click "Reduce Stock"

### Expected Results:
- ✅ Row turns RED
- ✅ "Defective" badge appears
- ✅ Reason shows: "Reason: Spoilage"

---

## Test Scenario 3: Reduce Item WITHOUT Marking as Defective

### Steps:
1. Find a different product (not defective yet)
2. Click "Adjust Stock" → "Reduce" tab
3. Amount: `2`
4. Reason: **"Internal Use"**
5. Click "Reduce Stock"

### Expected Results:
- ✅ Success notification appears
- ✅ Quantity decreased by 2
- ❌ Row stays NORMAL (white/gray background)
- ❌ NO "Defective" badge
- ❌ NO red highlighting

This is correct! "Internal Use" should NOT mark items as bad.

---

## Test Scenario 4: Status Filter - Good Items

### Steps:
1. On Inventory page, find the **Status Filter dropdown** (next to "All Types")
2. Click the dropdown
3. Select **"Good Items"** (with green checkmark icon)

### Expected Results:
- ✅ Only NON-defective items are visible
- ✅ All red-highlighted rows disappear
- ✅ Item count updates correctly

---

## Test Scenario 5: Status Filter - Defective Items

### Steps:
1. Click the Status Filter dropdown
2. Select **"Defective Items"** (with red X icon)

### Expected Results:
- ✅ Only RED-highlighted items are visible
- ✅ All items have the "Defective" badge
- ✅ Each shows its reason below the name
- ✅ Item count shows only defective items

---

## Test Scenario 6: Status Filter - All Items

### Steps:
1. Click the Status Filter dropdown
2. Select **"All Items"**

### Expected Results:
- ✅ Both good and defective items visible
- ✅ Defective items still have red highlighting
- ✅ Normal items have standard styling

---

## Test Scenario 7: POS Page - Defective Items Hidden

### Steps:
1. **Remember the name** of a defective item from Inventory page
2. **Go to POS page** (`/dashboard/pos`)
3. **Look for that defective item** in the product list
4. **Try searching** for it in the search bar

### Expected Results:
- ❌ Defective item should NOT appear in product list
- ❌ Searching for it should return NO results
- ✅ Only good (sellable) items are visible
- ✅ You cannot add defective items to cart

**This is the key feature**: Defective items CANNOT be sold in POS!

---

## Test Scenario 8: Restock a Defective Item

### Steps:
1. Go back to **Inventory page**
2. Find a defective item (red row)
3. Click **"Adjust Stock"**
4. Stay on **"Restock" tab**
5. Enter amount: `10`
6. Reason: "Supplier restock"
7. Click **"Restock"**

### Expected Results:
- ✅ Quantity increases by 10
- ✅ Item is STILL marked as defective (red row)
- ✅ "Defective" badge STILL shows

**Note**: Restocking does NOT change the item status. Once marked as bad, it stays bad. This is intentional - the item already contains defective units.

---

## Test Scenario 9: Multiple Defect Reasons

Test each of these reasons - all should mark item as defective:
- ✅ **Damage** → Red row
- ✅ **Spoilage** → Red row
- ✅ **Theft/Loss** → Red row
- ✅ **Quality Rejection** → Red row
- ✅ **Customer Return (Defective)** → Red row

These should NOT mark as defective:
- ❌ **Internal Use** → Normal row
- ❌ **Other** → Normal row

---

## Test Scenario 10: Visual Consistency

### Check These Visual Elements:
1. **Red Background**: 
   - Light mode: `bg-red-50` (light pink/red)
   - Dark mode: `bg-red-900/20` (dark red tint)
   - Border: Red left border (4px wide)

2. **Defective Badge**:
   - Red background with white text
   - X icon next to "Defective" text
   - Small size (`text-[10px]`)

3. **Reason Text**:
   - Red color
   - Smaller font (`text-xs`)
   - Shows below product name
   - Format: "Reason: [reason name]"

4. **Filter Dropdown Icons**:
   - Good Items: Green checkmark
   - Defective Items: Red X
   - All Items: No icon

---

## Troubleshooting

### If Red Highlighting Doesn't Appear:
1. Check browser console for errors
2. Verify migration ran successfully in Supabase
3. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Check if `item_status` column exists in database

### If Filter Doesn't Work:
1. Check if statusFilter state is updating (React DevTools)
2. Verify useEffect dependencies include `statusFilter`
3. Check browser console for filter-related errors

### If POS Still Shows Defective Items:
1. Check `/api/items` endpoint is receiving `?status=good`
2. Verify API response doesn't include bad items
3. Check client-side filter: `items.filter(i => i.item_status !== 'bad')`

### If Reduce Operation Fails:
1. Check browser console for API errors
2. Verify reduce API endpoint is accessible
3. Check Supabase connection and permissions
4. Look for SQL errors in API logs

---

## Success Criteria

All tests pass if:
- ✅ Reducing with damage/spoilage reasons marks items as bad
- ✅ Red highlighting and badges appear correctly
- ✅ Status filter works for all 3 options
- ✅ POS page completely hides defective items
- ✅ Reason text displays below product name
- ✅ Internal Use does NOT mark items as bad
- ✅ Visual styling is consistent and clear

---

## What to Report

After testing, please report:
1. ✅ Which tests passed
2. ❌ Which tests failed (if any)
3. 🐛 Any bugs or unexpected behavior
4. 💭 Any suggestions for improvements

---

## Feature Complete! 🎉

Once all tests pass, the Bad Item Tracking feature is fully operational and ready for production use!
