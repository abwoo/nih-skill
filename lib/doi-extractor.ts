import type {
  ExtractedDOI,
  DOISource,
  DOIConfidence,
  DOIMatchStrategy,
  DOIExtractionConfig,
} from "./doi-extractor-types"
import { DEFAULT_EXTRACTION_CONFIG } from "./doi-extractor-types"

function normalizeDOI(raw: string): string {
  let doi = raw.trim()
  
  if (doi.startsWith("http")) {
    const urlMatch = doi.match(/10\.\d{4,9}\/[^\s\]>\)}\]]+/)
    if (urlMatch) doi = urlMatch[0]
  }
  
  if (doi.toLowerCase().startsWith("doi:") || doi.toLowerCase().startsWith("doi ")) {
    doi = doi.replace(/^doi[:\s]*/i, "")
  }
  
  doi = doi.replace(/[\[\](){}.,;:]+$/, "")
  
  return doi
}

function validateDOIFormat(doi: string): boolean {
  return /^10\.\d{4,9}\/.+$/.test(doi)
}

function assessConfidence(
  doi: string,
  source: DOISource,
  context: string,
): DOIConfidence {
  if (source === "metadata" && validateDOIFormat(doi)) return "high"
  
  if (source === "first_page") {
    const contextLower = context.toLowerCase()
    if (
      contextLower.includes("doi") ||
      contextLower.includes("digital object identifier")
    ) {
      return "high"
    }
    if (contextLower.includes("article") || contextLower.includes("paper")) {
      return "medium"
    }
    return "medium"
  }
  
  if (source === "regex_text" || source === "header_footer") {
    if (validateDOIFormat(doi) && /^\d{4}$/.test(doi.split("/")[1]?.split(".")[0] || "")) {
      return "high"
    }
    return "medium"
  }
  
  if (source === "references") {
    return "low"
  }
  
  return "medium"
}

export function extractDOIsFromText(
  text: string,
  config: Partial<DOIExtractionConfig> = {},
): ExtractedDOI[] {
  const fullConfig = { ...DEFAULT_EXTRACTION_CONFIG, ...config }
  const results: ExtractedDOI[] = []
  const seenDOIs = new Set<string>()

  const lines = text.split("\n")

  for (const strategy of fullConfig.strategies.filter((s) => s.enabled)) {
    for (const pattern of strategy.patterns) {
      let match: RegExpExecArray | null

      pattern.lastIndex = 0
      while ((match = pattern.exec(text)) !== null) {
        const rawMatch = match[1] || match[0]
        const normalized = normalizeDOI(rawMatch)

        if (!normalized || seenDOIs.has(normalized)) continue
        if (!validateDOIFormat(normalized)) continue

        const matchIndex = text.substring(0, match.index).split("\n").length - 1
        const lineStart = Math.max(0, matchIndex - 1)
        const lineEnd = Math.min(lines.length - 1, matchIndex + 2)
        const context = lines.slice(lineStart, lineEnd + 1).join(" ").trim()

        const confidence = assessConfidence(normalized, "regex_text", context)

        const minPriority =
          fullConfig.minConfidence === "high"
            ? 90
            : fullConfig.minConfidence === "medium"
              ? 70
              : 0

        if (strategy.priority >= minPriority) {
          results.push({
            doi: normalized,
            source: "regex_text",
            confidence,
            position: {
              lineIndex: matchIndex,
              context: context.slice(0, 200),
            },
            rawMatch,
            normalized,
          })

          seenDOIs.add(normalized)

          if (results.length >= fullConfig.maxResults) {
            return sortByConfidence(results)
          }
        }
      }
    }
  }

  return sortByConfidence(results)
}

export function extractDOIFromMetadata(metadata: Record<string, unknown>): ExtractedDOI | null {
  if (!metadata) return null

  const possibleFields = [
    "doi",
    "DOI",
    "identifier",
    "Identifier",
    "uri",
    "URI",
    "url",
    "URL",
  ]

  for (const field of possibleFields) {
    const value = metadata[field]
    if (typeof value !== "string" || !value.trim()) continue

    const normalized = normalizeDOI(value)
    if (validateDOIFormat(normalized)) {
      return {
        doi: normalized,
        source: "metadata",
        confidence: "high",
        rawMatch: value,
        normalized,
      }
    }
  }

  return null
}

export function extractDOIFromFirstPage(text: string, maxLines: number = 50): ExtractedDOI[] {
  const lines = text.split("\n").slice(0, maxLines)
  const firstPageText = lines.join("\n")
  
  const results: ExtractedDOI[] = []
  const patterns = [
    /(?:^|\s)(?:doi|DOI)[:\s]*(10\.\d{4,9}\/[^\s\]>\)}\]]+)/gim,
    /\b(10\.\d{4,9}\/[^\s\]>\)}\]]+)\b/g,
    /(?:https?:\/\/)?(?:dx\.)?doi\.org\/(10\.\d{4,9}\/[^\s\]>\)}\]]+)/gi,
  ]
  
  const seenDOIs = new Set<string>()
  
  for (const pattern of patterns) {
    let match: RegExpExecArray | null
    
    pattern.lastIndex = 0
    while ((match = pattern.exec(firstPageText)) !== null) {
      const rawMatch = match[1] || match[0]
      const normalized = normalizeDOI(rawMatch)
      
      if (!normalized || seenDOIs.has(normalized) || !validateDOIFormat(normalized)) continue
      
      const matchLineIndex = firstPageText.substring(0, match.index).split("\n").length - 1
      const contextStart = Math.max(0, matchLineIndex - 2)
      const contextEnd = Math.min(lines.length - 1, matchLineIndex + 3)
      const context = lines.slice(contextStart, contextEnd + 1).join(" ").trim()
      
      results.push({
        doi: normalized,
        source: "first_page",
        confidence: assessConfidence(normalized, "first_page", context),
        position: {
          page: 1,
          lineIndex: matchLineIndex,
          context: context.slice(0, 200),
        },
        rawMatch,
        normalized,
      })
      
      seenDOIs.add(normalized)
    }
  }
  
  return sortByConfidence(results)
}

