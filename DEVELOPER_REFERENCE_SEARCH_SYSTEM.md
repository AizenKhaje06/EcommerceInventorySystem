# Developer Reference - Advanced Search System

## 🎯 Quick Reference for Developers

This guide provides technical details for developers maintaining or extending the search system.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PremiumNavbar (Header)                                │ │
│  │  ├─ GlobalSearch Button (Ctrl/Cmd+K)                  │ │
│  │  └─ NotificationSystem Bell                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    GlobalSearch Component                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Search Modal (Command Palette Style)                  │ │
│  │  ├─ Input Field (with debounce)                        │ │
│  │  ├─ Results List (with keyboard nav)                  │ │
│  │  └─ Footer (keyboard shortcuts guide)                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (API Call after 300ms)
┌─────────────────────────────────────────────────────────────┐
│                  /api/search Route Handler                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  GET /api/search?q=<query>                            │ │
│  │  ├─ Auth Check (getCurrentUser)                       │ │
│  │  ├─ Input Validation (min 2 chars)                    │ │
│  │  ├─ Role-Based Access Control                         │ │
│  │  └─ Query Execution (parallel)                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Supabase Queries)
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Supabase PostgreSQL                                   │ │
│  │  ├─ products_unified (ILIKE search)                   │ │
│  │  ├─ orders (ILIKE search)                             │ │
│  │  ├─ business_contacts (ILIKE search)                  │ │
│  │  └─ messages + conversations (ILIKE + JOIN)           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Unified Results)
┌─────────────────────────────────────────────────────────────┐
│                      Response Format                         │
│  { results: SearchResult[], query: string }                 │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
WIHI-Asia-Inventory-System/
├── app/
│   └── api/
│       └── search/
│           └── route.ts              # Main search API endpoint
│
├── components/
│   ├── global-search.tsx             # Search UI component
│   ├── notification-system.tsx        # Notification bell
│   └── premium-navbar.tsx            # Header integration
│
├── lib/
│   ├── auth.ts                       # getCurrentUser helper
│   └── utils.ts                      # cn() utility
│
└── docs/
    ├── ADVANCED_SEARCH_SYSTEM_COMPLETE.md
    ├── TESTING_GUIDE_ADVANCED_SEARCH.md
    └── DEVELOPER_REFERENCE_SEARCH_SYSTEM.md  # This file
```

---

## Code Components

### 1. GlobalSearch Component (`components/global-search.tsx`)

**Key Features:**
- Modal interface with backdrop
- Keyboard shortcut handling (Ctrl/Cmd+K, Escape, Arrows, Enter)
- Debounced API calls (300ms)
- Result rendering with icons and colors
- Navigation on click or Enter

**State Management:**
```typescript
const [isOpen, setIsOpen] = useState(false)           // Modal visibility
const [query, setQuery] = useState('')                // Search input
const [results, setResults] = useState<SearchResult[]>([]) // API results
const [loading, setLoading] = useState(false)         // Loading state
const [selectedIndex, setSelectedIndex] = useState(0) // Keyboard nav
```

**Key Functions:**
```typescript
performSearch(searchQuery: string): Promise<void>
// Fetches results from API with error handling

navigateToResult(result: SearchResult): void
// Navigates to result link and closes modal

handleKeyDown(e: React.KeyboardEvent): void
// Handles arrow keys, Enter, Escape

getIcon(type: string): ReactNode
// Returns icon component for result type

getTypeColor(type: string): string
// Returns Tailwind classes for type color
```

**Customization Points:**
- Icons: Change in `getIcon()` function
- Colors: Modify in `getTypeColor()` function
- Debounce delay: Change timeout in useEffect (currently 300ms)
- Result limit: Modify API to return more/fewer results
- Modal styling: Update Tailwind classes in JSX

---

### 2. Search API Route (`app/api/search/route.ts`)

**Request Flow:**
1. Validate authentication via `getCurrentUser()`
2. Validate query parameter (min 2 characters)
3. Execute parallel searches across data types
4. Format and unify results
5. Sort by relevance (exact matches first)
6. Limit to 20 total results
7. Return JSON response

**Search Queries:**

```typescript
// Products Search
supabase
  .from('products_unified')
  .select('id, name, sku, category, quantity, price')
  .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
  .limit(5)

// Orders Search (Admin only)
supabase
  .from('orders')
  .select('id, channel, tracking_number, customer_name, status, total_amount, created_at')
  .or(`tracking_number.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%,channel.ilike.%${searchTerm}%`)
  .order('created_at', { ascending: false })
  .limit(5)

