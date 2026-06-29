# 🎯 SQL CODE TO RUN IN SUPABASE

## ⚡ QUICK INSTRUCTIONS (2 minutes)

### Step 1: Go to Supabase
Open: https://supabase.com/dashboard

### Step 2: Select Your Project
- Click: **WIHI Asia Inventory System** project

### Step 3: Open SQL Editor
- Left sidebar → Click **"SQL Editor"**
- Click **"New query"** button

### Step 4: Copy and Paste This SQL
```sql
-- Migration: Add Confirmation Status to Orders
-- Date: 2026-06-22
-- Description: Add confirmation_status column for waybill confirmation workflow
-- Purpose: Logistics/Admin confirms waybill receipt before packers can process

-- Step 1: Add confirmation_status column
-- Default 'Confirmed' for existing orders (backward compatibility)
-- New orders will be 'Unconfirmed' by default (handled in application logic)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS confirmation_status TEXT DEFAULT 'Confirmed' CHECK (confirmation_status IN ('Confirmed', 'Unconfirmed'));

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_orders_confirmation_status ON orders(confirmation_status);

-- Step 3: Add comments for documentation
COMMENT ON COLUMN orders.confirmation_status IS 'Waybill confirmation status: Confirmed (waybill received by logistics), Unconfirmed (waybill not yet received)';

-- Step 4: Update existing orders to 'Confirmed' (if any have NULL)
UPDATE orders 
SET confirmation_status = 'Confirmed' 
WHERE confirmation_status IS NULL;
```

### Step 5: Run the SQL
- Click **"Run"** button (or press `Ctrl + Enter`)

### Step 6: Verify Success
You should see:
```
Success. No rows returned
```

---

## ✅ VERIFICATION

### Check if column was added:
```sql
-- Run this to verify the column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'confirmation_status';
```

**Expected Result:**
```
column_name          | data_type | column_default
---------------------|-----------|---------------
confirmation_status  | text      | 'Confirmed'
```

### Check existing orders:
```sql
-- Check that all existing orders are marked as Confirmed
SELECT confirmation_status, COUNT(*) as count
FROM orders 
GROUP BY confirmation_status;
```

**Expected Result:**
```
confirmation_status | count
--------------------|-------
Confirmed           | [number of your existing orders]
```

---

## 🎯 WHAT THIS DOES

1. **Adds new column:** `confirmation_status` to `orders` table
2. **Two possible values:** 'Confirmed' or 'Unconfirmed'
3. **Default for existing orders:** All set to 'Confirmed' (backward compatible)
4. **Default for new orders:** Set to 'Unconfirmed' (in application code)
5. **Creates index:** For fast queries on this column
6. **Adds documentation:** Comment explains what the column is for

---

## ❓ WHAT IF...

### Error: "column already exists"
**Meaning:** You already ran this migration before!
**Action:** Nothing needed, it's already done! ✅

### Error: "permission denied"
**Meaning:** Your database user doesn't have ALTER TABLE permission
**Action:** 
1. Check you're using the correct project
2. Make sure you're logged in as project owner
3. Contact Supabase support if issue persists

### No error but feature doesn't work
**Check:**
1. Did Vercel deployment succeed?
2. Clear browser cache (Ctrl + Shift + R)
3. Check browser console for errors
4. Verify you're on the latest deployed version

---

## 📊 AFTER RUNNING THE MIGRATION

### What happens:
1. ✅ Database schema updated
2. ✅ All existing orders marked as "Confirmed"
3. ✅ New orders will be "Unconfirmed" by default
4. ✅ Feature is now fully functional!

### Test it:
1. Go to your production site
2. Login as Admin or Logistics
3. Create a new test order
4. Check Packing Queue
5. Verify order shows as "Unconfirmed" (yellow)
6. Click "CONFIRM" button
7. Verify order turns "Confirmed" (green)
8. Login as Packer
9. Verify order is now visible

---

## 🚀 SUMMARY

**File to run:** `052_add_confirmation_status_to_orders.sql`
**Time needed:** 2 minutes
**Complexity:** Very simple (just copy-paste and run)
**Reversible:** Yes (can remove column if needed)
**Safe:** Uses `IF NOT EXISTS` - won't break if run twice

---

## 🎉 YOU'RE DONE!

After running this SQL:
- ✅ Database ready
- ✅ Code deployed (already pushed)
- ✅ Feature fully functional
- ✅ Ready to use!

Just run the SQL above and the waybill confirmation feature is LIVE! 🚀

---

*Migration file: 052_add_confirmation_status_to_orders.sql*
*Date: June 26, 2026*
*Status: Ready to run*
