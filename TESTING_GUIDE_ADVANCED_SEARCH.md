# Testing Guide - Advanced Search System

## 🧪 Complete Testing Checklist

This guide will help you test all aspects of the Advanced Search System to ensure it's working correctly.

---

## 1. Prerequisites

### Before Testing
- [ ] Logged in as an admin user
- [ ] Database has sample data:
  - At least 5-10 products with different names/SKUs
  - At least 3-5 orders (if admin/logistics-admin)
  - At least 3-5 business contacts
  - At least 1-2 chat conversations with messages
- [ ] Browser console open (F12) to check for errors
- [ ] Network tab open to monitor API calls

---

## 2. Visual Verification

### Check UI Elements Present
- [ ] Search button visible in header (between date/time and notification bell)
- [ ] Search button shows magnifying glass icon
- [ ] Search button shows "Search..." text on desktop
- [ ] Search button shows "Ctrl+K" or "⌘K" badge on desktop
- [ ] Notification bell visible next to search button
- [ ] All elements properly spaced

### Expected Layout
```
[Date/Time] | [Search Button] [Notification Bell] [Refresh] [Theme Toggle] [Profile]
```

---

## 3. Keyboard Shortcuts Testing

### Open Search Modal
- [ ] Press `Ctrl + K` (Windows/Linux) or `Cmd + K` (Mac)
- [ ] Modal opens instantly
- [ ] Input field is auto-focused
- [ ] Backdrop blur effect visible
- [ ] Modal centered on screen

### Close Search Modal
- [ ] Press `Escape` key
- [ ] Modal closes instantly
- [ ] Focus returns to page

### Navigation Testing
1. [ ] Open search modal
2. [ ] Type a search query (e.g., "product")
3. [ ] Wait for results to appear
4. [ ] Press `Arrow Down` key
   - [ ] First result highlights with light background
5. [ ] Press `Arrow Down` again
   - [ ] Second result highlights
   - [ ] First result unhighlights
6. [ ] Press `Arrow Up` key
   - [ ] First result highlights again
7. [ ] Press `Enter` key
   - [ ] Navigates to the selected result
   - [ ] Modal closes

---

## 4. Search Functionality Testing

### Basic Search
1. [ ] Click search button or press Ctrl+K
2. [ ] Type: "test" (or any 2+ character query)
3. [ ] Verify:
   - [ ] Loading spinner appears briefly
   - [ ] Results appear after ~300ms delay
   - [ ] Result count shows at bottom
   - [ ] Results are categorized by type

### Empty Query Behavior
1. [ ] Open search modal
2. [ ] Leave input empty
3. [ ] Verify:
   - [ ] Empty state message displays
   - [ ] Instruction text shows keyboard shortcuts
   - [ ] No API call made (check Network tab)

### No Results Found
1. [ ] Type: "xyzabc123notfound"
2. [ ] Verify:
   - [ ] "No results found" message displays
   - [ ] Search icon with opacity shows
   - [ ] Query is reflected in message

### Debouncing Test
1. [ ] Open Network tab in DevTools
2. [ ] Type quickly: "product"
3. [ ] Verify:
   - [ ] Only ONE API call made after typing stops
   - [ ] No API calls during typing
   - [ ] 300ms delay before API call

---

## 5. Search by Type Testing

### Products Search

**Test 1: Search by Product Name**
1. [ ] Search for a known product name
2. [ ] Verify result shows:
   - [ ] Product name as title
   - [ ] SKU and category in subtitle
   - [ ] Stock quantity and price in description
   - [ ] Package icon (blue background)
   - [ ] "product" type label

**Test 2: Search by SKU**
1. [ ] Search for a known SKU code
2. [ ] Verify product appears in results

**Test 3: Search by Category**
1. [ ] Search for a category name (e.g., "Electronics")
2. [ ] Verify all products in that category appear

**Test 4: Click Product Result**
1. [ ] Click on a product result
2. [ ] Verify:
   - [ ] Navigates to inventory page
   - [ ] Product is highlighted/selected
   - [ ] Modal closes