// Contacts Search
supabase
  .from('business_contacts')
  .select('id, name, company, email, phone, type')
  .or(`name.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
  .limit(5)

// Chat Messages Search (User's conversations only)
supabase
  .from('messages')
  .select(`
    id, content, conversation_id, created_at,
    conversations!inner (
      id, name,
      conversation_members!inner (user_id)
    )
  `)
  .ilike('content', `%${searchTerm}%`)
  .eq('conversations.conversation_members.user_id', currentUser.username)
  .is('deleted_at', null)
  .order('created_at', { ascending: false })
  .limit(5)
```

**Result Format:**
```typescript
interface SearchResult {
  id: string
  type: 'product' | 'order' | 'customer' | 'chat' | 'contact'
  title: string
  subtitle?: string
  description?: string
  link: string
}
```

**Error Handling:**
```typescript
try {
  // Search logic
} catch (error) {
  console.error('Search error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

---

## Adding New Search Types

### Step 1: Update SearchResult Type
```typescript
// In components/global-search.tsx
interface SearchResult {
  id: string
  type: 'product' | 'order' | 'customer' | 'chat' | 'contact' | 'invoice' // Added 'invoice'
  title: string
  subtitle?: string
  description?: string
  link: string
}
```

### Step 2: Add Icon and Color
```typescript
// In getIcon() function
case 'invoice': return <FileText className="h-4 w-4" />

// In getTypeColor() function
case 'invoice': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
```

### Step 3: Add Database Query
```typescript
// In app/api/search/route.ts
try {
  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select('id, invoice_number, customer_name, amount, status')
    .or(`invoice_number.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%`)
    .limit(5)

  if (!invoicesError && invoices) {
    invoices.forEach((invoice: any) => {
      results.push({
        id: invoice.id,
        type: 'invoice',
        title: `Invoice #${invoice.invoice_number}`,
        subtitle: invoice.customer_name,
        description: `Status: ${invoice.status} • ₱${invoice.amount.toFixed(2)}`,
        link: `/dashboard/invoices?invoice=${invoice.id}`
      })
    })
  }
} catch (error) {
  console.error('Error searching invoices:', error)
}
```

### Step 4: Test
- Verify icon displays correctly
- Verify color scheme matches design
- Test search functionality
- Test navigation to result
- Verify role-based access if needed

---

## Performance Optimization Tips

### 1. Database Indexes
Add indexes on frequently searched columns:
```sql
-- Products
CREATE INDEX idx_products_name_search ON products_unified USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_sku ON products_unified(sku);

-- Orders
CREATE INDEX idx_orders_tracking ON orders(tracking_number);
CREATE INDEX idx_orders_customer ON orders(customer_name);

-- Contacts
CREATE INDEX idx_contacts_name ON business_contacts(name);
CREATE INDEX idx_contacts_company ON business_contacts(company);
```

### 2. Query Optimization
```typescript
// Instead of separate queries, use Promise.all for parallel execution
const [products, orders, contacts, messages] = await Promise.all([
  searchProducts(supabase, searchTerm),
  searchOrders(supabase, searchTerm, userRole),
  searchContacts(supabase, searchTerm),
  searchMessages(supabase, searchTerm, username)
])
```

### 3. Caching (Future Enhancement)
```typescript
// Example with Redis
import { redis } from '@/lib/redis'

const cacheKey = `search:${searchTerm}:${userRole}`
const cached = await redis.get(cacheKey)

if (cached) {
  return NextResponse.json(JSON.parse(cached))
}

// ... perform search ...

await redis.setex(cacheKey, 300, JSON.stringify(results)) // Cache for 5 minutes
```

### 4. Rate Limiting (Future Enhancement)
```typescript
import { ratelimit } from '@/lib/ratelimit'

const identifier = `search:${currentUser.username}`
const { success } = await ratelimit.limit(identifier)

if (!success) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  )
}
```

---

## Security Considerations

### 1. SQL Injection Prevention
✅ **Good** - Using parameterized queries via Supabase:
```typescript
.or(`name.ilike.%${searchTerm}%`) // Supabase handles sanitization
```

❌ **Bad** - Raw SQL with string concatenation:
```typescript
// NEVER DO THIS
const query = `SELECT * FROM products WHERE name LIKE '%${searchTerm}%'`
```

### 2. XSS Prevention
✅ **Good** - React escapes by default:
```typescript
<span>{result.title}</span> // Safe, auto-escaped
```

❌ **Bad** - Using dangerouslySetInnerHTML:
```typescript
// AVOID unless necessary
<div dangerouslySetInnerHTML={{ __html: result.title }} />
```

### 3. Authorization Checks
```typescript
// Always verify user has access to resource
const { data: member } = await supabase
  .from('conversation_members')
  .select('id')
  .eq('conversation_id', conversationId)
  .eq('user_id', currentUser.username)
  .maybeSingle()

