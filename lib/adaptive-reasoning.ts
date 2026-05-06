// ═══════════════════════════════════════════════════════════
// 🧠 ADAPTIVE REASONING CHAIN ENGINE v2.0
// Auto-selects optimal Skill combination based on paper type & context
// ═══════════════════════════════════════════════════════════

import { detectDomainFromQuery, extractDOIsFromText, getModuleConfig, MODULE_PROTOCOL_BINDINGS } from './skill-engine'

/**
 * Paper Type Classification - Determines optimal analysis strategy
 */
export interface PaperTypeProfile {
  typeId: string
  displayName: string
  characteristics: string[]
  typicalInnovationRange: [string, string]  // [min, max] L-levels
  primaryModules: string[]
  secondaryModules: string[]
  criticalChecks: string[]
  commonPitfalls: string[]
  suggestedDepth: 'quick' | 'standard' | 'deep' | 'exhaustive'
}

const PAPER_TYPE_PROFILES: Record<string, PaperTypeProfile> = {
  // Type 1: Methodological Innovation (New architecture/algorithm)
  method_innovation: {
    typeId: 'method-innovation',
    displayName: 'Methodological Innovation',
    characteristics: [
      'Proposes new algorithm/architecture/loss function',
      'Claims performance improvement over SOTA',
      'Includes ablation studies',
      'Theoretical motivation provided'
    ],
    typicalInnovationRange: ['L2', 'L4'],
    primaryModules: ['decompose', 'compare'],
    secondaryModules: ['reproduce', 'paradigm'],
    criticalChecks: ['FB-5 (Comparison Fairness)', 'FB-7 (Reproduction Path)', 'FB-11 (Sample Size)'],
    commonPitfalls: [
      'Cherry-picked baselines or datasets',
      'Ablation missing critical components',
      'Statistical significance not reported'
    ],
    suggestedDepth: 'deep'
  },
  
  // Type 2: Clinical Validation Study
  clinical_validation: {
    typeId: 'clinical-validation',
    displayName: 'Clinical Validation Study',
    characteristics: [
      'Patient cohort involved',
      'Clinical endpoint(s) measured',
      'Comparison to standard of care',
      'Multi-center or prospective design'
    ],
    typicalInnovationRange: ['L2c', 'L3'],
    primaryModules: ['decompose', 'evidence'],
    secondaryModules: ['compare', 'datasets'],
    criticalChecks: ['FB-1 (Data Availability)', 'FB-4 (Annotation Quality)', 'FB-9 (Demographic Bias)', 'FB-10 (Causal Claims)'],
    commonPitfalls: [
      'Selection bias in patient enrollment',
      'Missing intention-to-treat analysis',
      'Overfitting to single center data'
    ],
    suggestedDepth: 'exhaustive'
  },
  
  // Type 3: Dataset/Benchmark Contribution
  dataset_contribution: {
    typeId: 'dataset-contribution',
    displayName: 'Dataset or Benchmark Contribution',
    characteristics: [
      'Introduces new dataset/collection',
      'Provides benchmark baselines',
      'Includes detailed data statistics',
      'Discusses data collection methodology'
    ],
    typicalInnovationRange: ['L2', 'L2f'],
    primaryModules: ['decompose', 'datasets'],
    secondaryModules: ['reproduce', 'compare'],
    criticalChecks: ['FB-1 (Data Availability)', 'FB-8 (Label Noise)', 'FB-6 (External Validation)'],
    commonPitfalls: [
      'No external validation set held out',
      'Label quality not rigorously validated',
      'Demographic representation unclear'
    ],
    suggestedDepth: 'standard'
  },
  
  // Type 4: Review/Survey Paper
  review_survey: {
    typeId: 'review-survey',
    displayName: 'Review or Survey Paper',
    characteristics: [
      'Synthesizes multiple existing works',
      'Provides taxonomy or classification',
      'Identifies trends and future directions',
      'No new experimental results'
    ],
    typicalInnovationRange: ['L1', 'L2b'],
    primaryModules: ['paradigm', 'explore'],
    secondaryModules: ['compare'],
    criticalChecks: ['FB-5 (Comparison Fairness)', 'Selection bias in papers reviewed'],
    commonPitfalls: [
      'Missing recent important work',
      'Taxonomy not grounded in empirical evidence',
      'Future directions too vague'
    ],
    suggestedDepth: 'quick'
  },
  
  // Type 5: Reproducibility/Code Release
  reproducibility_study: {
    typeId: 'reproducibility-study',
    displayName: 'Reproducibility Study or Code Release',
    characteristics: [
      'Focuses on implementation details',
      'Provides code/docker environment',
      'Benchmarks across implementations',
      'Identifies sources of variance'
    ],
    typicalInnovationRange: ['L2d', 'L3'],
    primaryModules: ['reproduce', 'decompose'],
    secondaryModules: ['compare', 'datasets'],
    criticalChecks: ['FB-2 (Code Availability)', 'FB-7 (Reproduction Path)', 'Environment specification completeness'],
    commonPitfalls: [
      'Missing dependency versions',
      'Hardware requirements underspecified',
      'Random seeds not reported'
    ],
    suggestedDepth: 'standard'
  },
  
  // Type 6: Cross-domain Transfer
  cross_domain_transfer: {
    typeId: 'cross-domain-transfer',
    displayName: 'Cross-Domain Transfer Application',
    characteristics: [
      'Applies method from domain A to domain B',
      'Addresses domain shift challenges',
      'Compares to native domain-B methods',
      'Novel adaptation mechanism proposed'
    ],
    typicalInnovationRange: ['L3', 'L5a'],
    primaryModules: ['decompose', 'darwin'],
    secondaryModules: ['compare', 'paradigm'],
    criticalChecks: ['FB-5 (Comparison Fairness)', 'Domain mismatch in evaluation metrics', 'Transferability assumptions'],
    commonPitfalls: [
      'Unfair comparison to fine-tuned baselines',
      'Negative transfer not investigated',
      'Domain gap underestimated'
    ],
    suggestedDepth: 'exhaustive'
  }
}

