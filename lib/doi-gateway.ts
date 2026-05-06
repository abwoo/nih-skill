import { extractAndValidateDOI } from "./doi-extractor"
import { enrichDOIMetadata } from "./doi-metadata-enricher"
import type { ExtractedDOI } from "./doi-extractor-types"
import type { EnhancedPaperMetadata, EnrichmentResult, DOIEnrichmentConfig } from "./doi-metadata-enricher"

export interface DOIGatewayResult {
  success: boolean
  extractedDOIs: ExtractedDOI[]
  primaryDOI: ExtractedDOI | null
  metadata: EnhancedPaperMetadata | null
  enrichmentDetails: {
    sourcesUsed: string[]
    processingTimeMs: number
    errors: string[]
    warnings: string[]
  }
}

export interface DOIGatewayConfig {
  extraction: {
    extractFromText: boolean
    extractFromMetadata: boolean
    extractFromFirstPage: boolean
    extractFromReferences: boolean
    validateWithCrossref: boolean
    maxResults: number
  }
  enrichment: DOIEnrichmentConfig
  autoEnrichOnExtract: boolean
  cacheEnabled: boolean
  cacheTTL: number
}

export const DEFAULT_GATEWAY_CONFIG: DOIGatewayConfig = {
  extraction: {
    extractFromText: true,
    extractFromMetadata: true,
    extractFromFirstPage: true,
    extractFromReferences: true,
    validateWithCrossref: false,
    maxResults: 5,
  },
  enrichment: {
    enableCrossref: true,
    enableSemanticScholar: true,
    enableOpenAlex: true,
    enableUnpaywall: true,
    enablePubMed: true,
    timeout: {
      crossref: 15000,
      semanticScholar: 10000,
      openAlex: 12000,
      unpaywall: 10000,
      pubMed: 12000,
    },
    fallbackOrder: ["crossref", "semantic_scholar", "openalex"],
    maxRetries: 2,
    cacheResults: true,
  },
  autoEnrichOnExtract: true,
  cacheEnabled: true,
  cacheTTL: 3600000,
}

const doiCache = new Map<string, { data: EnrichmentResult; timestamp: number }>()

function getCacheKey(doi: string): string {
  return `doi_${doi.toLowerCase()}`
}

function getCachedData(doi: string): EnrichmentResult | null {
  const key = getCacheKey(doi)
  const cached = doiCache.get(key)
  
  if (!cached) return null
  
  const age = Date.now() - cached.timestamp
  if (age > DEFAULT_GATEWAY_CONFIG.cacheTTL) {
    doiCache.delete(key)
    return null
  }
  
  return cached.data
}

function setCacheData(doi: string, data: EnrichmentResult): void {
  const key = getCacheKey(doi)
  doiCache.set(key, { data, timestamp: Date.now() })
  
  if (doiCache.size > 100) {
    const oldestKey = Array.from(doiCache.keys())[0]
    doiCache.delete(oldestKey)
  }
}

