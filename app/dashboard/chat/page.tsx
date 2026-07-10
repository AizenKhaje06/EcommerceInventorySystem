'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, Plus, Search, Send, X, Users, MoreVertical, Paperclip, Smile, Phone, Video, ArrowLeft, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'
import { useReducedMotion } from '@/hooks/use-accessibility'
import { useChatRealtime } from '@/hooks/use-chat-realtime'
import { useToast } from '@/components/toast-provider'
import { validateMessage, sanitizeMessage, checkRateLimit, ChatError } from '@/lib/chat-utils'

interface User {
  id: string
  username: string
  displayName: string
  profileImage?: string
  role: string
}

interface Conversation {
  id: string
  name?: string
  type: 'direct' | 'group'
  createdBy: string
  lastMessageAt: string
  members: User[]
  lastMessage?: string
  unreadCount: number
}

interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
  senderName: string
  senderAvatar?: string
}

export default function ChatPage() {
  const currentUser = getCurrentUser()
  const reducedMotion = useReducedMotion()
  const { showToast } = useToast()
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFriendList, setShowFriendList] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([])
  const [groupName, setGroupName] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Enterprise features: Loading states
  const [loading, setLoading] = useState({
    conversations: false,
    messages: false,
    sending: false,
    creating: false
  })
  
  // Enterprise features: Real-time indicators
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  
  // Phase 3: Message editing/deleting
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  // Enterprise feature: Real-time subscription
  const { sendTypingIndicator } = useChatRealtime({
    conversationId: selectedConversation?.id || null,
    onNewMessage: (message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev
        return [...prev, {
          id: message.id,
          conversationId: message.conversation_id,
          senderId: message.sender_id,
          content: message.content,
          createdAt: message.created_at,
          senderName: message.sender_name || message.sender_id,
        }]
      })
      
      if (message.sender_id !== currentUser?.username) {
        showToast('New message received', 'info', 2000)
      }
    },
    onTyping: (userId, isTyping) => {
      setTypingUsers(prev => {
        const next = new Set(prev)
        if (isTyping) {
          next.add(userId)
        } else {
          next.delete(userId)
        }
        return next
      })
    },
    onPresenceChange: (userId, isOnline) => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        if (isOnline) {
          next.add(userId)
        } else {
          next.delete(userId)
        }
        return next
      })
    }
  })

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch data on component mount
  useEffect(() => {
    if (currentUser) {
      fetchConversations()
      fetchUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.username])

  // Fetch conversations from API
  const fetchConversations = async () => {
    if (!currentUser) return
    
    setLoading(prev => ({ ...prev, conversations: true }))
    try {
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'x-user-username': currentUser.username,
          'x-user-role': currentUser.role
        }
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch conversations')
      }
      const data = await response.json()
      setConversations(data)
      if (data.length > 0) {
        setSelectedConversation(data[0])
        fetchMessages(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      showToast('Failed to load conversations', 'error')
    } finally {
      setLoading(prev => ({ ...prev, conversations: false }))
    }
  }

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    if (!currentUser) return
    
    setLoading(prev => ({ ...prev, messages: true }))
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`, {
        headers: {
          'x-user-username': currentUser.username,
          'x-user-role': currentUser.role
        }
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch messages')
      }
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
      showToast('Failed to load messages', 'error')
    } finally {
      setLoading(prev => ({ ...prev, messages: false }))
    }
  }

  // Fetch all users
  const fetchUsers = async () => {
    if (!currentUser) return
    
    try {
      const response = await fetch('/api/chat/users', {
        headers: {
          'x-user-username': currentUser.username,
          'x-user-role': currentUser.role
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAllUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id])
  
  // Phase 3: Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowFriendList(false)
        setShowCreateGroup(false)
        setEditingMessageId(null)
      }
      
      // Ctrl/Cmd + K for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder="Search conversations..."]') as HTMLInputElement
        searchInput?.focus()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSendMessage = async () => {
    if (!selectedConversation || !currentUser) return

    // Enterprise: Validate message
    const validation = validateMessage(messageInput)
    if (!validation.valid) {
      showToast(validation.error || 'Invalid message', 'error')
      return
    }

    // Enterprise: Check rate limit
    if (!checkRateLimit(currentUser.username, 20, 60000)) {
      showToast('Sending too fast. Please slow down.', 'warning')
      return
    }

    // Enterprise: Sanitize content
    const sanitized = sanitizeMessage(messageInput)

    setLoading(prev => ({ ...prev, sending: true }))

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-username': currentUser.username,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: sanitized
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new ChatError(
          error.message || 'Failed to send message',
          response.status === 401 ? 'UNAUTHORIZED' : 
          response.status === 403 ? 'FORBIDDEN' : 
          response.status === 429 ? 'RATE_LIMIT' : 'UNKNOWN_ERROR'
        )
      }

      // Real-time will handle adding the message
      setMessageInput('')
      sendTypingIndicator(false)
      
    } catch (error) {
      if (error instanceof ChatError) {
        if (error.code === 'RATE_LIMIT') {
          showToast('Too many messages. Please wait.', 'warning')
        } else if (error.code === 'UNAUTHORIZED') {
          showToast('Please log in again', 'error')
        } else {
          showToast(error.message, 'error')
        }
      } else {
        showToast('Failed to send message', 'error')
      }
    } finally {
      setLoading(prev => ({ ...prev, sending: false }))
    }
  }
  
  // Phase 3: Edit message
  const handleEditMessage = async (messageId: string) => {
    if (!currentUser || !editContent.trim()) {
      showToast('Message cannot be empty', 'error')
      return
    }
    
    const validation = validateMessage(editContent)
    if (!validation.valid) {
      showToast(validation.error || 'Invalid message', 'error')
      return
    }
    
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-username': currentUser.username,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({ content: sanitizeMessage(editContent) })
      })
      
      if (!response.ok) throw new Error()
      
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, content: editContent } : m
      ))
      
      setEditingMessageId(null)
      setEditContent('')
      showToast('Message updated', 'success', 1500)
    } catch (error) {
      showToast('Failed to update message', 'error')
    }
  }
  
  // Phase 3: Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!currentUser || !confirm('Delete this message? This cannot be undone.')) return
    
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'x-user-username': currentUser.username,
          'x-user-role': currentUser.role
        }
      })
      
      if (!response.ok) throw new Error()
      
      setMessages(prev => prev.filter(m => m.id !== messageId))
      showToast('Message deleted', 'success', 1500)
    } catch (error) {
      showToast('Failed to delete message', 'error')
    }
  }

  const handleStartDirectMessage = async (user: User) => {
    if (!currentUser) return
    
    // Check if conversation already exists
    const existing = conversations.find(c => c.type === 'direct' && c.members.some(m => m.id === user.id))
    if (existing) {
      setSelectedConversation(existing)
    } else {
      // Create new direct message conversation
      try {
        const response = await fetch('/api/chat/conversations', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-username': currentUser.username,
            'x-user-role': currentUser.role
          },
          body: JSON.stringify({
            type: 'direct',
            members: [user.id]
          })
        })

        if (!response.ok) throw new Error('Failed to create conversation')

        const newConv = await response.json()
        const newConversation: Conversation = {
          id: newConv.id,
          type: 'direct',
          createdBy: currentUser!.username,
          lastMessageAt: new Date().toISOString(),
          members: [currentUser as any, user],
          unreadCount: 0
        }
        setConversations([...conversations, newConversation])
        setSelectedConversation(newConversation)
      } catch (error) {
        console.error('Error creating conversation:', error)
        showToast('Failed to create conversation', 'error')
      }
    }
    setShowFriendList(false)
  }

  const handleCreateGroup = async () => {
    if (!currentUser || !groupName.trim() || selectedGroupMembers.length === 0) return

    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-username': currentUser.username,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({
          type: 'group',
          name: groupName,
          members: selectedGroupMembers
        })
      })

      if (!response.ok) throw new Error('Failed to create group')

      const newConv = await response.json()
      const selectedUsers = allUsers.filter(u => selectedGroupMembers.includes(u.id))
      const newConversation: Conversation = {
        id: newConv.id,
        name: groupName,
        type: 'group',
        createdBy: currentUser!.username,
        lastMessageAt: new Date().toISOString(),
        members: [currentUser as any, ...selectedUsers],
        unreadCount: 0
      }

      setConversations([...conversations, newConversation])
      setSelectedConversation(newConversation)
      setGroupName('')
      setSelectedGroupMembers([])
      setShowCreateGroup(false)
      showToast('Group created successfully', 'success')
    } catch (error) {
      console.error('Error creating group:', error)
      showToast('Failed to create group', 'error')
    }
  }

  const getConversationName = (conv: Conversation): string => {
    if (conv.type === 'group') return conv.name || 'Group Chat'
    const otherMember = conv.members.find(m => m.id !== currentUser?.username)
    return otherMember?.displayName || 'Direct Message'
  }

  const filteredConversations = conversations.filter(conv =>
    getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-80px)] flex bg-slate-50 dark:bg-slate-950">
      {/* Friend List / Create Group Modal */}
      {showFriendList && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setShowFriendList(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full">
              <div className="border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Start a Chat</h3>
                <button onClick={() => setShowFriendList(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleStartDirectMessage(user)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-700 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">{user.displayName[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.displayName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateGroup(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full">
              <div className="border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create Group</h3>
                <button onClick={() => setShowCreateGroup(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-900 dark:text-white">Group Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Operations Team"
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-900 dark:text-white">Add Members</label>
                  <div className="space-y-2 mt-1 max-h-48 overflow-y-auto">
                    {allUsers.map(user => (
                      <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedGroupMembers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGroupMembers([...selectedGroupMembers, user.id])
                            } else {
                              setSelectedGroupMembers(selectedGroupMembers.filter(id => id !== user.id))
                            }
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{user.displayName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedGroupMembers.length === 0}
                  className="w-full px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Conversations Sidebar */}
      <div className={cn(
        "w-full md:w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col",
        selectedConversation && "hidden md:flex"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              Messages
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFriendList(true)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors"
            >
              <Users className="h-4 w-4" />
              Group
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading.conversations ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <MessageCircle className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No conversations yet</p>
              </div>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={cn(
                  'w-full p-4 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left',
                  selectedConversation?.id === conv.id && 'bg-slate-100 dark:bg-slate-800'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-700 dark:bg-slate-600 flex items-center justify-center flex-shrink-0 relative">
                    {conv.type === 'group' ? (
                      <Users className="h-6 w-6 text-white" />
                    ) : (
                      <span className="text-sm font-bold text-white">{getConversationName(conv)[0]}</span>
                    )}
                    {/* Enterprise: Online indicator for direct messages */}
                    {conv.type === 'direct' && (() => {
                      const otherUser = conv.members.find(m => m.id !== currentUser?.username)
                      return otherUser && onlineUsers.has(otherUser.id) ? (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
                      ) : null
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {getConversationName(conv)}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 px-2 py-1 text-xs font-bold text-white bg-blue-500 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
          {/* Chat Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Enterprise: Back button for mobile */}
              <button 
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
              
              <div className="w-10 h-10 rounded-full bg-slate-700 dark:bg-slate-600 flex items-center justify-center">
                {selectedConversation.type === 'group' ? (
                  <Users className="h-5 w-5 text-white" />
                ) : (
                  <span className="text-sm font-bold text-white">{getConversationName(selectedConversation)[0]}</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{getConversationName(selectedConversation)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedConversation.members.length} members
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Phone className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Video className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <MoreVertical className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading.messages ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : (
              <>
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={cn('flex', msg.senderId === currentUser?.username ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg',
                        msg.senderId === currentUser?.username
                          ? 'bg-slate-900 dark:bg-slate-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      )}
                    >
                      {selectedConversation.type === 'group' && msg.senderId !== currentUser?.username && (
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{msg.senderName}</p>
                      )}
                      <p className="text-sm break-words">{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Enterprise: Typing indicator */}
                {typingUsers.size > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4">
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Paperclip className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500"
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value)
                    if (selectedConversation) {
                      sendTypingIndicator(true)
                    }
                  }}
                  onBlur={() => {
                    if (selectedConversation) {
                      sendTypingIndicator(false)
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                      sendTypingIndicator(false)
                    }
                  }}
                  disabled={loading.sending}
                  maxLength={5000}
                />
                {/* Enterprise: Character counter */}
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-1">
                  {messageInput.length} / 5000 characters
                </div>
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Smile className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || loading.sending}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading.sending ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-900 dark:text-slate-300" />
                ) : (
                  <Send className="h-5 w-5 text-slate-900 dark:text-slate-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-900 dark:text-white">Select a conversation</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Choose from your conversations or start a new one</p>
          </div>
        </div>
      )}
    </div>
  )
}
