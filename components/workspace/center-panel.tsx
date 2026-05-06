"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { detectInputType as detectInputTypeApi, parsePdf, runAnalysis as runAnalysisApi } from "@/lib/api"
import { useStore } from "@/lib/store"
import type { Attachment, ChatMessage, IntentTag, ModuleId } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  FileText,
  Lightbulb,
  Link2,
  Loader2,
  MessageSquare,
  Paperclip,
  RotateCcw,
  Search,
  Send,
  Shield,
  X,
  Zap
} from "lucide-react"
import * as React from "react"
import { ChatAttachments, type AttachmentData } from "./attachment-card"
import { MarkdownRenderer } from "./markdown-renderer"

// DSML Tag Filter - Remove all DeepSeek Markup Language tags from content
function filterDSMLTags(content: string): string {
  if (!content) return content

  let filtered = content

  // Remove complete DSML tool call blocks
  filtered = filtered.replace(/<｜｜DSML｜｜tool_calls>[\s\S]*?<\/｜｜DSML｜｜tool_calls>/gi, '')

  // Remove individual invoke blocks
  filtered = filtered.replace(/<｜｜DSML｜｜invoke[^>]*>[\s\S]*?<\/｜｜DSML｜｜invoke>/gi, '')

  // Remove parameter tags
  filtered = filtered.replace(/<｜｜DSML｜｜parameter[^>]*\/?>/gi, '')

  // Remove any remaining DSML tags
  filtered = filtered.replace(/<｜｜DSML｜｜[^>]*>/gi, '')

  // Clean up extra whitespace
  filtered = filtered.replace(/\n{3,}/g, '\n\n')
  filtered = filtered.trim()

  return filtered
}

const MODULE_HEADERS: Record<ModuleId, { title: string; sub: string }> = {
  decompose: {
    title: "Analyze a single paper",
    sub: "decompose structure, detect Fatal Blockers, assess innovation level",
  },
  compare: {
    title: "Compare 2-4 papers",
    sub: "methods, datasets, innovation delta, research gaps",
  },
  reproduce: {
    title: "Reproduction blueprint",
    sub: "step-by-step plan to reproduce an experiment",
  },
  paradigm: {
    title: "Map methodological paradigms",
    sub: "landscape of a domain or task",
  },
  evidence: {
    title: "Verify evidence strength",
    sub: "of a scientific claim",
  },
  datasets: {
    title: "Dataset recommendations",
    sub: "and experiment roadmaps",
  },
}

const INTENTS: IntentTag[] = [
  "QUICK_READ",
  "EVIDENCE_VERIFY",
  "EXPERIMENT_REPRODUCE",
  "METHOD_COMPARE",
  "RESEARCH_IDEATION",
  "DATASET_MATCH",
]

// Mode configuration - ALL MODES NOW USE FULL CONTENT (User Requirement)
const MODE_CONFIG: Record<IntentTag, {
  icon: string
  title: string
  subtitle: string
  speed: "⚡⚡⚡" | "⚡⚡" | "⚡"
  time: string
  tools: number
  depth: "Quick" | "Standard" | "Deep" | "Comprehensive"
  useCases: string[]
  features: {
    parsePdf: boolean
    fatalBlockers: "required" | "optional" | "none"
    loadReference: boolean
    searchPapers: boolean
    extractFullText: boolean  // ALL MODES: true = always extract full text!
    getCitations: boolean
  }
  color: string
  description: string
}> = {
  QUICK_READ: {
    icon: "📖",
    title: "Quick Read",
    subtitle: "Full Content Overview",
    speed: "⚡⚡⚡",
    time: "~15s",
    tools: 3,
    depth: "Standard",
    useCases: ["Fast paper screening", "Initial assessment", "Meeting prep", "Literature survey"],
    features: { parsePdf: true, fatalBlockers: "optional", loadReference: false, searchPapers: false, extractFullText: true, getCitations: false },
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30 hover:border-green-400",
    description: "Complete paper analysis with full text extraction and key findings"
  },
  EVIDENCE_VERIFY: {
    icon: "🔍",
    title: "Evidence Verify",
    subtitle: "Fact-Checking",
    speed: "⚡⚡",
    time: "~25s",
    tools: 4,
    depth: "Deep",
    useCases: ["Claim validation", "Statistical review", "Reproducibility check", "Peer review support"],
    features: { parsePdf: true, fatalBlockers: "required", loadReference: true, searchPapers: true, extractFullText: true, getCitations: false },
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-400",
    description: "Verify scientific claims with full-text evidence assessment"
  },
  EXPERIMENT_REPRODUCE: {
    icon: "🔬",
    title: "Reproduce",
    subtitle: "Blueprint Gen",
    speed: "⚡",
    time: "~35s",
    tools: 5,
    depth: "Comprehensive",
    useCases: ["Implementation guide", "Code reproduction", "Lab replication", "Thesis methodology"],
    features: { parsePdf: true, fatalBlockers: "required", loadReference: true, searchPapers: true, extractFullText: true, getCitations: false },
    color: "from-purple-500/20 to-violet-500/20 border-purple-500/30 hover:border-purple-400",
    description: "Generate complete blueprint from full paper content"
  },
  METHOD_COMPARE: {
    icon: "⚖️",
    title: "Compare",
    subtitle: "Multi-Paper Analysis",
    speed: "⚡",
    time: "~40s",
    tools: 6,
    depth: "Comprehensive",
    useCases: ["Method selection", "State-of-art comparison", "Survey writing", "Tool evaluation"],
    features: { parsePdf: true, fatalBlockers: "required", loadReference: true, searchPapers: true, extractFullText: true, getCitations: true },
    color: "from-orange-500/20 to-amber-500/20 border-orange-500/30 hover:border-orange-400",
    description: "Side-by-side comparison with complete content understanding"
  },
  RESEARCH_IDEATION: {
    icon: "💡",
    title: "Ideate",
    subtitle: "Gap Analysis",
    speed: "⚡⚡",
    time: "~30s",
    tools: 4,
    depth: "Deep",
    useCases: ["Novel research ideas", "Gap identification", "Grant proposal", "PhD topic selection"],
    features: { parsePdf: true, fatalBlockers: "optional", loadReference: true, searchPapers: true, extractFullText: true, getCitations: true },
    color: "from-pink-500/20 to-rose-500/20 border-pink-500/30 hover:border-pink-400",
    description: "Identify gaps from comprehensive full-text analysis"
  },
  DATASET_MATCH: {
    icon: "📊",
    title: "Dataset Match",
    subtitle: "Data Recommendation",
    speed: "⚡⚡",
    time: "~25s",
    tools: 4,
    depth: "Deep",
    useCases: ["Dataset selection", "Benchmark finding", "Data sourcing", "Experiment planning"],
    features: { parsePdf: true, fatalBlockers: "optional", loadReference: true, searchPapers: true, extractFullText: true, getCitations: false },
    color: "from-teal-500/20 to-cyan-500/20 border-teal-500/30 hover:border-teal-400",
    description: "Find optimal datasets based on full paper context"
  }
}

