# Postman Collection Update: Confirm Order Endpoint

## Overview
The `/api/orders/[id]/confirm` endpoint was just modified with enhanced logging. This document provides:
1. The new test specification to add to `.postman.json`
2. Instructions for running the collection
3. Expected results and fixes for any errors

---

## 📍 Location in Postman Collection

**Insert Location:** After "Cancel Order - Already Cancelled" test (around line 1007) and before "Return Order to Queue" section

**Section:** Orders → Confirm Order Tests

---

## 🧪 New Test Specification

Add these THREE test cases to the Postman collection:

### Test 1: Confirm Order (Success Case)

```json
{
  "name": "Confirm Order (Waybill Confirmation)",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json",
        "type": "text"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": ""
    },
    "url": {
      "raw": "{{baseUrl}}/api/orders/{{unconfirmedOrderId}}/confirm",
      "host": ["{{baseUrl}}"],
      "path": ["api", "orders", "{{unconfirmedOrderId}}", "confirm"]
    },
    "description": "Confirm that physical waybill has been received by logistics/admin. Changes confirmation_status from 'Unconfirmed' to 'Confirmed', making order visible to packers."
  },
  "event": [
    {
      "listen": "test",
      "script": {
        "exec": [
          "// Test 1: Status code should be 200",
          "pm.test('Status code is 200', function () {",
          "    pm.response.to.have.status(200);",
          "});",
          "",
          "// Test 2: Response should be JSON",
          "pm.test('Response is JSON', function () {",
          "    pm.response.to.be.json;",
          "});",
          "",
          "// Test 3: Response has required fields",
          "pm.test('Response has required fields', function () {",
          "    const jsonData = pm.response.json();",
          "    pm.expect(jsonData).to.have.property('success');",
          "    pm.expect(jsonData).to.have.property('message');",
          "    pm.expect(jsonData).to.have.property('order');",
          "    pm.expect(jsonData).to.have.property('channelName');",
          "});",
          "",
          "// Test 4: Success is true",
          "pm.test('Success is true', function () {",
          "    const jsonData = pm.response.json();",
          "    pm.expect(jsonData.success).to.be.true;",
          "});",
          "",
          "// Test 5: Order confirmation_status is 'Confirmed'",
          "pm.test('Order confirmation_status is Confirmed', function () {",
          "    const jsonData = pm.response.json();",
          "    pm.expect(jsonData.order).to.have.property('confirmation_status');",
          "    pm.expect(jsonData.order.confirmation_status).to.equal('Confirmed');",
          "});",
          "",
          "// Test 6: Message confirms successful confirmation",
          "pm.test('Message confirms successful confirmation', function () {",
          "    const jsonData = pm.response.json();",
          "    pm.expect(jsonData.message).to.include('confirmed');",
          "});",
          "",
          "// Test 7: Channel name is returned",
          "pm.test('Channel name is returned', function () {",
          "    const jsonData = pm.response.json();",
          "    pm.expect(jsonData.channelName).to.be.a('string');",
          "    pm.expect(jsonData.channelName.length).to.be.above(0);",
          "});",
          "",
          "// Test 8: Order has updated_at timestamp",
          "pm.test('Order has updated_at timestamp', function () {",
          "    const jsonData = pm.response.json();",
          "    pm.expect(jsonData.order).to.have.property('updated_at');",
          "    pm.expect(jsonData.order.updated_at).to.be.a('string');",
          "});",
          "",
          "// Test 9: Response time is acceptable",
          "pm.test('Response time is acceptable', function () {",
          "    pm.expect(pm.response.responseTime).to.be.below(2000);",
          "});"
        ],
        "type": "text/javascript"
      }
    }
  ]
}
```

### Test 2: Confirm Order - Already Confirmed

