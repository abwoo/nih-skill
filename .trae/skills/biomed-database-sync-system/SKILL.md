---
name: "biomed-database-sync-system"
description: "LLM驱动的生物医学动态知识系统。当用户需要实时分析文献、自主管理知识库、或通过AI深度解析论文时调用。核心能力：用户可控的文献管理 + LLM实时分析推理 + 动态开源数据库调用。不依赖静态缓存，每次都从最新数据源获取并AI分析。"
---

# LLM驱动的生物医学动态知识系统 (GSD方案 v2.0)

## 🎯 核心理念转变

### ❌ 旧范式：静态数据库依赖
```
用户提问 → 查找本地reference文件 → 返回预存答案 → 结束
问题：信息过时、无法应对新研究、缺乏个性化分析
```

### ✅ 新范式：LLM驱动的动态智能
```
用户提问 → LLM理解意图 → 实时调用开源数据库 → AI深度分析 → 生成个性化洞察 → 用户可保存到个人知识库
优势：最新数据、深度分析、用户控制、持续学习
```

**关键区别**：
- **不是**"预先撞库好的数据库"
- **而是**"LLM实时分析 + 用户自主管理 + 开源数据库即时调用"

---

## Goal（目标）

### 核心目标
构建一个**以用户为中心、LLM为大脑、开源数据库为知识源**的动态知识系统：

1. ✅ **用户完全自主控制**
   - 用户可以随时搜索、添加、删除、组织自己的文献库
   - 提供直观的UI界面管理27个领域的references
   - 支持个人收藏夹、标签、笔记等个性化功能

2. ✅ **LLM实时分析引擎**
   - 不只是返回搜索结果，而是**深度分析**每篇论文
   - 自动进行Critical Analysis（方法学评估、偏倚风险、可重复性）
   - 跨论文综合比较，识别研究gap和趋势
   - 生成个性化的Research Recommendation

3. ✅ **动态开源数据库集成**
   - **每次查询都实时访问**PubMed/Semantic Scholar/OpenAlex
   - 不依赖本地缓存（可选缓存用于性能优化）
   - 支持复杂查询（作者网络、引用关系、时间序列）
   - 自动追踪新发表论文（weekly alert）

4. ✅ **混合智能模式**
   - Layer 1: 本地reference文件（基础knowledge base）
   - Layer 2: 实时数据库搜索（最新研究）
   - Layer 3: LLM分析与综合（深度洞察）
   - 三层协同，用户可见每一层的来源

### 成功标准
- [ ] 用户可以通过UI在30秒内完成一次文献搜索+分析
- [ ] LLM生成的分析报告包含≥5个维度（方法学、创新性、局限性、应用价值、相关研究）
- [ ] 系统响应时间≤10秒（含数据库查询+LLM分析）
- [ ] 用户满意度≥4.0/5.0（基于反馈调查）
- [ ] 分析准确率≥80%（与专家评估对比）

---

## Scoping（范围界定）

### 核心架构（三层模型）

```
┌─────────────────────────────────────────────────────────────┐
│                    Layer 3: LLM Analysis Engine               │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Paper Analyzer│  │ Cross-Paper  │  │ Research Recommender│ │
│  │ (单篇深度分析) │  │ Synthesizer  │  │ (研究建议生成器)    │ │
│  │              │  │ (跨论文综合)  │  │                    │ │
│  └──────────────┘  └──────────────┘  └────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                  Layer 2: Real-time Database Orchestrator     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ PubMed Query │  │ S2 API       │  │ OpenAlex Query     │ │
│  │ Engine       │  │ Integration  │  │ Engine             │ │
│  └──────────────┘  └──────────────┘  └────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │          Query Optimizer + Result Fusion + Cache        │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                   Layer 1: User-Controlled Knowledge Base    │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Reference    │  │ Personal     │  │ User Analytics     │ │
│  │ Manager (UI) │  │ Library      │  │ & Feedback         │ │
│  │              │  │ (收藏/标签)  │  │                    │ │
│  └──────────────┘  └──────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Module 1: LLM Analysis Engine（LLM分析引擎）⭐ 核心

#### 1.1 Paper Analyzer（单篇论文深度分析）

**功能**：对单篇论文进行多维度深度分析

**分析维度**（10个维度）：

```typescript
interface PaperAnalysis {
  // 基础信息
  metadata: {
    title: string
    authors: string[]
    year: number
    journal: string
    doi: string
    citationCount: number
    openAccess: boolean
  }

