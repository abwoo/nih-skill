import { EnhancedLLMSearchEngine } from '../lib/enhanced-llm-search-engine'

async function testEnhancedSearchEngine() {
  console.log('=== Testing Enhanced LLM Search Engine ===\n')

  const engine = new EnhancedLLMSearchEngine()

  const testCases = [
    {
      name: 'Test 1: ECG Deep Learning (with domain context)',
      query: 'deep learning ECG arrhythmia detection 2024',
      options: { domain: 'ecg', maxPapers: 5 }
    },
    {
      name: 'Test 2: Medical Imaging Transformer',
      query: 'transformer medical image segmentation 2023-2026',
      options: { domain: 'medical imaging', maxPapers: 5 }
    },
    {
      name: 'Test 3: LLM Clinical NLP',
      query: 'large language model clinical NLP named entity recognition',
      options: { domain: 'nlp', maxPapers: 5 }
    }
  ]

  for (const testCase of testCases) {
    console.log('\n' + '='.repeat(70))
    console.log(`${testCase.name}`)
    console.log('='.repeat(70))

    try {
      const result = await engine.searchAndVerify(testCase.query, testCase.options)

      console.log(`\n✅ Search Completed Successfully!`)
      console.log(`   Query: ${result.query}`)
      console.log(`   Optimized Query: ${result.optimizedQuery}`)
      console.log(`   Total Results: ${result.totalResults} papers`)
      console.log(`   Sources Used: ${result.sourcesUsed.join(', ')}`)
      console.log(`   Execution Time: ${result.executionTime}ms`)
      console.log(`   Verification Status: ${result.verificationStatus.overall}`)

      if (result.papers.length > 0) {
        console.log('\n📄 Top 3 Papers (with Enhanced Scores):')
        result.papers.slice(0, 3).forEach((paper, i) => {
          console.log(`\n   ${i + 1}. [${paper.enhancedScore.toFixed(2)}] ${paper.title.substring(0, 80)}...`)
          console.log(`      Authors: ${paper.authors.split(',')[0]} et al.`)
          console.log(`      Year: ${paper.year} | Citations: ${paper.citationCount} | Source: ${paper.source}`)
          console.log(`      Verified: ${paper.verified ? '✅' : '❌'}`)
          console.log(`      Relevance: ${(paper.relevanceScore * 100).toFixed(0)}% | Freshness: ${(paper.freshnessScore * 100).toFixed(0)}% | Impact: ${(paper.impactScore * 100).toFixed(0)}%`)
          
          if (paper.matchedKeywords && paper.matchedKeywords.length > 0) {
            console.log(`      Matched Keywords: ${paper.matchedKeywords.join(', ')}`)
          }
          
          if (paper.domainRelevance && paper.domainRelevance.length > 0) {
            console.log(`      Domain Relevance: ${paper.domainRelevance.join(', ')}`)
          }

          if (paper.verificationDetails) {
            const checks = Object.entries(paper.verificationDetails)
              .filter(([_, v]) => v)
              .map(([k]) => k)
            console.log(`      Verification Checks Passed: ${checks.join(', ')}`)
          }
        })
      }

      // Test real-time DOI verification for first paper
      if (result.papers.length > 0 && result.papers[0].doi) {
        console.log('\n🔍 Real-time DOI Verification Test:')
        const proof = await engine.getRealtimeDataProof(result.papers[0].doi)
        
        console.log(`   DOI: ${result.papers[0].doi}`)
        console.log(`   Exists in Database: ${proof.existsInDatabase ? '✅ YES' : '❌ NO'}`)
        console.log(`   Data Source: ${proof.dataSource}`)
        console.log(`   Retrieval Timestamp: ${proof.retrievalTimestamp.toISOString()}`)
        
        if (proof.rawMetadata.title) {
          console.log(`   Retrieved Title: ${proof.rawMetadata.title.substring(0, 60)}...`)
        }
      }

    } catch (error) {
      console.error(`\n❌ Test failed:`, error)
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('✨ All enhanced search tests completed!')
  console.log('='.repeat(70))
}

testEnhancedSearchEngine().catch(console.error)
