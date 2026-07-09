-- ============================================================================
-- CREATE ALL REQUIRED TABLES FOR MOCK DATA
-- ============================================================================
-- Run this FIRST before running mock data scripts
-- This creates all necessary tables if they don't exist

-- ============================================================================
-- 1. CREATE INVENTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  store TEXT,
  sales_channel TEXT,
  quantity INTEGER DEFAULT 0,
  cost_price DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  reorder_level INTEGER DEFAULT 0,
  item_status TEXT DEFAULT 'good',
  bad_item_quantity INTEGER DEFAULT 0,
  bad_items_breakdown JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 2. CREATE TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  item_id TEXT,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  cost_price DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  profit DECIMAL(10,2),
  timestamp TIMESTAMP DEFAULT NOW(),
  transaction_type TEXT,
  department TEXT,
  customer_name TEXT,
  staff_name TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 3. CREATE ORDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  
  -- Order Details
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  sales_channel TEXT NOT NULL,
  store TEXT NOT NULL,
  
  -- Shipping Details
  courier TEXT,
  waybill TEXT,
  
  -- Financial Details
  qty INTEGER NOT NULL,
  cogs DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  
  -- Product Details
  product TEXT NOT NULL,
  
  -- Status Tracking
  status TEXT DEFAULT 'Pending',
  parcel_status TEXT DEFAULT 'Pending',
  
  -- People Tracking
  dispatched_by TEXT NOT NULL,
  packed_by TEXT,
  packed_at TIMESTAMP,
  
  -- Customer Info
  customer_name TEXT,
  customer_address TEXT,
  customer_contact TEXT,
  
  -- Additional Fields
  agent_username TEXT,
  dispatch_notes TEXT,
  confirmation_status TEXT DEFAULT 'Confirmed',
  
  -- Cancellation Fields
  cancelled_by TEXT,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Soft delete
  deleted_at TIMESTAMP
);

-- ============================================================================
-- 4. CREATE ORDER_ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  
  -- Item Details
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  
  -- Calculated
  total_cost DECIMAL(10,2) NOT NULL,
  total_revenue DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 5. CREATE LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  operation TEXT NOT NULL,
  item_id TEXT,
  item_name TEXT,
  details TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  staff_name TEXT,
  quantity INTEGER,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_parcel_status ON orders(parcel_status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_orders_sales_channel ON orders(sales_channel);
CREATE INDEX IF NOT EXISTS idx_orders_packed_by ON orders(packed_by);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_agent_username ON orders(agent_username);
CREATE INDEX IF NOT EXISTS idx_orders_confirmation_status ON orders(confirmation_status);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_sales_channel ON inventory(sales_channel);

-- Logs indexes
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_operation ON logs(operation);

-- ============================================================================
-- 7. CREATE UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to inventory
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
    '✅ All tables created successfully!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('orders', 'order_items', 'inventory', 'transactions', 'logs')) as tables_created,
    '5 tables expected' as expected;

-- Check orders table columns
SELECT 
    '📋 Orders table structure:' as info,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'orders';

-- ============================================================================
-- READY FOR MOCK DATA!
-- ============================================================================
-- Now you can run:
-- 1. POPULATE_MOCK_DATA_COMPLETE.sql (products & transactions)
-- 2. MOCK_ORDERS_600.sql (600 orders)
-- ============================================================================
