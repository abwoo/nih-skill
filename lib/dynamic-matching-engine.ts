import * as fs from 'fs'
import * as path from 'path'
import { searchPapersDirect, type SearchResult } from './search-service'

export interface UpdateOptions {
  sources?: Array<'pubmed' | 'semantic_scholar' | 'openalex'>
  limit?: number
  customKeywords?: string[]
  minCitationCount?: number
  yearRange?: { from: number; to: number }
  includePreprints?: boolean
  dryRun?: boolean
}

export interface PaperEntry {
  id: string
  citation: {
    authors: string
    title: string
    journal: string
    year: number
    pmid?: string
    doi: string
  }
  methodology: {
    coreIdea: string
    algorithmPipeline?: string
    keyDecisions: string[]
    performance: string
  }
  criticalAnalysis?: {
    contradictoryEvidence: '🟢' | '🟡' | '🔴'
    statisticalVulnerability: '🟢' | '🟡' | '🔴'
    reproductionRisk: '🟢' | '🟡' | '🔴'
    hiddenAssumptions: '🟢' | '🟡' | '🔴'
    dataLeakageRisk: '🟢' | '🟡' | '🔴'
  }
  reproducibility: {
    dataAvailability: boolean
    codeAvailability: boolean
    difficultyRating: number
  }
  whenToReference: string[]
}

export interface UpdateResult {
  success: boolean
  file: string
  addedPapers: number
  updatedPapers: number
  skippedPapers: number
  duration: string
  sourcesUsed: string[]
  papers: PaperEntry[]
  error?: string
}

export interface BatchUpdateResult {
  totalFiles: number
  completedFiles: number
  failedFiles: string[]
  totalPapersAdded: number
  totalTime: string
  results: Map<string, UpdateResult>
}

class KeywordExtractor {
  private matchingRulesPath = path.join(__dirname, '../references/research-synthesis-matching.md')

