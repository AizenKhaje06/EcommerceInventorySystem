# Bad Item Tracking Implementation Plan

## Overview
Track items that have been reduced due to damage, spoilage, theft, or other reasons that make them unsellable. These "bad items" should be visible in inventory (with red highlight) but hidden from POS to prevent accidental sales.

## Business Logic

### Item Status Types:
- **"good"** - Sellable items (default)
- **"bad"** - Defective/damaged/unsellable items

### When Item Becomes "Bad":
When user reduces stock with these reasons:
- ✅ Damage
- ✅ Spoilage/Expiry
- ✅ Theft/Loss
- ✅ Quality Rejection
- ✅ Customer Return (Defective)
- ❌ Internal Use (stays "good" - just used internally)
- ❌ Other (stays "good" - reason unclear)

### Behavior:
1. **Inventory Page**: Show ALL items (good + bad), bad items have RED highlight
2. **POS Page**: Show ONLY "good" items (hide bad items)
3. **Warehouse Dispatch**: Show ONLY "good" items
4. **Reports**: Include bad items in total inventory value (with separate count)

---

## Database Changes

### File: `supabase/migrations/053_add_item_status_tracking.sql`

```sql
-- Add item_status column
ALTER TABLE inventory
ADD COLUMN IF NOT EXISTS item_status TEXT DEFAULT 'good' 
CHECK (item_status IN ('good', 'bad'));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_inventory_item_status 
ON inventory(item_status);

-- Add reason column
ALTER TABLE inventory
ADD COLUMN IF NOT EXISTS bad_item_reason TEXT;

-- Add bad quantity tracking
ALTER TABLE inventory
ADD COLUMN IF NOT EXISTS bad_item_quantity INTEGER DEFAULT 0;
```

**To Apply**: Run this in Supabase SQL Editor

---

## Backend Changes

### 1. Update Reduce API (`app/api/items/[id]/reduce/route.ts`)

**Current Logic**:
- Reduces quantity
- Records transaction
- Logs operation

**New Logic**:
```typescript
// Determine if item should be marked as "bad"
const badItemReasons = ['damage', 'spoilage', 'theft-loss', 'quality-rejection', 'customer-return-defective']
const shouldMarkAsBad = badItemReasons.includes(reason)

if (shouldMarkAsBad) {
  // Mark item as bad
  await updateInventoryItem(id, {
    quantity: newQuantity,
    item_status: 'bad',
    bad_item_reason: reasonFormatted,
    bad_item_quantity: (item.bad_item_quantity || 0) + amount
  })
} else {
  // Keep item as good (internal use, etc.)
  await updateInventoryItem(id, {
    quantity: newQuantity
  })
}
```

### 2. Update Items API (`app/api/items/route.ts`)

**Add Query Parameter**: `?status=good` or `?status=bad` or `?status=all`

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // 'good', 'bad', or 'all'
  
  let items = await getInventoryItems()
  
  // Filter by status
  if (status === 'good') {
    items = items.filter(i => i.item_status !== 'bad')
  } else if (status === 'bad') {
    items = items.filter(i => i.item_status === 'bad')
  }
  // 'all' returns everything
  
  return NextResponse.json(items)
}
```

### 3. Update TypeScript Types (`lib/types.ts`)

```typescript
export interface InventoryItem {
  // ... existing fields
  item_status?: 'good' | 'bad'
  bad_item_reason?: string
  bad_item_quantity?: number
}
```

---

## Frontend Changes

### 1. Inventory Page (`app/dashboard/inventory/page.tsx`)

**Add Status Filter**:
```typescript
const [statusFilter, setStatusFilter] = useState<'all' | 'good' | 'bad'>('all')

// Filter dropdown
<Select value={statusFilter} onValueChange={setStatusFilter}>
  <SelectItem value="all">All Items</SelectItem>
  <SelectItem value="good">Good Items ✓</SelectItem>
  <SelectItem value="bad">Defective Items ✗</SelectItem>
</Select>
```

**Add Red Highlight for Bad Items**:
```typescript
<TableRow 
  className={cn(
    "hover:bg-slate-50 dark:hover:bg-slate-800/50",
    item.item_status === 'bad' && "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
  )}
>
```

**Add Status Badge**:
```typescript
{item.item_status === 'bad' && (
  <Badge variant="destructive" className="ml-2">
    Defective
  </Badge>
)}
```

### 2. POS Page (`app/dashboard/pos/page.tsx`)

**Filter Out Bad Items**:
```typescript
async function fetchItems() {
  // Add ?status=good to only fetch sellable items
  const data = await apiGet<InventoryItem[]>('/api/items?status=good')
  setItems(data)
}

