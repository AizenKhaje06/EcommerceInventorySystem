# Bad Stock KPI Card - Implementation Complete

## Overview
Successfully added "Total Bad Stock" KPI card to both Main Admin and Logistics Admin dashboards.

## Implementation Details

### Main Admin Dashboard (`app/dashboard/page.tsx`)
✅ **COMPLETED** (from previous session)
- Added items fetch to existing Promise.all
- Added bad stock calculations (totalBadQty, totalBadCOGS, totalBadRevenueLost)
- Added new KPI card in Row 3 with:
  * Red theme with AlertTriangle icon
  * Main value: Total bad quantity in units
  * Sub-values: COGS Lost and Revenue Lost
  * Only visible to admin and logistics-admin roles

### Logistics Admin Dashboard (`app/logistics/dashboard/page.tsx`)
✅ **COMPLETED** (this session)
- Items state and fetch already added (from previous session)
- Bad stock calculations already added (from previous session)
- **NEW**: Added Bad Stock KPI card as 4th card in stats grid
  * Positioned alongside Packing Queue, Packed (Period), and Cancelled (Packing)
  * Changed grid from `lg:grid-cols-3` to `lg:grid-cols-4` to accommodate 4 cards
  * Same red theme, AlertTriangle icon as main admin
  * Shows Total Bad Stock in units (main value)
  * Shows COGS Lost and Revenue Lost (sub-values)
  * Uses AnimatedNumber component for smooth transitions

## Card Structure

```tsx
<Card className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
  <CardContent className="p-5">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2.5 rounded-xl bg-red-600 shadow-lg shadow-red-500/30 flex-shrink-0">
        <AlertTriangle className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
          Total Bad Stock
        </p>
        <p className="text-2xl font-bold text-red-900 dark:text-red-100 tabular-nums">
          <AnimatedNumber value={totalBadQty} duration={1500} /> units
        </p>
      </div>
    </div>
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-red-600/80 dark:text-red-400/80">COGS Lost:</span>
        <span className="font-bold text-red-700 dark:text-red-300 tabular-nums">
          ₱<AnimatedNumber value={totalBadCOGS} duration={1500} />
        </span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-red-600/80 dark:text-red-400/80">Revenue Lost:</span>
        <span className="font-bold text-red-700 dark:text-red-300 tabular-nums">
          ₱<AnimatedNumber value={totalBadRevenueLost} duration={1500} />
        </span>
      </div>
    </div>
  </CardContent>
</Card>
```

## Calculations (useMemo hooks)

```typescript
// Filter items with bad status
const badStockItems = useMemo(() => 
  items.filter((item: any) => item.item_status === 'bad')
, [items])

// Calculate total bad quantity
const totalBadQty = useMemo(() =>
  badStockItems.reduce((sum, item) => sum + (item.bad_item_quantity || 0), 0)
, [badStockItems])

// Calculate total COGS lost
const totalBadCOGS = useMemo(() =>
  badStockItems.reduce((sum, item) => 
    sum + ((item.bad_item_quantity || 0) * (item.costPrice || 0)), 0)
, [badStockItems])

// Calculate total revenue lost
const totalBadRevenueLost = useMemo(() =>
  badStockItems.reduce((sum, item) => 
    sum + ((item.bad_item_quantity || 0) * (item.sellingPrice || 0)), 0)
, [badStockItems])
```

## Visibility
- **Main Admin Dashboard**: Only visible to `admin` and `logistics-admin` roles
- **Logistics Admin Dashboard**: Visible to all logistics users (always shown in this dashboard)

## Data Source
- Fetches from `/api/items` endpoint
- Filters items where `item_status === 'bad'`
- Uses `bad_item_quantity`, `costPrice`, and `sellingPrice` fields
- Real-time updates with auto-refresh every 3 minutes

## Testing Checklist
- [ ] Main Admin account - card appears in Row 3
- [ ] Logistics Admin account - card appears as 4th card in stats grid
- [ ] Department Head account - card does NOT appear in Main Admin
- [ ] Department Agent account - card does NOT appear in Main Admin
- [ ] Values show correct totals from bad stock items
- [ ] COGS Lost = sum of (bad_qty × costPrice)
- [ ] Revenue Lost = sum of (bad_qty × sellingPrice)
- [ ] AnimatedNumber transitions work smoothly
- [ ] Dark mode styling looks correct
- [ ] Responsive layout works on mobile

## Files Modified
1. `app/dashboard/page.tsx` - Main Admin Dashboard (previous session)
2. `app/logistics/dashboard/page.tsx` - Logistics Admin Dashboard (this session)

## Status
✅ **TASK COMPLETE** - Bad Stock KPI card successfully added to both dashboards
