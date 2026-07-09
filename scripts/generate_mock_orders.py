#!/usr/bin/env python3
"""
Generate High-Volume Mock Orders SQL Script
Target: 600 orders with realistic distribution across all parcel statuses
Coverage: LAST QUARTER (Apr, May, Jun) + THIS QUARTER (Jul, Aug, Sep) 2026
"""

import random
from datetime import datetime, timedelta

# Configuration
TOTAL_ORDERS = 600
START_ORDER_NUM = 1

# Distribution targets
PENDING = 80          # To Be Packed (July only - recent)
PACKED = 100          # Packed, ready to ship (July only - recent)
SHIPPED = 120         # Dispatched/In Transit/Out for Delivery (Jun-Jul)
DELIVERED = 180       # Successfully delivered (Apr-Jul spread)
CANCELLED_PACKING = 40   # Cancelled before packing (Apr-Jul spread)
CANCELLED_TRACKED = 30   # Cancelled after packing (Apr-Jul spread)
RETURNED = 50         # Returned orders (Apr-Jul spread)

# Reference data
PRODUCTS = [
    ('Premium Face Cream', 120.00, 299.00),
    ('Vitamin C Serum', 150.00, 399.00),
    ('Anti-Aging Night Cream', 180.00, 449.00),
    ('Sunscreen SPF 50', 130.00, 329.00),
    ('Whitening Serum', 160.00, 399.00),
    ('Organic Shampoo 500ml', 85.00, 199.00),
    ('Hair Mask Treatment', 110.00, 279.00),
    ('Conditioner 500ml', 75.00, 179.00),
    ('Moisturizing Soap Bar', 25.00, 59.00),
    ('Body Lotion 250ml', 65.00, 159.00),
    ('Body Scrub', 95.00, 229.00),
    ('Hand Cream 100ml', 45.00, 109.00),
    ('Collagen Powder 300g', 200.00, 499.00),
    ('Vitamin E Capsules', 150.00, 379.00),
    ('Biotin Gummies', 180.00, 449.00),
    ('Facial Cleanser', 90.00, 219.00),
    ('Makeup Remover', 70.00, 169.00),
    ('Toner 200ml', 80.00, 189.00),
    ('Skincare Starter Kit', 400.00, 999.00),
    ('Complete Hair Care Set', 350.00, 879.00),
]

FIRST_NAMES = ['Maria', 'Juan', 'Ana', 'Pedro', 'Linda', 'Carlos', 'Sofia', 'Miguel', 'Isabella', 'Rafael',
               'Gabriela', 'Diego', 'Valentina', 'Lucas', 'Camila', 'Mateo', 'Victoria', 'Santiago', 'Elena', 'Ricardo',
               'Patricia', 'Fernando', 'Beatriz', 'Antonio', 'Carmen', 'Roberto', 'Lucia', 'Manuel', 'Rosa', 'Jorge']

LAST_NAMES = ['Santos', 'Dela Cruz', 'Reyes', 'Garcia', 'Tan', 'Rivera', 'Martinez', 'Cruz', 'Gomez', 'Lopez',
              'Fernandez', 'Torres', 'Ramirez', 'Diaz', 'Sanchez', 'Rodriguez', 'Silva', 'Morales', 'Ramos', 'Castillo']

CITIES = [
    'Manila, Metro Manila', 'Quezon City, Metro Manila', 'Makati City, Metro Manila', 'Pasig City, Metro Manila',
    'Taguig City, Metro Manila', 'Parañaque City, Metro Manila', 'Las Piñas City, Metro Manila', 'Muntinlupa City, Metro Manila',
    'Caloocan City, Metro Manila', 'Malabon City, Metro Manila', 'Navotas City, Metro Manila', 'Valenzuela City, Metro Manila',
    'Marikina City, Metro Manila', 'Pasay City, Metro Manila', 'San Juan City, Metro Manila', 'Mandaluyong City, Metro Manila',
    'Cebu City, Cebu', 'Davao City, Davao', 'Iloilo City, Iloilo', 'Cagayan de Oro, Misamis Oriental',
    'Bacolod City, Negros Occidental', 'Zamboanga City, Zamboanga del Sur', 'General Santos City, South Cotabato',
    'Tacloban City, Leyte', 'Butuan City, Agusan del Norte', 'Puerto Princesa, Palawan', 'Legazpi City, Albay',
    'Lipa City, Batangas', 'Baguio City, Benguet', 'Dumaguete City, Negros Oriental'
]