if (!member) {
  throw new Error('Access denied')
}
```

### 4. Input Validation
```typescript
// Validate query length and format
if (!query || query.trim().length < 2) {
  return NextResponse.json({ results: [] })
}

if (query.length > 200) {
  return NextResponse.json(
    { error: 'Query too long' },
    { status: 400 }
  )
}
```

---

## Debugging Guide

### Enable Debug Logging
```typescript
// In app/api/search/route.ts
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('[Search] Query:', searchTerm)
  console.log('[Search] User:', currentUser.username)
  console.log('[Search] Results:', results.length)
}
```

### Check API Calls
```javascript
// In browser console
// Monitor search requests
const observer = {
  next: (req) => console.log('Search request:', req),
  error: (err) => console.error('Search error:', err)
}

// Or use Network tab filter: "search"
```

### Common Issues

**Issue: No results appearing**
```typescript
// Check in API route
console.log('Search term:', searchTerm)
console.log('Products query:', products)
console.log('Products error:', productsError)

// Check in component
console.log('API response:', data)
console.log('Results state:', results)
```

**Issue: Keyboard shortcuts not working**
```typescript
// Check in GlobalSearch component
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    console.log('Key pressed:', e.key, 'Ctrl:', e.ctrlKey, 'Meta:', e.metaKey)
    // ... rest of logic
  }
  // ...
}, [])
```

**Issue: Role-based access not working**
```typescript
// Check user role in API
console.log('Current user:', currentUser)
console.log('User role:', currentUser?.role)
console.log('Has admin access:', currentUser?.role === 'admin')
```

---

## Testing Utilities

### Mock Data Generator
```typescript
// For testing purposes
export function generateMockSearchResults(count: number): SearchResult[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-${i}`,
    type: ['product', 'order', 'contact', 'chat'][i % 4],
    title: `Mock Result ${i + 1}`,
    subtitle: `Subtitle ${i + 1}`,
    description: `Description for result ${i + 1}`,
    link: `/dashboard/test/${i}`
  }))
}
```

### API Test Script
```typescript
// test-search-api.ts
async function testSearchAPI() {
  const queries = ['product', 'order', 'contact', 'test']
  
  for (const query of queries) {
    const response = await fetch(`/api/search?q=${query}`)
    const data = await response.json()
    console.log(`Query "${query}":`, data.results.length, 'results')
  }
}

testSearchAPI()
```

---

## Environment Variables

```bash
# Required for search functionality
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional for debugging
NODE_ENV=development  # Enables debug logging
```

---

## API Reference

### GET /api/search

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query (min 2 chars, max 200) |

**Response:**
```typescript
{
  results: SearchResult[]  // Max 20 results
  query: string           // Echo back search term
}
```

**Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 401 | Unauthorized (no session) |
| 400 | Bad request (invalid query) |
| 500 | Internal server error |

**Rate Limits:** None (currently)

---

## Monitoring & Analytics

### Metrics to Track
1. **Search Volume**
   - Searches per day
   - Searches per user
   - Peak usage times

2. **Search Performance**
   - Average response time
   - 95th percentile response time
   - Slow queries (>1s)

3. **Search Quality**
   - Zero-result queries
   - Click-through rate
   - Most searched terms

4. **User Behavior**
   - Search-to-click time
   - Repeated searches
   - Popular result types

### Analytics Implementation (Future)
```typescript
// Add to API route
await analytics.track('search', {
  query: searchTerm,
  userId: currentUser.username,
  resultCount: results.length,
  responseTime: Date.now() - startTime,
  timestamp: new Date().toISOString()
})
```

---

## Changelog

### Version 1.0.0 (January 2025)
- ✅ Initial implementation
- ✅ Multi-type search (products, orders, contacts, chat)
- ✅ Keyboard shortcuts (Ctrl/Cmd+K)
- ✅ Role-based access control
- ✅ Mobile responsive design
- ✅ Dark mode support
- ✅ Integration with header/navbar

### Version 1.1.0 (Planned)
- 🔄 Search filters
- 🔄 Search history
- 🔄 Autocomplete suggestions
- 🔄 Performance optimizations
- 🔄 Analytics integration

---

## Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Hooks](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Related Files
- `ADVANCED_SEARCH_SYSTEM_COMPLETE.md` - Feature documentation
- `TESTING_GUIDE_ADVANCED_SEARCH.md` - Testing procedures
- `DEVELOPMENT_STATUS_AND_ROADMAP.md` - Project roadmap

---

**Last Updated**: January 10, 2025
**Maintainer**: Development Team
**Status**: Production Ready ✅