/**
 * Adaptive Reasoning Chain Configuration
 */
export interface ReasoningChainConfig {
  paperType: PaperTypeProfile
  intentMode: string
  depthLevel: 'quick' | 'standard' | 'deep' | 'exhaustive'
  
  // Chain definition
  chain: ReasoningStep[]
  
  // Optimization parameters
  parallelExecution: boolean[]
  earlyTerminationConditions: string[]
  fallbackStrategies: Array<{ condition: string; action: string }>
}

interface ReasoningStep {
  stepId: string
  moduleId: string
  operation: string
  inputs: string[]
  outputs: string[]
  dependsOn: string[]
  estimatedComplexity: 'low' | 'medium' | 'high'
  canFailGracefully: boolean
}

/**
 * LAYER 3: Adaptive Reasoning Chain Engine
 * 
 * This is the INTELLIGENCE layer that makes decisions about:
 * 1. What type of paper is this?
 * 2. What's the optimal analysis strategy?
 * 3. Which skills should be applied in what order?
 * 4. When should we stop or pivot?
 * 5. What are the likely pitfalls?
 */
export class AdaptiveReasoningEngine {
  
  /**
   * Analyze input and generate optimal reasoning chain
   */
  analyzeInput(input: string | Array<{type: string; content: string}>): {
    paperType: PaperTypeProfile
    reasoningChain: ReasoningChainConfig
    confidence: number
    rationale: string
  } {
    const text = this.extractText(input)
    
    // Step 1: Classify paper type
    const paperType = this.classifyPaperType(text)
    
    // Step 2: Determine optimal chain based on paper type + context
    const chain = this.buildReasoningChain(paperType)
    
    // Step 3: Calculate confidence in classification
    const confidence = this.calculateClassificationConfidence(text, paperType)
    
    return {
      paperType,
      reasoningChain: chain,
      confidence,
      rationale: `Detected as "${paperType.displayName}" with ${Math.round(confidence * 100)}% confidence. ` +
        `Optimal strategy: ${chain.chain.length}-step ${chain.depthLevel} analysis using ` +
        `[${chain.chain.map(s => s.moduleId).filter((v, i, a) => a.indexOf(v) === i).join(', ')}] modules.`
    }
  }
  
