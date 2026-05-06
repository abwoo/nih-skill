// PDF Parser for BME Research Accelerator
// Supports both Node.js (server) and browser environments

import { logger } from "./logger"

export interface ParsedPDF {
  text: string
  pages: number
  metadata?: {
    title?: string
    author?: string
    subject?: string
    creator?: string
    producer?: string
    creationDate?: string
    modificationDate?: string
  }
  outline?: Array<{
    title: string
    page: number
    items?: Array<{ title: string; page: number }>
  }>
}

// Type guard for Buffer detection in cross-environment code
function isBuffer(obj: unknown): obj is Buffer {
  return typeof Buffer !== 'undefined' && obj instanceof Buffer
}

/**
 * PDF.js TextItem interface for type-safe text extraction
 */
interface PDFJSTextItem {
  str?: string
  height?: number
  width?: number
  transform?: number[]
  [key: string]: unknown
}

/**
 * Normalize input to Uint8Array - works in all environments
 */
function normalizeToUint8Array(buffer: Buffer | Uint8Array | ArrayBuffer): Uint8Array {
  if (buffer instanceof Uint8Array) {
    return buffer
  }
  
  if (buffer instanceof ArrayBuffer) {
    return new Uint8Array(buffer)
  }
  
  // Buffer (Node.js) - use type assertion for compatibility
  const nodeBuffer = buffer as { buffer: ArrayBufferLike; byteOffset: number; byteLength: number }
  if (typeof (Buffer as any) !== 'undefined' && 'byteLength' in nodeBuffer && typeof nodeBuffer.byteLength === 'number') {
    try {
      return new Uint8Array(nodeBuffer.buffer, nodeBuffer.byteOffset, nodeBuffer.byteLength)
    } catch {
      // Fallback: convert via ArrayBuffer
      return new Uint8Array(new ArrayBuffer(0))
    }
  }
  
  // Last resort - return empty array to prevent crash
  return new Uint8Array()
}

/**
 * Extract text using pdf-parse library (Node.js only, fast and reliable)
 */
async function extractWithPdfParse(uint8Array: Uint8Array): Promise<{ text: string; pages: number } | null> {
  try {
    // Only available in Node.js environment
    if (typeof process === 'undefined' || !process.versions?.node) {
      return null
    }
    
    // Dynamic import to avoid issues in browser environment
    const pdfParse = await import("pdf-parse")
    
    // Convert Uint8Array to Buffer for pdf-parse
    const { Buffer: NodeBuffer } = await import("buffer")
    const buffer = NodeBuffer.from(
      uint8Array.buffer as ArrayBuffer,
      uint8Array.byteOffset,
      uint8Array.byteLength
    )
    
    const data = await pdfParse.default(buffer)
    
    if (data.text && data.text.trim() && data.numpages > 0) {
      logger.pdf.log('Text extracted with pdf-parse', { pages: data.numpages })
      return {
        text: data.text.trim(),
        pages: data.numpages,
      }
    }
    
    return null
  } catch (error) {
    logger.pdf.warn('pdf-parse failed, will try alternative method', error instanceof Error ? error.message : String(error))
    return null
  }
}

/**
 * Extract text using PDF.js with proper configuration for server-side usage
 */
