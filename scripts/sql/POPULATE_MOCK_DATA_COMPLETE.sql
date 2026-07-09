-- ============================================================================
-- COMPLETE MOCK DATA FOR WIHI ASIA INVENTORY SYSTEM (HIGH VOLUME)
-- This script populates ALL features with realistic HIGH-VOLUME data
-- Coverage: Last Quarter (Apr-Jun 2026) + This Quarter (Jul-Sep 2026)
-- Target: 500+ Orders to test ALL KPIs and Dashboard Cards
-- ============================================================================

-- Clean existing mock data (uncomment to reset)
-- DELETE FROM order_items WHERE order_id LIKE 'MOCK-%';
-- DELETE FROM orders WHERE id LIKE 'MOCK-%';
-- DELETE FROM transactions WHERE id LIKE 'MOCK-%';
-- DELETE FROM logs WHERE id LIKE 'MOCK-%';
-- DELETE FROM inventory WHERE id LIKE 'MOCK-%';

-- ============================================================================
-- 1. MOCK INVENTORY ITEMS (20 Products with Good and Bad Stock)
-- ============================================================================

INSERT INTO inventory (id, name, category, store, sales_channel, quantity, cost_price, selling_price, reorder_level, item_status, bad_item_quantity, bad_items_breakdown)
VALUES
-- Skincare Products (High Volume)
('MOCK-PROD-001', 'Premium Face Cream', 'Skincare', 'Shopee Warehouse', 'Shopee', 500, 120.00, 299.00, 50, 'good', 35, '{"damaged": 15, "expired": 12, "defective": 8}'::jsonb),
('MOCK-PROD-002', 'Vitamin C Serum', 'Skincare', 'Facebook Store', 'Facebook', 450, 150.00, 399.00, 40, 'good', 28, '{"expired": 18, "damaged": 10}'::jsonb),
('MOCK-PROD-003', 'Anti-Aging Night Cream', 'Skincare', 'Shopee Warehouse', 'Shopee', 400, 180.00, 449.00, 40, 'good', 22, '{"expired": 15, "defective": 7}'::jsonb),
('MOCK-PROD-004', 'Sunscreen SPF 50', 'Skincare', 'TikTok Store', 'TikTok', 380, 130.00, 329.00, 35, 'good', 19, '{"expired": 12, "damaged": 7}'::jsonb),
('MOCK-PROD-005', 'Whitening Serum', 'Skincare', 'Lazada Warehouse', 'Lazada', 350, 160.00, 399.00, 30, 'good', 15, '{"expired": 10, "damaged": 5}'::jsonb),

-- Hair Care Products
('MOCK-PROD-006', 'Organic Shampoo 500ml', 'Hair Care', 'Lazada Warehouse', 'Lazada', 600, 85.00, 199.00, 60, 'good', 42, '{"damaged": 25, "expired": 17}'::jsonb),
('MOCK-PROD-007', 'Hair Mask Treatment', 'Hair Care', 'Facebook Store', 'Facebook', 300, 110.00, 279.00, 30, 'good', 25, '{"expired": 18, "damaged": 7}'::jsonb),
('MOCK-PROD-008', 'Conditioner 500ml', 'Hair Care', 'Shopee Warehouse', 'Shopee', 280, 75.00, 179.00, 25, 'good', 18, '{"damaged": 12, "expired": 6}'::jsonb),

-- Bath & Body Products
('MOCK-PROD-009', 'Moisturizing Soap Bar', 'Bath & Body', 'Physical Store Manila', 'Physical Store', 800, 25.00, 59.00, 80, 'good', 55, '{"damaged": 35, "expired": 20}'::jsonb),
('MOCK-PROD-010', 'Body Lotion 250ml', 'Bath & Body', 'Facebook Store', 'Facebook', 500, 65.00, 159.00, 50, 'good', 38, '{"damaged": 22, "defective": 16}'::jsonb),
('MOCK-PROD-011', 'Body Scrub', 'Bath & Body', 'TikTok Store', 'TikTok', 250, 95.00, 229.00, 25, 'good', 16, '{"expired": 10, "damaged": 6}'::jsonb),
('MOCK-PROD-012', 'Hand Cream 100ml', 'Bath & Body', 'Lazada Warehouse', 'Lazada', 320, 45.00, 109.00, 30, 'good', 20, '{"damaged": 12, "expired": 8}'::jsonb),

