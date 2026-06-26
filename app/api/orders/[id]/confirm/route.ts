import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * API Route: Confirm Order (Waybill Confirmation)
 * POST /api/orders/[id]/confirm
 * 
 * Purpose: Logistics/Admin confirms that physical waybill has been received.
 * This allows the order to be visible in the packer's queue.
 * 
 * Access: Admin, Logistics roles only
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    // Get authenticated user from session cookie
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No auth header' },
        { status: 401 }
      )
    }

    // Get user info
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user role from users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has permission (Admin or Logistics only)
    const allowedRoles = ['admin', 'logistics']
    if (!allowedRoles.includes(userData.role.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Only Admin and Logistics can confirm orders.' },
        { status: 403 }
      )
    }

    // Fetch order details before updating
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, waybill, channel, sales_channel')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if already confirmed
    const { data: currentOrder } = await supabaseAdmin
      .from('orders')
      .select('confirmation_status')
      .eq('id', orderId)
      .single()

    if (currentOrder?.confirmation_status === 'Confirmed') {
      return NextResponse.json(
        { success: false, error: 'Order is already confirmed' },
        { status: 400 }
      )
    }

    // Update confirmation status to 'Confirmed'
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({
        confirmation_status: 'Confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('[Confirm Order] Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to confirm order' },
        { status: 500 }
      )
    }

    // Get the channel name for notification
    const channelName = order.channel || order.sales_channel || 'Unknown'

    return NextResponse.json({
      success: true,
      message: 'Order confirmed successfully',
      order: data,
      channelName // Return channel name for notification
    })

  } catch (error) {
    console.error('[Confirm Order] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
