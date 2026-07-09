import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { 
  validateGroupName, 
  validateGroupMembers, 
  CHAT_CONSTANTS,
  ConversationType,
  checkRateLimit,
  handleChatError,
  ChatError
} from '@/lib/chat-utils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Helper to create Supabase client with user session
function getSupabaseClient() {
  // In production, use createServerClient with cookies
  // For now, using anon key with RLS policies
  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new ChatError('Authentication required', 'UNAUTHORIZED', 401)
    }

    // Rate limiting
    if (!checkRateLimit(currentUser.username, 30, 60000)) {
      throw new ChatError('Too many requests. Please try again later', 'RATE_LIMIT', 429)
    }

    const supabase = getSupabaseClient()

    // Optimized query using JOIN instead of nested queries
    const { data: conversations, error } = await supabase
      .from('conversation_members')
      .select(`
        conversation_id,
        conversations!inner (
          id,
          name,
          type,
          created_by,
          created_at,
          updated_at,
          is_archived
        )
      `)
      .eq('user_id', currentUser.username)
      .order('conversations.updated_at', { ascending: false })
      .limit(CHAT_CONSTANTS.CONVERSATION_FETCH_LIMIT)

    if (error) throw error

    // Get detailed info for each conversation
    const conversationIds = conversations.map((c: any) => c.conversations.id)
    
    // Fetch members
    const { data: allMembers } = await supabase
      .from('conversation_members')
      .select(`
        conversation_id,
        user_id,
        users!inner (
          username,
          full_name,
          profile_image,
          role
        )
      `)
      .in('conversation_id', conversationIds)

    // Fetch last message for each conversation
    const { data: lastMessages } = await supabase
      .from('messages')
      .select('conversation_id, content, created_at')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false })
      .limit(1)

    // Format response
    const formattedConversations = conversations.map((item: any) => {
      const conv = item.conversations
      const members = allMembers?.filter((m: any) => m.conversation_id === conv.id) || []
      const lastMsg = lastMessages?.find((msg: any) => msg.conversation_id === conv.id)

      return {
        id: conv.id,
        name: conv.name,
        type: conv.type,
        createdBy: conv.created_by,
        lastMessageAt: conv.updated_at,
        isArchived: conv.is_archived,
        members: members.map((m: any) => ({
          id: m.users.username,
          username: m.users.username,
          displayName: m.users.full_name,
          profileImage: m.users.profile_image,
          role: m.users.role || 'user'
        })),
        lastMessage: lastMsg?.content,
        unreadCount: 0 // TODO: Calculate from read receipts
      }
    })

    return NextResponse.json(formattedConversations)
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
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new ChatError('Authentication required', 'UNAUTHORIZED', 401)
    }

    // Rate limiting
    if (!checkRateLimit(currentUser.username, 10, 60000)) {
      throw new ChatError('Too many requests. Please try again later', 'RATE_LIMIT', 429)
    }

    const { type, name, members } = await request.json()

    // Validate type
    if (!type || ![ConversationType.DIRECT, ConversationType.GROUP].includes(type)) {
      throw new ChatError('Invalid conversation type', 'VALIDATION_ERROR', 400)
    }

    // Validate members
    const memberValidation = validateGroupMembers(members || [])
    if (!memberValidation.valid) {
      throw new ChatError(memberValidation.error!, 'VALIDATION_ERROR', 400)
    }

    // Validate group name if it's a group chat
    if (type === ConversationType.GROUP) {
      const nameValidation = validateGroupName(name || '')
      if (!nameValidation.valid) {
        throw new ChatError(nameValidation.error!, 'VALIDATION_ERROR', 400)
      }
    }

    const supabase = getSupabaseClient()

    // For direct messages, check if conversation already exists
    if (type === ConversationType.DIRECT && members.length === 1) {
      const otherUserId = members[0]
      
      // Check if direct conversation already exists
      const { data: existingConvs } = await supabase
        .from('conversation_members')
        .select('conversation_id, conversations!inner(type)')
        .eq('user_id', currentUser.username)

      if (existingConvs) {
        for (const conv of existingConvs) {
          if (conv.conversations.type === ConversationType.DIRECT) {
            // Check if other user is also a member
            const { data: otherMember } = await supabase
              .from('conversation_members')
              .select('user_id')
              .eq('conversation_id', conv.conversation_id)
              .eq('user_id', otherUserId)
              .single()

            if (otherMember) {
              // Conversation already exists
              return NextResponse.json({
                id: conv.conversation_id,
                type,
                name: null,
                exists: true
              })
            }
          }
        }
      }
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        type,
        name: type === ConversationType.GROUP ? name : null,
        created_by: currentUser.username
      })
      .select()
      .single()

    if (convError) throw convError

    // Add members to conversation (including creator)
    const memberIds = [currentUser.username, ...members]
    const uniqueMemberIds = [...new Set(memberIds)] // Remove duplicates

    const { error: memberError } = await supabase
      .from('conversation_members')
      .insert(
        uniqueMemberIds.map(userId => ({
          conversation_id: conversation.id,
          user_id: userId
        }))
      )

    if (memberError) throw memberError

    return NextResponse.json({
      id: conversation.id,
      type,
      name: conversation.name,
      exists: false
    }, { status: 201 })
  } catch (error) {
    const chatError = handleChatError(error)
    return NextResponse.json(
      { error: chatError.message, code: chatError.code },
      { status: chatError.statusCode }
    )
  }
}
