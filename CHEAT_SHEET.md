# 📋 Chat System - One Page Cheat Sheet

## 🚀 Setup (5 min)

```bash
# 1. Run sa Supabase SQL Editor
File: scripts/sql/FIX_CHAT_SYSTEM_SIMPLE.sql

# 2. Verify
File: scripts/sql/CHECK_CHAT_TABLES.sql
# Dapat: ✅ EXISTS (lahat)
```

---

## 📂 File Structure

```
Ready to Use (Import lang):
✅ hooks/use-chat-realtime.ts         Real-time
✅ lib/chat-utils.ts                  Validation
✅ components/toast-provider.tsx      Toasts

Need to Edit:
⚠️ app/layout.tsx                     Add ToastProvider
⚠️ app/dashboard/chat/page.tsx        Main UI file
```

---

## 💻 Code Snippets

### 1. Add ToastProvider (app/layout.tsx)
```typescript
import { ToastProvider } from '@/components/toast-provider'

<ToastProvider>
  {children}
</ToastProvider>
```

### 2. Use Toast (app/dashboard/chat/page.tsx)
```typescript
import { useToast } from '@/components/toast-provider'

const { showToast } = useToast()

showToast('Success!', 'success')
showToast('Error!', 'error')
showToast('Warning!', 'warning')
```

### 3. Real-time Updates
```typescript
import { useChatRealtime } from '@/hooks/use-chat-realtime'

const { sendTypingIndicator } = useChatRealtime({
  conversationId: selectedConv?.id || null,
  onNewMessage: (msg) => {
    setMessages(prev => [...prev, msg])
    showToast('New message', 'info')
  },
  onTyping: (userId, isTyping) => {
    // Show typing indicator
  },
  onPresenceChange: (userId, isOnline) => {
    // Update online status
  }
})
```

### 4. Validation
```typescript
import { validateMessage, sanitizeMessage, checkRateLimit } from '@/lib/chat-utils'

// Validate
const validation = validateMessage(input)
if (!validation.valid) {
  showToast(validation.error, 'error')
  return
}

// Sanitize
const clean = sanitizeMessage(input)

// Rate limit
if (!checkRateLimit(userId, 20, 60000)) {
  showToast('Too fast!', 'warning')
  return
}
```

### 5. Loading States
```typescript
const [loading, setLoading] = useState(false)

// Before fetch
setLoading(true)

// After fetch
setLoading(false)

// Show skeleton
{loading ? <Skeleton /> : <Content />}
```

### 6. Error Handling
```typescript
try {
  const res = await fetch('/api/...')
  if (!res.ok) throw new Error('Failed')
  showToast('Success!', 'success')
} catch (error) {
  showToast('Error!', 'error')
}
```

---

## 🎯 Implementation Order

```
Phase 1 (4-6h): CRITICAL
├─ Add ToastProvider          (10 min)
├─ Real-time updates          (2h)
├─ Loading states             (1h)
└─ Error handling + validation (1h)

Phase 2 (6-8h): HIGH
├─ Online status              (1h)
├─ Read receipts              (2h)
├─ Mobile responsive          (3h)
└─ File attachments           (2h)

Phase 3 (8-12h): MEDIUM
├─ Edit/delete messages       (2h)
├─ Emoji reactions            (2h)
├─ Keyboard shortcuts         (1h)
└─ Performance                (3h)
```

---

## ⏱️ Time Estimates

| Goal | Time | Priority |
|------|------|----------|
| Functional chat | 4-6h | 🚨 CRITICAL |
| Professional | 10-14h | ⭐ HIGH |
| Enterprise-grade | 18-26h | 🎨 FULL |

---

## 🔍 Quick Debugging

### Real-time not working?
```typescript
// Add console.log in onNewMessage
onNewMessage: (msg) => {
  console.log('📨 New message:', msg)
  // ...
}
```

### Check Network Tab
- Chrome DevTools > Network
- Look for WebSocket connections
- Check API responses

### Check Supabase
- Realtime enabled?
- Tables in publication?
- RLS policies correct?

---

## 📚 Documentation Files

| Need | Read |
|------|------|
| Step-by-step code | CHAT_IMPLEMENTATION_GUIDE.md |
| What's wrong | CHAT_UI_UX_AUDIT.md |
| Complete overview | CHAT_FIX_SUMMARY.md |
| Quick start | START_HERE.md |
| This cheat sheet | CHEAT_SHEET.md |

---

## ✅ Testing Checklist

```
Phase 1:
□ Messages appear instantly
□ Typing indicator works
□ Toasts show on error/success
□ Loading states show
□ Can't send empty messages
□ Character limit enforced

Phase 2:
□ Online status shows
□ Read receipts update
□ Works on mobile
□ Files can upload

Phase 3:
□ Can edit messages
□ Can delete messages
□ Reactions work
□ Shortcuts work
```

---

## 🆘 Common Errors

| Error | Fix |
|-------|-----|
| "Cannot find module" | Check import path |
| "Undefined is not a function" | Check hook imported correctly |
| "Network error" | Check API endpoint + CORS |
| "Real-time not updating" | Check Supabase realtime settings |
| "Toast not showing" | Check ToastProvider in layout |

---

## 💡 Pro Tips

1. **Test incrementally** - After each feature
2. **Console.log everything** - Debug easier
3. **Read audit first** - Understand why
4. **One phase at a time** - Don't skip ahead
5. **Check Network tab** - See API calls

---

## 🎯 Priority Features

```
MUST HAVE (Wag palampas):
✅ Real-time updates
✅ Error handling
✅ Loading states
✅ Validation

SHOULD HAVE (Recommended):
⭐ Online status
⭐ Read receipts
⭐ Mobile responsive
⭐ File attachments

NICE TO HAVE (Optional):
⚠️ Edit/delete
⚠️ Reactions
⚠️ Shortcuts
```

---

## 📞 Quick Links

```
Backend Ready:
✅ hooks/use-chat-realtime.ts
✅ lib/chat-utils.ts
✅ components/toast-provider.tsx

Need Work:
⚠️ app/layout.tsx (add ToastProvider)
⚠️ app/dashboard/chat/page.tsx (main UI)

Database:
📁 scripts/sql/FIX_CHAT_SYSTEM_SIMPLE.sql
📁 scripts/sql/CHECK_CHAT_TABLES.sql

Documentation:
📄 CHAT_IMPLEMENTATION_GUIDE.md (main guide)
📄 START_HERE.md (getting started)
```

---

## 🎉 Bottom Line

**Backend: ✅ Ready**  
**Frontend: ⚠️ Needs 15-20 hours**  
**Start: CHAT_IMPLEMENTATION_GUIDE.md**

Good luck! 💪
