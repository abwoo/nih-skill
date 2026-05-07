'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, FileText, Database, Cpu, Settings, MessageSquare, BookOpen } from 'lucide-react'
import { cn } from '@/lib/logger' ? {} : { cn: (a: string, b: string) => a }

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  action: () => void
  category?: string
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const categories = [
  { id: 'navigation', label: 'Navigation' },
  { id: 'actions', label: 'Actions' },
  { id: 'tools', label: 'Tools' },
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const getItems = useCallback((): CommandItem[] => {
    const baseItems: CommandItem[] = [
      {
        id: 'new-chat',
        title: 'New Chat',
        description: 'Start a new conversation',
        icon: <MessageSquare className="h-4 w-4" />,
        action: () => { window.location.href = '/' },
        category: 'actions',
      },
      {
        id: 'search-papers',
        title: 'Search Papers',
        description: 'Search academic literature',
        icon: <Search className="h-4 w-4" />,
        action: () => {},
        category: 'tools',
      },
      {
        id: 'parse-pdf',
        title: 'Parse PDF',
        description: 'Upload and analyze a PDF',
        icon: <FileText className="h-4 w-4" />,
        action: () => {},
        category: 'tools',
      },
      {
        id: 'datasets',
        title: 'Browse Datasets',
        description: 'Explore biomedical datasets',
        icon: <Database className="h-4 w-4" />,
        action: () => {},
        category: 'tools',
      },
      {
        id: 'skill-engine',
        title: 'SKILL Engine',
        description: 'Execute research protocols',
        icon: <Cpu className="h-4 w-4" />,
        action: () => {},
        category: 'tools',
      },
      {
        id: 'references',
        title: 'Reference Manager',
        description: 'Manage your references',
        icon: <BookOpen className="h-4 w-4" />,
        action: () => { window.location.href = '/reference-manager' },
        category: 'navigation',
      },
      {
        id: 'settings',
        title: 'Settings',
        description: 'Configure API keys and preferences',
        icon: <Settings className="h-4 w-4" />,
        action: () => {},
        category: 'navigation',
      },
    ]

    if (!search.trim()) return baseItems

    return baseItems.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const items = getItems()

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          items[selectedIndex]?.action()
          onOpenChange(false)
          setSearch('')
          break
        case 'Escape':
          e.preventDefault()
          onOpenChange(false)
          setSearch('')
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, items, selectedIndex, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-lg rounded-lg border border-border bg-background shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-2 text-xs text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No results found for &quot;{search}&quot;
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((cat) => {
                const catItems = items.filter((item) => item.category === cat.id)
                if (catItems.length === 0) return null

                return (
                  <div key={cat.id}>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {cat.label}
                    </div>
                    {catItems.map((item, index) => {
                      const globalIndex = items.indexOf(item)
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            item.action()
                            onOpenChange(false)
                            setSearch('')
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 rounded-md px-2 py-2 text-left transition-colors',
                            globalIndex === selectedIndex
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <span className="shrink-0">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{item.title}</div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5">↑↓</kbd>
            <span>navigate</span>
            <kbd className="inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5">↵</kbd>
            <span>select</span>
          </div>
          <span>Cmd+K to open</span>
        </div>
      </div>
    </div>
  )
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { open, setOpen }
}
