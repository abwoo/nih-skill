"use client"

import { MarkdownRenderer } from "@/components/workspace/markdown-renderer"
import { cn } from "@/lib/utils"
import {
  Bot,
  Brain,
  Check,
  ChevronDown, ChevronUp,
  Copy,
  Database,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  Target,
  ThumbsDown,
  ThumbsUp,
  User,
  Zap
} from "lucide-react"
import * as React from "react"

// DSML Tag Filter - Remove all DeepSeek Markup Language tags from content
function filterDSMLTags(content: string): string {
  if (!content) return content

  // Remove complete DSML tool call blocks
  let filtered = content

  // Pattern 1: <｜｜DSML｜｜tool_calls> ... </｜｜DSML｜｜tool_calls>
  filtered = filtered.replace(/<｜｜DSML｜｜tool_calls>[\s\S]*?<\/｜｜DSML｜｜tool_calls>/gi, '')

  // Pattern 2: Individual invoke blocks <｜｜DSML｜｜invoke ...> ... </｜｜DSML｜｜invoke>
  filtered = filtered.replace(/<｜｜DSML｜｜invoke[^>]*>[\s\S]*?<\/｜｜DSML｜｜invoke>/gi, '')

  // Pattern 3: Parameter tags <｜｜DSML｜｜parameter ...>
  filtered = filtered.replace(/<｜｜DSML｜｜parameter[^>]*\/?>/gi, '')

  // Pattern 4: Any remaining DSML tags
  filtered = filtered.replace(/<｜｜DSML｜｜[^>]*>/gi, '')

  // Clean up extra whitespace and newlines left by removed tags
  filtered = filtered.replace(/\n{3,}/g, '\n\n')
  filtered = filtered.trim()

  return filtered
}

// Types for Agent messages
export interface AgentMessage {
  id: string
  role: "user" | "assistant" | "system" | "tool"
  content: string
  timestamp: Date
  metadata?: {
    model?: string
    provider?: string
    tokens?: number
    latency?: number
    toolName?: string
    toolInput?: string
    toolOutput?: string
    citations?: Array<{ doi: string; title: string }>
    references?: string[]
    confidence?: number // 0-1
    innovationLevel?: string // L1-L5c
    fatalBlockers?: string[] // FB-1 to FB-11
    clinicalValidation?: string // V0-V5
  }
  isLoading?: boolean
  isError?: boolean
}

interface MessageCardProps {
  message: AgentMessage
  onCopy?: (content: string) => void
  onRetry?: (messageId: string) => void
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void
  isStreaming?: boolean
}