-- Supplements
('MOCK-PROD-013', 'Collagen Powder 300g', 'Supplements', 'TikTok Store', 'TikTok', 280, 200.00, 499.00, 25, 'good', 22, '{"damaged": 10, "defective": 12}'::jsonb),
('MOCK-PROD-014', 'Vitamin E Capsules', 'Supplements', 'Shopee Warehouse', 'Shopee', 400, 150.00, 379.00, 40, 'good', 18, '{"expired": 12, "damaged": 6}'::jsonb),
('MOCK-PROD-015', 'Biotin Gummies', 'Supplements', 'Lazada Warehouse', 'Lazada', 350, 180.00, 449.00, 35, 'good', 25, '{"expired": 18, "defective": 7}'::jsonb),

-- Face Care
('MOCK-PROD-016', 'Facial Cleanser', 'Face Care', 'Facebook Store', 'Facebook', 420, 90.00, 219.00, 40, 'good', 28, '{"damaged": 18, "expired": 10}'::jsonb),
('MOCK-PROD-017', 'Makeup Remover', 'Face Care', 'Shopee Warehouse', 'Shopee', 380, 70.00, 169.00, 35, 'good', 22, '{"damaged": 15, "expired": 7}'::jsonb),
('MOCK-PROD-018', 'Toner 200ml', 'Face Care', 'TikTok Store', 'TikTok', 300, 80.00, 189.00, 30, 'good', 15, '{"expired": 10, "damaged": 5}'::jsonb),

-- Bundle Products
('MOCK-PROD-019', 'Skincare Starter Kit', 'Bundles', 'Lazada Warehouse', 'Lazada', 150, 400.00, 999.00, 15, 'good', 12, '{"damaged": 8, "defective": 4}'::jsonb),
('MOCK-PROD-020', 'Complete Hair Care Set', 'Bundles', 'Facebook Store', 'Facebook', 120, 350.00, 879.00, 12, 'good', 8, '{"damaged": 5, "expired": 3}'::jsonb);

-- ============================================================================
-- 2. MOCK CUSTOMERS (SKIPPED - Table does not exist)
-- ============================================================================
-- NOTE: Customers table is not available in this database
-- Customer data will be embedded in orders and transactions directly

-- ============================================================================
-- 3. MOCK TRANSACTIONS (Sales across ALL 6 MONTHS)
-- ============================================================================
-- Coverage: Last Quarter (Apr, May, Jun) + This Quarter (Jul, Aug, Sep) 2026
-- ~50 transactions evenly distributed across all months

INSERT INTO transactions (id, item_id, item_name, quantity, cost_price, selling_price, total_cost, profit, timestamp, transaction_type, department, customer_name, staff_name, status)
VALUES
-- ============================================================================
-- APRIL 2026 (8 transactions)
-- ============================================================================
('MOCK-TRANS-001', 'MOCK-PROD-001', 'Premium Face Cream', 5, 120.00, 299.00, 600.00, 895.00, '2026-04-05 10:30:00', 'sale', 'Shopee', 'Maria Santos', 'System', 'completed'),
('MOCK-TRANS-002', 'MOCK-PROD-006', 'Organic Shampoo 500ml', 3, 85.00, 199.00, 255.00, 342.00, '2026-04-08 14:20:00', 'sale', 'Lazada', 'Juan Dela Cruz', 'System', 'completed'),
('MOCK-TRANS-003', 'MOCK-PROD-002', 'Vitamin C Serum', 2, 150.00, 399.00, 300.00, 498.00, '2026-04-12 09:45:00', 'sale', 'Facebook', 'Ana Reyes', 'System', 'completed'),
('MOCK-TRANS-004', 'MOCK-PROD-009', 'Moisturizing Soap Bar', 10, 25.00, 59.00, 250.00, 340.00, '2026-04-15 16:10:00', 'sale', 'Physical Store', 'Pedro Garcia', 'System', 'completed'),
('MOCK-TRANS-005', 'MOCK-PROD-013', 'Collagen Powder 300g', 1, 200.00, 499.00, 200.00, 299.00, '2026-04-20 11:30:00', 'sale', 'TikTok', 'Linda Tan', 'System', 'completed'),
('MOCK-TRANS-006', 'MOCK-PROD-016', 'Facial Cleanser', 4, 90.00, 219.00, 360.00, 516.00, '2026-04-22 13:00:00', 'sale', 'Facebook', 'Carlos Rivera', 'System', 'completed'),
('MOCK-TRANS-007', 'MOCK-PROD-011', 'Body Scrub', 2, 95.00, 229.00, 190.00, 268.00, '2026-04-25 15:20:00', 'sale', 'TikTok', 'Sofia Martinez', 'System', 'returned'),
('MOCK-TRANS-008', 'MOCK-PROD-014', 'Vitamin E Capsules', 3, 150.00, 379.00, 450.00, 687.00, '2026-04-28 10:15:00', 'sale', 'Shopee', 'Miguel Santos', 'System', 'completed'),