  /**
   * Classify paper type from text content
   */
  private classifyPaperType(text: string): PaperTypeProfile {
    const textLower = text.toLowerCase()
    const scores: Array<{ type: string; score: number }> = []
    
    for (const [typeId, profile] of Object.entries(PAPER_TYPE_PROFILES)) {
      let score = 0
      
      // Check characteristic matches
      for (const char of profile.characteristics) {
        if (this.matchesCharacteristic(textLower, char)) {
          score += 2
        }
      }
      
      // Check for type-specific signals
      switch (typeId) {
        case 'method_innovation':
          if (/new|novel|proposed|architecture|algorithm|loss.function/i.test(textLower)) score += 3
          if (/ablation|state.of.the.art|sota|baseline/i.test(textLower)) score += 2
          break
          
        case 'clinical_validation':
          if (/patient|cohort|clinical|trial|intervention/i.test(textLower)) score += 3
          if (/prospective|retrospective|multi.center|endpoint/i.test(textLower)) score += 2
          if (/auc|sensitivity|specificity|hr|hazard/i.test(textLower)) score += 2
          break
          
        case 'dataset_contribution':
          if (/dataset|benchmark|collection|corpus|database/i.test(textLower)) score += 3
          if (/introduce|release|provide|curate|collect/i.test(textLower)) score += 2
          if (/train.*test|split|fold|partition/i.test(textLower)) score += 1
          break
          
        case 'review_survey':
          if (/review|survey|taxonomy|systematic|meta.analysis/i.test(textLower)) score += 4
          if (/comprehensive|overview|landscape|state.of.the.art/i.test(textLower)) score += 2
          if (!/experiment|result|we.(propose|show)/i.test(textLower)) score += 1
          break
          
        case 'reproducibility_study':
          if (/reproducib|code|implementation|docker|open.source/i.test(textLower)) score += 4
          if (/variance|replicate|environment|setup/i.test(textLower)) score += 2
          if (/github|available|released|provided/i.test(textLower)) score += 2
          break
          
        case 'cross_domain_transfer':
          if (/transfer|cross.domain|adapt|apply.*to|domain.shift/i.test(textLower)) score += 4
          if (/from.*to|adaptation|generalize|domain.*specific/i.test(textLower)) score += 2
          if (/different.*domain|novel.*application/i.test(textLower)) score += 1
          break
      }
      
      scores.push({ type: typeId, score })
    }
    
    // Sort by score and return best match
    scores.sort((a, b) => b.score - a.score)
    const bestMatch = scores[0]
    
    return PAPER_TYPE_PROFILES[bestMatch.type] || PAPER_TYPE_PROFILES.method_innovation
  }
  
  /**
   * Check if text matches a characteristic pattern
   */
  private matchesCharacteristic(text: string, characteristic: string): boolean {
    const keywords = characteristic.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const matchedCount = keywords.filter(kw => text.includes(kw)).length
    
    return matchedCount >= Math.ceil(keywords.length * 0.6)
  }
  
