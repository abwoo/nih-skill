import { DynamicMatchingEngine } from '../lib/dynamic-matching-engine'

async function runBatch1Update() {
  console.log('=== Starting Batch 1 Reference Update ===')
  console.log('Files: ecg-methodology.md, eeg-bci-methodology.md, medical-imaging-methodology.md\n')

  const engine = new DynamicMatchingEngine()
  const batch1Files = [
    'ecg-methodology.md',
    'eeg-bci-methodology.md',
    'medical-imaging-methodology.md'
  ]

  const results = []

  for (const file of batch1Files) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Processing: ${file}`)
    console.log('='.repeat(60))

    try {
      const result = await engine.updateReference(file, {
        sources: ['pubmed', 'semantic_scholar'],
        limit: 15,
        minCitationCount: 5,
        dryRun: false
      })

      console.log('\n✅ Update Result:')
      console.log(`   - Success: ${result.success}`)
      console.log(`   - Papers Added: ${result.addedPapers}`)
      console.log(`   - Skipped (already exist): ${result.skippedPapers}`)
      console.log(`   - Duration: ${result.duration}`)
      console.log(`   - Sources Used: ${result.sourcesUsed.join(', ')}`)

      if (result.papers.length > 0) {
        console.log('\n📄 Sample Added Papers:')
        result.papers.slice(0, 3).forEach((paper, idx) => {
          console.log(`   ${idx + 1}. ${paper.citation.authors.split(',')[0]} et al. (${paper.citation.year})`)
          console.log(`      ${paper.citation.title.substring(0, 80)}...`)
        })
      }

      if (result.error) {
        console.log(`\n❌ Error: ${result.error}`)
      }

      results.push({ file, ...result })
    } catch (error) {
      console.error(`\n❌ Failed to process ${file}:`, error)
      results.push({
        file,
        success: false,
        addedPapers: 0,
        updatedPapers: 0,
        skippedPapers: 0,
        duration: '0s',
        sourcesUsed: [],
        papers: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('BATCH 1 SUMMARY')
  console.log('='.repeat(60))

  const totalAdded = results.reduce((sum, r) => sum + (r.addedPapers || 0), 0)
  const successful = results.filter(r => r.success).length

  console.log(`Total Files Processed: ${results.length}/${batch1Files.length}`)
  console.log(`Successful Updates: ${successful}`)
  console.log(`Total Papers Added: ${totalAdded}`)
  console.log(`Average Duration: ${(results.reduce((sum, r) => {
    const duration = parseFloat(r.duration)
    return sum + (isNaN(duration) ? 0 : duration)
  }, 0) / results.length).toFixed(1)}s`)

  console.log('\n✨ Batch 1 update completed!')
}

runBatch1Update().catch(console.error)
