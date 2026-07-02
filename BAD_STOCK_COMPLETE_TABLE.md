# Bad Stock Table - Complete Implementation

## Overview
Complete bad stock table with ALL 18+ bad item reasons as separate columns with horizontal scrolling and frozen columns.

## Features

### ✅ Complete Reason Columns (22 total columns)
1. **Image** - Sticky left
2. **Item Name** - Sticky left
3. **Damaged** - Red
4. **Defective** - Orange
5. **Expired** - Yellow
6. **Quality Failed** - Green
7. **Customer Return** - Blue
8. **Supplier Return** - Indigo
9. **Broken Packaging** - Pink
10. **Missing Parts** - Cyan
11. **Water Damage** - Teal
12. **Incorrect Storage** - Amber
13. **Obsolete** - Lime
14. **Contaminated** - Rose
15. **Pest Damage** - Fuchsia
16. **Mishandling** - Violet
17. **Lost** - Purple
18. **Spoilage** - Orange (light)
19. **Theft/Loss** - Red (light)
20. **Other** - Slate
21. **Total Bad** - Sticky right (white on red)
22. **Cost** - Sticky right
23. **COGS Lost** - Sticky right

### ✅ Sticky/Frozen Columns
**Left (always visible):**
- Image (80px)
- Item Name (180px)

**Right (always visible):**
- Total Bad (90px)
- Cost (90px)
- COGS Lost (90px)

**Scrollable Middle:**
- All 18 reason columns

### ✅ Visual Design
- Color-coded badges for each reason
- Shows number when > 0, shows "-" when 0
- Sticky header
- Horizontal scrollbar for middle columns
- Dark mode support
- Hover effects

### ✅ Breakdown Mapping

Each column maps to database keys:

```javascript
damaged: breakdown['damaged'] + breakdown['damage']
defective: breakdown['defective'] + breakdown['defect']
expired: breakdown['expired']
qualityFailed: breakdown['quality-failed'] + breakdown['quality-rejection']
customerReturn: breakdown['customer-return'] + breakdown['customer-return-defective']
supplierReturn: breakdown['supplier-return']
brokenPackaging: breakdown['broken-packaging']
missingParts: breakdown['missing-parts']
waterDamage: breakdown['water-damage']
incorrectStorage: breakdown['incorrect-storage']
obsolete: breakdown['obsolete']
contaminated: breakdown['contaminated']
pestDamage: breakdown['pest-damage']
mishandling: breakdown['mishandling']
lost: breakdown['lost']
spoilage: breakdown['spoilage']
theftLoss: breakdown['theft-loss']
other: breakdown['other']
```

## How to Use

1. **Navigate to Inventory/Products page**
2. **Select "Bad Stock" from Status filter**
3. **Scroll horizontally** to see all reason columns
4. **Image and Item Name stay fixed** on left
5. **Total Bad, Cost, COGS Lost stay fixed** on right

## Example

**Product: FEMFRESH**
- Expired: **150** (yellow badge)
- All other columns: **-**
- Total Bad: **150** (red badge)
- Cost: **₱100.00**
- COGS Lost: **₱15,000.00** (red text)

## Technical Details

### Sticky Column CSS
```css
/* Left sticky */
.sticky.left-0 { position: sticky; left: 0; }
.sticky.left-[80px] { position: sticky; left: 80px; }

/* Right sticky */
.sticky.right-0 { position: sticky; right: 0; }
.sticky.right-[90px] { position: sticky; right: 90px; }
.sticky.right-[180px] { position: sticky; right: 180px; }
```

### Z-Index Layers
- Header: `z-10`
- Sticky columns (left/right): `z-10`
- Header sticky columns: `z-20` (higher priority)

### Responsive
- Table has horizontal scroll
- Minimum column widths prevent crushing
- Sticky columns always visible
- Works on mobile with touch scroll

## Migration Required

**Before this works, you must apply:**
`supabase/migrations/057_add_bad_breakdown_to_products_unified.sql`

This adds `bad_items_breakdown` to the `products_unified` view so the API returns the breakdown data.

## Benefits

✅ **Complete visibility** - See ALL bad item reasons at once
✅ **Easy analysis** - Quickly identify problem patterns
✅ **Frozen key columns** - Always see item name and totals
✅ **Color coded** - Visual distinction between reason types
✅ **Scrollable** - Doesn't break layout, uses horizontal scroll
✅ **Financial impact** - COGS Lost shows money lost per item

## Files Modified

- `app/dashboard/inventory/page.tsx` - Complete table redesign for bad stock
- `lib/supabase-db.ts` - Added `bad_items_breakdown` to response
- `supabase/migrations/057_add_bad_breakdown_to_products_unified.sql` - View update

## Total Count

**Headers:** 22 columns
**Reason Columns:** 18 columns
**Meta Columns:** 4 (Image, Name, Total, Cost, COGS)
**Sticky Left:** 2
**Sticky Right:** 3
**Scrollable:** 18
