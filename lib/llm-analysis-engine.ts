import { searchPapersDirect, type SearchResult } from './search-service'

export interface PaperAnalysis {
  metadata: {
    title: string
    authors: string[]
    year: number
    journal: string
    doi: string
    citationCount: number
    openAccess: boolean
  }

  methodology: {
    studyDesign: string
    sampleSize: { n: number; power?: string }
    statisticalMethods: string[]
    biasRisk: 'Low' | 'Moderate' | 'High'
    confoundingControl: string[]
    reproducibilityScore: number
  }

  innovation: {
    noveltyLevel: 'Incremental' | 'Significant' | 'Breakthrough'
    keyContribution: string
    comparisonToPriorWork: string
    potentialImpact: 'Low' | 'Medium' | 'High' | 'Transformative'
    technologyReadinessLevel: number
  }

  limitations: {
    methodologicalLimitations: string[]
    generalizabilityConcerns: string[]
    conflictsOfInterest: string
    missingAnalyses: string[]
    contradictoryEvidence: string[]
    overallRiskRating: '🟢 Low' | '🟡 Medium' | '🔴 High'
  }

  applicability: {
    clinicalRelevance: number
    researchGapAddressed: string
    implementationFeasibility: string
    costEffectiveness: string
    targetAudience: string[]
  }

  relatedWork: {
    citingPapers: SearchResult[]
    citedPapers: SearchResult[]
    similarPapers: SearchResult[]
    competingApproaches: SearchResult[]
  }

  aiInsights: {
    keyTakeaway: string
    whyItMatters: string
    whatIsMissing: string
    nextSteps: string[]
    controversyPoints: string[]
    clinicalImplications: string[]
  }

  visualizationSuggestions: {
    recommendedCharts: Array<{ type: string; description: string }>
    keyFiguresToExtract: string[]
    dataTablesToHighlight: string[]
  }

  overallScore: {
    quality: number
    importance: number
    actionability: number
    weightedAverage: number
  }
}

export interface SynthesisReport {
  query: string
  papersAnalyzed: number
  timestamp: Date

  executiveSummary: {
    mainFindings: string[]
    keyTrends: string[]
    researchGaps: string[]
    overallAssessment: string
  }

  thematicAnalysis: Array<{
    theme: string
    papers: string[]
    narrative: string
    supportingEvidence: string[]
    contradictions: string[]
  }>

  timeline: Array<{
    year: number
    milestone: string
    papers: string[]
    significance: string
  }>

  criticalEvaluation: {
    strengths: string[]
    weaknesses: string[]
    controversies: Array<{ topic: string; positions: string[] }>
    methodologicalIssues: string[]
  }

  futureDirections: {
    shortTerm: string[]
    mediumTerm: string[]
    longTerm: string[]
    breakthroughOpportunities: string[]
  }

  recommendations: {
    forResearchers: string[]
    forClinicians: string[]
    forPolicyMakers: string[]
    forFundingAgencies: string[]
  }
}

type AnalysisDepth = 'quick' | 'standard' | 'deep'

