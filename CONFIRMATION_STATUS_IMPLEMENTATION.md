# Packing Queue Confirmation Status Implementation

## Date: June 22, 2026
## Status: IN PROGRESS

---

## Overview
Add confirmation workflow where Logistics/Admin must confirm waybill receipt before packers can see orders.

---

## ✅ COMPLETED CHANGES

### 1. Database Migration ✅
**File:** `supabase/migrations/052_add_confirmation_status_to_orders.sql`
- Added `confirmation_status` column to `orders` table
- Values: `'Confirmed'` or `'Unconfirmed'`
- Default: `'Confirmed'` for existing orders (backward compatibility)
- Index created for performance
- Migration ready to run

### 2. API Endpoint - Confirm Order ✅
**File:** `app/api/orders/[id]/confirm/route.ts`
- POST endpoint to confirm orders
- Access: Admin + Logistics roles only
- Updates `confirmation_status` to `'Confirmed'`
- Returns channel name for notifications
- Validates permissions and order existence

### 3. Order Creation Updated ✅
**File:** `app/api/orders/route.ts`
- New orders now created with `confirmation_status: 'Unconfirmed'`
- Line 172: Added field to insert statement

### 4. Packer Queue Filtered ✅
**File:** `app/api/packer/queue/route.ts`
- Added filter: `.eq('confirmation_status', 'Confirmed')`
- Packers only see confirmed orders
- Line 16: Filter applied to query

---

## 🔄 REMAINING TASKS

### 5. Update Packing Queue Page (Admin/Logistics View)
**File:** `app/dashboard/packing-queue/page.tsx`
**Lines to modify:** ~1300-1500 (table section)

**Changes Needed:**
1. **Add confirmation_status to Order interface** (line ~50)
   ```typescript
   confirmation_status?: string
   ```

2. **Fetch confirmation_status in API call** (line ~240)
   ```typescript
   confirmation_status: order.confirmation_status
   ```

3. **Add new table column header** (line ~1088 - after "Date & Time" column)
   ```typescript
   <th className="text-center py-4 px-4 text-[11px] font-bold text-white uppercase tracking-wider border-r border-slate-700/50 w-[130px]">
     Status
   </th>
   ```

4. **Add confirmation status badge in table row** (line ~1140 - after date column)
   ```typescript
   <td className="py-3 px-4">
     {order.confirmation_status === 'Confirmed' ? (
       <Badge className="bg-green-600 text-white text-[10px] px-2 py-1 font-bold">
         Confirmed
       </Badge>
     ) : (
       <Badge className="bg-yellow-600 text-white text-[10px] px-2 py-1 font-bold">
         Unconfirmed
       </Badge>
     )}
   </td>
   ```

5. **Add yellow row highlight for unconfirmed** (line ~1117 - tr className)
   ```typescript
   className={`transition-all duration-200 cursor-pointer ${
     order.is_cancelled 
       ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
       : order.confirmation_status === 'Unconfirmed'
       ? 'bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
       : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
   }`}
   ```

6. **Add "Confirm" button in actions column** (line ~1190 - before "VIEW DETAILS" button)
   ```typescript
   {/* Show Confirm button only for Admin/Logistics AND Unconfirmed orders */}
   {(userRole === 'admin' || userRole === 'logistics') && order.confirmation_status === 'Unconfirmed' && !order.is_cancelled && (
     <Button
       size="sm"
       onClick={async () => await handleConfirmOrder(order.id, order.channel || order.sales_channel || 'Unknown')}
       disabled={confirming === order.id}
       className="h-10 px-4 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white border-0 transition-all duration-200 whitespace-nowrap"
     >
       {confirming === order.id ? (
         <>
           <Loader2 className="h-4 w-4 mr-2 animate-spin" />
           Confirming...
         </>
       ) : (
         <>
           <CheckCircle className="h-4 w-4 mr-2" />
           CONFIRM
         </>
       )}
     </Button>
   )}
   ```

7. **Add confirming state** (line ~75 - with other state declarations)
   ```typescript
   const [confirming, setConfirming] = useState<string | null>(null)
   ```

