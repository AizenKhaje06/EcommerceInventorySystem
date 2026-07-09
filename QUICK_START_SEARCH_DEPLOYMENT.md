# Quick Start - Advanced Search System Deployment

## 🚀 Deployment Guide

This guide will help you deploy and verify the Advanced Search System is working correctly.

---

## Prerequisites Checklist

Before deploying, ensure you have:
- [x] Supabase project set up
- [x] Database migrations up to date
- [x] Environment variables configured
- [x] Node.js 18+ installed
- [x] Access to production/staging environment

---

## Step-by-Step Deployment

### Step 1: Verify Files Exist

Check that all required files are present:

```bash
# API Route
ls app/api/search/route.ts

# Components
ls components/global-search.tsx
ls components/notification-system.tsx
ls components/premium-navbar.tsx

# Documentation
ls ADVANCED_SEARCH_SYSTEM_COMPLETE.md
ls TESTING_GUIDE_ADVANCED_SEARCH.md
ls DEVELOPER_REFERENCE_SEARCH_SYSTEM.md
ls QUICK_START_SEARCH_DEPLOYMENT.md
```

**Expected Output:** All files should exist

---

### Step 2: Install Dependencies

Ensure all required packages are installed:

```bash
npm install
# or
yarn install
```

**Required Dependencies:**
- `@supabase/supabase-js` - Database client
- `next` - Framework
- `react` - UI library
- `lucide-react` - Icons
- `tailwindcss` - Styling

---

### Step 3: Environment Configuration

Verify your `.env.local` file has:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional (for debugging)
NODE_ENV=development
```

**Test Connection:**
```bash
# Open Node REPL
node

# Test Supabase connection
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
supabase.from('products_unified').select('count').then(console.log)
```

---

### Step 4: Database Verification

Ensure required tables exist in Supabase:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'products_unified',
  'orders',
  'business_contacts',
  'messages',
  'conversations',
  'conversation_members'
);
```

**Expected Result:** All 6 tables should be listed

**Check Sample Data:**
```sql
-- Check products
SELECT COUNT(*) FROM products_unified;

-- Check orders
SELECT COUNT(*) FROM orders;

-- Check contacts
SELECT COUNT(*) FROM business_contacts;

-- Check messages
SELECT COUNT(*) FROM messages;
```

**Recommended:** At least 5-10 records in each table for testing

---

### Step 5: Build Application

```bash
# Development build
npm run dev

# Production build
npm run build
npm run start
```

**Check for Errors:**
- No TypeScript compilation errors
- No ESLint warnings (critical ones)
- Build completes successfully

---

### Step 6: Run Application Locally

```bash
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in 2.5s
```

---

### Step 7: Initial Verification

1. **Open Application:**
   - Navigate to `http://localhost:3000`
   - Log in with admin credentials

2. **Locate Search Button:**
   - Check header/navbar
   - Should be between date/time and notification bell
   - Shows magnifying glass icon

3. **Open Search Modal:**
   - Click search button OR press `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)
   - Modal should appear instantly

4. **Test Search:**
   - Type: "product" (or any search term)
   - Wait ~300ms
   - Results should appear

5. **Verify Results:**
   - Check if results display correctly
   - Icons visible
   - Colors appropriate
   - Click result to navigate

---

### Step 8: Test API Endpoint

**Using Browser Console:**
```javascript
// Test API directly
fetch('/api/search?q=test')
  .then(r => r.json())
  .then(data => {
    console.log('Results:', data.results)
    console.log('Count:', data.results.length)
  })
```

**Expected Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "type": "product",
      "title": "Product Name",
      "subtitle": "SKU: ABC123 • Category",
      "description": "Stock: 10 • Price: ₱100.00",
      "link": "/dashboard/inventory?product=uuid"
    }
  ],
  "query": "test"
}
```

**Using cURL:**
```bash
# Replace with your session cookie
curl -H "Cookie: your-session-cookie" \
     "http://localhost:3000/api/search?q=test"
```

---

### Step 9: Check Browser Console

Open DevTools (F12) and check for:

**✅ Good Signs:**
- No red errors in Console
- Search API calls visible in Network tab
- Response time < 500ms
- Status code 200

**❌ Warning Signs:**
- 401 Unauthorized errors → Check authentication
- 500 Internal Server Error → Check server logs
- Timeout errors → Check database connection
- CORS errors → Check API route configuration

---

### Step 10: Test All Search Types

**Products:**
```javascript
fetch('/api/search?q=product').then(r => r.json()).then(console.log)
```

**Orders (admin only):**
```javascript
fetch('/api/search?q=order').then(r => r.json()).then(console.log)
```

**Contacts:**
```javascript
fetch('/api/search?q=contact').then(r => r.json()).then(console.log)
```

**Chat:**
```javascript
fetch('/api/search?q=message').then(r => r.json()).then(console.log)
```

---

## Production Deployment

### Deploy to Vercel

1. **Push to Git:**
```bash
git add .
git commit -m "Add advanced search system"
git push origin main
```

2. **Deploy on Vercel:**
```bash
vercel --prod
```

