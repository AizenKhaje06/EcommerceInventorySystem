import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * API Route: Confirm Order (Waybill Confirmation)
 * POST /api/orders/[id]/confirm
 *
 * Purpose: Logistics/Admin confirms that physical waybill has been received.
 * This allows the order to be visible in the packer's queue.
 *
 * Access: Admin, Logistics roles only (enforced at UI level)
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const orderId = params.id

  console.log('[Confirm Order] POST request received, orderId:', orderId)

  try {
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Fetch order using id and status fields that definitely exist
    // Avoid selecting confirmation_status here in case migration hasn't run
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, waybill, sales_channel')
      .eq('id', orderId)
      .single()

    console.log('[Confirm Order] Fetch result:', { order, fetchError })

    if (fetchError || !order) {
      console.error('[Confirm Order] Order not found or DB error:', fetchError?.message, fetchError?.code)
      return NextResponse.json(
        { success: false, error: 'Order not found', details: fetchError?.message },
        { status: 404 }
      )
    }

    // Update confirmation_status to 'Confirmed'
    // If the column doesn't exist yet, this will fail with a clear error
    const { data: updated, error: updateError } = await supabase
      .from('orders')
      .update({
        confirmation_status: 'Confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select('id, waybill, sales_channel, confirmation_status')
      .single()

    if (updateError) {
      console.error('[Confirm Order] Update error:', updateError.message, updateError.code)

      // If column doesn't exist (migration not run), return helpful error
      if (updateError.message?.includes('confirmation_status') || updateError.code === '42703') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Database migration required. Run migration 052_add_confirmation_status_to_orders.sql in Supabase SQL Editor.',
            details: updateError.message
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Failed to confirm order', details: updateError.message },
        { status: 500 }
      )
    }

    const channelName = order.sales_channel || 'Unknown'
    console.log(`[Confirm Order] Order ${orderId} confirmed successfully`)

    return NextResponse.json({
      success: true,
      message: 'Order confirmed successfully',
      order: updated,
      channelName
    })

  } catch (error) {
    console.error('[Confirm Order] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