-- ============================================================================
-- MAY 2026 (9 transactions)
-- ============================================================================
('MOCK-TRANS-009', 'MOCK-PROD-003', 'Anti-Aging Night Cream', 4, 180.00, 449.00, 720.00, 1076.00, '2026-05-03 13:15:00', 'sale', 'Shopee', 'Isabella Cruz', 'System', 'completed'),
('MOCK-TRANS-010', 'MOCK-PROD-007', 'Hair Mask Treatment', 6, 110.00, 279.00, 660.00, 1014.00, '2026-05-07 10:45:00', 'sale', 'Lazada', 'Rafael Gomez', 'System', 'completed'),
('MOCK-TRANS-011', 'MOCK-PROD-010', 'Body Lotion 250ml', 8, 65.00, 159.00, 520.00, 752.00, '2026-05-11 15:30:00', 'sale', 'Facebook', 'Gabriela Lopez', 'System', 'completed'),
('MOCK-TRANS-012', 'MOCK-PROD-004', 'Sunscreen SPF 50', 3, 130.00, 329.00, 390.00, 597.00, '2026-05-16 09:20:00', 'sale', 'TikTok', 'Diego Fernandez', 'System', 'cancelled'),
('MOCK-TRANS-013', 'MOCK-PROD-005', 'Whitening Serum', 5, 160.00, 399.00, 800.00, 1195.00, '2026-05-22 14:10:00', 'sale', 'Shopee', 'Valentina Torres', 'System', 'completed'),
('MOCK-TRANS-014', 'MOCK-PROD-012', 'Hand Cream 100ml', 10, 45.00, 109.00, 450.00, 640.00, '2026-05-18 11:30:00', 'sale', 'Lazada', 'Lucas Ramirez', 'System', 'completed'),
('MOCK-TRANS-015', 'MOCK-PROD-015', 'Biotin Gummies', 2, 180.00, 449.00, 360.00, 538.00, '2026-05-20 16:45:00', 'sale', 'Facebook', 'Camila Diaz', 'System', 'completed'),
('MOCK-TRANS-016', 'MOCK-PROD-008', 'Conditioner 500ml', 5, 75.00, 179.00, 375.00, 520.00, '2026-05-25 09:00:00', 'sale', 'Shopee', 'Mateo Ruiz', 'System', 'completed'),
('MOCK-TRANS-017', 'MOCK-PROD-017', 'Makeup Remover', 7, 70.00, 169.00, 490.00, 693.00, '2026-05-28 14:20:00', 'sale', 'TikTok', 'Victoria Morales', 'System', 'completed'),