  /**
   * Build optimal reasoning chain for detected paper type
   */
  private buildReasoningChain(paperType: PaperTypeProfile): ReasoningChainConfig {
    const baseChain: ReasoningStep[] = []
    
    // Phase 1: Always start with acquisition and blocking (mandatory gates)
    baseChain.push({
      stepId: 'acquire',
      moduleId: 'decompose',
      operation: 'full-text-acquisition',
      inputs: ['raw-input'],
      outputs: ['paper-content', 'metadata'],
      dependsOn: [],
      estimatedComplexity: 'medium',
      canFailGracefully: true
    })
    
    baseChain.push({
      stepId: 'block',
      moduleId: 'decompose',
      operation: 'fatal-blocker-detection',
      inputs: ['paper-content'],
      outputs: ['blocker-verdict', 'critical-issues'],
      dependsOn: ['acquire'],
      estimatedComplexity: 'low',
      canFailGracefully: false
    })
    
    // Phase 2: Add paper-type-specific steps
    switch (paperType.typeId) {
      case 'method_innovation':
        baseChain.push(
          {
            stepId: 'extract-method',
            moduleId: 'decompose',
            operation: 'method-extraction-detailed',
            inputs: ['paper-content'],
            outputs: ['method-spec', 'architecture-details'],
            dependsOn: ['block'],
            estimatedComplexity: 'high',
            canFailGracefully: false
          },
          {
            stepId: 'assess-novelty',
            moduleId: 'decompose',
            operation: 'innovation-assessment-L1-L5c',
            inputs: ['method-spec', 'blocker-verdict'],
            outputs: ['innovation-level', 'novelty-rationale'],
            dependsOn: ['extract-method', 'block'],
            estimatedComplexity: 'high',
            canFailGracefully: true
          },
          {
            stepId: 'compare-baselines',
            moduleId: 'compare',
            operation: 'fair-comparison-analysis',
            inputs: ['method-spec', 'paper-content'],
            outputs: ['comparison-matrix', 'delta-scores'],
            dependsOn: ['extract-method'],
            estimatedComplexity: 'high',
            canFailGracefully: true
          }
        )
        break
        
      case 'clinical_validation':
        baseChain.push(
          {
            stepId: 'trial-design-check',
            moduleId: 'evidence',
            operation: 'clinical-trial-audit',
            inputs: ['paper-content', 'metadata'],
            outputs: ['trial-quality-score', 'design-flaws'],
            dependsOn: ['block'],
            estimatedComplexity: 'medium',
            canFailGracefully: false
          },
          {
            stepId: 'statistical-validity',
            moduleId: 'evidence',
            operation: 'statistical-rigor-assessment',
            inputs: ['paper-content', 'results-data'],
            outputs: ['validity-verdict', 'ci-width'],
            dependsOn: ['trial-design-check'],
            estimatedComplexity: 'high',
            canFailGracefully: false
          },
          {
            stepId: 'bias-audit',
            moduleId: 'decompose',
            operation: 'demographic-bias-detection',
            inputs: ['paper-content', 'cohort-data'],
            outputs: ['bias-report', 'representation-gaps'],
            dependsOn: ['acquire'],
            estimatedComplexity: 'medium',
            canFailGracefully: true
          }
        )
        break
        
      case 'dataset_contribution':
        baseChain.push(
          {
            stepId: 'data-quality-audit',
            moduleId: 'datasets',
            operation: 'dataset-quality-assessment',
            inputs: ['paper-content', 'data-statistics'],
            outputs: ['quality-score', 'coverage-report'],
            dependsOn: ['block'],
            estimatedComplexity: 'medium',
            canFailGracefully: true
          },
          {
            stepId: 'label-validation',
            moduleId: 'decompose',
            operation: 'annotation-quality-check',
            inputs: ['annotation-protocol', 'inter-rater-agreement'],
            outputs: ['label-quality-score', 'noise-estimate'],
            dependsOn: ['data-quality-audit'],
            estimatedComplexity: 'high',
            canFailGracefully: false
          },
          {
            stepId: 'external-val-check',
            moduleId: 'evidence',
            operation: 'external-validation-status',
            inputs: ['held-out-set-info', 'independent-test-results'],
            outputs: ['generalization-score', 'overfitting-risk'],
            dependsOn: ['data-quality-audit'],
            estimatedComplexity: 'low',
            canFailGracefully: true
          }
        )
        break
        
      case 'review_survey':
        baseChain.push(
          {
            stepId: 'coverage-audit',
            moduleId: 'paradigm',
            operation: 'literature-coverage-check',
            inputs: ['paper-list-reviewed', 'time-range'],
            outputs: ['coverage-gap', 'missing-work-alerts'],
            dependsOn: ['acquire'],
            estimatedComplexity: 'medium',
            canFailGracefully: true
          },
          {
            stepId: 'taxonomy-evaluation',
            moduleId: 'paradigm',
            operation: 'classification-framework-assessment',
            inputs: ['proposed-taxonomy', 'grounding-evidence'],
            outputs: ['taxonomy-coherence', 'empirical-support'],
            dependsOn: ['coverage-audit'],
            estimatedComplexity: 'medium',
            canFailGracefully: true
          }
        )
        break
        
      case 'reproducibility_study':
        baseChain.push(
          {
            stepId: 'env-spec-check',
            moduleId: 'reproduce',
            operation: 'environment-specification-audit',
            inputs: ['code-snippets', 'dependency-list', 'hardware-reqs'],
            outputs: ['spec-completeness', 'ambiguity-count'],
            dependsOn: ['acquire'],
            estimatedComplexity: 'medium',
            canFailGracefully: false
          },
          {
            stepId: 'variance-analysis',
            moduleId: 'compare',
            operation: 'implementation-variance-study',
            inputs: ['reported-results', 'reimplemented-results'],
            outputs: ['variance-magnitude', 'consistency-score'],
            dependsOn: ['env-spec-check'],
            estimatedComplexity: 'high',
            canFailGracefully: true
          }
        )
        break
        
      case 'cross_domain_transfer':
        baseChain.push(
          {
            stepId: 'domain-gap-analysis',
            moduleId: 'darwin',
            operation: 'transferability-assessment',
            inputs: ['source-domain', 'target-domain', 'adaptation-method'],
            outputs: ['gap-severity', 'transfer-feasibility'],
            dependsOn: ['block'],
            estimatedComplexity: 'high',
            canFailGracefully: false
          },
          {
            stepId: 'negative-transfer-check',
            moduleId: 'decompose',
            operation: 'domain-shift-impact-analysis',
            inputs: ['training-dist', 'test-dist', 'performance-drop'],
            outputs: ['nt-risk-score', 'mitigation-strategies'],
            dependsOn: ['domain-gap-analysis'],
            estimatedComplexity: 'high',
            canFailGracefully: true
          },
          {
            stepId: 'innovation-reassessment',
            moduleId: 'darwin',
            operation: 'cross-domain-novelty-scoring',
            inputs: ['original-contribution', 'transferred-application'],
            outputs: ['adjusted-innovation-level', 'domain-impact'],
            dependsOn: ['negative-transfer-check', 'assess-novelty'],
            estimatedComplexity: 'high',
            canFailGracefully: true
          }
        )
        break
    }
    
    // Phase 3: Synthesis and output generation
    baseChain.push({
      stepId: 'synthesize',
      moduleId: paperType.primaryModules[0],
      operation: 'generate-structured-output',
      inputs: [...baseChain.map(s => s.outputs).flat()],
      outputs: ['final-report', 'recommendations'],
      dependsOn: baseChain.map(s => s.stepId),
      estimatedComplexity: 'medium',
      canFailGracefully: false
    })
    
    return {
      paperType,
      intentMode: this.inferIntentMode(paperType),
      depthLevel: paperType.suggestedDepth,
      chain: baseChain,
      parallelExecution: this.identifyParallelizableSteps(baseChain),
      earlyTerminationConditions: this.generateEarlyTerminationConditions(paperType),
      fallbackStrategies: this.generateFallbackStrategies(paperType)
    }
  }
  
