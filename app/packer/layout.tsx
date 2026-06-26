'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, RefreshCw, ChevronDown, User } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { useSessionGuard } from '@/lib/use-session-guard'

const NAV_ITEMS = [
  { href: '/packer/dashboard', label: 'Dashboard' },
]

export default function PackerLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [displayName, setDisplayName] = useState('Packer')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [initials, setInitials] = useState('P')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useSessionGuard()

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))
      setCurrentDate(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)

    const storedDisplayName = localStorage.getItem('displayName')
    if (storedDisplayName) {
      setDisplayName(storedDisplayName)
      setInitials(storedDisplayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2))
    }
    const storedProfileImage = localStorage.getItem('profileImage')
    if (storedProfileImage) setProfileImage(storedProfileImage)

    return () => clearInterval(interval)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null
      if (username) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        })
      }
      ;['authToken','currentUser','isLoggedIn','username','userRole','displayName','sessionId'].forEach(k => localStorage.removeItem(k))
      toast.success('Logged out successfully')
      router.push('/')
    } catch {
      localStorage.clear()
      toast.success('Logged out successfully')
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Left: Brand + Navigation */}
            <div className="flex items-center gap-3 sm:gap-8">
              <div className="flex items-center gap-2 sm:gap-3 pr-3 sm:pr-8 border-r border-slate-200 dark:border-slate-800">
                <img src="/Vertex-icon.png" alt="Vertex" className="h-6 w-auto object-contain dark:hidden" />
                <img src="/Vertex-icon-2.png" alt="Vertex" className="h-6 w-auto object-contain hidden dark:block" />
                <div className="hidden sm:flex flex-col">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none">Welcome back</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-tight">{displayName}</span>
                </div>
                <div className="sm:hidden text-xs font-semibold text-slate-900 dark:text-white">{displayName}</div>
              </div>
              <nav className="flex items-center h-12 sm:h-14">
                {NAV_ITEMS.map(item => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link key={item.href} href={item.href}
                      className={cn(
                        'h-full flex items-center px-2 sm:px-4 text-xs sm:text-sm font-medium transition-colors relative border-b-2',
                        isActive ? 'text-slate-900 dark:text-white border-slate-900 dark:border-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-transparent'
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{currentDate}</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-sm text-slate-900 dark:text-white font-semibold font-mono tabular-nums">{currentTime}</span>
              </div>
              <div className="md:hidden text-xs text-slate-600 dark:text-slate-400 font-mono tabular-nums font-semibold">{currentTime}</div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => window.location.reload()}
                  className="h-9 w-9 p-0 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                  <RefreshCw className="h-[18px] w-[18px]" />
                </Button>
                <ThemeToggle />

                {/* Profile Dropdown */}
                <div className="relative ml-1" ref={dropdownRef}>
                  <button
                    onClick={() => setShowProfileDropdown(v => !v)}
                    className="flex items-center focus:outline-none"
                  >
                    <div className="h-9 w-9 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 ring-2 ring-slate-200 dark:ring-slate-700 hover:ring-4 hover:ring-blue-400 dark:hover:ring-blue-500 transition-all duration-150 cursor-pointer">
                      {profileImage
                        ? <img src={profileImage} alt={displayName} className="w-full h-full object-cover object-center" />
                        : <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{initials}</span>}
                    </div>
                  </button>

                  {/* Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 ring-2 ring-slate-200 dark:ring-slate-700">
                            {profileImage
                              ? <img src={profileImage} alt={displayName} className="w-full h-full object-cover" />
                              : <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{initials}</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{displayName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                              Packer
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="p-1.5">
                        <button
                          onClick={() => { setShowProfileDropdown(false); setShowLogoutDialog(true) }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="h-4 w-4 flex-shrink-0" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-12 sm:pt-14">{children}</main>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                <LogOut className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">Sign Out</AlertDialogTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Packer Account</p>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              You are about to sign out of your Packer account. Any unsaved work will be lost.
            </p>
          </div>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="mt-0 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Stay Signed In</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}