import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * API Route: Confirm Order (Waybill Confirmation)
 * POST /api/orders/[id]/confirm
 * 
 * Purpose: Logistics/Admin confirms that physical waybill has been received.
 * This allows the order to be visible in the packer's queue.
 * 
 * Access: Admin, Logistics roles only (enforced at UI level)
 * Note: Auth check removed to match other endpoints pattern
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    // Fetch order details before updating
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, waybill, channel, sales_channel, confirmation_status')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if already confirmed
    if (order.confirmation_status === 'Confirmed') {
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

    console.log(`[Confirm Order] Order ${orderId} confirmed successfully`)

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