// Also filter in UI as extra safety
const sellableItems = items.filter(i => i.item_status !== 'bad')
```

### 3. Warehouse Dispatch Page

**Same as POS** - Only show good items:
```typescript
const data = await apiGet<InventoryItem[]>('/api/items?status=good')
```

---

## UI/UX Design

### Inventory Page Visual:

```
┌─────────────────────────────────────────────────┐
│ Filters:                                        │
│ [All Items ▼] [Good Items ✓] [Defective ✗]    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Product Name    | Qty | Status     | Actions   │
├─────────────────────────────────────────────────┤
│ Item A          | 50  | Good ✓     | Edit Del  │  ← Normal white/gray
│ Item B (Defect) | 10  | Defective  | Edit Del  │  ← RED BACKGROUND
│ Item C          | 30  | Good ✓     | Edit Del  │  ← Normal
└─────────────────────────────────────────────────┘
```

### Red Highlight Styling:
- **Light Mode**: `bg-red-50` with `text-red-900`
- **Dark Mode**: `bg-red-900/20` with `text-red-100`
- **Badge**: Destructive variant with "Defective" label
- **Hover**: Slightly darker red

### Status Badge:
```typescript
{item.item_status === 'bad' ? (
  <Badge variant="destructive" className="gap-1">
    <XCircle className="h-3 w-3" />
    Defective
  </Badge>
) : (
  <Badge variant="success" className="gap-1">
    <CheckCircle className="h-3 w-3" />
    Good
  </Badge>
)}
```

---

## Testing Plan

### 1. Test Reduce Feature:
- ✅ Reduce item with "Damage" reason → Item marked as bad
- ✅ Reduce item with "Internal Use" → Item stays good
- ✅ Check database: `item_status = 'bad'`
- ✅ Check red highlight appears in inventory table

### 2. Test Filters:
- ✅ "All Items" - Shows good + bad
- ✅ "Good Items" - Shows only good
- ✅ "Defective Items" - Shows only bad

### 3. Test POS Page:
- ✅ Open POS page
- ✅ Verify defective items NOT in product list
- ✅ Try to search for defective item - should not appear
- ✅ Create order - should only see good items

### 4. Test Warehouse Dispatch:
- ✅ Similar to POS - only good items visible

### 5. Test Reports:
- ✅ Inventory value includes bad items (for accounting)
- ✅ Add separate "Defective Items" stat card

---

## Migration Steps

### Step 1: Database
1. Run SQL migration in Supabase
2. Verify columns added: `item_status`, `bad_item_reason`, `bad_item_quantity`
3. Check all existing items have `item_status = 'good'`

### Step 2: Backend
1. Update TypeScript types
2. Update reduce API logic
3. Update items API with status filter
4. Test API endpoints

### Step 3: Frontend
1. Update inventory page with filter + red highlight
2. Update POS page to filter out bad items
3. Update warehouse dispatch
4. Add status badges

### Step 4: Testing
1. Test all scenarios
2. Verify POS doesn't show defective items
3. Verify red highlighting works
4. Verify filters work

---

## Files to Modify

### Database:
- ✅ `supabase/migrations/053_add_item_status_tracking.sql` (CREATED)

### Types:
- `lib/types.ts` - Add item_status fields

### Backend APIs:
- `app/api/items/route.ts` - Add status filtering
- `app/api/items/[id]/reduce/route.ts` - Mark items as bad
- `lib/supabase-db.ts` - Update getInventoryItems to include new fields

### Frontend Pages:
- `app/dashboard/inventory/page.tsx` - Add filter, red highlight, status badge
- `app/dashboard/pos/page.tsx` - Filter out bad items
- `app/dashboard/dispatch/page.tsx` - Filter out bad items (if exists)

---

## Next Steps

1. **Run SQL migration** in Supabase SQL Editor
2. **Update backend** - types, APIs, database layer
3. **Update frontend** - inventory page with filters and highlighting
4. **Update POS** - hide defective items
5. **Test thoroughly** - all scenarios
6. **Deploy** - commit and push

---

## Summary

This feature provides:
✅ Track defective/damaged items separately
✅ Visual indicator (red highlight) in inventory
✅ Prevent sale of defective items (hidden in POS)
✅ Filter between good and bad items
✅ Maintain accurate inventory records
✅ Audit trail of why items were marked as bad

**Status**: Ready for implementation
**Priority**: High - Important for inventory accuracy and preventing defective sales
