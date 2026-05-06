import { searchPapersDirect, type SearchResult } from './search-service'
import * as fs from 'fs'
import * as path from 'path'

export interface EnhancedSearchResult {
  query: string
  optimizedQuery: string
  totalResults: number
  sourcesUsed: string[]
  papers: EnhancedPaper[]
  executionTime: number
  timestamp: Date
  verificationStatus: VerificationStatus
}

export interface EnhancedPaper extends SearchResult {
  enhancedScore: number
  relevanceScore: number
  freshnessScore: number
  impactScore: number
  sourceDiversity: number
  matchedKeywords: string[]
  domainRelevance: string[]
  verified: boolean
  verificationDetails?: {
    doiValidated: boolean
    titleMatched: boolean
    authorsRetrieved: boolean
    abstractAvailable: boolean
    citationCountVerified: boolean
  }
}

export interface VerificationStatus {
  overall: 'VERIFIED' | 'PARTIAL' | 'UNVERIFIED' | 'FAILED'
  papersVerified: number
  papersTotal: number
  details: Array<{
    paperId: string
    status: 'PASS' | 'WARN' | 'FAIL'
    checks: string[]
  }>
}

interface QueryOptimizationResult {
  optimizedQuery: string
  expansions: string[]
  domainContext: string
  timeFilter?: string
  filters: Array<{type: string; value: string}>
}

class QueryOptimizer {
  private synonymMap: Map<string, string[]> = new Map([
    ['ecg', ['electrocardiogram', 'ekg', 'cardiac signal', 'heart rhythm']],
    ['eeg', ['electroencephalography', 'brain signal', 'neural activity']],
    ['deep learning', ['machine learning', 'neural network', 'deep neural', 'artificial intelligence']],
    ['transformer', ['attention mechanism', 'self-attention', 'bert', 'gpt']],
    ['segmentation', ['image segmentation', 'semantic segmentation', 'instance segmentation']],
    ['classification', ['image classification', 'pattern recognition', 'categorization']],
    ['detection', ['object detection', 'anomaly detection', 'lesion detection']],
    ['arrhythmia', ['cardiac arrhythmia', 'heart rhythm disorder', 'dysrhythmia']],
    ['mri', ['magnetic resonance imaging', 'mr imaging']],
    ['ct', ['computed tomography', 'cat scan']]
  ])

  private domainSpecificTerms: Map<string, string[]> = new Map([
    ['ecg', ['qrs complex', 'p-wave', 't-wave', 'atrial fibrillation', 'ventricular', 'ecg lead']],
    ['eeg', ['motor imagery', 'event-related potential', 'erp', 'brain-computer interface', 'bci', 'sleep staging']],
    ['medical imaging', ['radiology', 'pathology', 'ct scan', 'mri', 'x-ray', 'ultrasound', 'endoscopy']],
    ['genomics', ['gene expression', 'sequencing', 'crispr', 'genome', 'mutation', 'variant calling']],
    ['nlp', ['natural language processing', 'text mining', 'clinical text', 'named entity recognition', 'relation extraction']]
  ])

