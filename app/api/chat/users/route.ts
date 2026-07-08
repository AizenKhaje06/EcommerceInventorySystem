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

    // Get all users except the current user
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, full_name, profile_image')
      .neq('id', currentUser.username)
      .order('full_name', { ascending: true })

    if (error) throw error

    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      username: user.username,
      displayName: user.full_name,
      profileImage: user.profile_image,
      role: 'user'
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
