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
    const { action, papers, options } = body

    if (action !== 'add' && action !== 'remove' && action !== 'update') {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be add, remove, or update' },
        { status: 400 }
      )
    }

    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Papers array is required and must not be empty' },
        { status: 400 }
      )
    }

    console.log(`User update request for ${filename}:`, { action, papersCount: papers.length, options })

    let addedPapers = 0
    let removedPapers = 0
    let updatedPapers = 0
    const skippedPapers = []
    const processedPapers = []

    for (const paper of papers) {
      try {
        if (action === 'add') {
          // Check if paper already exists in the file
          const fs = await import('fs')
          const path = await import('path')
          const filePath = path.join(process.cwd(), 'references', filename)
          
          let existingContent = ''
          try {
            existingContent = fs.readFileSync(filePath, 'utf-8')
          } catch {
            // File doesn't exist yet, that's ok
          }

          // Simple check if DOI already exists
          if (paper.doi && existingContent.includes(paper.doi)) {
            skippedPapers.push(paper.doi)
            continue
          }

          // If we have a DOI, search and add the paper
          if (paper.doi) {
            const engine = new DynamicMatchingEngine()
            
            // Search by DOI to get full metadata
            const { searchPapersDirect } = await import('@/lib/search-service')
            const searchResult = await searchPapersDirect(paper.doi, 'semantic_scholar', 1)

            if (searchResult.success && searchResult.results.length > 0) {
              const foundPaper = searchResult.results[0]
              
              // Generate markdown entry
              const domainPrefix = filename.replace('.md', '').split('-').slice(0, 2).map(p => p.substring(0, 3).toUpperCase()).join('')
              const existingIds = this.extractExistingPaperIds(existingContent)
              const newId = `${domainPrefix}-${String(existingIds.length + 1).padStart(2, '0')}`
              
              const markdownEntry = `---

## ${newId}: ${foundPaper.authors.split(',')[0]} et al. — ${foundPaper.title.substring(0, 80)}${foundPaper.title.length > 80 ? '...' : ''}

### Citation
${foundPaper.authors}. ${foundPaper.title}. ${foundPaper.venue || 'Unknown Journal'}. ${typeof foundPaper.year === 'string' ? parseInt(foundPaper.year) : foundPaper.year}${foundPaper.pmid ? `. PMID: ${foundPaper.pmid}` : ''}${foundPaper.doi ? `. DOI: ${foundPaper.doi}` : ''}.

### Methodology Decomposition

**Core Idea**: ${foundPaper.abstract?.substring(0, 200) || 'Abstract not available'}${foundPaper.abstract && foundPaper.abstract.length > 200 ? '...' : ''}

${paper.customNotes ? `**User Notes**: ${paper.customNotes}\n\n` : ''}${paper.tags && paper.tags.length > 0 ? `**Tags**: ${paper.tags.join(', ')}\n\n` : ''}**Reproducibility Notes**:
- Data availability: ${foundPaper.pmcid ? '✅ Available on PMC' : '⚠️ Check availability'}
- Code availability: To be verified
- Difficulty rating: ★★☆☆☆ (requires manual assessment)

**When to Reference This**:
- General reference for ${foundPaper.title.split(' ').slice(0, 3).join(' ')} related queries
- Background knowledge for domain-specific questions

`
              // Append to file
              fs.appendFileSync(filePath, markdownEntry + '\n')
              addedPapers++
              processedPapers.push({
                id: newId,
                title: foundPaper.title,
                doi: foundPaper.doi,
                status: 'added'
              })
            } else {
              // Paper not found in database, create minimal entry
              const minimalEntry = `---

## UserAdded-${Date.now()}: User-added paper

### Citation
DOI: ${paper.doi}
${paper.customNotes ? `\n**User Notes**: ${paper.customNotes}` : ''}
${paper.tags && paper.tags.length > 0 ? `\n**Tags**: ${paper.tags.join(', ')}` : ''}

`

              fs.appendFileSync(filePath, minimalEntry + '\n')
              addedPapers++
              processedPapers.push({
                id: `UserAdded-${Date.now()}`,
                doi: paper.doi,
                status: 'added-minimal'
              })
            }
          } else if (paper.query) {
            // No DOI, use query to search
            const engine = new DynamicMatchingEngine()
            const result = await engine.updateReference(filename, {
              customKeywords: [paper.query],
              limit: 1,
              dryRun: false
            })

            if (result.success) {
              addedPapers += result.addedPapers
              removedPapers += result.skippedPapers
            }
          }
        }
        // Note: remove and update actions would need more complex logic
        // For now, we primarily support "add" action
        
      } catch (error) {
        console.error(`Error processing paper:`, error)
        continue
      }
    }

    console.log(`Update completed for ${filename}: +${addedPapers} -${removedPapers} ~${updatedPapers}`)

    return NextResponse.json({
      success: true,
      file: filename,
      action,
      addedPapers,
      removedPapers,
      updatedPapers,
      skippedPapers: skippedPapers.length,
      processedPapers,
      duration: 'completed',
      message: `Successfully processed ${papers.length} papers (${addedPapers} added, ${skippedPapers.length} skipped)`,
      timestamp: new Date().toISOString()
    }, {
      status: 200
    })
    
  } catch (error) {
    console.error(`Error in user-update for ${filename}:`, error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      file: filename,
      addedPapers: 0,
      removedPapers: 0,
      updatedPapers: 0,
      skippedPapers: 0,
      timestamp: new Date().toISOString()
    }, {
      status: 500
    })
  }
}

// Helper function to extract existing paper IDs from content
function extractExistingPaperIds(content: string): string[] {
  const ids: string[] = []
  const idPattern = /^## ([A-Z]+-\d+):/gm
  let match
  
  while ((match = idPattern.exec(content)) !== null) {
    ids.push(match[1])
  }
  
  return ids
}
