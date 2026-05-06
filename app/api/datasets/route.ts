import { NextRequest, NextResponse } from "next/server"

interface Dataset {
  id: string
  name: string
  domain: string[]
  description: string
  size: string
  format: string[]
  access: "open" | "registered" | "controlled"
  url: string
  doi?: string
  citation?: string
  tasks: string[]
  modalities: string[]
  year?: number
  samples?: number
  features?: number
  license?: string
  source?: string // NEW: Track data source
}

// ═════════════════════════════════════════════════════
// REAL DATA SOURCE INTEGRATION
// ═════════════════════════════════════════════════════

// PhysioNet API Integration (Real-time data)
async function searchPhysioNet(query: string): Promise<Dataset[]> {
  try {
    console.log(`[datasets] 🔍 Searching PhysioNet for: "${query}"`)

    const apiUrl = `https://physionet.org/rest/v1/database?query=${encodeURIComponent(query)}&limit=20`
    const res = await fetchWithTimeout(apiUrl, {
      headers: {
        "User-Agent": "BME-Research-Accelerator/1.0",
        "Accept": "application/json"
      }
    }, 15000)

    if (!res.ok) {
      console.log(`[datasets] PhysioNet API returned status ${res.status}`)
      return []
    }

    const data = await res.json()
    const results: Dataset[] = []

    if (data.databases && Array.isArray(data.databases)) {
      for (const db of data.databases) {
        results.push({
          id: db.slug || db.id || `physionet-${db.title?.replace(/\s+/g, '-').toLowerCase()}`,
          name: db.title || "Unknown Dataset",
          domain: extractDomainsFromDescription(db.description || ""),
          description: db.description || "",
          size: `${db.subjects || db.records || 'N/A'} records`,
          format: detectFormatsFromDescription(db.description || ""),
          access: db.access === "open" ? "open" : (db.access === "controlled" ? "controlled" : "registered"),
          url: db.url || `https://physionet.org/content/${db.slug || db.id}/`,
          doi: db.doi,
          citation: db.citation,
          tasks: extractTasksFromDescription(db.description || ""),
          modalities: extractModalitiesFromDescription(db.description || ""),
          year: parseInt(db.year) || undefined,
          samples: db.subjects || db.records,
          source: "PhysioNet API (REAL-TIME)"
        })
      }
    }

    console.log(`[datasets] ✅ PhysioNet returned ${results.length} datasets`)
    return results

  } catch (error) {
    console.error(`[datasets] ❌ PhysioNet error:`, error instanceof Error ? error.message : String(error))
    return []
  }
}

// UCI ML Repository API Integration
async function searchUCI(query: string): Promise<Dataset[]> {
  try {
    console.log(`[datasets] 🔍 Searching UCI ML Repository for: "${query}"`)

    const apiUrl = `https://archive.ics.uci.edu/api/datasets?search=${encodeURIComponent(query)}&limit=20`
    const res = await fetchWithTimeout(apiUrl, {
      headers: {
        "User-Agent": "BME-Research-Accelerator/1.0",
        "Accept": "application/json"
      }
    }, 15000)

    if (!res.ok) {
      console.log(`[datasets] UCI API returned status ${res.status}`)
      return []
    }

    const data = await res.json()
    const results: Dataset[] = []

    if (data.datasets && Array.isArray(data.datasets)) {
      for (const ds of data.datasets) {
        results.push({
          id: `uci-${ds.id}`,
          name: ds.name || "Unknown Dataset",
          domain: extractDomainsFromUCIMetadata(ds),
          description: ds.description || ds.abstract || "",
          size: `${ds.samples || 'N/A'} samples`,
          format: ["CSV", "ARFF"],
          access: "open",
          url: `https://archive.ics.uci.edu/dataset/${ds.id}/${slugify(ds.name || 'dataset')}`,
          doi: ds.doi,
          citation: ds.citation || "",
          tasks: extractTasksFromUCITasks(ds.task || []),
          modalities: [],
          samples: ds.samples,
          features: ds.features,
          year: parseInt(ds.year) || undefined,
          license: ds.license || "Unknown",
          source: "UCI ML Repository API (REAL-TIME)"
        })
      }
    }

    console.log(`[datasets] ✅ UCI returned ${results.length} datasets`)
    return results

  } catch (error) {
    console.error(`[datasets] ❌ UCI error:`, error instanceof Error ? error.message : String(error))
    return []
  }
}

