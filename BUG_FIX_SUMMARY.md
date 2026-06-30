# Stock Reduction Bug Fix

## Issue Report:
**Reported By**: User  
**Date**: June 30, 2026  
**Symptom**: When reducing stock by 15 units, the table shows 30 units were reduced (double reduction)

## Root Cause Analysis:

### The Problem:
Stock was being reduced **TWICE** when using the Adjust Stock feature:

1. **First Reduction** (Correct): 
   - `reduce API` (`/api/items/[id]/reduce`) updates inventory
   - Reduces quantity by the specified amount
   
2. **Second Reduction** (Bug): 
   - `reduce API` calls `sales API` (`/api/sales`) to record transaction
   - `sales API` ALSO reduces inventory by the same amount
   - This causes double reduction!

### Code Flow (Before Fix):
```
User: "Reduce 15 units"
  ↓
reduce API: quantity = 100 - 15 = 85 ✅
  ↓
reduce API calls sales API to record transaction
  ↓
sales API: quantity = 85 - 15 = 70 ❌ (WRONG!)
  ↓
Result: 30 units reduced instead of 15
```

## Solution:

### Changes Made:

#### 1. Sales API (`app/api/sales/route.ts`)
Added optional parameter `skipStockUpdate`:
- When `skipStockUpdate: true`, sales API only records transaction
- Does NOT update inventory
- Existing sales/dispatch flows unaffected (still update inventory)

```typescript
// Extract skipStockUpdate from request body
const { items, department, staffName, notes, skipStockUpdate } = body

// Later in the code...
if (!skipStockUpdate) {
  // Only update inventory if not skipped
  transactionPromises.push(
    updateInventoryItem(inventoryItem.id, {
      quantity: inventoryItem.quantity - saleItem.quantity,
    })
  )
}
```

#### 2. Reduce API (`app/api/items/[id]/reduce/route.ts`)
Pass `skipStockUpdate: true` when calling sales API:

```typescript
body: JSON.stringify({
  items: [{ itemId: id, quantity: amount }],
  department: departmentInfo,
  staffName: displayName,
  notes: notes || `Stock reduced: ${reasonFormatted}`,
  skipStockUpdate: true  // ← NEW: Prevent double reduction
})
```

### Code Flow (After Fix):
```
User: "Reduce 15 units"
  ↓
reduce API: quantity = 100 - 15 = 85 ✅
  ↓
reduce API calls sales API with skipStockUpdate: true
  ↓
sales API: ONLY records transaction, does NOT update stock ✅
  ↓
Result: 15 units reduced (CORRECT!)
```

## Impact Assessment:

### ✅ Fixed:
- Stock reduction now works correctly (reduces by exact amount)
- Adjust Stock feature fully functional

### ✅ Unaffected:
- Regular sales/dispatch (still reduces stock correctly)
- Warehouse transfers (still works as before)
- Demo/Display tracking (unaffected)
- Internal usage (unaffected)
- Restock feature (uses different API, was never affected)

### ✅ Backward Compatible:
- `skipStockUpdate` is optional (defaults to false)
- All existing code continues to work without changes

## Testing Results:

### Before Fix:
- Reduce 15 units → 30 units reduced ❌
- Reduce 10 units → 20 units reduced ❌

### After Fix:
- Reduce 15 units → 15 units reduced ✅
- Reduce 10 units → 10 units reduced ✅

## Files Modified:
1. `app/api/sales/route.ts` - Added skipStockUpdate parameter
2. `app/api/items/[id]/reduce/route.ts` - Pass skipStockUpdate: true
3. `app/dashboard/inventory/page.tsx` - Enhanced logging (no functional change)
4. `ADJUST_STOCK_TESTING.md` - Updated testing guide
5. `BUG_FIX_SUMMARY.md` - This document

## Verification Steps:
1. Open inventory page
2. Note current stock (e.g., 100 units)
3. Click "Adjust Stock" → Switch to "Reduce" tab
4. Enter 15 units
5. Click "Reduce Stock"
6. Verify: Stock should be 85 units (100 - 15 = 85) ✅
7. NOT 70 units (100 - 30 would indicate bug still exists)

## Related Issues:
- None - This was an isolated issue in the reduce feature
- Restock feature was never affected (uses different API endpoint)

## Prevention:
- Added comprehensive logging to both APIs
- Console logs now show exact operations performed
- Easy to debug similar issues in the future

## Status: ✅ FIXED and TESTED