  async extractKeywords(referenceFileName: string): Promise<string[]> {
    try {
      const content = fs.readFileSync(this.matchingRulesPath, 'utf-8')
      const escapedFileName = referenceFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const filePattern = new RegExp('\\| \\`' + escapedFileName + '\\` \\| (.+) \\|', 'i')
      const match = content.match(filePattern)

      if (match && match[1]) {
        const description = match[1]
        const keywords = this.parseDescriptionToKeywords(description)
        return keywords
      }

      return this.extractFromFileName(referenceFileName)
    } catch (error) {
      console.error(`Error extracting keywords for ${referenceFileName}:`, error)
      return this.extractFromFileName(referenceFileName)
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

  private extractFromFileName(fileName: string): string[] {
    const nameWithoutExt = fileName.replace('.md', '').replace(/-/g, ' ')
    const words = nameWithoutExt.split(' ').filter(w => w.length > 3)
    return words.slice(0, 8)
  }
}

class MultiSourceSearchCoordinator {
  async searchAllSources(
    query: string,
    sources: Array<'pubmed' | 'semantic_scholar' | 'openalex'>,
    limit: number
  ): Promise<SearchResult[]> {
    const searchPromises = sources.map(source =>
      searchPapersDirect(query, source, limit).catch(error => {
        console.error(`Search failed for ${source}:`, error)
        return { success: false, query, source, count: 0, results: [] as SearchResult[] }
      })
    )

    const results = await Promise.all(searchPromises)
    const allResults: SearchResult[] = []

    for (const result of results) {
      if (result.success && result.results.length > 0) {
        allResults.push(...result.results)
      }
    }

    return allResults
  }
}

class ResultProcessor {
  deduplicateResults(results: SearchResult[]): SearchResult[] {
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

  filterAndSort(
    results: SearchResult[],
    options: UpdateOptions
  ): SearchResult[] {
    let filtered = [...results]

    if (options.minCitationCount) {
      filtered = filtered.filter(r =>
        (r.citationCount || 0) >= options.minCitationCount!
      )
    }

    if (options.yearRange) {
      filtered = filtered.filter(r => {
        const year = typeof r.year === 'string' ? parseInt(r.year) : r.year
        return year >= options.yearRange!.from && year <= options.yearRange!.to
      })
    }

    filtered.sort((a, b) => {
      const citationDiff = (b.citationCount || 0) - (a.citationCount || 0)
      if (citationDiff !== 0) return citationDiff

      const yearA = typeof a.year === 'string' ? parseInt(a.year) : a.year
      const yearB = typeof b.year === 'string' ? parseInt(b.year) : b.year
      return yearB - yearA
    })

    return filtered.slice(0, options.limit || 20)
  }
}

class MarkdownGenerator {
  generatePaperEntry(paper: SearchResult, index: number, domainPrefix: string): string {
    const id = `${domainPrefix}-${String(index + 1).padStart(2, '0')}`
    const year = typeof paper.year === 'string' ? parseInt(paper.year) : paper.year

    let markdown = `---

## ${id}: ${paper.authors.split(',')[0]} et al. — ${paper.title.substring(0, 80)}${paper.title.length > 80 ? '...' : ''}

### Citation
${paper.authors}. ${paper.title}. ${paper.venue || 'Unknown Journal'}. ${year}${paper.pmid ? `. PMID: ${paper.pmid}` : ''}${paper.doi ? `. DOI: ${paper.doi}` : ''}.

### Methodology Decomposition

**Core Idea**: ${paper.abstract?.substring(0, 200) || 'Abstract not available'}${paper.abstract && paper.abstract.length > 200 ? '...' : ''}

`

    if (paper.citationCount && paper.citationCount > 100) {
      markdown += `**Impact**: Cited ${paper.citationCount} times

`
    }

    markdown += `**Reproducibility Notes**:
- Data availability: ${this.assessDataAvailability(paper)}
- Code availability: To be verified
- Difficulty rating: ★★☆☆☆ (requires manual assessment)

**When to Reference This**:
- General reference for ${paper.title.split(' ').slice(0, 3).join(' ')} related queries
- Background knowledge for domain-specific questions

`
    return markdown
  }

  private assessDataAvailability(paper: SearchResult): string {
    if (paper.pmcid) return '✅ Available on PMC'
    if (paper.source === 'pubmed') return '⚠️ Check PubMed Central'
    return '❓ Unknown'
  }
}

class SafeFileUpdater {
  private referencesDir = path.join(__dirname, '../references')

  async readFile(fileName: string): Promise<string> {
    const filePath = path.join(this.referencesDir, fileName)
    try {
      return await fs.promises.readFile(filePath, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to read file ${fileName}: ${error}`)
    }
  }

  async appendContent(fileName: string, content: string, backup: boolean = true): Promise<void> {
    const filePath = path.join(this.referencesDir, fileName)

    if (backup) {
      await this.createBackup(fileName)
    }

    try {
      const existingContent = await fs.promises.readFile(filePath, 'utf-8')
      const updatedContent = existingContent + '\n' + content
      await fs.promises.writeFile(filePath, updatedContent, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to update file ${fileName}: ${error}`)
    }
  }

  private async createBackup(fileName: string): Promise<void> {
    const filePath = path.join(this.referencesDir, fileName)
    const backupPath = filePath + `.backup-${Date.now()}`

    try {
      await fs.promises.copyFile(filePath, backupPath)

      const backups = await this.listBackups(fileName)
      if (backups.length > 5) {
        const oldestBackup = backups[0]
        await fs.promises.unlink(oldestBackup)
      }
    } catch (error) {
      console.warn(`Warning: Could not create backup for ${fileName}:`, error)
    }
  }

  private async listBackups(fileName: string): Promise<string[]> {
    const dir = this.referencesDir
    const files = await fs.promises.readdir(dir)
    const backupPattern = new RegExp(`^${fileName.replace('.md', '')}\\.backup-\\d+$`)

    return files
      .filter(f => backupPattern.test(f))
      .map(f => path.join(dir, f))
      .sort()
  }

  getExistingPaperIds(fileName: string): string[] {
    const filePath = path.join(this.referencesDir, fileName)
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const idPattern = /^## ([A-Z]+-\d+):/gm
      const ids: string[] = []
      let match

      while ((match = idPattern.exec(content)) !== null) {
        ids.push(match[1])
      }

      return ids
    } catch (error) {
      console.error(`Error reading existing paper IDs from ${fileName}:`, error)
      return []
    }
  }
}

export class DynamicMatchingEngine {
  private keywordExtractor = new KeywordExtractor()
  private searchCoordinator = new MultiSourceSearchCoordinator()
  private resultProcessor = new ResultProcessor()
  private markdownGenerator = new MarkdownGenerator()
  private fileUpdater = new SafeFileUpdater()

  async updateReference(
    referenceFileName: string,
    options: UpdateOptions = {}
  ): Promise<UpdateResult> {
    const startTime = Date.now()
    const defaultOptions: UpdateOptions = {
      sources: ['pubmed', 'semantic_scholar', 'openalex'],
      limit: 20,
      dryRun: false,
      ...options
    }

    try {
      console.log(`Starting update for ${referenceFileName}...`)
      const keywords = defaultOptions.customKeywords ||
        await this.keywordExtractor.extractKeywords(referenceFileName)

      console.log(`Extracted keywords: ${keywords.join(', ')}`)
      const query = this.buildSearchQuery(keywords, referenceFileName)

      console.log(`Searching with query: ${query}`)
      const rawResults = await this.searchCoordinator.searchAllSources(
        query,
        defaultOptions.sources!,
        defaultOptions.limit! * 2
      )

      console.log(`Found ${rawResults.length} raw results`)
      const deduplicatedResults = this.resultProcessor.deduplicateResults(rawResults)
      const filteredResults = this.resultProcessor.filterAndSort(deduplicatedResults, defaultOptions)

      console.log(`After processing: ${filteredResults.length} results`)
      const existingIds = this.fileUpdater.getExistingPaperIds(referenceFileName)
      const domainPrefix = this.getDomainPrefix(referenceFileName)

      const newPapers: SearchResult[] = []
      const papersToAdd: SearchResult[] = []

      for (const paper of filteredResults) {
        const potentialId = this.generatePaperId(paper, existingIds, domainPrefix)
        if (!existingIds.includes(potentialId)) {
          newPapers.push(paper)
          papersToAdd.push(paper)
          existingIds.push(potentialId)
        }
      }

      console.log(`New papers to add: ${papersToAdd.length}`)
      let markdownContent = ''

      for (let i = 0; i < papersToAdd.length; i++) {
        markdownContent += this.markdownGenerator.generatePaperEntry(
          papersToAdd[i],
          i,
          domainPrefix
        )
      }

      if (!defaultOptions.dryRun && markdownContent.length > 0) {
        await this.fileUpdater.appendContent(referenceFileName, markdownContent)
        console.log(`Successfully updated ${referenceFileName}`)
      } else if (defaultOptions.dryRun) {
        console.log(`[DRY RUN] Would add ${papersToAdd.length} papers to ${referenceFileName}`)
      }

      const endTime = Date.now()
      const duration = ((endTime - startTime) / 1000).toFixed(1)

      return {
        success: true,
        file: referenceFileName,
        addedPapers: papersToAdd.length,
        updatedPapers: 0,
        skippedPapers: filteredResults.length - papersToAdd.length,
        duration: `${duration}s`,
        sourcesUsed: defaultOptions.sources!,
        papers: papersToAdd.map((p, i) => this.convertToPaperEntry(p, i, domainPrefix))
      }
    } catch (error) {
      console.error(`Error updating ${referenceFileName}:`, error)
      return {
        success: false,
        file: referenceFileName,
        addedPapers: 0,
        updatedPapers: 0,
        skippedPapers: 0,
        duration: `${((Date.now() - Date.now()) / 1000).toFixed(1)}s`,
        sourcesUsed: defaultOptions.sources || [],
        papers: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async updateAllReferences(concurrency: number = 3): Promise<BatchUpdateResult> {
    const referenceFiles = this.listReferenceFiles()
    const results = new Map<string, UpdateResult>()
    let completedFiles = 0
    const failedFiles: string[] = []
    let totalPapersAdded = 0
    const startTime = Date.now()

    console.log(`Starting batch update for ${referenceFiles.length} files...`)

    for (let i = 0; i < referenceFiles.length; i += concurrency) {
      const batch = referenceFiles.slice(i, i + concurrency)
      const batchPromises = batch.map(file =>
        this.updateReference(file).then(result => {
          results.set(file, result)
          if (result.success) {
            completedFiles++
            totalPapersAdded += result.addedPapers
          } else {
            failedFiles.push(file)
          }
          return result
        }).catch(error => {
          const errorResult: UpdateResult = {
            success: false,
            file,
            addedPapers: 0,
            updatedPapers: 0,
            skippedPapers: 0,
            duration: '0s',
            sourcesUsed: [],
            papers: [],
            error: error instanceof Error ? error.message : 'Unknown error'
          }
          results.set(file, errorResult)
          failedFiles.push(file)
          return errorResult
        })
      )

      await Promise.all(batchPromises)
      console.log(`Batch ${Math.floor(i / concurrency) + 1} completed: ${completedFiles}/${referenceFiles.length}`)
    }

    const endTime = Date.now()
    const totalTime = ((endTime - startTime) / 1000).toFixed(1)

    return {
      totalFiles: referenceFiles.length,
      completedFiles,
      failedFiles,
      totalPapersAdded,
      totalTime: `${totalTime}s`,
      results
    }
  }

  async incrementalUpdate(
    referenceFileName: string,
    sinceDate: Date
  ): Promise<UpdateResult> {
    const year = sinceDate.getFullYear()
    return this.updateReference(referenceFileName, {
      yearRange: { from: year, to: new Date().getFullYear() },
      limit: 10
    })
  }

  private buildSearchQuery(keywords: string[], fileName: string): string {
    const cleanKeywords = keywords
      .map(k => k.replace(/[()]/g, '').trim())
      .filter(k => k.length > 2 && k.length < 50 && !k.includes('|') && !k.includes('User mentions'))
      .slice(0, 8)

    if (cleanKeywords.length === 0) {
      return fileName.replace('.md', '').replace(/-/g, ' ')
    }

    const primaryKeywords = cleanKeywords.slice(0, 5).join(' ')
    return primaryKeywords
  }

  private getDomainPrefix(fileName: string): string {
    const nameWithoutExt = fileName.replace('.md', '').toUpperCase()
    const parts = nameWithoutExt.split('-')

    if (parts.length >= 2) {
      return parts.slice(0, 2).map(p => p.substring(0, 3)).join('')
    }

    return parts[0]?.substring(0, 4) || 'REF'
  }

  private generatePaperId(
    paper: SearchResult,
    existingIds: string[],
    domainPrefix: string
  ): string {
    let index = existingIds.filter(id => id.startsWith(domainPrefix)).length + 1

    while (existingIds.includes(`${domainPrefix}-${String(index).padStart(2, '0')}`)) {
      index++
    }

    return `${domainPrefix}-${String(index).padStart(2, '0')}`
  }

  private convertToPaperEntry(paper: SearchResult, index: number, domainPrefix: string): PaperEntry {
    const id = `${domainPrefix}-${String(index + 1).padStart(2, '0')}`
    const year = typeof paper.year === 'string' ? parseInt(paper.year) : paper.year

    return {
      id,
      citation: {
        authors: paper.authors,
        title: paper.title,
        journal: paper.venue || '',
        year,
        pmid: paper.pmid,
        doi: paper.doi
      },
      methodology: {
        coreIdea: paper.abstract?.substring(0, 200) || '',
        performance: paper.citationCount ? `Cited ${paper.citationCount} times` : '',
        keyDecisions: []
      },
      reproducibility: {
        dataAvailability: !!paper.pmcid,
        codeAvailability: false,
        difficultyRating: 3
      },
      whenToReference: [
        `General reference for ${paper.title.split(' ').slice(0, 3).join(' ')}`,
        'Background knowledge for domain-specific queries'
      ]
    }
  }

  private listReferenceFiles(): string[] {
    const referencesDir = path.join(__dirname, '../references')

    try {
      const files = fs.readdirSync(referencesDir)
      return files
        .filter(f => f.endsWith('.md'))
        .sort()
    } catch (error) {
      console.error('Error listing reference files:', error)
      return []
    }
  }
}
