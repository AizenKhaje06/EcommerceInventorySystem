import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import {
  validateMessage,
  sanitizeMessage,
  CHAT_CONSTANTS,
  checkRateLimit,
  handleChatError,
  ChatError
} from '@/lib/chat-utils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function GET(request: NextRequest) {
  try {
    // Get user from headers
    const username = request.headers.get('x-user-username')
    const role = request.headers.get('x-user-role')
    
    if (!username || !role) {
      throw new ChatError('Authentication required', 'UNAUTHORIZED', 401)
    }
    
    const currentUser = { username, role }

    const conversationId = request.nextUrl.searchParams.get('conversationId')
    if (!conversationId) {
      throw new ChatError('Missing conversationId', 'VALIDATION_ERROR', 400)
    }

    // Rate limiting
    if (!checkRateLimit(`${currentUser.username}:messages`, 60, 60000)) {
      throw new ChatError('Too many requests', 'RATE_LIMIT', 429)
    }

    const supabase = getSupabaseClient()

    // Verify user is a member of this conversation
    const { data: member, error: memberError } = await supabase
      .from('conversation_members')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUser.username)
      .maybeSingle()

    if (memberError) throw memberError
    if (!member) {
      throw new ChatError('You are not a member of this conversation', 'FORBIDDEN', 403)
    }

    // Get messages with sender info
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        sender_id,
        created_at,
        updated_at,
        edited_at,
        users!messages_sender_id_fkey (
          username,
          full_name,
          profile_image
        )
      `)
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(CHAT_CONSTANTS.MESSAGE_FETCH_LIMIT)

    if (error) throw error

    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id,
      conversationId,
      senderId: msg.sender_id,
      content: msg.content,
      createdAt: msg.created_at,
      updatedAt: msg.updated_at,
      editedAt: msg.edited_at,
      senderName: msg.users?.full_name || msg.sender_id,
      senderAvatar: msg.users?.profile_image
    }))

    // Update last_read_at for this user
    await supabase
      .from('conversation_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUser.username)

    return NextResponse.json(formattedMessages)
  } catch (error) {
    const chatError = handleChatError(error)
    return NextResponse.json(
      { error: chatError.message, code: chatError.code },
      { status: chatError.statusCode }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from headers
    const username = request.headers.get('x-user-username')
    const role = request.headers.get('x-user-role')
    
    if (!username || !role) {
      throw new ChatError('Authentication required', 'UNAUTHORIZED', 401)
    }
    
    const currentUser = { username, role, displayName: username }

    const { conversationId, content } = await request.json()

    if (!conversationId) {
      throw new ChatError('Missing conversationId', 'VALIDATION_ERROR', 400)
    }

    // Validate message content
    const validation = validateMessage(content)
    if (!validation.valid) {
      throw new ChatError(validation.error!, 'VALIDATION_ERROR', 400)
    }

    // Rate limiting (stricter for sending messages)
    if (!checkRateLimit(`${currentUser.username}:send`, 20, 60000)) {
      throw new ChatError('Sending messages too quickly', 'RATE_LIMIT', 429)
    }

    const supabase = getSupabaseClient()

    // Verify user is a member of this conversation
    const { data: member, error: memberError } = await supabase
      .from('conversation_members')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUser.username)
      .maybeSingle()

    if (memberError) throw memberError
    if (!member) {
      throw new ChatError('You are not a member of this conversation', 'FORBIDDEN', 403)
    }

    // Sanitize content
    const sanitizedContent = sanitizeMessage(content)

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: currentUser.username,
        content: sanitizedContent
      })
      .select()
      .single()

    if (error) throw error

    // The trigger will automatically update conversation.updated_at
    
    return NextResponse.json({
      id: message.id,
      conversationId,
      senderId: message.sender_id,
      content: message.content,
      createdAt: message.created_at,
      senderName: currentUser.displayName
    }, { status: 201 })
  } catch (error) {
    const chatError = handleChatError(error)
    return NextResponse.json(
      { error: chatError.message, code: chatError.code },
      { status: chatError.statusCode }
    )
  }
}