### Orders Search (Admin/Logistics-Admin Only)

**Test 1: Search by Tracking Number**
1. [ ] Search for a known tracking number
2. [ ] Verify result shows:
   - [ ] "Order #[tracking]" as title
   - [ ] Customer name and channel in subtitle
   - [ ] Status and amount in description
   - [ ] Shopping cart icon (green background)
   - [ ] "order" type label

**Test 2: Search by Customer Name**
1. [ ] Search for a customer's name
2. [ ] Verify all orders for that customer appear

**Test 3: Search by Channel**
1. [ ] Search for "Shopee" or "Lazada"
2. [ ] Verify orders from that channel appear

**Test 4: Click Order Result**
1. [ ] Click on an order result
2. [ ] Verify:
   - [ ] Navigates to track orders page
   - [ ] Order is highlighted/selected
   - [ ] Modal closes

**Test 5: Non-Admin User**
1. [ ] Log in as operations or dept-manager user
2. [ ] Search for order-related terms
3. [ ] Verify:
   - [ ] No order results appear
   - [ ] Only products, contacts, and chat results show

### Business Contacts Search

**Test 1: Search by Contact Name**
1. [ ] Search for a contact's name
2. [ ] Verify result shows:
   - [ ] Contact name as title
   - [ ] Company and type in subtitle
   - [ ] Email and phone in description
   - [ ] File text icon (pink background)
   - [ ] "contact" type label

**Test 2: Search by Company**
1. [ ] Search for a company name
2. [ ] Verify all contacts from that company appear

**Test 3: Search by Email**
1. [ ] Search for part of an email address
2. [ ] Verify matching contacts appear

**Test 4: Click Contact Result**
1. [ ] Click on a contact result
2. [ ] Verify:
   - [ ] Navigates to business contacts page
   - [ ] Contact is highlighted/selected
   - [ ] Modal closes

### Chat Messages Search

**Test 1: Search Message Content**
1. [ ] Search for text you know is in a chat message
2. [ ] Verify result shows:
   - [ ] Conversation name as title
   - [ ] Message date in subtitle
   - [ ] Message preview in description
   - [ ] Message circle icon (amber background)
   - [ ] "chat" type label

**Test 2: Long Message Preview**
1. [ ] Search for a message with >100 characters
2. [ ] Verify:
   - [ ] Preview is truncated at 100 chars
   - [ ] "..." appears at end

**Test 3: Click Chat Result**
1. [ ] Click on a chat message result
2. [ ] Verify:
   - [ ] Navigates to chat page
   - [ ] Specific conversation opens
   - [ ] Modal closes

**Test 4: Privacy Check**
1. [ ] Create a conversation without the current user
2. [ ] Add messages to that conversation (via direct database)
3. [ ] Search for those message contents
4. [ ] Verify:
   - [ ] Messages do NOT appear in results
   - [ ] Only user's own conversations searchable

---

## 6. Result Display Testing

### Icon Verification
- [ ] Products show package icon (📦)
- [ ] Orders show shopping cart icon (🛒)
- [ ] Customers show users icon (👥) - if implemented
- [ ] Chat shows message circle icon (💬)
- [ ] Contacts show file text icon (📄)

### Color Coding Verification
- [ ] Products: Blue background with blue text
- [ ] Orders: Green background with green text
- [ ] Customers: Purple background with purple text - if implemented
- [ ] Chat: Amber background with amber text
- [ ] Contacts: Pink background with pink text

### Dark Mode Testing
1. [ ] Toggle dark mode (theme switcher in header)
2. [ ] Open search modal
3. [ ] Verify:
   - [ ] Modal has dark background
   - [ ] Text is readable (white/light colors)
   - [ ] Icons are visible
   - [ ] Selected result highlight visible
   - [ ] Border colors are appropriate

---

## 7. Responsive Design Testing