  private inferIntentMode(paperType: PaperTypeProfile): string {
    const modeMap: Record<string, string> = {
      'method_innovation': 'EXPERIMENT_REPRODUCE',
      'clinical_validation': 'EVIDENCE_VERIFY',
      'dataset_contribution': 'DATASET_MATCH',
      'review_survey': 'QUICK_READ',
      'reproducibility_study': 'EXPERIMENT_REPRODUCE',
      'cross_domain_transfer': 'RESEARCH_IDEATION'
    }
    return modeMap[paperType.typeId] || 'QUICK_READ'
  }
  
  private identifyParallelizableSteps(chain: ReasoningStep[]): boolean[] {
    // Mark steps that can run in parallel (no dependencies between them)
    const parallelFlags = chain.map(() => false)
    
    for (let i = 0; i < chain.length; i++) {
      for (let j = i + 1; j < chain.length; j++) {
        const stepI = chain[i]
        const stepJ = chain[j]
        
        // If neither depends on the other, they can be parallel
        const iDependsOnJ = stepI.dependsOn.includes(stepJ.stepId)
        const jDependsOnI = stepJ.dependsOn.includes(stepI.stepId)
        
        if (!iDependsOnJ && !jDependsOnI && 
            stepI.estimatedComplexity !== 'high' && 
            stepJ.estimatedComplexity !== 'high') {
          parallelFlags[i] = true
          parallelFlags[j] = true
        }
      }
    }
    
    return parallelFlags
  }
  
  private generateEarlyTerminationConditions(paperType: PaperTypeProfile): string[] {
    const conditions = [
      'CRITICAL blocker detected (any 🔴 FB)',
      'Paper classified as low-value (L1 with no clinical relevance)',
      'Content insufficient for meaningful analysis (<500 chars after extraction)'
    ]
    
    if (paperType.typeId === 'review_survey') {
      conditions.push('Survey coverage < 50% of recent relevant literature')
    }
    
    if (paperType.typeId === 'clinical_validation') {
      conditions.push('Major design flaw making results unreliable')
    }
    
    return conditions
  }
  
