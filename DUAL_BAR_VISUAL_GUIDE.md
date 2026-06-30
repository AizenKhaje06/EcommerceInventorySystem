# 📊 Bad Item Tracking - Dual Progress Bar Visual Guide

## 🎨 NEW DESIGN OVERVIEW

Clean, professional stock visualization with **good/bad item breakdown** shown directly in the Stock column.

---

## 📐 LAYOUT COMPARISON

### BEFORE (Single Bar):
```
┌─────────────────────────────────────────┐
│ STOCK                                   │
├─────────────────────────────────────────┤
│ 500                                     │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ (green)          │
└─────────────────────────────────────────┘
```

### AFTER (Dual Bar - With Defects):
```
┌─────────────────────────────────────────┐
│ STOCK                                   │
├─────────────────────────────────────────┤
│ 500 total                               │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 450  (green - good)   │
│ ▓▓ 50              (red - defective)    │
└─────────────────────────────────────────┘
```

---

## 🎯 VISUAL EXAMPLES

### Example 1: Item with NO Defects (All Good)
```
╔════════════════════════════════════╗
║ Product Name                       ║
║ "iPhone 15 Pro Max"                ║
╠════════════════════════════════════╣
║ STOCK                              ║
║                                    ║
║  1000 total                        ║
║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 1000     ║
║                                    ║
╚════════════════════════════════════╝
```
- ✅ Single GREEN bar (100%)
- ✅ No badge
- ✅ All stock is sellable

---

### Example 2: Item with 10% Defects
```
╔════════════════════════════════════╗
║ Product Name  [Has Defects]       ║ ← Red badge
║ "Samsung Galaxy S24"               ║
╠════════════════════════════════════╣
║ STOCK                              ║
║                                    ║
║  500 total                         ║
║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 450         ║ ← Green (90%)
║  ▓▓ 50                             ║ ← Red (10%)
║                                    ║
╚════════════════════════════════════╝
```
- ✅ Green bar: 90% width
- ✅ Red bar: 10% width
- ✅ Badge: "Has Defects"
- ✅ 450 units sellable in POS

---

### Example 3: Item with 50% Defects
```
╔════════════════════════════════════╗
║ Product Name  [Has Defects]       ║
║ "Damaged Laptop Batch"             ║
╠════════════════════════════════════╣
║ STOCK                              ║
║                                    ║
║  200 total                         ║
║  ▓▓▓▓▓▓▓▓▓▓▓▓ 100                 ║ ← Green (50%)
║  ▓▓▓▓▓▓▓▓▓▓▓▓ 100                 ║ ← Red (50%)
║                                    ║
╚════════════════════════════════════╝
```
- ✅ Equal split (50/50)
- ✅ Both bars same width
- ✅ Clear visual indication of high defect rate
- ✅ Only 100 units sellable

---

### Example 4: Item with 90% Defects (Critical)
```
╔════════════════════════════════════╗
║ Product Name  [Has Defects]       ║
║ "Recalled Product Batch"           ║
╠════════════════════════════════════╣
║ STOCK                              ║
║                                    ║
║  100 total                         ║
║  ▓▓ 10                             ║ ← Green (10%)
║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 90          ║ ← Red (90%)
║                                    ║
╚════════════════════════════════════╝
```
- ⚠️ Mostly defective
- ✅ Tiny green bar (10%)
- ✅ Large red bar (90%)
- ⚠️ Only 10 units sellable
- 🔔 Visual warning - investigate why so many defects

---

### Example 5: Item with 100% Defects (All Bad)
```
╔════════════════════════════════════╗
║ Product Name  [Has Defects]       ║
║ "Completely Damaged Shipment"      ║
╠════════════════════════════════════╣
║ STOCK                              ║
║                                    ║
║  50 total                          ║
║  (no green bar)                    ║
║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 50       ║ ← Red (100%)
║                                    ║
╚════════════════════════════════════╝
```
- ❌ NO green bar (0 good items)
- ❌ ONLY red bar (100%)
- ❌ Badge shows "Has Defects"
- ❌ **HIDDEN from POS** (0 sellable stock)

---

## 🎨 COLOR SCHEME

### Green Bar (Good Items):
- **Color:** `bg-green-500`
- **RGB:** `#22c55e`
- **Meaning:** Sellable, available stock
- **Behavior:** Grows when restocking, shrinks when selling

### Red Bar (Bad Items):
- **Color:** `bg-red-500`
- **RGB:** `#ef4444`
- **Meaning:** Defective, unsellable stock
- **Behavior:** Grows when marking as damaged/spoiled, never shrinks

### Background:
- **Track:** `bg-slate-200` (light mode) / `bg-slate-700` (dark mode)
- **Height:** `1.5px` (thin, elegant)
- **Border Radius:** `rounded-full` (smooth ends)

---

## 📏 DIMENSIONS

### Stock Column Width:
- **Min Width:** `120px`
- **Responsive:** Adjusts based on table layout

### Progress Bars:
- **Height:** `1.5px` (6px in Tailwind)
- **Spacing:** `0.25rem` gap between bars
- **Full Width:** 100% of column

### Text Sizes:
- **Total:** `text-sm` (14px) - Bold
- **Counts:** `text-[10px]` (10px) - Medium weight
- **Label:** `text-[10px]` (10px) - Gray

---

