'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, Plus, Search, Send, X, Users, MoreVertical, Paperclip, Smile, Phone, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'
import { useReducedMotion } from '@/hooks/use-accessibility'

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
  }, [currentUser])

  // Fetch conversations from API
  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
        if (data.length > 0) {
          setSelectedConversation(data[0])
          fetchMessages(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/chat/users')
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
  }, [selectedConversation?.id])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: messageInput
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const newMessage = await response.json()
      setMessages([...messages, {
        ...newMessage,
        senderName: currentUser!.displayName
      }])
      setMessageInput('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleStartDirectMessage = async (user: User) => {
    // Check if conversation already exists
    const existing = conversations.find(c => c.type === 'direct' && c.members.some(m => m.id === user.id))
    if (existing) {
      setSelectedConversation(existing)
    } else {
      // Create new direct message conversation
      try {
        const response = await fetch('/api/chat/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      }
    }
    setShowFriendList(false)
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedGroupMembers.length === 0) return

    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    } catch (error) {
      console.error('Error creating group:', error)
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
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
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
          {filteredConversations.length === 0 ? (
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
                  <div className="w-12 h-12 rounded-full bg-slate-700 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                    {conv.type === 'group' ? (
                      <Users className="h-6 w-6 text-white" />
                    ) : (
                      <span className="text-sm font-bold text-white">{getConversationName(conv)[0]}</span>
                    )}
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
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4">
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Paperclip className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Smile className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5 text-slate-900 dark:text-slate-300" />
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
