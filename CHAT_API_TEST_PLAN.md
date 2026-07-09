# Chat API Test Plan - Enhanced Validation & Error Handling

## Overview
Testing the updated `/api/chat/conversations` endpoint with new features:
- Rate limiting
- Input validation
- Duplicate conversation detection
- Enhanced error handling

## Test Cases

### 1. Create Direct Conversation - Success ✅
**Endpoint**: `POST /api/chat/conversations`
**Headers**:
```
x-user-username: admin
x-user-role: admin
Content-Type: application/json
```
**Body**:
```json
{
  "type": "direct",
  "members": ["tracker"]
}
```
**Expected**: 201 Created
**Response**:
```json
{
  "id": "conversation-id",
  "type": "direct",
  "name": null,
  "exists": false
}
```

---

### 2. Create Duplicate Direct Conversation - Returns Existing ✅
**Endpoint**: `POST /api/chat/conversations`
**Body**: Same as Test 1
**Expected**: 200 OK
**Response**:
```json
{
  "id": "same-conversation-id",
  "type": "direct",
  "name": null,
  "exists": true
}
```

---

### 3. Create Group Conversation - Success ✅
**Endpoint**: `POST /api/chat/conversations`
**Body**:
```json
{
  "type": "group",
  "name": "Test Group Chat",
  "members": ["tracker", "packer1"]
}
```
**Expected**: 201 Created

---

### 4. Create Group - Missing Name (Validation) ❌
**Endpoint**: `POST /api/chat/conversations`
**Body**:
```json
{
  "type": "group",
  "members": ["tracker"]
}
```
**Expected**: 400 Bad Request
**Response**:
```json
{
  "error": "Group name is required",
  "code": "VALIDATION_ERROR"
}
```

---

### 5. Create Group - Empty Name (Validation) ❌
**Endpoint**: `POST /api/chat/conversations`
**Body**:
```json
{
  "type": "group",
  "name": "",
  "members": ["tracker"]
}
```
**Expected**: 400 Bad Request
**Response**:
```json
{
  "error": "Group name cannot be empty",
  "code": "VALIDATION_ERROR"
}
```

---

### 6. Create Group - Name Too Long (Validation) ❌
**Endpoint**: `POST /api/chat/conversations`
**Body**:
```json
{
  "type": "group",
  "name": "<101 characters>",
  "members": ["tracker"]
}
```
**Expected**: 400 Bad Request
**Response**:
```json
{
  "error": "Group name too long (max 100 characters)",
  "code": "VALIDATION_ERROR"
}
```

---

### 7. Create Conversation - Invalid Type ❌
**Endpoint**: `POST /api/chat/conversations`
**Body**:
```json
{
  "type": "invalid",
  "members": ["tracker"]
}
```
**Expected**: 400 Bad Request
**Response**:
```json
{
  "error": "Invalid conversation type",
  "code": "VALIDATION_ERROR"
}
```

---

### 8. Create Conversation - No Members ❌
**Endpoint**: `POST /api/chat/conversations`
**Body**:
```json
{
  "type": "direct",
  "members": []
}
```
**Expected**: 400 Bad Request
**Response**:
```json
{
  "error": "At least one member is required",
  "code": "VALIDATION_ERROR"
}
```

---

### 9. Create Conversation - Too Many Members ❌
**Endpoint**: `POST /api/chat/conversations`
**Body**:
```json
{
  "type": "group",
  "name": "Large Group",
  "members": ["user1", "user2", ..., "user51"]  // 51 members
}
```
**Expected**: 400 Bad Request
**Response**:
```json
{
  "error": "Too many members (max 50)",
  "code": "VALIDATION_ERROR"
}
```

---

### 10. Create Conversation - Unauthorized ❌
**Endpoint**: `POST /api/chat/conversations`
**Headers**: (no auth headers)
**Expected**: 401 Unauthorized
**Response**:
```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

---

### 11. Rate Limiting Test ❌
**Endpoint**: `POST /api/chat/conversations`
**Test**: Make 11 requests within 60 seconds
**Expected**: 
- First 10: 201/200
- 11th: 429 Too Many Requests
**Response** (11th request):
```json
{
  "error": "Too many requests. Please try again later",
  "code": "RATE_LIMIT"
}
```

---

### 12. Get Conversations - Success ✅
**Endpoint**: `GET /api/chat/conversations`
**Headers**:
```
x-user-username: admin
x-user-role: admin
```
**Expected**: 200 OK
**Response**: Array of conversations with members

---

### 13. Get Conversations - Unauthorized ❌
**Endpoint**: `GET /api/chat/conversations`
**Headers**: (no auth)
**Expected**: 401 Unauthorized

---

### 14. Get Conversations - Rate Limited ❌
**Test**: Make 31 GET requests within 60 seconds
**Expected**: 429 on 31st request

---

## Summary

| Category | Test Cases | Pass Criteria |
|----------|------------|---------------|
| Success Cases | 3 | Return correct status codes (200/201) and valid response structure |
| Validation Errors | 6 | Return 400 with descriptive error messages and error codes |
| Authentication | 2 | Return 401 with authentication error |
| Rate Limiting | 2 | Return 429 after exceeding limits |
| **Total** | **13** | All tests must pass |

## Implementation Status

✅ = Implemented in code
❌ = Needs Postman test case
🔄 = Partially implemented

- [✅] Enhanced error handling with ChatError class
- [✅] Input validation using chat-utils functions
- [✅] Rate limiting with checkRateLimit
- [✅] Duplicate conversation detection
- [❌] Comprehensive Postman test suite (this document)

## Next Steps

1. Add new test cases to .postman.json
2. Run full test suite
3. Document any failures
4. Fix identified issues
5. Re-run tests until all pass
