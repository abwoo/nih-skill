import type { FetchResult } from "@/lib/fetch-paper-service"
import { fetchPaperDirect } from "@/lib/fetch-paper-service"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { input } = body

    if (!input) {
      return NextResponse.json(
        {
          success: false,
          error: "No input provided",
          suggestion: "Please provide one of: url, doi, pmid, arxivId, or a search query"
        },
        { status: 400 }
      )
    }

    console.log(`[api/fetch-paper] Received request for input: "${typeof input === 'string' ? input : JSON.stringify(input)}"`)

    const result: FetchResult = await fetchPaperDirect(input)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[api/fetch-paper] Fatal error:", error)

    const message = error instanceof Error ? error.message : "Failed to fetch paper"

    return NextResponse.json(
      {
        success: false,
        text: "",
        source: "error",
        error: message,
        suggestion: "Please check your input and try again. If the problem persists, the service may be temporarily unavailable."
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/fetch-paper",
    method: "POST",
    contentType: "application/json",
    version: "2.0-enhanced",
    description: "Enhanced paper fetching with retry mechanism and multi-source aggregation",
    parameters: {
      input: "DOI, URL, PMID, arXiv ID, or search query (single string field)"
    },
    supportedSources: [
      "DOI (via CrossRef + Semantic Scholar + Unpaywall)",
      "arXiv IDs (with PDF full-text extraction)",
      "PubMed/PMCID (with full-text access)",
      "Any HTTP(S) URL (HTML/PDF content extraction)",
      "Search queries (via PubMed)"
    ],
    features: [
      "✨ Automatic retry mechanism (3 attempts with exponential backoff)",
      "✨ Smart timeout optimization (15-30s depending on source)",
      "✨ Multi-source metadata aggregation",
      "✨ Open access PDF detection via Unpaywall",
      "✨ Enhanced error messages with actionable suggestions",
      "✨ Automatic source type detection"
    ],
    examples: {
      doi: { input: "10.1038/nature12373", description: "Fetch by DOI" },
      arxiv: { input: "2301.12345", description: "Fetch by arXiv ID" },
      url: { input: "https://arxiv.org/abs/2301.12345", description: "Fetch by URL" },
      pmid: { input: "12345678", description: "Fetch by PubMed ID" }
    },
    responseFormat: {
      success: "boolean - whether fetch succeeded",
      text: "string - extracted content (markdown formatted)",
      source: "string - which source was used",
      title: "string? - paper title (if available)",
      authors: "string? - author list (if available)",
      abstract: "string? - abstract text (if available)",
      doi: "string? - DOI identifier (if applicable)",
      error: "string? - error message (if failed)",
      suggestion: "string? - actionable suggestion for user (if failed)"
    }
  })
}
