"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2, FileText, Link2, Loader2, X } from "lucide-react"
import * as React from "react"

type AttachmentType = "pdf" | "text" | "doi" | "url" | "image"

interface AttachmentData {
  id: string
  name: string
  type: AttachmentType
  size: number
  content?: string
  pages?: number
  doi?: string
  url?: string
  status?: "uploading" | "processing" | "ready" | "error"
}

interface AttachmentCardProps {
  attachment: AttachmentData
  onRemove?: (id: string) => void
  compact?: boolean
}

export function AttachmentCard({ attachment, onRemove, compact = false }: AttachmentCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const getTypeIcon = () => {
    switch (attachment.type) {
      case "pdf":
      case "text":
        return <FileText className="h-4 w-4 text-primary" />
      case "doi":
      case "url":
        return <Link2 className="h-4 w-4 text-teal" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTypeColor = () => {
    switch (attachment.type) {
      case "pdf":
        return "border-danger/30 bg-danger/5 hover:border-danger/50"
      case "doi":
        return "border-teal/30 bg-teal/5 hover:border-teal/50"
      case "text":
        return "border-primary/30 bg-primary/5 hover:border-primary/50"
      default:
        return "border-border bg-secondary/30"
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return ""
    const mb = bytes / (1024 * 1024)
    return mb >= 1 ? `${mb.toFixed(1)}MB` : `${(bytes / 1024).toFixed(0)}KB`
  }

  if (compact) {
    // Compact version for inline display in messages
    return (
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium max-w-xs",
        getTypeColor(),
        "transition-all duration-200"
      )}>
        {getTypeIcon()}
        <span className="truncate flex-1">{attachment.name}</span>
        {attachment.size > 0 && (
          <span className="text-muted-foreground text-[10px]">{formatSize(attachment.size)}</span>
        )}
        {attachment.pages && (
          <span className="text-muted-foreground text-[10px]">{attachment.pages}p</span>
        )}
      </div>
    )
  }

  // Full card version
  return (
    <div className={cn(
      "group relative rounded-lg border p-3 transition-all duration-200",
      getTypeColor(),
      isExpanded && "shadow-lg"
    )}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {getTypeIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm text-foreground truncate">
              {attachment.name}
            </h4>
            {attachment.status === "ready" && (
              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
            )}
            {attachment.status === "processing" && (
              <Loader2 className="h-3.5 w-3.5 text-warning animate-spin shrink-0" />
            )}
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground flex-wrap">
            <span className="uppercase font-mono px-1.5 py-0.5 rounded bg-secondary/60 border border-border">
              {attachment.type}
            </span>
            {attachment.size > 0 && (
              <span>{formatSize(attachment.size)}</span>
            )}
            {attachment.pages && (
              <span>{attachment.pages} pages</span>
            )}
            {attachment.doi && (
              <button
                onClick={() => navigator.clipboard.writeText(attachment.doi!)}
                className="hover:text-primary transition-colors font-mono truncate max-w-[150px]"
                title={attachment.doi}
              >
                DOI: {attachment.doi.slice(0, 20)}...
              </button>
            )}
          </div>

          {/* Expandable content preview */}
          {attachment.content && attachment.content.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[11px] text-primary hover:text-primary/80 transition-colors font-medium"
              >
                {isExpanded ? "▼ Hide preview" : "▶ Show preview"}
              </button>

              {isExpanded && (
                <div className="mt-2 p-2 rounded bg-background/50 border border-border max-h-48 overflow-y-auto">
                  <pre className="text-[11px] text-foreground/80 whitespace-pre-wrap font-mono leading-relaxed">
                    {attachment.content.slice(0, 2000)}
                    {attachment.content.length > 2000 && "\n... [truncated]"}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={() => onRemove(attachment.id)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-secondary transition-all shrink-0"
            aria-label={`Remove ${attachment.name}`}
          >
            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
    </div>
  )
}

// Component to render attachments in chat message (ChatGPT style)
export function ChatAttachments({
  attachments,
  showRemove = false,
  onRemove
}: {
  attachments: AttachmentData[]
  showRemove?: boolean
  onRemove?: (id: string) => void
}) {
  if (!attachments || attachments.length === 0) return null

  return (
    <div className="space-y-2 my-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-2">
        <FileText className="h-3.5 w-3.5" />
        <span>{attachments.length} file{attachments.length > 1 ? 's' : ''} attached</span>
      </div>
      {attachments.map((att) => (
        <AttachmentCard
          key={att.id}
          attachment={att}
          compact={!showRemove}
          onRemove={showRemove ? onRemove : undefined}
        />
      ))}
    </div>
  )
}

export type { AttachmentData, AttachmentType }