  private generateFallbackStrategies(paperType: PaperTypeProfile): Array<{ condition: string; action: string }> {
    return [
      {
        condition: 'Full text not available',
        action: 'Switch to abstract-only mode with reduced confidence'
      },
      {
        condition: 'Domain references not found',
        action: 'Use generic deep-learning-bme reference as fallback'
      },
      {
        condition: 'Multiple module failures',
        action: 'Degrade gracefully to basic decompose with summary only'
      },
      {
        condition: 'Timeout exceeded',
        action: 'Return partial results with completed steps highlighted'
      }
    ]
  }
  
  private calculateClassificationConfidence(text: string, paperType: PaperTypeProfile): number {
    const textLower = text.toLowerCase()
    let matchedCharacteristics = 0
    
    for (const char of paperType.characteristics) {
      if (this.matchesCharacteristic(textLower, char)) {
        matchedCharacteristics++
      }
    }
    
    const baseConfidence = matchedCharacteristics / paperType.characteristics.length
    
    // Boost confidence if strong type-specific signals present
    let signalBoost = 0
    switch (paperType.typeId) {
      case 'method_innovation':
        if (/ablation.*study/i.test(textLower)) signalBoost += 0.15
        if (/figure.*\d+/i.test(textLower) && /table.*\d+/i.test(textLower)) signalBoost += 0.1
        break
      case 'clinical_validation':
        if (/p.*<.*0\.05/i.test(textLower)) signalBoost += 0.2
        if (/n\s*=\s*\d+/i.test(textLower)) signalBoost += 0.1
        break
    }
    
    return Math.min(1, baseConfidence + signalBoost)
  }
  
  private extractText(input: string | Array<{type: string; content: string}>): string {
    if (typeof input === 'string') return input
    return input.map(item => item.content).join('\n')
  }
  
  /**
   * Get all available paper types (for UI display)
   */
  static getAvailablePaperTypes(): PaperTypeProfile[] {
    return Object.values(PAPER_TYPE_PROFILES)
  }
  
  /**
   * Get reasoning chain explanation (for transparency)
   */
  explainChain(chain: ReasoningChainConfig): string {
    const lines = [
      `📋 Adaptive Reasoning Chain for ${chain.paperType.displayName}`,
      ``,
      `🎯 Paper Type: ${chain.paperType.displayName}`,
      `🔢 Expected Innovation Range: ${chain.paperType.typicalInnovationRange[0]} - ${chain.paperType.typicalInnovationRange[1]}`,
      `📊 Analysis Depth: ${chain.depthLevel.toUpperCase()}`,
      ``,
      `⛓️ Execution Plan (${chain.chain.length} steps):`,
      ...chain.chain.map((step, i) => 
        `${i + 1}. [${step.moduleId}] ${step.operation} (${step.estimatedComplexity} complexity)`
      ),
      ``,
      `✅ Parallel Execution: ${chain.parallelExecution.filter(Boolean).length} steps can run concurrently`,
      `⚠️ Early Termination: Enabled on ${chain.earlyTerminationConditions.length} conditions`,
      `🔄 Fallback Strategies: ${chain.fallbackStrategies.length} degradation paths available`
    ]
    
    return lines.join('\n')
  }
}

// ═══════════════════════════════════════════════════════════
// KNOWLEDGE GRAPH INFERENCE LAYER (Hidden Complexity)
// ═══════════════════════════════════════════════════════════

/**
 * Knowledge Graph Node - Represents a concept/entity in the knowledge graph
 */
interface KnowledgeNode {
  id: string
  label: string
  type: 'concept' | 'method' | 'dataset' | 'domain' | 'paper' | 'tool' | 'metric'
  properties: Record<string, unknown>
  connections: string[]  // IDs of connected nodes
  embedding?: number[]  // Semantic embedding vector (would be computed)
}

/**
 * Inference Rule - Defines how implicit knowledge is derived
 */
interface InferenceRule {
  id: string
  name: string
  triggerPattern: RegExp
  sourceNodes: string[]
  targetNodes: string[]
  inferenceType: 'implication' | 'contradiction' | 'specialization' | 'causality' | 'similarity'
  confidence: number  // 0-1
  evidenceRequired: string[]
  generatedInsight: string
}

/**
 * Pre-defined inference rules capturing BME domain expertise
 */