Or use Vercel Dashboard:
- Go to [vercel.com](https://vercel.com)
- Import your repository
- Configure environment variables
- Deploy

3. **Environment Variables:**
Set in Vercel Dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
```

4. **Verify Deployment:**
- Visit your production URL
- Test search functionality
- Check performance
- Monitor logs

---

### Deploy to Other Platforms

**Netlify:**
```bash
netlify deploy --prod
```

**Custom Server:**
```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "vertex-inventory" -- start
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Post-Deployment Checklist

### Functionality
- [ ] Search button visible in header
- [ ] Keyboard shortcut (Ctrl/Cmd+K) works
- [ ] Search modal opens/closes properly
- [ ] Products searchable
- [ ] Orders searchable (admin)
- [ ] Contacts searchable
- [ ] Chat messages searchable
- [ ] Results clickable and navigate correctly

### Performance
- [ ] API response time < 500ms
- [ ] No lag when typing
- [ ] Debouncing working (not too many API calls)
- [ ] Modal animation smooth

### Security
- [ ] Unauthorized requests rejected (401)
- [ ] Role-based access working
- [ ] Chat messages privacy respected
- [ ] No SQL injection possible
- [ ] No XSS vulnerabilities

### UI/UX
- [ ] Dark mode working
- [ ] Mobile responsive
- [ ] Icons displaying correctly
- [ ] Colors appropriate
- [ ] Text readable
- [ ] No layout issues

---

## Monitoring Setup

### Add Logging

**In API Route:**
```typescript
// app/api/search/route.ts
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // ... search logic ...
    
    logger.info('Search completed', {
      query: searchTerm,
      results: results.length,
      duration: Date.now() - startTime,
      user: currentUser.username
    })
    
    return NextResponse.json({ results, query: searchTerm })
  } catch (error) {
    logger.error('Search error', {
      query: searchTerm,
      error: error.message,
      user: currentUser.username
    })
    throw error
  }
}
```

### Add Analytics

**Track Search Events:**
```typescript
// components/global-search.tsx
const performSearch = async (searchQuery: string) => {
  setLoading(true)
  const startTime = Date.now()
  
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
    const data = await response.json()
    
    setResults(data.results || [])
    
    // Track analytics
    analytics.track('search', {
      query: searchQuery,
      resultCount: data.results?.length || 0,
      duration: Date.now() - startTime
    })
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    setLoading(false)
  }
}
```

---

## Troubleshooting

### Issue: Search button not appearing

**Check:**
```typescript
// components/premium-navbar.tsx
import { GlobalSearch } from '@/components/global-search'

// In JSX:
<GlobalSearch />
```

**Fix:** Ensure component is imported and rendered

---

### Issue: Ctrl+K not working

**Check:**
```typescript
// components/global-search.tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault() // Important!
      setIsOpen(true)
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

**Fix:** Ensure `e.preventDefault()` is called

---

### Issue: No results appearing

**Check Database:**
```sql
-- Check if data exists
SELECT * FROM products_unified LIMIT 5;
```

**Check API:**
```javascript
// Browser console
fetch('/api/search?q=test')
  .then(r => r.json())
  .then(console.log)
```

**Check Supabase RLS:**
```sql
-- Disable RLS temporarily to test
ALTER TABLE products_unified DISABLE ROW LEVEL SECURITY;
-- Remember to re-enable after testing
```

---

### Issue: Slow performance

**Check Query Time:**
```typescript
// Add timing logs
console.time('products-search')
const { data: products } = await supabase.from('products_unified')...
console.timeEnd('products-search')
```

**Add Indexes:**
```sql
CREATE INDEX idx_products_name ON products_unified(name);
CREATE INDEX idx_products_sku ON products_unified(sku);
```

**Reduce Result Limit:**
```typescript
// Change from 5 to 3 per type
.limit(3)
```

---

## Rollback Procedure

If issues occur, rollback changes:

### 1. Git Rollback
```bash
git revert HEAD
git push origin main
```

### 2. Remove Components
```bash
# Temporarily disable search
# Comment out in premium-navbar.tsx:
# <GlobalSearch />
```

### 3. Remove API Route
```bash
# Rename to disable
mv app/api/search/route.ts app/api/search/route.ts.disabled
```

### 4. Redeploy
```bash
vercel --prod
```

---

## Support

### Get Help

**Check Documentation:**
- `ADVANCED_SEARCH_SYSTEM_COMPLETE.md` - Feature overview
- `TESTING_GUIDE_ADVANCED_SEARCH.md` - Testing procedures
- `DEVELOPER_REFERENCE_SEARCH_SYSTEM.md` - Technical details

**Debug Logs:**
```bash
# Vercel logs
vercel logs

# Local logs
npm run dev | grep search
```

**Contact:**
- System Admin: Marjake Rivera
- Email: aizenjhakerivera06@gmail.com
- Phone: +63 905 747 4686

---

## Success Criteria

Deployment is successful when:
- ✅ Search button visible in production
- ✅ Keyboard shortcuts working
- ✅ All search types returning results
- ✅ Response time < 500ms
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Dark mode working
- ✅ Security checks passing

---

## Next Steps

After successful deployment:
1. Monitor search usage and performance
2. Gather user feedback
3. Plan Phase 2 enhancements:
   - Search filters
   - Search history
   - Autocomplete
   - Analytics dashboard

---

**Deployment Status:** 🟢 Ready for Production
**Last Updated:** January 10, 2025
**Version:** 1.0.0
