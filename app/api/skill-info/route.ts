import * as fs from 'fs'
import { NextRequest, NextResponse } from "next/server"
import * as path from 'path'
import {
  SkillContentFilter,
  skillEncapsulator
} from '../../../lib/skill-security'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  // ════════════════════════════════════════════════════
  // 🔒 SECURITY: Block direct SKILL.md content access
  // ════════════════════════════════════════════════════

  if (action === "skill-content") {
    console.log("[skill-info] 🛡️ BLOCKED: Attempted to access raw SKILL.md content")

    const filteredResult = SkillContentFilter.filterContent('skill-md')

    return NextResponse.json({
      success: true,
      _security: {
        level: filteredResult.securityLevel,
        note: 'Raw content access blocked. Use structured endpoints.',
        timestamp: new Date().toISOString()
      }
    })
  }

  // ════════════════════════════════════════════════════
  // 🔒 SECURITY: Encapsulate reference file access
  // ════════════════════════════════════════════════════

  if (action === "reference") {
    const filename = searchParams.get("file")
    if (!filename) {
      return NextResponse.json({
        success: false,
        error: "Missing 'file' parameter",
        _hint: "Use action=get_metadata for safe access"
      }, { status: 400 })
    }

    const safeName = path.basename(filename)

    try {
      const refPath = path.join(process.cwd(), "references", safeName)

      if (fs.existsSync(refPath)) {
        const rawContent = fs.readFileSync(refPath, "utf-8")
        const filteredResult = SkillContentFilter.filterContent('reference', rawContent)

        console.log(`[skill-info] 🔒 ENCAPSULATED: ${safeName} (${filteredResult.securityLevel})`)

        const dataObj2 = typeof filteredResult.data === 'object' && filteredResult.data !== null ? filteredResult.data as Record<string, any> : {}

        return NextResponse.json(Object.assign({
          success: true,
          filename: safeName,
          _security: {
            originalSize: filteredResult.originalLength,
            filteredSize: filteredResult.filteredLength,
            securityLevel: filteredResult.securityLevel,
            accessMethod: 'encapsulated',
            timestamp: new Date().toISOString()
          },
          _usage: {
            message: 'Reference loaded in encapsulated mode. Full content processed internally by SKILL engine.',
            alternatives: [
              `Use GET /api/skill-info?action=get_metadata&ref=${safeName.replace('.md', '')} for metadata`,
              'Use POST /api/skill-info with action=load_reference for domain-based loading'
            ]
          }
        }, dataObj2))
      } else {
        return NextResponse.json({
          success: false,
          error: `Reference file not found: ${safeName}`,
          availableFiles: getAllReferenceFiles(),
          _suggestion: 'Check filename or use get_metadata endpoint'
        }, { status: 404 })
      }

    } catch (error) {
      return NextResponse.json({
        success: false,
        error: `Failed to process reference: ${safeName}`,
        details: error instanceof Error ? error.message : String(error),
        _security: 'error-handled-safely'
      }, { status: 500 })
    }
  }

  // ════════════════════════════════════════════════════
  // ✅ SAFE: Get metadata for specific reference
  // ════════════════════════════════════════════════════

  if (action === "get_metadata") {
    const refId = searchParams.get("ref")

    if (refId) {
      const encapsulated = skillEncapsulator.getEncapsulatedReference(refId)

      if (encapsulated) {
        return NextResponse.json({
          success: true,
          action: "get_metadata",
          ...encapsulated,
          _security: {
            level: 'PUBLIC',
            contentAccess: 'metadata-only',
            timestamp: new Date().toISOString()
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: `Reference not found: ${refId}`,
          availableIds: Object.keys(skillEncapsulator.getAllReferenceMetadata()),
          _suggestion: 'Check reference ID or use search endpoint'
        }, { status: 404 })
      }
    }
  }

  // ════════════════════════════════════════════════════
  // ✅ SAFE: Search references
  // ════════════════════════════════════════════════════

  if (action === "search") {
    const query = searchParams.get("q") || ""
    const results = skillEncapsulator.searchReferences(query)

    return NextResponse.json({
      success: true,
      action: "search",
      query,
      resultCount: results.length,
      results: results.map(ref => ({
        id: ref.id,
        displayName: ref.displayName,
        category: ref.category,
        description: ref.description.slice(0, 200) + "...",
        keywords: ref.keywords,
        version: ref.version,
        applicableProtocols: ref.applicableProtocols
      })),
      _security: {
        level: 'PUBLIC',
        contentAccess: 'metadata-only'
      }
    })
  }

  // ════════════════════════════════════════════════════
  // ✅ DEFAULT: Return structured skill info (NO raw content)
  // ════════════════════════════════════════════════════

  const allRefs = getAllReferenceFiles()
  const libraryStats = skillEncapsulator.getLibraryStats()

  return NextResponse.json({
    name: "BME Research Accelerator · 生物医学工程研究加速器",
    version: "2.0.0 (Round 81+)",
    description: "AI-powered research acceleration platform for Biomedical Engineering - PDF parsing, DOI resolution, literature analysis, and more",

    _securityNotice: "🔒 All content is encapsulated. Raw Markdown is not accessible via public APIs.",

    coreFramework: {
      automaticReasoningProtocol: {
        steps: [
          "Step 0: Full-Text Paper Acquisition and Deep Learning",
          "Step 1: Literature Intent Recognition",
          "Step 2: Reference Matching (Automatic Brain)",
          "Step 2.5: Paper Type Classification",
          "Step 3: Fatal Blocker Identification (MANDATORY FIRST)",
          "Step 4: Deep Probe Layer (MANDATORY)",
          "Step 5: Adversarial Scientific Checking",
          "Step 6: Reproducibility Extraction",
          "Step 7: Innovation & Frontier Assessment (MANDATORY)",
          "Step 8: Research-Level Synthesis",
        ],
        description: "Multi-step protocol for comprehensive paper analysis",
      },
      coreModules: [
        { id: "decompose", name: "Literature Quick Decomposition", icon: "📄", description: "Analyze a single paper - extract structure, detect fatal blockers, assess innovation level" },
        { id: "compare", name: "Multi-Paper Comparative Analysis", icon: "⚖️", description: "Compare 2-4 papers - method comparison, dataset differences, benchmark gaps" },
        { id: "reproduce", name: "Experiment Reproduction Decomposer", icon: "🔬", description: "Reproduction blueprint - data acquisition, step-by-step guide, difficulty assessment" },
        { id: "paradigm", name: "Paradigm Analysis for Similar Experiments", icon: "🗺️", description: "Map methodological paradigms - identify common patterns, SOTA roadmap" },
        { id: "evidence", name: "Evidence Verification", icon: "✓", description: "Verify evidence strength - supporting/contradictory evidence, cross-reference sources" },
        { id: "datasets", name: "Dataset & Experiment Guidance", icon: "💾", description: "Dataset recommendation, experiment roadmap, preprocessing pipeline" },
      ],
      innovationLevels: ["L1", "L2", "L2b", "L2c", "L2d", "L2e", "L2f", "L3", "L4", "L5a", "L5b", "L5c"],
      fatalBlockers: [
        { id: "FB-1", name: "Data Availability", desc: "Are datasets publicly available?" },
        { id: "FB-2", name: "Code Availability", desc: "Is source code released?" },
        { id: "FB-3", name: "Conflict of Interest", desc: "Any undisclosed conflicts?" },
        { id: "FB-4", name: "Annotation Quality", desc: "Is annotation methodology sound?" },
        { id: "FB-5", name: "Comparison Fairness", desc: "Is comparison fair and comprehensive?" },
        { id: "FB-6", name: "External Validation", desc: "Validated on external datasets?" },
        { id: "FB-7", name: "Reproduction Path", desc: "Can results be independently reproduced?" },
        { id: "FB-8", name: "Label Noise", desc: "Is label noise quantified and addressed?" },
        { id: "FB-9", name: "Demographic Bias", desc: "Is demographic bias assessed?" },
        { id: "FB-10", name: "Causal Claims", desc: "Are causal claims properly supported?" },
        { id: "FB-11", name: "Sample Size vs Complexity", desc: "Is sample size adequate for model complexity?" },
      ],
      clinicalValidationLevels: [
        { id: "V0", name: "No validation", desc: "No experimental or clinical validation" },
        { id: "V1", name: "Internal", desc: "Internal cross-validation only" },
        { id: "V2", name: "External", desc: "Validation on external hold-out dataset" },
        { id: "V3", name: "Multi-site", desc: "Multi-center/multi-site validation" },
        { id: "V4", name: "Prospective", desc: "Prospective clinical trial validation" },
        { id: "V5", name: "RCT", desc: "Randomized Controlled Trial validation" },
      ],
    },

    referenceFiles: allRefs,
    referenceCount: libraryStats.totalReferences,
    totalRefTokens: 125000,

    referenceCategories: libraryStats.categories,

    features: [
      "PDF Parsing & Full-text Extraction",
      "DOI Resolution (CrossRef + Semantic Scholar)",
      "URL Content Fetching",
      "PubMed/arXiv Integration",
      "Smart Input Type Detection",
      "Innovation Level Assessment (L1-L5c)",
      "Fatal Blockers Detection (FB-1 to FB-11)",
      "Clinical Validation Levels (V0-V5)",
      "Citation Analysis",
      "BME Domain-specific Protocols (27 reference files)",
      "Full-Text Paper Deep Learning Protocol",
      "Automatic Reasoning Chain (9-step protocol)",
      "Multi-Agent Research Orchestration",
      "🔒 Content Security & Encapsulation Layer",
    ],

    supportedProviders: ["OpenClaw", "Anthropic Claude", "OpenAI GPT-4o/o3", "Google Gemini", "DeepSeek", "Groq"],

    apiEndpoints: {
      skillInfo: "/api/skill-info",
      skillMetadata: "/api/skill-info?action=get_metadata&ref=<id>",
      searchReferences: "/api/skill-info?action=search&q=<query>",
      chat: "/api/chat",
      parsePdf: "/api/parse-pdf",
      fetchPaper: "/api/fetch-paper",
      search: "/api/search",
      citations: "/api/citations",
      detectInput: "/api/detect-input",
      gateway: "/api/gateway",
      health: "/api/gateway?route=health",
    },

    _securityInfo: {
      contentEncapsulation: "ACTIVE",
      rawMarkdownAccess: "BLOCKED",
      safeEndpoints: [
        "GET /api/skill-info (structured info only)",
        "GET /api/skill-info?action=get_metadata&ref=<id> (reference metadata)",
        "GET /api/skill-info?action=search&q=<query> (search references)",
        "POST /api/skill-info (domain-based loading - encapsulated)"
      ],
      blockedEndpoints: [
        "GET /api/skill-info?action=skill-content (raw SKILL.md blocked)",
        "GET /api/skill-info?action=reference&file=<name> (raw markdown blocked)"
      ],
      version: "SECURITY-LAYER-v1.0"
    },

    loaded: true,
    lastUpdated: new Date().toISOString(),
  })
}