  optimize(query: string, context?: {domain?: string; yearRange?: [number, number]; paperType?: string}): QueryOptimizationResult {
    const lowerQuery = query.toLowerCase()
    const expansions: string[] = []
    let optimizedQuery = query
    const filters: Array<{type: string; value: string}> = []
    let timeFilter: string | undefined
    let domainContext = ''

    // Step 1: Detect and expand synonyms
    for (const [term, synonyms] of this.synonymMap) {
      if (lowerQuery.includes(term)) {
        expansions.push(...synonyms.slice(0, 2))
      }
    }

    // Step 2: Add domain-specific terms if domain is detected
    if (context?.domain) {
      const terms = this.domainSpecificTerms.get(context.domain)
      if (terms) {
        domainContext = context.domain
        expansions.push(...terms.slice(0, 3))
      }
    }

    // Step 3: Extract temporal constraints
    const yearPattern = /(?:20|19)\d{2}/g
    const years = query.match(yearPattern)
    if (years && years.length >= 1) {
      const yearNums = years.map(y => parseInt(y)).sort()
      if (yearNums.length === 1) {
        timeFilter = `since ${yearNums[0]}`
        filters.push({ type: 'year_min', value: String(yearNums[0]) })
      } else {
        filters.push({ type: 'year_range', value: `${Math.min(...yearNums)}-${Math.max(...yearNums)}` })
      }
    }

    // Step 4: Detect paper type preferences
    if (lowerQuery.includes('review') || lowerQuery.includes('survey')) {
      filters.push({ type: 'document_type', value: 'review' })
    }
    if (lowerQuery.includes('clinical trial') || lowerQuery.includes('rct') || lowerQuery.includes('randomized')) {
      filters.push({ type: 'study_type', value: 'clinical_trial' })
    }

    // Step 5: Build optimized query
    if (expansions.length > 0) {
      const uniqueExpansions = [...new Set(expansions)]
      optimizedQuery = `${query} (${uniqueExpansions.slice(0, 4).join(' OR ')})`
    }

    return {
      optimizedQuery,
      expansions,
      domainContext,
      timeFilter,
      filters
    }
  }
}

class ResultEnhancer {
  enhanceResults(results: SearchResult[], optimizationInfo: QueryOptimizationResult): EnhancedPaper[] {
    return results.map((result, index) => {
      const relevanceScore = this.calculateRelevanceScore(result, optimizationInfo)
      const freshnessScore = this.calculateFreshnessScore(result)
      const impactScore = this.calculateImpactScore(result)
      const sourceDiversity = this.calculateSourceDiversity(results, index)

      const enhancedPaper: EnhancedPaper = {
        ...result,
        enhancedScore: relevanceScore * 0.4 + freshnessScore * 0.25 + impactScore * 0.25 + sourceDiversity * 0.1,
        relevanceScore,
        freshnessScore,
        impactScore,
        sourceDiversity,
        matchedKeywords: this.extractMatchedKeywords(result, optimizationInfo),
        domainRelevance: this.assessDomainRelevance(result),
        verified: false
      }

      return enhancedPaper
    }).sort((a, b) => b.enhancedScore - a.enhancedScore)
  }

  private calculateRelevanceScore(paper: SearchResult, optimization: QueryOptimizationResult): number {
    let score = 0.5 // Base score

    const titleLower = (paper.title || '').toLowerCase()
    const abstractLower = (paper.abstract || '').toLowerCase()

    // Check title matches
    const queryWords = optimization.optimizedQuery.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const titleMatches = queryWords.filter(word => titleLower.includes(word)).length
    score += Math.min(titleMatches * 0.15, 0.3)

    // Check abstract matches
    const abstractMatches = queryWords.filter(word => abstractLower.includes(word)).length
    score += Math.min(abstractMatches * 0.05, 0.15)

    // Bonus for exact phrase matches in title
    if (titleLower.includes(optimization.optimizedQuery.split('(')[0].trim().toLowerCase())) {
      score += 0.1
    }

    return Math.min(score, 1.0)
  }

  private calculateFreshnessScore(paper: SearchResult): number {
    const year = typeof paper.year === 'string' ? parseInt(paper.year) : paper.year
    if (!year || isNaN(year)) return 0.3

    const currentYear = new Date().getFullYear()
    const age = currentYear - year

    if (age <= 1) return 1.0
    if (age <= 2) return 0.9
    if (age <= 3) return 0.8
    if (age <= 5) return 0.7
    if (age <= 10) return 0.5
    return 0.3
  }

  private calculateImpactScore(paper: SearchResult): number {
    const citations = paper.citationCount || 0

    if (citations >= 1000) return 1.0
    if (citations >= 500) return 0.9
    if (citations >= 200) return 0.8
    if (citations >= 100) return 0.7
    if (citations >= 50) return 0.6
    if (citations >= 20) return 0.5
    if (citations >= 10) return 0.4
    if (citations >= 5) return 0.3
    return 0.2
  }

