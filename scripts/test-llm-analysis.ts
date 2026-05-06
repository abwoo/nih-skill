import { searchAndAnalyze, PaperAnalyzer } from '../lib/llm-analysis-engine'

async function testLLMAnalysisEngine() {
  console.log('=== Testing LLM Analysis Engine ===\n')

  const testCases = [
    {
      name: 'Test 1: Single Paper Analysis (Quick Mode)',
      type: 'single',
      query: '10.1038/s41591-018-0268-3',  // Hannun et al. ECG paper
      depth: 'quick' as const
    },
    {
      name: 'Test 2: Search and Analyze Multiple Papers (Standard Mode)',
      type: 'search',
      query: 'deep learning ECG arrhythmia detection 2024 2025',
      maxPapers: 5,
      depth: 'standard' as const
    }
  ]

  for (const testCase of testCases) {
    console.log('\n' + '='.repeat(60))
    console.log(`${testCase.name}`)
    console.log('='.repeat(60))

    try {
      if (testCase.type === 'single') {
        const analyzer = new PaperAnalyzer()

        const { searchPapersDirect } = await import('../lib/search-service')
        const result = await searchPapersDirect(testCase.query, 'semantic_scholar', 1)

        if (result.results.length > 0) {
          const paper = result.results[0]
          console.log(`\nAnalyzing paper: ${paper.title}`)
          console.log(`Authors: ${paper.authors}`)
          console.log(`Year: ${paper.year}`)

          const startTime = Date.now()
          const analysis = await analyzer.analyze(paper, testCase.depth)
          const duration = ((Date.now() - startTime) / 1000).toFixed(1)

          console.log(`\n✅ Analysis completed in ${duration}s`)
          console.log('\n📊 Analysis Summary:')
          console.log(`   Quality Score: ${analysis.overallScore.quality}/10`)
          console.log(`   Importance Score: ${analysis.overallScore.importance}/10`)
          console.log(`   Actionability Score: ${analysis.overallScore.actionability}/10`)
          console.log(`   Weighted Average: ${analysis.overallScore.weightedAverage.toFixed(1)}/10`)
          console.log(`   Risk Rating: ${analysis.limitations.overallRiskRating}`)
          console.log(`   Novelty Level: ${analysis.innovation.noveltyLevel}`)

          console.log('\n💡 AI Insights:')
          console.log(`   Key Takeaway: ${analysis.aiInsights.keyTakeaway}`)
          console.log(`   Why It Matters: ${analysis.aiInsights.whyItMatters}`)
          console.log(`   What's Missing: ${analysis.aiInsights.whatIsMissing}`)

          console.log('\n🔬 Methodology:')
          console.log(`   Study Design: ${analysis.methodology.studyDesign}`)
          console.log(`   Sample Size: n=${analysis.methodology.sampleSize.n}`)
          console.log(`   Bias Risk: ${analysis.methodology.biasRisk}`)
          console.log(`   Reproducibility Score: ${analysis.methodology.reproducibilityScore}/10`)

          if (testCase.depth === 'deep' || testCase.depth === 'standard') {
            console.log('\n⚠️ Limitations:')
            analysis.limitations.methodologicalLimitations.forEach((lim, i) => {
              console.log(`   ${i + 1}. ${lim}`)
            })

            console.log('\n🎯 Next Steps:')
            analysis.aiInsights.nextSteps.forEach((step, i) => {
              console.log(`   ${i + 1}. ${step}`)
            })
          }
        } else {
          console.log('❌ No paper found for the given DOI/PMID')
        }
      } else if (testCase.type === 'search') {
        console.log(`\nSearching for: "${testCase.query}"`)

        const result = await searchAndAnalyze(testCase.query, {
          maxPapers: testCase.maxPapers,
          analyzeDepth: testCase.depth,
          sources: ['pubmed', 'semantic_scholar']
        })

        console.log(`\n✅ Search & Analyze completed in ${result.executionTime}`)
        console.log(`   Papers Found: ${result.searchResults.length}`)
        console.log(`   Papers Analyzed: ${result.analyses.length}`)
        console.log(`   Sources Used: ${result.sourcesUsed.join(', ')}`)

        if (result.synthesis) {
          console.log('\n📋 Synthesis Report Generated:')
          console.log(`   Overall Assessment: ${result.synthesis.executiveSummary.overallAssessment}`)
          console.log(`   Key Findings:`)
          result.synthesis.executiveSummary.mainFindings.forEach((finding, i) => {
            console.log(`     ${i + 1}. ${finding}`)
          })
          console.log(`   Research Gaps:`)
          result.synthesis.executiveSummary.researchGaps.forEach((gap, i) => {
            console.log(`     ${i + 1}. ${gap}`)
          })
        }

        console.log('\n📄 Top 3 Analyzed Papers:')
        result.analyses.slice(0, 3).forEach((analysis, i) => {
          console.log(`\n   Paper ${i + 1}: ${analysis.metadata.title.substring(0, 80)}...`)
          console.log(`   Score: ${analysis.overallScore.weightedAverage.toFixed(1)}/10 | Risk: ${analysis.limitations.overallRiskRating} | Novelty: ${analysis.innovation.noveltyLevel}`)
          console.log(`   Insight: ${analysis.aiInsights.keyTakeaway}`)
        })
      }
    } catch (error) {
      console.error(`❌ Test failed:`, error)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✨ All tests completed!')
  console.log('='.repeat(60))
}

testLLMAnalysisEngine().catch(console.error)