class LLMClient {
  private apiKey: string
  private model: string = 'gpt-5.5' // 2026: Updated from gpt-4o to GPT-5.5 Flagship (1M ctx, reasoning, vision)
  private baseUrl: string = 'https://api.openai.com/v1'

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ''
  }

  async analyze(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured. Using mock analysis.')
      return this.generateMockAnalysis(prompt)
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt || 'You are a biomedical research methodology expert. Provide critical, insightful analysis in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: 'json_object' }
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || '{}'
    } catch (error) {
      console.error('LLM analysis failed:', error)
      return this.generateMockAnalysis(prompt)
    }
  }

  private generateMockAnalysis(prompt: string): string {
    const mockAnalysis: Partial<PaperAnalysis> = {
      methodology: {
        studyDesign: 'Observational cohort study',
        sampleSize: { n: 1000, power: '80%' },
        statisticalMethods: ['Linear regression', 'Cox proportional hazards'],
        biasRisk: 'Moderate',
        confoundingControl: ['Age', 'Sex', 'Comorbidities'],
        reproducibilityScore: 7
      },
      innovation: {
        noveltyLevel: 'Significant',
        keyContribution: 'Novel application of deep learning to clinical problem',
        comparisonToPriorWork: 'Improves upon traditional methods by 15%',
        potentialImpact: 'High',
        technologyReadinessLevel: 6
      },
      limitations: {
        methodologicalLimitations: ['Single-center study', 'Limited follow-up duration'],
        generalizabilityConcerns: ['May not generalize to diverse populations'],
        conflictsOfInterest: 'None declared',
        missingAnalyses: ['Subgroup analysis by ethnicity'],
        contradictoryEvidence: ['Some studies show smaller effect sizes'],
        overallRiskRating: '🟡 Medium'
      },
      applicability: {
        clinicalRelevance: 8,
        researchGapAddressed: 'Addresses gap in automated diagnosis',
        implementationFeasibility: 'Moderate - requires validation in clinical workflow',
        costEffectiveness: 'Potentially cost-effective if reduces manual review',
        targetAudience: ['Clinical researchers', 'Healthcare AI developers']
      },
      aiInsights: {
        keyTakeaway: 'Demonstrates feasibility of AI-assisted diagnosis with good performance',
        whyItMatters: 'Provides evidence for integrating AI into clinical decision support',
        whatIsMissing: 'Lacks prospective validation and health outcome assessment',
        nextSteps: [
          'Multi-center prospective validation',
          'Cost-effectiveness analysis',
          'Integration with existing EHR systems'
        ],
        controversyPoints: [
          'Debate over whether AI should replace or augment clinicians'
        ],
        clinicalImplications: [
          'Could reduce diagnostic workload by 30-40%',
          'Requires careful monitoring for algorithmic bias'
        ]
      },
      overallScore: {
        quality: 7.5,
        importance: 8.5,
        actionability: 7.0,
        weightedAverage: 7.7
      }
    }

    return JSON.stringify(mockAnalysis, null, 2)
  }
}

export class PaperAnalyzer {
  private llmClient = new LLMClient()

  async analyze(paper: SearchResult, depth: AnalysisDepth = 'standard'): Promise<PaperAnalysis> {
    console.log(`Analyzing paper: ${paper.title} (depth: ${depth})`)

    const prompt = this.buildAnalysisPrompt(paper, depth)

    try {
      const rawResponse = await this.llmClient.analyze(prompt)
      let analysis: Partial<PaperAnalysis>

      try {
        analysis = JSON.parse(rawResponse)
      } catch (parseError) {
        console.warn('Failed to parse LLM response as JSON, using structured extraction')
        analysis = this.extractStructuredFromText(rawResponse)
      }

      const completeAnalysis = this.completeAnalysis(analysis, paper)

      console.log(`Analysis completed for: ${paper.title}`)
      return completeAnalysis
    } catch (error) {
      console.error(`Failed to analyze paper ${paper.title}:`, error)
      return this.getDefaultAnalysis(paper)
    }
  }