  // 方法学质量评估
  methodology: {
    studyDesign: string  // RCT/Cohort/Case-Control/Cross-sectional
    sampleSize: { n: number; power?: string }
    statisticalMethods: string[]
    biasRisk: 'Low' | 'Moderate' | 'High'
    confoundingControl: string[]
    reproducibilityScore: number  // 1-10
  }

  // 创新性评估
  innovation: {
    noveltyLevel: 'Incremental' | 'Significant' | 'Breakthrough'
    keyContribution: string
    comparisonToPriorWork: string
    potentialImpact: 'Low' | 'Medium' | 'High' | 'Transformative'
    technologyReadinessLevel: number  // TRL 1-9
  }

  // 局限性与批判性思维
  limitations: {
    methodologicalLimitations: string[]
    generalizabilityConcerns: string[]
    conflictsOfInterest: string
    missingAnalyses: string[]
    contradictoryEvidence: string[]
    overallRiskRating: '🟢 Low' | '🟡 Medium' | '🔴 High'
  }

  // 应用价值
  applicability: {
    clinicalRelevance: number  // 1-10
    researchGapAddressed: string
    implementationFeasibility: string
    costEffectiveness: string
    targetAudience: string[]
  }

  // 相关研究图谱
  relatedWork: {
    citingPapers: SearchResult[]  // 引用这篇的论文
    citedPapers: SearchResult[]  // 这篇引用的论文
    similarPapers: SearchResult[]  // 相似主题的论文
    competingApproaches: SearchResult[]  // 竞争方法
  }

  // LLM生成的洞察
  aiInsights: {
    keyTakeaway: string  // 一句话总结
    whyItMatters: string  // 为什么重要
    whatIsMissing: string  // 缺什么
    nextSteps: string[]  // 建议后续研究方向
    controversyPoints: string[]  // 争议点
    clinicalImplications: string[]  // 临床意义
  }

  // 可视化建议
  visualizationSuggestions: {
    recommendedCharts: Array<{type: string; description: string}>
    keyFiguresToExtract: string[]
    dataTablesToHighlight: string[]
  }

  // 综合评分
  overallScore: {
    quality: number  // 1-10
    importance: number  // 1-10
    actionability: number  // 1-10
    weightedAverage: number  // 综合分
  }
}
```

**实现示例**：

```typescript
class PaperAnalyzer {
  private llmClient: LLMClient  // GPT-4/Claude/本地模型

  async analyze(paper: SearchResult): Promise<PaperAnalysis> {
    // Step 1: 获取全文（如果可用）
    const fullText = await this.fetchFullText(paper.doi)

    // Step 2: 构建分析prompt
    const prompt = this.buildAnalysisPrompt(paper, fullText)

    // Step 3: LLM深度分析
    const analysis = await this.llmClient.analyze(prompt)

    // Step 4: 验证和补充（调用数据库获取引用关系）
    analysis.relatedWork = await this.fetchRelatedWork(paper)

    // Step 5: 生成可视化建议
    analysis.visualizationSuggestions = this.suggestVisualizations(analysis)

    return analysis
  }

