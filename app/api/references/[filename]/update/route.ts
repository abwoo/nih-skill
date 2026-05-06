import { NextRequest, NextResponse } from 'next/server'
import { DynamicMatchingEngine } from '@/lib/dynamic-matching-engine'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  if (!filename || !filename.endsWith('.md')) {
    return NextResponse.json(
      { success: false, error: 'Invalid filename. Must be a .md file' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const engine = new DynamicMatchingEngine()

    console.log(`Triggering update for ${filename} with options:`, body)

    const result = await engine.updateReference(filename, {
      sources: body.sources || ['pubmed', 'semantic_scholar', 'openalex'],
      limit: body.limit || 20,
      customKeywords: body.keywords,
      minCitationCount: body.minCitationCount,
      yearRange: body.yearRange,
      dryRun: body.dryRun || false
    })

    console.log(`Update completed for ${filename}:`, result)

    return NextResponse.json({
      success: result.success,
      ...result,
      timestamp: new Date().toISOString()
    }, {
      status: result.success ? 200 : 500
    })
  } catch (error) {
    console.error(`Error updating ${filename}:`, error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      file: filename,
      addedPapers: 0,
      updatedPapers: 0,
      skippedPapers: 0,
      duration: '0s',
      sourcesUsed: [],
      papers: [],
      timestamp: new Date().toISOString()
    }, {
      status: 500
    })
  }
}
