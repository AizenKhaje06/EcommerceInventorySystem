import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, handleChatError, ChatError } from '@/lib/chat-utils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new ChatError('Authentication required', 'UNAUTHORIZED', 401)
    }

    // Rate limiting
    if (!checkRateLimit(`${currentUser.username}:users`, 30, 60000)) {
      throw new ChatError('Too many requests', 'RATE_LIMIT', 429)
    }

    const supabase = getSupabaseClient()

    // Get all users except the current user
    const { data: users, error } = await supabase
      .from('users')
      .select('username, full_name, profile_image, role')
      .neq('username', currentUser.username)
      .order('full_name', { ascending: true })

    if (error) throw error

    const formattedUsers = users.map((user: any) => ({
      id: user.username,
      username: user.username,
      displayName: user.full_name || user.username,
      profileImage: user.profile_image,
      role: user.role || 'user'
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    const chatError = handleChatError(error)
    return NextResponse.json(
      { error: chatError.message, code: chatError.code },
      { status: chatError.statusCode }
    )
  }
}
