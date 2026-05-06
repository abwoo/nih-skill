export type DOISource = "regex_text" | "metadata" | "first_page" | "header_footer" | "references" | "crossref_lookup"
export type DOIConfidence = "high" | "medium" | "low"

export interface ExtractedDOI {
  doi: string
  source: DOISource
  confidence: DOIConfidence
  position?: {
    page?: number
    lineIndex?: number
    context: string
  }
  rawMatch: string
  normalized: string
}

export type DOIMatchStrategy = {
  id: string
  name: string
  description: string
  patterns: RegExp[]
  priority: number
  enabled: boolean
}

export const DEFAULT_DOI_STRATEGIES: DOIMatchStrategy[] = [
  {
    id: "standard_doi",
    name: "Standard DOI Pattern",
    description: "Matches standard DOI format (10.xxxx/xxxxx)",
    patterns: [
      /\b10\.\d{4,9}\/[^\s\]>\)}\]]+/g,
    ],
    priority: 100,
    enabled: true,
  },
  {
    id: "doi_prefix",
    name: "DOI with Prefix",
    description: "Matches DOI with 'doi:' or 'DOI:' prefix",
    patterns: [
      /(?:^|\s)(?:doi|DOI)[:\s]*(10\.\d{4,9}\/[^\s\]>\)}\]]+)/gi,
      /(?:https?:\/\/)?(?:dx\.)?doi\.org\/(10\.\d{4,9}\/[^\s\]>\)}\]]+)/gi,
    ],
    priority: 90,
    enabled: true,
  },
  {
    id: "bracketed_doi",
    name: "Bracketed DOI",
    description: "Matches DOI in brackets or parentheses",
    patterns: [
      /[\[\(](10\.\d{4,9}\/[^\s\]\)\]}]+)[\]\)]/gi,
    ],
    priority: 80,
    enabled: true,
  },
  {
    id: "arxiv_style",
    name: "arXiv-style Identifier",
    description: "Matches arXiv identifiers (for papers not yet having DOI)",
    patterns: [
      /(?:arXiv|arxiv)[:\s]*(\d{4}\.\d{4,5}(v\d+)?)/gi,
      /\b(\d{4}\.\d{4,5}(v\d+)?)\b(?=.*?(?:arxiv|preprint))/gi,
    ],
    priority: 70,
    enabled: true,
  },
]

export interface DOIExtractionConfig {
  strategies: DOIMatchStrategy[]
  maxResults: number
  validateWithCrossref: boolean
  extractFromMetadata: boolean
  extractFromFirstPage: boolean
  extractFromReferences: boolean
  minConfidence: DOIConfidence
  timeout: number
}

export const DEFAULT_EXTRACTION_CONFIG: DOIExtractionConfig = {
  strategies: DEFAULT_DOI_STRATEGIES,
  maxResults: 5,
  validateWithCrossref: false,
  extractFromMetadata: true,
  extractFromFirstPage: true,
  extractFromReferences: true,
  minConfidence: "low",
  timeout: 15000,
}
