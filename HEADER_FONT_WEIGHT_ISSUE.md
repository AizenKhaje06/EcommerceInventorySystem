# Header Font Weight Issue - Heavy/Bold Titles 📝

## Issue
User reported that page titles across multiple accounts look "**makapal**" (too bold/heavy) on desktop view.

## Root Cause
Most page headers use `font-bold` (700 weight) which appears very heavy, especially with the gradient text effect.

## Font Weight Reference
```css
font-light     = 300 weight (too thin)
font-normal    = 400 weight (regular)
font-medium    = 500 weight (slightly bold)
font-semibold  = 600 weight (professional, recommended) ✅
font-bold      = 700 weight (very heavy) ❌
font-extrabold = 800 weight (extremely heavy)
font-black     = 900 weight (maximum weight)
```

## Recommended Standard
For professional dashboards, use **`font-semibold`** (600 weight):
- Heavy enough to establish hierarchy
- Light enough to look modern and clean
- Works well with gradient text effects

## Pages Currently Using `font-bold` (Found: 30+ pages)

### ✅ FIXED:
1. **Dashboard (Main Admin)** - Changed to `font-semibold`
2. **Tracker Dashboard** - Changed to `font-bold` (but reduced size)

### ⚠️ STILL USING `font-bold`:
- Logistics Dashboard
- Logistics Track Orders  
- Logistics Activity Log
- Logistics Business Contacts
- Packer Dashboard
- Dept Manager Dashboard
- Dept Manager Agents
- Dept Manager Log
- Dashboard Track Orders
- Dashboard Settings
- Dashboard Sales Analytics (text-4xl + font-bold = very heavy!)
- Dashboard Reports
- Dashboard POS
- Dashboard Sales Channels
- Dashboard Packing Queue
- Dashboard Operations
- Dashboard Transaction History
- Dashboard Activity Log
- Dashboard Internal Usage
- Dashboard Inventory
- ...and many more

## Quick Fix Strategy

### Option 1: Global Font Weight Change (Recommended)
Change ALL page headers from `font-bold` to `font-semibold`:

```bash
# Find and replace across all files
font-bold gradient-text → font-semibold gradient-text
```

**Pros**: 
- Consistent across entire app
- One-time fix
- Professional look

**Cons**:
- Need to test all pages

### Option 2: Page-by-Page Fix
Manually change each page that user reports as too heavy.

**Pros**:
- Can customize per page
- More control

**Cons**:
- Time-consuming
- May miss some pages
- Inconsistent

## Recommended Title Sizes

### Mobile-First Responsive Sizing:
```tsx
// Small pages/sections
text-lg sm:text-xl md:text-2xl font-semibold

// Standard dashboard pages (RECOMMENDED)
text-xl sm:text-2xl md:text-2xl font-semibold
//  20px    24px      24px

// Large hero sections
text-2xl sm:text-3xl md:text-4xl font-semibold
```

### Avoid These Combinations:
```tsx
❌ text-4xl font-bold    // Too heavy!
❌ text-3xl font-bold    // Still too heavy  
❌ md:text-3xl font-bold // Heavy on desktop

✅ text-2xl font-semibold  // Perfect balance
✅ text-xl font-semibold   // Clean and modern
```

## Example Transformations

### Before (Heavy):
```tsx
<h2 className="text-2xl sm:text-3xl font-bold gradient-text">
  Operations Overview
</h2>
```

### After (Balanced):
```tsx
<h2 className="text-xl sm:text-2xl font-semibold gradient-text">
  Operations Overview
</h2>
```

## Testing Checklist

After changing font-weight, verify:

- [ ] Title is readable at all screen sizes
- [ ] Gradient effect is still visible
- [ ] Hierarchy is maintained (title > subtitle > body)
- [ ] Looks professional, not too thin or too heavy
- [ ] Consistent across all pages

## Current Status

**Pages Fixed**: 2/30+  
**Remaining**: ~28 pages  
**Priority**: HIGH (affects user perception of entire app)

## Recommendation

**DO THIS NOW**: Run a global find-and-replace to change all `font-bold gradient-text` to `font-semibold gradient-text` across dashboard pages.

This will give a consistent, professional look across the entire application.

---
**Created**: 2026-07-06  
**Issue**: Heavy/bold page titles  
**Solution**: Change `font-bold` to `font-semibold`  
**Impact**: All dashboard pages (30+ files)
