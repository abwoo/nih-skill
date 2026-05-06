/**
 * Context Memory System - "网关式"持久化上下文记忆
 *
 * 功能：
 * 1. 跨会话保存用户偏好、分析过的论文、关键发现
 * 2. 每次对话自动注入相关上下文
 * 3. 本地持久化（localStorage，仅客户端）
 * 4. 服务端安全（Vercel/Node.js 环境下自动降级）
 */

const CONTEXT_MEMORY_KEY = 'bme-context-memory'
const MAX_MEMORY_ENTRIES = 50
const MAX_CONTEXT_LENGTH = 8000

export interface ContextMemory {
  id: string
  type: 'paper' | 'finding' | 'preference' | 'term' | 'method'
  title: string
  content: string
  source: string
  timestamp: number
  importance: 'high' | 'medium' | 'low'
  tags: string[]
}

interface ContextMemoryState {
  memories: ContextMemory[]
  lastUpdated: number
  totalInteractions: number
}

const defaultState: ContextMemoryState = {
  memories: [],
  lastUpdated: Date.now(),
  totalInteractions: 0,
}

function isServerSide(): boolean {
  return typeof window === 'undefined'
}

/**
 * 加载上下文记忆（从localStorage）
 */
export function loadContextMemory(): ContextMemoryState {
  if (isServerSide()) {
    return defaultState
  }

  try {
    const saved = localStorage.getItem(CONTEXT_MEMORY_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        ...defaultState,
        ...parsed,
        memories: (parsed.memories || []).slice(0, MAX_MEMORY_ENTRIES)
      }
    }
  } catch (e) {
    console.warn('[ContextMemory] Failed to load:', e)
  }
  return defaultState
}

/**
 * 保存上下文记忆（到localStorage）
 */
function saveContextMemory(state: ContextMemoryState): void {
  if (isServerSide()) {
    return
  }

  try {
    const trimmedMemories = state.memories
      .sort((a, b) => {
        const importanceOrder = { high: 0, medium: 1, low: 2 }
        return (importanceOrder[a.importance] || 1) - (importanceOrder[b.importance] || 1)
      })
      .slice(0, MAX_MEMORY_ENTRIES)

    localStorage.setItem(CONTEXT_MEMORY_KEY, JSON.stringify({
      ...state,
      memories: trimmedMemories,
      lastUpdated: Date.now()
    }))
  } catch (e) {
    console.warn('[ContextMemory] Failed to save:', e)
  }
}

/**
 * 添加新的上下文记忆
 */
export function addContextMemory(
  memory: Omit<ContextMemory, 'id' | 'timestamp'>
): void {
  const state = loadContextMemory()

  const newMemory: ContextMemory = {
    ...memory,
    id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  }

  // 检查是否已存在相似的记忆（避免重复）
  const exists = state.memories.some(
    m => m.title === newMemory.title && m.content.slice(0, 100) === newMemory.content.slice(0, 100)
  )

  if (!exists) {
    state.memories.unshift(newMemory)
    state.totalInteractions++
    saveContextMemory(state)

    console.log(`[ContextMemory] ✅ Added ${memory.type}: ${memory.title}`)
  }
}

/**
 * 批量添加论文分析结果（自动提取关键信息）
 */
