# Bad Item Tracking - Remaining Implementation Tasks

## ✅ COMPLETED:
1. ✅ Database migration created (`053_add_item_status_tracking.sql`)
2. ✅ TypeScript types updated (`lib/types.ts`)
3. ✅ Supabase database layer updated (`lib/supabase-db.ts`)
4. ✅ Reduce API updated to mark items as bad (`app/api/items/[id]/reduce/route.ts`)

## 🔨 REMAINING TASKS:

### Task 1: Update Items API to Support Status Filtering
**File**: `app/api/items/route.ts`

**Add query parameter** `?status=good|bad|all`:

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'good', 'bad', or 'all'
    
    let items = await getInventoryItems()
    
    // Filter by status
    if (status === 'good') {
      items = items.filter(i => i.item_status !== 'bad')
    } else if (status === 'bad') {
      items = items.filter(i => i.item_status === 'bad')
    }
    // If status === 'all' or null, return everything
    
    // ... rest of existing filtering code
    
    return NextResponse.json(items)
  } catch (error) {
    // ... error handling
  }
}
```

---

### Task 2: Update Inventory Page - Add Filter and Red Highlighting
**File**: `app/dashboard/inventory/page.tsx`

#### A. Add Status Filter State:
```typescript
const [statusFilter, setStatusFilter] = useState<'all' | 'good' | 'bad'>('all')
```

#### B. Add Filter Dropdown (after productTypeFilter):
```typescript
{/* Status Filter */}
<Select value={statusFilter} onValueChange={(value: 'all' | 'good' | 'bad') => setStatusFilter(value)}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="All Items" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Items</SelectItem>
    <SelectItem value="good">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        Good Items
      </div>
    </SelectItem>
    <SelectItem value="bad">
      <div className="flex items-center gap-2">
        <XCircle className="h-4 w-4 text-red-600" />
        Defective Items
      </div>
    </SelectItem>
  </SelectContent>
</Select>
```

#### C. Update Filter Logic (in useEffect that filters items):
```typescript
// Status filter
if (statusFilter === 'good') {
  filtered = filtered.filter((item) => item.item_status !== 'bad')
} else if (statusFilter === 'bad') {
  filtered = filtered.filter((item) => item.item_status === 'bad')
}
```

#### D. Add Red Highlight to Table Rows:
Find the `<TableRow>` or row rendering code and update:
```typescript
<tr 
  key={item.id}
  className={cn(
    "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
    item.item_status === 'bad' && "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border-l-4 border-red-500"
  )}
  onClick={() => handleRowClick(item.id)}
>
```

#### E. Add Status Badge in Product Name Column:
```typescript
<td className="py-3 px-4">
  <div className="flex items-center gap-2">
    <span className="font-medium">{item.name}</span>
    {item.item_status === 'bad' && (
      <Badge variant="destructive" className="text-[10px] gap-1">
        <XCircle className="h-3 w-3" />
        Defective
      </Badge>
    )}
  </div>
  {item.item_status === 'bad' && item.bad_item_reason && (
    <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
      Reason: {item.bad_item_reason}
    </p>
  )}
</td>
```

---

### Task 3: Update POS Page - Hide Defective Items
**File**: `app/dashboard/pos/page.tsx`

#### A. Update fetchItems to filter out bad items:
```typescript
async function fetchItems() {
  try {
    // Only fetch good (sellable) items for POS
    const data = await apiGet<InventoryItem[]>('/api/items?status=good')
    setItems(data)
  } catch (error) {
    console.error('Error fetching items:', error)
  }
}
```

#### B. Add extra client-side filter as safety:
```typescript
// In the component, when displaying items
const sellableItems = items.filter(i => i.item_status !== 'bad' && i.quantity > 0)
```

---

### Task 4: Update Warehouse Dispatch Page (if exists)
**File**: `app/dashboard/dispatch/page.tsx` (or similar)

Same as POS - only show good items:
```typescript
const data = await apiGet<InventoryItem[]>('/api/items?status=good')
```

---

### Task 5: Update products_unified View in Supabase

Since we're using `products_unified` view, we need to update it to include the new columns:

**Run in Supabase SQL Editor**:
```sql
-- Drop and recreate the view to include bad item fields
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
  last_updated AS "lastUpdated",
  image_url AS "imageUrl",
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
  last_updated AS "lastUpdated",
  image_url AS "imageUrl",
  'bundle' AS "productType",
  -- Bundles don't have bad item tracking
  'good' AS item_status,
  NULL AS bad_item_reason,
  0 AS bad_item_quantity
FROM bundles;
```

---

## TESTING CHECKLIST:

### Test 1: Reduce Item with Damage
- [ ] Open Inventory page
- [ ] Click "Adjust Stock" on an item
- [ ] Switch to "Reduce" tab
- [ ] Enter amount: 5
- [ ] Select reason: "Damage"
- [ ] Click "Reduce Stock"
- [ ] **Expected**: Row turns RED, "Defective" badge appears
- [ ] **Check Database**: `item_status = 'bad'`, `bad_item_reason = 'Damage'`, `bad_item_quantity = 5`

### Test 2: Reduce Item with Internal Use
- [ ] Reduce item with reason "Internal Use"
- [ ] **Expected**: Row stays NORMAL (white/gray), no badge
- [ ] **Check Database**: `item_status = 'good'` (unchanged)

### Test 3: Status Filter
- [ ] Set filter to "Good Items"
- [ ] **Expected**: Only non-defective items visible
- [ ] Set filter to "Defective Items"
- [ ] **Expected**: Only red-highlighted items visible
- [ ] Set filter to "All Items"
- [ ] **Expected**: All items visible

### Test 4: POS Page
- [ ] Open POS page
- [ ] **Expected**: Defective items NOT in product list
- [ ] Try searching for defective item
- [ ] **Expected**: Should not appear in search results

### Test 5: Red Highlighting
- [ ] Verify red background is visible
- [ ] Verify "Defective" badge appears
- [ ] Verify reason text shows below product name
- [ ] Check dark mode styling

---

## FILES MODIFIED SUMMARY:

✅ **Completed**:
1. `supabase/migrations/053_add_item_status_tracking.sql`
2. `lib/types.ts`
3. `lib/supabase-db.ts`
4. `app/api/items/[id]/reduce/route.ts`

🔨 **To Modify**:
5. `app/api/items/route.ts` - Add status filtering
6. `app/dashboard/inventory/page.tsx` - Add filter, red highlighting, badges
7. `app/dashboard/pos/page.tsx` - Hide defective items
8. Supabase `products_unified` view - Include new columns

---

## PRIORITY ORDER:

1. ✅ Update `products_unified` view (REQUIRED for everything else to work)
2. Update Items API with status filtering
3. Update Inventory page (filter + red highlighting)
4. Update POS page (hide defective items)
5. Testing

---

**Next Step**: Update the `products_unified` view in Supabase, then continue with frontend implementation.
