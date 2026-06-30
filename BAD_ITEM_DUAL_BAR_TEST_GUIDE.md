# Bad Item Tracking with Dual Progress Bars - Testing Guide

## ✅ NEW DESIGN IMPLEMENTED!

Instead of red row highlighting, we now show **Good vs Bad stock breakdown** directly in the Stock column with dual progress bars.

---

## 🎨 VISUAL DESIGN

### Stock Column Layout:

**Item with NO defects:**
```
┌─────────────────┐
│ 500 total       │ ← Total quantity
│ ▬▬▬▬▬▬▬▬▬ 500  │ ← Green bar (100%)
└─────────────────┘
```

**Item WITH defects:**
```
┌─────────────────┐
│ 400 total       │ ← Total quantity
│ ▬▬▬▬▬▬▬▬ 380   │ ← Green bar (good items)
│ ▬ 20            │ ← Red bar (bad items)
└─────────────────┘
```

### Color Coding:
- 🟢 **Green bar** = Good/Sellable items
- 🔴 **Red bar** = Defective/Unsellable items
- 📊 **Bar width** = Proportional to quantity percentage

---

## 🧪 TEST SCENARIO 1: Create First Defective Item

### Steps:
1. **Go to Inventory page**
2. Find a product with stock (e.g., 500 units)
3. Note the current Stock column display (should show single green bar)
4. **Click "Adjust Stock"** button
5. **Switch to "Reduce" tab**
6. Enter:
   - Amount: **50**
   - Reason: **"Damage"**
7. **Click "Reduce Stock"**

### Expected Results:
✅ **Stock Column Changes:**
```
BEFORE:
500 total
▬▬▬▬▬▬▬▬▬▬ 500

AFTER:
450 total
▬▬▬▬▬▬▬▬▬ 400  (Green bar - good items)
▬ 50           (Red bar - bad items)
```

✅ **Badge:** Small red "Has Defects" badge appears next to product name  
✅ **Tooltip:** Hover over badge shows "Reason: Damage"  
✅ **No red row** - row stays white/normal background  
✅ **Total decreases** from 500 to 450  

---

## 🧪 TEST SCENARIO 2: Add More Defects to Same Item

### Steps:
1. Find the same item from Test 1
2. **Click "Adjust Stock"** → "Reduce" tab
3. Enter:
   - Amount: **30**
   - Reason: **"Spoilage"**
4. **Click "Reduce Stock"**

### Expected Results:
✅ **Stock Column Updates:**
```
420 total
▬▬▬▬▬▬▬▬ 370    (Green bar - good items)
▬▬ 80           (Red bar - bad items, now larger)
```

✅ Red bar gets **visually larger** (now 80 out of 420)  
✅ Green bar gets **visually smaller** (now 370 out of 420)  
✅ Proportions are accurate  
✅ Badge still shows "Has Defects"  

---

## 🧪 TEST SCENARIO 3: Item with ONLY Defective Stock

### Steps:
1. Find a product with low stock (e.g., 20 units)
2. Reduce ALL of it as defective:
   - Amount: **20**
   - Reason: **"Quality Rejection"**
3. **Click "Reduce Stock"**

### Expected Results:
✅ **Stock Column Shows:**
```
20 total
(no green bar - 0 good items)
▬▬▬▬▬▬▬▬▬▬ 20  (Red bar - 100%)
```

✅ **Only red bar visible** (green bar is 0% width)  
✅ Total shows 20  
✅ Good items shows 0  
✅ Badge shows "Has Defects"  
✅ **POS:** Item should NOT appear (0 sellable stock)  

---

## 🧪 TEST SCENARIO 4: Reduce with Internal Use (No Defect)

### Steps:
1. Find a different product (with no defects yet)
2. **Click "Adjust Stock"** → "Reduce" tab
3. Enter:
   - Amount: **10**
   - Reason: **"Internal Use"**
4. **Click "Reduce Stock"**

### Expected Results:
✅ **Stock Column Shows:**
```
490 total (decreased from 500)
▬▬▬▬▬▬▬▬▬ 490  (Green bar - still 100%)
```

✅ **No red bar** appears  
✅ **No badge** appears  
✅ All stock is still "good"  
✅ Row stays normal (no visual change except quantity)  

**This is correct!** Internal Use does NOT mark items as defective.

---

## 🧪 TEST SCENARIO 5: Restock Item with Defects

### Steps:
1. Find an item that has defects (red bar visible)
2. **Click "Adjust Stock"** → Stay on "Restock" tab
3. Enter:
   - Amount: **100**
   - Reason: "New shipment"
4. **Click "Restock"**

### Expected Results:
✅ **Stock Column Updates:**
```
BEFORE:
400 total
▬▬▬▬▬▬▬ 350  (Green)
▬ 50          (Red)

AFTER:
500 total
▬▬▬▬▬▬▬▬ 450  (Green bar grows)
▬ 50          (Red bar stays same)
```

✅ **Total increases** to 500  
✅ **Good items increase** to 450 (350 + 100)  
✅ **Bad items stay** at 50 (unchanged)  
✅ Red bar gets **visually smaller** (proportionally, now 10% instead of 12.5%)  
✅ Badge still shows "Has Defects"  

**Key insight:** Restocking adds to GOOD items, bad items remain constant.

---

## 🧪 TEST SCENARIO 6: Status Filter - Defective Items Only

