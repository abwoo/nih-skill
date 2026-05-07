"use client"

import * as React from "react"
import type { AppConfig, ModuleId } from "./types"

export type AnalysisResult = {
  id: string
  module: ModuleId
  rawMarkdown: string
  streaming: boolean
  ts: number
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  attachments?: Array<{
    name: string
    type: "pdf" | "text" | "doi" | "url"
    content: string
  }>
}

export type Conversation = {
  id: string
  title: string
  module: ModuleId
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

export type HistoryEntry = {
  id: string
  ts: number
  module: ModuleId
  title: string
  level: string
  verdict: "FULL" | "PARTIAL" | "BLOCKED"
}

export type SkillInfo = {
  name: string
  description: string
  lineCount: number
  charCount: number
  estimatedTokens: number
  referenceFiles: string[]
  loaded: boolean
}

type StoreState = {
  ready: boolean
  config: AppConfig
  module: ModuleId
  settingsOpen: boolean
  darwinOpen: boolean
  skillInfo: SkillInfo
  prefill: string | null
  result: AnalysisResult | null
  history: HistoryEntry[]
  toast: string | null
  conversations: Conversation[]
  currentConversationId: string | null
}

type StoreAction =
  | { type: "SET_READY"; payload: boolean }
  | { type: "SET_CONFIG"; payload: Partial<AppConfig> }
  | { type: "SET_MODULE"; payload: ModuleId }
  | { type: "TOGGLE_SETTINGS" }
  | { type: "SET_SETTINGS_OPEN"; payload: boolean }
  | { type: "TOGGLE_DARWIN" }
  | { type: "SET_DARWIN_OPEN"; payload: boolean }
  | { type: "SET_SKILL_INFO"; payload: Partial<SkillInfo> }
  | { type: "SET_PREFILL"; payload: string | null }
  | { type: "SET_RESULT"; payload: StoreState["result"] }
  | { type: "APPEND_RESULT"; payload: string }
  | { type: "FINISH_RESULT" }
  | { type: "PUSH_HISTORY"; payload: HistoryEntry }
  | { type: "SET_TOAST"; payload: string | null }
  | { type: "ADD_CONVERSATION"; payload: Conversation }
  | { type: "ADD_MESSAGE"; payload: { conversationId: string; message: ChatMessage } }
  | { type: "SET_CURRENT_CONVERSATION"; payload: string | null }
  | { type: "CLEAR_CONVERSATION"; payload: string }
  | { type: "RENAME_CONVERSATION"; payload: { id: string; title: string } }
  | { type: "UPDATE_CONVERSATION_MODULE"; payload: { id: string; module: ModuleId } }
  | { type: "SET_CONVERSATIONS"; payload: Conversation[] }
  | { type: "CLEAR_ALL_CONVERSATIONS" }

const DEFAULT_CONFIG: AppConfig = {
  provider: "openclaw",
  apiKey: "",
  model: "gpt-5.5", // 2026: Updated from gpt-4o-mini to GPT-5.5 Flagship (1M ctx, reasoning, vision)
  temperature: 0.3,
  maxTokens: 16000, // 2026: Increased from 8000 to 16K for better analysis with new models
  stream: true,
  injectSkill: true,
  includeRefs: false,
}

const INITIAL_STATE: StoreState = {
  ready: true,
  config: DEFAULT_CONFIG,
  module: "decompose",
  settingsOpen: false,
  darwinOpen: false,
  skillInfo: { name: "", description: "", lineCount: 0, charCount: 0, estimatedTokens: 0, referenceFiles: [], loaded: false },
  prefill: null,
  result: null,
  history: [],
  toast: null,
  conversations: [],
  currentConversationId: null,
}

const MAX_SAVED_CONVERSATIONS = 50
const CONVERSATIONS_STORAGE_KEY = "bme-conversations"

function reducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "SET_READY":
      return { ...state, ready: action.payload }
    case "SET_CONFIG":
      return { ...state, config: { ...state.config, ...action.payload } }
    case "SET_MODULE":
      return { ...state, module: action.payload }
    case "TOGGLE_SETTINGS":
      return { ...state, settingsOpen: !state.settingsOpen }
    case "SET_SETTINGS_OPEN":
      return { ...state, settingsOpen: action.payload }
    case "TOGGLE_DARWIN":
      return { ...state, darwinOpen: !state.darwinOpen }
    case "SET_DARWIN_OPEN":
      return { ...state, darwinOpen: action.payload }
    case "SET_SKILL_INFO":
      return { ...state, skillInfo: { ...state.skillInfo, ...action.payload } }
    case "SET_PREFILL":
      return { ...state, prefill: action.payload }
    case "SET_RESULT":
      return { ...state, result: action.payload }
    case "APPEND_RESULT":
      if (state.result) {
        return { ...state, result: { ...state.result, rawMarkdown: state.result.rawMarkdown + action.payload } }
      }
      return state
    case "FINISH_RESULT":
      if (state.result) return { ...state, result: { ...state.result, streaming: false } }
      return state
    case "PUSH_HISTORY":
      return { ...state, history: [...state.history.slice(-49), action.payload] }
    case "SET_TOAST":
      return { ...state, toast: action.payload }
    case "ADD_CONVERSATION":
      return { ...state, conversations: [action.payload, ...state.conversations] }
    case "ADD_MESSAGE": {
      const { conversationId, message } = action.payload
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, messages: [...conv.messages, message], updatedAt: Date.now() }
            : conv
        ),
      }
    }
    case "SET_CURRENT_CONVERSATION":
      return { ...state, currentConversationId: action.payload }
    case "CLEAR_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.filter(c => c.id !== action.payload),
        currentConversationId: state.currentConversationId === action.payload ? null : state.currentConversationId,
      }
    case "RENAME_CONVERSATION": {
      const { id, title } = action.payload
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === id ? { ...conv, title, updatedAt: Date.now() } : conv
        ),
      }
    }
    case "UPDATE_CONVERSATION_MODULE": {
      const { id, module } = action.payload
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === id ? { ...conv, module, updatedAt: Date.now() } : conv
        ),
      }
    }
    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload }
    case "CLEAR_ALL_CONVERSATIONS":
      return { ...state, conversations: [], currentConversationId: null }
    default:
      return state
  }
}

