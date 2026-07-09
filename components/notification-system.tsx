'use client'

import React, { useEffect, useState } from 'react'
import { Bell, X, MessageCircle, Package, ShoppingCart, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Notification {
  id: string
  type: 'chat' | 'order' | 'inventory' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const currentUser = getCurrentUser()

  useEffect(() => {
    if (!currentUser) return

    // Load notifications
    loadNotifications()

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${currentUser.username}`
      }, (payload) => {
        const newNotification = payload.new as any
        setNotifications(prev => [mapNotification(newNotification), ...prev])
        
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/Vertex-icon-3.png',
            badge: '/Vertex-icon-3.png'
          })
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [currentUser])

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser?.username)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setNotifications(data?.map(mapNotification) || [])
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const mapNotification = (data: any): Notification => ({
    id: data.id,
    type: data.type,
    title: data.title,
    message: data.message,
    read: data.read,
    createdAt: data.created_at,
    link: data.link
  })

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', currentUser?.username)
        .eq('read', false)

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageCircle className="h-5 w-5" />
      case 'order': return <ShoppingCart className="h-5 w-5" />
      case 'inventory': return <Package className="h-5 w-5" />
      case 'system': return <AlertTriangle className="h-5 w-5" />
      default: return <Bell className="h-5 w-5" />
    }
  }

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowPanel(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-96 max-h-[600px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  <X className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[520px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <button
                    key={notification.id}
                    onClick={() => {
                      markAsRead(notification.id)
                      if (notification.link) {
                        window.location.href = notification.link
                      }
                    }}
                    className={cn(
                      'w-full p-4 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left',
                      !notification.read && 'bg-blue-50 dark:bg-blue-900/10'
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn(
                        'flex-shrink-0 p-2 rounded-lg',
                        notification.type === 'chat' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                        notification.type === 'order' && 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                        notification.type === 'inventory' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
                        notification.type === 'system' && 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      )}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{notification.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notification.message}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