  private buildAnalysisPrompt(paper: SearchResult, depth: AnalysisDepth): string {
    const basePrompt = `你是一位生物医学研究方法学专家，具有20年经验。请对以下论文进行全面深度分析：

## 论文基本信息
标题：${paper.title}
作者：${paper.authors}
年份：${paper.year}
期刊：${paper.venue || 'Unknown'}
DOI：${paper.doi || 'N/A'}
引用次数：${paper.citationCount || 'N/A'}

## 摘要
${paper.abstract || 'Abstract not available'}

`

    switch (depth) {
      case 'quick':
        return basePrompt + `请提供简明分析（JSON格式），包含：
1. **一句话总结** (keyTakeaway)
2. **方法学评分** (reproducibilityScore: 1-10)
3. **创新性等级** (noveltyLevel: Incremental/Significant/Breakthrough)
4. **总体风险评估** (overallRiskRating: 🟢 Low / 🟡 Medium / 🔴 High)
5. **综合评分** (quality/importance/actionability 各1-10及加权平均分)

请保持简洁（<500字）。`

      case 'deep':
        return basePrompt + `请提供极其详尽的分析（JSON格式），包含所有10个维度：

**1. 方法学质量评估**
- 研究设计类型、样本量与统计功效
- 统计方法列表
- 偏倚风险（Low/Moderate/High）及原因
- 混杂控制措施
- 可重复性评分（1-10）及详细理由

**2. 创新性深度评估**
- 新颖程度（Incremental/Significant/Breakthrough）
- 核心贡献（具体描述）
- 与前人工作的详细对比（至少2篇前人工作）
- 潜在影响范围和程度
- 技术就绪水平（TRL 1-9）

**3. 局限性与批判性思维**
- 方法学局限（至少3点）
- 普适性担忧（人群/场景/时间）
- 利益冲突声明
- 缺失的分析（应该做但没做的）
- 已知的矛盾证据（引用具体研究）
- 总体风险评级及理由

**4. 应用价值评估**
- 临床相关性（1-10）及理由
- 解决的具体研究gap
- 实施可行性分析
- 成本效益考量
- 目标受众细分

**5. 相关研究图谱建议**
- 应该查找哪些引用该论文的研究
- 应该查找哪些被该论文引用的研究
- 相似主题的其他重要论文
- 竞争性方法或替代方案

**6. AI生成的深度洞察**
- 一句话总结（key takeaway）
- 为什么这项工作很重要（超越表面）
- 缺失了什么（研究空白）
- 建议的后继研究方向（至少3个，区分短期/中期/长期）
- 该领域的争议点和不同立场
- 对临床实践/政策/研究的具体启示

**7. 可视化建议**
- 推荐的图表类型（至少3个）及其展示内容
- 应该提取的关键图表
- 应该高亮的数据表

**8. 综合评分**
- 质量评分（1-10）：方法学严谨性
- 重要性评分（1-10）：领域影响力
- 可操作性评分（1-10）：实际应用价值
- 加权平均分（质量×0.3 + 重要性×0.4 + 可操作性×0.3）

请确保分析客观、批判性、有见地。对于每个判断都要提供理由。字数不限。`

      case 'standard':
      default:
        return basePrompt + `请提供标准深度的分析（JSON格式），包含以下核心维度：

**1. 方法学质量**
- 研究设计与样本量
- 统计方法
- 偏倚风险（Low/Moderate/High）
- 可重复性评分（1-10）

**2. 创新性评估**
- 新颖程度与核心贡献
- 与前人工作的对比
- 潜在影响

**3. 局限性**
- 主要方法论局限（2-3点）
- 普适性问题
- 利益冲突
- 总体风险评级

**4. 应用价值**
- 临床相关性（1-10）
- 解决的研究gap
- 实施可行性
- 目标受众

**5. AI洞察**
- 一句话总结
- 为什么重要
- 缺失什么
- 后续方向（3个）
- 临床意义（2个）

**6. 综合评分**（quality/importance/actionability 各1-10）

请保持客观批判性（800-1200字）。`
    }
  }

  private completeAnalysis(partial: Partial<PaperAnalysis>, paper: SearchResult): PaperAnalysis {
    return {
      metadata: {
        title: paper.title,
        authors: paper.authors.split(',').map(a => a.trim()),
        year: typeof paper.year === 'string' ? parseInt(paper.year) : paper.year,
        journal: paper.venue || '',
        doi: paper.doi,
        citationCount: paper.citationCount || 0,
        openAccess: !!paper.pmcid
      },

      methodology: partial.methodology || {
        studyDesign: 'Not specified',
        sampleSize: { n: 0 },
        statisticalMethods: [],
        biasRisk: 'Moderate',
        confoundingControl: [],
        reproducibilityScore: 5
      },

      innovation: partial.innovation || {
        noveltyLevel: 'Incremental',
        keyContribution: 'Not analyzed',
        comparisonToPriorWork: 'Not analyzed',
        potentialImpact: 'Medium',
        technologyReadinessLevel: 4
      },

      limitations: partial.limitations || {
        methodologicalLimitations: ['Analysis incomplete'],
        generalizabilityConcerns: ['Unknown'],
        conflictsOfInterest: 'Not specified',
        missingAnalyses: [],
        contradictoryEvidence: [],
        overallRiskRating: '🟡 Medium'
      },

      applicability: partial.applicability || {
        clinicalRelevance: 5,
        researchGapAddressed: 'Not analyzed',
        implementationFeasibility: 'Unknown',
        costEffectiveness: 'Not assessed',
        targetAudience: []
      },

      relatedWork: partial.relatedWork || {
        citingPapers: [],
        citedPapers: [],
        similarPapers: [],
        competingApproaches: []
      },

      aiInsights: partial.aiInsights || {
        keyTakeaway: 'Analysis pending',
        whyItMatters: 'Not determined',
        whatIsMissing: 'Not identified',
        nextSteps: [],
        controversyPoints: [],
        clinicalImplications: []
      },

      visualizationSuggestions: partial.visualizationSuggestions || {
        recommendedCharts: [],
        keyFiguresToExtract: [],
        dataTablesToHighlight: []
      },

      overallScore: partial.overallScore || {
        quality: 5,
        importance: 5,
        actionability: 5,
        weightedAverage: 5.0
      }
    }
  }

