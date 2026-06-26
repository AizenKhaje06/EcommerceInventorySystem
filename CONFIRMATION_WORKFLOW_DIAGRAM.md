# Waybill Confirmation Workflow - Visual Guide

## 🔄 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEW ORDER CREATED                            │
│                 (by Agent or Department)                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │  Order Status: Pending      │
         │  Confirmation: UNCONFIRMED  │ 🟡 Yellow Highlight
         │  Visible to: Admin/Logistics│
         └─────────────┬───────────────┘
                       │
                       │ Order NOT visible to Packers yet
                       │
                       ▼
         ┌─────────────────────────────┐
         │ Waiting for Physical        │
         │ Waybill to Arrive...        │ ⏳ Pending
         └─────────────┬───────────────┘
                       │
                       │ Waybill Received!
                       │
                       ▼
         ┌─────────────────────────────┐
         │ Admin/Logistics Reviews     │
         │ Physical Waybill            │ 👀 Verification
         └─────────────┬───────────────┘
                       │
                       │ Clicks CONFIRM Button
                       │
                       ▼
         ┌─────────────────────────────┐
         │ POST /api/orders/[id]/confirm│
         │ Authorization Check          │ 🔐 Access Control
         └─────────────┬───────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │ Database Update:            │
         │ confirmation_status =       │ ✅ Confirmed
         │ 'Confirmed'                 │
         └─────────────┬───────────────┘
                       │
                       ├──────────────────────┬──────────────────┐
                       ▼                      ▼                  ▼
         ┌──────────────────┐   ┌──────────────────┐   ┌──────────────┐
         │ UI Updates:      │   │ Notifications:   │   │ Order now in:│
         │ • Badge → Green  │   │ • Toast message  │   │ • Packer     │
         │ • Row → Normal   │   │ • Sound plays 🔊 │   │   Queue      │
         │ • Button removed │   │ • Success shown  │   │              │
         └──────────────────┘   └──────────────────┘   └──────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │ Packer Can Now See & Pack   │
         │ the Order                   │ 📦 Ready to Pack
         └─────────────────────────────┘
```

---

## 👥 User Role Flow

### 🔴 Admin / Logistics
```
┌────────────────────────────────────────────────────┐
│            PACKING QUEUE - Admin View              │
├────────────────────────────────────────────────────┤
│                                                    │
│  Waybill     Date/Time    Status      Actions     │
│  ───────────────────────────────────────────────  │
│  WB-12345    Jun 26      🟢 Confirmed  [VIEW]     │
│  WB-12346    Jun 26      🟡 Unconfirmed [CONFIRM] [VIEW]  ← Can confirm
│  WB-12347    Jun 26      🟢 Confirmed  [VIEW]     │
│                                                    │
│  Row Highlights:                                  │
│  🟡 Yellow = Unconfirmed (needs confirmation)     │
│  ⚪ Normal = Confirmed (ready to pack)           │
│  🔴 Red    = Cancelled                           │
└────────────────────────────────────────────────────┘
```

### 📦 Packer
```
┌────────────────────────────────────────────────────┐
│            PACKING QUEUE - Packer View             │
├────────────────────────────────────────────────────┤
│                                                    │
│  Waybill     Date/Time    Status      Actions     │
│  ───────────────────────────────────────────────  │
│  WB-12345    Jun 26      🟢 Confirmed  [PACK]     │
│  WB-12347    Jun 26      🟢 Confirmed  [PACK]     │
│                                                    │
│  Note: Only CONFIRMED orders are shown            │
│  Unconfirmed orders are automatically hidden      │
└────────────────────────────────────────────────────┘
```

### 📊 Dept Manager / Operations
```
┌────────────────────────────────────────────────────┐
│         PACKING QUEUE - Dept Manager View          │
├────────────────────────────────────────────────────┤
│                                                    │
│  Waybill     Date/Time    Status      Actions     │
│  ───────────────────────────────────────────────  │
│  WB-12345    Jun 26      🟢 Confirmed  [VIEW]     │
│  WB-12346    Jun 26      🟡 Unconfirmed [VIEW]    │ ← Read-only
│  WB-12347    Jun 26      🟢 Confirmed  [VIEW]     │
│                                                    │
│  Note: Can see status but cannot confirm          │
│  (View-only access to confirmation status)        │
└────────────────────────────────────────────────────┘
```

---

## 🎬 Button State Flow

### Confirm Button States:

```
STATE 1: INITIAL (Unconfirmed Order)
┌────────────────────────────────┐
│  ✓  CONFIRM                    │ ← Green button, enabled
└────────────────────────────────┘
  Click triggers confirmation
  
         ↓ User clicks
         
