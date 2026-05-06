import { NextRequest, NextResponse } from 'next/server'
import { EnhancedLLMSearchEngine } from '@/lib/enhanced-llm-search-engine'

const searchEngine = new EnhancedLLMSearchEngine()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, options } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Query is required and must be a string',
          code: 'MISSING_QUERY'
        },
        { status: 400 }
      )
    }

    console.log(`\n🚀 [Enhanced Search API] Received query: "${query}"`)
    console.log(`   Options:`, options || 'default')

    // Execute enhanced search with verification
    const result = await searchEngine.searchAndVerify(query, {
      maxPapers: options?.maxPapers || 10,
      sources: options?.sources || ['pubmed', 'semantic_scholar'],
      domain: options?.domain,
      verifyResults: true,  // Always verify in this endpoint
      analyzeDepth: options?.analyzeDepth || 'standard'
    })

    console.log(`✅ [Enhanced Search API] Completed in ${result.executionTime}ms`)
    console.log(`   Results: ${result.totalResults} papers | Verification: ${result.verificationStatus.overall}`)

    // Return comprehensive response with verification data
    return NextResponse.json({
      success: true,
      ...result,
      metadata: {
        apiVersion: '2.0-enhanced',
        featuresEnabled: [
          'query-optimization',
          'multi-source-fusion',
          'smart-deduplication',
          'enhanced-scoring',
          'data-verification',
          'real-time-validation'
        ],
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ [Enhanced Search API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// GET endpoint for real-time DOI verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const doi = searchParams.get('doi')

  if (!doi) {
    return NextResponse.json(
      {
        success: false,
        error: 'DOI parameter is required',
        code: 'MISSING_DOI'
      },
      { status: 400 }
    )
  }

  console.log(`🔍 [Verification API] Verifying DOI: ${doi}`)

  try {
    const searchEngine = new EnhancedLLMSearchEngine()
    const proof = await searchEngine.getRealtimeDataProof(doi)

    console.log(`✅ [Verification API] DOI ${proof.existsInDatabase ? 'EXISTS' : 'NOT FOUND'}`)

    return NextResponse.json({
      success: true,
      verification: proof,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ [Verification API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
        code: 'VERIFICATION_ERROR'
      },
      { status: 500 }
    )
  }
}