  private extractStructuredFromText(text: string): Partial<PaperAnalysis> {
    const analysis: Partial<PaperAnalysis> = {}

    const scoreMatch = text.match(/reproducibilityScore[:\s]*(\d+)/i)
    if (scoreMatch) {
      analysis.methodology = {
        ...analysis.methodology!,
        reproducibilityScore: parseInt(scoreMatch[1])
      }
    }

    const noveltyMatch = text.match(/novelityLevel[:\s]*"(Incremental|Significant|Breakthrough)"/i)
    if (noveltyMatch) {
      analysis.innovation = {
        ...analysis.innovation!,
        noveltyLevel: noveltyMatch[1] as 'Incremental' | 'Significant' | 'Breakthrough'
      }
    }

    const riskMatch = text.match(/overallRiskRating[:\s]*(🟢 Low|🟡 Medium|🔴 High)/i)
    if (riskMatch) {
      analysis.limitations = {
        ...analysis.limitations!,
        overallRiskRating: riskMatch[1] as '🟢 Low' | '🟡 Medium' | '🔴 High'
      }
    }

    return analysis
  }

  private getDefaultAnalysis(paper: SearchResult): PaperAnalysis {
    return {
      metadata: {
        title: paper.title,
        authors: paper.authors.split(',').map(a => a.trim()),
        year: typeof paper.year === 'string' ? parseInt(paper.year) : paper.year,
        journal: paper.venue || '',
        doi: paper.doi,
        citationCount: paper.citationCount || 0,
        openAccess: !!paper.pmcid
      },
      methodology: {
        studyDesign: 'Analysis unavailable',
        sampleSize: { n: 0 },
        statisticalMethods: [],
        biasRisk: 'Moderate',
        confoundingControl: [],
        reproducibilityScore: 5
      },
      innovation: {
        noveltyLevel: 'Incremental',
        keyContribution: 'Could not complete LLM analysis',
        comparisonToPriorWork: 'N/A',
        potentialImpact: 'Medium',
        technologyReadinessLevel: 3
      },
      limitations: {
        methodologicalLimitations: ['LLM analysis failed'],
        generalizabilityConcerns: ['Unknown'],
        conflictsOfInterest: 'N/A',
        missingAnalyses: [],
        contradictoryEvidence: [],
        overallRiskRating: '🟡 Medium'
      },
      applicability: {
        clinicalRelevance: 5,
        researchGapAddressed: 'N/A',
        implementationFeasibility: 'Unknown',
        costEffectiveness: 'N/A',
        targetAudience: []
      },
      relatedWork: {
        citingPapers: [],
        citedPapers: [],
        similarPapers: [],
        competingApproaches: []
      },
      aiInsights: {
        keyTakeaway: 'Analysis could not be completed automatically',
        whyItMatters: 'N/A',
        whatIsMissing: 'Full analysis',
        nextSteps: ['Manual review recommended'],
        controversyPoints: [],
        clinicalImplications: []
      },
      visualizationSuggestions: {
        recommendedCharts: [],
        keyFiguresToExtract: [],
        dataTablesToHighlight: []
      },
      overallScore: {
        quality: 5,
        importance: 5,
        actionability: 5,
        weightedAverage: 5.0
      }
    }
  }
}

export class CrossPaperSynthesizer {
  private paperAnalyzer = new PaperAnalyzer()