STATE 2: LOADING (Processing)
┌────────────────────────────────┐
│  ⟳  Confirming...              │ ← Spinner animation, disabled
└────────────────────────────────┘
  API call in progress
  
         ↓ API response
         
STATE 3: SUCCESS (Confirmed)
┌────────────────────────────────┐
│  [Button removed]              │ ← No button shown
└────────────────────────────────┘
  Order is confirmed, no action needed
```

---

## 🎨 UI State Changes

### Before Confirmation:
```
┌─────────────────────────────────────────────────────────────┐
│ 🟡 YELLOW ROW HIGHLIGHT                                     │
├─────────────────────────────────────────────────────────────┤
│ WB-12346  │ Jun 26 10:30 │ 🟡 Unconfirmed │ [CONFIRM] [VIEW] │
└─────────────────────────────────────────────────────────────┘
     ▲                           ▲                ▲
     │                           │                │
  Entire row                Yellow badge      Green button
  highlighted                displayed         visible
```

### After Confirmation:
```
┌─────────────────────────────────────────────────────────────┐
│ ⚪ NORMAL ROW (no highlight)                                │
├─────────────────────────────────────────────────────────────┤
│ WB-12346  │ Jun 26 10:30 │ 🟢 Confirmed   │ [VIEW]          │
└─────────────────────────────────────────────────────────────┘
     ▲                           ▲                ▲
     │                           │                │
  Normal row                 Green badge      CONFIRM button
  background                 displayed        removed
```

---

## 🔐 Access Control Matrix

| Role          | See All Orders | See Status | Confirm Orders | See Unconfirmed |
|---------------|----------------|------------|----------------|-----------------|
| Admin         | ✅ Yes         | ✅ Yes     | ✅ Yes         | ✅ Yes          |
| Logistics     | ✅ Yes         | ✅ Yes     | ✅ Yes         | ✅ Yes          |
| Dept Manager  | ✅ Yes*        | ✅ Yes     | ❌ No          | ✅ Yes          |
| Operations    | ✅ Yes*        | ✅ Yes     | ❌ No          | ✅ Yes          |
| Packer        | ⚠️ Confirmed only | ✅ Yes  | ❌ No          | ❌ No           |
| Agent         | ⚠️ Own orders  | ✅ Yes     | ❌ No          | ⚠️ Own only     |

*Filtered by assigned channel

---

## 📱 Mobile Responsive View

```
┌─────────────────────────────────┐
│  📱 MOBILE VIEW                 │
├─────────────────────────────────┤
│  ← Swipe to see columns →       │
├─────────────────────────────────┤
│  🟡 WB-12346                    │
│     Shopee • Jun 26, 10:30 AM   │
│     🟡 Unconfirmed              │
│     [CONFIRM]  [VIEW DETAILS]   │
├─────────────────────────────────┤
│  ⚪ WB-12345                    │
│     Lazada • Jun 26, 9:15 AM    │
│     🟢 Confirmed                │
│     [VIEW DETAILS]              │
└─────────────────────────────────┘
```

---

## 🔔 Notification Flow

```
Confirmation Triggered
         │
         ▼
┌─────────────────────┐
│ API Call Success    │
└──────┬──────────────┘
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌─────────────┐     ┌────────────────┐
│ Toast       │     │ Audio          │
│ Message:    │     │ Notification:  │
│             │     │                │
│ "✅ Order   │     │ 🔊 Sound plays │
│ confirmed!  │     │ order-         │
│ Waybill     │     │ confirmed.mp3  │
│ received."  │     │                │
└─────────────┘     └────────────────┘
       │                     │
       └──────────┬──────────┘
                  ▼
         ┌────────────────┐
         │ UI Updates     │
         │ (Immediate)    │
         └────────────────┘
```

---

## 💾 Database State Diagram

```
ORDERS TABLE
┌──────────┬────────────┬──────────────────────┐
│ id       │ status     │ confirmation_status  │
├──────────┼────────────┼──────────────────────┤
│ order-1  │ Pending    │ Unconfirmed  🟡     │ ← New order
│ order-2  │ Pending    │ Confirmed    🟢     │ ← Can pack
│ order-3  │ Packed     │ Confirmed    🟢     │ ← Already done
│ order-4  │ Cancelled  │ Unconfirmed  🟡     │ ← Cancelled before confirm
└──────────┴────────────┴──────────────────────┘