type FetchStatus = "idle" | "fetching" | "success" | "error"

const detectInputType = detectInputTypeApi

// Extract DOIs from attachment content (simple regex)
function extractDOIsFromText(text: string): string[] {
  const doiPatterns = [
    /doi[:\s]*(10\.\d{4,9}\/[^\s]+)/gi,
    /(10\.\d{4,9}\/[^\s]+)/g,
  ]
  const found = new Set<string>()
  for (const pattern of doiPatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      found.add(match[1] || match[0])
    }
  }
  return Array.from(found)
}

export function CenterPanel({ decorative = false }: { decorative?: boolean }) {
  const {
    config, module, pushHistory, prefill, consumePrefill,
    result, setResult, appendResult, finishResult, showToast,
    setSettingsOpen,
    // ChatGPT-style conversation management
    createNewConversation, addMessage, switchConversation,
    currentConversationId, getCurrentConversation, autoGenerateTitle,
  } = useStore()

  // Input state
  const [input, setInput] = React.useState("")
  const [intent, setIntent] = React.useState<IntentTag>("QUICK_READ")
  const [paperB, setPaperB] = React.useState("")
  const [extraPapers, setExtraPapers] = React.useState<string[]>([])
  const [domain, setDomain] = React.useState("ECG")
  const [scope, setScope] = React.useState<"Partial" | "Full" | "Extended">("Full")
  const [env, setEnv] = React.useState<string[]>(["Single GPU"])
  const [fetchStatus, setFetchStatus] = React.useState<FetchStatus>("idle")

  // Attachments (file cards)
  const [attachments, setAttachments] = React.useState<Attachment[]>([])

  // Mode selector state
  const [showModeSelector, setShowModeSelector] = React.useState(false)
  const [selectedModeDetail, setSelectedModeDetail] = React.useState<IntentTag | null>(null)

  // DOI dialog state
  const [doiDialogOpen, setDoiDialogOpen] = React.useState(false)
  const [tempDoiInput, setTempDoiInput] = React.useState("")

  // Conversation state
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [streamingContent, setStreamingContent] = React.useState("")

  // Refs to avoid infinite loops
  const moduleRef = React.useRef(module)
  const setResultRef = React.useRef(setResult)
  const setIsLoadingRef = React.useRef(setIsLoading)
  const setStreamingContentRef = React.useRef(setStreamingContent)
  const setMessagesRef = React.useRef(setMessages)
  const setAttachmentsRef = React.useRef(setAttachments)

  // Track if component is mounted to avoid unnecessary effects
  const isMountedRef = React.useRef(false)

  // Keep refs current (but don't cause re-renders)
  React.useEffect(() => {
    setResultRef.current = setResult
    setIsLoadingRef.current = setIsLoading
    setStreamingContentRef.current = setStreamingContent
    setMessagesRef.current = setMessages
    setAttachmentsRef.current = setAttachments

    // Mark as mounted after first render
    if (!isMountedRef.current) {
      isMountedRef.current = true
      moduleRef.current = module
    }
  })

  // Reset on module change - with proper guard against infinite loops
  React.useEffect(() => {
    // Skip if not mounted yet or if module hasn't actually changed
    if (!isMountedRef.current || moduleRef.current === module) return

    // Update the ref first to prevent re-triggering
    const prevModule = moduleRef.current
    moduleRef.current = module

    // Only reset if this is a genuine module change (not initial render)
    if (prevModule && prevModule !== module) {
      // Use setTimeout to break potential synchronous update cycles
      setTimeout(() => {
        setResult(null)
        setIsLoading(false)
        setStreamingContent("")
        setMessages([])
        setAttachments([])
        setInput("")
      }, 0)
    }
  }, [module, setResult, setIsLoading, setStreamingContent, setMessages, setAttachments])

  // Handle prefill
  React.useEffect(() => {
    if (prefill && !decorative) {
      const v = consumePrefill()
      if (v) setInput(v)
    }
  }, [prefill, decorative, consumePrefill])

  // ===== CHATGPT-STYLE: Load conversation messages when switching conversations =====
  React.useEffect(() => {
    if (!currentConversationId) {
      // No active conversation - clear messages (or keep empty for new conversation)
      setMessages([])
      return
    }

    // Get the current conversation from store
    const conv = getCurrentConversation()

    if (conv && conv.messages.length > 0) {
      // Load existing messages from the switched-to conversation
      setMessages(conv.messages)

      // Also restore other state based on conversation
      setResult(null)
      setIsLoading(false)
      setStreamingContent("")

      console.log(`[CenterPanel] Loaded ${conv.messages.length} messages from conversation: ${conv.title}`)
    } else {
      // New or empty conversation - start fresh
      setMessages([])
    }
  }, [currentConversationId])  // Only depend on currentConversationId to avoid infinite loops

  // Auto-detect intent
  React.useEffect(() => {
    if (!input) return
    const t = input.toLowerCase()
    if (t.includes("compare")) setIntent("METHOD_COMPARE")
    else if (t.includes("reproduce")) setIntent("EXPERIMENT_REPRODUCE")
    else if (t.includes("verify") || t.includes("claim")) setIntent("EVIDENCE_VERIFY")
    else if (t.includes("dataset")) setIntent("DATASET_MATCH")
    else if (t.includes("idea") || t.includes("gap")) setIntent("RESEARCH_IDEATION")
    else setIntent("QUICK_READ")
  }, [input])

  // Main analysis function - with true Agent capabilities
  async function handleAnalyze() {
    if (decorative) return
    if (!config.apiKey || !config.model || !config.provider) {
      setSettingsOpen(true)
      showToast("⚠️ Please configure your API Key in Settings first")
      return
    }

    let userQuery = input.trim()
    if (attachments.length > 0 && !userQuery) {
      userQuery = `Please analyze the attached ${attachments.length} file(s)`
    }

    if (!userQuery && attachments.length === 0) {
      showToast("⚠️ Please enter text or upload files")
      return
    }

    // ===== CHATGPT-STYLE CONVERSATION MANAGEMENT =====
    // Ensure we have an active conversation, create one if needed
    let activeConversationId = currentConversationId

    if (!activeConversationId) {
      // No active conversation - create a new one (ChatGPT behavior)
      activeConversationId = createNewConversation(module)
      showToast("✨ New conversation started")
    }

    setIsLoading(true)
    setStreamingContent("")

    // Convert attachments to AttachmentData format for display
    const attachmentData: AttachmentData[] = attachments.map(att => ({
      id: att.id,
      name: att.name,
      type: att.type as AttachmentData['type'],
      size: att.size,
      content: att.content,
      pages: att.pages,
      doi: att.type === 'doi' ? att.content : undefined,
      status: 'ready' as const,
    }))

    // Build user message for display (ChatGPT style: text + cards)
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userQuery || (attachments.length > 0 ? `Please analyze the attached file(s)` : ""),
      timestamp: Date.now(),
      attachments: attachments.map(att => ({
        name: att.name,
        type: att.type as "pdf" | "text" | "doi" | "url",
        content: att.content,
      })),
    }
    setMessages(prev => [...prev, userMsg])

    // Save user message to conversation
    addMessage(activeConversationId, userMsg)

    try {
      // ===== AGENT-STYLE MESSAGE CONSTRUCTION WITH SKILL MODULE BINDING =====

      // Module-to-Reference Mapping (from SKILL.md + research-synthesis-matching.md)
      const moduleReferenceMap: Record<ModuleId, { domain: string; primaryRefs: string[]; protocol: string; focus: string }> = {
        decompose: {
          domain: "deep learning",
          primaryRefs: ["deep-learning-bme.md", "research-synthesis-matching.md"],
          protocol: "Full Decomposition Protocol (Step 0-8)",
          focus: "Paper decomposition, innovation assessment (L1-L5c), fatal blocker detection (FB-1 to FB-11)"
        },
        compare: {
          domain: "deep learning",
          primaryRefs: ["deep-learning-bme.md", "clinical-statistical-framework.md"],
          protocol: "Multi-Paper Comparison Protocol",
          focus: "Method comparison, dataset comparison, innovation delta analysis, paradigm mapping"
        },
        reproduce: {
          domain: "reproducibility",
          primaryRefs: ["reproducibility-infrastructure.md", "experimental-design-methodology.md"],
          protocol: "Reproduction Blueprint Protocol (Step 0-6)",
          focus: "Step-by-step reproduction guide, environment setup, data/code acquisition"
        },
        paradigm: {
          domain: "imaging",
          primaryRefs: ["medical-imaging-methodology.md", "database-api-guide.md"],
          protocol: "Paradigm Mapping Protocol",
          focus: "Methodological landscape mapping, trend identification, gap analysis"
        },
        evidence: {
          domain: "clinical",
          primaryRefs: ["clinical-statistical-framework.md", "research-synthesis-matching.md"],
          protocol: "Evidence Verification Protocol (TRIPOD/STARD)",
          focus: "Evidence strength verification, supporting/contradictory evidence, clinical validation levels"
        },
        datasets: {
          domain: "ecg",
          primaryRefs: ["physionet-datasets.md", "signal-processing-foundations.md"],
          protocol: "Dataset Recommendation + Experiment Roadmap",
          focus: "Dataset matching, experiment design, preprocessing pipeline, evaluation metrics"
        },
      }

      const currentModuleConfig = moduleReferenceMap[module] || moduleReferenceMap.decompose

      let agentInput = ""

      if (attachments.length > 0) {
        const allDOIs: string[] = []
        const attachmentInfos: string[] = []

        for (const att of attachments) {
          const info = [`[FILE: ${att.name}]`, `Type: ${att.type.toUpperCase()}`, `Size: ${(att.size / 1024 / 1024).toFixed(1)}MB`]
          if (att.pages) info.push(`Pages: ${att.pages}`)
          if (att.type === 'pdf') {
            const doIs = extractDOIsFromText(att.content)
            if (doIs.length > 0) {
              info.push(`DOIs found: ${doIs.join(", ")}`)
              allDOIs.push(...doIs)
            }
            info.push(`Content preview:\n${att.content.slice(0, 3000)}${att.content.length > 3000 ? '\n... [truncated]' : ''}`)
          } else if (att.type === 'doi') {
            info.push(`DOI: ${att.content}`)
            allDOIs.push(att.content)
          } else {
            info.push(`Content:\n${att.content}`)
          }

          attachmentInfos.push(info.join("\n"))
        }

        // SKILL-Aligned message construction with module-specific context
        const parts = [
          `🎯 SKILL MODULE: ${module.toUpperCase()}`,
          `📋 PROTOCOL: ${currentModuleConfig.protocol}`,
          `📚 PRIMARY REFERENCES: ${currentModuleConfig.primaryRefs.join(", ")}`,
          ``,
          `📋 USER REQUEST: ${userQuery || "Please analyze the attached files"}`,
          ``,
          `📎 ATTACHED FILES (${attachments.length}):`,
          ...attachmentInfos.map((info, i) => `\n--- File ${i + 1} ---\n${info}`),
        ]

        if (allDOIs.length > 0) {
          parts.push(
            ``,
            `🔗 DETECTED DOIs [SKILL Step 0]:`,
            ...allDOIs.map(doi => `- ${doi}`),
          )
        }

        // SKILL-Aligned Mandatory Workflow Instructions
        parts.push(
          ``,
          `⚡ MANDATORY WORKFLOW [SKILL Automatic Reasoning Protocol]:`,
          ``,
          `[PHASE 1 - ACQUISITION]`,
          `1. parse_pdf_content(filename, content_preview) for each PDF`,
          `2. resolve_doi(doi) for each detected DOI`,
          `3. fetch_paper(input) using 6-level priority strategy`,
          ``,
          `[PHASE 2 - KNOWLEDGE INTEGRATION]`,
          `4. load_reference(domain="${currentModuleConfig.domain}") → loads: ${currentModuleConfig.primaryRefs[0]}`,
          ``,
          `[PHASE 3 - ANALYSIS]`,
          `5. extract_full_text_knowledge(full_text_content) → 10-section extraction`,
          `6. check_fatal_blockers(paper_context, bme_domain="${currentModuleConfig.domain}") → FB-1~FB-11`,
          `7. search_papers/get_citations as needed`,
          ``,
          `[PHASE 4 - OUTPUT]`,
          `8. Structured report: Innovation Level (L1-L5c) | Clinical Validation (V0-V5) | Blocker Verdict | Reproducibility Score`,
          ``,
          `🎯 FOCUS: ${currentModuleConfig.focus}`,
        )

        agentInput = parts.join("\n")

        showToast(`🔬 ${module.toUpperCase()} analysis... 📚 ${currentModuleConfig.primaryRefs[0]}${allDOIs.length > 0 ? ` | 🔗 ${allDOIs.length} DOI(s)` : ""}`)

      } else {
        agentInput = [
          `🎯 SKILL MODULE: ${module.toUpperCase()}`,
          `📋 PROTOCOL: ${currentModuleConfig.protocol}`,
          `📚 DOMAIN: ${currentModuleConfig.domain}`,
          ``,
          `📋 QUERY: ${userQuery}`,
          ``,
          `⚡ WORKFLOW: load_reference("${currentModuleConfig.domain}") → search_papers → analyze using ${currentModuleConfig.protocol}`,
          `🎯 Focus: ${currentModuleConfig.focus}`,
        ].join("\n")
      }

      await runAnalysisApi(
        {
          config,
          module,
          input: agentInput,
          intent,
          paperB,
          extraPapers,
          domain,
          scope,
          env,
          customPrompt: attachments.length > 0
            ? "Analyze the provided file(s) comprehensively. The file content is included both in the input and as structured attachments."
            : undefined,
          // CRITICAL: Pass attachments separately to ensure content is delivered
          attachments: attachments.map(att => ({
            name: att.name,
            type: att.type as "pdf" | "text" | "doi" | "url",
            content: att.content,
          })),
          // NEW: Pass conversation history for context continuity
          conversationHistory: messages.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
        },
        {
          onToken: (token) => {
            setStreamingContent(prev => prev + token)
          },
          onDone: (fullText) => {
            setIsLoading(false)
            setStreamingContent("")

            // 🆕 Dead Loop Detection - Detect if AI is stuck in "asking mode"
            const deadLoopPatterns = [
              /你想深入哪个方向/i,
              /which direction would you like/i,
              /what would you like me to do/i,
              /我可以帮您.*\n.*1\./,  // Lists options with numbers
              /please tell me which/i,
              /请告诉我.*深入/i,
            ]

            const isDeadLoop = deadLoopPatterns.some(pattern => pattern.test(fullText || ''))

            if (isDeadLoop && fullText.length < 500) {
              console.warn('[DeadLoop] ⚠️ Detected potential loop! Auto-retrying with explicit instruction...')

              // Auto-fix: Send a follow-up message forcing execution
              setTimeout(() => {
                const forceExecuteMsg = `⚠️ IMPORTANT: Do NOT ask questions or list options. IMMEDIATELY execute the task I just requested. Provide the actual analysis/results now without any further clarification needed.`

                // Re-trigger analysis with force-execute instruction
                handleSendFollowUp(forceExecuteMsg)
              }, 500)

              // Don't add the looping message to history
              return
            }

            // Keep attachments for follow-up messages (don't clear!)

            if (fullText?.trim()) {
              const assistantMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: fullText,
                timestamp: Date.now(),
              }
              setMessages(prev => [...prev, assistantMsg])

              // Save to conversation with proper ID
              addMessage(activeConversationId, assistantMsg)

              // Auto-generate title from first user message (ChatGPT style)
              const currentConv = getCurrentConversation()
              if (currentConv && currentConv.messages.length <= 2) { // Only for first exchange
                autoGenerateTitle(activeConversationId, userQuery || "File Analysis")
              }

              pushHistory({
                id: crypto.randomUUID(),
                ts: Date.now(),
                module,
                title: fullText.match(/#\s+(.+)/)?.[1]?.slice(0, 60) || fullText.slice(0, 60),
                level: fullText.match(/L[1-5][a-z]?/)?.[0] || "L3",
                verdict: (fullText.match(/\b(FULL|PARTIAL|BLOCKED)\b/)?.[0] || "PARTIAL") as "FULL" | "PARTIAL" | "BLOCKED",
              })
            } else {
              showToast("⚠️ No response received")
            }
          },
          onError: (error) => {
            setIsLoading(false)
            setStreamingContent("")

            const errorMsg: ChatMessage = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `❌ Error: ${error}`,
              timestamp: Date.now(),
            }
            setMessages(prev => [...prev, errorMsg])
            showToast(`Analysis failed: ${error}`)
          },
        },
      )
    } catch (err) {
      setIsLoading(false)
      setStreamingContent("")
      showToast(`Error: ${(err as Error).message}`)
    }
  }

  // Follow-up / Continue chat
  async function handleSendFollowUp(forceMessage?: string) {
    const followUpText = forceMessage || streamingContent || input
    if (!followUpText.trim() && attachments.length === 0) return

    // ===== CHATGPT-STYLE CONVERSATION MANAGEMENT =====
    // Ensure we have an active conversation for follow-up
    let activeConversationId = currentConversationId

    if (!activeConversationId) {
      // No active conversation - create a new one (shouldn't normally happen, but just in case)
      activeConversationId = createNewConversation(module)
    }

    // Build message with attachments (ChatGPT style)
    let agentInput = followUpText

    // Prepare attachment data for display
    const messageAttachments = attachments.length > 0 ? attachments.map(att => ({
      name: att.name,
      type: att.type as "pdf" | "text" | "doi" | "url",
      content: att.content,
    })) : undefined

    if (attachments.length > 0) {
      const attachmentParts: string[] = []
      attachmentParts.push(`\n\n📎 ATTACHED FILES (${attachments.length}):`)

      for (const att of attachments) {
        const info = [`\n--- ${att.name} ---`, `Type: ${att.type.toUpperCase()}`, `Size: ${(att.size / 1024 / 1024).toFixed(1)}MB`]

        if (att.type === 'pdf' || att.type === 'text') {
          // Extract DOIs from content if PDF/text
          const doIs = extractDOIsFromText(att.content)
          if (doIs.length > 0) {
            info.push(`DOIs found: ${doIs.join(", ")}`)
          }
          // Include content preview
          info.push(`Content preview:\n${att.content.slice(0, 5000)}${att.content.length > 5000 ? '\n... [truncated]' : ''}`)
        } else if (att.type === 'doi') {
          info.push(`DOI: ${att.content}`)
        }

        attachmentParts.push(info.join("\n"))
      }

      attachmentParts.push(
        ``,
        `⚠️ INSTRUCTIONS - MANDATORY: Use parse_pdf_content tool for PDFs, resolve_doi for DOIs`
      )

      agentInput = followUpText + attachmentParts.join("")
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: followUpText.trim() || (attachments.length > 0 ? `Continue analysis with attached file(s)` : ""),
      timestamp: Date.now(),
      attachments: messageAttachments,
    }
    setMessages(prev => [...prev, userMsg])

    // Save follow-up message to conversation
    addMessage(activeConversationId, userMsg)

    setInput("")
    setIsLoading(true)
    setStreamingContent("")

    try {
      await runAnalysisApi(
        {
          config,
          module,
          input: agentInput,  // Use agentInput which includes attachments with instructions
          intent: "QUICK_READ",
          customPrompt: attachments.length > 0
            ? "This is a follow-up question with attached files. CRITICAL: You MUST use parse_pdf_content tool for PDFs and resolve_doi for DOIs immediately."
            : "This is a follow-up question. Maintain context and provide focused response.",
          // CRITICAL: Pass attachments for follow-up messages too
          attachments: attachments.map(att => ({
            name: att.name,
            type: att.type as "pdf" | "text" | "doi" | "url",
            content: att.content,
          })),
          // NEW: Pass conversation history for context continuity
          conversationHistory: messages.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
        },
        {
          onToken: (token) => setStreamingContent(prev => prev + token),
          onDone: (fullText) => {
            setIsLoading(false)
            setStreamingContent("")

            // Clear attachments from bottom after successful send (ChatGPT style)
            if (attachments.length > 0) {
              setAttachments([])
            }

            if (fullText?.trim()) {
              const assistantMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: fullText,
                timestamp: Date.now(),
              }
              setMessages(prev => [...prev, assistantMsg])

              // Save follow-up response to conversation
              addMessage(activeConversationId, assistantMsg)
            }
          },
          onError: (error) => {
            setIsLoading(false)
            setStreamingContent("")
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `❌ Error: ${error}`,
              timestamp: Date.now(),
            }])
          },
        },
      )
    } catch (err) {
      setIsLoading(false)
      setStreamingContent("")
    }
  }

  // File attachment handlers
  function handleAttachFiles() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".pdf,.txt,.md"
    input.multiple = true
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      for (const file of files) {
        if (file.size > 30 * 1024 * 1024) {
          showToast(`${file.name}: Too large (>30MB)`)
          continue
        }

        setFetchStatus("fetching")

        try {
          if (file.name.endsWith('.pdf')) {
            const result = await parsePdf(file)
            if (result.success && result.text) {
              const pagesMatch = result.text.match(/Pages:\s*(\d+)/)
              const newAtt: Attachment = {
                id: crypto.randomUUID(),
                name: file.name,
                type: "pdf",
                size: file.size,
                content: result.text,
                pages: pagesMatch ? parseInt(pagesMatch[1]) : undefined,
              }

              // Auto-extract DOIs from PDF content and create DOI cards
              const extractedDOIs = extractDOIsFromText(result.text)

              setAttachments(prev => [...prev, newAtt])
              showToast(`✓ ${file.name} (${newAtt.pages || "?"} pages)${extractedDOIs.length > 0 ? ` · Found ${extractedDOIs.length} DOI(s)` : ""}`)

              // If DOIs found, automatically add them as separate DOI attachments
              if (extractedDOIs.length > 0) {
                setTimeout(() => {
                  extractedDOIs.forEach(doi => {
                    const doiAtt: Attachment = {
                      id: crypto.randomUUID(),
                      name: `DOI: ${doi.slice(0, 30)}...`,
                      type: "doi",
                      size: 0,
                      content: doi,
                    }
                    setAttachments(prev => [...prev, doiAtt])
                  })
                  showToast(`🔗 Added ${extractedDOIs.length} DOI card(s) from PDF`)
                }, 500) // Small delay to show PDF first
              }
            } else throw new Error(result.error)
          } else {
            const text = await file.text()
            const newAtt: Attachment = {
              id: crypto.randomUUID(),
              name: file.name,
              type: "text",
              size: file.size,
              content: text,
            }
            setAttachments(prev => [...prev, newAtt])
            showToast(`✓ ${file.name}`)
          }
          setFetchStatus("success")
        } catch (err) {
          setFetchStatus("error")
          showToast(`Failed: ${(err as Error).message}`)
        }
      }
      setTimeout(() => setFetchStatus("idle"), 2000)
    }
    input.click()
  }

  function removeAttachment(id: string) {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  function handleNewChat() {
    setMessages([])
    setAttachments([])
    setInput("")
    setResult(null)
    showToast("New conversation started")
  }

  // Render helpers
  const header = MODULE_HEADERS[module]

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-background/40 shrink-0">
        <h1 className="text-base font-semibold tracking-tight">{header.title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{header.sub}</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Empty State */}
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-medium mb-2">{header.title}</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Upload a PDF, paste a DOI/URL, or describe your research question to get started.
            </p>
          </div>
        )}

        {/* Messages List */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 max-w-3xl",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium",
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            )}>
              {msg.role === "user" ? "U" : "AI"}
            </div>

            {/* Bubble */}
            <div className={cn(
              "rounded-2xl px-4 py-3 max-w-[80%]",
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border"
            )}>
              {/* Show attachment cards for user messages (ChatGPT style) */}
              {msg.role === "user" && msg.attachments && msg.attachments.length > 0 && (
                <ChatAttachments
                  attachments={msg.attachments.map(att => ({
                    id: crypto.randomUUID(),
                    name: att.name,
                    type: att.type,
                    size: 0, // Size not stored in message attachments
                    content: att.content?.slice(0, 500), // Only store preview
                  }))}
                />
              )}

              {/* Message text (only show if there's actual text content) */}
              {msg.content && msg.content.trim() && (
                <div className={cn(
                  "text-sm leading-relaxed",
                  msg.role === "assistant" ? "text-foreground prose prose-sm max-w-none" : ""
                )}>
                  {msg.role === "assistant" ? (
                    // AI messages: Use Markdown renderer with DSML filtering
                    <MarkdownRenderer
                      markdown={filterDSMLTags(msg.content)}
                      className="prose-p:text-foreground/90 prose-headings:text-foreground"
                    />
                  ) : (
                    // User messages: Plain text
                    <div className="whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  )}
                </div>
              )}
              <div className={cn(
                "text-[10px] mt-1",
                msg.role === "user" ? "text-primary-foreground/60 text-right" : "text-muted-foreground"
              )}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-medium shrink-0">
              AI
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>

              {streamingContent && (
                <div className="mt-2 text-sm leading-relaxed text-foreground/90 prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap">
                    {filterDSMLTags(streamingContent)}<span className="animate-pulse">▊</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div data-tour="input-area" className="border-t border-border bg-card/50 p-4 shrink-0">
        {/* Attachment Cards */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/60 border border-border hover:bg-secondary transition-colors"
              >
                <FileText className={cn(
                  "w-4 h-4",
                  att.type === "pdf" ? "text-red-400" : "text-blue-400"
                )} />
                <span className="text-xs font-medium truncate max-w-[120px]">{att.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {(att.size / 1024 / 1024).toFixed(1)}MB
                </span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-danger/10 text-danger transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Row */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendFollowUp()
              }
            }}
            placeholder={
              messages.length === 0
                ? "Paste DOI, arXiv ID, URL, or describe your research question..."
                : "Ask a follow-up question or add more context..."
            }
            rows={messages.length === 0 ? 3 : 1}
            className="flex-1 resize-none bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
          />

          <Button
            onClick={messages.length === 0 ? handleAnalyze : () => handleSendFollowUp()}
            disabled={isLoading || (!input.trim() && messages.length === 0)}
            className="px-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <button
            onClick={handleAttachFiles}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Paperclip className="w-3.5 h-3.5" /> Attach Files
          </button>

          <button
            onClick={() => {
              const doi = prompt("Enter DOI:")
              if (doi?.trim()) {
                const att: Attachment = {
                  id: crypto.randomUUID(),
                  name: `DOI: ${doi.trim()}`,
                  type: "doi",
                  size: 0,
                  content: doi.trim(),
                }
                setAttachments(prev => [...prev, att])
                showToast(`DOI added: ${doi.trim()}`)
              }
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Link2 className="w-3.5 h-3.5" /> Add DOI
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" /> New Chat
            </button>
          )}

          {/* Mode Selector - Always visible */}
          <div className="relative">
            <button
              onClick={() => setShowModeSelector(!showModeSelector)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                showModeSelector
                  ? "bg-primary/10 border border-primary text-primary"
                  : "bg-background border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <Zap className="w-3.5 h-3.5" />
              {MODE_CONFIG[intent].icon} {MODE_CONFIG[intent].title}
              <ChevronDown className={cn("w-3 h-3 transition-transform", showModeSelector && "rotate-180")} />
            </button>

            {/* Mode Selector Dropdown - Positioned better */}
            {showModeSelector && (
              <>
                {/* Backdrop to close on click outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowModeSelector(false)}
                />

                <div className="absolute bottom-full right-0 mb-2 w-[520px] bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-[80vh] overflow-y-auto">
                  {/* Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-violet-500/10 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Analysis Mode Selector</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Choose the best mode for your task</p>
                      </div>
                      <button
                        onClick={() => setShowModeSelector(false)}
                        className="p-1 rounded-md hover:bg-secondary transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Mode Cards Grid */}
                  <div className="p-3 grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                    {(Object.keys(MODE_CONFIG) as IntentTag[]).map((modeKey) => {
                      const mode = MODE_CONFIG[modeKey]
                      const isSelected = intent === modeKey
                      const isHovered = selectedModeDetail === modeKey

                      return (
                        <button
                          key={modeKey}
                          onClick={() => {
                            setIntent(modeKey)
                            setSelectedModeDetail(modeKey)
                          }}
                          onMouseEnter={() => setSelectedModeDetail(modeKey)}
                          onMouseLeave={() => setSelectedModeDetail(null)}
                          className={cn(
                            "relative p-3 rounded-lg border text-left transition-all",
                            isSelected
                              ? `bg-gradient-to-br ${mode.color} ring-2 ring-primary/30`
                              : "bg-background hover:bg-secondary/50 border-border hover:border-primary/30"
                          )}
                        >
                          {/* Mode Header */}
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-lg">{mode.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-xs text-foreground">{mode.title}</div>
                              <div className="text-[10px] text-muted-foreground">{mode.subtitle}</div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                            )}
                          </div>

                          {/* Speed & Tools */}
                          <div className="flex items-center gap-3 mb-2 text-[10px]">
                            <span className={cn(
                              "font-medium",
                              mode.speed === "⚡⚡⚡" ? "text-green-500" :
                              mode.speed === "⚡⚡" ? "text-yellow-500" :
                              "text-orange-500"
                            )}>
                              {mode.speed} {mode.time}
                            </span>
                            <span className="text-muted-foreground">
                              🛠️ {mode.tools} tools
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-secondary text-[9px]">
                              {mode.depth}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">
                            {mode.description}
                          </p>

                          {/* Use Cases */}
                          <div className="flex flex-wrap gap-1">
                            {mode.useCases.slice(0, 2).map((useCase) => (
                              <span key={useCase} className="px-1.5 py-0.5 rounded bg-secondary/50 text-[9px] text-muted-foreground">
                                {useCase}
                              </span>
                            ))}
                            {mode.useCases.length > 2 && (
                              <span className="px-1.5 py-0.5 rounded bg-secondary/50 text-[9px] text-muted-foreground">
                                +{mode.useCases.length - 2} more
                              </span>
                            )}
                          </div>

                          {/* Feature Icons (simplified) */}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-40">
                            {mode.features.parsePdf && <span title="PDF Parsing"><FileText className="w-3 h-3" /></span>}
                            {mode.features.fatalBlockers === "required" && <span title="Fatal Blockers"><Shield className="w-3 h-3" /></span>}
                            {mode.features.loadReference && <span title="References"><BookOpen className="w-3 h-3" /></span>}
                            {mode.features.searchPapers && <span title="Paper Search"><Search className="w-3 h-3" /></span>}
                            {mode.features.extractFullText && <span title="Full Extraction"><Brain className="w-3 h-3" /></span>}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Selected Mode Detail Panel */}
                  {selectedModeDetail && (
                    <div className="px-4 py-3 bg-secondary/20 border-t border-border">
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                          <span>{MODE_CONFIG[selectedModeDetail].icon}</span>
                          {MODE_CONFIG[selectedModeDetail].title} - Detailed Features
                        </h4>

                        {/* Features Table */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                          <div className="flex items-center justify-between py-1 border-b border-border/30">
                            <span className="text-muted-foreground">📄 PDF Parse</span>
                            <span>{MODE_CONFIG[selectedModeDetail].features.parsePdf ? "✅" : "❌"}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-border/30">
                            <span className="text-muted-foreground">⛔ Fatal Blockers</span>
                            <span className={
                              MODE_CONFIG[selectedModeDetail].features.fatalBlockers === "required" ? "text-red-400" :
                              MODE_CONFIG[selectedModeDetail].features.fatalBlockers === "optional" ? "text-yellow-400" :
                              "text-gray-400"
                            }>
                              {MODE_CONFIG[selectedModeDetail].features.fatalBlockers === "required" ? "Required" :
                               MODE_CONFIG[selectedModeDetail].features.fatalBlockers === "optional" ? "Optional" : "None"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-border/30">
                            <span className="text-muted-foreground">📚 References</span>
                            <span>{MODE_CONFIG[selectedModeDetail].features.loadReference ? "✅" : "❌"}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-border/30">
                            <span className="text-muted-foreground">🔍 Paper Search</span>
                            <span>{MODE_CONFIG[selectedModeDetail].features.searchPapers ? "✅" : "❌"}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-border/30">
                            <span className="text-muted-foreground">🧠 Full Extraction</span>
                            <span>{MODE_CONFIG[selectedModeDetail].features.extractFullText ? "✅" : "❌"}</span>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-muted-foreground">📊 Citations</span>
                            <span>{MODE_CONFIG[selectedModeDetail].features.getCitations ? "✅" : "❌"}</span>
                          </div>
                        </div>

                        {/* Best For */}
                        <div className="mt-2 p-2 rounded bg-background/50">
                          <div className="text-[10px] font-medium text-foreground mb-1">Best For:</div>
                          <div className="flex flex-wrap gap-1">
                            {MODE_CONFIG[selectedModeDetail].useCases.map((uc) => (
                              <span key={uc} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px]">
                                {uc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Tips Footer */}
                  <div className="px-4 py-2 bg-primary/5 border-t border-border">
                    <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
                      <Lightbulb className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>💡 Tip:</strong>{" "}
                        {intent === "QUICK_READ"
                          ? "Use this for fast paper screening - perfect for literature reviews!"
                          : intent === "EVIDENCE_VERIFY"
                          ? "Best for peer review or validating claims before citing a paper"
                          : intent === "EXPERIMENT_REPRODUCE"
                          ? "Essential when you need to implement or reproduce an experiment"
                          : intent === "METHOD_COMPARE"
                          ? "Choose this when deciding between multiple approaches or tools"
                          : intent === "RESEARCH_IDEATION"
                          ? "Great for identifying novel research directions or grant proposals"
                          : "Perfect when you need datasets for your experiments"}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