export async function processPDFForDOI(
  text: string,
  metadata?: Record<string, unknown>,
  config: Partial<DOIGatewayConfig> = {},
): Promise<DOIGatewayResult> {
  const fullConfig = { ...DEFAULT_GATEWAY_CONFIG, ...config }
  
  console.log("[doi-gateway] Starting DOI extraction and enrichment process")
  const startTime = Date.now()
  
  const result: DOIGatewayResult = {
    success: false,
    extractedDOIs: [],
    primaryDOI: null,
    metadata: null,
    enrichmentDetails: {
      sourcesUsed: [],
      processingTimeMs: 0,
      errors: [],
      warnings: [],
    },
  }

  try {
    console.log("[doi-gateway] Phase 1: Extracting DOIs from PDF content")
    
    const extractionResult = await extractAndValidateDOI(text, metadata, {
      strategies: fullConfig.extraction as any,
      maxResults: fullConfig.extraction.maxResults,
      validateWithCrossref: fullConfig.extraction.validateWithCrossref,
      extractFromMetadata: fullConfig.extraction.extractFromMetadata,
      extractFromFirstPage: fullConfig.extraction.extractFromFirstPage,
      extractFromReferences: fullConfig.extraction.extractFromReferences,
    })

    result.extractedDOIs = extractionResult.allDOIs
    result.primaryDOI = extractionResult.primaryDOI

    console.log(`[doi-gateway] Found ${extractionResult.allDOIs.length} DOI(s)`)
    if (result.primaryDOI) {
      console.log(`[doi-gateway] Primary DOI: ${result.primaryDOI.doi} (${result.primaryDOI.confidence} confidence)`)
    }

    if (!result.primaryDOI || !fullConfig.autoEnrichOnExtract) {
      result.success = extractionResult.allDOIs.length > 0
      result.enrichmentDetails.processingTimeMs = Date.now() - startTime
      return result
    }

    console.log("[doi-gateway] Phase 2: Enriching metadata for primary DOI")
    
    let enrichmentResult: EnrichmentResult | undefined
    
    if (fullConfig.cacheEnabled) {
      const cached = getCachedData(result.primaryDOI.doi)
      if (cached) {
        console.log("[doi-gateway] Using cached enrichment data")
        enrichmentResult = cached
        result.enrichmentDetails.warnings.push("Used cached enrichment data")
      }
    }

    if (!enrichmentResult) {
      enrichmentResult = await enrichDOIMetadata(result.primaryDOI, fullConfig.enrichment)
      
      if (fullConfig.cacheEnabled && enrichmentResult.success) {
        setCacheData(result.primaryDOI.doi, enrichmentResult)
      }
    }

    if (enrichmentResult) {
      result.metadata = enrichmentResult.metadata
      result.enrichmentDetails.sourcesUsed = enrichmentResult.sourcesUsed
      result.enrichmentDetails.errors = enrichmentResult.errors
      result.enrichmentDetails.warnings.push(...enrichmentResult.warnings)
    }

    if (enrichmentResult.metadata?.semanticScholar?.citationCount !== undefined) {
      console.log(
        `[doi-gateway] Citation count: ${enrichmentResult.metadata.semanticScholar.citationCount}`,
      )
    }

    result.success = enrichmentResult.success

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[doi-gateway] Fatal error:", errorMsg)
    result.enrichmentDetails.errors.push(errorMsg)
  }

  result.enrichmentDetails.processingTimeMs = Date.now() - startTime
  
  console.log(
    `[doi-gateway] Process completed in ${result.enrichmentDetails.processingTimeMs}ms`,
  )
  
  return result
}

export function formatDOIGatewaySummary(result: DOIGatewayResult): string {
  const lines: string[] = []
  
  lines.push("📄 DOI Extraction & Metadata Summary")
  lines.push("=" .repeat(40))
  
  if (result.primaryDOI) {
    lines.push(`\n✅ Primary DOI: ${result.primaryDOI.doi}`)
    lines.push(`   Source: ${result.primaryDOI.source}`)
    lines.push(`   Confidence: ${result.primaryDOI.confidence.toUpperCase()}`)
    
    if (result.metadata) {
      lines.push(`\n📚 Paper Information:`)
      if (result.metadata.title) lines.push(`   Title: ${result.metadata.title}`)
      if (result.metadata.authors?.length) {
        lines.push(`   Authors: ${result.metadata.authors.slice(0, 3).join(", ")}${result.metadata.authors.length > 3 ? ` et al. (${result.metadata.authors.length} authors)` : ""}`)
      }
      if (result.metadata.journal) lines.push(`   Journal: ${result.metadata.journal}`)
      if (result.metadata.year) lines.push(`   Year: ${result.metadata.year}`)
      
      if (result.metadata.semanticScholar) {
        lines.push(`\n📊 Citation Metrics:`)
        lines.push(`   Total Citations: ${result.metadata.semanticScholar.citationCount}`)
        lines.push(`   Influential Citations: ${result.metadata.semanticScholar.influentialCitationCount}`)
        lines.push(`   References: ${result.metadata.semanticScholar.referencesCount}`)
        lines.push(`   Open Access: ${result.metadata.semanticScholar.openAccess ? "Yes" : "No"}`)
      }
      
      if (result.enrichmentDetails.sourcesUsed.length > 0) {
        lines.push(`\n🔗 Data Sources: ${result.enrichmentDetails.sourcesUsed.join(", ")}`)
      }
    }
  } else {
    lines.push("\n❌ No DOI found in the document")
  }
  
  if (result.extractedDOIs.length > 1) {
    lines.push(`\n📋 Total DOIs Found: ${result.extractedDOIs.length}`)
    result.extractedDOIs.slice(1).forEach((doi, i) => {
      lines.push(`   ${i + 1}. ${doi.doi} (${doi.source}, ${doi.confidence})`)
    })
  }
  
  lines.push(`\n⏱️ Processing Time: ${result.enrichmentDetails.processingTimeMs}ms`)
  
  if (result.enrichmentDetails.errors.length > 0) {
    lines.push(`\n⚠️ Errors: ${result.enrichmentDetails.errors.join("; ")}`)
  }
  
  return lines.join("\n")
}
