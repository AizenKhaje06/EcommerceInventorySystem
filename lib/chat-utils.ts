/**
 * Chat System Utilities
 * Enterprise-level helpers for chat functionality
 */

import { createClient } from '@supabase/supabase-js'

// Constants
export const CHAT_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 5000,
  MAX_GROUP_NAME_LENGTH: 100,
  MAX_GROUP_MEMBERS: 50,
  MESSAGE_FETCH_LIMIT: 100,
  CONVERSATION_FETCH_LIMIT: 50,
} as const

export const ConversationType = {
  DIRECT: 'direct',
  GROUP: 'group',
} as const

// Type definitions
export interface ChatUser {
  id: string
  username: string
  displayName: string
  profileImage?: string
  role: string
  isOnline?: boolean
  lastSeen?: string
}

export interface Conversation {
  id: string
  name?: string
  type: typeof ConversationType.DIRECT | typeof ConversationType.GROUP
  createdBy: string
  lastMessageAt: string
  members: ChatUser[]
  lastMessage?: string
  unreadCount: number
  isArchived?: boolean
  isTyping?: string[] // usernames of users currently typing
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
  updatedAt?: string
  editedAt?: string
  senderName: string
  senderAvatar?: string
  readBy?: string[] // usernames of users who read this message
}

// Validation functions
export const validateMessage = (content: string): { valid: boolean; error?: string } => {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Message content is required' }
  }

  const trimmed = content.trim()
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' }
  }

  if (trimmed.length > CHAT_CONSTANTS.MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message too long (max ${CHAT_CONSTANTS.MAX_MESSAGE_LENGTH} characters)` }
  }

  return { valid: true }
}

export const validateGroupName = (name: string): { valid: boolean; error?: string } => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Group name is required' }
  }

  const trimmed = name.trim()
  if (trimmed.length === 0) {
    return { valid: false, error: 'Group name cannot be empty' }
  }

  if (trimmed.length > CHAT_CONSTANTS.MAX_GROUP_NAME_LENGTH) {
    return { valid: false, error: `Group name too long (max ${CHAT_CONSTANTS.MAX_GROUP_NAME_LENGTH} characters)` }
  }

  return { valid: true }
}

export const validateGroupMembers = (members: string[]): { valid: boolean; error?: string } => {
  if (!Array.isArray(members)) {
    return { valid: false, error: 'Members must be an array' }
  }

  if (members.length === 0) {
    return { valid: false, error: 'At least one member is required' }
  }

  if (members.length > CHAT_CONSTANTS.MAX_GROUP_MEMBERS) {
    return { valid: false, error: `Too many members (max ${CHAT_CONSTANTS.MAX_GROUP_MEMBERS})` }
  }

  return { valid: true }
}

// Sanitization
export const sanitizeMessage = (content: string): string => {
  // Remove script tags
  let sanitized = content.replace(/<script[^>]*>.*?<\/script>/gi, '')
  
  // Remove potentially dangerous HTML
  sanitized = sanitized.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
  sanitized = sanitized.replace(/<object[^>]*>.*?<\/object>/gi, '')
  sanitized = sanitized.replace(/<embed[^>]*>/gi, '')
  
  // Trim whitespace
  return sanitized.trim()
}

// Helper functions
export const getConversationDisplayName = (
  conversation: Conversation,
  currentUsername: string
): string => {
  if (conversation.type === ConversationType.GROUP) {
    return conversation.name || 'Group Chat'
  }
  
  const otherMember = conversation.members.find(m => m.username !== currentUsername)
  return otherMember?.displayName || 'Direct Message'
}

export const getConversationAvatar = (
  conversation: Conversation,
  currentUsername: string
): string | undefined => {
  if (conversation.type === ConversationType.GROUP) {
    return undefined // Use group icon
  }
  
  const otherMember = conversation.members.find(m => m.username !== currentUsername)
  return otherMember?.profileImage
}

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Error handling
export class ChatError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'ChatError'
  }
}

export const handleChatError = (error: any): ChatError => {
  console.error('[Chat Error]', error)

  if (error instanceof ChatError) {
    return error
  }

  if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
    return new ChatError('You must be logged in to use chat', 'UNAUTHORIZED', 401)
  }

  if (error.message?.includes('forbidden') || error.message?.includes('403')) {
    return new ChatError('You do not have permission to perform this action', 'FORBIDDEN', 403)
  }

  if (error.message?.includes('not found') || error.message?.includes('404')) {
    return new ChatError('Conversation not found', 'NOT_FOUND', 404)
  }

  return new ChatError(
    error.message || 'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500
  )
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export const checkRateLimit = (
  userId: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean => {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (userLimit.count >= maxRequests) {
    return false
  }

  userLimit.count++
  return true
}

// Cleanup old rate limit entries
setInterval(() => {
  const now = Date.now()
  for (const [userId, limit] of rateLimitMap.entries()) {
    if (now > limit.resetAt) {
      rateLimitMap.delete(userId)
    }
  }
}, 60000) // Clean up every minute
