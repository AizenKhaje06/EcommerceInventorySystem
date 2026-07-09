'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Package, ShoppingCart, Users, MessageCircle, FileText, Loader2, Command } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  type: 'product' | 'order' | 'customer' | 'chat' | 'contact'
  title: string
  subtitle?: string
  description?: string
  link: string
  icon?: React.ReactNode
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Search functionality with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const debounceTimer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
        setSelectedIndex(0)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      navigateToResult(results[selectedIndex])
    }
  }

  const navigateToResult = (result: SearchResult) => {
    router.push(result.link)
    setIsOpen(false)
    setQuery('')
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'product': return <Package className="h-4 w-4" />
      case 'order': return <ShoppingCart className="h-4 w-4" />
      case 'customer': return <Users className="h-4 w-4" />
      case 'chat': return <MessageCircle className="h-4 w-4" />
      case 'contact': return <FileText className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
      case 'order': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
      case 'customer': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
      case 'chat': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
      case 'contact': return 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
    }
  }

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products, orders, customers..."
                  className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-[400px] overflow-y-auto">
                {query.trim() === '' ? (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Type to search across products, orders, and more</p>
                    <p className="text-xs mt-2 text-slate-400 dark:text-slate-500">
                      Use <kbd className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded">↑↓</kbd> to navigate, 
                      <kbd className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded ml-1">Enter</kbd> to select
                    </p>
                  </div>
                ) : results.length === 0 && !loading ? (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No results found for "{query}"</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {results.map((result, index) => (
                      <button
                        key={result.id}
                        onClick={() => navigateToResult(result)}
                        className={cn(
                          'w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left',
                          index === selectedIndex && 'bg-slate-100 dark:bg-slate-800'
                        )}
                      >
                        <div className={cn('flex-shrink-0 p-2 rounded-lg', getTypeColor(result.type))}>
                          {getIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {result.title}
                            </p>
                            <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">
                              {result.type}
                            </span>
                          </div>
                          {result.subtitle && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {result.subtitle}
                            </p>
                          )}
                          {result.description && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">
                              {result.description}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-4">
                    <span>
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded">↑↓</kbd> Navigate
                    </span>
                    <span>
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded">Enter</kbd> Select
                    </span>
                    <span>
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded">Esc</kbd> Close
                    </span>
                  </div>
                  <span>{results.length} results</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
