# Inventory Bad Stock KPI Card - 5th Card Added

## Implementation
Added "Total Bad Stock" as the 5th KPI card in the Products/Inventory page.

## Location
**File:** `app/dashboard/inventory/page.tsx` (Lines ~1235-1360)

## Changes Made

### 1. Updated Grid Layout
**BEFORE:** 4 cards for admin, 3 for dept agents
```typescript
"lg:grid-cols-4"  // Admin
"lg:grid-cols-3"  // Dept agents
```

**AFTER:** 5 cards for admin, 3 for dept agents
```typescript
"lg:grid-cols-5"  // Admin (5 cards)
"lg:grid-cols-3"  // Dept agents (3 cards, no COGS/Bad Stock)
```

### 2. Added 5th Card - Total Bad Stock

**Visual Design:**
- **Color**: Red gradient (matches bad stock theme)
- **Icon**: AlertTriangle (warning icon)
- **Position**: 5th card (after Total COGS)
- **Visibility**: Hidden for dept-manager and operations (same as COGS)

**Card Structure:**
```typescript
{!isReadOnly && (
  <div className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 rounded-xl bg-white dark:bg-slate-900">
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>
      </div>
      <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
        Total Bad Stock
      </p>
      <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-red-600 to-red-700 bg-clip-text text-transparent tabular-nums mb-2">
        {formatNumber(...)} units
      </p>
      <div className="space-y-0.5">
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          COGS Lost: <span className="font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(...)}
          </span>
        </p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Revenue Lost: <span className="font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(...)}
          </span>
        </p>
      </div>
    </div>
  </div>
)}
```

## Calculations

### Total Bad Quantity
```typescript
Array.isArray(items) 
  ? items
      .filter(item => item.item_status === 'bad')
      .reduce((sum, item) => sum + (item.bad_item_quantity || 0), 0)
  : 0
```

### COGS Lost
```typescript
Array.isArray(items)
  ? items
      .filter(item => item.item_status === 'bad')
      .reduce((sum, item) => sum + ((item.bad_item_quantity || 0) * item.costPrice), 0)
  : 0
```

### Revenue Lost
```typescript
Array.isArray(items)
  ? items
      .filter(item => item.item_status === 'bad')
      .reduce((sum, item) => sum + ((item.bad_item_quantity || 0) * item.sellingPrice), 0)
  : 0
```

## Complete KPI Card Structure

### Admin & Logistics-Admin (5 Cards)
```
┌────────────┬────────────┬────────────┬────────────┬────────────┐
│ Total      │ Total      │ Total      │ Total      │ Total Bad  │
│ Items      │ Quantity   │ Value      │ COGS       │ Stock      │
│            │            │            │            │            │
│ Indigo     │ Blue       │ Green      │ Orange     │ Red        │
│ Package    │ Package    │ TrendingUp │ Package    │ AlertTri   │
└────────────┴────────────┴────────────┴────────────┴────────────┘
```

### Dept-Manager & Operations (3 Cards)
```
┌────────────┬────────────┬────────────┐
│ Total      │ Total      │ Total      │
│ Items      │ Quantity   │ Value      │
│            │            │            │
│ Indigo     │ Blue       │ Green      │
│ Package    │ Package    │ TrendingUp │
└────────────┴────────────┴────────────┘
```

## Card Content

### Main Value
- **Label**: "TOTAL BAD STOCK"
- **Value**: `{quantity} units` (e.g., "150 units")
- **Format**: Large red gradient text

### Sub-Values (stacked)
- **COGS Lost**: Total cost of bad items (bad_qty × costPrice)
- **Revenue Lost**: Total potential revenue lost (bad_qty × sellingPrice)
- **Format**: Small text with red semibold values

## Visibility Matrix

| Role | Total Items | Total Qty | Total Value | Total COGS | Total Bad Stock |
|------|------------|-----------|-------------|------------|-----------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Logistics-Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Dept-Manager** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Operations** | ✅ | ✅ | ✅ | ❌ | ❌ |

## Data Source

**Database Fields Used:**
- `item_status` - Filter items where value is 'bad'
- `bad_item_quantity` - Total bad units per item
- `costPrice` - Cost per unit (for COGS calculation)
- `sellingPrice` - Selling price per unit (for revenue calculation)

**Query Logic:**
1. Filter items: `item_status === 'bad'`
2. Sum bad quantities: `bad_item_quantity`
3. Calculate COGS Lost: `bad_item_quantity × costPrice`
4. Calculate Revenue Lost: `bad_item_quantity × sellingPrice`

## Responsive Behavior

### Desktop (lg+)
- **Admin/Logistics**: 5 cards in a row
- **Dept agents**: 3 cards in a row

### Tablet (sm to lg)
- All roles: 2 cards per row

### Mobile (< sm)
- All roles: 1 card per row (stacked)

## Color Scheme

**Red Theme (Matches Bad Stock Concept):**
- Icon background: `bg-red-100 dark:bg-red-900/30`
- Icon color: `text-red-600 dark:text-red-400`
- Main value gradient: `from-red-600 to-red-700`
- Sub-values: `text-red-600 dark:text-red-400`

## Integration with Existing Features

### Works with Status Filter
When "Bad Stock" filter is active, the card shows the same data but helps users understand the total impact.

### Works with Bad Stock Table
When users click the "Bad Stock" filter, they see:
1. **KPI Card**: Total bad quantity, COGS lost, revenue lost
2. **Specialized Table**: Breakdown by reason (18 columns)

### Consistent with Dashboard Cards
Same calculation logic as:
- Main Admin Dashboard (Row 3)
- Logistics Dashboard (4th stats card)

## Testing Checklist

### Admin Account
- [ ] Login as admin
- [ ] Go to Products/Inventory page
- [ ] See 5 KPI cards in a row (desktop)
- [ ] 5th card shows "Total Bad Stock"
- [ ] Card shows red theme with AlertTriangle icon
- [ ] Main value shows total bad quantity in units
- [ ] Sub-values show COGS Lost and Revenue Lost
- [ ] Values are accurate (match database)

### Logistics-Admin Account
- [ ] Login as logistics-admin
- [ ] Go to Products tab (header navigation)
- [ ] See 5 KPI cards in a row (desktop)
- [ ] 5th card shows "Total Bad Stock"
- [ ] All values match admin's view

### Dept-Manager Account
- [ ] Login as dept-manager
- [ ] Go to Products page
- [ ] See only 3 KPI cards
- [ ] NO Total COGS card
- [ ] NO Total Bad Stock card
- [ ] Read-only access

### Responsive Testing
- [ ] Desktop: 5 cards in 1 row (admin)
- [ ] Tablet: 2 cards per row
- [ ] Mobile: 1 card per row (stacked)
- [ ] All cards maintain proper spacing

## Files Modified
1. `app/dashboard/inventory/page.tsx` - Added 5th KPI card with bad stock calculations

## Related Features
- Main Admin Dashboard - Bad Stock card (Row 3)
- Logistics Dashboard - Bad Stock card (4th card)
- Bad Stock Filter - Specialized table view
- Activity Log - Reduce operations tracking
- Item Status Tracking - `item_status` field

## Status
✅ **COMPLETE** - Total Bad Stock added as 5th KPI card in Products/Inventory page