async function extractWithPdfJS(uint8Array: Uint8Array): Promise<{ text: string; pages: number }> {
  try {
    // Import PDF.js dynamically
    const pdfjsLib = await import("pdfjs-dist")
    
    // CRITICAL: Disable worker for server-side (Node.js/Edge Runtime) usage
    // This prevents the "Cannot find module 'pdf.worker.mjs'" error
    ;(pdfjsLib as any).GlobalWorkerOptions.workerSrc = ''
    ;(pdfjsLib as any).GlobalWorkerOptions.workerPort = undefined
    
    // Configure for server-side (no worker needed when we use specific options)
    const pdfDoc = await pdfjsLib.getDocument({
      data: uint8Array,
      useSystemFonts: true,
      useWorkerFetch: false,
      isEvalSupported: false,
      disableAutoFetch: true,
      disableStream: true,
      // These options help avoid worker-related errors
      fontExtraProperties: true,
    }).promise
    
    const numPages = pdfDoc.numPages
    let fullText = ""
    
    // Extract text from each page with error handling per page
    for (let pageNum = 1; pageNum <= Math.min(numPages, 100); pageNum++) {
      try {
        const page = await pdfDoc.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        const pageText = textContent.items
          .map((item: PDFJSTextItem) => item.str || "")
          .join(" ")
        
        if (pageText.trim()) {
          fullText += pageText + "\n\n"
        }
      } catch (pageError) {
        logger.pdf.warn(`Could not extract text from page ${pageNum}`, pageError)
        // Continue with other pages
      }
    }
    
    // Clean up
    try {
      pdfDoc.destroy()
    } catch (e) {
      // Ignore cleanup errors
    }
    
    fullText = fullText.trim()
    
    if (!fullText || fullText.length < 10) {
      throw new Error("Could not extract meaningful text from PDF")
    }
    
    logger.pdf.log('Text extracted with PDF.js', { pages: numPages })
    return { text: fullText, pages: numPages }
    
  } catch (error) {
    logger.pdf.error('PDF.js extraction error', error)
    throw error
  }
}

/**
 * Main function to parse PDF and extract text content
 * Uses dual-engine approach: tries pdf-parse first (faster), falls back to PDF.js
 */
export async function parsePDFBuffer(buffer: Buffer | Uint8Array | ArrayBuffer): Promise<ParsedPDF> {
  try {
    // Step 1: Normalize input to Uint8Array
    const uint8Array = normalizeToUint8Array(buffer)
    
    if (uint8Array.length === 0) {
      throw new Error("Empty PDF data provided")
    }

    let text = ""
    let pages = 0

    // Step 2: Try pdf-parse first (fast, Node.js only)
    const pdfParseResult = await extractWithPdfParse(uint8Array)
    
    if (pdfParseResult) {
      text = pdfParseResult.text
      pages = pdfParseResult.pages
    }
    
    // Step 3: If pdf-parse didn't work or wasn't available, use PDF.js
    if (!text) {
      logger.pdf.log('Using PDF.js for text extraction...')
      const pdfjsResult = await extractWithPdfJS(uint8Array)
      text = pdfjsResult.text
      pages = pdfjsResult.pages
    }

    // Step 4: Try to get metadata (optional, best-effort)
    let metadata: ParsedPDF["metadata"] | undefined
    
    try {
      const pdfjsLib = await import("pdfjs-dist")
      
      // Disable worker for server-side usage
      ;(pdfjsLib as any).GlobalWorkerOptions.workerSrc = ''
      
      // Try to create document again for metadata (may fail, that's ok)
      const metaDoc = await pdfjsLib.getDocument({
        data: uint8Array,
        useSystemFonts: true,
        useWorkerFetch: false,
        isEvalSupported: false,
        disableAutoFetch: true,
        disableStream: true,
      } as Parameters<typeof pdfjsLib.getDocument>[0]).promise
      
      const pdfMetadata = await metaDoc.getMetadata()
      const info = pdfMetadata.info as Record<string, unknown> | undefined
      
      if (info && typeof info === 'object') {
        metadata = {
          title: info.Title as string | undefined,
          author: info.Author as string | undefined,
          subject: info.Subject as string | undefined,
          creator: info.Creator as string | undefined,
          producer: info.Producer as string | undefined,
          creationDate: info.CreationDate as string | undefined,
          modificationDate: info.ModDate as string | undefined,
        }
      }
      
      // Clean up
      try { metaDoc.destroy() } catch (e) { /* ignore */ }
      
    } catch (metaError) {
      // Metadata extraction is optional, don't fail the whole process
      logger.pdf.log('Metadata extraction skipped (optional)')
    }

    logger.pdf.log('Success', { pages, words: text.split(/\s+/).length })

    return {
      text,
      pages,
      metadata,
    }
    
  } catch (error) {
    console.error("[parsePDF] Fatal error:", error)
    
    const message = error instanceof Error ? error.message : "Unknown parsing error"
    
    // Provide helpful error messages
    if (message.includes("password") || message.includes("encrypted")) {
      throw new Error("The PDF is password-protected and cannot be processed.")
    }
    
    if (message.includes("Could not extract meaningful text")) {
      throw new Error("Could not extract text from this PDF. It may be a scanned/image-based document without embedded text layers.")
    }
    
    throw new Error(`Failed to parse PDF: ${message}`)
  }
}

