# Mock Data Setup Guide - HIGH VOLUME (600+ Orders)

## 🎯 Overview

Comprehensive HIGH-VOLUME mock data for testing ALL features with realistic production-level data:
- **600 Orders** across all parcel statuses
- **20 Products** with 7,000+ good stock & 400+ bad stock
- **100+ Transactions** spanning 4 months (Apr-Jul 2026)
- Complete coverage for KPIs, dashboards, reports, and all pages

## 📊 Data Distribution

### Orders (600 Total)

| Status | Count | Tests |
|--------|-------|-------|
| Pending (To Be Packed) | 80 | Packing queue, confirmation workflow |
| Packed | 100 | Ready to ship, track orders |
| Shipped (Dispatched/In Transit/Out for Delivery) | 120 | Active tracking, parcel status filters |
| Delivered | 180 | Delivered metrics, KPIs, revenue calculations |
| Cancelled (Packing) | 40 | Cancelled sales (before packing) |
| Cancelled (Tracked) | 30 | Cancelled sales (after packing/tracked) |
| Returned | 50 | Returns management, revenue lost |

### Products (20 Items)
- Skincare: 5 products
- Hair Care: 3 products
- Bath & Body: 4 products
- Supplements: 3 products
- Face Care: 3 products
- Bundles: 2 products

## 📁 Files

1. `scripts/sql/POPULATE_MOCK_DATA_COMPLETE.sql` - Products & transactions
2. `scripts/sql/MOCK_ORDERS_600.sql` - 600 generated orders
3. `scripts/generate_mock_orders.py` - Python generator script

## 🚀 Installation

### Step 0: Check if Tables Exist (IMPORTANT!)

Run this first to check if your database is ready:
```sql
-- Copy contents from scripts/sql/CHECK_TABLES.sql
-- This checks if orders, inventory, transactions, logs tables exist
```

**If tables DON'T exist**, run Step 1. **If tables exist**, skip to Step 2.

### Step 1: Create Tables (If Needed)

⚠️ **Only run this if orders table doesn't exist!**

In Supabase SQL Editor:
```sql
-- Copy contents from scripts/sql/CREATE_ALL_TABLES_FOR_MOCK_DATA.sql
-- Creates: orders, order_items, inventory, transactions, logs tables
-- This takes ~10 seconds
```

### Step 2: Clean Up Old Mock Data

⚠️ **IMPORTANT: Run this first to avoid duplicate key errors!**

```sql
-- Copy contents from scripts/sql/CLEANUP_MOCK_DATA.sql
-- Deletes all existing MOCK- data
-- Safe to run - only affects mock data
```

### Step 3: Run Products & Transactions

```sql
-- Copy contents from scripts/sql/POPULATE_MOCK_DATA_COMPLETE.sql
-- Creates 20 products + 100+ transactions
```

### Step 4: Run 600 Orders

```sql
-- Copy contents from scripts/sql/MOCK_ORDERS_600.sql
-- Creates 600 orders with all statuses
-- This may take 30-60 seconds (large dataset)
```

## ✅ Features Fully Tested

- ✅ Dashboard KPIs (Financial metrics with high volume)
- ✅ Packing Queue (80 pending orders)
- ✅ Track Orders (300+ packed/shipped/delivered)
- ✅ Cancelled Sales (70 total: 40 packing + 30 tracked)
- ✅ Returns Management (50 returned orders)
- ✅ Bad Stock Tracking (400+ bad items)
- ✅ Date filtering (Last Quarter vs This Quarter)
- ✅ Channel filtering (5 sales channels)
- ✅ Performance testing (large datasets)

## 🧹 Cleanup

```sql
DELETE FROM order_items WHERE order_id LIKE 'MOCK-%';
DELETE FROM orders WHERE id LIKE 'MOCK-%';
DELETE FROM transactions WHERE id LIKE 'MOCK-%';
DELETE FROM logs WHERE id LIKE 'MOCK-%';
DELETE FROM inventory WHERE id LIKE 'MOCK-%';
```

All mock data uses `MOCK-` prefix for easy cleanup!