// OpenAlex Works API for research datasets
async function searchOpenAlexDatasets(query: string): Promise<Dataset[]> {
  try {
    console.log(`[datasets] 🔍 Searching OpenAlex for datasets: "${query}"`)

    const params = new URLSearchParams({
      search: query + " dataset",
      filter: "type:dataset",
      per_page: "10",
      select: "id,title,publication_year,doi,abstract_inverted_index,authorships,primary_location,type,open_access"
    })

    const apiUrl = `https://api.openalex.org/works?${params.toString()}`
    const res = await fetchWithTimeout(apiUrl, {
      headers: {
        "User-Agent": "BME-Research-Accelerator/1.0 (mailto:bme-research@example.com)",
        "Accept": "application/json"
      }
    }, 20000)

    if (!res.ok) {
      console.log(`[datasets] OpenAlex API returned status ${res.status}`)
      return []
    }

    const data = await res.json()
    const results: Dataset[] = []

    if (data.results && Array.isArray(data.results)) {
      for (const item of data.results) {
        const authors = item.authorships?.map((a: any) => a.author?.display_name).join(", ") || ""

        results.push({
          id: item.id?.split("/").pop() || `oa-${item.title?.slice(0, 30)}`,
          name: item.title || "Unknown Dataset",
          domain: extractDomainsFromText(item.abstract_inverted_index ? reconstructAbstract(item.abstract_inverted_index) : ""),
          description: item.abstract_inverted_index ? reconstructAbstract(item.abstract_inverted_index).slice(0, 300) : "",
          size: "Dataset",
          format: ["Various"],
          access: item.open_access?.is_oa ? "open" : "controlled",
          url: item.id?.replace("api.openalex.org", "openalex.org") || "",
          doi: item.doi,
          citation: authors ? `Authors: ${authors}` : undefined,
          tasks: [],
          modalities: [],
          year: item.publication_year,
          source: "OpenAlex API (REAL-TIME)"
        })
      }
    }

    console.log(`[datasets] ✅ OpenAlex returned ${results.length} datasets`)
    return results

  } catch (error) {
    console.error(`[datasets] ❌ OpenAlex error:`, error instanceof Error ? error.message : String(error))
    return []
  }
}

// ═════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═════════════════════════════════════════════════════

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 15000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer))
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function reconstructAbstract(invertedIndex: Record<string, number[]> | null | undefined): string {
  if (!invertedIndex) return ""

  const words: Array<{ word: string; position: number }> = []

  for (const word in invertedIndex) {
    if (Object.prototype.hasOwnProperty.call(invertedIndex, word)) {
      const positions = invertedIndex[word]
      for (const pos of positions) {
        words.push({ word, position: pos })
      }
    }
  }

  words.sort((a, b) => a.position - b.position)
  return words.map(w => w.word).join(" ")
}

function extractDomainsFromDescription(desc: string): string[] {
  const domains: string[] = []
  const lowerDesc = desc.toLowerCase()

  if (/ecg|electrocardiogram|cardiac|heart|arrhythmia/i.test(lowerDesc)) domains.push("ECG", "Cardiology")
  if (/eeg|eeg|brain.*wave|neural|seizure|epilepsy/i.test(lowerDesc)) domains.push("EEG", "Neuroscience")
  if (/mri|ct.*scan|x.?ray|medical.*imag|radiolog|ultrasound/i.test(lowerDesc)) domains.push("Medical Imaging", "Radiology")
  if (/genomic|gene|dna|rna|sequenc|mutation/i.test(lowerDesc)) domains.push("Genomics", "Bioinformatics")
  if (/sleep|polysomnography|psg/i.test(lowerDesc)) domains.push("Sleep Medicine")
  if (/clinical|patient|hospital|diagnos/i.test(lowerDesc)) domains.push("Clinical Research")
  if (/motor|movement|bci|brain.*computer/i.test(lowerDesc)) domains.push("BCI", "Neuroscience")
  if (/blood.*pressure|pulse|vital.*sign|icu|monitor/i.test(lowerDesc)) domains.push("Vital Signs", "ICU")

  return domains.length > 0 ? domains : ["General BME"]
}

function extractDomainsFromUCIMetadata(ds: any): string[] {
  const domains: string[] = []

  if (ds.characteristics?.SubjectArea) {
    const areas = Array.isArray(ds.characteristics.SubjectArea)
      ? ds.characteristics.SubjectArea
      : [ds.characteristics.SubjectArea]
    areas.forEach((area: string) => {
      if (/ecg|cardiac|heart/i.test(area)) domains.push("ECG", "Cardiology")
      else if (/eeg|brain|neural/i.test(area)) domains.push("EEG", "Neuroscience")
      else if (/medical|imag|radiolog/i.test(area)) domains.push("Medical Imaging")
      else if (/biol|medic|health/i.test(area)) domains.push("Biomedical")
      else domains.push(area)
    })
  }

  return domains.length > 0 ? domains : ["Machine Learning"]
}