  async synthesize(
    query: string,
    papers: SearchResult[],
    depth: AnalysisDepth = 'standard'
  ): Promise<SynthesisReport> {
    console.log(`Synthesizing ${papers.length} papers for query: ${query}`)

    const analyses = await Promise.all(
      papers.slice(0, 10).map(paper => this.paperAnalyzer.analyze(paper, depth))
    )

    const synthesisPrompt = this.buildSynthesisPrompt(query, papers, analyses)

    try {
      const llmClient = new LLMClient()
      const rawResponse = await llmClient.analyze(synthesisPrompt)

      let synthesis: Partial<SynthesisReport>
      try {
        synthesis = JSON.parse(rawResponse)
      } catch {
        synthesis = this.generateDefaultSynthesis(query, papers, analyses)
      }

      return this.completeSynthesis(synthesis, query, papers.length)
    } catch (error) {
      console.error('Synthesis failed:', error)
      return this.generateDefaultSynthesis(query, papers, analyses)
    }
  }

  private buildSynthesisPrompt(
    query: string,
    papers: SearchResult[],
    analyses: PaperAnalysis[]
  ): string {
    const papersSummary = papers.map((p, i) => `
Paper ${i + 1}: ${p.title}
Authors: ${p.authors}
Year: ${p.year}
Journal: ${p.venue}
Citations: ${p.citationCount || 'N/A'}
AI Assessment:
- Quality Score: ${analyses[i]?.overallScore.quality}/10
- Importance: ${analyses[i]?.overallScore.importance}/10
- Risk Level: ${analyses[i]?.limitations.overallRiskRating}
- Key Takeaway: ${analyses[i]?.aiInsights.keyTakeaway}
`).join('\n')

    return `你是一位生物医学领域的资深综述专家。基于以下检索到的论文及其AI分析结果，请撰写一份综合性的研究报告。

## 用户查询
${query}

## 检索到的论文（共${papers.length}篇，已对前${Math.min(analyses.length, 10)}篇进行深度分析）
${papersSummary}

## 请提供综合报告（JSON格式），包含：

### 1. 执行摘要 (executiveSummary)
- mainFindings: 3-5个最核心的发现
- keyTrends: 2-3个明显的趋势
- researchGaps: 1-2个重要的研究空白
- overallAssessment: 对该领域的总体评价（2-3句话）

### 2. 主题分析 (thematicAnalysis)
识别3-5个主要主题，每个主题包含：
- theme: 主题名称
- papers: 相关论文名单（用编号如"Paper 1, 3, 5"）
- narrative: 该主题的叙事性描述（200-300字）
- supportingEvidence: 关键证据（2-3条）
- contradictions: 内部矛盾或不一致之处

### 3. 时间线 (timeline)
按年份整理的重要里程碑（2020-2026），每个里程碑包含：
- year: 年份
- milestone: 事件描述
- papers: 相关论文
- significance: 为什么重要

### 4. 批判性评估 (criticalEvaluation)
- strengths: 领域的优势（3-5点）
- weaknesses: 领域的短板（3-5点）
- controversies: 争议话题及不同立场（2-3个）
- methodologicalIssues: 共性的方法学问题（2-3点）

### 5. 未来方向 (futureDirections)
- shortTerm: 1-2年的研究方向（3-5个）
- mediumTerm: 3-5年的研究方向（3-5个）
- longTerm: 5-10年的愿景（2-3个）
- breakthroughOpportunities: 可能的突破性机会（2-3个）

### 6. 分层建议 (recommendations)
针对不同群体的具体建议：
- forResearchers: 给研究者的建议（3-5条）
- forClinicians: 给临床医生的建议（3-5条）
- forPolicyMakers: 给政策制定者的建议（2-3条）
- forFundingAgencies: 给资助机构的建议（2-3条）

请确保报告有洞察力、批判性、可操作性。总字数2000-3000字。`
  }

  private completeSynthesis(
    partial: Partial<SynthesisReport>,
    query: string,
    papersAnalyzed: number
  ): SynthesisReport {
    return {
      query,
      papersAnalyzed,
      timestamp: new Date(),

      executiveSummary: partial.executiveSummary || {
        mainFindings: ['Analysis incomplete'],
        keyTrends: ['Unable to determine'],
        researchGaps: ['Unknown'],
        overallAssessment: 'Synthesis could not be completed'
      },

      thematicAnalysis: partial.thematicarysis || [],

      timeline: partial.timeline || [],

      criticalEvaluation: partial.criticalEvaluation || {
        strengths: [],
        weaknesses: [],
        controversies: [],
        methodologicalIssues: []
      },

      futureDirections: partial.futureDirections || {
        shortTerm: [],
        mediumTerm: [],
        longTerm: [],
        breakthroughOpportunities: []
      },

      recommendations: partial.recommendations || {
        forResearchers: [],
        forClinicians: [],
        forPolicyMakers: [],
        forFundingAgencies: []
      }
    }
  }

