# POS Bad Stock Issue - FIXED

## Problem
Products that had any bad stock (defective/damaged items) were not appearing in the POS product list, even if they had sellable stock remaining.

## Root Cause
The filter logic was checking `item.item_status !== 'bad'` which incorrectly filtered out products. The issue was a misunderstanding of the data model:

### Data Model Understanding
- **`quantity`**: Total quantity (includes both good and bad stock)
- **`bad_item_quantity`**: Number of defective/damaged units
- **`item_status`**: 'good' or 'bad' (represents if entire product entry is good/bad)
- **`bad_items_breakdown`**: JSONB object with breakdown by reason (e.g., `{damage: 50, defect: 30}`)

### The Real Issue
- **Sellable Quantity** = `quantity - bad_item_quantity`
- Products should appear in POS if `sellableQuantity > 0`, regardless of `item_status`
- The old filter was too aggressive and filtered out products with any bad stock tracking

## Solution Implemented

### 1. Fixed Product Fetching (Line 158-173)
**Before:**
```typescript
const data = await apiGet<InventoryItem[]>("/api/products?status=good")
const sellableItems = itemsArray.filter(item => item.item_status !== 'bad' && item.quantity > 0)
```

**After:**
```typescript
const data = await apiGet<InventoryItem[]>("/api/products")
const sellableItems = itemsArray.filter(item => {
  const badQuantity = item.bad_item_quantity || 0
  const sellableQuantity = item.quantity - badQuantity
  return sellableQuantity > 0
})
```

### 2. Added Helper Function
```typescript
const getSellableQuantity = (item: InventoryItem): number => {
  const badQuantity = item.bad_item_quantity || 0
  return Math.max(0, item.quantity - badQuantity)
}
```

### 3. Updated Product Display
- Stock badges now show **sellable quantity** instead of total quantity
- Out of stock check based on sellable quantity
- Low stock warning based on sellable quantity vs reorder level

### 4. Updated Cart Logic
- `addToCart()`: Checks against sellable quantity when adding items
- `updateQuantity()`: Caps at sellable quantity, not total quantity
- Cart input `max` attribute: Uses sellable quantity

### 5. Updated Type Definition
Added comment clarification in `lib/types.ts`:
```typescript
bad_item_quantity?: number // Number of units that are defective (total bad stock)
```

## Files Modified
1. `app/dashboard/pos/page.tsx` - Main POS logic
2. `lib/types.ts` - Type definition comment update

## Testing Checklist
- [ ] Products with bad stock now appear in POS product list
- [ ] Stock badges show correct sellable quantity (total - bad)
- [ ] Cannot add more to cart than sellable quantity
- [ ] Products with 0 sellable quantity show as "OUT"
- [ ] Products with only bad stock (no sellable) don't appear in list
- [ ] Cart quantity input respects sellable quantity max

## Example Scenarios
**Scenario 1:** Product has 100 total, 30 bad → Shows 70 in stock (sellable)
**Scenario 2:** Product has 50 total, 50 bad → Does NOT appear in POS (0 sellable)
**Scenario 3:** Product has 20 total, 0 bad → Shows 20 in stock (all sellable)

## Impact
✅ Products with partial bad stock are now available for sale in POS
✅ Accurate sellable quantity displayed to staff
✅ Prevents overselling beyond available good stock
✅ Maintains data integrity with bad stock tracking
