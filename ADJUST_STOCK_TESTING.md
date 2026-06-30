# Adjust Stock Feature - Testing Guide

## Status: Fixed - Ready for Re-Testing ✅

## Critical Bug Fixed:
❌ **PREVIOUS BUG**: Reducing 15 units would actually reduce 30 units (double reduction)
✅ **ROOT CAUSE**: Stock was being reduced TWICE:
   1. In reduce API (correct)
   2. In sales API when recording transaction (incorrect)

✅ **FIX APPLIED**: Added `skipStockUpdate: true` parameter to sales API call
   - Now sales API only records the transaction
   - Stock is only reduced once in the reduce API

## What Was Done:
1. ✅ Deleted `.next` folder to fix ChunkLoadError
2. ✅ Restarted dev server (running on http://localhost:3001)
3. ✅ Added detailed console logging for debugging
4. ✅ Improved error handling and notifications
5. ✅ Enhanced success messages with quantity details

## Changes Made:

### Critical Fix (`app/api/sales/route.ts`):
- Added `skipStockUpdate` parameter (optional, defaults to false)
- When `skipStockUpdate: true`, sales API only records transaction WITHOUT updating stock
- This prevents double reduction when called from reduce API

### Reduce API (`app/api/items/[id]/reduce/route.ts`):
- Now passes `skipStockUpdate: true` when calling sales API
- Stock is only updated once in reduce API
- Sales API just records the transaction for tracking

### Frontend (`app/dashboard/inventory/page.tsx`):
- Added better validation messages
- Added console logging at each step
- Enhanced success notifications to show exact quantity changed
- Added error details to error messages
- Reset `adjustAmount` to 0 when closing modal

### Backend (`app/api/items/[id]/reduce/route.ts`):
- Added detailed console logging for each operation:
  - Request received with parameters
  - Validation checks
  - Inventory lookup
  - Stock update
  - Transaction recording
  - Log entry creation
- Added response status logging for transaction recording

## How to Test:

### 1. Open the Application
- Navigate to: http://localhost:3001/dashboard/inventory
- Login with your admin account

### 2. Test Reduce Stock (Deduct)
1. Find a product with stock quantity (e.g., has 10 units)
2. Click the "Adjust Stock" button (green arrow icon) in the Action column
3. Modal should open with "Adjust Stock" title
4. Click the **"Reduce (Deduct)"** tab (should turn red)
5. Enter amount (e.g., 2 units)
6. Select a reason from dropdown:
   - Damage
   - Spoilage/Expiry
   - Theft/Loss
   - Quality Rejection
   - Customer Return (Defective)
   - Internal Use
   - Other
7. Optionally add notes
8. Click **"Reduce Stock"** button (red)

### 3. Expected Results:
✅ **SUCCESS NOTIFICATION** should appear: "Stock reduced by 15 units!" (exact amount you entered)
✅ **TABLE UPDATE**: Product quantity should decrease by EXACTLY 15 (e.g., 100 → 85)
   - **NOT** 30 (bug is fixed!)
✅ **MODAL CLOSES** automatically
✅ **CONSOLE LOGS** should show:
   - [Adjust Stock] Starting adjustment: {...}
   - [Reduce API] Request received: {...}
   - [Reduce API] Item found: {...}
   - [Reduce API] Updating inventory: {...}
   - [Reduce API] Inventory updated successfully
   - [Reduce API] Transaction recorded successfully
   - [Reduce API] Operation completed successfully
   - [Adjust Stock] Items refreshed successfully

### 4. Test Restock (Add)
1. Click "Adjust Stock" button again on the same product
2. Keep the **"Restock (Add)"** tab selected (green)
3. Enter amount (e.g., 5 units)
4. Select a reason:
   - New Stock Arrival
   - Customer Return
   - Inventory Adjustment
   - Supplier Replacement
   - Other
5. Click **"Add Stock"** button (green)

### 5. Expected Results for Restock:
✅ **SUCCESS NOTIFICATION**: "Stock increased by 5 units!"
✅ **TABLE UPDATE**: Product quantity should increase by EXACTLY 5 (e.g., 85 → 90)
✅ **MODAL CLOSES** automatically

## IMPORTANT: Test the Bug Fix

**Before the fix**: Reducing 15 units would reduce 30 units
**After the fix**: Reducing 15 units should reduce EXACTLY 15 units

### How to Verify:
1. Note the current stock (e.g., 100 units)
2. Reduce by 15 units
3. Check new stock should be 85 units (100 - 15 = 85)
4. If it's 70 units (100 - 30), the bug is NOT fixed - refresh page and try again

### 6. Verify in Internal Usage Page
1. Navigate to: http://localhost:3001/dashboard/internal-usage
2. Check if the reduction transaction appears in the table
3. Should show:
   - Type: INTERNAL badge (blue)
   - Department: "Damage / Stock Adjustment" (or whatever reason you selected)
   - Staff Name: Your username
   - Quantity: The amount you reduced
   - Notes: Your optional notes

## Troubleshooting:

### If NO notification appears:
1. Open browser console (F12)
2. Look for error messages
3. Check for these logs:
   - `[Adjust Stock] Starting adjustment:`
   - `[Adjust Stock] Validation failed:` (if validation error)

### If stock DOESN'T decrease in table:
1. Check browser console for:
   - `[Adjust Stock] Reduce response:` - should show success: true
   - `[Adjust Stock] Items refreshed successfully`
2. Check dev server terminal for:
   - `[Reduce API] Inventory updated successfully`
   - Any error messages

### If you see validation errors:
- Make sure you entered a valid amount (> 0)
- Make sure you selected a reason from dropdown
- For reduce: amount cannot exceed current stock

### If transaction doesn't appear in Internal Usage:
1. Check dev server logs for:
   - `[Reduce API] Transaction recorded successfully`
   - OR error message from sales API
2. The transaction may still succeed even if recording fails (stock will still be reduced)

## Common Issues:

### Issue: "Insufficient stock" error
- **Cause**: Trying to reduce more than available
- **Fix**: Enter a smaller amount or check current stock

### Issue: "Please fill in all required fields"
- **Cause**: Missing amount or reason
- **Fix**: Fill in both amount and reason fields

### Issue: Modal doesn't open
- **Cause**: Frontend error or item data issue
- **Fix**: Check browser console for errors

## Next Steps After Testing:

### If everything works:
1. ✅ Test with different reasons
2. ✅ Test with notes field
3. ✅ Verify Internal Usage page shows transactions
4. ✅ Test both Restock and Reduce tabs
5. ✅ Commit all changes

### If issues found:
1. Share screenshot of browser console errors
2. Share screenshot of dev server terminal logs
3. Describe exact steps to reproduce the issue

## Notes:
- Dev server is running on **PORT 3001** (not 3000)
- All console logs are prefixed with `[Adjust Stock]` or `[Reduce API]` for easy filtering
- Transactions are recorded in the `transactions` table with `transaction_type = 'internal'`
- Stock updates are also logged in the `logs` table with `operation = 'reduce'`
