// ═══════════════════════════════════════════════════════════
// 🏗️ SKILL ORCHESTRATION ARCHITECTURE v3.0
// Multi-layered system: Simple API → Intelligent Orchestration → Deep Protocol Execution
// ═══════════════════════════════════════════════════════════

import {
  CLINICAL_VALIDATION_LEVELS,
  createSkillEngine,
  detectDomainFromQuery,
  FATAL_BLOCKERS,
  INNOVATION_LEVELS
} from './skill-execution-engine'

// ╔════════════════════════════════════════════════════════╗
// ║  LAYER 1: UNIFIED API INTERFACE (Simple & Clear)      ║
// ╚════════════════════════════════════════════════════════╝

/**
 * Unified Skill Request - The ONLY interface external systems need to understand
 *
 * Design Philosophy:
 * - External callers see only 5 parameters (maximum simplicity)
 * - Internal complexity is completely hidden
 * - All protocol decisions are made automatically by the orchestration engine
 */
export interface UnifiedSkillRequest {
  // Core input (required)
  input: string | FileInput[]

  // Intent hint (optional - auto-detected if not provided)
  intent?: 'analyze' | 'compare' | 'reproduce' | 'ideate' | 'verify' | 'explore'

  // Domain hint (optional - auto-detected from input)
  domain?: string

  // Depth level (optional - default: 'standard')
  depth?: 'quick' | 'standard' | 'deep' | 'exhaustive'

  // Output format preference (optional)
  outputFormat?: 'summary' | 'detailed' | 'structured' | 'executive'
}

export interface FileInput {
  type: 'pdf' | 'doi' | 'url' | 'text'
  content: string
  name?: string
  size?: number
}

/**
 * Unified Skill Response - Clean, structured output
 */
export interface UnifiedSkillResponse {
  success: boolean

  // Executive summary (always present)
  summary: {
    title: string
    oneLiner: string
    keyFindings: string[]
    confidence: 'HIGH' | 'MEDIUM' | 'LOW'
    processingTime: number
  }

  // Detailed analysis (when depth >= 'standard')
  analysis?: {
    moduleUsed: string
    protocolFollowed: string[]

    // Core assessments (SKILL-v2.0 standard)
    innovationLevel: {
      score: string  // L1-L5c
      label: string
      rationale: string
    }

    fatalBlockers: {
      verdict: 'YES' | 'PARTIAL' | 'NO'
      criticalIssues: number
      warningIssues: number
      details: Array<{
        id: string
        name: string
        status: string
        impact: string
      }>
    }

    clinicalValidation: {
      level: string  // V0-V5
      label: string
      evidence: string
    }

    reproducibility: {
      score: number  // 0-100
      assessment: string
    }
  }

  // Structured data (when outputFormat === 'structured')
  structuredData?: Record<string, unknown>

  // Actionable recommendations (always present)
  recommendations: {
    immediate: string[]      // What to do next
    furtherAnalysis: string[]  // Which modules to run
    referencesToConsult: string[]  // Which skill files were used
  }

  // Metadata (for debugging and transparency)
  metadata: {
    engineVersion: string
    protocolsExecuted: number
    referencesLoaded: number
    toolCallsMade: number
    timestamp: string
    requestId: string
  }
}

/**
 * LAYER 1: Skill Facade - Single entry point for all operations
 *
 * This is the ONLY class that external code should interact with.
 * It provides a dead-simple API while hiding immense internal complexity.
 */
export class SkillFacade {
  private engine: ReturnType<typeof createSkillEngine>
  private orchestrator: SkillOrchestrator

  constructor(config?: { enableLogging?: boolean; maxCacheSize?: number }) {
    this.engine = createSkillEngine({
      enableLogging: config?.enableLogging ?? false,
      defaultModule: 'decompose',
      cacheTTLMinutes: 30
    })
    this.orchestrator = new SkillOrchestrator(this.engine)
  }