  private buildAnalysisPrompt(paper: SearchResult, fullText?: string): string {
    return `你是一位生物医学研究方法学专家。请对以下论文进行全面深度分析：

## 论文基本信息
标题：${paper.title}
作者：${paper.authors}
年份：${paper.year}
期刊：${paper.venue}
摘要：${paper.abstract}

${fullText ? `## 全文\n${fullText.substring(0, 8000)}...` : ''}

## 请提供以下分析（JSON格式）：

1. **方法学质量**：研究设计、样本量、统计方法、偏倚风险、可重复性评分(1-10)
2. **创新性评估**：新颖程度、主要贡献、与前人工作的对比、潜在影响、TRL等级
3. **局限性**：方法论局限、普适性问题、利益冲突、缺失分析、矛盾证据、总体风险评估
4. **应用价值**：临床相关性(1-10)、解决的研究gap、实施可行性、成本效益、目标受众
5. **AI洞察**：一句话总结、为什么重要、缺什么、建议后续方向、争议点、临床意义
6. **综合评分**：质量/重要性/可操作性(各1-10)及加权平均分

请确保分析客观、批判性、有见地。`
  }
}
```

#### 1.2 Cross-Paper Synthesizer（跨论文综合器）

**功能**：将多篇论文综合成连贯的研究叙事

**使用场景**：
- 用户问："ECG领域最近5年有哪些重要进展？"
- 系统搜索→获取20篇论文→LLM综合→生成结构化报告

**输出格式**：

```typescript
interface SynthesisReport {
  query: string
  papersAnalyzed: number
  timestamp: Date

  executiveSummary: {
    mainFindings: string[]  // 3-5个核心发现
    keyTrends: string[]  // 2-3个趋势
    researchGaps: string[]  // 1-2个gap
    overallAssessment: string  // 总体评价
  }

  thematicAnalysis: Array<{
    theme: string
    papers: string[]  // 论文ID列表
    narrative: string  // 叙事性描述
    supportingEvidence: string[]  // 关键证据
    contradictions: string[]  // 内部矛盾
  }>

  timeline: Array<{
    year: number
    milestone: string
    papers: string[]
    significance: string
  }>

  comparativeAnalysis: {
    methodsComparison: TableData  // 方法对比表
    performanceComparison: TableData  // 性能对比表
    datasetComparison: TableData  // 数据集对比表
  }

  criticalEvaluation: {
    strengths: string[]  // 领域优势
    weaknesses: string[]  // 领域短板
    controversies: Array<{topic: string; positions: string[]}>
    methodologicalIssues: string[]
  }

  futureDirections: {
    shortTerm: string[]  // 1-2年
    mediumTerm: string[]  // 3-5年
    longTerm: string[]  // 5-10年
    breakthroughOpportunities: string[]
  }

  recommendations: {
    forResearchers: string[]
    forClinicians: string[]
    forPolicyMakers: string[]
    forFundingAgencies: string[]
  }

  visualizations: Array<{
    type: 'timeline' | 'network' | 'heatmap' | 'bar' | 'scatter'
    title: string
    description: string
    data: object
  }>
}
```

#### 1.3 Research Recommender（研究建议生成器）

**功能**：基于用户的兴趣和历史，推荐研究方向和论文

**个性化维度**：
- 用户的历史搜索记录
- 用户保存的论文集合
- 用户的研究领域偏好
- 用户关注的期刊/作者
- 时间偏好（经典 vs 最新）

---

### Module 2: Real-time Database Orchestrator（实时数据库协调器）

#### 核心原则
**每次查询都实时访问数据库，不依赖静态缓存**

但提供**可选的智能缓存层**用于性能优化（用户可选择启用/禁用）

#### 数据源特性对比

| 数据源 | 优势 | 劣势 | 最佳用途 |
|--------|------|------|----------|
| **PubMed** | 权威医学文献、MeSH术语、临床过滤 | 无引用数、API限流严格 | 临床研究、系统综述 |
| **Semantic Scholar** | 引用网络、AI摘要、快速API | 商业化、可能有偏差 | 引用分析、影响力评估 |
| **OpenAlex** | 完全开源、覆盖广、无限制 | 数据质量参差、更新延迟 | 大规模分析、开放科学 |

#### 查询优化策略

```typescript
class QueryOptimizer {
  optimize(userQuery: string, context: SearchContext): OptimizedQuery[] {
    const strategies = []

    // Strategy 1: 直接查询（精确匹配）
    if (this.hasDOI(userQuery)) {
      strategies.push({
        source: ['semantic_scholar'],
        query: userQuery,
        type: 'DOI_LOOKUP',
        priority: 1
      })
    }

    // Strategy 2: 关键词扩展（同义词+MeSH）
    if (this.isDomainQuery(userQuery)) {
      const expandedQuery = this.expandWithSynonyms(userQuery)
      const meshTerms = this.lookupMeSH(userQuery)

      strategies.push(
        {
          source: ['pubmed'],
          query: `${expandedQuery} AND ${meshTerms.join(' OR ')}`,
          type: 'DOMAIN_SEARCH',
          priority: 2
        },
        {
          source: ['semantic_scholar', 'openalex'],
          query: expandedQuery,
          type: 'CITATION_WEIGHTED_SEARCH',
          priority: 3
        }
      )
    }

    // Strategy 3: 作者/机构查询
    if (this.hasAuthorName(userQuery)) {
      strategies.push({
        source: ['all'],
        query: userQuery,
        type: 'AUTHOR_SEARCH',
        priority: 2
      })
    }

    return strategies.sort((a, b) => a.priority - b.priority)
  }
}
```

#### 结果融合算法

```typescript
class ResultFuser {
  fuse(resultsFromSources: Map<string, SearchResult[]>): FusedResult[] {
    // Step 1: 基于DOI/标题去重
    const deduplicated = this.deduplicate(resultsFromSources)

    // Step 2: 多信号融合排序
    const scored = deduplicated.map(result => ({
      ...result,
      fusionScore: this.calculateFusionScore(result, resultsFromSources)
    }))

    // Step 3: 多样性保证（避免全是同一类型论文）
    const diversified = this.ensureDiversity(scored)

    return diversified
  }

  private calculateFusionScore(result: SearchResult, allResults: Map<string, SearchResult[]>): number {
    let score = 0

    // Signal 1: 出现在多个数据源（一致性）
    const sourceCount = this.countSourcesContaining(result, allResults)
    score += sourceCount * 20

    // Signal 2: 引用数量（影响力）
    score += Math.min(result.citationCount || 0, 1000) / 100

    // Signal 3: 发表时间（时效性）
    const year = typeof result.year === 'string' ? parseInt(result.year) : result.year
    const recency = 2026 - year
    score += Math.max(0, 10 - recency) * 2

    // Signal 4: 期刊质量（如果有的话）
    if (this.isTopJournal(result.venue)) {
      score += 15
    }

    // Signal 5: 开放获取（可及性）
    if (result.openAccess || result.pmcid) {
      score += 5
    }

    return score
  }
}
```

---

### Module 3: User-Controlled Knowledge Base（用户可控的知识库）

#### 3.1 Reference Manager UI（参考文献管理界面）

**设计原则**：
- 直观易用（3次点击完成任何操作）
- 信息丰富（每个操作都有上下文）
- 个性化（支持用户自定义）
- 协作友好（未来可扩展团队功能）

**核心界面组件**：

```tsx
// components/reference-manager.tsx
export function ReferenceManager() {
  return (
    <div className="reference-manager">
      {/* 顶部工具栏 */}
      <Toolbar>
        <SearchBar onSearch={handleSearch} />
        <FilterPanel filters={filters} onChange={setFilters} />
        <ViewToggle view="grid|list|timeline" />
        <BulkActions selectedItems={selected} />
      </Toolbar>

      {/* 主内容区 */}
      <MainContent>
        {/* 左侧：27个领域导航 */}
        <DomainSidebar domains={domains} onSelect={selectDomain} />

        {/* 中间：论文列表 */}
        <PaperList papers={papers} onSelect={selectPaper}>
          {papers.map(paper => (
            <PaperCard key={paper.id} paper={paper}>
              {/* 快速操作按钮 */}
              <QuickActions>
                <Button icon="eye" onClick={() => analyze(paper)}>AI分析</Button>
                <Button icon="plus" onClick={() => addToLibrary(paper)}>收藏</Button>
                <Button icon="download" onClick={() => downloadPDF(paper)}>PDF</Button>
                <Button icon="share" onClick={() => share(paper)}>分享</Button>
              </QuickActions>
            </PaperCard>
          ))}
        </PaperList>

        {/* 右侧：详情/分析面板 */}
        <DetailPanel>
          {selectedPaper && (
            <>
              <PaperMetadata paper={selectedPaper} />
              <AITabs>
                <Tab label="概览"><SummaryView /></Tab>
                <Tab label="深度分析"><DeepAnalysis /></Tab>
                <Tab label="相关研究"><RelatedWork /></Tab>
                <Tab label="批判性评估"><Critique /></Tab>
                <Tab label="应用建议"><Recommendations /></Tab>
              </AITabs>
            </>
          )}
        </DetailPanel>
      </MainContent>

      {/* 底部状态栏 */}
      <StatusBar>
        <Statistics totalPapers={papers.length} lastUpdated={timestamp} />
        <SyncStatus isRealTime={true} />
        <UserActions export import settings />
      </StatusBar>
    </div>
  )
}
```

#### 3.2 Personal Library（个人图书馆）

**功能**：
- 收藏夹（Favorites）：用户标记的重要论文
- 标签系统（Tags）：自定义分类（如"#必读"、"#方法学"、"#争议"）
- 笔记（Notes）：每篇论文的个人笔记
- 集合（Collections）：按项目/主题组织的论文组
- 阅读状态（Reading Status）：未读/已读/重点/已引用

**数据模型**：

```typescript
interface UserLibrary {
  userId: string
  favorites: string[]  // DOI列表
  tags: Map<string, string[]>  // tag -> DOIs
  notes: Map<string, Note>  // DOI -> note
  collections: Collection[]
  readingHistory: ReadingRecord[]
  searchHistory: SearchRecord[]
  preferences: UserPreferences
}

interface Note {
  paperDoi: string
  content: string
  createdAt: Date
  updatedAt: Date
  highlights: Array<{text: string; color: string; comment?: string}>
}

interface Collection {
  id: string
  name: string
  description: string
  papers: string[]  // DOIs
  tags: string[]
  isPublic: boolean
  collaborators?: string[]
}
```

#### 3.3 User Analytics & Feedback（用户分析反馈）

**功能**：
- 使用统计（最常搜索的领域、最常阅读的期刊）
- 反馈机制（对AI分析的点赞/纠错）
- 个性化推荐优化（基于行为数据）
- 导出报告（个人阅读清单、研究综述草稿）

---

## Definition（详细技术定义）

### API端点设计（v2.0增强版）

#### 文献搜索与分析API

```typescript
// POST /api/literature/search-and-analyze
// 核心端点：搜索 + LLM分析一体化
{
  query: string
  options: {
    maxPapers: number  // 默认10
    analyzeDepth: 'quick' | 'standard' | 'deep'  // 分析深度
    includeRelatedWork: boolean  // 是否包含相关研究
    domains: string[]  // 限定领域（如["ecg", "eeg"]）
    timeRange: {from: number, to: number}  // 年份范围
    sources: Array<'pubmed' | 'semantic_scholar' | 'openalex'>
    useCache: boolean  // 是否使用缓存（默认false=实时查询）
  }
}

// Response:
{
  success: true
  query: string
  searchResults: SearchResult[]  // 原始搜索结果
  analyses: PaperAnalysis[]  // LLM深度分析（如果analyzeDepth != 'none'）
  synthesis: SynthesisReport  // 跨论文综合（如果maxPapers > 1）
  executionTime: string
  sourcesUsed: string[]
  cacheHit: boolean
  timestamp: string
}
```

#### 单篇论文深度分析API

```typescript
// POST /api/literature/analyze-paper
// 对指定论文进行深度分析
{
  doi: string  // 或 pmid/arxivId
  analysisType: 'full' | 'methodology-only' | 'innovation-only' | 'critical-only'
  context: {
    userQuestion?: string  // 用户的具体问题（用于定制化分析）
    compareWith?: string[]  // 对比的其他论文DOIs
    focusAreas?: string[]  // 关注领域
  }
}

// Response:
{
  success: true
  paper: SearchResult
  analysis: PaperAnalysis  // 完整的10维度分析
  visualizations: VisualizationSuggestion[]
  relatedPapers: SearchResult[]
  executionTime: string
}
```

#### 用户图书馆API

```typescript
// GET /api/user/library
// 获取用户的个人图书馆
// Response: UserLibrary

// POST /api/user/library/favorites
// 添加到收藏
{ doi: string }

// DELETE /api/user/library/favorites/:doi
// 取消收藏

// POST /api/user/library/notes
// 添加笔记
{ doi: string; content: string; highlights?: Highlight[] }

// GET /api/user/library/collections
// 获取所有集合

// POST /api/user/library/collections
// 创建集合
{ name: string; description?: string; papers?: string[] }
```

#### 用户触发的撞库更新API

```typescript
// POST /api/references/:filename/user-update
// 用户手动触发某个reference文件的更新
{
  action: 'add' | 'remove' | 'update'
  papers: Array<{
    doi?: string
    query?: string  // 如果没有DOI，用query搜索
    customNotes?: string
    tags?: string[]
  }>
  options: {
    autoAnalyze: boolean  // 是否自动LLM分析
    addToPersonalLibrary: boolean  // 是否同时添加到个人收藏
  }
}

// Response:
{
  success: true
  file: string
  addedPapers: number
  removedPapers: number
  updatedPapers: number
  analyses: PaperAnalysis[]  // 如果autoAnalyze=true
  duration: string
  message: string
}
```

---

## 实施路线图（Implementation Roadmap）

### Phase 1: LLM分析引擎核心（Week 1-2）

**任务**：
- [ ] 创建`lib/llm-analysis-engine.ts`（PaperAnalyzer类）
- [ ] 实现10维度的分析prompt模板
- [ ] 集成LLM API（支持OpenAI/Anthropic/本地模型）
- [ ] 实现`Cross-Paper Synthesizer`（跨论文综合）
- [ ] 编写单元测试（mock LLM响应）
- [ ] 性能优化（流式输出、并行分析）

**交付物**：
- 可以对任意论文生成完整分析的引擎
- 分析准确率≥75%（与专家评估对比）
- 单篇分析时间≤15秒

### Phase 2: 用户界面开发（Week 2-3）

**任务**：
- [ ] 创建`components/reference-manager.tsx`（主界面）
- [ ] 实现`PaperCard`组件（带快速操作按钮）
- [ ] 实现`DetailPanel`组件（AI分析展示）
- [ ] 实现`Personal Library`功能（收藏/标签/笔记）
- [ ] 实现响应式设计（桌面/平板/手机）
- [ ] UI/UX测试（5个用户测试）

**交付物**：
- 完整的可视化文献管理界面
- 用户可以在3次点击内完成任何操作
- 用户满意度≥4.0/5.0

### Phase 3: 实时数据库协调器增强（Week 3）

**任务**：
- [ ] 重构`lib/dynamic-matching-engine.ts`为`DatabaseOrchestrator`
- [ ] 实现`QueryOptimizer`（智能查询策略）
- [ ] 实现`ResultFuser`（多源结果融合）
- [ ] 添加可选缓存层（用户可开关）
- [ ] 实现查询日志和分析（了解用户搜索模式）
- [ ] 性能测试（目标：P99响应时间<8秒）

**交付物**：
- 高效的多数据库协调器
- 支持3种数据源的并行查询和智能融合
- 详细的查询性能监控

### Phase 4: 集成与测试（Week 4）

**任务**：
- [ ] 将LLM分析引擎集成到skill-engine.ts
- [ ] 将用户界面集成到Next.js网站
- [ ] 端到端测试（用户搜索→分析→保存全流程）
- [ ] 压力测试（并发用户数）
- [ ] 用户验收测试（UAT）
- [ ] 文档编写（用户手册+开发者文档）

**交付物**：
- 完全集成的生产就绪系统
- 通过所有测试用例
- 完整的用户和开发者文档

---

## 技术栈与新增依赖

### 新增依赖
```json
{
  "dependencies": {
    "openai": "^4.x",           // OpenAI API客户端
    "@anthropic-ai/sdk": "^0.x", // Anthropic Claude客户端
    "lru-cache": "^10.x",       // 可选缓存
    "zod": "^3.x",              // schema验证
    "react-query": "^3.x",      // 服务端状态管理
    "@tanstack/react-query": "^5.x",
    "framer-motion": "^11.x",   // UI动画
    "recharts": "^2.x",         // 数据可视化
    "date-fns": "^3.x"          // 日期处理
  },
  "devDependencies": {
    "@types/react-query": "^2.x"
  }
}
```

### 架构决策
1. **LLM选择**：默认使用GPT-4o（平衡质量和成本），可选Claude 3.5 Sonnet（更长上下文）
2. **前端框架**：React + TypeScript + Tailwind CSS（保持现有技术栈）
3. **状态管理**：TanStack React Query（服务端状态）+ Zustand（客户端状态）
4. **数据库**：暂不需要后端数据库（使用localStorage/IndexedDB存储用户数据，未来可迁移至Supabase/Firebase）

---

## 风险与缓解措施

### 风险1: LLM分析质量不稳定
**概率**: 中 (50%)
**影响**: 高（用户信任度下降）
**缓解**:
- 多轮验证（让LLM自我检查分析结果）
- 提供置信度分数（让用户知道哪些分析更可靠）
- 允许用户提供反馈（持续改进模型）
- 对于高风险结论，标注"需人工验证"

### 风险2: API成本过高
**概率**: 高 (70%)
**影响**: 中（运营成本上升）
**缓解**:
- 智能缓存（相同论文不重复分析）
- 分级分析（quick模式成本低，deep模式成本高）
- 批量分析优惠（一次分析多篇论文）
- 本地模型选项（Ollama + Llama 3/Mistral）

### 风险3: 用户学习曲线陡峭
**概率**: 中 (40%)
**影响**: 中（采用率低）
**缓解**:
- 渐进式披露（基础功能先展示，高级功能后展示）
- 交互式教程（首次使用引导）
- 模板化工作流（预设常用场景）
- 上下文帮助（每个功能都有tooltip和示例）

---

## 成功指标与监控

### 核心KPIs

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 用户任务完成率 | ≥90% | 分析用户操作日志 |
| 平均任务完成时间 | ≤30秒 | 从搜索到获得分析的时间 |
| LLM分析准确性 | ≥80% | 专家抽样评估 |
| 用户满意度 | ≥4.0/5.0 | 定期问卷调查 |
| 日活跃用户(DAU) | 持续增长 | Google Analytics |
| API响应时间(P99) | ≤10秒 | APM监控 |
| 用户留存率(7日) | ≥50% | 用户行为分析 |

### 监控仪表盘要素
- 实时用户数和活跃会话
- 搜索查询分布（热门领域）
- LLM API调用量和成本
- 分析请求的成功率和错误率
- 用户反馈的情感分析

---

## 使用示例

### 示例1: 用户主动搜索并分析论文

```
用户操作流程：

1. 打开Reference Manager界面
2. 在搜索框输入："deep learning ECG arrhythmia detection 2024-2026"
3. 点击"Search & Analyze"按钮
4. 等待8秒...

系统返回：
├── 搜索结果：15篇相关论文（来自PubMed+S2+OpenAlex）
├── LLM自动分析前5篇最重要的论文（deep模式）
├── 生成跨论文综合报告：
│   ├── Executive Summary: "2024-2026年DL-ECG有3大趋势..."
│   ├── Thematic Analysis: 4个主题（Transformer架构、自监督学习、联邦学习、可解释性）
│   ├── Comparative Table: 5篇论文的方法/数据集/性能对比
│   ├── Critical Evaluation: 领域共性问题和争议
│   └── Future Directions: 5个建议研究方向
└── 可视化建议：
    ├── Timeline: 2024-2026里程碑
    ├── Network: 论文引用关系图
    └── Heatmap: 方法和数据集的流行度

5. 用户浏览结果，点击第3篇论文查看详细分析
6. 用户觉得这篇很重要，点击"★ 收藏"并添加标签"#必读 #Transformer"
7. 用户在笔记栏写下："这个方法的attention mechanism很巧妙，可以借鉴到我的BCI项目中"
8. 用户点击"添加到ECG reference"，这篇论文被追加到ecg-methodology.md
```

### 示例2: 用户质疑某个结论，系统验证

```
User: "我听说AI-ECG可以检测房颤，准确率90%以上，这是真的吗？"

System (内部流程):
1. 检测意图: VERIFICATION (confidence: 0.92)
2. 构建查询: "AI-ECG atrial fibrillation detection sensitivity specificity validation"
3. 并行搜索PubMed + Semantic Scholar
4. 获取12篇相关论文
5. LLM深度分析前3篇最重要论文（Attia 2019, Hannun 2019, 最新验证研究）
6. 生成验证报告

Assistant: "关于AI-ECG检测房颤的问题，我刚检索了最新的12篇文献并进行深度分析：

**✅ 结论基本属实，但需要 nuanced understanding**:

1️⃣ **核心证据（Attia et al., Lancet 2019）**:
   - AUC 0.90（95% CI: 0.87-0.93）检测窦性心律中的房颤
   - 外部验证队列也达到AUC 0.87-0.90
   - ⚠️ 但这是在**精选人群**中（Mayo Clinic患者），一般人群可能更低

2️⃣ **方法学注意事项**:
   - 🟡 **谱系偏倚风险**: 训练数据来自特定医疗系统，可能不适配其他人群
   - 🟡 **标签质量问题**: 房颤诊断依赖Holter确认，可能存在漏诊
   - 🔴 **外部验证有限**: 只有2-3个独立外部验证研究

3️⃣ **最新进展（2024-2026）**:
   - 多中心RCT DULCE试验正在进行中（预计2027年出结果）
   - 一些研究发现**皮肤色素沉着会影响ECG信号质量**，从而降低AI准确性
   - 苹果手表等可穿戴设备的AF检测AUC仅0.82-0.88（低于临床ECG）

**🎯 我的建议**:
- 如果你是**临床医生**: 可以作为筛查工具，但阳性病例需Holter确认
- 如果你是**研究者**: 关注DULCE RCT结果和肤色偏倚问题
- 如果你是一般用户**: 不要过度依赖消费级设备的结果

**📚 详细分析报告已生成**（点击查看3篇核心论文的完整分析）

你想深入了解哪方面？我可以：
- 🔍 搜索更多关于特定亚组的验证研究
- 📊 对比不同AI-ECG算法的性能
- 💾 将这些信息保存到你的personal library"
```

### 示例3: 用户批量更新自己的reference文件

```
用户操作：

1. 进入 ecg-methodology.md 的管理页面
2. 点击"Update from Database"按钮
3. 弹出配置面板：
   ┌─────────────────────────────────────┐
   │  Update ECG Methodology References   │
   ├─────────────────────────────────────┤
   │  Sources: ☑ PubMed  ☑ S2  ☐ OpenAlex│
   │  Max Papers: [20]                   │
   │  Year Range: [2020] to [2026]       │
   │  Min Citations: [50]                │
   │                                     │
   │  ☑ Auto-Analyze with LLM            │
   │  ☑ Add to My Favorites              │
   │  ☑ Generate Summary Report          │
   │                                     │
   │  [Preview] [Cancel] [Start Update]   │
   └─────────────────────────────────────┘

4. 用户点击"Preview"（试运行模式）
5. 系统显示将要添加的15篇论文列表及其初步分析
6. 用户取消勾选2篇不相关的论文
7. 用户点击"Start Update"
8. 45秒后完成：
   - 13篇新论文添加到ecg-methodology.md
   - 每篇都附带完整的LLM分析（Methodology Decomposition + Critical Analysis）
   - 生成一份Summary Report（领域更新概览）
   - 所有论文自动添加到用户的Favorites（带标签"#auto-added #ecg"）
   - 用户收到通知："ECG references updated: +13 papers analyzed"
```

---

## 总结

### 这个v2.0方案的核心变革

| 维度 | v1.0（旧方案） | v2.0（本方案） |
|------|---------------|----------------|
| **核心驱动** | 静态数据库 + 定期更新 | LLM实时分析 + 用户控制 |
| **知识来源** | 本地reference文件 | 实时数据库查询 + AI分析 |
| **用户角色** | 被动接收者 | 主动管理者 |
| **分析深度** | 浅层（元数据） | 深度（10维度批判性分析） |
| **个性化** | 无 | 强（个人图书馆、偏好学习） |
| **更新频率** | 手动/定时 | 实时/按需 |
| **可信度** | 盲信预存内容 | 透明（显示来源+置信度） |

### 为什么这更重要？

1. **科学在快速发展**：2024-2026年AI医学论文爆发式增长，静态数据库永远跟不上
2. **用户需求多样化**：临床医生、研究人员、学生需要不同深度的分析
3. **批判性思维至关重要**：不是所有论文都值得信赖，LLM可以帮助识别问题
4. **知识需要个性化**：每个人的背景和需求不同，通用答案不够好

### 下一步行动

✅ 审阅本方案并提出修改意见  
✅ 确认Phase 1的实施计划（LLM分析引擎）  
✅ 我将立即开始编写核心代码  

---

*方案版本*: v2.0  
*最后更新*: 2026-05-06  
*核心理念*: **User-Centric, LLM-Powered, Real-Time Intelligence**
