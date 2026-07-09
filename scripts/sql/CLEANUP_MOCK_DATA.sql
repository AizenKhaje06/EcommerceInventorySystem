-- ============================================================================
-- CLEANUP ALL MOCK DATA
-- ============================================================================
-- Run this to remove all existing mock data before inserting new data
-- Safe to run - only deletes records with MOCK- prefix

-- Step 1: Delete order_items first (foreign key dependency)
DELETE FROM order_items WHERE order_id LIKE 'MOCK-%';

-- Step 2: Delete orders
DELETE FROM orders WHERE id LIKE 'MOCK-%';

-- Step 3: Delete transactions
DELETE FROM transactions WHERE id LIKE 'MOCK-%';

-- Step 4: Delete logs
DELETE FROM logs WHERE id LIKE 'MOCK-%';

-- Step 5: Delete inventory
DELETE FROM inventory WHERE id LIKE 'MOCK-%';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
    '✅ Cleanup complete!' as status,
    (SELECT COUNT(*) FROM orders WHERE id LIKE 'MOCK-%') as remaining_orders,
    (SELECT COUNT(*) FROM inventory WHERE id LIKE 'MOCK-%') as remaining_products,
    (SELECT COUNT(*) FROM transactions WHERE id LIKE 'MOCK-%') as remaining_transactions,
    (SELECT COUNT(*) FROM logs WHERE id LIKE 'MOCK-%') as remaining_logs,
    'All should be 0' as expected;

-- ============================================================================
-- READY TO INSERT NEW MOCK DATA!
-- ============================================================================
-- Now you can run:
-- 1. POPULATE_MOCK_DATA_COMPLETE.sql
-- 2. MOCK_ORDERS_600.sql
-- ============================================================================