const StoreContext = React.createContext<{
  state: StoreState
  dispatch: React.Dispatch<StoreAction>
} | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, INITIAL_STATE)

  // Load config from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("bme-config")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === "object") dispatch({ type: "SET_CONFIG", payload: parsed })
      }
    } catch {}
  }, [])

  // Save config to localStorage whenever it changes
  React.useEffect(() => {
    try { localStorage.setItem("bme-config", JSON.stringify(state.config)) } catch {}
  }, [state.config])

  // Load conversations from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(CONVERSATIONS_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          dispatch({ type: "SET_CONVERSATIONS", payload: parsed })
          // Restore the most recent conversation as current
          if (parsed.length > 0) {
            const sorted = [...parsed].sort((a, b) => b.updatedAt - a.updatedAt)
            dispatch({ type: "SET_CURRENT_CONVERSATION", payload: sorted[0].id })
          }
        }
      }
    } catch {}
  }, [])

  // Save conversations to localStorage whenever they change (with debounce)
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        // Save full attachment content (increased from 500 to 5000 chars)
        const conversationsToSave = state.conversations.slice(0, MAX_SAVED_CONVERSATIONS).map(conv => ({
          id: conv.id,
          title: conv.title,
          module: conv.module,
          messages: conv.messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            // Save more content for better context restoration (5000 chars instead of 500)
            ...(msg.attachments && msg.attachments.length > 0 && {
              attachments: msg.attachments.map(att => ({
                name: att.name,
                type: att.type,
                // Save up to 5000 chars of content (enough for DOI, abstracts, key findings)
                content: att.content?.slice(0, 5000)
              }))
            })
          })),
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        }))
        localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversationsToSave))
      } catch (e) {
        console.warn('Failed to save conversations to localStorage:', e)
      }
    }, 1000) // Debounce 1 second to avoid excessive writes

    return () => clearTimeout(timeoutId)
  }, [state.conversations])

  // Auto-dismiss toast after 3.5 seconds
  React.useEffect(() => {
    if (state.toast) {
      const t = setTimeout(() => dispatch({ type: "SET_TOAST", payload: null }), 3500)
      return () => clearTimeout(t)
    }
  }, [state.toast])

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = React.useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within a StoreProvider")
  const { state, dispatch } = ctx

  return {
    ...state,
    setReady: (v: boolean) => dispatch({ type: "SET_READY", payload: v }),
    setConfig: (c: Partial<AppConfig>) => dispatch({ type: "SET_CONFIG", payload: c }),
    setModule: (m: ModuleId) => dispatch({ type: "SET_MODULE", payload: m }),
    toggleSettings: () => dispatch({ type: "TOGGLE_SETTINGS" }),
    setSettingsOpen: (o: boolean) => dispatch({ type: "SET_SETTINGS_OPEN", payload: o }),
    toggleDarwin: () => dispatch({ type: "TOGGLE_DARWIN" }),
    setDarwinOpen: (o: boolean) => dispatch({ type: "SET_DARWIN_OPEN", payload: o }),
    setSkillInfo: (i: Partial<SkillInfo>) => dispatch({ type: "SET_SKILL_INFO", payload: i }),
    prefillFor: (m: ModuleId, p: string) => { dispatch({ type: "SET_MODULE", payload: m }); dispatch({ type: "SET_PREFILL", payload: p }) },
    consumePrefill: () => { const v = state.prefill; dispatch({ type: "SET_PREFILL", payload: null }); return v },
    setResult: (r: StoreState["result"]) => dispatch({ type: "SET_RESULT", payload: r }),
    appendResult: (t: string) => dispatch({ type: "APPEND_RESULT", payload: t }),
    finishResult: () => dispatch({ type: "FINISH_RESULT" }),
    pushHistory: (e: HistoryEntry) => dispatch({ type: "PUSH_HISTORY", payload: e }),
    showToast: (msg: string) => dispatch({ type: "SET_TOAST", payload: msg }),

    // ============================================
    // ChatGPT-style Conversation Management
    // ============================================

    /**
     * Create a new conversation
     * @param module - The analysis module for this conversation
     * @param title - Optional custom title (auto-generated if not provided)
     */
    createNewConversation: (module?: ModuleId, title?: string) => {
      const id = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newConv: Conversation = {
        id,
        title: title || 'New Conversation',
        module: module || state.module,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      dispatch({ type: "ADD_CONVERSATION", payload: newConv })
      dispatch({ type: "SET_CURRENT_CONVERSATION", payload: id })

      // Clear previous analysis results when starting new conversation
      dispatch({ type: "SET_RESULT", payload: null })

      return id
    },

    /**
     * Add a message to an existing conversation
     * @param conversationId - Target conversation ID
     * @param message - Message object
     */
    addMessage: (conversationId: string, message: ChatMessage) => {
      dispatch({ type: "ADD_MESSAGE", payload: { conversationId, message } })
    },

    /**
     * Switch to a different conversation
     * @param id - Conversation ID to switch to
     */
    switchConversation: (id: string | null) => {
      dispatch({ type: "SET_CURRENT_CONVERSATION", payload: id })

      // Load the conversation's module and clear results
      if (id) {
        const conv = state.conversations.find(c => c.id === id)
        if (conv) {
          dispatch({ type: "SET_MODULE", payload: conv.module })
          dispatch({ type: "SET_RESULT", payload: null })
        }
      }
    },

    /**
     * Delete a specific conversation
     * @param id - Conversation ID to delete
     */
    deleteConversation: (id: string) => {
      dispatch({ type: "CLEAR_CONVERSATION", payload: id })
    },

    /**
     * Rename a conversation
     * @param id - Conversation ID to rename
     * @param newTitle - New title for the conversation
     */
    renameConversation: (id: string, newTitle: string) => {
      dispatch({ type: "RENAME_CONVERSATION", payload: { id, title: newTitle } })
    },

    /**
     * Update the module of a conversation
     * @param id - Conversation ID
     * @param module - New module ID
     */
    updateConversationModule: (id: string, module: ModuleId) => {
      dispatch({ type: "UPDATE_CONVERSATION_MODULE", payload: { id, module } })
    },

    /**
     * Delete all conversations (clear chat history)
     */
    clearAllConversations: () => {
      dispatch({ type: "CLEAR_ALL_CONVERSATIONS" })
      dispatch({ type: "SET_RESULT", payload: null })
    },

    /**
     * Auto-generate conversation title from first user message
     * @param conversationId - Target conversation ID
     * @param firstMessage - First user message content
     */
    autoGenerateTitle: (conversationId: string, firstMessage: string) => {
      // Generate a concise title from the first ~50 chars of the message
      let title = firstMessage.trim()
        .replace(/\n/g, ' ')           // Remove newlines
        .replace(/\s+/g, ' ')         // Collapse whitespace
        .slice(0, 60)                 // Take first 60 chars

      // Add ellipsis if truncated
      if (firstMessage.length > 60) {
        title += '...'
      }

      dispatch({ type: "RENAME_CONVERSATION", payload: { id: conversationId, title } })
    },

    // Helper methods

    /**
     * Get the currently active conversation object
     */
    getCurrentConversation: (): Conversation | null => {
      if (!state.currentConversationId) return null
      return state.conversations.find(c => c.id === state.currentConversationId) || null
    },

    /**
     * Get all conversations sorted by updatedAt (most recent first)
     */
    getSortedConversations: (): Conversation[] => {
      return [...state.conversations].sort((a, b) => b.updatedAt - a.updatedAt)
    },

    /**
     * Get messages for the current conversation
     */
    getCurrentMessages: (): ChatMessage[] => {
      if (!state.currentConversationId) return []
      const conv = state.conversations.find(c => c.id === state.currentConversationId)
      return conv?.messages || []
    },

    /**
     * Check if there's an active conversation
     */
    hasActiveConversation: (): boolean => {
      return !!state.currentConversationId
    },

    /**
     * Get conversation count
     */
    getConversationCount: (): number => {
      return state.conversations.length
    },
  }
}