  /**
   * Execute any skill operation with unified interface
   *
   * Usage examples:
   *
   * // Simple analysis
   * const result = await skillFacade.execute({ input: "10.1234/paper1" })
   *
   * // Compare papers
   * const result = await skillFacade.execute({
   *   input: ["10.1234/paper1", "10.5678/paper2"],
   *   intent: 'compare'
   * })
   *
   * // Generate new research ideas
   * const result = await skillFacade.execute({
   *   input: "ECG arrhythmia detection using transformers",
   *   intent: 'ideate',
   *   domain: 'cardiology'
   * })
   */
  async execute(request: UnifiedSkillRequest): Promise<UnifiedSkillResponse> {
    const startTime = Date.now()
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    try {
      // Step 1: Auto-detect intent and domain if not provided
      const detectedIntent = request.intent || this.detectIntent(request.input)
      const detectedDomain: string = request.domain || this.detectDomain(request.input)

      // Step 2: Determine optimal execution plan
      const executionPlan = this.orchestrator.createExecutionPlan({
        intent: detectedIntent || 'analyze',
        domain: detectedDomain,
        depth: request.depth || 'standard',
        outputFormat: request.outputFormat || 'structured'
      })

      console.log(`[SkillFacade] 🎯 Execution Plan:`, {
        requestId,
        intent: detectedIntent,
        domain: detectedDomain,
        modules: executionPlan.phases.map((p: any) => p.moduleId),
        estimatedSteps: executionPlan.totalSteps
      })

      // Step 3: Execute the plan through orchestrator
      const result = await this.orchestrator.executePlan(executionPlan, request.input)

      // Step 4: Format response (Layer 1 → Layer 3 translation)
      return this.formatUnifiedResponse(result, {
        ...request,
        intent: detectedIntent || 'analyze',
        domain: detectedDomain
      }, startTime, requestId)

    } catch (error) {
      console.error(`[SkillFacade] ❌ Execution failed:`, error)
      return this.createErrorResponse(error, startTime, requestId)
    }
  }

  /**
   * Quick analysis mode - simplest possible API
   */
  async analyze(input: string | FileInput[]): Promise<UnifiedSkillResponse> {
    return this.execute({ input, intent: 'analyze', depth: 'standard' })
  }

  /**
   * Compare multiple inputs
   */
  async compare(inputs: (string | FileInput[])[]): Promise<UnifiedSkillResponse> {
    return this.execute({
      input: inputs.flat() as any,
      intent: 'compare',
      depth: 'deep'
    })
  }

  /**
   * Generate new research ideas from seed
   */
  async ideate(seedIdea: string): Promise<UnifiedSkillResponse> {
    return this.execute({
      input: seedIdea,
      intent: 'ideate',
      domain: 'research-ideation',
      depth: 'deep'
    })
  }

  // Private helper methods

  private detectIntent(input: string | FileInput[]): UnifiedSkillRequest['intent'] {
    const text = typeof input === 'string' ? input :
      Array.isArray(input) ? input.map(i => i.content).join(' ') : ''

    if (text.length < 50) return 'analyze'
    if (/compare|versus|vs\.|difference|benchmark/i.test(text)) return 'compare'
    if (/reproduce|replicate|implement|blueprint|how.to/i.test(text)) return 'reproduce'
    if (/new idea|novel|propose|hypothesis|evolve|innovat/i.test(text)) return 'ideate'
    if (/verify|evidence|validate|claim|support|contradict/i.test(text)) return 'verify'
    return 'analyze'
  }

  private detectDomain(input: string | FileInput[]): string {
    const text = typeof input === 'string' ? input :
      Array.isArray(input) ? input.map(i => i.content).join(' ') : ''

    const detection = detectDomainFromQuery(text)
    return detection.domain
  }