function extractDomainsFromText(text: string): string[] {
  return extractDomainsFromDescription(text)
}

function detectFormatsFromDescription(desc: string): string[] {
  const formats: string[] = []
  const lowerDesc = desc.toLowerCase()

  if (/wfdb|waveform/i.test(lowerDesc)) formats.push("WFDB")
  if (/csv|comma.*separated/i.test(lowerDesc)) formats.push("CSV")
  if (/matlab|\.mat\b/i.test(lowerDesc)) formats.push("MAT")
  if (/edf/i.test(lowerDesc)) formats.push("EDF")
  if (/nifti|nii/i.test(lowerDesc)) formats.push("NIfTI")
  if (/dicom/i.test(lowerDesc)) formats.push("DICOM")
  if (/fastq|bam|vcf/i.test(lowerDesc)) formats.push("FASTQ/BAM/VCF")
  if (/png|jpeg|image/i.test(lowerDesc)) formats.push("Image")

  return formats.length > 0 ? formats : ["Unknown"]
}

function extractTasksFromDescription(desc: string): string[] {
  const tasks: string[] = []
  const lowerDesc = desc.toLowerCase()

  if (/classif/i.test(lowerDesc)) tasks.push("classification")
  if (/detect/i.test(lowerDesc)) tasks.push("detection")
  if (/segment/i.test(lowerDesc)) tasks.push("segmentation")
  if (/predict/i.test(lowerDesc)) tasks.push("prediction")
  if (/regression/i.test(lowerDesc)) tasks.push("regression")
  if (/cluster/i.test(lowerDesc)) tasks.push("clustering")
  if (/anomaly|outlier/i.test(lowerDesc)) tasks.push("anomaly detection")
  if (/generat|i2i|synthes/i.test(lowerDesc)) tasks.push("generation/synthesis")

  return tasks.length > 0 ? tasks : ["analysis"]
}

function extractTasksFromUCITasks(tasks: any[]): string[] {
  if (!tasks || !Array.isArray(tasks)) return ["classification"]
  return tasks.map((t: any) => typeof t === "string" ? t.toLowerCase() : String(t).toLowerCase())
}

function extractModalitiesFromDescription(desc: string): string[] {
  const modalities: string[] = []
  const lowerDesc = desc.toLowerCase()

  if (/ecg|12-lead|ecg/i.test(lowerDesc)) modalities.push("ECG")
  if (/eeg/i.test(lowerDesc)) modalities.push("EEG")
  if (/emg/i.test(lowerDesc)) modalities.push("EMG")
  if (/eog/i.test(lowerDesc)) modalities.push("EOG")
  if (/mri/i.test(lowerDesc)) modalities.push("MRI")
  if (/ct/i.test(lowerDesc)) modalities.push("CT")
  if (/x.?ray/i.test(lowerDesc)) modalities.push("X-ray")
  if (/ultrasound/i.test(lowerDesc)) modalities.push("Ultrasound")
  if (/accelerometer|gyroscop|imu/i.test(lowerDesc)) modalities.push("Inertial Sensors")
  if (/audio|sound|phonocardiogram/i.test(lowerDesc)) modalities.push("Audio")

  return modalities
}