Filter for Packers:
WHERE status = 'Pending' 
  AND confirmation_status = 'Confirmed'
  AND is_cancelled = false
```

---

## 🎯 Decision Tree

```
New Order Arrives
       │
       ▼
   Is physical waybill
   received?
       │
   ┌───┴───┐
   │       │
   NO     YES
   │       │
   ▼       ▼
Leave as  Admin/Logistics
Unconfirmed  clicks CONFIRM
   │       │
   │       ▼
   │   confirmation_status
   │   = 'Confirmed'
   │       │
   └───────┴────────▶ Order appears
                      in Packer Queue
```

---

## 📊 System Flow Chart

```
┌─────────────┐
│   Agent     │
│  Creates    │
│   Order     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  Database: orders table         │
│  • status = 'Pending'           │
│  • confirmation_status =        │
│    'Unconfirmed'                │
└──────┬──────────────────────────┘
       │
       ├──────────────────────┬─────────────────┐
       │                      │                 │
       ▼                      ▼                 ▼
┌────────────┐      ┌──────────────┐    ┌──────────────┐
│Admin/      │      │ Dept Manager │    │   Packer     │
│Logistics   │      │ Operations   │    │   Queue      │
│            │      │              │    │              │
│Can see &   │      │Can see but   │    │Cannot see    │
│confirm     │      │cannot confirm│    │unconfirmed   │
└─────┬──────┘      └──────────────┘    └──────────────┘
      │
      │ Waybill arrives
      │
      ▼
┌─────────────┐
│ Click       │
│ CONFIRM     │
└─────┬───────┘
      │
      ▼
┌─────────────────────────────────┐
│  POST /api/orders/[id]/confirm  │
│  • Verify role (Admin/Logistics)│
│  • Update confirmation_status   │
│  • Return success               │
└─────┬───────────────────────────┘
      │
      ├──────────────────┬─────────────────┐
      │                  │                 │
      ▼                  ▼                 ▼
┌──────────┐      ┌───────────┐    ┌──────────────┐
│UI Update │      │Notification│   │Order now in  │
│• Badge   │      │• Toast     │   │Packer Queue  │
│• Row     │      │• Sound     │   │              │
│• Button  │      │            │   │✅ Ready      │
└──────────┘      └───────────┘    └──────────────┘
```

---

## 🎨 Color Legend

### Badge Colors:
- 🟢 **Green** (`bg-green-600`) = Confirmed
- 🟡 **Yellow** (`bg-yellow-600`) = Unconfirmed
- 🔴 **Red** (`bg-red-600`) = Cancelled

### Row Highlights:
- ⚪ **Normal** = Default state (white/slate)
- 🟡 **Yellow** (`bg-yellow-50`) = Unconfirmed order
- 🔴 **Red** (`bg-red-50`) = Cancelled order (highest priority)

### Button Colors:
- 🟢 **Green** (`bg-green-600`) = CONFIRM button
- ⚪ **Outline** = VIEW DETAILS button
- 🔴 **Red** = CANCEL button (if needed)

---

## ⚡ Performance Optimizations

### Database:
```sql
-- Index added for fast filtering
CREATE INDEX idx_orders_confirmation_status 
ON orders(confirmation_status);

-- Efficient query:
SELECT * FROM orders 
WHERE confirmation_status = 'Confirmed'
  AND status = 'Pending'
LIMIT 100;
```

### Frontend:
```typescript
// Optimistic update (immediate UI feedback)
setOrders(prev => prev.map(o => 
  o.id === orderId 
    ? { ...o, confirmation_status: 'Confirmed' } 
    : o
))

// Background refresh (data consistency)
fetchOrders()
```

---

## 📝 Quick Reference

### API Endpoints:
- `GET /api/orders?status=Pending` - Get all pending orders
- `POST /api/orders/[id]/confirm` - Confirm an order (Admin/Logistics only)
- `GET /api/packer/queue` - Get confirmed orders for packer

### Database Column:
- **Table:** `orders`
- **Column:** `confirmation_status`
- **Type:** `TEXT`
- **Values:** `'Confirmed'` or `'Unconfirmed'`
- **Default:** `'Confirmed'` (for existing), `'Unconfirmed'` (for new)

### Key Files:
- Migration: `supabase/migrations/052_add_confirmation_status_to_orders.sql`
- API: `app/api/orders/[id]/confirm/route.ts`
- UI: `app/dashboard/packing-queue/page.tsx`
- Sound: `public/sounds/order-confirmed.mp3`

---

*Workflow diagram created: June 26, 2026*
*Status: Complete and ready for use*