/**
 * Extract structured sections from PDF text (abstract, methods, results, etc.)
 */
export function extractSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {}
  
  const sectionPatterns = [
    { name: "abstract", pattern: /(?:abstract|摘要|ABSTRACT)[\s:\n]*([\s\S]*?)(?=\n\s*(?:introduction|1\.|keywords|关键词)|$)/i },
    { name: "introduction", pattern: /(?:introduction|引言|INTRODUCTION)[\s:\n]*([\s\S]*?)(?=\n\s*(?:methods|materials|2\.|related work)|$)/i },
    { name: "methods", pattern: /(?:methods|methodology|materials and methods|实验方法|MATERIALS AND METHODS)[\s:\n]*([\s\S]*?)(?=\n\s*(?:results|3\.|discussion)|$)/i },
    { name: "results", pattern: /(?:results|结果|RESULTS)[\s:\n]*([\s\S]*?)(?=\n\s*(?:discussion|conclusion|4\.)|$)/i },
    { name: "discussion", pattern: /(?:discussion|讨论|DISCUSSION)[\s:\n]*([\s\S]*?)(?=\n\s*(?:conclusion|6\.|references)|$)/i },
    { name: "conclusion", pattern: /(?:conclusion|结论|CONCLUSIONS)[\s:\n]*([\s\S]*?)(?=\n\s*(?:references|acknowledgments)|$)/i },
    { name: "references", pattern: /(?:references|参考文献|REFERENCES)[\s:\n]*([\s\S]*?)$/i },
  ]
  
  for (const { name, pattern } of sectionPatterns) {
    const match = text.match(pattern)
    if (match?.[1]?.trim()) {
      sections[name] = match[1].trim()
    }
  }
  
  return sections
}

/**
 * Extract table references from text
 */
export function extractTables(text: string): string[] {
  const tables: string[] = []
  const tablePattern = /(?:table\s+\d+[\.:]\s*)([\s\S]*?)(?=(?:table\s+\d+[\.:]|figure\s+\d+[\.:]|$))/gi
  
  let match
  while ((match = tablePattern.exec(text)) !== null) {
    if (match[1].trim()) tables.push(match[1].trim())
  }
  
  return tables
}

/**
 * Extract figure references from text
 */
export function extractFigures(text: string): string[] {
  const figures: string[] = []
  const figurePattern = /(?:figure\s+\d+[\.:]\s*)([\s\S]*?)(?=(?:figure\s+\d+[\.:]|table\s+\d+[\.:]|$))/gi
  
  let match
  while ((match = figurePattern.exec(text)) !== null) {
    if (match[1].trim()) figures.push(match[1].trim())
  }
  
  return figures
}

/**
 * Extract citation references from text
 */
export function extractCitations(text: string): string[] {
  const citations = new Set<string>()
  const patterns = [
    /\[(\d+(?:,\s*\d+)*)\]/g,
    /\(([^)]*?\d{4}[^)]*)\)/g,
    /(\w+\s+et\s+al\.?,?\s*\d{4})/gi,
  ]
  
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      citations.add(match[0])
    }
  }
  
  return Array.from(citations)
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string): string[] {
  const keywords = new Set<string>()
  const keywordPatterns = [
    /(?:keywords?|关键词)[\s:]*([^\n]+)/gi,
  ]
  
  for (const pattern of keywordPatterns) {
    const match = text.match(pattern)
    if (match?.[1]) {
      match[1].split(/[,;]/).forEach(w => {
        const word = w.trim()
        if (word.length > 0) keywords.add(word)
      })
    }
  }
  
  return Array.from(keywords)
}

/**
 * Extract DOI identifier from text
 */
export function extractDOIFromText(text: string): string | null {
  const doiPatterns = [
    /10\.\d{4,9}\/[^\s]+/g,
    /doi[:\s]*(10\.\d{4,9}\/[^\s]+)/gi,
  ]
  
  for (const pattern of doiPatterns) {
    const match = text.match(pattern)
    if (match) {
      return match[0].replace(/.*?(10\.\d{4,9}\/[^\s]+).*/, "$1")
    }
  }
  
  return null
}
