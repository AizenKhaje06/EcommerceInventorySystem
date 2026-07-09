-- ============================================================================
-- CHECK IF TABLES EXIST IN SUPABASE
-- ============================================================================
-- Run this first to verify your database schema is ready for mock data

-- Check if main tables exist
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') 
         THEN '✅ orders table exists' 
         ELSE '❌ orders table MISSING - Run migrations first!' 
    END as orders_status,
    
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') 
         THEN '✅ inventory table exists' 
         ELSE '❌ inventory table MISSING - Run migrations first!' 
    END as inventory_status,
    
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') 
         THEN '✅ transactions table exists' 
         ELSE '❌ transactions table MISSING - Run migrations first!' 
    END as transactions_status,
    
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs') 
         THEN '✅ logs table exists' 
         ELSE '❌ logs table MISSING - Run migrations first!' 
    END as logs_status;

-- If tables exist, check orders table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