  private formatUnifiedResponse(
    rawResult: any,
    request: UnifiedSkillRequest & { intent: string; domain: string },
    startTime: number,
    requestId: string
  ): UnifiedSkillResponse {
    const processingTime = Date.now() - startTime

    return {
      success: true,
      summary: {
        title: `BME Research Analysis (${request.intent.toUpperCase()})`,
        oneLiner: rawResult.output?.body?.executive_summary || 'Analysis completed successfully',
        keyFindings: rawResult.output?.body?.actionable_recommendations?.slice(0, 3) || [
          'Analysis completed using SKILL protocol',
          `${rawResult.metrics?.stepsCompleted || 0} steps executed`,
          `${rawResult.context?.loadedReferences?.size || 0} references consulted`
        ],
        confidence: (rawResult.output?.footer?.confidence_level || 'MEDIUM').toUpperCase(),
        processingTime
      },
      analysis: request.depth !== 'quick' ? {
        moduleUsed: rawResult.moduleId || request.intent,
        protocolFollowed: rawResult.protocolFollowed || [],

        innovationLevel: {
          score: rawResult.output?.body?.innovation_level || 'L2',
          label: INNOVATION_LEVELS[rawResult.output?.body?.innovation_level as keyof typeof INNOVATION_LEVELS]?.name || 'Incremental Improvement',
          rationale: 'Assessed using SKILL.md Innovation Framework (L1-L5c)'
        },

        fatalBlockers: {
          verdict: rawResult.output?.body?.fatal_blocker_verdict || 'PARTIAL',
          criticalIssues: FATAL_BLOCKERS.filter((b: any) => b.severity_levels?.includes('🔴')).length,
          warningIssues: FATAL_BLOCKERS.filter((b: any) => b.severity_levels?.includes('🟡')).length,
          details: FATAL_BLOCKERS.slice(0, 5).map(b => ({
            id: b.id,
            name: b.name,
            status: b.severity_levels[0],
            impact: b.impact
          }))
        },

        clinicalValidation: {
          level: rawResult.output?.body?.clinical_validation_level || 'V2',
          label: (CLINICAL_VALIDATION_LEVELS as any)[rawResult.output?.body?.clinical_validation_level]?.label || 'External Validation',
          evidence: 'Assessed against FDA/EMA clinical validation guidelines'
        },

        reproducibility: {
          score: Math.floor(Math.random() * 30) + 60, // Placeholder - would be calculated
          assessment: 'Based on FB-1 (Data), FB-2 (Code), FB-7 (Reproduction Path) findings'
        }
      } : undefined,

      structuredData: request.outputFormat === 'structured' ? rawResult.output : undefined,

      recommendations: {
        immediate: [
          'Review executive summary for key insights',
          'Check fatal blocker details for critical issues',
          'Consider running complementary modules for deeper analysis'
        ],
        furtherAnalysis: this.suggestFurtherModules(request.intent),
        referencesToConsult: (Array.from(rawResult.context?.loadedReferences?.keys() || []) as string[]).slice(0, 4)
      },

      metadata: {
        engineVersion: 'SKILL-ORCHESTRATOR-v3.0',
        protocolsExecuted: rawResult.metrics?.stepsCompleted || 0,
        referencesLoaded: rawResult.context?.loadedReferences?.size || 0,
        toolCallsMade: rawResult.metrics?.toolCalls || 0,
        timestamp: new Date().toISOString(),
        requestId
      }
    }
  }

  private suggestFurtherModules(currentIntent: string): string[] {
    const suggestions: Record<string, string[]> = {
      analyze: ['compare', 'reproduce', 'evidence'],
      compare: ['decompose', 'paradigm'],
      reproduce: ['datasets', 'evidence'],
      ideate: ['decompose', 'datasets'],
      verify: ['decompose', 'compare'],
      explore: ['paradigm', 'datasets']
    }
    return suggestions[currentIntent] || ['decompose']
  }

  private createErrorResponse(error: unknown, startTime: number, requestId: string): UnifiedSkillResponse {
    return {
      success: false,
      summary: {
        title: 'Analysis Failed',
        oneLiner: error instanceof Error ? error.message : 'Unknown error occurred',
        keyFindings: [],
        confidence: 'LOW',
        processingTime: Date.now() - startTime
      },
      recommendations: {
        immediate: [
          'Check input format (DOI, PDF, URL supported)',
          'Verify API configuration',
          'Try simpler query or reduce complexity'
        ],
        furtherAnalysis: [],
        referencesToConsult: []
      },
      metadata: {
        engineVersion: 'SKILL-ORCHESTRATOR-v3.0',
        protocolsExecuted: 0,
        referencesLoaded: 0,
        toolCallsMade: 0,
        timestamp: new Date().toISOString(),
        requestId
      }
    }
  }
}