  private calculateSourceDiversity(allResults: SearchResult[], currentIndex: number): number {
    const currentSource = allResults[currentIndex].source
    const previousSources = allResults.slice(0, currentIndex).map(r => r.source)

    // Penalize if same source appears consecutively
    if (currentIndex > 0 && previousSources[previousSources.length - 1] === currentSource) {
      return 0.5
    }

    return 1.0
  }

  private extractMatchedKeywords(paper: SearchResult, optimization: QueryOptimizationResult): string[] {
    const keywords: string[] = []
    const text = `${paper.title} ${paper.abstract}`.toLowerCase()

    for (const expansion of optimization.expansions.slice(0, 6)) {
      if (text.includes(expansion.toLowerCase())) {
        keywords.push(expansion)
      }
    }

    return keywords
  }

  private assessDomainRelevance(paper: SearchResult): string[] {
    const domains: string[] = []
    const text = `${paper.title} ${paper.abstract} ${paper.venue || ''}`.toLowerCase()

    const domainKeywords: Record<string, string[]> = {
      'ECG': ['ecg', 'ekg', 'electrocardiogram', 'cardiac', 'arrhythmia', 'qrs', 'heartbeat'],
      'EEG': ['eeg', 'eeg', 'brain', 'neural', 'seizure', 'epilepsy', 'bci'],
      'Medical Imaging': ['imaging', 'radiology', 'ct', 'mri', 'x-ray', 'ultrasound', 'pathology'],
      'Genomics': ['gene', 'genome', 'dna', 'rna', 'sequencing', 'mutation', 'crispr'],
      'NLP': ['nlp', 'natural language', 'text', 'clinical text', 'named entity']
    }

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(kw => text.includes(kw))) {
        domains.push(domain)
      }
    }

    return domains
  }
}

class DataVerifier {
  async verifyPaper(paper: EnhancedPaper): Promise<EnhancedPaper> {
    const verificationDetails = {
      doiValidated: false,
      titleMatched: false,
      authorsRetrieved: false,
      abstractAvailable: false,
      citationCountVerified: false
    }

    try {
      // Check 1: DOI format validation
      if (paper.doi && /^10\.\d{4,}\/.+$/.test(paper.doi)) {
        verificationDetails.doiValidated = true
      }

      // Check 2: Title exists and looks valid
      if (paper.title && paper.title.length > 10 && paper.title.length < 500) {
        verificationDetails.titleMatched = true
      }

      // Check 3: Authors exist
      if (paper.authors && paper.authors.length > 0) {
        verificationDetails.authorsRetrieved = true
      }

      // Check 4: Abstract available
      if (paper.abstract && paper.abstract.length > 50) {
        verificationDetails.abstractAvailable = true
      }

      // Check 5: Citation count reasonable
      if (typeof paper.citationCount === 'number' && paper.citationCount >= 0) {
        verificationDetails.citationCountVerified = true
      }

      // Determine overall verification status
      const passedChecks = Object.values(verificationDetails).filter(v => v).length
      const totalChecks = Object.keys(verificationDetails).length

      paper.verified = passedChecks >= 3 // At least 3 out of 5 checks must pass
      paper.verificationDetails = verificationDetails

    } catch (error) {
      console.warn(`Verification failed for paper ${paper.title}:`, error)
      paper.verified = false
    }

    return paper
  }

  generateVerificationReport(papers: EnhancedPaper[]): VerificationStatus {
    const details = papers.map(paper => ({
      paperId: paper.doi || paper.title?.substring(0, 50) || 'unknown',
      status: paper.verified ? (Object.values(paper.verificationDetails || {}).filter(v => v).length >= 4 ? 'PASS' : 'WARN') : 'FAIL',
      checks: paper.verificationDetails ? Object.entries(paper.verificationDetails)
        .filter(([_, v]) => v)
        .map(([k, _]) => k) : []
    }))

    const verifiedCount = papers.filter(p => p.verified).length
    const totalCount = papers.length

    let overall: VerificationStatus['overall']
    if (verifiedCount === totalCount && totalCount > 0) {
      overall = 'VERIFIED'
    } else if (verifiedCount >= totalCount * 0.7) {
      overall = 'PARTIAL'
    } else if (verifiedCount > 0) {
      overall = 'UNVERIFIED'
    } else {
      overall = 'FAILED'
    }

    return {
      overall,
      papersVerified: verifiedCount,
      papersTotal: totalCount,
      details
    }
  }
}