export function extractDOIFromReferences(text: string): ExtractedDOI[] {
  const refSectionMatch = text.match(
    /(?:references|bibliography|works\s+cited|literature\s+cited)[\s\S]*$/im
  )
  
  if (!refSectionMatch) return []
  
  const refText = refSectionMatch[0]
  const results: ExtractedDOI[] = []
  const seenDOIs = new Set<string>()
  
  const patterns = [
    /\b(10\.\d{4,9}\/[^\s\]>\)}\]]+)\b/g,
    /(?:https?:\/\/)?doi\.org\/(10\.\d{4,9}\/[^\s\]>\)}\]]+)/gi,
  ]
  
  for (const pattern of patterns) {
    let match: RegExpExecArray | null
    
    pattern.lastIndex = 0
    while ((match = pattern.exec(refText)) !== null) {
      const rawMatch = match[1] || match[0]
      const normalized = normalizeDOI(rawMatch)
      
      if (!normalized || seenDOIs.has(normalized) || !validateDOIFormat(normalized)) continue
      
      results.push({
        doi: normalized,
        source: "references",
        confidence: "low",
        rawMatch,
        normalized,
      })
      
      seenDOIs.add(normalized)
    }
  }
  
  return results.slice(0, 20)
}

async function validateWithCrossref(doi: string, timeout: number = 10000): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    
    const response = await fetch(
      `https://api.crossref.org/works/${encodeURIComponent(doi)}`,
      {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent": "BioMedResearchAgent/1.0 (mailto:agent@biomed.dev)",
        },
      }
    )
    
    clearTimeout(timer)
    return response.ok
  } catch {
    return false
  }
}

export async function extractAndValidateDOI(
  text: string,
  metadata?: Record<string, unknown>,
  config: Partial<DOIExtractionConfig> = {},
): Promise<{
  primaryDOI: ExtractedDOI | null
  allDOIs: ExtractedDOI[]
  validationResults: Map<string, boolean>
}> {
  const fullConfig = { ...DEFAULT_EXTRACTION_CONFIG, ...config }
  const allDOIs: ExtractedDOI[] = []
  const validationResults = new Map<string, boolean>()

  if (fullConfig.extractFromMetadata && metadata) {
    const metadataDOI = extractDOIFromMetadata(metadata)
    if (metadataDOI) {
      allDOIs.push(metadataDOI)
    }
  }

  if (fullConfig.extractFromFirstPage) {
    const firstPageDOIs = extractDOIFromFirstPage(text)
    allDOIs.push(...firstPageDOIs)
  }

  const textDOIs = extractDOIsFromText(text, config)
  for (const doi of textDOIs) {
    if (!allDOIs.find((d) => d.doi === doi.doi)) {
      allDOIs.push(doi)
    }
  }

  if (fullConfig.extractFromReferences) {
    const refDOIs = extractDOIFromReferences(text)
    for (const doi of refDOIs) {
      if (!allDOIs.find((d) => d.doi === doi.doi)) {
        allDOIs.push(doi)
      }
    }
  }

  if (fullConfig.validateWithCrossref) {
    const uniqueDOIs = [...new Set(allDOIs.map((d) => d.doi))]
    
    await Promise.allSettled(
      uniqueDOIs.map(async (doi) => {
        const isValid = await validateWithCrossref(doi, fullConfig.timeout)
        validationResults.set(doi, isValid)
      })
    )

    allDOIs.forEach((extracted) => {
      const isValid = validationResults.get(extracted.doi)
      if (isValid === false && extracted.confidence !== "high") {
        extracted.confidence = "low"
      }
    })
  }

  const sortedDOIs = sortByConfidence(allDOIs)
  const primaryDOI = sortedDOIs.length > 0 ? sortedDOIs[0] : null

  return {
    primaryDOI,
    allDOIs: sortedDOIs,
    validationResults,
  }
}

function sortByConfidence(dois: ExtractedDOI[]): ExtractedDOI[] {
  const confidenceOrder: Record<DOIConfidence, number> = {
    high: 3,
    medium: 2,
    low: 1,
  }

  return dois.sort((a, b) => {
    const confDiff = confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
    if (confDiff !== 0) return confDiff
    
    if (a.source === "metadata" && b.source !== "metadata") return -1
    if (b.source === "metadata" && a.source !== "metadata") return 1
    if (a.source === "first_page" && b.source !== "first_page") return -1
    if (b.source === "first_page" && a.source !== "first_page") return 1
    
    return 0
  })
}
