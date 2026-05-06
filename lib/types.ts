export type ModuleId = "decompose" | "compare" | "reproduce" | "paradigm" | "evidence" | "datasets"

export type ProviderId = string

export type ProviderMeta = {
  id: string
  name: string
  icon?: string
  symbol?: string
  short?: string
  recommended?: boolean
  freeTier?: boolean
  description?: string
  keyLabel?: string
  keyPlaceholder?: string
  helperUrl?: string
  helperLabel?: string
  warning?: string
  baseUrl?: string
  models: Array<{
    id: string
    label: string
    context: string
    tags?: string[]
    recommended?: boolean
  }>
}

export type IntentTag =
  | "QUICK_READ"
  | "EVIDENCE_VERIFY"
  | "EXPERIMENT_REPRODUCE"
  | "METHOD_COMPARE"
  | "RESEARCH_IDEATION"
  | "DATASET_MATCH"

export interface AppConfig {
  provider: string | null
  apiKey: string
  model: string
  customModel?: string
  temperature: number
  maxTokens: number
  stream: boolean
  injectSkill: boolean
  includeRefs: boolean
  baseUrl?: string
  deployment?: string
}

export interface AnalysisRecord {
  id: string
  ts: number
  module: ModuleId
  title: string
  level: string
  verdict: "FULL" | "PARTIAL" | "BLOCKED"
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

export interface Attachment {
  id: string
  name: string
  type: "pdf" | "text" | "doi" | "url"
  size: number
  content: string
  pages?: number
}
