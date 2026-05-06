import { NextRequest, NextResponse } from "next/server"
import { processPDFForDOI, formatDOIGatewaySummary } from "@/lib/doi-gateway"
import { getDOISystemConfig } from "@/lib/doi-config-manager"

export const maxDuration = 60
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, metadata, config } = body

    if (!text && !metadata) {
      return NextResponse.json(
        { error: "Either 'text' or 'metadata' is required" },
        { status: 400 }
      )
    }

    console.log("[api/gateway] Processing DOI extraction request")

    const result = await processPDFForDOI(
      text || "",
      metadata,
      config || {}
    )

    // Generate human-readable summary
    const summary = formatDOIGatewaySummary(result)

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        summary,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[api/gateway] Error:", error)
    
    const message = error instanceof Error ? error.message : "Internal server error"
    
    return NextResponse.json(
      { 
        error: message,
        details: "Failed to process DOI extraction and enrichment",
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return current configuration and system status
  const config = getDOISystemConfig()
  
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/gateway",
    method: "POST",
    description: "DOI Extraction and Metadata Enrichment Gateway",
    version: "1.0.0",
    
    currentConfiguration: config,
    
    usage: {
      post: {
        description: "Extract DOIs and enrich metadata from text/metadata",
        parameters: {
          text: "PDF text content (optional if metadata provided)",
          metadata: "PDF metadata object (optional)",
          config: "Custom gateway configuration (optional)",
        },
        example: {
          text: "This paper has DOI: 10.1234/example.2024.001\nAuthors: John Doe, Jane Smith",
          metadata: {
            doi: "10.1234/example.2024.001",
            title: "Example Paper",
          },
        },
      },
    },
    
    features: [
      "Multi-strategy DOI extraction",
      "Confidence scoring (high/medium/low)",
      "Crossref validation",
      "Metadata enrichment from 5 sources:",
      "  - CrossRef (bibliographic data)",
      "  - Semantic Scholar (citations, AI features)",
      "  - OpenAlex (concepts, open access pricing)",
      "  - Unpaywall (OA status, PDF links)",
      "  - PubMed (MeSH terms, funding)",
      "Intelligent caching (1 hour TTL)",
      "Human-readable summary generation",
      "Dynamic configuration management",
    ],
    
    strategies: config.extraction.strategies.map(s => ({
      id: s.id,
      name: s.name,
      enabled: s.enabled,
      priority: s.priority,
    })),
    
    endpoints: {
      gateway: "/api/gateway (POST)",
      parsePdf: "/api/parse-pdf (POST) - Integrated DOI extraction",
      config: "Use GET to view current configuration",
    },
    
    performance: {
      caching: config.gateway.cacheEnabled ? `Enabled (${config.gateway.cacheTTL / 1000}s TTL)` : "Disabled",
      timeout: "15-30 seconds total for all sources",
      fallbackOrder: config.gateway.enrichment.fallbackOrder.join(" → "),
    },
  })
}