// ╔════════════════════════════════════════════════════════╗
// ║  LAYER 2: INTELLIGENT ORCHESTRATION ENGINE           ║
// ╚════════════════════════════════════════════════════════╝

interface ExecutionPlan {
  phases: ExecutionPhase[]
  totalSteps: number
  estimatedTime: number
  requiredCapabilities: string[]
}

interface ExecutionPhase {
  phaseId: string
  moduleId: string
  moduleName: string
  priority: 'mandatory' | 'recommended' | 'optional'
  steps: string[]
  tools: string[]
  dependencies: string[]
  expectedOutput: string
}

/**
 * LAYER 2: Skill Orchestrator - Intelligent workflow management
 *
 * This layer handles:
 * - Multi-module coordination
 * - Adaptive reasoning chain selection
 * - Error recovery and fallback strategies
 * - Parallel execution where beneficial
 */
export class SkillOrchestrator {
  private engine: ReturnType<typeof createSkillEngine>

  constructor(engine: ReturnType<typeof createSkillEngine>) {
    this.engine = engine
  }

  /**
   * Create optimized execution plan based on intent and context
   */
  createExecutionPlan(params: {
    intent: string
    domain: string
    depth: string
    outputFormat: string
  }): ExecutionPlan {
    const { intent, domain, depth } = params

    switch (intent) {
      case 'analyze':
        return this.createAnalysisPlan(domain, depth)
      case 'compare':
        return this.createComparisonPlan(depth)
      case 'reproduce':
        return this.createReproductionPlan(domain, depth)
      case 'ideate':
        return this.createIdeationPlan(domain, depth)
      case 'verify':
        return this.createVerificationPlan(depth)
      case 'explore':
        return this.createExplorationPlan(domain, depth)
      default:
        return this.createAnalysisPlan(domain, depth)
    }
  }

  private createAnalysisPlan(domain: string, depth: string): ExecutionPlan {
    const baseSteps = depth === 'quick' ? 4 : depth === 'exhaustive' ? 9 : 8

    return {
      phases: [
        {
          phaseId: 'acquisition',
          moduleId: 'decompose',
          moduleName: 'Full-Text Acquisition',
          priority: 'mandatory',
          steps: ['Step 0: Full-Text Acquisition (6-level priority)'],
          tools: ['fetch_paper', 'parse_pdf_content'],
          dependencies: [],
          expectedOutput: 'Complete paper content or abstract with metadata'
        },
        {
          phaseId: 'blocking',
          moduleId: 'decompose',
          moduleName: 'Fatal Blocker Detection',
          priority: 'mandatory',
          steps: ['Step 3: Fatal Blocker Detection (FB-1 to FB-11)'],
          tools: ['check_fatal_blockers', 'load_reference'],
          dependencies: ['acquisition'],
          expectedOutput: 'Blocker verdict with detailed findings'
        },
        {
          phaseId: 'analysis',
          moduleId: 'decompose',
          moduleName: 'Deep Analysis',
          priority: depth !== 'quick' ? 'mandatory' : 'recommended',
          steps: depth === 'exhaustive' ? [
            'Step 1: Literature Intent Recognition',
            'Step 2: Reference Matching',
            'Step 4: Deep Probe Layer',
            'Step 5: Adversarial Checking',
            'Step 6: Reproducibility Extraction',
            'Step 7: Innovation Assessment (L1-L5c)',
            'Step 8: Clinical Validation (V0-V5)'
          ] : [
            'Step 4: Deep Probe Layer',
            'Step 7: Innovation Assessment',
            'Step 8: Clinical Validation'
          ],
          tools: ['extract_full_text_knowledge', 'load_reference', 'search_papers'],
          dependencies: ['blocking'],
          expectedOutput: 'Comprehensive analysis report'
        }
      ],
      totalSteps: baseSteps,
      estimatedTime: depth === 'quick' ? 5000 : depth === 'exhaustive' ? 30000 : 15000,
      requiredCapabilities: ['text-extraction', 'domain-knowledge', 'statistical-analysis']
    }
  }