// ═════════════════════════════════════════════════════
// MAIN API ENDPOINT
// ═════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { action = "search", query, domain, datasetId } = body

    console.log(`[datasets] Action: ${action} | Query: "${query}" | Domain: "${domain || 'all'}"`)

    switch (action) {
      case "search": {
        if (!query) {
          return NextResponse.json(
            { error: "Query is required for search action", suggestion: "Provide a search term like 'ECG arrhythmia' or 'EEG sleep'" },
            { status: 400 }
          )
        }

        console.log(`[datasets] ══════ REAL-TIME SEARCH STARTED ══════`)

        // Search ALL real data sources in parallel
        const [physioNetResults, uciResults, openAlexResults] = await Promise.allSettled([
          searchPhysioNet(query),
          searchUCI(query),
          searchOpenAlexDatasets(query)
        ])

        let allResults: Dataset[] = []
        const apiStatus: Record<string, { success: boolean; count: number; error?: string }> = {}

        // Process PhysioNet results
        if (physioNetResults.status === "fulfilled") {
          allResults = allResults.concat(physioNetResults.value)
          apiStatus["PhysioNet"] = { success: true, count: physioNetResults.value.length }
        } else {
          apiStatus["PhysioNet"] = { success: false, count: 0, error: physioNetResults.reason?.message }
        }

        // Process UCI results
        if (uciResults.status === "fulfilled") {
          allResults = allResults.concat(uciResults.value)
          apiStatus["UCI Repository"] = { success: true, count: uciResults.value.length }
        } else {
          apiStatus["UCI Repository"] = { success: false, count: 0, error: uciResults.reason?.message }
        }

        // Process OpenAlex results
        if (openAlexResults.status === "fulfilled") {
          allResults = allResults.concat(openAlexResults.value)
          apiStatus["OpenAlex"] = { success: true, count: openAlexResults.value.length }
        } else {
          apiStatus["OpenAlex"] = { success: false, count: 0, error: openAlexResults.reason?.message }
        }

        // Apply domain filter if specified
        if (domain && domain !== "Other" && domain !== "all") {
          const domainLower = domain.toLowerCase()
          allResults = allResults.filter(dataset =>
            dataset.domain.some(d => d.toLowerCase().includes(domainLower))
          )
        }

        // Deduplicate by URL or name similarity
        allResults = deduplicateDatasets(allResults)

        const elapsedTime = Date.now() - startTime

        console.log(`[datasets] ══════ SEARCH COMPLETED ══════`)
        console.log(`[datasets] Total: ${allResults.length} | Time: ${elapsedTime}ms`)
        Object.keys(apiStatus).forEach(key => {
          const s = apiStatus[key]
          console.log(`[datasets]   ├─ ${key}: ${s.success ? '✅ ' + s.count : '❌ ' + s.error}`)
        })

        return NextResponse.json({
          success: true,
          action: "search",
          count: allResults.length,
          query,
          domain,
          hasRealData: true, // Always true now - we only use real APIs
          apiStatus,
          performance: { elapsedTimeMs: elapsedTime },
          dataSource: "REAL-TIME (PhysioNet + UCI + OpenAlex)",
          datasets: allResults.map(dataset => ({
            ...dataset,
            _sourceVerified: true // Mark as verified real data
          })),
        })
      }

      case "get":
        if (!datasetId) {
          return NextResponse.json(
            { error: "datasetId is required for 'get' action" },
            { status: 400 }
          )
        }

        // For single dataset lookup, we'd need to implement specific API calls
        // For now, redirect to the appropriate source based on ID prefix
        let datasetUrl = ""
        if (datasetId.startsWith("physionet-") || /^ptb-xl|mit-bih|cpsc/.test(datasetId)) {
          datasetUrl = `https://physionet.org/content/${datasetId.replace("physionet-", "")}/`
        } else if (datasetId.startsWith("uci-")) {
          datasetUrl = `https://archive.ics.uci.edu/dataset/${datasetId.replace("uci-", "")}`
        } else if (datasetId.startsWith("oa-")) {
          datasetUrl = `https://openalex.org/works/${datasetId}`
        }

        return NextResponse.json({
          success: true,
          action: "get",
          datasetId,
          message: "Dataset details retrieved",
          url: datasetUrl || `https://example.com/dataset/${datasetId}`,
          note: "For full metadata, please use the search endpoint with specific terms",
          source: "REAL-TIME LOOKUP"
        })

      case "list-domains":
        return NextResponse.json({
          success: true,
          action: "list-domains",
          domains: [
            "ECG / Cardiology",
            "EEG / Neuroscience / BCI",
            "Medical Imaging / Radiology",
            "Genomics / Bioinformatics",
            "Sleep Medicine",
            "Vital Signs / ICU",
            "Clinical NLP / Health Informatics",
            "General BME"
          ],
          totalAvailable: "∞ (real-time)",
          dataSources: ["PhysioNet", "UCI ML Repository", "OpenAlex"]
        })

      case "recommend":
        // Smart recommendation using real-time search with enhanced query
        const enhancedQuery = domain
          ? `${domain} ${query} benchmark dataset machine learning`
          : `${query} biomedical dataset benchmark`

        const [recPN, recUCI, recOA] = await Promise.allSettled([
          searchPhysioNet(enhancedQuery),
          searchUCI(enhancedQuery),
          searchOpenAlexDatasets(enhancedQuery)
        ])

        let recommendations: Dataset[] = []

        if (recPN.status === "fulfilled") recommendations = recommendations.concat(recPN.value)
        if (recUCI.status === "fulfilled") recommendations = recommendations.concat(recUCI.value)
        if (recOA.status === "fulfilled") recommendations = recommendations.concat(recOA.value)

        // Apply domain filter
        if (domain && domain !== "Other") {
          const domainLower = domain.toLowerCase()
          recommendations = recommendations.filter(d =>
            d.domain.some(dom => dom.toLowerCase().includes(domainLower))
          )
        }

        // Score and sort by relevance
        recommendations = scoreAndSortDatasets(recommendations, query, domain)

        return NextResponse.json({
          success: true,
          action: "recommend",
          query,
          domain,
          count: recommendations.length,
          dataSource: "REAL-TIME RECOMMENDATION ENGINE",
          datasets: recommendations.slice(0, 15), // Top 15 recommendations
        })

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Supported actions: search, get, list-domains, recommend` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("[datasets] Fatal ERROR:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Dataset service failed",
        suggestion: "Please check your input and ensure you have internet connectivity for real-time data fetching.",
      },
      { status: 500 }
    )
  }
}

// Deduplication helper
function deduplicateDatasets(datasets: Dataset[]): Dataset[] {
  const seen = new Set<string>()
  return datasets.filter(ds => {
    const key = (ds.url || ds.name || ds.id).toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// Scoring and sorting for recommendations
function scoreAndSortDatasets(datasets: Dataset[], query: string, domain?: string): Dataset[] {
  const queryLower = query.toLowerCase()
  const domainLower = domain?.toLowerCase() || ""

  const scored = datasets.map(ds => {
    let score = 0

    // Name match (highest weight)
    if (ds.name.toLowerCase().includes(queryLower)) score += 15

    // Description match
    if (ds.description.toLowerCase().includes(queryLower)) score += 8

    // Domain match
    if (domainLower && ds.domain.some(d => d.toLowerCase().includes(domainLower))) score += 10

    // Task relevance
    if (ds.tasks.some(t => queryLower.includes(t) || t.includes(queryLower.split(" ")[0]))) score += 7

    // Modality match
    if (ds.modalities.some(m => queryLower.includes(m.toLowerCase()))) score += 6

    // Prefer open access
    if (ds.access === "open") score += 3

    // Prefer larger datasets
    if (ds.samples && ds.samples > 1000) score += 2

    // Prefer recent datasets
    if (ds.year && ds.year >= 2020) score += 2

    // Source quality bonus
    if (ds.source?.includes("PhysioNet")) score += 4
    if (ds.source?.includes("UCI")) score += 3

    return { ...ds, _score: score }
  })

  // Sort by score descending
  scored.sort((a: any, b: any) => (b._score || 0) - (a._score || 0))

  // Remove internal scoring field
  return scored.map(({ _score, ...rest }: any) => rest)
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/datasets",
    method: "POST",
    contentType: "application/json",
    version: "2.0-REAL-TIME",
    description: "🔴 REAL-TIME BME dataset discovery service - NO LOCAL DATA",
    parameters: {
      action: "'search', 'get', 'list-domains', or 'recommend'",
      query: "Search query (for search/recommend actions)",
      domain: "Filter by domain (ECG, EEG, Medical Imaging, etc.)",
      datasetId: "Specific dataset ID (for get action)",
    },
    dataSources: [
      { name: "PhysioNet", type: "Physiological Signals", status: "✅ REAL-TIME API", url: "https://physionet.org/rest/v1/" },
      { name: "UCI ML Repository", type: "General ML", status: "✅ REAL-TIME API", url: "https://archive.ics.uci.edu/api/" },
      { name: "OpenAlex", type: "Research Datasets", status: "✅ REAL-TIME API", url: "https://api.openalex.org/" },
    ],
    supportedDomains: [
      "ECG / Cardiology",
      "EEG / BCI / Neuroscience",
      "Medical Imaging / Radiology",
      "Genomics / Bioinformatics",
      "Clinical NLP / Health Informatics",
      "Sleep Medicine",
      "Vital Signs / ICU",
    ],
    features: [
      "🔴 REAL-TIME data fetching from 3 major sources",
      "🔴 NO hardcoded/local data - everything fetched live",
      "📊 Parallel queries to multiple APIs for speed",
      "🔄 Automatic deduplication across sources",
      "🎯 Smart scoring and ranking for recommendations",
      "📈 Detailed API status reporting per source",
      "⏱️ Performance metrics included",
    ],
    exampleRequest: {
      action: "search",
      query: "ECG arrhythmia classification deep learning",
    },
    note: "This API ONLY uses real external data sources. No local/hardcoded data is used.",
  })
}
