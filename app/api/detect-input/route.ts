import { NextRequest, NextResponse } from "next/server"
import { detectInputType } from "@/lib/input-detector"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { input } = body

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Input is required and must be a string" },
        { status: 400 }
      )
    }

    const result = detectInputType(input)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[detect-input] Error:", error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Detection failed",
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/detect-input",
    method: "POST",
    contentType: "application/json",
    description: "Detect the type of user input (DOI, URL, PMID, arXiv, text)",
    parameters: {
      input: "The user's input string to analyze",
    },
    supportedTypes: [
      "doi - Digital Object Identifier (e.g., 10.1038/s41586-021-03819-2)",
      "pmid - PubMed ID (8-digit number)",
      "arxiv - arXiv ID (e.g., 2101.00001)",
      "url - HTTP(S) URL",
      "text - Plain text query",
    ],
    examples: [
      { input: "10.1038/s41586-021-03819-2", type: "doi" },
      { input: "12345678", type: "pmid" },
      { input: "2101.00001", type: "arxiv" },
      { input: "https://arxiv.org/abs/2101.00001", type: "arxiv" },
      { input: "https://example.com/paper.pdf", type: "url" },
      { input: "machine learning for ECG analysis", type: "text" },
    ],
  })
}
