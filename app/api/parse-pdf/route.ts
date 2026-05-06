import { NextRequest, NextResponse } from "next/server"
import { parsePDFBuffer, extractSections, extractTables, extractFigures, extractCitations, extractKeywords, extractDOIFromText } from "@/lib/pdf-parser"
import { processPDFForDOI, formatDOIGatewaySummary } from "@/lib/doi-gateway"

export const maxDuration = 60
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    let formData: FormData
    
    try {
      formData = await request.formData()
    } catch (formError) {
      console.error("[parse-pdf] Failed to parse form data:", formError)
      return NextResponse.json(
        { 
          error: "Failed to parse upload form data",
          details: "The request must be a multipart/form-data with a 'file' field.",
        },
        { status: 400 }
      )
    }

    // Get file from form data
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { 
          error: "No file provided",
          details: "Please upload a PDF file using the 'file' field in the form data.",
        },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      return NextResponse.json(
        { 
          error: "Invalid file type",
          details: `Expected a PDF file (.pdf), but received "${file.name}" (type: ${file.type || "unknown"}).`,
        },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: "File too large",
          details: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the maximum allowed size of 50MB.`,
        },
        { status: 413 }
      )
    }

    // Validate file is not empty
    if (file.size === 0) {
      return NextResponse.json(
        { 
          error: "Empty file",
          details: "The uploaded PDF file is empty (0 bytes).",
        },
        { status: 400 }
      )
    }

    console.log(`[parse-pdf] Processing: ${file.name} (${(file.size / 1024).toFixed(0)}KB)`)

    try {
      // Convert File to ArrayBuffer, then to Uint8Array for universal compatibility
      const arrayBuffer = await file.arrayBuffer()
      
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error("File conversion resulted in empty buffer")
      }
      
      const uint8Array = new Uint8Array(arrayBuffer)

      // Parse PDF (passing Uint8Array directly for maximum compatibility)
      const parsed = await parsePDFBuffer(uint8Array)

      // Extract additional information
      const sections = extractSections(parsed.text)
      const tables = extractTables(parsed.text)
      const figures = extractFigures(parsed.text)
      const citations = extractCitations(parsed.text)
      const keywords = extractKeywords(parsed.text)
      const doi = extractDOIFromText(parsed.text)

      // Enhanced DOI extraction and metadata enrichment
      console.log("[parse-pdf] Starting DOI gateway processing...")
      const doiGatewayResult = await processPDFForDOI(
        parsed.text,
        parsed.metadata as Record<string, unknown> | undefined,
        {
          autoEnrichOnExtract: true,
          cacheEnabled: true,
        }
      )

      // Generate human-readable summary
      const doiSummary = formatDOIGatewaySummary(doiGatewayResult)

      console.log(`[parse-pdf] DOI Gateway completed - Found ${doiGatewayResult.extractedDOIs.length} DOI(s), Success: ${doiGatewayResult.success}`)

      // Return successful result with enhanced DOI data
      return NextResponse.json({
        success: true,
        filename: file.name,
        size: file.size,
        pages: parsed.pages,
        metadata: parsed.metadata,
        text: parsed.text,
        sections,
        tables,
        figures,
        citations,
        keywords,
        doi,
        
        // Enhanced DOI extraction and metadata
        doiExtraction: {
          extractedDOIs: doiGatewayResult.extractedDOIs,
          primaryDOI: doiGatewayResult.primaryDOI?.doi || null,
          primaryDOISource: doiGatewayResult.primaryDOI?.source || null,
          primaryDOIConfidence: doiGatewayResult.primaryDOI?.confidence || null,
          totalDOIsFound: doiGatewayResult.extractedDOIs.length,
        },
        
        paperMetadata: (() => {
          const meta = doiGatewayResult.metadata
          if (!meta) return null
          
          return {
            title: meta.title || undefined,
            authors: meta.authors || undefined,
            journal: meta.journal || undefined,
            year: meta.year || undefined,
            volume: meta.volume || undefined,
            issue: meta.issue || undefined,
            pages: meta.pages || undefined,
            abstract: meta.abstract || undefined,
            publisher: meta.publisher || undefined,
            type: meta.type || undefined,
            url: meta.url || undefined,
            
            // Citation metrics from Semantic Scholar
            citationMetrics: meta.semanticScholar ? {
              totalCitations: meta.semanticScholar.citationCount,
              influentialCitations: meta.semanticScholar.influentialCitationCount,
              referencesCount: meta.semanticScholar.referencesCount,
              isOpenAccess: meta.semanticScholar.openAccess,
              fieldsOfStudy: meta.semanticScholar.fieldsOfStudy,
              publicationTypes: meta.semanticScholar.publicationTypes,
            } : null,
            
            // Open Access info from Unpaywall
            openAccess: meta.unpaywall ? {
              isOA: meta.unpaywall.isOA,
              oaStatus: meta.unpaywall.oaStatus,
              pdfUrl: meta.unpaywall.bestOaLocation?.urlForPdf || null,
              landingPageUrl: meta.unpaywall.bestOaLocation?.urlForLandingPage || null,
              license: meta.unpaywall.bestOaLocation?.license || null,
            } : null,
            
            // PubMed info
            pubmedInfo: meta.pubmed ? {
              pmid: meta.pubmed.pmid,
              pmcid: meta.pubmed.pmcid,
              meshTerms: meta.pubmed.meshTerms,
              publicationTypes: meta.pubmed.publicationTypes,
            } : null,
            
            // Enrichment details
            enrichmentDetails: {
              validated: meta.validated,
              sourcesUsed: doiGatewayResult.enrichmentDetails.sourcesUsed,
              processingTimeMs: doiGatewayResult.enrichmentDetails.processingTimeMs,
              errors: doiGatewayResult.enrichmentDetails.errors,
              warnings: doiGatewayResult.enrichmentDetails.warnings,
            },
          }
        })(),
        
        // Human-readable summary
        doiSummary,
        
        wordCount: parsed.text.split(/\s+/).length,
        charCount: parsed.text.length,
      })
    } catch (parseError) {
      console.error("[parse-pdf] Parsing error:", parseError)
      
      const message = parseError instanceof Error ? parseError.message : "Failed to parse PDF"
      
      // Determine appropriate HTTP status code
      let statusCode = 500
      if (message.includes("Empty PDF") || message.includes("empty")) {
        statusCode = 400
      } else if (message.includes("password-protected")) {
        statusCode = 403
      } else if (message.includes("Could not extract meaningful text") || message.includes("image-based")) {
        statusCode = 422
      } else if (message.includes("Failed to parse PDF")) {
        statusCode = 422
      }
      
      return NextResponse.json(
        { 
          error: message,
          details: getDetailedErrorMessage(message),
          filename: file.name,
          size: file.size,
        },
        { status: statusCode }
      )
    }
  } catch (error) {
    console.error("[parse-pdf] Unexpected error:", error)
    
    const message = error instanceof Error ? error.message : "Internal server error"
    
    return NextResponse.json(
      { 
        error: message,
        details: "An unexpected error occurred while processing the PDF file. Please try again or contact support.",
      },
      { status: 500 }
    )
  }
}

/**
 * Provide user-friendly error messages based on the technical error
 */
function getDetailedErrorMessage(technicalMessage: string): string {
  if (technicalMessage.includes("password-protected")) {
    return "The PDF file is password-protected and cannot be processed. Please provide an unprotected version."
  }
  
  if (technicalMessage.includes("image-based") || technicalMessage.includes("scanned")) {
    return "This appears to be a scanned/image-based PDF without embedded text. Consider using OCR software first."
  }
  
  if (technicalMessage.includes("corrupted") || technicalMessage.includes("invalid")) {
    return "The PDF file appears to be corrupted or invalid. Please verify the file integrity."
  }
  
  if (technicalMessage.includes("Empty PDF") || technicalMessage.includes("empty")) {
    return "The uploaded PDF file contains no content."
  }
  
  if (technicalMessage.includes("Failed to parse PDF")) {
    return "PDF parsing failed due to an internal error. The file format may not be fully supported."
  }
  
  return "PDF parsing failed. Please ensure the file is a valid, non-corrupted PDF document."
}

// Handle GET requests for API health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/parse-pdf",
    method: "POST",
    description: "Upload and parse PDF files to extract text, metadata, DOI, and enriched paper information",
    supportedFormats: ["application/pdf", ".pdf"],
    maxSize: "50MB",
    features: [
      "Full text extraction",
      "Metadata extraction (title, author, etc.)",
      "Table of contents / outline detection",
      "Section identification (abstract, methods, results, etc.)",
      "Table and figure references",
      "Citation extraction",
      "Keyword extraction",
      
      // Enhanced DOI features
      "🆕 Automatic DOI extraction from PDF content",
      "🆕 Multi-strategy DOI detection (text, metadata, first page, references)",
      "🆕 DOI confidence scoring (high/medium/low)",
      "🆕 Crossref validation support",
      "🆕 Metadata enrichment from multiple sources:",
      "   - CrossRef (bibliographic data)",
      "   - Semantic Scholar (citation metrics, fields of study)",
      "   - OpenAlex (concepts, topics, APC info)",
      "   - Unpaywall (open access status, PDF links)",
      "   - PubMed (MeSH terms, grant information)",
      "🆕 Intelligent caching for performance",
      "🆕 Human-readable summary generation",
    ],
    newFeatures: {
      doiExtraction: {
        description: "Automatically extract DOIs using multiple strategies",
        strategies: [
          "Standard DOI pattern matching",
          "DOI with prefix (doi:, DOI:, URL)",
          "Bracketed DOIs",
          "Metadata field extraction",
          "First-page focused extraction",
          "Reference section scanning",
        ],
        output: {
          extractedDOIs: "Array of all found DOIs with source and confidence",
          primaryDOI: "Best candidate DOI for the paper",
          paperMetadata: "Complete enriched metadata from external APIs",
          citationMetrics: "Citation counts and influence scores",
          openAccess: "OA status and download links",
        }
      },
      enrichmentSources: {
        crossref: "Bibliographic data, publisher info",
        semanticScholar: "Citation metrics, AI-powered features",
        openAlex: "Research concepts, open access pricing",
        unpaywall: "Legal OA versions, PDF links",
        pubmed: "Medical subject headings, funding info",
      },
      performance: {
        caching: "Enabled by default (1 hour TTL)",
        timeout: "15-30 seconds total for all sources",
        fallbackOrder: "CrossRef → Semantic Scholar → OpenAlex",
      },
    },
    note: "Supports both text-based and scanned PDFs (with OCR limitations). DOI extraction works best with publisher PDFs.",
    exampleResponse: {
      success: true,
      filename: "paper.pdf",
      pages: 12,
      doiExtraction: {
        primaryDOI: "10.1234/example.2024.001",
        primaryDOISource: "metadata",
        primaryDOIConfidence: "high",
        totalDOIsFound: 3,
      },
      paperMetadata: {
        title: "Example Paper Title",
        authors: ["Author A", "Author B"],
        journal: "Nature Medicine",
        year: 2024,
        citationMetrics: {
          totalCitations: 150,
          isOpenAccess: true,
        },
        openAccess: {
          isOA: true,
          pdfUrl: "https://...",
        },
      },
    },
  })
}