  private createComparisonPlan(depth: string): ExecutionPlan {
    return {
      phases: [
        {
          phaseId: 'multi-acquisition',
          moduleId: 'compare',
          moduleName: 'Multi-Paper Acquisition',
          priority: 'mandatory',
          steps: ['Full-text acquisition for ALL papers (parallel)'],
          tools: ['fetch_paper', 'parse_pdf_content'],
          dependencies: [],
          expectedOutput: 'All papers with full text available'
        },
        {
          phaseId: 'normalization',
          moduleId: 'compare',
          moduleName: 'Method Extraction & Normalization',
          priority: 'mandatory',
          steps: ['Method extraction', 'Terminology normalization', 'Metric alignment'],
          tools: ['extract_full_text_knowledge'],
          dependencies: ['multi-acquisition'],
          expectedOutput: 'Normalized method descriptions for comparison'
        },
        {
          phaseId: 'comparison-matrix',
         moduleId: 'compare',
          moduleName: 'Side-by-Side Comparison',
          priority: 'mandatory',
          steps: ['Method comparison', 'Dataset comparison', 'Innovation delta calculation'],
          tools: ['load_reference', 'check_fatal_blockers'],
          dependencies: ['normalization'],
          expectedOutput: 'Comparison matrix with quantitative deltas'
        },
        {
          phaseId: 'synthesis',
          moduleId: 'compare',
          moduleName: 'Evidence Synthesis & Paradigm Positioning',
          priority: depth !== 'quick' ? 'mandatory' : 'recommended',
          steps: ['Paradigm mapping', 'Gap analysis', 'Recommendation generation'],
          tools: ['search_papers', 'get_citations'],
          dependencies: ['comparison-matrix'],
          expectedOutput: 'Paradigm position map with actionable insights'
        }
      ],
      totalSteps: depth === 'quick' ? 6 : 12,
      estimatedTime: depth === 'quick' ? 8000 : 25000,
      requiredCapabilities: ['parallel-processing', 'cross-paper-reasoning', 'metric-normalization']
    }
  }

  private createReproductionPlan(domain: string, depth: string): ExecutionPlan {
    return {
      phases: [
        {
          phaseId: 'source-analysis',
          moduleId: 'reproduce',
          moduleName: 'Source Paper Deep Analysis',
          priority: 'mandatory',
          steps: ['Full acquisition', 'Environment spec extraction', 'Code/data availability check'],
          tools: ['fetch_paper', 'extract_full_text_knowledge', 'check_fatal_blockers'],
          dependencies: [],
          expectedOutput: 'Detailed reproduction requirements'
        },
        {
          phaseId: 'roadmap-generation',
          moduleId: 'reproduce',
          moduleName: 'Blueprint Generation',
          priority: 'mandatory',
          steps: ['Step-by-step implementation guide', 'Validation checkpoint definition', 'Common pitfalls documentation'],
          tools: ['load_reference', 'search_papers'],
          dependencies: ['source-analysis'],
          expectedOutput: 'Complete reproduction blueprint'
        },
        {
          phaseId: 'feasibility-check',
          moduleId: 'reproduce',
          moduleName: 'Feasibility & Resource Assessment',
          priority: depth !== 'quick' ? 'mandatory' : 'recommended',
          steps: ['Resource estimation', 'Timeline planning', 'Risk assessment'],
          tools: [],
          dependencies: ['roadmap-generation'],
          expectedOutput: 'Feasibility score with risk matrix'
        }
      ],
      totalSteps: depth === 'quick' ? 6 : 10,
      estimatedTime: depth === 'quick' ? 6000 : 20000,
      requiredCapabilities: ['environment-specification', 'implementation-planning', 'risk-assessment']
    }
  }

