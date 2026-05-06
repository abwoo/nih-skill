import { NextResponse } from "next/server";

export async function GET() {
  const results: Record<string, { status: number | string; count?: number; ids?: string[]; sample?: string[]; error?: string | null }> = {}
  const startTime = Date.now()

  // Test 1: PubMed
  try {
    console.log("[diagnostic] Testing PubMed...")
    const pubmedUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=deep+learning+ECG&retmax=5&retmode=json"
    const pubmedRes = await fetch(pubmedUrl, { signal: AbortSignal.timeout(10000) })
    const pubmedData = await pubmedRes.json()
    results["PubMed"] = {
      status: pubmedRes.status,
      count: pubmedData.esearchresult?.count || 0,
      ids: (pubmedData.esearchresult?.idlist || []).slice(0, 3),
      error: null
    }
    console.log("[diagnostic] PubMed OK:", pubmedData.esearchresult?.count, "results found")
  } catch (e) {
    results["PubMed"] = { status: "ERROR", count: 0, error: e instanceof Error ? e.message : String(e) }
    console.log("[diagnostic] PubMed FAILED:", e instanceof Error ? e.message : String(e))
  }

  // Test 2: Semantic Scholar
  try {
    console.log("[diagnostic] Testing Semantic Scholar...")
    const ssUrl = "https://api.semanticscholar.org/graph/v1/paper/search?query=deep+learning+ECG&limit=5&fields=title"
    const ssRes = await fetch(ssUrl, {
      headers: { "User-Agent": "BME-Research-Accelerator/1.0" },
      signal: AbortSignal.timeout(10000)
    })
    const ssData = await ssRes.json()
    results["Semantic Scholar"] = {
      status: ssRes.status,
      count: ssData.total || 0,
      sample: (ssData.data || []).slice(0, 2).map((p: any) => p.title),
      error: null
    }
    console.log("[diagnostic] Semantic Scholar OK:", ssData.total || 0, "results found")
  } catch (e) {
    results["Semantic Scholar"] = { status: "ERROR", count: 0, error: e instanceof Error ? e.message : String(e) }
    console.log("[diagnostic] Semantic Scholar FAILED:", e instanceof Error ? e.message : String(e))
  }

  // Test 3: OpenAlex
  try {
    console.log("[diagnostic] Testing OpenAlex...")
    const oaUrl = "https://api.openalex.org/works?search=deep+learning+ECG&per_page=5&select=title"
    const oaRes = await fetch(oaUrl, {
      headers: { "User-Agent": "BME-Research-Accelerator/1.0" },
      signal: AbortSignal.timeout(15000)
    })
    const oaData = await oaRes.json()
    results["OpenAlex"] = {
      status: oaRes.status,
      count: oaData.meta?.result_count || 0,
      sample: (oaData.results || []).slice(0, 2).map((p: any) => p.title),
      error: null
    }
    console.log("[diagnostic] OpenAlex OK:", oaData.meta?.result_count || 0, "results found")
  } catch (e) {
    results["OpenAlex"] = { status: "ERROR", count: 0, error: e instanceof Error ? e.message : String(e) }
    console.log("[diagnostic] OpenAlex FAILED:", e instanceof Error ? e.message : String(e))
  }

  // Test 4: arXiv
  try {
    console.log("[diagnostic] Testing arXiv...")
    const arxivUrl = "http://export.arxiv.org/api/query?search_query=all:deep+learning+ECG&max_results=5"
    const arxivRes = await fetch(arxivUrl, { signal: AbortSignal.timeout(15000) })
    const arxivText = await arxivRes.text()

    // Count entries
    const entryCount = (arxivText.match(/<entry>/g) || []).length
    const titles = [...arxivText.matchAll(/<title>([\s\S]*?)<\/title>/g)].slice(0, 2).map(m => m[1].replace(/<[^>]+>/g, ""))

    results["arXiv"] = {
      status: arxivRes.status,
      count: entryCount,
      sample: titles,
      error: null
    }
    console.log("[diagnostic] arXiv OK:", entryCount, "results found")
  } catch (e) {
    results["arXiv"] = { status: "ERROR", count: 0, error: e instanceof Error ? e.message : String(e) }
    console.log("[diagnostic] arXiv FAILED:", e instanceof Error ? e.message : String(e))
  }

  // Test 5: Crossref
  try {
    console.log("[diagnostic] Testing Crossref...")
    const crUrl = "https://api.crossref.org/works?query=deep+learning+ECG&rows=5&select=DOI,title"
    const crRes = await fetch(crUrl, {
      headers: { "User-Agent": "BME-Research-Accelerator/1.0 (mailto:bme-research@example.com)" },
      signal: AbortSignal.timeout(15000)
    })
    const crData = await crRes.json()
    results["Crossref"] = {
      status: crRes.status,
      count: crData.message?.["total-results"] || 0,
      sample: (crData.message?.items || []).slice(0, 2).map((p: any) => p.title?.[0]),
      error: null
    }
    console.log("[diagnostic] Crossref OK:", crData.message?.["total-results"] || 0, "results found")
  } catch (e) {
    results["Crossref"] = { status: "ERROR", count: 0, error: e instanceof Error ? e.message : String(e) }
    console.log("[diagnostic] Crossref FAILED:", e instanceof Error ? e.message : String(e))
  }

  const totalTime = Date.now() - startTime

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    totalTimeMs: totalTime,
    query: "deep learning ECG",
    results,
    summary: Object.entries(results).map(([name, data]: [string, any]) => ({
      source: name,
      success: data.status !== "ERROR",
      resultCount: data.count,
      error: data.error
    }))
  })
}
