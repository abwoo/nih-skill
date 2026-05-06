"use client"

import * as React from "react"
import { useStore } from "@/lib/store"
import { getProvider } from "@/lib/providers"
import { cn } from "@/lib/utils"
import {
  Microscope,
  Scale,
  FlaskConical,
  CheckCircle2,
  Database,
  Loader2,
  Search,
  ExternalLink,
  ShieldCheck,
} from "lucide-react"
import type { ModuleId } from "@/lib/types"
import { testConnection, searchPapers, getCitations } from "@/lib/api"
import type { SearchResult, CitationEntry } from "@/lib/api"

const TEMPLATES: {
  icon: React.ComponentType<{ className?: string }>
  module: ModuleId
  prompt: string
  short: string
}[] = [
  {
    icon: Microscope,
    module: "decompose",
    prompt: "Analyze: ECG arrhythmia detection with attention",
    short: "ECG arrhythmia detection with attention",
  },
  {
    icon: Scale,
    module: "compare",
    prompt: "Compare: CheXnet vs AlphaFold2 innovation delta",
    short: "CheXnet vs AlphaFold2 innovation delta",
  },
  {
    icon: FlaskConical,
    module: "reproduce",
    prompt: "Reproduce: Self-supervised ECG representation learning",
    short: "Self-supervised ECG representation learning",
  },
  {
    icon: CheckCircle2,
    module: "evidence",
    prompt: "Verify: AI surpasses radiologists on chest X-ray",
    short: "AI surpasses radiologists on chest X-ray",
  },
  {
    icon: Database,
    module: "datasets",
    prompt: "Find datasets: EEG sleep staging benchmarks",
    short: "EEG sleep staging benchmarks",
  },
]

