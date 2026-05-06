import { processPDFForDOI, formatDOIGatewaySummary } from "./doi-gateway"

// File attachment interface (matches CenterPanel's local definition)
export interface FileAttachment {
  id: string
  name: string
  type: "pdf" | "text" | "doi" | "url"
  size: number
  content: string
  pages?: number
}

export interface ProcessedFileContent {
  fileName: string
  fileType: "pdf" | "text" | "doi" | "url"
  fileSize: number
  
  // Extracted content (truncated for LLM context)
  content: string
  contentLength: number
  truncated: boolean
  
  // DOI and metadata (if applicable)
  doiInfo: {
    extracted: boolean
    primaryDOI: string | null
    confidence: string | null
    metadata?: {
      title?: string
      authors?: string[]
      journal?: string
      year?: number | string
      abstract?: string
      citationCount?: number
    }
  } | null
  
  // Structured summary for LLM
  llmContext: string
  
  // Processing info
  processingTime: number
  pages?: number
}

export interface FileProcessingConfig {
  maxContentSize: number        // Max characters to send to LLM (default: 15000)
  includeMetadata: boolean       // Include DOI metadata in context (default: true)
  includeAbstract: boolean       // Include paper abstract (default: true)
  extractDOI: boolean            // Auto-extract DOI (default: true)
  enrichMetadata: boolean        // Enrich with external APIs (default: true)
  chunkSize: number              // Content chunk size (default: 5000)
}

export const DEFAULT_FILE_PROCESSING_CONFIG: FileProcessingConfig = {
  maxContentSize: 15000,
  includeMetadata: true,
  includeAbstract: true,
  extractDOI: true,
  enrichMetadata: true,
  chunkSize: 5000,
}

export async function processFileForLLM(
  attachment: FileAttachment,
  config: Partial<FileProcessingConfig> = {},
): Promise<ProcessedFileContent> {
  const startTime = Date.now()
  const fullConfig = { ...DEFAULT_FILE_PROCESSING_CONFIG, ...config }
  
  const result: ProcessedFileContent = {
    fileName: attachment.name,
    fileType: attachment.type,
    fileSize: attachment.size,
    content: attachment.content || "",
    contentLength: attachment.content?.length || 0,
    truncated: false,
    doiInfo: null,
    llmContext: "",
    processingTime: 0,
    pages: attachment.pages,
  }

  try {
    if (attachment.type === "pdf" && fullConfig.extractDOI) {
      console.log(`[file-processor] Processing PDF: ${attachment.name}`)
      
      try {
        const gatewayResult = await processPDFForDOI(
          attachment.content,
          undefined,  // No separate metadata
          {
            autoEnrichOnExtract: fullConfig.enrichMetadata,
            cacheEnabled: true,
          }
        )
        
        if (gatewayResult.primaryDOI) {
          result.doiInfo = {
            extracted: true,
            primaryDOI: gatewayResult.primaryDOI.doi,
            confidence: gatewayResult.primaryDOI.confidence,
            metadata: gatewayResult.metadata ? {
              title: gatewayResult.metadata.title,
              authors: gatewayResult.metadata.authors,
              journal: gatewayResult.metadata.journal,
              year: gatewayResult.metadata.year,
              abstract: gatewayResult.metadata.abstract,
              citationCount: gatewayResult.metadata.semanticScholar?.citationCount,
            } : undefined,
          }
          
          console.log(`[file-processor] ✓ DOI extracted: ${gatewayResult.primaryDOI.doi}`)
        }
        
        if (fullConfig.enrichMetadata && gatewayResult.metadata) {
          const summary = formatDOIGatewaySummary(gatewayResult)
          console.log(`[file-processor] Metadata enrichment completed`)
        }
      } catch (doiError) {
        console.warn("[file-processor] DOI extraction failed:", doiError instanceof Error ? doiError.message : String(doiError))
        result.doiInfo = {
          extracted: false,
          primaryDOI: null,
          confidence: null,
        }
      }
    }

    let contentToSend = attachment.content || ""
    
    if (contentToSend.length > fullConfig.maxContentSize) {
      contentToSend = smartTruncate(contentToSend, fullConfig.maxContentSize)
      result.truncated = true
      result.content = contentToSend
      result.contentLength = contentToSend.length
      
      console.log(
        `[file-processor] Content truncated: ${attachment.content?.length || 0} → ${contentToSend.length} chars`
      )
    }

    result.llmContext = buildLLMContext(result, fullConfig)
    
  } catch (error) {
    console.error("[file-processor] Error processing file:", error)
    
    result.llmContext = `[File: ${attachment.name}]\n\n${(attachment.content || "").slice(0, fullConfig.maxContentSize)}\n\n[Note: File processing encountered an error. Showing raw content.]`
  }

  result.processingTime = Date.now() - startTime
  
  return result
}

function smartTruncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  
  const ratio = maxLength / text.length
  
  if (ratio > 0.7) {
    return text.slice(0, maxLength - 200) + "\n\n[... Content truncated ...]\n\n" + text.slice(-200)
  }
  
  const sections = extractKeySections(text)
  
  let truncated = ""
  let remaining = maxLength
  
  const priority = ["abstract", "introduction", "methods", "results", "conclusion"]
  
  for (const section of priority) {
    if (sections[section] && remaining > 500) {
      const sectionContent = sections[section].slice(0, Math.min(remaining - 100, sections[section].length))
      truncated += `## ${section.charAt(0).toUpperCase() + section.slice(1)}\n\n${sectionContent}\n\n`
      remaining -= sectionContent.length + 50
    }
  }
  
  if (remaining > 300 && !truncated.includes("results")) {
    truncated += `## Additional Content\n\n${text.slice(0, remaining)}\n\n`
  }
  
  return truncated + "[... Full document available upon request ...]"
}

function extractKeySections(text: string): Record<string, string> {
  const sections: Record<string, string> = {}
  
  const patterns = [
    { name: "abstract", regex: /(?:abstract|summary)[\s:\n]*([\s\S]*?)(?=\n(?:introduction|1\.|keywords)|$)/im },
    { name: "introduction", regex: /(?:introduction|background)[\s:\n]*([\s\S]*?)(?=\n(?:methods|materials|2\.)|$)/im },
    { name: "methods", regex: /(?:methods|methodology|materials)[\s:\n]*([\s\S]*?)(?=\n(?:results|3\.|discussion)|$)/im },
    { name: "results", regex: /(?:results|findings)[\s:\n]*([\s\S]*?)(?=\n(?:discussion|conclusion|4\.|5\.)|$)/im },
    { name: "conclusion", regex: /(?:conclusion|discussion)[\s:\n]*([\s\S]*?)(?=\n(?:references|acknowledgment)|$)/im },
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern.regex)
    if (match && match[1]) {
      sections[pattern.name] = match[1].trim()
    }
  }
  
  if (!sections.abstract) {
    const lines = text.split("\n").filter(line => line.trim().length > 50)
    if (lines.length > 0) {
      sections.abstract = lines.slice(0, 10).join("\n")
    }
  }
  
  return sections
}

function buildLLMContext(processed: ProcessedFileContent, config: FileProcessingConfig): string {
  const parts: string[] = []
  
  parts.push(`📄 **Document: ${processed.fileName}**`)
  
  if (processed.fileType === "pdf") {
    parts.push(`Type: PDF Document`)
    if (processed.pages) parts.push(`Pages: ${processed.pages}`)
    parts.push(`Size: ${(processed.fileSize / 1024 / 1024).toFixed(1)}MB`)
  } else {
    parts.push(`Type: Text Document`)
    parts.push(`Size: ${(processed.fileSize / 1024).toFixed(0)}KB`)
  }
  
  if (config.includeMetadata && processed.doiInfo?.extracted && processed.doiInfo.primaryDOI) {
    parts.push(`\n--- Paper Metadata ---`)
    parts.push(`DOI: ${processed.doiInfo.primaryDOI}`)
    parts.push(`Confidence: ${processed.doiInfo.confidence?.toUpperCase()}`)
    
    if (processed.doiInfo.metadata) {
      const meta = processed.doiInfo.metadata
      if (meta.title) parts.push(`Title: ${meta.title}`)
      if (meta.authors?.length) parts.push(`Authors: ${meta.authors.slice(0, 5).join(", ")}${meta.authors.length > 5 ? ` et al.` : ""}`)
      if (meta.journal) parts.push(`Journal: ${meta.journal}`)
      if (meta.year) parts.push(`Year: ${meta.year}`)
      if (meta.citationCount != null) parts.push(`Citations: ${meta.citationCount}`)
      
      if (config.includeAbstract && meta.abstract) {
        parts.push(`\n--- Abstract ---`)
        parts.push(meta.abstract.slice(0, 1500) + (meta.abstract.length > 1500 ? "..." : ""))
      }
    }
  }
  
  parts.push(`\n--- Document Content ---`)
  
  if (processed.truncated) {
    parts.push(`[⚠️ Content truncated to ${processed.contentLength} characters for context limits]`)
  }
  
  parts.push(processed.content)
  
  return parts.join("\n")
}

export async function processMultipleFilesForLLM(
  attachments: FileAttachment[],
  config: Partial<FileProcessingConfig> = {},
): Promise<{
  processedFiles: ProcessedFileContent[]
  combinedContext: string
  totalProcessingTime: number
}> {
  const startTime = Date.now()
  const processedFiles: ProcessedFileContent[] = []
  
  for (const attachment of attachments) {
    const processed = await processFileForLLM(attachment, config)
    processedFiles.push(processed)
  }
  
  const combinedContext = processedFiles
    .map((pf, index) => `\n=== File ${index + 1} of ${processedFiles.length} ===\n${pf.llmContext}\n`)
    .join("\n---\n")
  
  return {
    processedFiles,
    combinedContext,
    totalProcessingTime: Date.now() - startTime,
  }
}
