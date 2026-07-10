import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, handleChatError, ChatError } from '@/lib/chat-utils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
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

    // Rate limiting
    if (!checkRateLimit(`${currentUser.username}:users`, 30, 60000)) {
      throw new ChatError('Too many requests', 'RATE_LIMIT', 429)
    }

    const supabase = getSupabaseClient()

    // Get all users except the current user
    const { data: users, error } = await supabase
      .from('users')
      .select('username, profile_image, role')
      .neq('username', currentUser.username)
      .order('username', { ascending: true })

    if (error) throw error

    const formattedUsers = users.map((user: any) => ({
      id: user.username,
      username: user.username,
      displayName: user.username,
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
