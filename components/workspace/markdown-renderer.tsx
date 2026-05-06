"use client"

import { cn } from "@/lib/utils"
import * as React from "react"

type MarkdownRendererProps = {
  markdown: string
  className?: string
  onLinkClick?: (url: string) => void
}

export function MarkdownRenderer({ markdown, className, onLinkClick }: MarkdownRendererProps) {
  const html = React.useMemo(() => renderMarkdown(markdown), [markdown])

  const handleClick = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (onLinkClick) {
      const target = e.target as HTMLAnchorElement
      if (target.tagName === "A" && target.href) {
        e.preventDefault()
        onLinkClick(target.href)
      }
    }
  }, [onLinkClick])

  return (
    <div
      className={cn(
        "markdown-body prose prose-sm max-w-none",
        "prose-headings:text-foreground prose-p:text-foreground/90",
        "prose-strong:text-foreground prose-code:text-primary",
        "prose-blockquote:border-l-primary/50 prose-blockquote:text-muted-foreground",
        "prose-a:text-primary hover:prose-a:underline",
        "prose-li:text-foreground/90",
        "[&_*]:text-foreground [&_strong]:font-semibold",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={handleClick}
    />
  )
}

/**
 * Sanitize URL to prevent XSS attacks
 * Only allows safe protocols and validates URL format
 */
function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '#invalid-url'

  // Remove control characters and whitespace
  url = url.replace(/[\x00-\x20\s]/g, '').trim()

  if (!url || url.length === 0) return '#invalid-url'

  // Allow relative URLs, anchors, and specific protocols
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', '/']

  try {
    // Check for allowed patterns
    if (/^#[a-zA-Z0-9_-]+$/.test(url)) return url // Anchor links
    if (/^\//.test(url)) return url // Relative paths

    // For absolute URLs, validate protocol
    const parsedUrl = new URL(url, 'http://example.com')
    const protocol = parsedUrl.protocol.toLowerCase()

    if (!allowedProtocols.includes(protocol)) {
      console.warn('[Markdown] Blocked unsafe URL protocol:', protocol)
      return '#unsafe-protocol'
    }

    // Block javascript:, data: (except images), vbscript: etc
    if (/^javascript:/i.test(url) || /^data:(?!image\/)/i.test(url) || /^vbscript:/i.test(url)) {
      console.warn('[Markdown] Blocked dangerous URL scheme')
      return '#blocked-scheme'
    }

    // Additional check: no script/event handlers in URL
    if (/[\s'"`]/.test(url)) {
      // Could contain injection attempts
      return encodeURI(url).replace(/[<>"'`]/g, '')
    }

    return url
  } catch {
    // Invalid URL format - could be a malformed attempt
    console.warn('[Markdown] Invalid URL format')
    return '#invalid-format'
  }
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Sanitize attribute values to prevent attribute injection
 */
function sanitizeAttr(value: string): string {
  return value
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '') // Prevent closing tags in attributes
    .replace(/>/g, '')
}

function renderMarkdown(src: string): string {
  let html = escapeHtml(src)

  // Code blocks (fenced with ``` or indented)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_match, lang, code) => {
    const langClass = lang ? ` language-${lang}` : ""
    return `<pre class="bg-secondary/80 rounded-lg p-3 my-2 overflow-x-auto"><code class="${"font-mono text-xs" + langClass}">${code.trim()}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`\n]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-secondary/80 text-primary font-mono text-[11px]">$1</code>')

  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-sm font-semibold text-foreground mt-4 mb-1.5">$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-foreground mt-4 mb-2">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold text-foreground mt-5 mb-2.5 border-b border-border pb-2">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-foreground mt-6 mb-3">$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
  html = html.replace(/__(.+?)__/g, '<strong class="font-semibold text-foreground">$1</strong>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del class="line-through text-muted-foreground">$1</del>')

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-2 border-primary/50 pl-3 my-2 text-muted-foreground italic bg-secondary/20 py-1 rounded-r">$1</blockquote>')

  // Nested blockquotes
  html = html.replace(/^(&gt;&gt;|&gt; &gt;) (.+)$/gm, '<blockquote class="border-l-2 border-primary/30 pl-4 my-1 text-muted-foreground italic ml-3 bg-secondary/10 py-0.5 rounded-r">$2</blockquote>')

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="border-border my-4" />')
  html = html.replace(/^\*\*\*$/gm, '<hr class="border-border my-4" />')

  // Unordered lists
  html = html.replace(/^[\-\*] (.+)$/gm, '<li class="ml-4 list-disc text-foreground/90 my-0.5">$1</li>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-foreground/90 my-0.5">$1</li>')

  // Task lists
  html = html.replace(/^\[x\] (.+)$/gi, '<li class="ml-4 list-none flex items-center gap-2 my-0.5"><input type="checkbox" checked disabled class="rounded border-primary" /><span>$1</span></li>')
  html = html.replace(/^\[ \] (.+)$/gi, '<li class="ml-4 list-none flex items-center gap-2 my-0.5"><input type="checkbox" disabled class="rounded border-border" /><span>$1</span></li>')

  // Links with title support - SECURE VERSION
  html = html.replace(/\[([^\]]+)\]\(([^)]+)(?:\s+"([^"]+)")?\)/g, (match, text, rawUrl, title) => {
    const sanitizedText = sanitizeAttr(text)
    const safeUrl = sanitizeUrl(rawUrl)
    const titleAttr = title ? ` title="${sanitizeAttr(title)}"` : ""

    if (safeUrl.startsWith('#') && !safeUrl.startsWith('#[')) {
      // Invalid URL - show text only without link
      return `<span class="text-muted-foreground cursor-not-allowed" title="Blocked: invalid or unsafe URL">${sanitizedText}</span>`
    }

    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer nofollow" class="text-primary hover:underline"${titleAttr}>${sanitizedText}</a>`
  })

  // Auto-link URLs - SECURE VERSION
  html = html.replace(/(?<!["=])(https?:\/\/[^\s<]+)/g, (match, rawUrl) => {
    const safeUrl = sanitizeUrl(rawUrl)
    if (safeUrl.startsWith('#')) {
      return `<span class="text-warning break-all">[blocked URL]</span>`
    }
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer nofollow" class="text-primary hover:underline break-all">${safeUrl}</a>`
  })

  // Images with alt text and size support - SANITIZE SRC
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, rawSrc) => {
    const safeAlt = sanitizeAttr(alt)
    const safeSrc = sanitizeUrl(rawSrc)

    // Only allow http/https/data:image for images
    if (!/^https?:\/\//i.test(safeSrc) && !/^data:image\//i.test(safeSrc)) {
      return `<span class="bg-warning/20 text-warning px-2 py-1 rounded text-xs">[Image blocked: ${safeAlt}]</span>`
    }

    return `<img src="${safeSrc}" alt="${safeAlt}" class="max-w-full rounded-lg shadow-sm my-2" loading="lazy" referrerpolicy="no-referrer" />`
  })

  // Tables
  html = renderTables(html)

  // Line breaks and paragraphs
  html = html.replace(/\n{2,}/g, '</p><p class="my-2">')
  html = html.replace(/\n/g, '<br />')

  // Wrap in paragraphs
  html = '<p class="my-1">' + html + '</p>'

  // Clean up empty paragraphs and fix nesting
  html = html.replace(/<p class="my-1"><\/p>/g, '')
  html = html.replace(/<p class="my-1">(<h[1-6][^>]*>)/g, '$1')
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1')
  html = html.replace(/<p class="my-1">(<hr[^>]*>)<\/p>/g, '$1')
  html = html.replace(/<p class="my-1">(<blockquote[^>]*>)<\/p>/g, '$1')
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1')
  html = html.replace(/<p class="my-1">(<pre[^>]*>)<\/p>/g, '$1')
  html = html.replace(/(<\/pre>)<\/p>/g, '$1')
  html = html.replace(/<p class="my-1">(<table[^>]*>)<\/p>/g, '$1')
  html = html.replace(/(<\/table>)<\/p>/g, '$1')
  html = html.replace(/<p class="my-1">(<li)/g, '<ul class="my-2 space-y-0.5">$1')
  html = html.replace(/(<\/li>)<\/p>(?!<li)/g, '$1</ul>')

  return html
}