const DOMAIN_INFERENCE_RULES: InferenceRule[] = [
  {
    id: 'IR-ECG-DL-METHOD',
    name: 'ECG → Deep Learning Method Mapping',
    triggerPattern: /ecg.*(classification|arrhythmia|detection|diagnosis)/i,
    sourceNodes: ['ecg-domain', 'signal-processing'],
    targetNodes: ['cnn-architectures', 'transformer-models', 'attention-mechanisms'],
    inferenceType: 'specialization',
    confidence: 0.85,
    evidenceRequired: ['model-architecture', 'input-representation'],
    generatedInsight: 'For ECG tasks, 1D-CNN with residual connections typically outperforms vanilla transformers due to local pattern preservation. Consider multi-scale feature fusion.'
  },
  {
    id: 'IR-IMAGING-CLINICAL-GAP',
    name: 'Medical Imaging → Clinical Validation Gap',
    triggerPattern: /(ct|mri|x.ray|ultrasound).*?(accuracy|auc|sensitivity)/i,
    sourceNodes: ['medical-imaging', 'deep-learning'],
    targetNodes: ['clinical-trial-design', 'external-validation', 'regulatory-pathways'],
    inferenceType: 'implication',
    confidence: 0.9,
    evidenceRequired: ['validation-cohort-size', 'multi-site-status'],
    generatedInsight: 'High accuracy on internal test sets often drops 10-20% on external validation due to domain shift. FDA submission requires V4+ (Multi-site) validation level.'
  },
  {
    id: 'IR-SAMPLE-COMPLEXITY-MISMATCH',
    name: 'Model Complexity vs Sample Size Mismatch Detection',
    triggerPattern: /(parameters|layers|features).*?>(sample|patient|instance).*?(million|k\b)/i,
    sourceNodes: ['model-architecture', 'dataset-statistics'],
    targetNodes: ['fb-11-sample-size', 'overfitting-indicators', 'regularization-needs'],
    inferenceType: 'causality',
    confidence: 0.88,
    evidenceRequired: ['parameter-count', 'sample-size', 'training-loss-curve'],
    generatedInsight: 'Potential overfitting risk: models with >1M parameters on <10K samples require strong regularization (dropout>0.5, weight decay>1e-4) or data augmentation. Expected generalization gap: 15-30%.'
  },
  {
    id: 'IR-GENOMICS-INTEGRATION-PATTERN',
    name: 'Genomics Multi-Omics Integration Pattern',
    triggerPattern: /(genomics|transcriptomics|epigenomics).*(integration|fusion|combine|multi.omics)/i,
    sourceNodes: ['genomics-domain', 'data-integration'],
    targetNodes: ['network-pharmacology', 'pathway-analysis', 'causal-inference'],
    inferenceType: 'specialization',
    confidence: 0.82,
    evidenceRequired: ['omics-types', 'integration-method', 'biological-validation'],
    generatedInsight: 'Multi-omics integration requires careful attention to batch effect correction and confounding. Late integration (after modality-specific encoders) generally outperforms early integration for heterogeneous data types.'
  },
  {
    id: 'IR-NLP-CLINICAL-NER-QUALITY',
    name: 'Clinical NLP → NER Quality Implication',
    triggerPattern: /(named.entity.recognition|ner|clinical.text|mining).*?(f1|precision|recall)/i,
    sourceNodes: ['clinical-nlp', 'entity-recognition'],
    targetNodes: ['annotation-quality', 'inter-rater-agreement', 'error-analysis'],
    inferenceType: 'implication',
    confidence: 0.87,
    evidenceRequired: ['ner-schema', 'annotator-expertise', 'gold-standard-source'],
    generatedInsight: 'F1 scores >0.90 on clinical NER often hide entity-level inconsistencies (e.g., "severe" vs "critical" stenosis). Always check confusion matrix for high-stakes error patterns. Specialist annotator agreement (kappa>0.8) required for reliable training labels.'
  }
]

/**
 * LAYER 4: Knowledge Graph Inference Engine
 * 
 * This provides the HIDDEN COMPETITIVE MOAT:
 * - Implicit knowledge discovery beyond explicit reference content
 * - Domain expert reasoning patterns encoded as inference rules
 * - Cross-reference synthesis that no other tool does automatically
 */
export class KnowledgeGraphInferenceEngine {
  private rules: InferenceRule[]
  private activatedRules: Map<string, {
    rule: InferenceRule
    context: string
    confidence: number
    timestamp: Date
  }>
  