### Desktop (>1024px)
- [ ] Search button shows full text "Search..."
- [ ] Keyboard shortcut badge visible
- [ ] Modal is centered with max-width
- [ ] Results display in full width
- [ ] All text fully visible

### Tablet (768px - 1023px)
- [ ] Search button shows icon only
- [ ] Modal width adjusts appropriately
- [ ] Results remain readable
- [ ] Touch targets are adequate

### Mobile (<768px)
- [ ] Search button accessible
- [ ] Modal takes nearly full width (95vw)
- [ ] Results stack properly
- [ ] Text truncates appropriately
- [ ] Touch targets large enough
- [ ] Virtual keyboard doesn't obscure input

### Mobile Specific Tests
1. [ ] Open on mobile device
2. [ ] Tap search button
3. [ ] Verify:
   - [ ] Modal opens
   - [ ] Keyboard appears
   - [ ] Input is focused
4. [ ] Type search query
5. [ ] Tap result
6. [ ] Verify:
   - [ ] Navigation works
   - [ ] Modal closes
   - [ ] No layout issues

---

## 8. Performance Testing

### Response Time
1. [ ] Open Network tab
2. [ ] Perform search
3. [ ] Check API call timing:
   - [ ] Response < 500ms (good)
   - [ ] Response < 1000ms (acceptable)
   - [ ] Response > 1000ms (needs optimization)

### Debounce Verification
1. [ ] Type: "product" rapidly
2. [ ] Count API calls in Network tab
3. [ ] Verify:
   - [ ] Only 1-2 API calls made
   - [ ] No call per keystroke

### Large Result Sets
1. [ ] Search for common term (e.g., "a" or "e")
2. [ ] Verify:
   - [ ] Maximum 20 results displayed
   - [ ] Results load smoothly
   - [ ] No lag or freezing
   - [ ] Scroll works if needed

---

## 9. Error Handling Testing

### Unauthenticated Request
1. [ ] Open DevTools
2. [ ] In Console, run:
   ```javascript
   fetch('/api/search?q=test').then(r => r.json()).then(console.log)
   ```
3. [ ] Verify:
   - [ ] Returns 401 Unauthorized
   - [ ] Error message present

### Network Error Simulation
1. [ ] Open DevTools Network tab
2. [ ] Set network to "Offline"
3. [ ] Try to search
4. [ ] Verify:
   - [ ] Graceful error handling
   - [ ] No crash or freeze
   - [ ] Error logged in console

### Invalid Characters
1. [ ] Search for: `<script>alert('xss')</script>`
2. [ ] Verify:
   - [ ] No XSS attack executed
   - [ ] Results display safely
   - [ ] Query is sanitized

---

## 10. Integration Testing

### With Notification System
1. [ ] Verify both search and notifications in header
2. [ ] Click notification bell
3. [ ] Verify:
   - [ ] Notification panel opens
   - [ ] Search modal remains closed
4. [ ] Close notification panel
5. [ ] Open search modal
6. [ ] Verify:
   - [ ] Search opens properly
   - [ ] Notification panel closed

### With Theme Toggle
1. [ ] Open search modal
2. [ ] Toggle theme while modal open
3. [ ] Verify:
   - [ ] Theme changes immediately
   - [ ] Modal remains functional
   - [ ] Colors update correctly

### With Navigation
1. [ ] Open search modal
2. [ ] Click result to navigate
3. [ ] Verify:
   - [ ] Page loads correctly
   - [ ] Search modal closes
   - [ ] No console errors

---

## 11. Security Testing

### SQL Injection Prevention
1. [ ] Try searching: `'; DROP TABLE products--`
2. [ ] Verify:
   - [ ] Query executes safely
   - [ ] No database error
   - [ ] No data loss

### XSS Prevention
1. [ ] Try searching: `<img src=x onerror=alert('xss')>`
2. [ ] Verify:
   - [ ] No alert appears
   - [ ] Text displays safely
   - [ ] No script execution

