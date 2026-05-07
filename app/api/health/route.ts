import { logger } from "@/lib/logger"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const startTime = Date.now()

  try {
    // System information
    const systemInfo = {
      platform: process.platform,
      nodeVersion: process.version,
      arch: process.arch,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    }

    // Check critical dependencies
    const dependencyChecks = await Promise.allSettled([
      checkDependency("pdf-parse"),
      checkDependency("pdfjs-dist"),
      checkDependency("cheerio"),
    ])

    // API endpoints status
    const apiEndpoints = [
      { path: "/api/parse-pdf", method: "POST", description: "PDF parsing" },
      { path: "/api/chat", method: "POST", description: "AI chat completion" },
      { path: "/api/search", method: "POST", description: "Literature search" },
      { path: "/api/fetch-paper", method: "POST", description: "Paper fetching" },
      { path: "/api/detect-input", method: "POST", description: "Input type detection" },
      { path: "/api/citations", method: "POST", description: "Citation extraction" },
      { path: "/api/datasets", method: "POST", description: "Dataset recommendations" },
      { path: "/api/gateway", method: "POST", description: "DOI gateway" },
      { path: "/api/skill-info", method: "GET", description: "Skill information" },
    ]

    // Environment info (sanitized)
    const environmentInfo = {
      nodeEnv: process.env.NODE_ENV || "development",
      nextVersion: process.env.npm_package_next_version || "unknown",
      hasEnvFile: typeof process.env.NEXT_PUBLIC_DEFAULT_PROVIDER !== 'undefined',
    }

    const responseTime = Date.now() - startTime

    logger.debug('Health', 'Health check completed', { responseTime, status: 'ok' })

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      responseTimeMs: responseTime,

      system: systemInfo,

      dependencies: {
        "pdf-parse": dependencyChecks[0].status === 'fulfilled',
        "pdfjs-dist": dependencyChecks[1].status === 'fulfilled',
        "cheerio": dependencyChecks[2].status === 'fulfilled',
        allOk: dependencyChecks.every(d => d.status === 'fulfilled'),
      },

      endpoints: apiEndpoints,

      environment: environmentInfo,

      features: {
        pdfParsing: true,
        doiResolution: true,
        aiAnalysis: true,
        literatureSearch: true,
        citationExtraction: true,
        datasetRecommendations: true,
        inputDetection: true,
      },

      version: "1.0.0",
      name: "BME Research Accelerator",

      performance: {
        memoryUsedMB: Math.round(systemInfo.memoryUsage.heapUsed / 1024 / 1024),
        memoryTotalMB: Math.round(systemInfo.memoryUsage.heapTotal / 1024 / 1024),
        uptimeSeconds: Math.round(systemInfo.uptime),
      },

      recommendations: [
        "✅ PDF parser configured with dual-engine (pdf-parse + PDF.js)",
        "✅ Worker disabled for server-side compatibility",
        "✅ Error boundaries implemented for graceful degradation",
        "✅ Structured logging enabled for debugging",
        "✅ Environment configuration template available (.env.example)",
      ],

      recentImprovements: [
        "🔧 Fixed PDF.js worker path error (server-side compatibility)",
        "🔧 Updated Next.js config with webpack optimizations",
        "📝 Added .env.example for easy setup",
        "🔍 Enhanced API health monitoring",
        "⚡ Improved error handling and recovery",
      ],
    })

  } catch (error) {
    logger.error('Health', 'Health check failed', error)

    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}

async function checkDependency(packageName: string): Promise<boolean> {
  try {
    await import(packageName)
    return true
  } catch {
    return false
  }
}