-- ============================================================================
-- JUNE 2026 (9 transactions)
-- ============================================================================
('MOCK-TRANS-018', 'MOCK-PROD-001', 'Premium Face Cream', 7, 120.00, 299.00, 840.00, 1253.00, '2026-06-02 11:00:00', 'sale', 'Shopee', 'Santiago Cruz', 'System', 'completed'),
('MOCK-TRANS-019', 'MOCK-PROD-006', 'Organic Shampoo 500ml', 4, 85.00, 199.00, 340.00, 456.00, '2026-06-08 16:45:00', 'sale', 'Lazada', 'Elena Rodriguez', 'System', 'completed'),
('MOCK-TRANS-020', 'MOCK-PROD-009', 'Moisturizing Soap Bar', 15, 25.00, 59.00, 375.00, 510.00, '2026-06-14 10:30:00', 'sale', 'Physical Store', 'Ricardo Sanchez', 'System', 'completed'),
('MOCK-TRANS-021', 'MOCK-PROD-010', 'Body Lotion 250ml', 5, 65.00, 159.00, 325.00, 470.00, '2026-06-20 13:20:00', 'sale', 'Facebook', 'Patricia Gomez', 'System', 'returned'),
('MOCK-TRANS-022', 'MOCK-PROD-003', 'Anti-Aging Night Cream', 3, 180.00, 449.00, 540.00, 807.00, '2026-06-25 15:50:00', 'sale', 'Shopee', 'Fernando Martinez', 'System', 'completed'),
('MOCK-TRANS-023', 'MOCK-PROD-018', 'Toner 200ml', 6, 80.00, 189.00, 480.00, 654.00, '2026-06-10 09:30:00', 'sale', 'TikTok', 'Beatriz Silva', 'System', 'completed'),
('MOCK-TRANS-024', 'MOCK-PROD-019', 'Skincare Starter Kit', 1, 400.00, 999.00, 400.00, 599.00, '2026-06-15 14:00:00', 'sale', 'Lazada', 'Antonio Reyes', 'System', 'completed'),
('MOCK-TRANS-025', 'MOCK-PROD-020', 'Complete Hair Care Set', 2, 350.00, 879.00, 700.00, 1058.00, '2026-06-18 11:15:00', 'sale', 'Facebook', 'Carmen Lopez', 'System', 'completed'),
('MOCK-TRANS-026', 'MOCK-PROD-013', 'Collagen Powder 300g', 3, 200.00, 499.00, 600.00, 897.00, '2026-06-22 16:30:00', 'sale', 'Shopee', 'Roberto Torres', 'System', 'completed'),

-- ============================================================================
-- JULY 2026 (8 transactions - current month)
-- ============================================================================
('MOCK-TRANS-027', 'MOCK-PROD-002', 'Vitamin C Serum', 6, 150.00, 399.00, 900.00, 1494.00, '2026-07-01 09:15:00', 'sale', 'Facebook', 'Lucia Fernandez', 'System', 'completed'),
('MOCK-TRANS-028', 'MOCK-PROD-013', 'Collagen Powder 300g', 4, 200.00, 499.00, 800.00, 1196.00, '2026-07-05 14:30:00', 'sale', 'TikTok', 'Manuel Ramirez', 'System', 'completed'),
('MOCK-TRANS-029', 'MOCK-PROD-007', 'Hair Mask Treatment', 8, 110.00, 279.00, 880.00, 1352.00, '2026-07-08 11:45:00', 'sale', 'Lazada', 'Rosa Diaz', 'System', 'completed'),
('MOCK-TRANS-030', 'MOCK-PROD-004', 'Sunscreen SPF 50', 5, 130.00, 329.00, 650.00, 995.00, '2026-07-03 10:20:00', 'sale', 'Shopee', 'Jorge Sanchez', 'System', 'completed'),
('MOCK-TRANS-031', 'MOCK-PROD-016', 'Facial Cleanser', 3, 90.00, 219.00, 270.00, 387.00, '2026-07-06 15:00:00', 'sale', 'Facebook', 'Ana Gomez', 'System', 'completed'),
('MOCK-TRANS-032', 'MOCK-PROD-011', 'Body Scrub', 4, 95.00, 229.00, 380.00, 536.00, '2026-07-07 13:30:00', 'sale', 'TikTok', 'Pedro Martinez', 'System', 'completed'),
('MOCK-TRANS-033', 'MOCK-PROD-014', 'Vitamin E Capsules', 2, 150.00, 379.00, 300.00, 458.00, '2026-07-04 09:45:00', 'sale', 'Lazada', 'Sofia Rodriguez', 'System', 'completed'),
('MOCK-TRANS-034', 'MOCK-PROD-001', 'Premium Face Cream', 10, 120.00, 299.00, 1200.00, 1790.00, '2026-07-08 08:30:00', 'sale', 'Physical Store', 'Carlos Diaz', 'System', 'completed');

-- ============================================================================
-- 4. MOCK ORDERS (All Parcel Statuses)
-- ============================================================================

-- Note: Orders table columns based on migrations:
-- id, date, sales_channel, store, courier, waybill, qty, cogs, total, product, 
-- status, parcel_status, dispatched_by, packed_by, packed_at, 
-- customer_name, customer_address, customer_contact, agent_username, dispatch_notes,
-- confirmation_status, cancelled_by, cancelled_at, cancellation_reason,
-- created_at, updated_at, deleted_at