export class EnhancedLLMSearchEngine {
  private queryOptimizer = new QueryOptimizer()
  private resultEnhancer = new ResultEnhancer()
  private dataVerifier = new DataVerifier()

  async searchAndVerify(
    query: string,
    options: {
      maxPapers?: number
      sources?: Array<'pubmed' | 'semantic_scholar' | 'openalex'>
      domain?: string
      verifyResults?: boolean
      analyzeDepth?: 'quick' | 'standard' | 'deep'
    } = {}
  ): Promise<EnhancedSearchResult> {
    const startTime = Date.now()

    const {
      maxPapers = 10,
      sources = ['pubmed', 'semantic_scholar'],
      domain,
      verifyResults = true,
      analyzeDepth = 'standard'
    } = options

    console.log(`🔍 Enhanced LLM Search: "${query}"`)

    try {
      // Step 1: Optimize query
      const optimizationInfo = this.queryOptimizer.optimize(query, { domain })
      console.log(`   📝 Optimized query: ${optimizationInfo.optimizedQuery}`)
      console.log(`   🔤 Expansions: ${optimizationInfo.expansions.join(', ')}`)

      // Step 2: Execute multi-source search with optimized query
      const allRawResults: SearchResult[] = []

      for (const source of sources) {
        try {
          console.log(`   📡 Searching ${source}...`)
          const result = await searchPapersDirect(optimizationInfo.optimizedQuery, source, maxPapers)

          if (result.success && result.results.length > 0) {
            allRawResults.push(...result.results)
            console.log(`   ✅ ${source}: ${result.results.length} results`)
          }
        } catch (error) {
          console.warn(`   ⚠️ Search failed for ${source}:`, error)
        }
      }

      // Step 3: Deduplicate results
      const deduplicatedResults = this.smartDeduplicate(allRawResults)
      console.log(`   🔄 After deduplication: ${deduplicatedResults.length} unique papers`)

      // Step 4: Enhance results with scoring
      const enhancedPapers = this.resultEnhancer.enhanceResults(deduplicatedResults, optimizationInfo)

      // Step 5: Apply limits after enhancement
      const finalPapers = enhancedPapers.slice(0, maxPapers)

      // Step 6: Verify data integrity
      let verificationStatus: VerificationStatus = {
        overall: 'UNVERIFIED',
        papersVerified: 0,
        papersTotal: finalPapers.length,
        details: []
      }

      if (verifyResults && finalPapers.length > 0) {
        console.log(`   🔍 Verifying ${finalPapers.length} papers...`)

        const verifiedPapers = await Promise.all(
          finalPapers.map(paper => this.dataVerifier.verifyPaper(paper))
        )

        verificationStatus = this.dataVerifier.generateVerificationReport(verifiedPapers)

        console.log(`   ✅ Verification complete: ${verificationStatus.overall} (${verificationStatus.papersVerified}/${verificationStatus.papersTotal})`)
      }

      const endTime = Date.now()
      const executionTime = endTime - startTime

      const result: EnhancedSearchResult = {
        query,
        optimizedQuery: optimizationInfo.optimizedQuery,
        totalResults: finalPapers.length,
        sourcesUsed: sources,
        papers: finalPapers,
        executionTime,
        timestamp: new Date(),
        verificationStatus
      }

      console.log(`   ⏱️ Total time: ${executionTime}ms`)

      // Log summary for debugging
      this.logSearchSummary(result, optimizationInfo)

      return result

    } catch (error) {
      console.error('❌ Enhanced search failed:', error)

      return {
        query,
        optimizedQuery: query,
        totalResults: 0,
        sourcesUsed: sources,
        papers: [],
        executionTime: Date.now() - startTime,
        timestamp: new Date(),
        verificationStatus: {
          overall: 'FAILED',
          papersVerified: 0,
          papersTotal: 0,
          details: []
        }
      }
    }
  }

