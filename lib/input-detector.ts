export type InputType = "pdf" | "url" | "doi" | "pmid" | "arxiv" | "text" | "unknown"

export interface DetectedInput {
  type: InputType
  value: string
  confidence: number
  normalized?: string
}

const DOI_REGEX = /^10\.\d{4,9}\/[^\s]+$/
const PMID_REGEX = /^\d{8}$/
const ARXIV_REGEX = /^\d{4}\.\d{4,5}(v\d+)?$/
const URL_REGEX = /^https?:\/\/.+$/i

export function detectInputType(input: string): DetectedInput {
  const trimmed = input.trim()
  
  if (!trimmed) {
    return { type: "unknown", value: "", confidence: 0 }
  }

  // Check for DOI (highest priority)
  if (DOI_REGEX.test(trimmed)) {
    return {
      type: "doi",
      value: trimmed,
      confidence: 0.99,
      normalized: trimmed.toLowerCase(),
    }
  }

  // Check for DOI in text (e.g., "doi: 10.xxxx/xxx")
  const doiInText = trimmed.match(/(?:doi[:\s]|https?:\/\/doi\.org\/)(10\.\d{4,9}\/[^\s]+)/i)
  if (doiInText) {
    return {
      type: "doi",
      value: doiInText[1],
      confidence: 0.95,
      normalized: doiInText[1].toLowerCase(),
    }
  }

  // Check for PubMed ID
  if (PMID_REGEX.test(trimmed)) {
    return { type: "pmid", value: trimmed, confidence: 0.95 }
  }
  
  // Check for arXiv ID
  if (ARXIV_REGEX.test(trimmed)) {
    return { type: "arxiv", value: trimmed, confidence: 0.95 }
  }
  
  // Check for arXiv URL
  if (trimmed.includes("arxiv.org/abs/") || trimmed.includes("arxiv.org/pdf/")) {
    const arxivMatch = trimmed.match(/arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5})(v\d+)?/)
    if (arxivMatch) {
      return {
        type: "arxiv",
        value: arxivMatch[1] + (arxivMatch[2] || ""),
        confidence: 0.98,
      }
    }
  }

  // Check for URL
  if (URL_REGEX.test(trimmed)) {
    // Check specific academic URLs
    if (trimmed.includes("pubmed.ncbi.nlm.nih.gov")) {
      const pmidMatch = trimmed.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/)
      if (pmidMatch) {
        return { type: "pmid", value: pmidMatch[1], confidence: 0.98 }
      }
    }
    
    if (trimmed.includes("doi.org")) {
      const doiMatch = trimmed.match(/doi\.org\/(10\.\d{4,9}\/[^\s\?&]+)/)
      if (doiMatch) {
        return {
          type: "doi",
          value: doiMatch[1],
          confidence: 0.98,
          normalized: doiMatch[1].toLowerCase(),
        }
      }
    }

    // General URL
    let confidence = 0.85
    
    // Increase confidence for known domains
    const academicDomains = [
      "arxiv.org", "pubmed.gov", "nature.com", "science.org",
      "ieee.org", "springer.com", "wiley.com", "acm.org",
      "semanticscholar.org", "researchgate.net",
    ]
    
    try {
      const urlObj = new URL(trimmed)
      if (academicDomains.some(d => urlObj.hostname.includes(d))) {
        confidence = 0.92
      }
      
      // File extension check
      if (trimmed.toLowerCase().endsWith(".pdf")) {
        return { type: "url", value: trimmed, confidence: 0.97 }
      }
    } catch {
      // Invalid URL format
    }
    
    return { type: "url", value: trimmed, confidence }
  }

  // Check for file path or base64 PDF indicator
  if (trimmed.toLowerCase().startsWith("%pdf") || 
      trimmed.toLowerCase().includes("data:application/pdf") ||
      trimmed.toLowerCase().endsWith(".pdf")) {
    return { type: "pdf", value: trimmed, confidence: 0.90 }
  }

  // Default to text
  return { type: "text", value: trimmed, confidence: 0.70 }
}

export function getInputTypeLabel(type: InputType): string {
  switch (type) {
    case "pdf": return "PDF Document"
    case "url": return "URL"
    case "doi": return "DOI"
    case "pmid": return "PubMed ID"
    case "arxiv": return "arXiv ID"
    case "text": return "Text / Query"
    default: return "Unknown"
  }
}

export function getInputTypeIcon(type: InputType): string {
  switch (type) {
    case "pdf": return "📄"
    case "url": return "🔗"
    case "doi": return "🔬"
    case "pmid": return "🏥"
    case "arxiv": return "📚"
    case "text": return "✏️"
    default: return "❓"
  }
}

export function normalizeInput(input: string): string {
  const detected = detectInputType(input)
  
  if (detected.normalized) {
    return detected.normalized
  }
  
  // Basic normalization
  return input.trim()
}