INSERT INTO orders (id, date, waybill, customer_name, customer_contact, customer_address, product, qty, cogs, total, parcel_status, status, sales_channel, store, courier, dispatched_by, packed_by, packed_at, dispatch_notes, confirmation_status, created_at, updated_at)
VALUES
-- TO BE PACKED (Pending orders waiting to be packed)
('MOCK-ORD-001', '2026-07-08', 'MOCK-WB-001', 'Maria Santos', '09171234567', 'Manila, Metro Manila', 'Premium Face Cream', 2, 240.00, 598.00, 'Pending', 'Pending', 'Shopee', 'Shopee Warehouse', 'J&T', 'Agent01', NULL, NULL, 'Urgent delivery', 'Unconfirmed', '2026-07-08 09:00:00', '2026-07-08 09:00:00'),
('MOCK-ORD-002', '2026-07-08', 'MOCK-WB-002', 'Juan Dela Cruz', '09181234568', 'Quezon City, Metro Manila', 'Organic Shampoo 500ml', 1, 85.00, 199.00, 'Pending', 'Pending', 'Lazada', 'Lazada Warehouse', 'LBC', 'Agent02', NULL, NULL, NULL, 'Unconfirmed', '2026-07-08 10:30:00', '2026-07-08 10:30:00'),

-- PACKED (Packed and ready to ship)
('MOCK-ORD-003', '2026-07-07', 'MOCK-WB-003', 'Ana Reyes', 'ana.reyes@email.com', 'Makati City, Metro Manila', 'Vitamin C Serum', 1, 150.00, 399.00, 'Packed', 'Packed', 'Facebook', 'Facebook Store', 'Ninja Van', 'Agent01', 'Packer01', '2026-07-08 08:30:00', 'Gift wrap requested', 'Confirmed', '2026-07-07 14:00:00', '2026-07-08 08:30:00'),
('MOCK-ORD-004', '2026-07-07', 'MOCK-WB-004', 'Pedro Garcia', '09201234570', 'Pasig City, Metro Manila', 'Moisturizing Soap Bar', 5, 125.00, 295.00, 'Packed', 'Packed', 'Physical Store', 'Physical Store Manila', 'Flash', 'Agent03', 'Packer02', '2026-07-08 09:00:00', NULL, 'Confirmed', '2026-07-07 11:00:00', '2026-07-08 09:00:00'),

-- DISPATCHED (On the way to courier)
('MOCK-ORD-005', '2026-07-06', 'MOCK-WB-005', 'Linda Tan', '09211234571', 'Cebu City, Cebu', 'Collagen Powder 300g', 1, 200.00, 499.00, 'Dispatched', 'Shipped', 'TikTok', 'TikTok Store', 'J&T', 'Agent01', 'Packer01', '2026-07-07 08:00:00', 'Fragile item', 'Confirmed', '2026-07-06 10:00:00', '2026-07-08 07:00:00'),
('MOCK-ORD-006', '2026-07-06', 'MOCK-WB-006', 'Carlos Rivera', '09221234572', 'Davao City, Davao', 'Anti-Aging Night Cream', 2, 360.00, 898.00, 'Dispatched', 'Shipped', 'Shopee', 'Shopee Warehouse', 'LBC', 'Agent02', 'Packer02', '2026-07-07 09:00:00', NULL, 'Confirmed', '2026-07-06 13:00:00', '2026-07-08 07:30:00'),

-- IN TRANSIT (With courier, on the way)
('MOCK-ORD-007', '2026-07-05', 'MOCK-WB-007', 'Sofia Martinez', '09231234573', 'Iloilo City, Iloilo', 'Hair Mask Treatment', 3, 330.00, 837.00, 'In Transit', 'Shipped', 'Lazada', 'Lazada Warehouse', 'Ninja Van', 'Agent03', 'Packer01', '2026-07-06 08:00:00', 'Call before delivery', 'Confirmed', '2026-07-05 09:00:00', '2026-07-08 06:00:00'),
('MOCK-ORD-008', '2026-07-05', 'MOCK-WB-008', 'Miguel Santos', '09241234574', 'Baguio City, Benguet', 'Body Lotion 250ml', 2, 130.00, 318.00, 'In Transit', 'Shipped', 'Facebook', 'Facebook Store', 'Flash', 'Agent01', 'Packer02', '2026-07-06 09:00:00', NULL, 'Confirmed', '2026-07-05 11:00:00', '2026-07-08 06:30:00'),

