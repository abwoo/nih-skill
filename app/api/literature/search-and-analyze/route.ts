import { NextRequest, NextResponse } from 'next/server'
import { searchAndAnalyze, PaperAnalyzer } from '@/lib/llm-analysis-engine'
import type { SearchResult } from '@/lib/search-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, options } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required and must be a string' },
        { status: 400 }
      )
    }

    console.log(`Received search and analyze request for: ${query}`)

    const result = await searchAndAnalyze(query, {
      maxPapers: options?.maxPapers || 10,
      analyzeDepth: options?.analyzeDepth || 'standard',
      sources: options?.sources || ['pubmed', 'semantic_scholar'],
      useCache: options?.useCache || false
    })

    console.log(`Search and analyze completed in ${result.executionTime}`)

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in /api/literature/search-and-analyze:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        executionTime: '0s'
      },
      { status: 500 }
    )
  }
}
