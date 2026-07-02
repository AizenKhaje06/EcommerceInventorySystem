import { type NextRequest, NextResponse } from "next/server"
// Using Supabase as primary database
import { updateInventoryItem, getInventoryItems, addLog } from "@/lib/supabase-db"
import { apiPost } from "@/lib/api-client"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { amount, reason, notes } = body

    console.log('[Reduce API] Request received:', { id, amount, reason, notes })

    if (!amount || amount <= 0) {
      console.log('[Reduce API] Validation failed: Invalid amount')
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    if (!reason) {
      console.log('[Reduce API] Validation failed: No reason provided')
      return NextResponse.json({ error: "Reason is required" }, { status: 400 })
    }

    console.log('[Reduce API] Fetching inventory items...')
    const items = await getInventoryItems()
    const item = items.find((i) => i.id === id)

    if (!item) {
      console.log('[Reduce API] Item not found:', id)
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    console.log('[Reduce API] Item found:', { id: item.id, name: item.name, currentQuantity: item.quantity })

    // Check if there's enough stock
    if (item.quantity < amount) {
      console.log('[Reduce API] Insufficient stock:', { available: item.quantity, requested: amount })
      return NextResponse.json(
        { error: `Insufficient stock. Available: ${item.quantity}, Requested: ${amount}` }, 
        { status: 400 }
      )
    }

    const newQuantity = item.quantity - amount
    console.log('[Reduce API] Updating inventory:', { oldQuantity: item.quantity, newQuantity })

    // Determine if item should be marked as "bad" based on reason
    // All reduce reasons are now considered "bad" items (except sold/internal-use)
    const badItemReasons = [
      'damaged',
      'defective',
      'expired',
      'quality-failed',
      'customer-return',
      'supplier-return',
      'broken-packaging',
      'missing-parts',
      'water-damage',
      'incorrect-storage',
      'obsolete',
      'contaminated',
      'pest-damage',
      'mishandling',
      'other',
      // Legacy reasons (keep for backward compatibility)
      'damage', 
      'defect', 
      'lost',
      'spoilage', 
      'theft-loss', 
      'quality-rejection', 
      'customer-return-defective'
    ]
    const shouldMarkAsBad = badItemReasons.includes(reason)

    console.log('[Reduce API] Item status check:', {
      reason,
      shouldMarkAsBad,
      currentStatus: item.item_status || 'good',
      currentBadQuantity: item.bad_item_quantity || 0
    })

    // Record as internal usage/loss transaction
    // Use the existing sales API to record the transaction
    const reasonFormatted = reason.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
    const departmentInfo = `${reasonFormatted} / Stock Adjustment`

    if (shouldMarkAsBad) {
      // Mark item as bad and update bad quantity
      const newBadQuantity = (item.bad_item_quantity || 0) + amount
      
      // Update bad items breakdown
      const breakdown = (item.bad_items_breakdown || {}) as Record<string, number>
      breakdown[reason] = (breakdown[reason] || 0) + amount
      
      await updateInventoryItem(id, {
        quantity: newQuantity,
        item_status: 'bad',
        bad_item_reason: reasonFormatted,
        bad_item_quantity: newBadQuantity,
        bad_items_breakdown: breakdown
      })
      
      console.log('[Reduce API] Item marked as BAD:', {
        itemId: id,
        itemName: item.name,
        reason: reasonFormatted,
        badQuantity: newBadQuantity,
        breakdown
      })
    } else {
      // Keep item as good (internal use, etc.)
      await updateInventoryItem(id, {
        quantity: newQuantity
      })
      
      console.log('[Reduce API] Item remains GOOD (internal use or other):', {
        itemId: id,
        itemName: item.name,
        reason: reasonFormatted
      })
    }

    console.log('[Reduce API] Inventory updated successfully')
    
    // Get username from headers for staff tracking
    const username = request.headers.get('x-user-username') || 'Unknown'
    const displayName = request.headers.get('x-user-display-name') || username
    
    console.log('[Reduce API] Recording transaction:', { departmentInfo, staffName: displayName })

    // Record transaction in sales/internal usage
    try {
      const salesResponse = await fetch(`${request.nextUrl.origin}/api/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-username': username,
          'x-user-role': request.headers.get('x-user-role') || 'admin',
          'x-user-display-name': displayName,
        },
        body: JSON.stringify({
          items: [{
            itemId: id,
            quantity: amount
          }],
          department: departmentInfo,
          staffName: displayName,
          notes: notes || `Stock reduced: ${reasonFormatted}`,
          skipStockUpdate: true  // CRITICAL: Stock is already updated above, don't update again
        })
      })
      
      if (salesResponse.ok) {
        console.log('[Reduce API] Transaction recorded successfully')
      } else {
        const errorText = await salesResponse.text()
        console.error('[Reduce API] Transaction recording failed:', salesResponse.status, errorText)
      }
    } catch (salesError) {
      console.error('[Reduce API] Error recording transaction:', salesError)
      // Continue anyway - the stock was already reduced
    }

    // Log the operation
    console.log('[Reduce API] Adding log entry...')
    
    // Get current timestamp
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    
    await addLog({
      operation: "reduce",
      itemId: id,
      itemName: item.name,
      details: `Reduced ${amount} units (Reason: ${reasonFormatted}${notes ? ` - ${notes}` : ''}) | By: ${displayName} (${username}) | ${timestamp}`,
    })

    console.log('[Reduce API] Operation completed successfully')
    return NextResponse.json({ 
      success: true, 
      item: { 
        ...item, 
        quantity: newQuantity 
      } 
    })
  } catch (error) {
    console.error("[Reduce API] Error reducing stock:", error)
    return NextResponse.json({ error: "Failed to reduce stock" }, { status: 500 })
  }
}