8. **Add handleConfirmOrder function** (line ~700 - after other handlers)
   ```typescript
   const handleConfirmOrder = async (orderId: string, channelName: string) => {
     try {
       setConfirming(orderId)
       
       const response = await fetch(`/api/orders/${orderId}/confirm`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         }
       })
       
       const data = await response.json()
       
       if (!response.ok) {
         throw new Error(data.error || 'Failed to confirm order')
       }
       
       // Play notification sound
       const audio = new Audio('/sounds/order-confirmed.mp3')
       audio.volume = 0.5
       audio.play().catch(err => console.log('Audio play failed:', err))
       
       // Success toast
       toast.success('✅ Order confirmed! Waybill received.', {
         description: `Order is now visible to packers in ${channelName} department`,
         duration: 4000
       })
       
       // Update local state immediately (optimistic update)
       setOrders(prev => prev.map(o => 
         o.id === orderId ? { ...o, confirmation_status: 'Confirmed' } : o
       ))
       setFilteredOrders(prev => prev.map(o => 
         o.id === orderId ? { ...o, confirmation_status: 'Confirmed' } : o
       ))
       
       // Refresh data from server in background
       fetchOrders()
       
     } catch (error: any) {
       console.error('Error confirming order:', error)
       toast.error(error.message || 'Failed to confirm order')
     } finally {
       setConfirming(null)
     }
   }
   ```

9. **Add import for Loader2 icon** (line ~10)
   ```typescript
   import { Search, Package, RefreshCw, CheckCircle, ShoppingCart, TrendingUp, Eye, User, Phone, MapPin, Clock, Truck, Trash2, XCircle, Loader2 } from 'lucide-react'
   ```

---

## 📊 UI/UX Specifications

### Badge Colors:
- **Confirmed**: Green (`bg-green-600`)
- **Unconfirmed**: Yellow/Orange (`bg-yellow-600`)

### Row Highlighting:
- **Cancelled orders**: Red background (`bg-red-50`)
- **Unconfirmed orders**: Yellow background (`bg-yellow-50`)
- **Normal orders**: White/default background

### Button States:
- **Visible**: Only for Admin/Logistics on Unconfirmed orders
- **Hidden**: When order is confirmed or cancelled
- **Disabled**: While confirming (shows spinner)

---

## 🔔 Notification Requirements

### When Order is Confirmed:
**Recipients:**
- Department Head of the same channel
- Agent who created the order (same department)
- All Packers in the same department

**Notification Content:**
- Toast message with sound
- Message: "✅ Waybill confirmed for [Channel Name]"
- Sound: `/sounds/order-confirmed.mp3`

**Implementation:**
- Use existing notification system (same as order cancellation)
- Real-time via polling (packers refresh every 1 second)

---

## 🧪 Testing Checklist

### Database:
- [ ] Run migration successfully
- [ ] Existing orders have `confirmation_status = 'Confirmed'`
- [ ] New orders have `confirmation_status = 'Unconfirmed'`

### API:
- [ ] Confirm endpoint works for Admin
- [ ] Confirm endpoint works for Logistics
- [ ] Confirm endpoint blocked for other roles
- [ ] Cannot confirm already-confirmed orders
- [ ] Packer queue shows only confirmed orders

### UI:
- [ ] Confirmation status badge shows correctly
- [ ] Unconfirmed rows highlighted in yellow
- [ ] Confirm button visible only for Admin/Logistics
- [ ] Confirm button hidden when confirmed
- [ ] Confirm button disabled while processing
- [ ] Success toast shows after confirmation
- [ ] Packers don't see unconfirmed orders

### Notifications:
- [ ] Sound plays when order confirmed
- [ ] Toast message shows with channel name
- [ ] Packers see new order after confirmation

---

## 📁 Files Modified

1. ✅ `supabase/migrations/052_add_confirmation_status_to_orders.sql` - NEW
2. ✅ `app/api/orders/[id]/confirm/route.ts` - NEW
3. ✅ `app/api/orders/route.ts` - MODIFIED (line 172)
4. ✅ `app/api/packer/queue/route.ts` - MODIFIED (line 16)
5. ⏳ `app/dashboard/packing-queue/page.tsx` - TO BE MODIFIED
6. ⏳ `public/sounds/order-confirmed.mp3` - TO BE ADDED

---

## 🎵 Audio File Needed

Create or obtain: `/public/sounds/order-confirmed.mp3`
- Short, pleasant confirmation sound
- ~1-2 seconds duration
- Similar to existing order notification sounds

---

## 🚀 Deployment Steps

1. Run database migration
2. Deploy backend changes (API routes)
3. Deploy frontend changes (UI updates)
4. Add audio file to public folder
5. Test with real data
6. Monitor for issues

---

*End of Document*