CHANNELS = ['Shopee', 'Lazada', 'Facebook', 'TikTok', 'Physical Store']
STORES = {
    'Shopee': 'Shopee Warehouse',
    'Lazada': 'Lazada Warehouse',
    'Facebook': 'Facebook Store',
    'TikTok': 'TikTok Store',
    'Physical Store': 'Physical Store Manila'
}
COURIERS = ['J&T', 'LBC', 'Ninja Van', 'Flash Express', 'XDE']
AGENTS = ['Agent01', 'Agent02', 'Agent03', 'Agent04', 'Agent05']
PACKERS = ['Packer01', 'Packer02', 'Packer03']

# Date ranges - ALL 6 MONTHS COVERAGE
BASE_DATE = datetime(2026, 7, 8, 9, 0, 0)  # Today (July 8, 2026)

# Month ranges for data distribution
# Last Quarter: Apr 1 - Jun 30 (90 days ago to 8 days ago)
# This Quarter: Jul 1 - Sep 30 (7 days ago to future)
APRIL_RANGE = (90, 61)    # Apr 1-30 (90-61 days ago)
MAY_RANGE = (60, 31)      # May 1-31 (60-31 days ago)
JUNE_RANGE = (30, 8)      # Jun 1-30 (30-8 days ago)
JULY_RANGE = (7, 0)       # Jul 1-8 (7-0 days ago - current)

def generate_customer_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

def generate_phone():
    return f"09{random.randint(100000000, 999999999)}"

def generate_order_date(days_ago):
    return BASE_DATE - timedelta(days=days_ago)

def get_random_date_in_month(month_range):
    """Get a random date within a specific month range"""
    return random.randint(month_range[1], month_range[0])

