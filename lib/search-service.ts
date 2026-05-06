export type SearchResult = {
  title: string
  authors: string
  year: number | string
  doi: string
  pmid?: string
  pmcid?: string
  abstract: string
  url: string
  source: string
  citationCount?: number
  venue?: string
}

// ✅ Helper function to add NCBI API Key to URL if available
function addNCBIApiKey(url: string): string {
  if (process.env.NCBI_API_KEY && process.env.NCBI_API_KEY.trim() !== "") {
    return url + "&api_key=" + process.env.NCBI_API_KEY.trim()
  }
  return url
}

// ✅ Helper function for fetch with timeout and retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit & { timeout?: number },
  maxRetries: number = 3
): Promise<Response> {
  const timeout = options.timeout || 15000

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timer)

      // Handle rate limiting (429) with exponential backoff
      if (res.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000  // 2s, 4s, 8s
        console.warn(`[search-service] Rate limited (429), retry ${attempt}/${maxRetries} after ${waitTime}ms`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }

      return res
    } catch (error) {
      console.error(`[search-service] Attempt ${attempt} failed:`, error instanceof Error ? error.message : error)
      if (attempt === maxRetries) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))  // 1s, 2s delay
    }
  }

  throw new Error(`All ${maxRetries} attempts failed`)
}

async function searchPubMed(query: string, limit: number): Promise<SearchResult[]> {
  try {
    console.log("[search-service] 🔍 Searching PubMed:", query)

    const searchUrl = addNCBIApiKey(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${limit}&retmode=json&sort=relevance`
    )

    const searchRes = await fetchWithRetry(searchUrl, {
      headers: { "User-Agent": "BioMedResearchAgent/2.0 (Academic Search Tool)" },
      timeout: 20000,
    })

    if (!searchRes.ok) {
      console.error("[search-service] PubMed esearch failed:", searchRes.status)
      return []
    }

    const searchData = await searchRes.json()
    const ids: string[] = searchData.esearchresult?.idlist || []
    console.log(`[search-service] Found ${ids.length} PubMed IDs`)

    if (!ids.length) return []

    // ✅ Fetch details in batches to avoid URL length issues
    const allResults: SearchResult[] = []
    const batchSize = 10

    for (let i = 0; i < ids.length && allResults.length < limit; i += batchSize) {
      const batchIds = ids.slice(i, i + batchSize)
      const summaryUrl = addNCBIApiKey(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${batchIds.join(",")}&rettype=abstract&retmode=xml`
      )

      try {
        const summaryRes = await fetchWithRetry(summaryUrl, {
          headers: { "User-Agent": "BioMedResearchAgent/2.0 (Academic Search Tool)" },
          timeout: 25000,
        })

        if (summaryRes.ok) {
          const xmlText = await summaryRes.text()
          const batchResults = parsePubMedXML(xmlText)
          allResults.push(...batchResults)
        }

        // ✅ Add delay between batches to respect rate limits
        if (i + batchSize < ids.length) {
          await new Promise(resolve => setTimeout(resolve, 350))
        }
      } catch (error) {
        console.error(`[search-service] Failed to fetch batch ${i}:`, error instanceof Error ? error.message : error)
      }
    }

    console.log(`[search-service] ✅ Retrieved ${allResults.length} papers from PubMed`)
    return allResults.slice(0, limit)
  } catch (error) {
    console.error("[search-service] ❌ PubMed search error:", error instanceof Error ? error.message : error)
    return []
  }
}

// ✅ Parse PubMed XML response (consistent with api/search/route.ts implementation)
function parsePubMedXML(xml: string): SearchResult[] {
  const results: SearchResult[] = []
  const articleRegex = /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g

  let match
  while ((match = articleRegex.exec(xml)) !== null) {
    const articleXml = match[1]

    const pmidMatch = articleXml.match(/<PMID[^>]*>(\d+)<\/PMID>/)
    const titleMatch = articleXml.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)
    const abstractMatch = articleXml.match(/<AbstractText>([\s\S]*?)<\/AbstractText>/)
    const doiMatch = articleXml.match(/<ELocationID.*?EIdType="doi"[^>]*>([^<]+)<\/ELocationID>/)
    const yearMatch = articleXml.match(/<PubDate>.*?<Year>(\d+)<\/Year>/)
    const journalMatch = articleXml.match(/<Title>([^<]+)<\/Title>/)

    const authorMatches = [...articleXml.matchAll(/<LastName>([^<]+)<\/LastName>\s*<ForeName>([^<]+)<\/ForeName>/g)]
    const authors = authorMatches.map(m => `${m[2]} ${m[1]}`).join(", ")

    if (titleMatch) {
      results.push({
        title: cleanXMLText(titleMatch[1]),
        authors: authors || "Unknown Authors",
        year: yearMatch ? parseInt(yearMatch[1]) : "",
        doi: doiMatch?.[1] || "",
        pmid: pmidMatch?.[1],
        abstract: abstractMatch ? cleanXMLText(abstractMatch[1]) : "",
        url: pmidMatch ? `https://pubmed.ncbi.nlm.nih.gov/${pmidMatch[1]}/` : "",
        source: "pubmed",
        venue: journalMatch?.[1] || "",
      })
    }
  }

  return results
}

// ✅ Clean XML text helper
function cleanXMLText(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .trim()
}

// ═════════════════════════════════════════════════════
// [已移除] Semantic Scholar Search - 已替换为纯PubMed实现
// 当前版本仅使用 PubMed (NCBI E-utilities) API
// ═════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════
// [已移除] OpenAlex Search - 已替换为纯PubMed实现
// 当前版本仅使用 PubMed (NCBI E-utilities) API
// ═════════════════════════════════════════════════════

function reconstructAbstract(invertedIndex: Record<string, number[]> | null): string {
  if (!invertedIndex) return ""
  const pairs: Array<[string, number]> = []
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) pairs.push([word, pos])
  }
  pairs.sort((a, b) => a[1] - b[1])
  return pairs.map((p) => p[0]).join(" ")
}

export async function searchPapersDirect(
  query: string,
  source: string = "pubmed",
  limit: number = 5,
): Promise<{ success: boolean; query: string; source: string; count: number; results: SearchResult[] }> {
  const safeLimit = Math.max(1, Math.min(20, limit))

  // ✅ 纯PubMed模式: 所有source都使用PubMed
  let actualSource = source
  if (source === "semantic_scholar" || source === "openalex") {
    console.log(`[searchPapersDirect] ⚠️ Source "${source}" redirected to PubMed`)
    actualSource = "pubmed (redirected)"
  }

  const results = await searchPubMed(query, safeLimit)

  return { success: true, query, source: actualSource, count: results.length, results }
}