  constructor() {
    this.rules = DOMAIN_INFERENCE_RULES
    this.activatedRules = new Map()
  }
  
  /**
   * Run inference on paper content to discover implicit insights
   */
  inferImplicitKnowledge(content: string, context?: {
    paperType?: string
    domain?: string
    module?: string
  }): Array<{
    ruleId: string
    insight: string
    confidence: number
    category: string
    requiresVerification: boolean
    suggestedActions: string[]
  }> {
    const insights: Array<{
      ruleId: string
      insight: string
      confidence: number
      category: string
      requiresVerification: boolean
      suggestedActions: string[]
    }> = []
    
    for (const rule of this.rules) {
      if (rule.triggerPattern.test(content)) {
        const adjustedConfidence = this.adjustConfidence(rule, content, context)
        
        if (adjustedConfidence > 0.5) {  // Only include medium-high confidence inferences
          insights.push({
            ruleId: rule.id,
            insight: rule.generatedInsight,
            confidence: adjustedConfidence,
            category: rule.inferenceType,
            requiresVerification: rule.confidence < 0.85,
            suggestedActions: this.generateVerificationActions(rule)
          })
          
          this.activatedRules.set(rule.id, {
            rule,
            context: content.slice(0, 200),
            confidence: adjustedConfidence,
            timestamp: new Date()
          })
        }
      }
    }
    
    // Sort by confidence (highest first)
    insights.sort((a, b) => b.confidence - a.confidence)
    
    return insights
  }
  
  /**
   * Adjust confidence based on context factors
   */
  private adjustConfidence(
    rule: InferenceRule, 
    content: string, 
    context?: { paperType?: string; domain?: string; module?: string }
  ): number {
    let confidence = rule.confidence
    
    // Boost if specific evidence mentioned
    for (const evidence of rule.evidenceRequired) {
      if (content.toLowerCase().includes(evidence.toLowerCase())) {
        confidence += 0.05
      } else {
        confidence -= 0.08  // Penalty for missing evidence
      }
    }
    
    // Adjust based on paper type
    if (context?.paperType) {
      switch (context.paperType) {
        case 'clinical_validation':
          if (rule.id.includes('CLINICAL')) confidence += 0.1
          break
        case 'method_innovation':
          if (rule.id.includes('COMPLEXITY') || rule.id.includes('DL-METHOD')) confidence += 0.08
          break
      }
    }
    
    return Math.max(0, Math.min(1, confidence))
  }
  
  /**
   * Generate verification actions for an activated inference
   */
  private generateVerificationActions(rule: InferenceRule): string[] {
    const actions: string[] = []
    
    actions.push(`Check ${rule.evidenceRequired.join(', ')}`)
    
    if (rule.inferenceType === 'causality') {
      actions.push('Run sensitivity analysis on key assumption')
      actions.push('Consider counterfactual scenario')
    }
    
    if (rule.inferenceType === 'implication') {
      actions.push('Validate with external independent study')
      actions.push('Check for confirmation bias')
    }
    
    if (rule.confidence < 0.85) {
      actions.push('This inference has moderate confidence - seek additional evidence')
    }
    
    return actions
  }
  
  /**
   * Get summary of activated inferences (for metadata/debugging)
   */  
  getActivatedRulesSummary(): Array<{
    ruleId: string
    ruleName: string
    confidence: number
    timestamp: Date
  }> {
    return Array.from(this.activatedRules.entries()).map(([id, data]) => ({
      ruleId: id,
      ruleName: data.rule.name,
      confidence: data.confidence,
      timestamp: data.timestamp
    }))
  }
  
  /**
   * Clear activated rules (for new session)
   */
  clearSession(): void {
    this.activatedRules.clear()
  }
}

// Export singleton instances for convenience
export const adaptiveReasoningEngine = new AdaptiveReasoningEngine()
export const knowledgeGraphEngine = new KnowledgeGraphInferenceEngine()

// Quick-access functions
export function analyzeWithAdaptiveReasoning(input: string | Array<{type: string; content: string}>) {
  return adaptiveReasoningEngine.analyzeInput(input)
}

export function inferKnowledgeFromContent(content: string, context?: {
  paperType?: string
  domain?: string
  module?: string
}) {
  return knowledgeGraphEngine.inferImplicitKnowledge(content, context)
}
