/**
 * Real-time Chat Hook
 * Enterprise-level real-time messaging with Supabase
 */

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Message, Conversation } from '@/lib/chat-utils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface UseChatRealtimeProps {
  conversationId: string | null
  onNewMessage?: (message: Message) => void
  onMessageUpdate?: (message: Message) => void
  onMessageDelete?: (messageId: string) => void
  onTyping?: (userId: string, isTyping: boolean) => void
  onUserJoined?: (userId: string) => void
  onUserLeft?: (userId: string) => void
}

export function useChatRealtime({
  conversationId,
  onNewMessage,
  onMessageUpdate,
  onMessageDelete,
  onTyping,
  onUserJoined,
  onUserLeft,
}: UseChatRealtimeProps) {
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!conversationId) {
      // Cleanup if no conversation selected
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      return
    }

    // Create channel for this conversation
    const channel = supabase.channel(`conversation:${conversationId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: conversationId },
      },
    })

    // Listen for new messages
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        if (onNewMessage && payload.new) {
          // Fetch sender info
          const { data: sender } = await supabase
            .from('users')
            .select('username, full_name, profile_image')
            .eq('username', payload.new.sender_id)
            .single()

          const message: Message = {
            id: payload.new.id,
            conversationId: payload.new.conversation_id,
            senderId: payload.new.sender_id,
            content: payload.new.content,
            createdAt: payload.new.created_at,
            updatedAt: payload.new.updated_at,
            editedAt: payload.new.edited_at,
            senderName: sender?.full_name || payload.new.sender_id,
            senderAvatar: sender?.profile_image,
          }
          onNewMessage(message)
        }
      }
    )

    // Listen for message updates (edits)
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        if (onMessageUpdate && payload.new) {
          const { data: sender } = await supabase
            .from('users')
            .select('username, full_name, profile_image')
            .eq('username', payload.new.sender_id)
            .single()

          const message: Message = {
            id: payload.new.id,
            conversationId: payload.new.conversation_id,
            senderId: payload.new.sender_id,
            content: payload.new.content,
            createdAt: payload.new.created_at,
            updatedAt: payload.new.updated_at,
            editedAt: payload.new.edited_at,
            senderName: sender?.full_name || payload.new.sender_id,
            senderAvatar: sender?.profile_image,
          }
          onMessageUpdate(message)
        }
      }
    )

    // Listen for message deletes
    channel.on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (onMessageDelete && payload.old) {
          onMessageDelete(payload.old.id)
        }
      }
    )

    // Listen for typing indicators (via broadcast)
    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (onTyping) {
        onTyping(payload.userId, payload.isTyping)
      }
    })

    // Listen for presence (users joining/leaving)
    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      if (onUserJoined && newPresences.length > 0) {
        newPresences.forEach((presence: any) => {
          onUserJoined(presence.userId)
        })
      }
    })

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      if (onUserLeft && leftPresences.length > 0) {
        leftPresences.forEach((presence: any) => {
          onUserLeft(presence.userId)
        })
      }
    })

    // Subscribe to channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Chat Realtime] Subscribed to conversation:', conversationId)
        // Track presence
        await channel.track({
          userId: 'current-user', // Will be replaced with actual user
          onlineAt: new Date().toISOString(),
        })
      }
    })

    channelRef.current = channel

    // Cleanup on unmount or conversation change
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [conversationId, onNewMessage, onMessageUpdate, onMessageDelete, onTyping, onUserJoined, onUserLeft])

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    async (isTyping: boolean) => {
      if (channelRef.current && conversationId) {
        await channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: 'current-user', isTyping }, // Will be replaced with actual user
        })
      }
    },
    [conversationId]
  )

  return { sendTypingIndicator }
}

// Hook for presence tracking across all conversations
export function useChatPresence(userId: string) {
  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: {
        presence: { key: userId },
      },
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userId,
          onlineAt: new Date().toISOString(),
        })
      }
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])
}