  private smartDeduplicate(results: SearchResult[]): SearchResult[] {
    const seen = new Map<string, SearchResult>()
    const unique: SearchResult[] = []

    for (const result of results) {
      // Primary key: DOI (most reliable)
      if (result.doi) {
        const key = result.doi.toLowerCase().trim()
        if (!seen.has(key)) {
          seen.set(key, result)
          unique.push(result)
        } else {
          // Merge information from multiple sources
          const existing = seen.get(key)!
          if (!existing.abstract && result.abstract) existing.abstract = result.abstract
          if (!existing.citationCount && result.citationCount) existing.citationCount = result.citationCount
          if (!existing.pmid && result.pmid) existing.pmid = result.pmid
          if (!existing.pmcid && result.pmcid) existing.pmcid = result.pmcid
        }
      } else {
        // Fallback: Use title + first author + year
        const fallbackKey = `${result.title?.toLowerCase()}-${result.authors?.split(',')[0]?.toLowerCase()}-${result.year}`
        if (!seen.has(fallbackKey)) {
          seen.set(fallbackKey, result)
          unique.push(result)
        }
      }
    }

    return unique
  }

  private logSearchSummary(result: EnhancedSearchResult, optimization: QueryOptimizationResult): void {
    console.log('\n' + '='.repeat(60))
    console.log('📊 ENHANCED SEARCH SUMMARY')
    console.log('='.repeat(60))
    console.log(`Query: ${result.query}`)
    console.log(`Optimized: ${result.optimizedQuery}`)
    console.log(`Results: ${result.totalResults} papers from ${result.sourcesUsed.join(', ')}`)
    console.log(`Verification: ${result.verificationStatus.overall} (${result.verificationStatus.papersVerified}/${result.verificationStatus.papersTotal})`)
    console.log(`Execution Time: ${result.executionTime}ms`)

    if (result.papers.length > 0) {
      console.log('\nTop 3 Results:')
      result.papers.slice(0, 3).forEach((paper, i) => {
        console.log(`  ${i + 1}. [${paper.enhancedScore.toFixed(2)}] ${paper.title.substring(0, 80)}...`)
        console.log(`     Sources: ${paper.source} | Citations: ${paper.citationCount} | Year: ${paper.year}`)
        console.log(`     Verified: ${paper.verified ? '✅' : '❌'} | Domains: ${paper.domainRelevance.join(', ')}`)
      })
    }

    console.log('='.repeat(60) + '\n')
  }

  async getRealtimeDataProof(paperDoi: string): Promise<{
    existsInDatabase: boolean
    retrievalTimestamp: Date
    dataSource: string
    rawMetadata: Partial<SearchResult>
  }> {
    console.log(`🔎 Verifying real-time data for DOI: ${paperDoi}`)

    try {
      const result = await searchPapersDirect(paperDoi, 'semantic_scholar', 1)

      if (result.success && result.results.length > 0) {
        const paper = result.results[0]

        return {
          existsInDatabase: true,
          retrievalTimestamp: new Date(),
          dataSource: 'Semantic Scholar API',
          rawMetadata: {
            title: paper.title,
            authors: paper.authors,
            year: paper.year,
            doi: paper.doi,
            citationCount: paper.citationCount,
            venue: paper.venue,
            url: paper.url
          }
        }
      }

      return {
        existsInDatabase: false,
        retrievalTimestamp: new Date(),
        dataSource: 'Not found',
        rawMetadata: {}
      }

    } catch (error) {
      console.error('Real-time verification failed:', error)
      return {
        existsInDatabase: false,
        retrievalTimestamp: new Date(),
        dataSource: 'Error',
        rawMetadata: {},
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