function getAllReferenceFiles(): string[] {
  const refsDir = path.join(process.cwd(), "references")

  try {
    if (!fs.existsSync(refsDir)) {
      console.warn("[skill-info] references directory not found:", refsDir)
      return []
    }

    const files = fs.readdirSync(refsDir)
      .filter(file => file.endsWith(".md"))
      .sort()

    console.log(`[skill-info] Found ${files.length} reference files`)
    return files

  } catch (error) {
    console.error("[skill-info] Error reading references directory:", error)
    return []
  }
}

// Handle POST for dynamic content requests (ENCAPSULATED)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, domain, query } = body

    // ════════════════════════════════════════════════════
    // ✅ SAFE: Load reference by domain (encapsulated output)
    // ════════════════════════════════════════════════════

    if (action === "load_reference" && domain) {
      console.log(`[skill-info] 📚 Loading encapsulated reference for domain: ${domain}`)

      const matchedRefs = skillEncapsulator.getReferencesForDomain(domain, 4)

      const encapsulatedResults = matchedRefs.map(ref =>
        skillEncapsulator.getEncapsulatedReference(ref.id)
      ).filter(Boolean)

      return NextResponse.json({
        success: true,
        action: "load_reference",
        domain,
        loadedReferences: encapsulatedResults!.map(enc => ({
          id: enc!.metadata.id,
          displayName: enc!.metadata.displayName,
          category: enc!.metadata.category,
          summary: enc!.summary,
          keyInsights: enc!.keyInsights.slice(0, 3),
          applicableProtocols: enc!.metadata.applicableProtocols,
          quickStartGuide: enc!.quickStartGuide
        })),
        methodologyGuidance: encapsulatedResults?.find(enc =>
          enc!.metadata.id.includes('methodology') || enc!.metadata.id.includes('synthesis')
        )?.summary || null,
        keyFrameworks: encapsulatedResults?.flatMap(enc => enc!.metadata.keyFrameworks).slice(0, 8) || [],
        applicableChecks: [
          "TRIPOD reporting checklist",
          "STARD diagnostic accuracy",
          "Evidence level grading",
          "FDA/EU AI Act compliance",
          "Reproducibility assessment",
        ],
        message: `Loaded ${encapsulatedResults!.length} encapsulated reference(s) for domain "${domain}"`,
        _security: {
          level: 'PUBLIC',
          contentMode: 'encapsulated-metadata',
          rawContentAccess: 'NOT_AVAILABLE',
          timestamp: new Date().toISOString()
        }
      })
    }

    // ════════════════════════════════════════════════════
    // ✅ SAFE: Batch metadata request (no raw content)
    // ════════════════════════════════════════════════════

    if (action === "batch-references") {
      const allMetadata = skillEncapsulator.getAllReferenceMetadata()

      return NextResponse.json({
        success: true,
        results: allMetadata.map(ref => ({
          id: ref.id,
          displayName: ref.displayName,
          category: ref.category,
          version: ref.version,
          size: ref.size,
          keywords: ref.keywords,
          domains: ref.domains,
          applicableProtocols: ref.applicableProtocols,
          _note: '🔒 Metadata only - Full content requires authenticated internal API calls'
        })),
        totalReferences: allMetadata.length,
        _security: {
          level: 'PUBLIC',
          contentType: 'metadata-only'
        }
      })
    }

    // ════════════════════════════════════════════════════
    // ❌ BLOCKED: Unknown actions
    // ════════════════════════════════════════════════════

    return NextResponse.json({
      success: false,
      error: "Unknown or blocked action",
      availableActions: [
        "load_reference - Domain-based reference loading (encapsulated)",
        "batch-references - Get all reference metadata (safe)"
      ],
      _security: 'request-blocked'
    }, { status: 400 })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Invalid request body",
      details: error instanceof Error ? error.message : String(error),
      _security: 'error-handled-safely'
    }, { status: 400 })
  }
}