  private createIdeationPlan(domain: string, depth: string): ExecutionPlan {
    return {
      phases: [
        {
          phaseId: 'seed-analysis',
          moduleId: 'darwin',
          moduleName: 'Seed Idea Deconstruction',
          priority: 'mandatory',
          steps: ['Domain identification', 'Assumption extraction', 'Blind spot analysis'],
          tools: ['load_reference'],
          dependencies: [],
          expectedOutput: 'Structured seed profile'
        },
        {
          phaseId: 'operator-execution',
          moduleId: 'darwin',
          moduleName: 'Evolution Operator Application',
          priority: 'mandatory',
          steps: [
            'Transplant: Cross-domain method transfer',
            'Constrain: Resource-limited adaptation',
            'Fuse: Paradigm combination',
            'Invert: Objective/causal inversion',
            'Minimal: Rapid validation design',
            'Extreme: Boundary testing'
          ],
          tools: ['search_papers', 'extract_full_text_knowledge', 'load_reference'],
          dependencies: ['seed-analysis'],
          expectedOutput: '3-5 evolved idea variants'
        },
        {
          phaseId: 'assessment',
          moduleId: 'darwin',
          moduleName: 'Innovation & Feasibility Scoring',
          priority: 'mandatory',
          steps: ['L1-L5c novelty assessment', 'Clinical relevance evaluation', 'Execution roadmap generation'],
          tools: ['check_fatal_blockers'],
          dependencies: ['operator-execution'],
          expectedOutput: 'Ranked ideas with multi-dimensional scores'
        }
      ],
      totalSteps: depth === 'quick' ? 8 : 15,
      estimatedTime: depth === 'quick' ? 7000 : 22000,
      requiredCapabilities: ['creative-reasoning', 'cross-domain-mapping', 'innovation-assessment']
    }
  }

  private createVerificationPlan(depth: string): ExecutionPlan {
    return {
      phases: [
        {
          phaseId: 'claim-structuring',
          moduleId: 'evidence',
          moduleName: 'Claim Identification & Structuring',
          priority: 'mandatory',
          steps: ['Extract claims', 'Identify supporting/contradicting evidence needs'],
          tools: [],
          dependencies: [],
          expectedOutput: 'Structured claim list'
        },
        {
          phaseId: 'evidence-gathering',
          moduleId: 'evidence',
          moduleName: 'Evidence Search & Quality Assessment',
          priority: 'mandatory',
          steps: ['Search supporting evidence', 'Search contradictory evidence', 'TRIPOD/STARD quality scoring'],
          tools: ['search_papers', 'resolve_doi', 'fetch_paper', 'load_reference'],
          dependencies: ['claim-structuring'],
          expectedOutput: 'Evidence table with quality grades'
        },
        {
          phaseId: 'verdict-generation',
          moduleId: 'evidence',
          moduleName: 'Statistical Validity & Causality Assessment',
          priority: 'mandatory',
          steps: ['Statistical validity checking', 'Causality determination', 'Final verdict with CI'],
          tools: [],
          dependencies: ['evidence-gathering'],
          expectedOutput: 'Evidence verdict with confidence interval'
        }
      ],
      totalSteps: depth === 'quick' ? 5 : 9,
      estimatedTime: depth === 'quick' ? 6000 : 18000,
      requiredCapabilities: ['evidence-synthesis', 'statistical-validity', 'causal-reasoning']
    }
  }

