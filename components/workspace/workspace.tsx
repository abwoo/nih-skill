"use client"

import * as React from "react"
import { LeftSidebar } from "./left-sidebar"
import { RightSidebar } from "./right-sidebar"
import { CenterPanel } from "./center-panel"
import { ConversationSidebar } from "@/components/conversation-sidebar"
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

type SidebarState = {
  leftOpen: boolean
  rightOpen: boolean
  conversationOpen: boolean
}

type SidebarAction =
  | { type: 'TOGGLE_LEFT' }
  | { type: 'TOGGLE_RIGHT' }
  | { type: 'TOGGLE_CONVERSATION' }
  | { type: 'SET_LEFT'; payload: boolean }
  | { type: 'SET_RIGHT'; payload: boolean }
  | { type: 'SET_CONVERSATION'; payload: boolean }

function sidebarReducer(state: SidebarState, action: SidebarAction): SidebarState {
  switch (action.type) {
    case 'TOGGLE_LEFT': return { ...state, leftOpen: !state.leftOpen }
    case 'TOGGLE_RIGHT': return { ...state, rightOpen: !state.rightOpen }
    case 'TOGGLE_CONVERSATION': return { ...state, conversationOpen: !state.conversationOpen }
    case 'SET_LEFT': return { ...state, leftOpen: action.payload }
    case 'SET_RIGHT': return { ...state, rightOpen: action.payload }
    case 'SET_CONVERSATION': return { ...state, conversationOpen: action.payload }
    default: return state
  }
}

const INITIAL_STATE: SidebarState = {
  leftOpen: true,
  rightOpen: true,
  conversationOpen: true, // Show conversation sidebar by default (ChatGPT-style)
}

interface WorkspaceProps {
  decorative?: boolean
  className?: string
}

export function Workspace({ decorative = false, className }: WorkspaceProps) {
  const [sidebarState, dispatch] = React.useReducer(sidebarReducer, INITIAL_STATE)
  
  const handleToggleLeft = React.useCallback(() => dispatch({ type: 'TOGGLE_LEFT' }), [])
  const handleToggleRight = React.useCallback(() => dispatch({ type: 'TOGGLE_RIGHT' }), [])
  const handleToggleConversation = React.useCallback(() => dispatch({ type: 'TOGGLE_CONVERSATION' }), [])

  // 键盘导航处理器
  const handleKeyDownLeft = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggleLeft()
    }
  }, [handleToggleLeft])

  const handleKeyDownRight = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggleRight()
    }
  }, [handleToggleRight])

  const handleKeyDownConversation = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggleConversation()
    }
  }, [handleToggleConversation])

  return (
    <div className={cn("flex w-full", className)} role="main" aria-label="Workspace layout">
      {/* Conversation Sidebar - ChatGPT style (leftmost) */}
      <aside
        data-tour="conversation-sidebar"
        className={cn(
          "shrink-0 border-r border-border bg-gray-50 dark:bg-gray-900 transition-all duration-300 ease-in-out",
          sidebarState.conversationOpen ? "w-[280px]" : "w-0 overflow-hidden",
          decorative && "pointer-events-none opacity-50",
        )}
        aria-label="Conversation sidebar - Chat history"
      >
        <ConversationSidebar 
          isOpen={sidebarState.conversationOpen} 
          onToggle={handleToggleConversation}
        />
        
        {/* Toggle button when collapsed */}
        {!sidebarState.conversationOpen && (
          <button
            onClick={handleToggleConversation}
            onKeyDown={handleKeyDownConversation}
            className={cn(
              "fixed left-0 top-1/2 -translate-y-1/2 h-10 w-6 grid place-items-center rounded-r-lg",
              "border border-l-0 border-border bg-card hover:bg-secondary z-20",
              "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50",
              "active:scale-95 shadow-md"
            )}
            aria-label="Expand conversation sidebar"
            title="Show conversations"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        )}
      </aside>

      {/* Left sidebar - Module selection */}
      <aside
        data-tour="left-sidebar"
        className={cn(
          "shrink-0 border-r border-border bg-sidebar/60 transition-all duration-200 ease-in-out",
          sidebarState.leftOpen ? "w-[220px]" : "w-[44px]",
          decorative && "pointer-events-none opacity-50",
        )}
        aria-label="Left sidebar - Quick reference"
      >
        <div className="h-full relative">
          {sidebarState.leftOpen ? (
            <LeftSidebar />
          ) : (
            <div 
              className="p-2 text-[10px] text-muted-foreground font-mono [writing-mode:vertical-rl] tracking-widest pt-6 select-none"
              aria-hidden="true"
            >
              QUICK REFERENCE
            </div>
          )}
          
          <button
            onClick={handleToggleLeft}
            onKeyDown={handleKeyDownLeft}
            className={cn(
              "absolute -right-3 top-4 h-6 w-6 grid place-items-center rounded-full",
              "border border-border bg-card hover:bg-secondary z-10",
              "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50",
              "active:scale-95"
            )}
            aria-label={sidebarState.leftOpen ? "Collapse left sidebar" : "Expand left sidebar"}
            aria-expanded={sidebarState.leftOpen}
            title={sidebarState.leftOpen ? "Collapse" : "Expand"}
          >
            {sidebarState.leftOpen ? <PanelLeftClose className="h-3 w-3" /> : <PanelLeftOpen className="h-3 w-3" />}
          </button>
        </div>
      </aside>

      {/* Center panel */}
      <div
        data-tour="center-panel"
        className="flex-1 min-w-0"
        role="region"
        aria-label="Main content area"
      >
        <CenterPanel decorative={decorative} />
      </div>

      {/* Right sidebar - hidden on small screens, visible on large screens */}
      <aside
        data-tour="right-sidebar"
        className={cn(
          "shrink-0 border-l border-border bg-sidebar/60 transition-all duration-200 ease-in-out",
          sidebarState.rightOpen ? "w-[260px]" : "w-[44px]",
          decorative && "pointer-events-none opacity-50",
          "hidden md:block lg:block"
        )}
        aria-label="Right sidebar - Session & tools"
      >
        <div className="h-full relative">
          <button
            onClick={handleToggleRight}
            onKeyDown={handleKeyDownRight}
            className={cn(
              "absolute -left-3 top-4 h-6 w-6 grid place-items-center rounded-full",
              "border border-border bg-card hover:bg-secondary z-10",
              "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50",
              "active:scale-95"
            )}
            aria-label={sidebarState.rightOpen ? "Collapse right sidebar" : "Expand right sidebar"}
            aria-expanded={sidebarState.rightOpen}
            title={sidebarState.rightOpen ? "Collapse" : "Expand"}
          >
            {sidebarState.rightOpen ? <PanelRightClose className="h-3 w-3" /> : <PanelRightOpen className="h-3 w-3" />}
          </button>
          
          {sidebarState.rightOpen ? (
            <RightSidebar />
          ) : (
            <div 
              className="p-2 text-[10px] text-muted-foreground font-mono [writing-mode:vertical-rl] tracking-widest pt-6 select-none"
              aria-hidden="true"
            >
              SESSION & TOOLS
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
