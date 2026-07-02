# Logistics Products - Adjust Stock Button Sync

## Issue
The Logistics Admin account's Product tab table still had the old "Restock" button, while the Main Admin's Inventory page had been updated to use the new "Adjust Stock" button (which allows both restock and reduce operations).

## Solution
Synced the Logistics Products page with the Main Admin Inventory page by replacing the old "Restock" functionality with the new "Adjust Stock" functionality.

## Changes Made to `app/logistics/products/page.tsx`

### 1. State Variables (Lines 33-39)
**BEFORE:**
```typescript
const [restockDialogOpen, setRestockDialogOpen] = useState(false)
const [selectedRestockItem, setSelectedRestockItem] = useState<InventoryItem | null>(null)
const [restockAmount, setRestockAmount] = useState(0)
const [restockReason, setRestockReason] = useState("")
```

**AFTER:**
```typescript
// Adjust Stock Modal (replaces old restock dialog)
const [adjustStockDialogOpen, setAdjustStockDialogOpen] = useState(false)
const [adjustmentType, setAdjustmentType] = useState<'restock' | 'reduce'>('restock')
const [selectedAdjustItem, setSelectedAdjustItem] = useState<InventoryItem | null>(null)
const [adjustAmount, setAdjustAmount] = useState(0)
const [adjustReason, setAdjustReason] = useState("")
const [adjustNotes, setAdjustNotes] = useState("")
```

### 2. Handler Functions (Lines 143-165)
**BEFORE:**
```typescript
const handleRestock = (item: InventoryItem) => {
  setSelectedRestockItem(item)
  setRestockAmount(0)
  setRestockReason("")
  setRestockDialogOpen(true)
}

const handleRestockSubmit = async () => {
  if (!selectedRestockItem || restockAmount <= 0 || !restockReason) return
  try {
    await apiPost(`/api/items/${selectedRestockItem.id}/restock`, { 
      amount: restockAmount, 
      reason: restockReason 
    })
    // ... close dialog and refresh
  } catch (error) {
    // ... error handling
  }
}
```

**AFTER:**
```typescript
function handleAdjustStock(item: InventoryItem, type: 'restock' | 'reduce' = 'restock') {
  setSelectedAdjustItem(item)
  setAdjustmentType(type)
  setAdjustAmount(0)
  setAdjustReason("")
  setAdjustNotes("")
  setAdjustStockDialogOpen(true)
}

async function handleAdjustStockSubmit() {
  if (!selectedAdjustItem || adjustAmount <= 0 || !adjustReason) {
    toast.error("Please fill in all required fields")
    return
  }

  try {
    if (adjustmentType === 'restock') {
      await apiPost(`/api/items/${selectedAdjustItem.id}/restock`, {
        amount: adjustAmount,
        reason: adjustReason
      })
      toast.success(`Stock increased by ${adjustAmount} units!`)
    } else {
      await apiPost(`/api/items/${selectedAdjustItem.id}/reduce`, {
        amount: adjustAmount,
        reason: adjustReason,
        notes: adjustNotes || undefined
      })
      toast.success(`Stock reduced by ${adjustAmount} units!`)
    }

    setAdjustStockDialogOpen(false)
    setSelectedAdjustItem(null)
    setAdjustAmount(0)
    setAdjustReason("")
    setAdjustNotes("")
    fetchItems()
  } catch (error) {
    console.error("[Logistics Products] Error adjusting stock:", error)
    toast.error("Failed to adjust stock")
  }
}
```

### 3. Action Button (Line ~471)
**BEFORE:**
```typescript
<Button
  variant="ghost"
  size="sm"
  onClick={() => handleRestock(item)}
  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-8 w-8 p-0"
  title="Restock"
>
  <PackagePlus className="h-4 w-4" />
</Button>
```

**AFTER:**
```typescript
<Button
  variant="ghost"
  size="sm"
  onClick={() => handleAdjustStock(item)}
  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 h-8 w-8 p-0"
  title="Adjust Stock"
>
  <PackagePlus className="h-4 w-4" />
</Button>
```

### 4. Dialog Component (Lines ~609-716)
**BEFORE:** Simple "Restock Dialog" with:
- Single purpose (restock only)
- Amount input
- Reason dropdown (6 restock reasons)
- Submit button labeled "Restock Item"

**AFTER:** Advanced "Adjust Stock Dialog" with:
- Toggle between "Increase Stock" and "Reduce Stock"
- Amount input (dynamic label based on type)
- Reason dropdown:
  - **Restock mode**: 4 reasons (New Stock Arrival, Customer Return, Inventory Adjustment, Other)
  - **Reduce mode**: 15 reasons (Damaged, Defective, Expired, Quality Failed, Customer Return, Supplier Return, Broken Packaging, Missing Parts, Water Damage, Incorrect Storage, Obsolete, Contaminated, Pest Damage, Mishandling, Other)
- Notes field (only visible in reduce mode)
- Dynamic submit button label ("Increase Stock" or "Reduce Stock")

## Key Features of New Adjust Stock Dialog

1. **Dual Purpose**: Single dialog handles both increase and reduce operations
2. **Type Toggle**: Toggle buttons to switch between restock and reduce modes
3. **Comprehensive Reasons**: Extensive list of reduction reasons for bad stock tracking
4. **Optional Notes**: Additional notes field for reduce operations
5. **Better UX**: 
   - Gradient header with icon
   - Current stock display
   - Dynamic labels based on adjustment type
   - Color-coded button (emerald instead of blue)
6. **Consistent with Main Admin**: Matches the exact implementation from admin inventory page

## Testing Checklist
- [ ] Logistics Admin can open Adjust Stock dialog
- [ ] Toggle between Increase and Reduce modes works
- [ ] Increase Stock mode shows 4 restock reasons
- [ ] Reduce Stock mode shows 15 bad item reasons
- [ ] Notes field only appears in Reduce mode
- [ ] Submit button label changes based on mode
- [ ] Restock operation works correctly
- [ ] Reduce operation works correctly
- [ ] Activity log records username and timestamp
- [ ] Stock quantity updates correctly
- [ ] Bad stock tracking updates when reducing
- [ ] Dialog closes after successful submission
- [ ] Error messages show for invalid inputs

## Files Modified
- `app/logistics/products/page.tsx`

## Status
✅ **COMPLETE** - Logistics Products page now has the same Adjust Stock functionality as Main Admin