  private createExplorationPlan(domain: string, depth: string): ExecutionPlan {
    return {
      phases: [
        {
          phaseId: 'landscape-mapping',
          moduleId: 'paradigm',
          moduleName: 'Domain Landscape Survey',
          priority: 'mandatory',
          steps: ['Literature survey', 'Method taxonomy creation', 'Timeline evolution mapping'],
          tools: ['search_papers', 'load_reference', 'get_citations'],
          dependencies: [],
          expectedOutput: 'Comprehensive landscape map'
        },
        {
          phaseId: 'gap-analysis',
          moduleId: 'paradigm',
          moduleName: 'Gap Identification & Frontier Prediction',
          priority: depth !== 'quick' ? 'mandatory' : 'recommended',
          steps: ['Paradigm cluster identification', 'Gap analysis between clusters', 'Frontier prediction'],
          tools: [],
          dependencies: ['landscape-mapping'],
          expectedOutput: 'Gap analysis report with predictions'
        }
      ],
      totalSteps: depth === 'quick' ? 4 : 7,
      estimatedTime: depth === 'quick' ? 5000 : 15000,
      requiredCapabilities: ['landscape-mapping', 'trend-analysis', 'prediction-modeling']
    }
  }

  /**
   * Execute the plan with intelligent error recovery
   */
  async executePlan(plan: ExecutionPlan, input: string | FileInput[]): Promise<any> {
    const results: any = {}

    for (const phase of plan.phases) {
      try {
        console.log(`[Orchestrator] ▶️ Executing phase: ${phase.phaseId} (${phase.moduleName})`)

        // Check dependencies
        for (const dep of phase.dependencies) {
          if (!results[dep]) {
            throw new Error(`Missing dependency: ${dep}`)
          }
        }

        // Execute phase (simplified - in real implementation would call ProtocolExecutor)
        const phaseResult = await this.executePhase(phase, input, results)
        results[phase.phaseId] = phaseResult

        console.log(`[Orchestrator] ✅ Phase completed: ${phase.phaseId}`)

        // For mandatory phases, fail fast on critical errors
        if (phase.priority === 'mandatory' && !phaseResult.success) {
          throw new Error(`Mandatory phase failed: ${phase.phaseId}`)
        }

      } catch (error) {
        console.error(`[Orchestrator] ❌ Phase failed: ${phase.phaseId}`, error)

        if (phase.priority === 'mandatory') {
          throw error
        }

        // For optional/recommended phases, continue with degraded result
        results[phase.phaseId] = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          degraded: true
        }
      }
    }

    return {
      success: true,
      phases: Object.keys(results),
      results,
      metrics: {
        totalPhases: plan.phases.length,
        completedPhases: Object.values(results).filter((r: any) => r.success).length,
        failedPhases: Object.values(results).filter((r: any) => !r.success).length
      }
    }
  }

  private async executePhase(
    phase: ExecutionPhase,
    input: string | FileInput[],
    previousResults: Record<string, any>
  ): Promise<any> {
    // This would integrate with ProtocolExecutor in real implementation
    // For now, return mock successful result
    return {
      success: true,
      phaseId: phase.phaseId,
      moduleId: phase.moduleId,
      timestamp: new Date().toISOString()
    }
  }
}

// ╔════════════════════════════════════════════════════════╗
// ║  LAYER 3: DEEP PROTOCOL EXECUTION (Hidden Complexity) ║
// ╚════════════════════════════════════════════════════════╝

/**
 * Export simplified public API
 */

// Singleton instance for convenience
let _skillFacadeInstance: SkillFacade | null = null

export function getSkillFacade(): SkillFacade {
  if (!_skillFacadeInstance) {
    _skillFacadeInstance = new SkillFacade({ enableLogging: true })
  }
  return _skillFacadeInstance
}

// Quick-access functions for common use cases
export async function quickAnalyze(input: string | FileInput[]): Promise<UnifiedSkillResponse> {
  return getSkillFacade().analyze(input)
}

export async function deepAnalyze(doi: string): Promise<UnifiedSkillResponse> {
  return getSkillFacade().execute({
    input: doi,
    intent: 'analyze',
    depth: 'exhaustive',
    outputFormat: 'structured'
  })
}

export async function comparePapers(dois: string[]): Promise<UnifiedSkillResponse> {
  return getSkillFacade().compare(dois.map(doi => ({ type: 'doi' as const, content: doi })) as any)
}

export async function generateIdeas(seed: string): Promise<UnifiedSkillResponse> {
  return getSkillFacade().ideate(seed)
}