def generate_order(order_num, status_type, days_ago=0):
    """Generate a single order SQL insert statement"""
    order_id = f"MOCK-ORD-{order_num:04d}"
    waybill = f"MOCK-WB-{order_num:04d}"
    
    # Product selection
    product_name, cost_price, selling_price = random.choice(PRODUCTS)
    qty = random.choices([1, 2, 3, 5], weights=[50, 30, 15, 5])[0]
    cogs = cost_price * qty
    total = selling_price * qty
    
    # Customer info
    customer_name = generate_customer_name()
    customer_contact = generate_phone()
    customer_address = random.choice(CITIES)
    
    # Channel and store
    channel = random.choice(CHANNELS)
    store = STORES[channel]
    courier = random.choice(COURIERS)
    
    # Agent and packer
    agent = random.choice(AGENTS)
    packer = random.choice(PACKERS) if status_type != 'PENDING' and status_type != 'CANCELLED_PACKING' else 'NULL'
    
    # Dates
    created_at = generate_order_date(days_ago)
    order_date = created_at.strftime('%Y-%m-%d')
    created_at_str = created_at.strftime('%Y-%m-%d %H:%M:%S')
    
    # Status-specific fields
    if status_type == 'PENDING':
        parcel_status = 'Pending'
        status = 'Pending'
        packed_by = 'NULL'
        packed_at = 'NULL'
        confirmation_status = random.choice(['Confirmed', 'Unconfirmed'])
        updated_at = created_at_str
        notes = random.choice(['NULL', "'Urgent delivery'", "'Call before delivery'", "'Gift wrap'", "'Fragile'"])
        
    elif status_type == 'PACKED':
        parcel_status = 'Packed'
        status = 'Packed'
        packed_by = f"'{packer}'"
        pack_time = created_at + timedelta(hours=random.randint(6, 24))
        packed_at = f"'{pack_time.strftime('%Y-%m-%d %H:%M:%S')}'"
        confirmation_status = 'Confirmed'
        updated_at = pack_time.strftime('%Y-%m-%d %H:%M:%S')
        notes = random.choice(['NULL', "'Ready to ship'", "'Check packaging'"])
        
    elif status_type == 'SHIPPED':
        parcel_status = random.choice(['Dispatched', 'In Transit', 'Out for Delivery'])
        status = 'Shipped'
        packed_by = f"'{packer}'"
        pack_time = created_at + timedelta(hours=random.randint(6, 18))
        packed_at = f"'{pack_time.strftime('%Y-%m-%d %H:%M:%S')}'"
        confirmation_status = 'Confirmed'
        update_time = pack_time + timedelta(hours=random.randint(12, 48))
        updated_at = update_time.strftime('%Y-%m-%d %H:%M:%S')
        notes = random.choice(['NULL', "'Track parcel'", "'Call before delivery'"])
        
    elif status_type == 'DELIVERED':
        parcel_status = 'Delivered'
        status = 'Delivered'
        packed_by = f"'{packer}'"
        pack_time = created_at + timedelta(hours=random.randint(6, 18))
        packed_at = f"'{pack_time.strftime('%Y-%m-%d %H:%M:%S')}'"
        confirmation_status = 'Confirmed'
        delivery_time = pack_time + timedelta(days=random.randint(2, 7))
        updated_at = delivery_time.strftime('%Y-%m-%d %H:%M:%S')
        notes = random.choice(['NULL', "'Thank you'", "'Fast delivery'", "'Excellent service'"])
        
    elif status_type == 'CANCELLED_PACKING':
        parcel_status = 'Cancelled'
        status = 'Cancelled'
        packed_by = 'NULL'
        packed_at = 'NULL'
        confirmation_status = 'Unconfirmed'
        cancel_time = created_at + timedelta(minutes=random.randint(30, 180))
        updated_at = cancel_time.strftime('%Y-%m-%d %H:%M:%S')
        notes = random.choice(["'Customer requested'", "'Out of stock'", "'Changed mind'", "'Duplicate order'"])
        
    elif status_type == 'CANCELLED_TRACKED':
        parcel_status = 'Cancelled'
        status = 'Cancelled'
        packed_by = f"'{packer}'"
        pack_time = created_at + timedelta(hours=random.randint(6, 18))
        packed_at = f"'{pack_time.strftime('%Y-%m-%d %H:%M:%S')}'"
        confirmation_status = 'Confirmed'
        cancel_time = pack_time + timedelta(hours=random.randint(12, 48))
        updated_at = cancel_time.strftime('%Y-%m-%d %H:%M:%S')
        notes = random.choice(["'Unable to deliver'", "'Wrong address'", "'Customer unavailable'"])
        
    elif status_type == 'RETURNED':
        parcel_status = 'Returned'
        status = 'Delivered'  # Was delivered first, then returned
        packed_by = f"'{packer}'"
        pack_time = created_at + timedelta(hours=random.randint(6, 18))
        packed_at = f"'{pack_time.strftime('%Y-%m-%d %H:%M:%S')}'"
        confirmation_status = 'Confirmed'
        return_time = pack_time + timedelta(days=random.randint(5, 14))
        updated_at = return_time.strftime('%Y-%m-%d %H:%M:%S')
        notes = random.choice(["'Wrong item received'", "'Damaged packaging'", "'Not as described'", "'Defective product'"])
    
    else:
        raise ValueError(f"Unknown status type: {status_type}")
    
    # Build SQL
    dispatch_notes = notes
    sql = f"('{order_id}', '{order_date}', '{waybill}', '{customer_name}', '{customer_contact}', '{customer_address}', '{product_name}', {qty}, {cogs:.2f}, {total:.2f}, '{parcel_status}', '{status}', '{channel}', '{store}', '{courier}', '{agent}', {packed_by}, {packed_at}, {dispatch_notes}, '{confirmation_status}', '{created_at_str}', '{updated_at}')"
    
    return sql