### Steps:
1. Create several items with defects (using Tests 1-3)
2. Click the **Status Filter** dropdown
3. Select **"Defective Items"**

### Expected Results:
✅ Only items with **red bars** visible  
✅ Items with only green bars are **hidden**  
✅ All visible items have **"Has Defects" badge**  
✅ Count updates correctly  

---

## 🧪 TEST SCENARIO 7: Status Filter - Good Items Only

### Steps:
1. Click the **Status Filter** dropdown
2. Select **"Good Items"**

### Expected Results:
✅ Only items with **100% green bars** visible (no red bar)  
✅ Items with red bars are **hidden**  
✅ No "Has Defects" badges visible  
✅ Shows items with **zero defects only**  

---

## 🧪 TEST SCENARIO 8: POS - Defective Items Hidden

### Steps:
1. Note a product with defects (red bar visible in Inventory)
2. Remember its name
3. **Go to POS page**
4. Look for that product
5. Try searching for it

### Expected Results:
✅ Product **does NOT appear** in POS list  
✅ Searching for it returns **no results**  
✅ Cannot add it to cart  
✅ Only items with available "good stock" are visible  

**Special Case:** If an item has 370 good + 80 bad:
- ✅ It WILL appear in POS
- ✅ Available quantity shows **370** (not 450)
- ✅ Can only sell up to 370 units

---

## 🧪 TEST SCENARIO 9: Visual Proportions

### Steps:
Create items with different good/bad ratios and verify visual accuracy:

**Test Item A:** 90% good, 10% bad
- Amount: 1000
- Reduce 100 as "Damage"
- **Expected:** Green bar ~90% width, red bar ~10% width

**Test Item B:** 50% good, 50% bad
- Amount: 200
- Reduce 100 as "Spoilage"
- **Expected:** Green bar ~50% width, red bar ~50% width

**Test Item C:** 10% good, 90% bad
- Amount: 100
- Reduce 90 as "Quality Rejection"
- **Expected:** Green bar ~10% width, red bar ~90% width

### Expected Results:
✅ Bar widths are **proportionally accurate**  
✅ Percentages match actual ratios  
✅ Visual representation is **intuitive**  
✅ Easy to scan and understand at a glance  

---

## 🧪 TEST SCENARIO 10: Mobile/Responsive Design

### Steps:
1. Open Inventory page on mobile or narrow browser
2. Scroll horizontally to Stock column
3. Check if bars are visible and readable

### Expected Results:
✅ Bars are **not too narrow**  
✅ Numbers are **readable**  
✅ Layout doesn't break  
✅ Touch targets work correctly  

---

## 🎨 VISUAL CHECKLIST

### Stock Column Components:
- [ ] **Total number** - Bold, larger font
- [ ] **"total" label** - Small, gray text
- [ ] **Green bar** - For good items with count on right
- [ ] **Red bar** - For bad items with count on right (if any)
- [ ] **Bar widths** - Proportional to quantities
- [ ] **Smooth transitions** - Bars animate when updated

### Badge:
- [ ] **"Has Defects"** text (not just "Defective")
- [ ] **Red background** with white text
- [ ] **X icon** on the left
- [ ] **Tooltip** shows reason on hover
- [ ] **Only shows** when bad_item_quantity > 0

### Row Styling:
- [ ] **No red background** on rows
- [ ] **Normal hover** effects work
- [ ] **Selection** (blue highlight) works normally
- [ ] **Clean appearance** - no visual clutter

---

## 📊 COMPARISON: Old vs New Design

### Old Design (Red Row):
- ❌ Row was fully red-highlighted
- ❌ Harder to scan multiple items
- ❌ Took up more visual space
- ❌ Didn't show good/bad split

### New Design (Dual Bars):
- ✅ Clean, professional look
- ✅ Shows exact good/bad breakdown
- ✅ Easy to scan multiple items
- ✅ Visual proportions are intuitive
- ✅ More space-efficient
- ✅ Better for decision-making

---

## ✅ SUCCESS CRITERIA

All tests pass if:
- ✅ Dual progress bars appear when item has defects
- ✅ Green bar shows good (sellable) quantity
- ✅ Red bar shows bad (defective) quantity
- ✅ Bar widths are proportionally accurate
- ✅ "Has Defects" badge appears (with tooltip)
- ✅ No red row highlighting
- ✅ Status filter works correctly
- ✅ POS hides items with 0 good stock
- ✅ Restocking increases green bar only
- ✅ Internal Use doesn't create red bar

---

## 🐛 TROUBLESHOOTING

### Bars Not Showing:
1. Check if `bad_item_quantity` exists in database
2. Verify migration ran successfully
3. Hard refresh browser (Ctrl+Shift+R)

### Proportions Look Wrong:
1. Check calculation: `goodPercent = (goodQty / totalQty) * 100`
2. Verify `bad_item_quantity` is accurate
3. Test with simple numbers (e.g., 50/50 split)

### Badge Not Appearing:
1. Check if `bad_item_quantity > 0`
2. Verify condition: `item.bad_item_quantity && item.bad_item_quantity > 0`
3. Inspect element to see if badge is rendered but hidden

---

## 🎉 READY TO TEST!

This new design is **cleaner, more informative, and more professional** than the red row highlighting approach. Follow the tests above to verify everything works correctly!

**Pro Tip:** Take screenshots of items with different good/bad ratios to show the visual progression.
