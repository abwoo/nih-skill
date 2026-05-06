import { searchPapersDirect, type SearchResult } from './search-service'
import LRU from 'lru-cache'

export type SearchIntentType = 'LITERATURE_UPDATE' | 'PAPER_COMPLETION' | 'BACKGROUND_KNOWLEDGE' | 'VERIFICATION'

export interface SearchIntent {
  type: SearchIntentType
  confidence: number
  query: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  expectedResults: number
  timeFilter?: string
}

interface ConversationContext {
  userMessage: string
  conversationHistory: Array<{ role: string; content: string }>
  currentDomain?: string
  mentionedPapers?: string[]
  lastSearchTime?: Date
}

interface CacheEntry {
  results: SearchResult[]
  timestamp: Date
  query: string
  source: string
}

const SEARCH_TRIGGERS: Array<{
  pattern: RegExp
  type: SearchIntentType
  timeFilter?: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}> = [
  {
    pattern: /latest.*research|recent.*study|new.*paper|最新.*研究|最新.*进展|最新.*论文/i,
    type: 'LITERATURE_UPDATE',
    timeFilter: '6months',
    priority: 'HIGH'
  },
  {
    pattern: /\b(10\.\d{4,}\/[^\s]+)\b/,
    type: 'PAPER_COMPLETION',
    priority: 'HIGH'
  },
  {
    pattern: /(verify|validate|confirm|contradict|反驳|验证|确认|矛盾).*(finding|result|conclusion|发现|结果|结论)/i,
    type: 'VERIFICATION',
    priority: 'MEDIUM'
  },
  {
    pattern: /background|introduction|overview|review|背景|介绍|综述|概述/i,
    type: 'BACKGROUND_KNOWLEDGE',
    priority: 'LOW'
  },
  {
    pattern: /2025|2026|this year|今年/i,
    type: 'LITERATURE_UPDATE',
    timeFilter: '12months',
    priority: 'MEDIUM'
  }
]

class SearchCache {
  private cache: LRU<string, CacheEntry>
  private ttlMap: Map<SearchIntentType, number> = new Map([
    ['LITERATURE_UPDATE', 30 * 60 * 1000],
    ['PAPER_COMPLETION', 24 * 60 * 60 * 1000],
    ['BACKGROUND_KNOWLEDGE', 2 * 60 * 60 * 1000],
    ['VERIFICATION', 2 * 60 * 60 * 1000]
  ])

  constructor() {
    this.cache = new LRU<string, CacheEntry>({
      max: 1000,
      ttl: 1000 * 60 * 60
    })
  }

  get(key: string): CacheEntry | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    const ttl = this.ttlMap.get(entry.query as unknown as SearchIntentType) || 60 * 60 * 1000
    const age = Date.now() - entry.timestamp.getTime()

    if (age > ttl) {
      this.cache.delete(key)
      return undefined
    }

    return entry
  }

  set(key: string, entry: CacheEntry): void {
    this.cache.set(key, entry)
  }

  generateKey(query: string, source: string): string {
    return `${source}:${query.toLowerCase().trim()}`
  }

  clear(): void {
    this.cache.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: 1000,
      calculatedHitRate: this.cache.size > 0 ? 'N/A' : '0%'
    }
  }
}

export class AutoSearchFramework {
  private cache = new SearchCache()
  private domainKeywords: Map<string, string[]> = new Map()
  private isInitialized = false

  constructor() {
    this.initializeDomainKeywords()
  }

  private async initializeDomainKeywords(): Promise<void> {
    if (this.isInitialized) return

    try {
      const fs = await import('fs')
      const path = await import('path')

      const matchingRulesPath = path.join(__dirname, '../references/research-synthesis-matching.md')
      const content = fs.readFileSync(matchingRulesPath, 'utf-8')

      const filePattern = /\| `([a-z-]+\.md)` \| (.+) \|/g
      let match

      while ((match = filePattern.exec(content)) !== null) {
        const fileName = match[1]
        const description = match[2]
        const keywords = this.parseDescriptionToKeywords(description)

        if (keywords.length > 0) {
          this.domainKeywords.set(fileName, keywords)
        }
      }

      this.isInitialized = true
      console.log(`Initialized ${this.domainKeywords.size} domain keyword mappings`)
    } catch (error) {
      console.error('Failed to initialize domain keywords:', error)
    }
  }

  detectSearchIntents(context: ConversationContext): SearchIntent[] {
    const intents: SearchIntent[] = []
    const { userMessage } = context

    for (const trigger of SEARCH_TRIGGERS) {
      if (trigger.pattern.test(userMessage)) {
        let query = userMessage

        if (trigger.type === 'PAPER_COMPLETION') {
          const doiMatch = userMessage.match(/\b(10\.\d{4,}\/[^\s]+)\b/)
          if (doiMatch) {
            query = doiMatch[1]
          }
        }

        intents.push({
          type: trigger.type,
          confidence: this.calculateConfidence(trigger.type, context),
          query: query.trim(),
          priority: trigger.priority,
          expectedResults: this.getExpectedResultCount(trigger.type),
          timeFilter: trigger.timeFilter
        })
      }
    }

    if (intents.length === 0 && this.shouldProactivelySearch(context)) {
      intents.push({
        type: 'BACKGROUND_KNOWLEDGE',
        confidence: 0.6,
        query: userMessage,
        priority: 'LOW',
        expectedResults: 5
      })
    }

    return intents.sort((a, b) => b.confidence - a.confidence)
  }