// User Message Component (Right-aligned, like ChatGPT)
export function UserMessageCard({ message }: { message: AgentMessage }) {
  return (
    <div className="flex justify-end mb-4 group">
      <div className="max-w-[85%] lg:max-w-[75%]">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
          {/* User Avatar */}
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">You</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {formatTime(message.timestamp)}
            </span>
          </div>

          {/* User Content */}
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>

          {/* Attachments indicator */}
          {message.content.length > 500 && (
            <div className="mt-2 pt-2 border-t border-primary/10 flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>{Math.round(message.content.length / 4)} characters</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Assistant Message Component (Left-aligned with avatar)
export function AssistantMessageCard({
  message,
  onCopy,
  onRetry,
  onFeedback,
  isStreaming = false
}: MessageCardProps) {
  const [copied, setCopied] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)
  const [feedback, setFeedback] = React.useState<'positive' | 'negative' | null>(null)

  const handleCopy = React.useCallback(async () => {
    if (onCopy && message.content) {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onCopy?.(message.content)
    }
  }, [message.content, onCopy])

  const handleFeedback = React.useCallback((type: 'positive' | 'negative') => {
    setFeedback(type)
    onFeedback?.(message.id, type)
  }, [message.id, onFeedback])

  return (
    <div className="flex justify-start mb-4 group">
      <div className="max-w-[85%] lg:max-w-[80%]">
        <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          {/* Header: Avatar + Info */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-violet flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  BME Research Agent
                </span>

                {/* Model badge */}
                {message.metadata?.model && (
                  <span className="px-1.5 py-0.5 rounded-full bg-secondary text-[9px] font-mono text-muted-foreground">
                    {message.metadata.model}
                  </span>
                )}

                {/* Streaming indicator */}
                {isStreaming && (
                  <span className="flex items-center gap-1 text-xs text-primary animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Thinking...
                  </span>
                )}
              </div>

              {/* Metadata row */}
              {(message.metadata?.latency || message.metadata?.tokens) && (
                <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                  {message.metadata.latency && (
                    <span>⚡ {message.metadata.latency}ms</span>
                  )}
                  {message.metadata.tokens && (
                    <span>📝 ~{message.metadata.tokens} tokens</span>
                  )}
                  <span>{formatTime(message.timestamp)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - with DSML filtering and Markdown rendering */}
          <div className="text-sm text-foreground leading-relaxed">
            {isStreaming ? (
              // Streaming mode: Show filtered content with cursor
              <>
                <div className="whitespace-pre-wrap">
                  {filterDSMLTags(message.content)}
                </div>
                <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-1" />
              </>
            ) : (
              // Completed mode: Render with Markdown (after DSML filtering)
              message.content ? (
                <MarkdownRenderer
                  markdown={filterDSMLTags(message.content)}
                  className="prose-p:text-foreground/90 prose-headings:text-foreground"
                />
              ) : (
                <span className="text-muted-foreground italic">No response generated</span>
              )
            )}
          </div>

          {/* Expandable Metadata Panel */}
          {message.metadata && !isStreaming && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                Analysis Details
                {message.metadata.citations && ` • ${message.metadata.citations.length} citations`}
                {message.metadata.fatalBlockers && ` • ${message.metadata.fatalBlockers.length} blockers`}
              </button>

              {expanded && (
                <div className="mt-2 space-y-2 p-2 bg-secondary/30 rounded-lg">
                  {/* Innovation Level */}
                  {message.metadata.innovationLevel && (
                    <div className="flex items-center gap-2">
                      <Target className="h-3.5 w-3.5 text-warning" />
                      <span className="text-[11px] font-medium">Innovation:</span>
                      <span className="px-1.5 py-0.5 rounded bg-warning/20 text-[10px] font-mono text-warning">
                        {message.metadata.innovationLevel}
                      </span>
                      {message.metadata.confidence && (
                        <span className="text-[10px] text-muted-foreground">
                          ({Math.round(message.metadata.confidence * 100)}% confidence)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Fatal Blockers */}
                  {message.metadata.fatalBlockers && message.metadata.fatalBlockers.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-danger" />
                        <span className="text-[11px] font-medium">Fatal Blockers:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {message.metadata.fatalBlockers.map((fb, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-danger/20 text-[10px] font-mono text-danger">
                            {fb}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clinical Validation */}
                  {message.metadata.clinicalValidation && (
                    <div className="flex items-center gap-2">
                      <Database className="h-3.5 w-3.5 text-success" />
                      <span className="text-[11px] font-medium">Clinical Validation:</span>
                      <span className="px-1.5 py-0.5 rounded bg-success/20 text-[10px] font-mono text-success">
                        V{message.metadata.clinicalValidation.replace('V', '')}
                      </span>
                    </div>
                  )}

                  {/* Citations */}
                  {message.metadata.citations && message.metadata.citations.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Search className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[11px] font-medium">Citations ({message.metadata.citations.length}):</span>
                      </div>
                      <div className="max-h-24 overflow-y-auto space-y-0.5">
                        {message.metadata.citations.slice(0, 5).map((cit, i) => (
                          <div key={i} className="text-[10px] text-muted-foreground truncate font-mono">
                            {cit.title}
                          </div>
                        ))}
                        {message.metadata.citations.length > 5 && (
                          <div className="text-[10px] text-muted-foreground italic">
                            +{message.metadata.citations.length - 5} more...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* References */}
                  {message.metadata.references && message.metadata.references.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Brain className="h-3.5 w-3.5 text-violet" />
                        <span className="text-[11px] font-medium">References Used:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {message.metadata.references.slice(0, 6).map((ref, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-violet/20 text-[10px] font-mono text-violet">
                            {ref}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {message.isError && (
            <div className="mt-2 p-2 rounded-lg bg-danger/10 border border-danger/30">
              <p className="text-xs text-danger">
                ⚠️ Error generating response. Please try again.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!isStreaming && !message.isError && (
            <div className="mt-2 pt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded hover:bg-secondary transition-colors"
                title="Copy response"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>

              {onRetry && (
                <button
                  onClick={() => onRetry(message.id)}
                  className="p-1.5 rounded hover:bg-secondary transition-colors"
                  title="Regenerate response"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}

              {onFeedback && (
                <>
                  <button
                    onClick={() => handleFeedback('positive')}
                    className={`p-1.5 rounded transition-colors ${
                      feedback === 'positive' ? 'bg-success/20 text-success' : 'hover:bg-secondary'
                    }`}
                    title="Good response"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleFeedback('negative')}
                    className={`p-1.5 rounded transition-colors ${
                      feedback === 'negative' ? 'bg-danger/20 text-danger' : 'hover:bg-secondary'
                    }`}
                    title="Poor response"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Tool Call Component (for showing intermediate steps)
export function ToolCallCard({ message }: { message: AgentMessage }) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className="flex justify-start mb-3 opacity-80">
      <div className="max-w-[70%]">
        <div className="border border-border/50 bg-secondary/30 rounded-xl px-3 py-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 w-full text-left"
          >
            <Zap className="h-3.5 w-3.5 text-violet" />
            <span className="text-[11px] font-medium text-violet">
              {message.metadata?.toolName || 'Tool'}
            </span>
            <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", expanded && "rotate-180")} />
          </button>

          {expanded && (
            <div className="mt-2 pl-5 space-y-1 text-[10px] font-mono text-muted-foreground">
              <div><strong>Input:</strong> {message.metadata?.toolInput}</div>
              {message.metadata?.toolOutput && (
                <div><strong>Output:</strong> {message.metadata.toolOutput.substring(0, 200)}...</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// System Message Component (for status updates)
export function SystemMessageCard({ message }: { message: AgentMessage }) {
  return (
    <div className="flex justify-center my-3">
      <div className="px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-[11px] text-muted-foreground">
        {message.content}
      </div>
    </div>
  )
}

// Loading Indicator (typing animation)
export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-violet flex items-center justify-center">
            <Bot className="h-3 w-3 text-white" />
          </div>
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Welcome / Onboarding Card
export function WelcomeCard({ onExampleClick }: { onExampleClick?: (example: string) => void }) {
  const examples = [
    "ECG arrhythmia detection using attention mechanisms",
    "Compare CheXnet vs AlphaFold2 for protein structure prediction",
    "Analyze the reproducibility of this deep learning paper",
    "What are the fatal blockers in this clinical validation study?",
  ]

  return (
    <div className="flex justify-center py-8">
      <div className="max-w-2xl w-full mx-auto text-center space-y-6">
        {/* Logo and Title */}
        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary via-violet to-blue-600 flex items-center justify-center shadow-lg glow-primary">
            <Brain className="h-8 w-8 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">
              BME Research Agent
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your AI-powered biomedical engineering research assistant
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          {examples.map((example, i) => (
            <button
              key={i}
              onClick={() => onExampleClick?.(example)}
              className="p-3 rounded-xl border border-border bg-card hover:bg-secondary/50 hover:border-primary/30 transition-all text-left group"
            >
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-xs text-foreground/80 group-hover:text-foreground line-clamp-2">
                  {example}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Capabilities */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-[11px] text-muted-foreground">
            ✨ Supports PDF parsing · DOI resolution · Citation analysis · Innovation assessment · Reproducibility checking
          </p>
        </div>
      </div>
    </div>
  )
}

// Helper function
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

// Export all components as default object
const AgentUI = {
  UserMessageCard,
  AssistantMessageCard,
  ToolCallCard,
  SystemMessageCard,
  TypingIndicator,
  WelcomeCard,
}

export default AgentUI
