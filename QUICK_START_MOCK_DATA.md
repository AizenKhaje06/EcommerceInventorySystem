# 🚀 Quick Start - Mock Data Installation

## Problem: Duplicate Key Error?

Run cleanup first!

## ✅ Complete Installation Steps (In Order)

### 1️⃣ Cleanup Old Data (If Exists)

```sql
-- Copy and run: scripts/sql/CLEANUP_MOCK_DATA.sql
```
**Purpose**: Removes old MOCK- data to avoid duplicates

---

### 2️⃣ Insert Products & Transactions

```sql
-- Copy and run: scripts/sql/POPULATE_MOCK_DATA_COMPLETE.sql
```
**Creates**: 20 products + 100+ transactions

---

### 3️⃣ Insert 600 Orders

```sql
-- Copy and run: scripts/sql/MOCK_ORDERS_600.sql
```
**Creates**: 600 orders (all statuses covered)

---

## 🎉 Done!

Your database now has:
- ✅ 20 Products (7,000+ stock)
- ✅ 100+ Transactions
- ✅ 600 Orders (all parcel statuses)

## 🧪 Verify Installation

```sql
-- Check totals
SELECT 
  (SELECT COUNT(*) FROM orders WHERE id LIKE 'MOCK-%') as orders,
  (SELECT COUNT(*) FROM inventory WHERE id LIKE 'MOCK-%') as products,
  (SELECT COUNT(*) FROM transactions WHERE id LIKE 'MOCK-%') as transactions;
-- Expected: orders=600, products=20, transactions=100+
```

## ❌ Need to Start Over?

Run cleanup again:
```sql
-- scripts/sql/CLEANUP_MOCK_DATA.sql
```

Then repeat steps 2-3.