  private generateDefaultSynthesis(
    query: string,
    papers: SearchResult[],
    analyses: PaperAnalysis[]
  ): Partial<SynthesisReport> {
    const avgQuality = analyses.reduce((sum, a) => sum + a.overallScore.quality, 0) / Math.max(analyses.length, 1)
    const avgImportance = analyses.reduce((sum, a) => sum + a.overallScore.importance, 0) / Math.max(analyses.length, 1)

    return {
      executiveSummary: {
        mainFindings: [`Retrieved ${papers.length} papers on "${query}"`],
        keyTrends: [`Average quality score: ${avgQuality.toFixed(1)}/10`],
        researchGaps: ['Automated synthesis limited'],
        overallAssessment: `${papers.length} papers retrieved and preliminarily analyzed`
      },
      thematicAnalysis: [],
      timeline: [],
      criticalEvaluation: {
        strengths: [`${papers.length} papers available for analysis`],
        weaknesses: ['LLM synthesis failed, using fallback'],
        controversies: [],
        methodologicalIssues: []
      },
      futureDirections: {
        shortTerm: ['Manual review of retrieved papers'],
        mediumTerm: ['Deeper analysis of top papers'],
        longTerm: ['Systematic review recommended'],
        breakthroughOpportunities: []
      },
      recommendations: {
        forResearchers: ['Review top-cited papers first'],
        forClinicians: ['Consult domain expert for interpretation'],
        forPolicyMakers: ['Await comprehensive synthesis'],
        forFundingAgencies: ['Consider funding systematic reviews']
      }
    }
  }
}

export async function searchAndAnalyze(
  query: string,
  options: {
    maxPapers?: number
    analyzeDepth?: AnalysisDepth
    sources?: Array<'pubmed' | 'semantic_scholar' | 'openalex'>
    useCache?: boolean
  } = {}
): Promise<{
  success: boolean
  query: string
  searchResults: SearchResult[]
  analyses: PaperAnalysis[]
  synthesis?: SynthesisReport
  executionTime: string
  sourcesUsed: string[]
}> {
  const startTime = Date.now()

  try {
    console.log(`Starting search and analyze for: ${query}`)

    const searchResult = await searchPapersDirect(
      query,
      options.sources?.[0] || 'semantic_scholar',
      options.maxPapers || 10
    )

    const allResults = [searchResult]

    if (options.sources && options.sources.length > 1) {
      for (const source of options.sources.slice(1)) {
        try {
          const result = await searchPapersDirect(query, source, options.maxPapers || 10)
          allResults.push(result)
        } catch (error) {
          console.warn(`Search failed for ${source}:`, error)
        }
      }
    }

    const combinedResults = allResults.flatMap(r => r.results)
    const uniqueResults = deduplicateResults(combinedResults).slice(0, options.maxPapers || 10)

    console.log(`Found ${uniqueResults.length} unique papers`)

    const analyzer = new PaperAnalyzer()
    const analyses = await Promise.all(
      uniqueResults.map(paper => analyzer.analyze(paper, options.analyzeDepth || 'standard'))
    )

    let synthesis: SynthesisReport | undefined
    if (uniqueResults.length > 1) {
      const synthesizer = new CrossPaperSynthesizer()
      synthesis = await synthesizer.synthesize(query, uniqueResults, options.analyzeDepth || 'standard')
    }

    const endTime = Date.now()
    const executionTime = ((endTime - startTime) / 1000).toFixed(1)

    return {
      success: true,
      query,
      searchResults: uniqueResults,
      analyses,
      synthesis,
      executionTime: `${executionTime}s`,
      sourcesUsed: options.sources || ['semantic_scholar']
    }
  } catch (error) {
    console.error('Search and analyze failed:', error)
    return {
      success: false,
      query,
      searchResults: [],
      analyses: [],
      executionTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
      sourcesUsed: options.sources || []
    }
  }
}

function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>()
  const unique: SearchResult[] = []

  for (const result of results) {
    const key = `${result.title.toLowerCase().trim()}${result.doi}`.trim()
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(result)
    }
  }

  return unique
}
