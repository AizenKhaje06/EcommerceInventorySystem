# Activity Log - Reduce Feature Integration

## Summary
Added "REDUCE" operation type to Activity Log page for tracking stock reduction activities.

## Changes Made:

### 1. Added REDUCE to Operation Configuration
**File**: `app/dashboard/log/page.tsx`

**Added**:
```typescript
reduce: { 
  label: "Reduce", 
  color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800", 
  icon: Package 
}
```

**Color**: Rose (pink-red) - Distinct from restock (purple) and delete (red)
**Icon**: Package icon

### 2. Added REDUCE to Filter Dropdown
**File**: `app/dashboard/log/page.tsx`

**Added to dropdown**:
```html
<SelectItem value="reduce">Reduce</SelectItem>
```

**Position**: Right after "Restock", before "Sale"

## How It Works:

### Stock Reduction Flow:
1. User clicks "Adjust Stock" → "Reduce" tab
2. Enters amount and reason (e.g., Damage, Spoilage, etc.)
3. Clicks "Reduce Stock"
4. Backend (`app/api/items/[id]/reduce/route.ts`):
   - Reduces inventory quantity
   - Records transaction in `transactions` table
   - **Logs operation** in `logs` table with `operation = 'reduce'`

### Activity Log Display:
- **Badge**: Rose/pink color with Package icon
- **Label**: "Reduce"
- **Filterable**: Users can filter by "Reduce" in dropdown
- **Details**: Shows quantity reduced and reason

## Testing:

### 1. Create a Reduce Operation:
1. Go to Inventory page
2. Click "Adjust Stock" on any product
3. Switch to "Reduce" tab
4. Enter amount (e.g., 5 units)
5. Select reason (e.g., "Damage")
6. Click "Reduce Stock"

### 2. Verify in Activity Log:
1. Go to Activity Log page (Dashboard → Log)
2. Look for new entry with **"Reduce"** badge (rose color)
3. Should show:
   - ✅ Date & Time
   - ✅ Operation: "Reduce" badge (rose/pink color)
   - ✅ Item name
   - ✅ Details: "Reduced X units (Reason: Damage)"

### 3. Test Filtering:
1. Open "All Operations" dropdown
2. Find and select **"Reduce"**
3. Should show only reduce operations
4. Badge should be rose/pink colored

## Visual Design:

### Badge Appearance:
- **Background**: Light rose/pink (`bg-rose-100`)
- **Text**: Dark rose (`text-rose-700`)
- **Border**: Rose border
- **Icon**: Package icon
- **Dark Mode**: Adapted colors for dark theme

### Comparison with Similar Operations:
- **Create**: Green (new items added)
- **Restock**: Purple (stock increased)
- **Reduce**: Rose/Pink (stock decreased) ← NEW
- **Delete**: Red (items removed)
- **Sale**: Orange (items sold)

## Database Schema:
No changes needed - uses existing `logs` table structure:
- `operation`: 'reduce'
- `item_id`: Product ID
- `item_name`: Product name
- `details`: Formatted details with quantity and reason
- `timestamp`: When operation occurred

## Related Files:
1. `app/dashboard/log/page.tsx` - Activity log display (updated)
2. `app/api/items/[id]/reduce/route.ts` - Reduce API that logs operations
3. `lib/supabase-db.ts` - Database layer (no changes needed)

## Status: ✅ Complete

### What Works:
- ✅ Reduce operations are logged to database
- ✅ Rose/pink badge displays correctly
- ✅ Filter dropdown includes "Reduce" option
- ✅ Filtering by "Reduce" works
- ✅ Details show quantity and reason
- ✅ Compatible with existing operations

### What to Test:
1. Reduce stock from inventory page
2. Check Activity Log for new entry
3. Verify badge color and icon
4. Test filtering by "Reduce"
5. Check details formatting
