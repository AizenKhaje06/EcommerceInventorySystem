import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * DEBUG ENDPOINT: Check cancelled orders data structure
 * GET /api/debug-cancelled
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || '2026-07-08'

    // Fetch Track Orders cancelled (status='Packed' AND parcel_status='CANCELLED')
    const { data: trackOrdersCancelled, error: trackError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Packed')
      .eq('parcel_status', 'CANCELLED')
      .order('created_at', { ascending: false })

    // Fetch Packing Queue cancelled (status='Pending' AND is_cancelled=true)
    const { data: packingQueueCancelled, error: packingError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Pending')
      .eq('is_cancelled', true)
      .order('created_at', { ascending: false })

    if (trackError || packingError) {
      console.error('[Debug Cancelled] Errors:', { trackError, packingError })
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // Filter to the specific date (July 8, 2026)
    const filterByDate = (orders: any[], targetDate: string) => {
      return orders.filter(order => {
        const created = order.created_at?.substring(0, 10)
        const packed = order.packed_at?.substring(0, 10)
        const cancelled = order.cancelled_at?.substring(0, 10)
        const updated = order.updated_at?.substring(0, 10)
        
        return created === targetDate || 
               packed === targetDate || 
               cancelled === targetDate || 
               updated === targetDate
      })
    }

    const trackOnDate = filterByDate(trackOrdersCancelled || [], date)
    const packingOnDate = filterByDate(packingQueueCancelled || [], date)

    return NextResponse.json({
      date,
      trackOrdersCancelled: {
        total: trackOrdersCancelled?.length || 0,
        onDate: trackOnDate.length,
        sample: trackOnDate[0] ? {
          id: trackOnDate[0].id,
          status: trackOnDate[0].status,
          parcel_status: trackOnDate[0].parcel_status,
          is_cancelled: trackOnDate[0].is_cancelled,
          reason: trackOnDate[0].reason,
          cancellation_reason: trackOnDate[0].cancellation_reason,
          created_at: trackOnDate[0].created_at,
          packed_at: trackOnDate[0].packed_at,
          cancelled_at: trackOnDate[0].cancelled_at,
          updated_at: trackOnDate[0].updated_at,
          product: trackOnDate[0].product,
          sales_channel: trackOnDate[0].sales_channel
        } : null,
        allOnDate: trackOnDate.map(o => ({
          id: o.id,
          reason: o.reason,
          cancellation_reason: o.cancellation_reason,
          created_at: o.created_at,
          packed_at: o.packed_at,
          cancelled_at: o.cancelled_at,
          updated_at: o.updated_at
        }))
      },
      packingQueueCancelled: {
        total: packingQueueCancelled?.length || 0,
        onDate: packingOnDate.length,
        sample: packingOnDate[0] ? {
          id: packingOnDate[0].id,
          status: packingOnDate[0].status,
          parcel_status: packingOnDate[0].parcel_status,
          is_cancelled: packingOnDate[0].is_cancelled,
          reason: packingOnDate[0].reason,
          cancellation_reason: packingOnDate[0].cancellation_reason,
          created_at: packingOnDate[0].created_at,
          packed_at: packingOnDate[0].packed_at,
          cancelled_at: packingOnDate[0].cancelled_at,
          updated_at: packingOnDate[0].updated_at,
          product: packingOnDate[0].product,
          sales_channel: packingOnDate[0].sales_channel
        } : null,
        allOnDate: packingOnDate.map(o => ({
          id: o.id,
          reason: o.reason,
          cancellation_reason: o.cancellation_reason,
          created_at: o.created_at,
          packed_at: o.packed_at,
          cancelled_at: o.cancelled_at,
          updated_at: o.updated_at
        }))
      },
      summary: {
        totalCancelledOnDate: trackOnDate.length + packingOnDate.length,
        trackOrdersOnDate: trackOnDate.length,
        packingQueueOnDate: packingOnDate.length
      }
    })
  } catch (error) {
    console.error('[Debug Cancelled] Error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
