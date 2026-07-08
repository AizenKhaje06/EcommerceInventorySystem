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

    // Get all conversations for the current user
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        name,
        type,
        created_by,
        created_at,
        updated_at,
        conversation_members (
          user_id,
          users (
            id,
            username,
            full_name,
            profile_image
          )
        ),
        messages (
          id,
          content,
          created_at
        )
      `)
      .in('id', 
        // Get conversations where user is a member
        (await supabase
          .from('conversation_members')
          .select('conversation_id')
          .eq('user_id', currentUser.username)).data?.map((m: any) => m.conversation_id) || []
      )
      .order('updated_at', { ascending: false })

    if (error) throw error

    // Format response
    const formattedConversations = conversations.map((conv: any) => {
      const lastMessage = conv.messages[0]
      return {
        id: conv.id,
        name: conv.name,
        type: conv.type,
        createdBy: conv.created_by,
        lastMessageAt: conv.updated_at,
        members: conv.conversation_members.map((m: any) => ({
          id: m.users.id,
          username: m.users.username,
          displayName: m.users.full_name,
          profileImage: m.users.profile_image,
          role: 'user'
        })),
        lastMessage: lastMessage?.content,
        unreadCount: 0
      }
    })

    return NextResponse.json(formattedConversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, name, members } = await request.json()

    if (!type || !members || members.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        type,
        name: type === 'group' ? name : null,
        created_by: currentUser.username
      })
      .select()
      .single()

    if (convError) throw convError

    // Add members to conversation
    const memberIds = [currentUser.username, ...members]
    const { error: memberError } = await supabase
      .from('conversation_members')
      .insert(
        memberIds.map(userId => ({
          conversation_id: conversation.id,
          user_id: userId
        }))
      )

    if (memberError) throw memberError

    return NextResponse.json({ id: conversation.id, type, name })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