function renderTables(html: string): string {
  // Check if content contains table syntax
  if (!html.includes('|')) return html

  const lines = html.split('\n')
  let inTable = false
  let tableLines: string[] = []
  let resultLines: string[] = []

  for (const line of lines) {
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        inTable = true
        tableLines = []
      }
      tableLines.push(line)
    } else if (inTable && line.trim().match(/^[-:|]+$/)) {
      // Separator line - skip but continue table
      continue
    } else {
      if (inTable && tableLines.length > 0) {
        resultLines.push(renderTable(tableLines))
        inTable = false
        tableLines = []
      }
      resultLines.push(line)
    }
  }

  // Handle table at end of content
  if (inTable && tableLines.length > 0) {
    resultLines.push(renderTable(tableLines))
  }

  return resultLines.join('\n')
}

function renderTable(lines: string[]): string {
  if (lines.length === 0) return ''

  // Parse header
  const headerCells = lines[0].split('|').slice(1, -1).map(cell => cell.trim())

  // Parse body rows (skip separator line)
  const bodyRows = lines.slice(2).map(line =>
    line.split('|').slice(1, -1).map(cell => cell.trim())
  )

  let tableHtml = '<div class="overflow-x-auto my-3"><table class="w-full border-collapse border border-border rounded-lg text-sm">'

  // Header
  tableHtml += '<thead><tr class="bg-secondary/50">'
  headerCells.forEach(cell => {
    tableHtml += `<th class="border border-border px-3 py-2 text-left font-semibold text-foreground">${cell}</th>`
  })
  tableHtml += '</tr></thead>'

  // Body
  if (bodyRows.length > 0) {
    tableHtml += '<tbody>'
    bodyRows.forEach((row, idx) => {
      const bgClass = idx % 2 === 0 ? 'bg-background' : 'bg-secondary/30'
      tableHtml += `<tr class="${bgClass} hover:bg-secondary/50 transition-colors">`
      row.forEach(cell => {
        tableHtml += `<td class="border border-border px-3 py-2 text-foreground/90">${cell}</td>`
      })
      tableHtml += '</tr>'
    })
    tableHtml += '</tbody>'
  }

  tableHtml += '</table></div>'

  return tableHtml
}
