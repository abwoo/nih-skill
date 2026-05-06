import { NextRequest, NextResponse } from 'next/server'
import { PaperAnalyzer } from '@/lib/llm-analysis-engine'
import { searchPapersDirect } from '@/lib/search-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { doi, pmid, analysisType, context } = body

    if (!doi && !pmid) {
      return NextResponse.json(
        { success: false, error: 'DOI or PMID is required' },
        { status: 400 }
      )
    }

    console.log(`Received analyze paper request for: ${doi || pmid}`)

    let paper: SearchResult | null = null

    if (doi) {
      const result = await searchPapersDirect(doi, 'semantic_scholar', 1)
      paper = result.results[0] || null
    }

    if (!paper && pmid) {
      const result = await searchPapersDirect(pmid, 'pubmed', 1)
      paper = result.results[0] || null
    }

    if (!paper) {
      return NextResponse.json(
        { success: false, error: `Paper not found for ${doi || pmid}` },
        { status: 404 }
      )
    }

    const analyzer = new PaperAnalyzer()
    const depth = analysisType === 'full' ? 'deep' :
                   analysisType === 'methodology-only' ? 'standard' :
                   analysisType === 'innovation-only' ? 'quick' :
                   analysisType === 'critical-only' ? 'standard' : 'standard'

    const startTime = Date.now()
    const analysis = await analyzer.analyze(paper, depth)
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log(`Paper analysis completed in ${executionTime}s`)

    return NextResponse.json({
      success: true,
      paper,
      analysis,
      executionTime: `${executionTime}s`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in /api/literature/analyze-paper:', error)
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