  async executeSearch(intent: SearchIntent, domainKeywords?: string[]): Promise<SearchResult[]> {
    const optimizedQuery = this.optimizeQuery(intent, domainKeywords)
    const sources = this.selectSources(intent.type)
    const cacheKey = this.cache.generateKey(optimizedQuery, sources.join('+'))

    const cached = this.cache.get(cacheKey)
    if (cached) {
      console.log(`Cache hit for query: ${optimizedQuery}`)
      return cached.results
    }

    console.log(`Executing search for intent: ${intent.type}, query: ${optimizedQuery}`)

    try {
      let allResults: SearchResult[] = []

      for (const source of sources) {
        const result = await searchPapersDirect(optimizedQuery, source, intent.expectedResults)

        if (result.success && result.results.length > 0) {
          allResults = [...allResults, ...result.results]
        }
      }

      const uniqueResults = this.deduplicateResults(allResults)
      const filteredResults = this.applyTimeFilter(uniqueResults, intent.timeFilter)

      this.cache.set(cacheKey, {
        results: filteredResults,
        timestamp: new Date(),
        query: optimizedQuery,
        source: sources.join('+')
      })

      return filteredResults
    } catch (error) {
      console.error('Search execution failed:', error)
      return []
    }
  }

  optimizeQuery(intent: SearchIntent, domainKeywords?: string[]): string {
    let baseQuery = intent.query

    if (intent.type === 'LITERATURE_UPDATE') {
      const yearTerms = ['2025', '2026', 'recent', 'latest']
      baseQuery = `${baseQuery} ${yearTerms.slice(0, 2).join(' ')}`
    }

    if (intent.type === 'BACKGROUND_KNOWLEDGE' && domainKeywords && domainKeywords.length > 0) {
      const topKeywords = domainKeywords.slice(0, 3).join(' ')
      baseQuery = `${topKeywords} review overview survey`
    }

    if (intent.type === 'VERIFICATION') {
      baseQuery = `${baseQuery} validation replication reproducibility`
    }

    if (baseQuery.length > 200) {
      baseQuery = baseQuery.substring(0, 200)
    }

    return baseQuery.trim()
  }

  private selectSources(intentType: SearchIntentType): Array<'pubmed' | 'semantic_scholar' | 'openalex'> {
    switch (intentType) {
      case 'LITERATURE_UPDATE':
        return ['pubmed', 'semantic_scholar']
      case 'PAPER_COMPLETION':
        return ['semantic_scholar', 'pubmed']
      case 'BACKGROUND_KNOWLEDGE':
        return ['semantic_scholar', 'openalex']
      case 'VERIFICATION':
        return ['pubmed', 'semantic_scholar', 'openalex']
      default:
        return ['pubmed']
    }
  }

  private calculateConfidence(intentType: SearchIntentType, context: ConversationContext): number {
    let baseConfidence = 0.7

    switch (intentType) {
      case 'LITERATURE_UPDATE':
        baseConfidence = 0.85
        break
      case 'PAPER_COMPLETION':
        baseConfidence = 0.95
        break
      case 'VERIFICATION':
        baseConfidence = 0.75
        break
      case 'BACKGROUND_KNOWLEDGE':
        baseConfidence = 0.6
        break
    }

    if (context.currentDomain) {
      baseConfidence += 0.05
    }

    if (context.mentionedPapers && context.mentionedPapers.length > 0) {
      baseConfidence += 0.05
    }

    return Math.min(baseConfidence, 1.0)
  }

  private shouldProactivelySearch(context: ConversationContext): boolean {
    const technicalTerms = /algorithm|method|model|analysis|dataset|framework|approach|technique/i

    if (!technicalTerms.test(context.userMessage)) {
      return false
    }

    if (context.conversationHistory.length < 3) {
      return false
    }

    const recentMessages = context.conversationHistory.slice(-3)
    const hasDomainQuestion = recentMessages.some(msg =>
      /how|what|why|explain|describe|compare/i.test(msg.content)
    )

    return hasDomainQuestion
  }

  private getExpectedResultCount(intentType: SearchIntentType): number {
    switch (intentType) {
      case 'LITERATURE_UPDATE': return 10
      case 'PAPER_COMPLETION': return 1
      case 'BACKGROUND_KNOWLEDGE': return 5
      case 'VERIFICATION': return 8
      default: return 5
    }
  }

  private parseDescriptionToKeywords(description: string): string[] {
    const keywords: string[] = []
    const parts = description.split(';').map(p => p.trim())

    for (const part of parts) {
      const terms = part.split('/').map(t => t.trim())
      keywords.push(...terms.filter(t => t.length > 2))
    }

    return [...new Set(keywords)].slice(0, 15)
  }

  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>()
    const unique: SearchResult[] = []

    for (const result of results) {
      const key = `${result.title.toLowerCase().trim()}${result.doi}`.trim()

      if (!seen.has(key)) {
        seen.add(key)
        unique.push(result)
      }
    }

    return unique
  }

  private applyTimeFilter(results: SearchResult[], timeFilter?: string): SearchResult[] {
    if (!timeFilter) return results

    const now = new Date()
    let cutoffDate: Date

    switch (timeFilter) {
      case '6months':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 6))
        break
      case '12months':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      default:
        return results
    }

    return results.filter(result => {
      const year = typeof result.year === 'string' ? parseInt(result.year) : result.year
      const resultDate = new Date(year, 0, 1)
      return resultDate >= cutoffDate
    })
  }

  getDomainKeywords(fileName: string): string[] {
    return this.domainKeywords.get(fileName) || []
  }

  getCacheStats() {
    return this.cache.getStats()
  }

  clearCache(): void {
    this.cache.clear()
  }
}