### Role-Based Access
1. [ ] Log in as non-admin user
2. [ ] Search for order information
3. [ ] Verify:
   - [ ] No order results appear
   - [ ] Only authorized data visible

---

## 12. Browser Compatibility

Test in multiple browsers:

### Chrome/Edge
- [ ] Search opens
- [ ] Keyboard shortcuts work
- [ ] Results display correctly
- [ ] Navigation works

### Firefox
- [ ] Search opens
- [ ] Keyboard shortcuts work
- [ ] Results display correctly
- [ ] Navigation works

### Safari
- [ ] Search opens
- [ ] Cmd+K works (not Ctrl+K)
- [ ] Results display correctly
- [ ] Navigation works

---

## 13. Accessibility Testing

### Keyboard Navigation
- [ ] Can open search without mouse (Ctrl/Cmd+K)
- [ ] Can navigate results with arrows
- [ ] Can select result with Enter
- [ ] Can close with Escape
- [ ] Focus is visible on selected result

### Screen Reader Testing
1. [ ] Enable screen reader (NVDA/JAWS/VoiceOver)
2. [ ] Open search modal
3. [ ] Verify:
   - [ ] Modal purpose is announced
   - [ ] Input label is read
   - [ ] Results are announced
   - [ ] Type labels are read

### Focus Management
- [ ] Search button focusable
- [ ] Input auto-focused on open
- [ ] Focus trapped in modal
- [ ] Focus returns to trigger on close

---

## 14. Common Issues & Troubleshooting

### Issue: Search button not visible
**Check:**
- [ ] GlobalSearch imported in premium-navbar.tsx
- [ ] Component is rendered in JSX
- [ ] No CSS hiding the button
- [ ] Browser console for errors

### Issue: Ctrl+K doesn't work
**Check:**
- [ ] Browser extension conflict
- [ ] Another keyboard shortcut override
- [ ] Console errors
- [ ] Focus is not in input field

### Issue: No results appearing
**Check:**
- [ ] API endpoint is accessible (/api/search)
- [ ] Database connection working
- [ ] Data exists in tables
- [ ] User authentication valid
- [ ] RLS policies allow access

### Issue: Search is slow
**Check:**
- [ ] Database indexes on search fields
- [ ] Network latency
- [ ] Large dataset size
- [ ] Too many results returned
- [ ] Supabase plan limits

---

## 15. Test Results Documentation

### Test Session Template
```
Date: ___________
Tester: ___________
Browser: ___________
Device: ___________

PASSED: [ ] / FAILED: [ ]

Issues Found:
1. ___________
2. ___________

Notes:
___________
```

### Bug Report Template
```
Title: [Brief description]
Severity: Critical / High / Medium / Low

Steps to Reproduce:
1. ___________
2. ___________
3. ___________

Expected Behavior:
___________

Actual Behavior:
___________

Screenshots:
[Attach if applicable]

Environment:
- Browser: ___________
- Device: ___________
- User Role: ___________
```

---

## 16. Sign-Off Checklist

Before marking as complete:
- [ ] All core functionality tests passed
- [ ] All search types working
- [ ] Keyboard shortcuts functional
- [ ] Mobile responsive
- [ ] Dark mode working
- [ ] No console errors
- [ ] Performance acceptable (<500ms)
- [ ] Security tests passed
- [ ] Accessibility verified
- [ ] Browser compatibility confirmed
- [ ] Documentation complete

---

## 🎯 Success Criteria

The Advanced Search System is considered fully tested when:
1. ✅ All search types return correct results
2. ✅ Keyboard shortcuts work consistently
3. ✅ UI is responsive on all screen sizes
4. ✅ Performance meets targets (<500ms)
5. ✅ No security vulnerabilities found
6. ✅ Accessibility requirements met
7. ✅ Works in all major browsers
8. ✅ Integration with other features stable
9. ✅ Error handling is graceful
10. ✅ No critical or high-severity bugs

---

**Testing Status**: 🟡 Ready for Testing
**Last Updated**: January 10, 2025
