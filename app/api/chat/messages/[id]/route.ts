import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// PATCH - Edit message
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from headers
    const username = request.headers.get('x-user-username')
    const role = request.headers.get('x-user-role')
    
    if (!username || !role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const currentUser = { username, role }

    const { content } = await request.json()
    const messageId = params.id

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 })
    }

    // Verify user owns the message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .single()

    if (fetchError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if (message.sender_id !== currentUser.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update message
    const { error: updateError } = await supabase
      .from('messages')
      .update({ 
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error editing message:', error)
    return NextResponse.json({ error: 'Failed to edit message' }, { status: 500 })
  }
}

// DELETE - Delete message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from headers
    const username = request.headers.get('x-user-username')
    const role = request.headers.get('x-user-role')
    
    if (!username || !role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const currentUser = { username, role }

    const messageId = params.id

    // Verify user owns the message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .single()

    if (fetchError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if (message.sender_id !== currentUser.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete message
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
