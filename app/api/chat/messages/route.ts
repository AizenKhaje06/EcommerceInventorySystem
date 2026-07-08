import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationId = request.nextUrl.searchParams.get('conversationId')
    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
    }

    // Verify user is a member of this conversation
    const { data: member, error: memberError } = await supabase
      .from('conversation_members')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUser.username)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get messages for conversation
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        sender_id,
        created_at,
        users (
          full_name,
          profile_image
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error

    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id,
      conversationId,
      senderId: msg.sender_id,
      content: msg.content,
      createdAt: msg.created_at,
      senderName: msg.users.full_name,
      senderAvatar: msg.users.profile_image
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId, content } = await request.json()

    if (!conversationId || !content) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Verify user is a member of this conversation
    const { data: member, error: memberError } = await supabase
      .from('conversation_members')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUser.username)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: currentUser.username,
        content
      })
      .select()
      .single()

    if (error) throw error

    // Update conversation last updated time
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    return NextResponse.json({
      id: message.id,
      conversationId,
      senderId: message.sender_id,
      content: message.content,
      createdAt: message.created_at
    })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}