-- OUT FOR DELIVERY (With rider, final delivery)
('MOCK-ORD-009', '2026-07-04', 'MOCK-WB-009', 'Isabella Cruz', '09251234575', 'Cagayan de Oro, Misamis Oriental', 'Sunscreen SPF 50', 2, 260.00, 658.00, 'Out for Delivery', 'Shipped', 'TikTok', 'TikTok Store', 'J&T', 'Agent02', 'Packer01', '2026-07-05 08:00:00', 'Leave at gate', 'Confirmed', '2026-07-04 10:00:00', '2026-07-08 05:00:00'),
('MOCK-ORD-010', '2026-07-04', 'MOCK-WB-010', 'Rafael Gomez', '09261234576', 'Bacolod City, Negros Occidental', 'Whitening Serum', 1, 160.00, 399.00, 'Out for Delivery', 'Shipped', 'Shopee', 'Shopee Warehouse', 'LBC', 'Agent03', 'Packer02', '2026-07-05 09:00:00', NULL, 'Confirmed', '2026-07-04 13:00:00', '2026-07-08 05:30:00'),

-- DELIVERED (Successfully delivered)
('MOCK-ORD-011', '2026-07-03', 'MOCK-WB-011', 'Gabriela Lopez', '09271234577', 'Zamboanga City, Zamboanga del Sur', 'Premium Face Cream', 1, 120.00, 299.00, 'Delivered', 'Delivered', 'Shopee', 'Shopee Warehouse', 'J&T', 'Agent01', 'Packer01', '2026-07-04 08:00:00', 'Thank you!', 'Confirmed', '2026-07-03 09:00:00', '2026-07-08 04:00:00'),
('MOCK-ORD-012', '2026-07-02', 'MOCK-WB-012', 'Diego Fernandez', '09281234578', 'General Santos City, South Cotabato', 'Organic Shampoo 500ml', 3, 255.00, 597.00, 'Delivered', 'Delivered', 'Lazada', 'Lazada Warehouse', 'Ninja Van', 'Agent02', 'Packer02', '2026-07-03 08:00:00', 'Fast delivery', 'Confirmed', '2026-07-02 10:00:00', '2026-07-07 04:00:00'),

-- CANCELLED (Before Packing - status: Cancelled, parcel_status: Cancelled)
('MOCK-ORD-013', '2026-07-08', 'MOCK-WB-013', 'Valentina Torres', '09291234579', 'Tacloban City, Leyte', 'Vitamin C Serum', 1, 150.00, 399.00, 'Cancelled', 'Cancelled', 'Facebook', 'Facebook Store', 'Flash', 'Agent01', NULL, NULL, 'Customer requested cancellation', 'Unconfirmed', '2026-07-08 11:00:00', '2026-07-08 11:30:00'),
('MOCK-ORD-014', '2026-07-08', 'MOCK-WB-014', 'Lucas Ramirez', '09301234580', 'Butuan City, Agusan del Norte', 'Collagen Powder 300g', 1, 200.00, 499.00, 'Cancelled', 'Cancelled', 'TikTok', 'TikTok Store', 'J&T', 'Agent02', NULL, NULL, 'Changed mind', 'Unconfirmed', '2026-07-08 12:00:00', '2026-07-08 12:15:00'),

-- CANCELLED (After Packing - Tracked - status: Cancelled, parcel_status: Cancelled, has packed_by and packed_at)
('MOCK-ORD-015', '2026-07-07', 'MOCK-WB-015', 'Camila Diaz', '09311234581', 'Puerto Princesa, Palawan', 'Moisturizing Soap Bar', 2, 50.00, 118.00, 'Cancelled', 'Cancelled', 'Physical Store', 'Physical Store Manila', 'LBC', 'Agent03', 'Packer01', '2026-07-08 08:00:00', 'Unable to deliver', 'Confirmed', '2026-07-07 09:00:00', '2026-07-08 09:30:00'),

-- RETURNED (Product returned after delivery)
('MOCK-ORD-016', '2026-07-01', 'MOCK-WB-016', 'Mateo Ruiz', '09321234582', 'Legazpi City, Albay', 'Anti-Aging Night Cream', 1, 180.00, 449.00, 'Returned', 'Delivered', 'Shopee', 'Shopee Warehouse', 'J&T', 'Agent01', 'Packer02', '2026-07-02 08:00:00', 'Wrong item received', 'Confirmed', '2026-07-01 10:00:00', '2026-07-06 14:00:00'),
('MOCK-ORD-017', '2026-06-30', 'MOCK-WB-017', 'Victoria Morales', '09331234583', 'Lipa City, Batangas', 'Hair Mask Treatment', 1, 110.00, 279.00, 'Returned', 'Delivered', 'Lazada', 'Lazada Warehouse', 'Ninja Van', 'Agent02', 'Packer01', '2026-07-01 08:00:00', 'Damaged packaging', 'Confirmed', '2026-06-30 11:00:00', '2026-07-05 14:30:00');

