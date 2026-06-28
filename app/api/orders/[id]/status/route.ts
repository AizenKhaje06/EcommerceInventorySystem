import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const { status, parcel_status, payment_status, reason } = await request.json()

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (status) updateData.status = status
    if (parcel_status) updateData.parcel_status = parcel_status
    if (payment_status) updateData.payment_status = payment_status
    if (reason !== undefined) updateData.reason = reason

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('[API] Error updating order status:', error)
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] Error updating order status:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}