## 🔍 HOVER STATES

### Badge Hover:
```
Normal:
┌─────────────────┐
│ [Has Defects]  │ ← Red badge
└─────────────────┘

Hover:
┌─────────────────────────────┐
│ [Has Defects]              │
│ Reason: Damage             │ ← Tooltip appears
└─────────────────────────────┘
```

### Row Hover:
```
Normal:
┌────────────────────────────────────┐
│ Product  │ 500 total              │ ← White background
│          │ ▓▓▓▓▓ 450              │
│          │ ▓ 50                   │
└────────────────────────────────────┘

Hover:
┌────────────────────────────────────┐
│ Product  │ 500 total              │ ← Light gray background
│          │ ▓▓▓▓▓ 450              │
│          │ ▓ 50                   │
└────────────────────────────────────┘
```

---

## 📱 RESPONSIVE BEHAVIOR

### Desktop (>1024px):
```
┌─────────────────────────────────────────────────────┐
│ Product Name        │ Category │ STOCK              │
│ iPhone 15 Pro       │ Phone    │ 1000 total         │
│                     │          │ ▓▓▓▓▓▓▓▓▓▓ 950     │
│                     │          │ ▓ 50                │
└─────────────────────────────────────────────────────┘
```

### Mobile (<768px):
```
┌────────────────────────┐
│ Product Name           │
│ iPhone 15 Pro          │
├────────────────────────┤
│ STOCK                  │
│ 1000 total             │
│ ▓▓▓▓▓▓▓▓▓▓ 950        │
│ ▓ 50                   │
└────────────────────────┘
```
- Horizontal scroll enabled
- Bars remain readable
- Minimum width maintained

---

## 🎭 DARK MODE

### Light Mode:
```
Background: White (#ffffff)
Total Text: Black (#0f172a)
Good Count: Green-700 (#15803d)
Bad Count: Red-700 (#b91c1c)
Track: Slate-200 (#e2e8f0)
```

### Dark Mode:
```
Background: Slate-900 (#0f172a)
Total Text: White (#ffffff)
Good Count: Green-400 (#4ade80)
Bad Count: Red-400 (#f87171)
Track: Slate-700 (#334155)
```

---

## 🎯 USE CASES

### Scenario 1: Quality Control
**Manager sees:**
```
Product A: ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 950  ▓ 50   ← 5% defect (good)
Product B: ▓▓▓▓▓▓▓▓▓▓ 500  ▓▓▓▓▓▓▓▓▓▓ 500 ← 50% defect (investigate!)
Product C: ▓▓ 50  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 450   ← 90% defect (critical!)
```
**Action:** Investigate Product B and C suppliers

---

### Scenario 2: Inventory Planning
**Purchaser sees:**
```
Product: "Monitor 24-inch"
Total: 100
Good: 70 (sellable)
Bad: 30 (defective)

Decision: Order 200 more to maintain 200 good stock level
```

---

### Scenario 3: Loss Tracking
**Finance sees:**
```
Month-End Report:
- Product A: 50 units defective (₱25,000 loss)
- Product B: 100 units defective (₱50,000 loss)
- Product C: 10 units defective (₱5,000 loss)

Total Loss: ₱80,000
```
Visual bars make it easy to spot which products have high defect rates.

---

## ✅ ADVANTAGES

### Visual Clarity:
- ✅ **At-a-glance** understanding of stock health
- ✅ **No red rows** - cleaner table appearance
- ✅ **Proportional bars** - intuitive sizing
- ✅ **Color-coded** - green = good, red = bad

### Information Density:
- ✅ **3 data points** in one column (total, good, bad)
- ✅ **Visual + numerical** - best of both worlds
- ✅ **Space-efficient** - no extra columns needed
- ✅ **Scannable** - easy to compare multiple items

### Decision Support:
- ✅ **Quick identification** of problematic stock
- ✅ **Trend visibility** - see defect patterns
- ✅ **Actionable insights** - know what to reorder
- ✅ **Audit trail** - badge shows reason on hover

---

## 🚀 IMPLEMENTATION DETAILS

### Component Structure:
```tsx
<td className="py-2 px-3">
  {/* Total Stock */}
  <div>500 total</div>
  
  {/* Good Items Bar */}
  <div className="flex items-center gap-1.5">
    <div className="flex-1 h-1.5 bg-slate-200 rounded-full">
      <div className="h-full bg-green-500" style={{ width: '90%' }} />
    </div>
    <span>450</span>
  </div>
  
  {/* Bad Items Bar (if any) */}
  <div className="flex items-center gap-1.5">
    <div className="flex-1 h-1.5 bg-slate-200 rounded-full">
      <div className="h-full bg-red-500" style={{ width: '10%' }} />
    </div>
    <span>50</span>
  </div>
</td>
```

### Calculation Logic:
```typescript
const badQty = item.bad_item_quantity || 0
const goodQty = item.quantity - badQty
const goodPercent = (goodQty / item.quantity) * 100
const badPercent = (badQty / item.quantity) * 100
```

---

## 🎉 FINAL RESULT

A **clean, professional, informative** stock visualization that:
- Shows total stock at a glance
- Breaks down good vs bad items
- Uses intuitive color coding
- Provides proportional visual feedback
- Maintains clean table aesthetics
- Supports quick decision-making

**Much better than red row highlighting!** 🎨✨