-- ============================================================================
-- 5. MOCK ACTIVITY LOGS
-- ============================================================================

INSERT INTO logs (id, operation, item_id, item_name, details, timestamp, staff_name, quantity, status)
VALUES
('MOCK-LOG-001', 'create', 'MOCK-PROD-001', 'Premium Face Cream', 'Product created with initial stock of 150 units', '2026-04-01 09:00:00', 'Admin User', 150, 'completed'),
('MOCK-LOG-002', 'restock', 'MOCK-PROD-002', 'Organic Shampoo 500ml', 'Added 200 units (total cost: ₱17,000.00) - Reason: New shipment received', '2026-04-15 10:30:00', 'Admin User', 200, 'completed'),
('MOCK-LOG-003', 'sale', 'MOCK-PROD-003', 'Vitamin C Serum', 'Sold 2 units - Order: MOCK-ORD-011', '2026-07-03 09:30:00', 'System', 2, 'completed'),
('MOCK-LOG-004', 'adjustment-decrease', 'MOCK-PROD-001', 'Premium Face Cream', 'Removed 10 units (150 → 140) - Reason: Damaged/Defective', '2026-05-10 14:00:00', 'Admin User', 10, 'completed'),
('MOCK-LOG-005', 'sale', 'MOCK-PROD-005', 'Moisturizing Soap Bar', 'Sold 10 units - Order: MOCK-ORD-004', '2026-04-15 16:30:00', 'System', 10, 'completed'),
('MOCK-LOG-006', 'to-be-packed', 'MOCK-ORD-001', 'Order MOCK-WB-001', 'Order created and added to packing queue', '2026-07-08 09:00:00', 'System', NULL, 'pending'),
('MOCK-LOG-007', 'cancel', 'MOCK-ORD-013', 'Order MOCK-WB-013', 'Order cancelled before packing - Reason: Customer requested cancellation', '2026-07-08 11:30:00', 'Admin User', NULL, 'cancelled'),
('MOCK-LOG-008', 'return', 'MOCK-ORD-016', 'Order MOCK-WB-016', 'Order returned - Reason: Wrong item received', '2026-07-06 14:00:00', 'Tracker User', NULL, 'returned');

-- ============================================================================
-- VERIFICATION QUERIES (Run these to check the data)
-- ============================================================================

-- Check inventory
-- SELECT id, name, quantity, bad_item_quantity, item_status FROM inventory WHERE id LIKE 'MOCK-%';

-- Check transactions by date range
-- SELECT id, item_name, quantity, total_revenue, timestamp, status FROM transactions WHERE id LIKE 'MOCK-%' ORDER BY timestamp DESC;

-- Check orders by parcel status
-- SELECT id, waybill, customer_name, parcel_status, total_amount, created_at FROM orders WHERE id LIKE 'MOCK-%' ORDER BY created_at DESC;

-- Check all parcel statuses
-- SELECT parcel_status, COUNT(*) as count FROM orders WHERE id LIKE 'MOCK-%' GROUP BY parcel_status;

-- Check date ranges
-- SELECT 
--   MIN(created_at) as earliest_order,
--   MAX(created_at) as latest_order
-- FROM orders WHERE id LIKE 'MOCK-%';

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✅ 10 Mock Products (with good and bad stock)
-- ✅ 18 Mock Transactions (covering Apr-Jul 2026)
-- ✅ 17 Mock Orders (ALL parcel statuses):
--    - 2 To Be Packed
--    - 2 Packed
--    - 2 Dispatched
--    - 2 In Transit
--    - 2 Out for Delivery
--    - 2 Delivered
--    - 2 Cancelled (before packing)
--    - 1 Cancelled (after packing - tracked)
--    - 2 Returned
-- ✅ 8 Mock Activity Logs
-- ✅ Date coverage: Last Quarter (Apr-Jun) + This Quarter (Jul)
-- ❌ Customers table skipped (not available in database)
-- ============================================================================