```json
{
  "name": "Confirm Order - Already Confirmed",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json",
        "type": "text"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": ""
    },
    "url": {
      "raw": "{{baseUrl}}/api/orders/{{confirmedOrderId}}/confirm",
      "host": ["{{baseUrl}}"],
      "path": ["api", "orders", "{{confirmedOrderId}}", "confirm"]
    },
    "description": "Test validation - should fail when trying to confirm an already confirmed order"
  },
  "event": [
    {
      "listen": "test",
      "script": {
        "exec": [
          "// Test 1: Status code should be 400 (Bad Request)",
          "pm.test('Status code is 400', function () {",
          "    pm.response.to.have.status(400);",
          "});",
          "",
          "// Test 2: Response has error message",
          "pm.test('Response has error message', function () {",
          "    const jsonData = pm.response.json();",
          "    pm.expect(jsonData).to.have.property('error');",
          "    pm.expect(jsonData.error).to.include('already confirmed');",
          "});",
          "",
          "// Test 3: Success is false",
          "pm.test('Success is false', function () {",
          "    const jsonData = pm.response.json();",
          "    pm.expect(jsonData.success).to.be.false;",
          "});"
        ],
        "type": "text/javascript"
      }
    }
  ]
}
```

### Test 3: Confirm Order - Invalid Order ID

```json
{
  "name": "Confirm Order - Invalid Order ID",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json",
        "type": "text"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": ""
    },
    "url": {
      "raw": "{{baseUrl}}/api/orders/INVALID-ORDER-ID-12345/confirm",
      "host": ["{{baseUrl}}"],
      "path": ["api", "orders", "INVALID-ORDER-ID-12345", "confirm"]
    },
    "description": "Test with non-existent order ID - should return 404"
  },
  "event": [
    {
      "listen": "test",
      "script": {
        "exec": [
          "// Test 1: Status code should be 404 (Not Found)",
          "pm.test('Status code is 404', function () {",
          "    pm.response.to.have.status(404);",
          "});",
          "",
          "// Test 2: Response has error message",
          "pm.test('Response has error message', function () {",
          "    const jsonData = pm.response.json();",
          "    pm.expect(jsonData).to.have.property('error');",
          "    pm.expect(jsonData.error).to.include('not found');",
          "});",
          "",
          "// Test 3: Success is false",
          "pm.test('Success is false', function () {",
          "    const jsonData = pm.response.json();",
          "    pm.expect(jsonData.success).to.be.false;",
          "});",
          "",
          "// Test 4: Debug information is included",
          "pm.test('Debug information is included', function () {",
          "    const jsonData = pm.response.json();",
          "    pm.expect(jsonData).to.have.property('debug');",
          "    pm.expect(jsonData.debug).to.have.property('orderId');",
          "});"
        ],
        "type": "text/javascript"
      }
    }
  ]
}
```

---

## 📊 Required Variables

Add these to your Postman environment:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `baseUrl` | API base URL | `http://localhost:3000` |
| `unconfirmedOrderId` | ID of order with confirmation_status='Unconfirmed' | `ORD-2026-001` |
| `confirmedOrderId` | ID of order with confirmation_status='Confirmed' | `ORD-2026-002` |

---

## 🚀 How to Run the Collection

### Option 1: Using Postman CLI (Newman)

```bash
# Install Newman if not already installed
npm install -g newman

# Run the entire collection
newman run .postman.json --environment postman-environment.json

# Run only Orders folder
newman run .postman.json --folder "Orders" --environment postman-environment.json

# Run with detailed output
newman run .postman.json --reporters cli,json --reporter-json-export results.json
```

### Option 2: Using Postman Desktop App

1. Import `.postman.json` into Postman
2. Create/Select environment with required variables
3. Navigate to Orders folder → Confirm Order tests
4. Click "Run" to execute tests

### Option 3: Manual Testing with cURL

```bash
# Test 1: Confirm an unconfirmed order
curl -X POST http://localhost:3000/api/orders/ORD-2026-001/confirm \
  -H "Content-Type: application/json"

# Test 2: Try to confirm already confirmed order (should fail)
curl -X POST http://localhost:3000/api/orders/ORD-2026-002/confirm \
  -H "Content-Type: application/json"

# Test 3: Invalid order ID (should fail)
curl -X POST http://localhost:3000/api/orders/INVALID-ORDER-ID/confirm \
  -H "Content-Type: application/json"
```

---

## 🔍 Console Logging Analysis

The modified endpoint now includes extensive console logging:

### Logging Points:
1. **Request Reception**: `[Confirm Order] POST request received`
2. **Parameter Validation**: `[Confirm Order] Order ID: {id}`
3. **Database Query**: `[Confirm Order] Looking up order: {orderId}`
4. **Query Result**: `[Confirm Order] Query result: {order, error}`
5. **Error Cases**: `[Confirm Order] Order not found` or `[Confirm Order] Database error`
6. **Success**: `[Confirm Order] Order {orderId} confirmed successfully`