export function addPaperAnalysisToMemory(paperData: {
  title: string
  authors?: string
  doi?: string
  findings?: string[]
  methods?: string
  innovationLevel?: string
  blockers?: string[]
}): void {
  const state = loadContextMemory()

  // 1. 添加论文基本信息
  addContextMemory({
    type: 'paper',
    title: paperData.title,
    content: [
      `Authors: ${paperData.authors || 'Unknown'}`,
      `DOI: ${paperData.doi || 'N/A'}`,
      `Innovation Level: ${paperData.innovationLevel || 'N/A'}`,
      `Methods: ${paperData.methods || 'N/A'}`,
    ].join('\n'),
    source: 'paper-analysis',
    importance: 'high',
    tags: ['paper', paperData.doi ? `doi:${paperData.doi}` : ''].filter(Boolean),
  })

  // 2. 添加关键发现
  if (paperData.findings && paperData.findings.length > 0) {
    addContextMemory({
      type: 'finding',
      title: `Key Findings: ${paperData.title.slice(0, 50)}...`,
      content: paperData.findings.join('\n• '),
      source: 'paper-analysis',
      importance: 'high',
      tags: ['finding', 'paper'],
    })
  }

  // 3. 添加致命缺陷（如果有）
  if (paperData.blockers && paperData.blockers.length > 0) {
    addContextMemory({
      type: 'finding',
      title: `Blockers: ${paperData.title.slice(0, 50)}...`,
      content: `Fatal Blockers Found:\n${paperData.blockers.join('\n• ')}`,
      source: 'paper-analysis',
      importance: 'medium',
      tags: ['blocker', 'warning'],
    })
  }

  console.log(`[ContextMemory] 📄 Paper analysis saved to memory`)
}

/**
 * 获取相关的上下文记忆（用于注入到AI请求中）
 */
export function getRelevantContext(query: string, maxChars: number = MAX_CONTEXT_LENGTH): string {
  const state = loadContextMemory()

  if (state.memories.length === 0) return ''

  // 简单的关键词匹配（后续可升级为向量相似度）
  const queryWords = query.toLowerCase().split(/\s+/)

  const relevantMemories = state.memories
    .map(memory => {
      let score = 0

      // 标题匹配
      queryWords.forEach(word => {
        if (memory.title.toLowerCase().includes(word)) score += 3
        if (memory.content.toLowerCase().includes(word)) score += 1
      })

      // 时间衰减（越新越重要）
      const ageHours = (Date.now() - memory.timestamp) / (1000 * 60 * 60)
      const timeBonus = Math.max(0, 10 - ageHours / 24) // 10天内加分

      // 重要性加权
      const importanceWeight = memory.importance === 'high' ? 5 :
                              memory.importance === 'medium' ? 3 : 1

      return { memory, score: score + timeBonus + importanceWeight }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10) // 取前10个最相关的
    .map(item => item.memory)

  if (relevantMemories.length === 0) return ''

  // 构建上下文字符串
  let contextStr = '\n═══════════════════════════════════════\n'
  contextStr += '🧠 RELEVANT CONTEXT MEMORY (Auto-injected)\n'
  contextStr += '═══════════════════════════════════════\n\n'

  let currentLength = contextStr.length

  for (const mem of relevantMemories) {
    const entry = `[${mem.type.toUpperCase()}] ${mem.title}\n${mem.content}\n\n`

    if (currentLength + entry.length > maxChars) break

    contextStr += entry
    currentLength += entry.length
  }

  contextStr += '═══════════════════════════════════════\n'

  console.log(`[ContextMemory] 📝 Injected ${relevantMemories.length} memories (${contextStr.length} chars)`)

  return contextStr
}

/**
 * 清除所有上下文记忆
 */
export function clearContextMemory(): void {
  if (isServerSide()) {
    return
  }

  try {
    localStorage.removeItem(CONTEXT_MEMORY_KEY)
    console.log('[ContextMemory] 🗑️ All memories cleared')
  } catch (e) {
    console.error('[ContextMemory] Failed to clear:', e)
  }
}

/**
 * 获取记忆统计信息
 */
export function getContextMemoryStats(): {
  totalMemories: number
  byType: Record<string, number>
  byImportance: Record<string, number>
  lastUpdated: string
  totalInteractions: number
} {
  const state = loadContextMemory()

  const byType: Record<string, number> = {}
  const byImportance: Record<string, number> = {}

  state.memories.forEach(mem => {
    byType[mem.type] = (byType[mem.type] || 0) + 1
    byImportance[mem.importance] = (byImportance[mem.importance] || 0) + 1
  })

  return {
    totalMemories: state.memories.length,
    byType,
    byImportance,
    lastUpdated: new Date(state.lastUpdated).toLocaleString(),
    totalInteractions: state.totalInteractions,
  }
}
