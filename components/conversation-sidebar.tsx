"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useStore } from "@/lib/store"
import type { ModuleId } from "@/lib/types"
import {
  AlertTriangle,
  Check,
  Clock,
  Database,
  Edit3,
  FileText,
  GitCompareArrows,
  MessageSquare,
  MoreHorizontal,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  PlayCircle,
  Plus,
  ShieldCheck,
  Trash2,
  X
} from "lucide-react"
import * as React from "react"

const MODULE_ICONS: Record<ModuleId, React.ReactNode> = {
  decompose: <FileText className="h-4 w-4" />,
  compare: <GitCompareArrows className="h-4 w-4" />,
  reproduce: <PlayCircle className="h-4 w-4" />,
  paradigm: <Network className="h-4 w-4" />,
  evidence: <ShieldCheck className="h-4 w-4" />,
  datasets: <Database className="h-4 w-4" />,
}

const MODULE_COLORS: Record<ModuleId, string> = {
  decompose: "text-blue-500",
  compare: "text-green-500",
  reproduce: "text-purple-500",
  paradigm: "text-orange-500",
  evidence: "text-red-500",
  datasets: "text-cyan-500",
}

function formatTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60 * 1000) return 'Just now'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d ago`

  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface ConversationSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function ConversationSidebar({ isOpen, onToggle }: ConversationSidebarProps) {
  const {
    conversations,
    currentConversationId,
    getSortedConversations,
    createNewConversation,
    switchConversation,
    deleteConversation,
    renameConversation,
    clearAllConversations,
    getConversationCount,
    module,
    setModule,
    showToast,
    getCurrentMessages,
  } = useStore()

  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editTitle, setEditTitle] = React.useState("")
  const [showClearDialog, setShowClearDialog] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState<string | null>(null)

  // Get sorted conversations for display (reactive to changes)
  const sortedConversations = React.useMemo(() => getSortedConversations(), [conversations])

  // Track conversation count for reactivity
  const convCount = conversations.length

  const handleCreateNew = () => {
    // Create new conversation with CURRENT module (not stale closure)
    const newId = createNewConversation(module)

    // Force sync the module state immediately after creation
    setTimeout(() => {
      showToast(`✨ New ${module} conversation created`)
    }, 50)
  }

  const handleSwitchConversation = (id: string) => {
    if (id === currentConversationId) return

    // Switch and sync module
    switchConversation(id)

    // Find the target conversation to sync its module
    const targetConv = conversations.find(c => c.id === id)
    if (targetConv && targetConv.module !== module) {
      setModule(targetConv.module as ModuleId)
    }
  }

  const handleStartRename = (convId: string, currentTitle: string) => {
    console.log('[ConversationSidebar] ✏️ Start rename for:', convId, 'current title:', currentTitle)
    setEditingId(convId)
    setEditTitle(currentTitle === 'New Conversation' ? '' : currentTitle)

    // Auto-focus input after state update
    setTimeout(() => {
      const input = document.querySelector(`#rename-input-${convId}`) as HTMLInputElement
      if (input) {
        input.focus()
        input.select()
      }
    }, 50)
  }

  const handleConfirmRename = () => {
    if (!editingId) {
      console.error('[ConversationSidebar] ❌ No conversation ID for rename')
      return
    }

    if (!editTitle.trim()) {
      console.warn('[ConversationSidebar] ⚠️ Empty title, canceling rename')
      showToast("⚠️ Title cannot be empty")
      return
    }

    try {
      console.log('[ConversationSidebar] ✏️ Confirming rename:', editingId, '→', editTitle.trim())
      renameConversation(editingId, editTitle.trim())
      showToast("📝 Conversation renamed")
      setEditingId(null)
      setEditTitle("")
      console.log('[ConversationSidebar] ✅ Rename successful')
    } catch (error) {
      console.error('[ConversationSidebar] ❌ Rename failed:', error)
      showToast("❌ Failed to rename conversation")
      setEditingId(null)
      setEditTitle("")
    }
  }

  const handleCancelRename = () => {
    setEditingId(null)
    setEditTitle("")
  }

  const handleDeleteClick = (convId: string) => {
    console.log('[ConversationSidebar] 🗑️ Delete clicked for:', convId)

    // 🔧 CRITICAL FIX: Use setTimeout to avoid DropdownMenu/Dialog timing conflict
    // When clicking a DropdownMenuItem, the menu closes first, which can interfere
    // with Dialog opening. Delaying ensures clean state transition.
    setTimeout(() => {
      console.log('[ConversationSidebar] 🗑️ Opening delete dialog for:', convId)
      setShowDeleteDialog(convId)
    }, 50)  // 50ms delay - enough for DropdownMenu to close
  }

  const handleConfirmDelete = () => {
    if (!showDeleteDialog) {
      console.error('[ConversationSidebar] ❌ No conversation ID for delete')
      return
    }

    const deletedId = showDeleteDialog
    console.log('[ConversationSidebar] 🗑️ Confirming delete for:', deletedId)

    try {
      // Check if deleting current conversation
      const isCurrentConversation = deletedId === currentConversationId
      console.log('[ConversationSidebar] 📋 Is current conversation:', isCurrentConversation)

      // Perform deletion
      deleteConversation(deletedId)
      console.log('[ConversationSidebar] ✅ Delete dispatch successful')

      showToast("🗑️ Conversation deleted")
      setShowDeleteDialog(null)

      // If we deleted the current conversation, create a new one with current module
      if (isCurrentConversation) {
        console.log('[ConversationSidebar] 🔄 Creating new conversation after delete...')
        setTimeout(() => {
          const newId = createNewConversation(module)
          console.log('[ConversationSidebar] ✅ New conversation created:', newId)
        }, 100)
      }
    } catch (error) {
      console.error('[ConversationSidebar] ❌ Delete failed:', error)
      showToast("❌ Failed to delete conversation")
      setShowDeleteDialog(null)
    }
  }

  const handleClearAll = () => {
    clearAllConversations()
    setShowClearDialog(false)
    showToast("🧹 All conversations cleared")
    setTimeout(() => {
      createNewConversation(module)
    }, 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirmRename()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelRename()
    }
  }

  return (
    <>
      {/* Sidebar Container */}
      <div
        className={`
          relative flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm
          transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? 'w-[280px]' : 'w-0'}
        `}
        style={{ minWidth: isOpen ? '280px' : '0' }}
      >
        {/* Header with Collapse Button */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
            Conversations ({convCount})
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateNew}
              className="h-7 w-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
              title="New conversation"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-7 w-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {convCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">No conversations yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  Start analyzing papers to create your first conversation
                </p>
                <Button
                  onClick={handleCreateNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Conversation
                </Button>
              </div>
            ) : (
              sortedConversations.map((conv) => (
                <div
                  key={conv.id}
                  data-conversation-id={conv.id}
                  className={`
                    group relative rounded-lg transition-all duration-150 cursor-pointer border
                    ${conv.id === currentConversationId
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 shadow-sm'
                      : 'bg-white dark:bg-gray-800 border-transparent hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }
                  `}
                  onClick={() => handleSwitchConversation(conv.id)}
                >
                  <div className="flex items-start gap-2.5 p-2.5">
                    {/* Module Icon */}
                    <div className={`mt-0.5 shrink-0 ${MODULE_COLORS[conv.module]}`}>
                      {MODULE_ICONS[conv.module]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {editingId === conv.id ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Input
                            id={`rename-input-${conv.id}`}
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter title..."
                            className="h-7 text-sm px-2.5 py-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded hover:bg-green-100 dark:hover:bg-green-900"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleConfirmRename()
                            }}
                          >
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded hover:bg-red-100 dark:hover:bg-red-900"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCancelRename()
                            }}
                          >
                            <X className="h-3.5 w-3.5 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className={`text-sm font-medium truncate pr-5 ${
                            conv.id === currentConversationId
                              ? 'text-blue-900 dark:text-blue-100'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {conv.title || 'Untitled'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatTime(conv.updatedAt)}
                            </span>
                            <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium ${
                              conv.id === currentConversationId
                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              {conv.module}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Action Menu - Only show when not editing */}
                    {editingId !== conv.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`
                              absolute top-2 right-2 h-6 w-6 p-0 rounded-md transition-all duration-150
                              ${conv.id === currentConversationId
                                ? 'opacity-100 bg-blue-100/50 hover:bg-blue-200/70 dark:hover:bg-blue-800/50'
                                : 'opacity-0 group-hover:opacity-100 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                              }
                            `}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartRename(conv.id, conv.title)
                            }}
                            className="rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Edit3 className="h-4 w-4 mr-2.5 text-gray-500" />
                            <span>Rename</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteClick(conv.id)
                            }}
                            className="rounded-md px-3 py-2 text-sm cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2.5" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer - Clear All Button */}
        {convCount > 0 && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md h-8 text-sm font-medium"
              onClick={() => setShowClearDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Conversations
            </Button>
          </div>
        )}
      </div>

      {/* Collapsed Toggle Button (when sidebar is closed) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="
            fixed left-0 top-1/2 -translate-y-1/2 z-30
            h-10 w-6 grid place-items-center rounded-r-lg
            bg-white dark:bg-gray-800 border border-l-0 border-gray-200 dark:border-gray-700
            hover:bg-gray-100 dark:hover:bg-gray-700
            shadow-md transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          aria-label="Expand conversation sidebar"
          title="Show conversations"
        >
          <PanelLeftOpen className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
      )}

      {/* Delete Confirmation Modal - CUSTOM IMPLEMENTATION (NO RADIX) */}
      {showDeleteDialog && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              console.log('[ConversationSidebar] Clicked overlay, closing dialog')
              setShowDeleteDialog(null)
            }
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex flex-col gap-2 pb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                Delete Conversation?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                This will permanently delete this conversation and all its messages.
                This action cannot be undone.
              </p>
            </div>

            {/* Show which conversation is being deleted */}
            {(() => {
              const conv = conversations.find(c => c.id === showDeleteDialog)
              return conv ? (
                <div className="my-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {conv.title || 'Untitled'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                    Module: {conv.module} • {formatTime(conv.updatedAt)}
                  </p>
                </div>
              ) : null
            })()}

            {/* Footer Buttons */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4">
              <button
                onClick={() => {
                  console.log('[ConversationSidebar] Cancel clicked')
                  setShowDeleteDialog(null)
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('[ConversationSidebar] Confirm delete clicked')
                  handleConfirmDelete()
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal - CUSTOM IMPLEMENTATION (NO RADIX) */}
      {showClearDialog && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowClearDialog(false)
            }
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex flex-col gap-2 pb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                Clear All Conversations?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                This will permanently delete all conversations and their messages.
                This action cannot be undone.
              </p>
            </div>

            {/* Warning Info */}
            <div className="my-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                You have {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} that will be deleted.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4">
              <button
                onClick={() => setShowClearDialog(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