def main():
    print("-- ============================================================================")
    print("-- 4. MOCK ORDERS (600 Orders - ALL Parcel Statuses for Complete Testing)")
    print("-- ============================================================================")
    print("-- Auto-generated by generate_mock_orders.py")
    print("-- Coverage: LAST QUARTER (Apr, May, Jun) + THIS QUARTER (Jul) 2026")
    print("--")
    print("-- Distribution:")
    print(f"-- - {PENDING} Pending (To Be Packed) - July only")
    print(f"-- - {PACKED} Packed - July only")
    print(f"-- - {SHIPPED} Shipped/In Transit/Out for Delivery - June-July")
    print(f"-- - {DELIVERED} Delivered - April to July (ALL months)")
    print(f"-- - {CANCELLED_PACKING} Cancelled (before packing) - April to July (ALL months)")
    print(f"-- - {CANCELLED_TRACKED} Cancelled (after packing) - April to July (ALL months)")
    print(f"-- - {RETURNED} Returned - April to July (ALL months)")
    print(f"-- TOTAL: {TOTAL_ORDERS} Orders")
    print("--")
    print("-- Month Distribution:")
    print("-- April 2026: ~150 orders")
    print("-- May 2026: ~150 orders")
    print("-- June 2026: ~150 orders")
    print("-- July 2026: ~150 orders (including pending/packed)")
    print("--")
    print()
    
    print("INSERT INTO orders (id, date, waybill, customer_name, customer_contact, customer_address, product, qty, cogs, total, parcel_status, status, sales_channel, store, courier, dispatched_by, packed_by, packed_at, dispatch_notes, confirmation_status, created_at, updated_at)")
    print("VALUES")
    
    orders = []
    order_num = START_ORDER_NUM
    
    # Generate PENDING orders (July only - 0-2 days ago)
    for i in range(PENDING):
        days_ago = random.choice([0, 0, 0, 1, 1, 2])  # Mostly today/yesterday
        orders.append(generate_order(order_num, 'PENDING', days_ago))
        order_num += 1
    
    # Generate PACKED orders (July only - 1-5 days ago)
    for i in range(PACKED):
        days_ago = random.randint(1, 5)
        orders.append(generate_order(order_num, 'PACKED', days_ago))
        order_num += 1
    
    # Generate SHIPPED orders (June-July - 3-25 days ago)
    for i in range(SHIPPED):
        days_ago = random.randint(3, 25)
        orders.append(generate_order(order_num, 'SHIPPED', days_ago))
        order_num += 1
    
    # Generate DELIVERED orders - EVENLY across ALL 4 MONTHS
    # Split into 4 groups (Apr, May, Jun, Jul)
    delivered_per_month = DELIVERED // 4
    
    # April delivered
    for i in range(delivered_per_month):
        days_ago = get_random_date_in_month(APRIL_RANGE)
        orders.append(generate_order(order_num, 'DELIVERED', days_ago))
        order_num += 1
    
    # May delivered
    for i in range(delivered_per_month):
        days_ago = get_random_date_in_month(MAY_RANGE)
        orders.append(generate_order(order_num, 'DELIVERED', days_ago))
        order_num += 1
    
    # June delivered
    for i in range(delivered_per_month):
        days_ago = get_random_date_in_month(JUNE_RANGE)
        orders.append(generate_order(order_num, 'DELIVERED', days_ago))
        order_num += 1
    
    # July delivered (+ remainder)
    for i in range(delivered_per_month + (DELIVERED % 4)):
        days_ago = get_random_date_in_month(JULY_RANGE)
        orders.append(generate_order(order_num, 'DELIVERED', days_ago))
        order_num += 1
    
    # Generate CANCELLED_PACKING orders - EVENLY across ALL 4 MONTHS
    cancelled_packing_per_month = CANCELLED_PACKING // 4
    for month_range in [APRIL_RANGE, MAY_RANGE, JUNE_RANGE, JULY_RANGE]:
        count = cancelled_packing_per_month + (1 if month_range == JULY_RANGE and CANCELLED_PACKING % 4 else 0)
        for i in range(count):
            days_ago = get_random_date_in_month(month_range)
            orders.append(generate_order(order_num, 'CANCELLED_PACKING', days_ago))
            order_num += 1
    
    # Generate CANCELLED_TRACKED orders - EVENLY across ALL 4 MONTHS
    cancelled_tracked_per_month = CANCELLED_TRACKED // 4
    for month_range in [APRIL_RANGE, MAY_RANGE, JUNE_RANGE, JULY_RANGE]:
        count = cancelled_tracked_per_month + (1 if month_range == JULY_RANGE and CANCELLED_TRACKED % 4 else 0)
        for i in range(count):
            days_ago = get_random_date_in_month(month_range)
            orders.append(generate_order(order_num, 'CANCELLED_TRACKED', days_ago))
            order_num += 1
    
    # Generate RETURNED orders - EVENLY across ALL 4 MONTHS
    returned_per_month = RETURNED // 4
    for month_range in [APRIL_RANGE, MAY_RANGE, JUNE_RANGE, JULY_RANGE]:
        count = returned_per_month + (1 if month_range == JULY_RANGE and RETURNED % 4 else 0)
        for i in range(count):
            days_ago = get_random_date_in_month(month_range)
            orders.append(generate_order(order_num, 'RETURNED', days_ago))
            order_num += 1
    
    # Output SQL
    for i, order in enumerate(orders):
        if i < len(orders) - 1:
            print(f"{order},")
        else:
            print(f"{order};")
    
    print()
    print("-- ============================================================================")
    print(f"-- Total Orders Generated: {len(orders)}")
    print("-- ============================================================================")

if __name__ == "__main__":
    main()