### Debug Information:
The endpoint now returns debug info in error responses:
```json
{
  "success": false,
  "error": "Order not found",
  "debug": {
    "orderId": "INVALID-123",
    "fetchError": {...}
  }
}
```

---

## ✅ Expected Test Results

### Success Case (Test 1):
```json
{
  "success": true,
  "message": "Order confirmed successfully",
  "order": {
    "id": "ORD-2026-001",
    "confirmation_status": "Confirmed",
    "updated_at": "2026-06-22T08:30:00.000Z",
    ...
  },
  "channelName": "Shopee"
}
```

### Already Confirmed (Test 2):
```json
{
  "success": false,
  "error": "Order is already confirmed"
}
```

### Invalid Order ID (Test 3):
```json
{
  "success": false,
  "error": "Order not found",
  "debug": {
    "orderId": "INVALID-ORDER-ID-12345",
    "fetchError": {...}
  }
}
```

---

## 🛠️ Common Issues & Fixes

### Issue 1: Order Not Found (404)
**Cause:** Order ID doesn't exist in database  
**Fix:** 
1. Check database for valid order IDs:
   ```sql
   SELECT id, confirmation_status FROM orders LIMIT 10;
   ```
2. Update `{{unconfirmedOrderId}}` variable with valid ID

### Issue 2: All Orders Already Confirmed
**Cause:** No unconfirmed orders in database  
**Fix:** Create a test order with unconfirmed status:
```sql
-- Create test order with unconfirmed status
INSERT INTO orders (id, confirmation_status, sales_channel, ...)
VALUES ('TEST-ORD-001', 'Unconfirmed', 'Shopee', ...);
```

### Issue 3: Database Connection Error (500)
**Cause:** Supabase connection issue  
**Fix:**
1. Verify `.env.local` has correct Supabase credentials
2. Check Supabase service is running
3. Verify `SUPABASE_SERVICE_ROLE_KEY` is valid

### Issue 4: Missing confirmation_status Column
**Cause:** Migration 052 not applied  
**Fix:** Run the migration:
```bash
cd supabase
psql $DATABASE_URL -f migrations/052_add_confirmation_status_to_orders.sql
```

---

## 📈 Performance Benchmarks

| Test Case | Expected Response Time | Max Acceptable |
|-----------|----------------------|----------------|
| Success Case | <500ms | <2000ms |
| Already Confirmed | <300ms | <1000ms |
| Invalid Order ID | <300ms | <1000ms |

---

## 🔐 Security Considerations

### Authentication:
- Endpoint currently has **NO auth check** (matches other endpoints pattern)
- Auth is **enforced at UI level** (Admin/Logistics roles only)
- Consider adding role-based middleware for API-level protection

### Recommended Enhancement:
```typescript
// Add to route.ts
import { verifyRole } from '@/lib/auth-middleware'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  // Add role check
  const roleCheck = await verifyRole(request, ['admin', 'logistics-admin'])
  if (!roleCheck.authorized) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 403 }
    )
  }
  // ... rest of endpoint logic
}
```

---

## 📝 Test Coverage Summary

| Aspect | Coverage |
|--------|----------|
| **Status Codes** | ✅ 200, 400, 404 |
| **Success Path** | ✅ Confirmed order |
| **Error Handling** | ✅ Already confirmed, Invalid ID |
| **Response Structure** | ✅ success, message, order, channelName |
| **Database Updates** | ✅ confirmation_status, updated_at |
| **Performance** | ✅ Response time validation |
| **Debug Info** | ✅ Debug field in errors |

---

## 🎯 Next Steps

1. **Add tests to Postman collection** using the JSON above
2. **Create test data** with confirmed/unconfirmed orders
3. **Run collection** and verify all tests pass
4. **Check console logs** to ensure debugging info appears
5. **Monitor production** for any issues with the new logging

---

## 📞 Support

If tests fail:
1. Check console logs in the API server
2. Verify database migration 052 is applied
3. Confirm Supabase credentials are correct
4. Review the debug information in error responses

---

**Document Version:** 1.0  
**Last Updated:** June 22, 2026  
**Endpoint:** POST `/api/orders/[id]/confirm`  
**Migration:** 052_add_confirmation_status_to_orders.sql  
**Created By:** Kiro AI Assistant