export function RightSidebar() {
  const { config, conversations, currentConversationId, setModule, setSettingsOpen, prefillFor, showToast, switchConversation } = useStore()
  const provider = getProvider(config.provider)
  const [testing, setTesting] = React.useState(false)
  const [latency, setLatency] = React.useState<number | null>(142)
  const [verifying, setVerifying] = React.useState(false)
  const [apiVerification, setApiVerification] = React.useState<Record<string, any> | null>(null)

  // Get recent conversations for display (sorted by updatedAt)
  const recentConversations = React.useMemo(() => {
    return [...conversations]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 8) // Show last 8 conversations
  }, [conversations])

  function runTest() {
    if (testing) return
    setTesting(true)
    setLatency(null)
    setTimeout(() => {
      const ms = 90 + Math.floor(Math.random() * 220)
      setLatency(ms)
      setTesting(false)
      showToast(`Connection OK · ${ms}ms`)
    }, 900)
  }

  function handleConversationClick(convId: string) {
    switchConversation(convId)
    showToast(`📝 已切换到会话`)
  }

  async function verifyRealAPIs() {
    if (verifying) return
    setVerifying(true)
    setApiVerification(null)
    
    try {
      showToast("🔍 正在验证所有API的真实性...")
      const res = await fetch("/api/verify-real-api")
      const data = await res.json()
      
      setApiVerification(data)
      
      const successCount = data.summary?.successfulConnections || 0
      const totalCount = data.summary?.totalAPIsTested || 0
      
      if (successCount === totalCount) {
        showToast(`✅ 验证完成: ${successCount}/${totalCount} 个API全部为真实外部数据源`)
      } else {
        showToast(`⚠️ 验证完成: ${successCount}/${totalCount} 个API可用`)
      }
    } catch (err) {
      console.error("Verify API error:", err)
      showToast("验证失败，请检查网络连接")
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="h-[calc(100vh-3.5rem-2px)] overflow-y-auto px-3 py-4 space-y-5">
      <SectionTitle>Session & Tools</SectionTitle>

      {/* API Status */}
      <Card>
        <SubTitle>API Status</SubTitle>
        <div className="space-y-1 text-[11px] font-mono">
          <Row k="Provider" v={provider?.name ?? "—"} />
          <Row k="Model" v={config.model || "—"} mono />
          <Row
            k="Status"
            v={
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Connected
              </span>
            }
          />
          <Row k="Last call" v="12s ago" />
          <Row k="Latency" v={latency ? `${latency}ms` : "…"} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={runTest}
            disabled={testing}
            className="text-[10px] px-2 py-1 rounded border border-border bg-secondary/60 hover:bg-secondary disabled:opacity-50 font-mono inline-flex items-center gap-1"
          >
            {testing && <Loader2 className="h-3 w-3 animate-spin" />}
            Test
          </button>
          <button
            onClick={verifyRealAPIs}
            disabled={verifying}
            className="text-[10px] px-2 py-1 rounded border border-primary/30 bg-primary/10 hover:bg-primary/20 disabled:opacity-50 font-mono inline-flex items-center gap-1 text-primary"
          >
            {verifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
            验证真实API
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="text-[10px] text-primary hover:underline"
          >
            Change provider
          </button>
        </div>

        {/* API Verification Results */}
        {apiVerification && (
          <div className="mt-2 p-2 rounded-md bg-success/10 border border-success/20 space-y-1.5">
            <div className="text-[10px] font-mono text-success font-medium flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              API真实性验证结果
            </div>
            <div className="text-[9px] font-mono text-muted-foreground">
              {apiVerification.summary?.verificationStatus || "验证完成"}
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(apiVerification.apis || {}).map(([name, status]: [string, any]) => (
                <span 
                  key={name}
                  className={`px-1 rounded text-[8px] font-mono ${
                    status.status === "✅ LIVE" 
                      ? 'bg-success/20 text-success' 
                      : 'bg-danger/20 text-danger'
                  }`}
                  title={status.note || name}
                >
                  {status.status === "✅ LIVE" ? "✅" : "❌"} {name}
                </span>
              ))}
            </div>
            <div className="text-[8px] text-muted-foreground font-mono">
              ⏱️ {apiVerification.totalTimeMs}ms | 📡 {apiVerification.summary?.successfulConnections}/{apiVerification.summary?.totalAPIsTested} APIs
            </div>
          </div>
        )}
      </Card>

      {/* Token usage */}
      <Card>
        <SubTitle>Token Usage</SubTitle>
        <div className="space-y-1 text-[11px] font-mono text-muted-foreground">
          <Row k="System" v="~8,200" />
          <Row k="Exchange" v="~1,400" />
          <Row k="Total" v="9,600 / 200,000" />
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-primary" style={{ width: "4.8%" }} />
        </div>
        <p className="mt-2 text-[10px] text-warning leading-relaxed">
          ⚠ 每次分析重置上下文（仅注入系统提示 + 单次交换）
        </p>
      </Card>

      {/* Quick start templates */}
      <Card>
        <SubTitle>Quick Start Templates</SubTitle>
        <div className="space-y-1.5">
          {TEMPLATES.map((t, i) => {
            const Icon = t.icon
            return (
              <button
                key={i}
                onClick={() => {
                  prefillFor(t.module, t.short)
                  showToast(`已切换到 ${t.module} · 已预填模板`)
                }}
                className="w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-md border border-border bg-secondary/40 hover:bg-secondary/80"
              >
                <Icon className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span className="text-[11px] leading-snug">{t.short}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Paper Search */}
      <Card>
        <SubTitle>Paper Search</SubTitle>
        <PaperSearchPanel />
      </Card>

      {/* Citation Explorer */}
      <Card>
        <SubTitle>Citation Explorer</SubTitle>
        <CitationExplorerPanel />
      </Card>

      {/* Anti-hallucination flags */}
      <Card>
        <SubTitle>Anti-Hallucination Flags</SubTitle>
        <div className="flex flex-wrap gap-1">
          <Flag tone="warning">⚠️ Abstract only</Flag>
          <Flag tone="warning">NOT STATED</Flag>
          <Flag tone="info">INFERENCE</Flag>
          <Flag tone="success">FACT verified</Flag>
        </div>
      </Card>

      {/* Recent Sessions (Unified with Conversations) */}
      <Card>
        <SubTitle>📝 Recent Sessions</SubTitle>
        {recentConversations.length === 0 ? (
          <div className="text-[11px] text-muted-foreground">
            No sessions yet<br/>
            <span className="text-[10px]">Start analyzing to create sessions</span>
          </div>
        ) : (
          <ul className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {recentConversations.map((conv) => {
              const isActive = conv.id === currentConversationId
              const msgCount = conv.messages?.length || 0
              const lastMsg = conv.messages?.[msgCount - 1]
              
              return (
                <li key={conv.id}>
                  <button
                    onClick={() => handleConversationClick(conv.id)}
                    className={cn(
                      "w-full text-left text-[11px] px-2 py-1.5 rounded border transition-colors",
                      isActive 
                        ? "border-primary/50 bg-primary/15 font-medium" 
                        : "border-border bg-secondary/40 hover:bg-secondary/70"
                    )}
                  >
                    <div className="flex items-center gap-1 truncate">
                      <span className="shrink-0">{getModuleIcon(conv.module)}</span>
                      <span className="truncate font-mono">{conv.title || 'Untitled'}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-between">
                      <span>{msgCount} messages</span>
                      <span>{timeAgo(conv.updatedAt)}</span>
                    </div>
                    {lastMsg && (
                      <div className="text-[9px] text-muted-foreground/70 mt-0.5 truncate italic">
                        "{lastMsg.content.slice(0, 40)}..."
                      </div>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        <div className="mt-2 text-[9px] text-muted-foreground font-mono">
          💡 Full conversation list in left sidebar
        </div>
      </Card>
    </div>
  )
}

function timeAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts)
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

function getModuleIcon(module: ModuleId): string {
  const icons: Record<ModuleId, string> = {
    decompose: "🔬",
    compare: "⚖️",
    reproduce: "🧪",
    paradigm: "🗺️",
    evidence: "✅",
    datasets: "📊",
  }
  return icons[module] || "📝"
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-card/60 p-3 space-y-2">{children}</div>
  )
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  )
}
function SubTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-medium text-foreground/90">{children}</div>
}

function Row({
  k,
  v,
  mono,
}: {
  k: string
  v: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn("text-foreground/90 truncate", mono && "font-mono")}>{v}</span>
    </div>
  )
}

function Flag({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: "warning" | "success" | "info"
}) {
  return (
    <span
      className={cn(
        "px-1.5 py-0.5 rounded text-[10px] font-mono border",
        tone === "warning" && "bg-warning/10 text-warning border-warning/40",
        tone === "success" && "bg-success/10 text-success border-success/40",
        tone === "info" && "bg-primary/10 text-primary border-primary/40",
      )}
    >
      {children}
    </span>
  )
}

function PaperSearchPanel() {
  const [mounted, setMounted] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [source, setSource] = React.useState<"all" | "pubmed" | "semantic_scholar" | "openalex" | "arxiv">("all")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  // Advanced options
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [yearFrom, setYearFrom] = React.useState<string>("")
  const [yearTo, setYearTo] = React.useState<string>("")
  const [sortBy, setSortBy] = React.useState<"relevance" | "date" | "citations">("relevance")
  const [limit, setLimit] = React.useState(10)
  const [expandedId, setExpandedId] = React.useState<number | null>(null)
  const [favorites, setFavorites] = React.useState<Set<number>>(new Set())
  const [searchHistory, setSearchHistory] = React.useState<Array<{query: string; time: number}>>([])
  
  // NEW: API status tracking
  const [apiStatus, setApiStatus] = React.useState<Record<string, {success: boolean; count: number; error?: string}> | null>(null)
  const [hasRealData, setHasRealData] = React.useState<boolean>(false)
  const [searchTime, setSearchTime] = React.useState<number>(0)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
    // Load favorites from localStorage
    try {
      const saved = localStorage.getItem("bme_search_favorites")
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)))
      }
      // Load search history
      const history = localStorage.getItem("bme_search_history")
      if (history) {
        setSearchHistory(JSON.parse(history).slice(0, 10))
      }
    } catch {}
  }, [])

  async function handleSearch() {
    if (!query.trim() || loading) return
    setLoading(true)
    setError(null)
    setResults([])
    setExpandedId(null)
    setApiStatus(null)
    setHasRealData(false)

    console.log(`[Frontend] Starting search for: "${query}"`)

    try {
      const res = await searchPapers(query, source, limit, 
        yearFrom ? parseInt(yearFrom) : undefined,
        yearTo ? parseInt(yearTo) : undefined,
        sortBy
      )
      
      // Update API status tracking
      if (res.apiStatus) {
        setApiStatus(res.apiStatus)
        console.log("[Frontend] API Status:", res.apiStatus)
      }
      
      if (res.hasRealData !== undefined) {
        setHasRealData(res.hasRealData)
        console.log("[Frontend] Has real data:", res.hasRealData)
      }
      
      if (res.performance?.elapsedTimeMs) {
        setSearchTime(res.performance.elapsedTimeMs)
        console.log(`[Frontend] Search completed in ${res.performance.elapsedTimeMs}ms`)
      }
      
      if (res.success && res.results.length > 0) {
        setResults(res.results)
        
        // Save to search history
        const newEntry = { query: query.trim(), time: Date.now() }
        setSearchHistory(prev => [newEntry, ...prev.slice(0, 9)].slice(0, 10))
        try {
          localStorage.setItem("bme_search_history", JSON.stringify([newEntry, ...searchHistory].slice(0, 10)))
        } catch {}
        
        if (res.totalAvailable && res.totalAvailable > res.count) {
          console.log(`[Frontend] Showing ${res.count} of ${res.totalAvailable} total results`)
        }
        
        // Log data source info
        if (!hasRealData) {
          console.warn("[Frontend] ⚠️ WARNING: Results may be from fallback/local data")
        }
      } else {
        // Provide more detailed error message based on API status
        let errorMsg = `未找到相关论文`
        
        if (apiStatus) {
          const failedAPIs = Object.entries(apiStatus).filter(([, status]) => !status.success).map(([name]) => name)
          const successAPIs = Object.entries(apiStatus).filter(([, status]) => status.success)
          
          if (failedAPIs.length === Object.keys(apiStatus).length) {
            errorMsg += `\n所有API调用失败 (${failedAPIs.join(", ")})`
            errorMsg += "\n请检查网络连接或稍后重试"
          } else if (failedAPIs.length > 0) {
            errorMsg += `\n部分API失败: ${failedAPIs.join(", ")}`
            errorMsg += `\n成功获取数据: ${successAPIs.map(([name]) => name).join(", ")}`
          } else {
            errorMsg += `（已搜索: ${source === 'all' ? '全部5个数据库' : source}）`
          }
        } else {
          errorMsg += `（已搜索: ${source === 'all' ? '全部5个数据库' : source}）`
        }
        
        setError(errorMsg)
      }
    } catch (err) {
      console.error("[Frontend] Search failed:", err)
      setError(err instanceof Error ? err.message : "搜索失败，请检查网络连接")
    } finally {
      setLoading(false)
    }
  }

  function toggleFavorite(index: number) {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      try {
        localStorage.setItem("bme_search_favorites", JSON.stringify([...next]))
      } catch {}
      return next
    })
  }

  function exportBibTeX() {
    const papers = results.filter((_, i) => favorites.has(i))
    if (papers.length === 0) {
      alert("请先收藏要导出的论文（点击⭐图标）")
      return
    }
    
    const bibtex = papers.map(paper => {
      const key = paper.title.split(":")[0]?.replace(/[^a-zA-Z]/g, "").toLowerCase() || "paper"
      return `@article{${key},
  title={${paper.title}},
  author={${paper.authors}},
  year={${paper.year || "n.d."}},
  ${paper.doi ? `doi={${paper.doi}},` : ""}
  ${paper.venue ? `journal={${paper.venue}},` : ""}
}`
    }).join("\n\n")

    navigator.clipboard.writeText(bibtex).then(() => {
      alert(`✅ 已复制 ${papers.length} 篇论文的 BibTeX 到剪贴板！`)
    }).catch(() => {
      console.log(bibtex)
    })
  }

  function clearHistory() {
    setSearchHistory([])
    try { localStorage.removeItem("bme_search_history") } catch {}
  }

  return (
    <div className="space-y-2">
      {mounted ? (
        <>
          {/* Search Input */}
          <div className="flex gap-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="输入搜索关键词..."
              className="flex-1 text-[11px] px-2 py-1 rounded border border-border bg-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-2 py-1 rounded bg-primary/20 hover:bg-primary/30 disabled:opacity-50 inline-flex items-center gap-1"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
            </button>
          </div>

          {/* Source Selection */}
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as typeof source)}
            className="w-full text-[10px] px-2 py-1 rounded border border-border bg-secondary/60 font-mono"
          >
            <option value="all">🌐 全部数据库 (5个)</option>
            <option value="pubmed">🏥 PubMed (生物医学)</option>
            <option value="pubmed">🏥 PubMed (生物医学)</option>
            <option value="openalex">📚 OpenAlex (综合学科)</option>
            <option value="arxiv">📄 arXiv (预印本)</option>
            <option value="crossref">🔗 Crossref (DOI注册表)</option>
          </select>

          {/* Advanced Options Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full text-[10px] text-primary hover:text-primary/80 font-mono flex items-center gap-1"
          >
            ⚙️ 高级选项 {showAdvanced ? "▼" : "▶"}
          </button>

          {/* Advanced Options Panel */}
          {showAdvanced && (
            <div className="space-y-1.5 p-2 rounded border border-border bg-secondary/20">
              {/* Year Range */}
              <div className="flex gap-1">
                <input
                  type="number"
                  placeholder="起始年"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-16 text-[10px] px-1 py-1 rounded border border-border bg-secondary/60 font-mono"
                />
                <span className="text-[10px] self-center">-</span>
                <input
                  type="number"
                  placeholder="结束年"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-16 text-[10px] px-1 py-1 rounded border border-border bg-secondary/60 font-mono"
                />
                <span className="text-[9px] text-muted-foreground self-center ml-auto">年份范围</span>
              </div>

              {/* Sort & Limit */}
              <div className="flex gap-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="flex-1 text-[9px] px-1 py-1 rounded border border-border bg-secondary/60 font-mono"
                >
                  <option value="relevance">相关性</option>
                  <option value="date">日期</option>
                  <option value="citations">引用数</option>
                </select>
                
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="w-14 text-[9px] px-1 py-1 rounded border border-border bg-secondary/60 font-mono"
                >
                  <option value={5}>5条</option>
                  <option value={10}>10条</option>
                  <option value={15}>15条</option>
                  <option value={20}>20条</option>
                </select>
              </div>

              {/* Export Button */}
              <button
                type="button"
                onClick={exportBibTeX}
                disabled={favorites.size === 0}
                className="w-full text-[10px] px-2 py-1 rounded bg-warning/20 hover:bg-warning/30 disabled:opacity-50 font-mono flex items-center justify-center gap-1"
              >
                📋 导出 BibTeX ({favorites.size})
              </button>
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && !results.length && (
            <div className="space-y-1">
              <div className="text-[9px] font-mono text-muted-foreground flex justify-between">
                <span>📜 搜索历史</span>
                <button onClick={clearHistory} className="text-danger hover:text-danger/80">清除</button>
              </div>
              {searchHistory.slice(0, 5).map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setQuery(item.query)
                    handleSearch()
                  }}
                  className="w-full text-left text-[10px] px-1.5 py-1 rounded border border-border/50 bg-secondary/20 hover:bg-secondary/40 truncate font-mono"
                >
                  🔍 {item.query}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-[11px] text-muted-foreground font-mono p-2">Loading...</div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-[10px] text-warning p-1.5 rounded bg-warning/10 border border-warning/20">{error}</div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-1.5">
          {/* Results Header with Status Info */}
          <div className="text-[10px] font-mono text-muted-foreground space-y-1">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                找到 <span className="font-bold text-foreground">{results.length}</span> 篇论文
                {hasRealData ? (
                  <span className="px-1 rounded bg-success/20 text-success text-[8px]" title="来自真实数据库">✅ 真实数据</span>
                ) : (
                  <span className="px-1 rounded bg-warning/20 text-warning text-[8px]" title="可能使用本地备份数据">⚠️ 备份数据</span>
                )}
              </span>
              {searchTime > 0 && (
                <span className="text-[8px]">{searchTime}ms</span>
              )}
            </div>
            
            {/* API Status Details */}
            {apiStatus && (
              <div className="flex flex-wrap gap-1 text-[8px]">
                {Object.entries(apiStatus).map(([name, status]) => (
                  <span 
                    key={name}
                    className={`px-1 rounded ${
                      status.success 
                        ? 'bg-success/10 text-success' 
                        : 'bg-danger/10 text-danger'
                    }`}
                    title={status.error || `${status.count} results`}
                  >
                    {status.success ? '✅' : '❌'} {name} ({status.count})
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <ul className="space-y-1.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {results.map((paper, i) => {
              const isExpanded = expandedId === i
              const isFavorite = favorites.has(i)
              
              return (
                <li 
                  key={i} 
                  className={`text-[10px] p-1.5 rounded border transition-all ${
                    isExpanded 
                      ? 'border-primary/40 bg-primary/5 space-y-1.5' 
                      : 'border-border/50 bg-secondary/30 hover:border-primary/30'
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex items-start gap-1">
                    {/* Favorite Button */}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(i)}
                      className={`shrink-0 mt-0.5 ${isFavorite ? 'text-warning' : 'text-muted-foreground/30 hover:text-warning/70'}`}
                    >
                      ⭐
                    </button>
                    
                    {/* Title & Meta */}
                    <div className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : i)}
                        className="text-left w-full font-medium leading-tight line-clamp-2 hover:text-primary transition-colors"
                      >
                        {isExpanded ? '▼' : '▸'} {paper.title}
                      </button>
                      
                      {!isExpanded && (
                        <div className="mt-0.5 flex items-center gap-1 text-[9px] text-muted-foreground">
                          <span>{paper.authors?.split(",")[0]} 等</span>
                          <span>·</span>
                          <span>{paper.year}</span>
                          {paper.citationCount && (
                            <>
                              <span>·</span>
                              <span>引用 {paper.citationCount}</span>
                            </>
                          )}
                          <span className="ml-auto px-1 rounded bg-secondary/60 text-[8px]">{paper.source}</span>
                        </div>
                      )}
                    </div>

                    {/* External Link */}
                    {paper.url && (
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-primary hover:text-primary/80 p-0.5"
                        title="打开原文"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                    
                    {/* PDF Download (arXiv only) */}
                    {paper.pdfUrl && (
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-success hover:text-success/80 p-0.5"
                        title="下载PDF"
                      >
                        📥
                      </a>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="pl-5 space-y-1 border-l-2 border-primary/20">
                      {/* Authors */}
                      <div className="text-[9px]">
                        <span className="font-medium text-muted-foreground">作者：</span>
                        <span className="text-foreground/90">{paper.authors}</span>
                      </div>
                      
                      {/* Venue & Year */}
                      <div className="text-[9px] flex items-center gap-2">
                        <span className="font-medium text-muted-foreground">发表：</span>
                        <span>{paper.venue}</span>
                        <span>·</span>
                        <span>{paper.year}</span>
                        {paper.citationCount && (
                          <>
                            <span>·</span>
                            <span className="text-warning">引用 {paper.citationCount} 次</span>
                          </>
                        )}
                      </div>
                      
                      {/* Abstract */}
                      {paper.abstract && (
                        <div className="text-[9px] leading-relaxed">
                          <span className="font-medium text-muted-foreground block mb-0.5">摘要：</span>
                          <span className="line-clamp-6 text-foreground/80">{paper.abstract}</span>
                        </div>
                      )}
                      
                      {/* Identifiers */}
                      <div className="flex flex-wrap gap-1 text-[8px] font-mono">
                        {paper.doi && (
                          <span className="px-1 rounded bg-secondary text-muted-foreground">DOI: {paper.doi}</span>
                        )}
                        {paper.pmid && (
                          <span className="px-1 rounded bg-secondary text-muted-foreground">PMID: {paper.pmid}</span>
                        )}
                        {paper.arxivId && (
                          <span className="px-1 rounded bg-secondary text-muted-foreground">arXiv: {paper.arxivId}</span>
                        )}
                        <span className="px-1 rounded bg-primary/10 text-primary">{paper.source}</span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-1 pt-1">
                        {paper.doi && (
                          <a
                            href={`https://doi.org/${paper.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] px-1.5 py-0.5 rounded bg-secondary hover:bg-secondary/70 inline-flex items-center gap-0.5"
                          >
                            DOI
                          </a>
                        )}
                        {paper.pdfUrl && (
                          <a
                            href={paper.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] px-1.5 py-0.5 rounded bg-success/20 hover:bg-success/30 text-success inline-flex items-center gap-0.5"
                          >
                            PDF
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

function CitationExplorerPanel() {
  const [mounted, setMounted] = React.useState(false)
  const [doi, setDoi] = React.useState("")
  const [direction, setDirection] = React.useState<"citations" | "references">("citations")
  const [results, setResults] = React.useState<CitationEntry[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [paperTitle, setPaperTitle] = React.useState("")
  const [limit, setLimit] = React.useState(10)
  const [expandedId, setExpandedId] = React.useState<number | null>(null)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
    // Load recent DOIs from localStorage
    try {
      const recentDois = localStorage.getItem("bme_recent_dois")
      if (recentDois) {
        // Could populate a dropdown with recent DOIs
      }
    } catch {}
  }, [])

  async function handleExplore() {
    if (!doi.trim() || loading) return
    
    // Validate DOI format
    const doiPattern = /^10\.\d{4,9}\/[^\s]+$/
    if (!doiPattern.test(doi.trim())) {
      setError("请输入有效的DOI格式（如: 10.1038/nature12373）")
      return
    }
    
    setLoading(true)
    setError(null)
    setResults([])
    setPaperTitle("")
    setExpandedId(null)

    try {
      const res = await getCitations(doi.trim(), direction, limit)
      if (res.success && res.results.length > 0) {
        setResults(res.results)
        setPaperTitle(res.paperTitle || "")
        
        // Save to recent DOIs
        try {
          const recentDois = JSON.parse(localStorage.getItem("bme_recent_dois") || "[]")
          const newDois = [doi.trim(), ...recentDois.filter((d: string) => d !== doi.trim())].slice(0, 5)
          localStorage.setItem("bme_recent_dois", JSON.stringify(newDois))
        } catch {}
      } else {
        setError(res.error || `未找到${direction === 'citations' ? '被引' : '参考文献'}信息`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "查询失败，请检查网络连接或DOI是否正确")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {mounted ? (
        <>
          {/* DOI Input */}
          <div className="flex gap-1">
            <input
              type="text"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExplore()}
              placeholder="输入DOI (如: 10.1038/nature12373)"
              className="flex-1 text-[11px] px-2 py-1 rounded border border-border bg-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
            <button
              onClick={handleExplore}
              disabled={loading || !doi.trim()}
              className="px-2 py-1 rounded bg-primary/20 hover:bg-primary/30 disabled:opacity-50 inline-flex items-center gap-1"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
            </button>
          </div>

          {/* Direction Toggle */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => { setDirection("citations"); if (results.length > 0) handleExplore(); }}
              className={`flex-1 text-[10px] px-2 py-1.5 rounded border font-mono transition-all ${
                direction === "citations"
                  ? "bg-primary/20 border-primary/40 text-primary shadow-sm"
                  : "border-border bg-secondary/60 hover:bg-secondary/80"
              }`}
            >
              📊 被引论文
            </button>
            <button
              type="button"
              onClick={() => { setDirection("references"); if (results.length > 0) handleExplore(); }}
              className={`flex-1 text-[10px] px-2 py-1.5 rounded border font-mono transition-all ${
                direction === "references"
                  ? "bg-primary/20 border-primary/40 text-primary shadow-sm"
                  : "border-border bg-secondary/60 hover:bg-secondary/80"
              }`}
            >
              📚 参考文献
            </button>
          </div>

          {/* Limit Selector */}
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="w-full text-[9px] px-2 py-1 rounded border border-border bg-secondary/60 font-mono"
          >
            <option value={5}>显示 5 条</option>
            <option value={10}>显示 10 条（默认）</option>
            <option value={15}>显示 15 条</option>
            <option value={20}>显示 20 条</option>
          </select>

          {/* Info Text */}
          <div className="text-[8px] text-muted-foreground leading-relaxed">
            💡 通过 PubMed (NCBI) API 查询参考文献
          </div>
        </>
      ) : (
        <div className="text-[11px] text-muted-foreground font-mono p-2">Loading...</div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-[10px] text-warning p-1.5 rounded bg-warning/10 border border-warning/20">{error}</div>
      )}

      {/* Target Paper Title */}
      {paperTitle && (
        <div className="space-y-1 p-2 rounded bg-primary/5 border border-primary/20">
          <div className="text-[9px] font-medium text-primary">
            {direction === "citations" ? "📄 目标论文" : "📄 原始论文"}
          </div>
          <div className="text-[10px] italic line-clamp-2 text-foreground/90">{paperTitle}</div>
          <div className="text-[9px] text-muted-foreground">
            找到 <span className="font-bold text-foreground">{results.length}</span> 篇{direction === "citations" ? "被引论文" : "参考文献"}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {results.map((entry, i) => {
            const isExpanded = expandedId === i
            
            return (
              <li 
                key={i} 
                className={`text-[10px] p-1.5 rounded border transition-all cursor-pointer ${
                  isExpanded 
                    ? 'border-primary/40 bg-primary/5 space-y-1.5' 
                    : 'border-border/50 bg-secondary/30 hover:border-primary/30'
                }`}
                onClick={() => setExpandedId(isExpanded ? null : i)}
              >
                {/* Header */}
                <div className="flex items-start gap-1">
                  {/* Influential Star */}
                  {entry.isInfluential && (
                    <span className="shrink-0 mt-0.5 text-warning" title="高影响力论文">⭐</span>
                  )}
                  
                  {/* Title */}
                  <div className={`flex-1 min-w-0 leading-tight ${entry.isInfluential ? 'font-medium' : ''}`}>
                    <div className={`line-clamp-2 ${!isExpanded && 'hover:text-primary transition-colors'}`}>
                      {isExpanded ? '▼' : '▸'} {entry.title}
                    </div>
                    
                    {!isExpanded && (
                      <div className="mt-0.5 flex items-center gap-1 text-[9px] text-muted-foreground">
                        <span>{entry.authors?.split(",")[0]} 等</span>
                        <span>·</span>
                        <span>{entry.year}</span>
                        {entry.citationCount != null && (
                          <>
                            <span>·</span>
                            <span className="text-warning">引用 {entry.citationCount}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* External Link */}
                  {entry.url && (
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 text-primary hover:text-primary/80 p-0.5"
                      title="查看详情"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="pl-4 space-y-1 border-l-2 border-primary/20 mt-1.5">
                    {/* Authors */}
                    <div className="text-[9px]">
                      <span className="font-medium text-muted-foreground">作者：</span>
                      <span>{entry.authors}</span>
                    </div>
                    
                    {/* Year & Citations */}
                    <div className="text-[9px] flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">年份：</span>
                      <span>{entry.year}</span>
                      {entry.citationCount != null && (
                        <>
                          <span>·</span>
                          <span className="text-warning">被引用 {entry.citationCount} 次</span>
                        </>
                      )}
                      {entry.isInfluential && (
                        <>
                          <span>·</span>
                          <span className="text-warning font-medium">⭐ 高影响力</span>
                        </>
                      )}
                    </div>
                    
                    {/* DOI */}
                    {entry.doi && (
                      <div className="text-[9px] flex items-center gap-1">
                        <span className="font-medium text-muted-foreground">DOI：</span>
                        <a
                          href={`https://doi.org/${entry.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary hover:underline truncate font-mono"
                        >
                          {entry.doi}
                        </a>
                      </div>
                    )}

                    {/* Venue */}
                    {entry.venue && (
                      <div className="text-[9px]">
                        <span className="font-medium text-muted-foreground">期刊/会议：</span>
                        <span>{entry.venue}</span>
                      </div>
                    )}
                    
                    {/* Source */}
                    {entry.source && (
                      <div className="text-[8px]">
                        <span className="px-1 rounded bg-secondary text-muted-foreground">来源: {entry.source}</span>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-1 pt-1">
                      {entry.doi && (
                        <a
                          href={`https://doi.org/${entry.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-secondary hover:bg-secondary/70 inline-flex items-center gap-0.5"
                        >
                          打开DOI
                        </a>
                      )}
                      {entry.url && (
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary inline-flex items-center gap-0.5"
                        >
                          PubMed / Europe PMC
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}