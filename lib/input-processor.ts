import { parsePDFBuffer } from "@/lib/pdf-parser"
import { fetchURLContent, fetchArxivAbstract, fetchPubMedAbstract, extractIdentifierFromURL } from "@/lib/url-fetcher"
import { resolveDOI, searchByDOI } from "@/lib/doi-resolver"
import { detectInputType, InputType } from "@/lib/input-detector"

export interface ProcessedResult {
  success: boolean
  inputType: InputType
  inputValue: string
  title?: string
  authors?: string[]
  abstract?: string
  fullText?: string
  metadata?: Record<string, unknown>
  sections?: Record<string, string>
  doi?: string
  url?: string
  error?: string
}

export async function processInput(input: string, pdfFile?: File): Promise<ProcessedResult> {
  const detected = detectInputType(input)

  try {
    switch (detected.type) {
      case "pdf":
        if (pdfFile) {
          return await processPDF(pdfFile)
        }
        throw new Error("PDF file is required for PDF input type")

      case "doi":
        return await processDOI(detected.value)

      case "pmid":
        return await processPubMed(detected.value)

      case "arxiv":
        return await processArxiv(detected.value)

      case "url":
        return await processURL(detected.value)

      case "text":
        return await processText(detected.value)

      default:
        throw new Error(`Unsupported input type: ${detected.type}`)
    }
  } catch (error) {
    console.error("[processInput] Error:", error)
    return {
      success: false,
      inputType: detected.type,
      inputValue: input,
      error: error instanceof Error ? error.message : "Processing failed",
    }
  }
}

async function processPDF(file: File): Promise<ProcessedResult> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  const parsed = await parsePDFBuffer(buffer)
  
  return {
    success: true,
    inputType: "pdf",
    inputValue: file.name,
    title: parsed.metadata?.title,
    authors: parsed.metadata?.author ? [parsed.metadata.author] : undefined,
    abstract: extractSection(parsed.text, ["abstract", "摘要"]),
    fullText: parsed.text,
    metadata: parsed.metadata as Record<string, unknown>,
    sections: extractAllSections(parsed.text),
  }
}

async function processDOI(doi: string): Promise<ProcessedResult> {
  const resolved = await resolveDOI(doi)
  const additionalData = await searchByDOI(doi)
  
  return {
    success: true,
    inputType: "doi",
    inputValue: doi,
    title: resolved.metadata.title || additionalData.title,
    authors: resolved.metadata.authors || additionalData.authors,
    abstract: resolved.metadata.abstract || additionalData.abstract,
    doi: resolved.doi,
    url: resolved.resolvedUrl,
    metadata: {
      ...resolved.metadata,
      ...additionalData,
    },
  }
}

async function processPubMed(pmid: string): Promise<ProcessedResult> {
  const abstract = await fetchPubMedAbstract(pmid)
  
  // Try to extract title from abstract
  const lines = abstract.split("\n").filter(l => l.trim())
  const title = lines[0]?.replace(/^\d+\.\s*/, "")
  
  return {
    success: true,
    inputType: "pmid",
    inputValue: pmid,
    title,
    abstract,
    url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
  }
}

async function processArxiv(arxivId: string): Promise<ProcessedResult> {
  const abstract = await fetchArxivAbstract(arxivId)
  
  return {
    success: true,
    inputType: "arxiv",
    inputValue: arxivId,
    abstract,
    url: `https://arxiv.org/abs/${arxivId}`,
  }
}

async function processURL(url: string): Promise<ProcessedResult> {
  // Check for embedded identifiers
  const identifier = extractIdentifierFromURL(url)
  
  if (identifier) {
    switch (identifier.type) {
      case "doi":
        return await processDOI(identifier.id)
      case "pubmed":
        return await processPubMed(identifier.id)
      case "arxiv":
        return await processArxiv(identifier.id)
    }
  }

  // Fetch general URL content
  const content = await fetchURLContent(url)
  
  return {
    success: true,
    inputType: "url",
    inputValue: url,
    title: content.metadata?.title,
    abstract: content.metadata?.description,
    fullText: content.text,
    url: content.url,
    metadata: content.metadata as Record<string, unknown>,
  }
}

async function processText(text: string): Promise<ProcessedResult> {
  // Check if text contains a DOI
  const doiMatch = text.match(/(10\.\d{4,9}\/[^\s]+)/i)
  if (doiMatch) {
    return await processDOI(doiMatch[1])
  }

  return {
    success: true,
    inputType: "text",
    inputValue: text,
    fullText: text,
  }
}

function extractSection(text: string, sectionNames: string[]): string | undefined {
  for (const name of sectionNames) {
    const pattern = new RegExp(`${name}[\\s:\\n]*([\\s\\S]*?)(?=\\n\\s*(?:introduction|1\\.|keywords|关键词)|$)`, "i")
    const match = text.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  return undefined
}

function extractAllSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {}
  
  const sectionPatterns = [
    { name: "abstract", regex: /(?:abstract|摘要)[\s:\n]*([\s\S]*?)(?=\n\s*(?:introduction|1\.|keywords)|$)/i },
    { name: "introduction", regex: /(?:introduction|引言)[\s:\n]*([\s\S]*?)(?=\n\s*(?:methods|materials|2\.)|$)/i },
    { name: "methods", regex: /(?:methods|methodology|实验方法)[\s:\n]*([\s\S]*?)(?=\n\s*(?:results|3\.)|$)/i },
    { name: "results", regex: /(?:results|结果)[\s:\n]*([\s\S]*?)(?=\n\s*(?:discussion|conclusion|4\.|5\.)|$)/i },
    { name: "discussion", regex: /(?:discussion|讨论)[\s:\n]*([\s\S]*?)(?=\n\s*(?:conclusion|6\.|references)|$)/i },
    { name: "conclusion", regex: /(?:conclusion|结论)[\s:\n]*([\s\S]*?)(?=\n\s*(?:references)|$)/i },
  ]
  
  for (const { name, regex } of sectionPatterns) {
    const match = text.match(regex)
    if (match && match[1]) {
      sections[name] = match[1].trim()
    }
  }
  
  return sections
}

// Export individual processing functions for direct use in API routes
export { processPDF, processDOI, processPubMed, processArxiv, processURL, processText }
