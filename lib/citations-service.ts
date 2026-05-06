export type CitationEntry = {
  title: string
  authors: string
  year: number | string
  doi: string
  citationCount?: number
  url: string
  abstract?: string
  venue?: string
  isInfluential?: boolean
}

async function getSemanticScholarCitations(
  doi: string,
  direction: "citations" | "references",
  limit: number,
): Promise<{ results: CitationEntry[]; paperTitle?: string }> {
  let paperTitle = ""

  try {
    const paperRes = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(doi)}?fields=title`,
      { headers: { "User-Agent": "BioMedResearchAgent/1.0" } },
    )
    if (paperRes.ok) {
      const paperData = await paperRes.json()
      paperTitle = paperData.title || ""
    }
  } catch {}

  const endpoint = direction === "citations" ? "citations" : "references"
  const url = `https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(doi)}/${endpoint}?limit=${limit}&fields=title,authors,year,externalIds,citationCount,abstract,venue,url,isInfluential`

  const res = await fetch(url, { headers: { "User-Agent": "BioMedResearchAgent/1.0" } })
  if (!res.ok) return { results: [], paperTitle }

  const data = await res.json()
  const items = data.data || []

  const results: CitationEntry[] = items
    .map((item: Record<string, unknown>) => {
      const paper = (direction === "citations" ? item.citingPaper : item.citedPaper) as Record<string, unknown> | undefined
      if (!paper) return null

      return {
        title: paper.title || "",
        authors: (paper.authors as Array<Record<string, string>>)?.map((a) => a.name).join(", ") || "",
        year: paper.year || "",
        doi: (paper.externalIds as Record<string, string>)?.DOI || "",
        citationCount: paper.citationCount || 0,
        url: paper.url || "",
        abstract: paper.abstract || "",
        venue: paper.venue || "",
        isInfluential: item.isInfluential || false,
      }
    })
    .filter(Boolean) as CitationEntry[]

  return { results, paperTitle }
}

async function getOpenAlexCitations(
  doi: string,
  direction: "citations" | "references",
  limit: number,
): Promise<{ results: CitationEntry[]; paperTitle?: string }> {
  const doiUrl = `https://api.openalex.org/works/doi:${encodeURIComponent(doi)}`
  const paperRes = await fetch(doiUrl, { headers: { "User-Agent": "BioMedResearchAgent/1.0 (mailto:agent@biomed.dev)" } })

  if (!paperRes.ok) return { results: [] }

  const paperData = await paperRes.json()
  const paperTitle = paperData.title || ""

  if (direction === "citations") {
    const citedByUrl = `https://api.openalex.org/works?filter=cites:${paperData.id}&per_page=${limit}&sort=cited_by_count:desc`
    const res = await fetch(citedByUrl, { headers: { "User-Agent": "BioMedResearchAgent/1.0 (mailto:agent@biomed.dev)" } })
    if (!res.ok) return { results: [], paperTitle }

    const data = await res.json()

    return {
      results: (data.results || []).map((w: Record<string, unknown>) => ({
        title: w.title || "",
        authors: (w.authorships as Array<Record<string, unknown>>)?.map((a) => (a.author as Record<string, string>)?.display_name || "").join(", ") || "",
        year: w.publication_year || "",
        doi: (w.doi as string)?.replace("https://doi.org/", "") || "",
        citationCount: w.cited_by_count || 0,
        url: (w.ids as Record<string, string>)?.openalex || "",
        venue: ((w.primary_location as Record<string, unknown>)?.source as Record<string, string>)?.display_name || "",
      })),
      paperTitle,
    }
  }

  const refIds = (paperData.referenced_works as string[]) || []
  const limitedRefIds = refIds.slice(0, limit)
  if (!limitedRefIds.length) return { results: [], paperTitle }

  const refUrl = `https://api.openalex.org/works?filter=openalex:${limitedRefIds.map((id) => id.replace("https://openalex.org/", "")).join("|")}&per_page=${limit}`
  const res = await fetch(refUrl, { headers: { "User-Agent": "BioMedResearchAgent/1.0 (mailto:agent@biomed.dev)" } })
  if (!res.ok) return { results: [], paperTitle }

  const data = await res.json()

  return {
    results: (data.results || []).map((w: Record<string, unknown>) => ({
      title: w.title || "",
      authors: (w.authorships as Array<Record<string, unknown>>)?.map((a) => (a.author as Record<string, string>)?.display_name || "").join(", ") || "",
      year: w.publication_year || "",
      doi: (w.doi as string)?.replace("https://doi.org/", "") || "",
      citationCount: w.cited_by_count || 0,
      url: (w.ids as Record<string, string>)?.openalex || "",
      venue: ((w.primary_location as Record<string, unknown>)?.source as Record<string, string>)?.display_name || "",
    })),
    paperTitle,
  }
}

export async function getCitationsDirect(
  doi: string,
  direction: "citations" | "references" = "citations",
  limit: number = 10,
): Promise<{ success: boolean; doi: string; direction: string; paperTitle: string; count: number; results: CitationEntry[] }> {
  const safeLimit = Math.max(1, Math.min(20, limit))
  const cleanDoi = doi.trim()

  let result
  try {
    result = await getSemanticScholarCitations(cleanDoi, direction, safeLimit)
  } catch {
    result = { results: [] }
  }

  if (result.results.length === 0) {
    try {
      result = await getOpenAlexCitations(cleanDoi, direction, safeLimit)
    } catch {
      result = { results: [] }
    }
  }

  return {
    success: true,
    doi: cleanDoi,
    direction,
    paperTitle: result.paperTitle || "",
    count: result.results.length,
    results: result.results,
  }
}
