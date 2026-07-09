import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

interface SearchResult {
  id: string
  type: 'product' | 'order' | 'customer' | 'chat' | 'contact'
  title: string
  subtitle?: string
  description?: string
  link: string
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const query = request.nextUrl.searchParams.get('q')
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    const supabase = getSupabaseClient()
    const searchTerm = query.trim().toLowerCase()
    const results: SearchResult[] = []

    // Search Products
    try {
      const { data: products, error: productsError } = await supabase
        .from('products_unified')
        .select('id, name, sku, category, quantity, price')
        .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .limit(5)

      if (!productsError && products) {
        products.forEach((product: any) => {
          results.push({
            id: product.id,
            type: 'product',
            title: product.name,
            subtitle: `SKU: ${product.sku} • ${product.category}`,
            description: `Stock: ${product.quantity} • Price: ₱${product.price?.toFixed(2) || '0.00'}`,
            link: `/dashboard/inventory?product=${product.id}`
          })
        })
      }
    } catch (error) {
      console.error('Error searching products:', error)
    }

    // Search Orders (admin/logistics-admin only)
    if (currentUser.role === 'admin' || currentUser.role === 'logistics-admin') {
      try {
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, channel, tracking_number, customer_name, status, total_amount, created_at')
          .or(`tracking_number.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%,channel.ilike.%${searchTerm}%`)
          .order('created_at', { ascending: false })
          .limit(5)

        if (!ordersError && orders) {
          orders.forEach((order: any) => {
            results.push({
              id: order.id,
              type: 'order',
              title: `Order #${order.tracking_number || order.id.slice(0, 8)}`,
              subtitle: `${order.customer_name} • ${order.channel}`,
              description: `Status: ${order.status} • ₱${order.total_amount?.toFixed(2) || '0.00'}`,
              link: `/dashboard/track-orders?order=${order.id}`
            })
          })
        }
      } catch (error) {
        console.error('Error searching orders:', error)
      }
    }

    // Search Business Contacts
    try {
      const { data: contacts, error: contactsError } = await supabase
        .from('business_contacts')
        .select('id, name, company, email, phone, type')
        .or(`name.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(5)

      if (!contactsError && contacts) {
        contacts.forEach((contact: any) => {
          results.push({
            id: contact.id,
            type: 'contact',
            title: contact.name,
            subtitle: `${contact.company} • ${contact.type}`,
            description: `${contact.email} • ${contact.phone}`,
            link: `/dashboard/business-contacts?contact=${contact.id}`
          })
        })
      }
    } catch (error) {
      console.error('Error searching contacts:', error)
    }

    // Search Chat Messages
    try {
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          conversation_id,
          created_at,
          conversations!inner (
            id,
            name,
            conversation_members!inner (
              user_id
            )
          )
        `)
        .ilike('content', `%${searchTerm}%`)
        .eq('conversations.conversation_members.user_id', currentUser.username)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!messagesError && messages) {
        messages.forEach((message: any) => {
          const preview = message.content.length > 100 
            ? message.content.substring(0, 100) + '...' 
            : message.content
          
          results.push({
            id: message.id,
            type: 'chat',
            title: message.conversations?.name || 'Direct Message',
            subtitle: new Date(message.created_at).toLocaleDateString(),
            description: preview,
            link: `/dashboard/chat?conversation=${message.conversation_id}`
          })
        })
      }
    } catch (error) {
      console.error('Error searching messages:', error)
    }

    // Sort results by relevance (exact matches first)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(searchTerm) ? 1 : 0
      const bExact = b.title.toLowerCase().includes(searchTerm) ? 1 : 0
      return bExact - aExact
    })

    return NextResponse.json({ 
      results: results.slice(0, 20), // Limit to 20 total results
      query: searchTerm 
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
