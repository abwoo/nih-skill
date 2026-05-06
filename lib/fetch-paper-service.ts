export type FetchResult = {
  success: boolean
  text: string
  source: string
  title?: string
  authors?: string
  abstract?: string
  fullText?: string
  doi?: string
  pmid?: string
  pmcid?: string
  url?: string
  year?: string | number
  journal?: string
  keywords?: string
  citationCount?: number
  references?: Array<{ title: string; doi: string }>
  error?: string
  suggestion?: string
}

export function detectSourceType(input: string): "doi" | "arxiv" | "pmcid" | "pmid" | "url" | "unknown" {
  const trimmed = input.trim()

  // DOI patterns (more comprehensive)
  if (/^10\.\d{4,9}\/[^\s]+$/i.test(trimmed)) return "doi"
  if (/^doi:\s*10\.\d{4,9}\/[^\s]+$/i.test(trimmed)) return "doi"
  if (/https?:\/\/doi\.org\/(10\..+)$/i.test(trimmed)) return "doi"
  if (/https?:\/\/dx\.doi\.org\/(10\..+)$/i.test(trimmed)) return "doi"

  // arXiv patterns
  if (/https?:\/\/arxiv\.org\/abs\/(\d{4}\.\d{4,5}(v\d+)?)$/i.test(trimmed)) return "arxiv"
  if (/https?:\/\/arxiv\.org\/pdf\/(\d{4}\.\d{4,5}(v\d+)?)$/i.test(trimmed)) return "arxiv"
  if (/^arxiv:\s*\d{4}\.\d{4,5}(v\d+)?$/i.test(trimmed)) return "arxiv"
  if (/^\d{4}\.\d{4,5}(v\d+)?$/i.test(trimmed)) return "arxiv"

  // PMC ID patterns
  if (/^PMC\d+$/i.test(trimmed)) return "pmcid"
  if (/https?:\/\/www\.ncbi\.nlm\.nih\.gov\/pmc\/articles\/(PMC\d+)/i.test(trimmed)) return "pmcid"

  // PMID patterns
  if (/^\d{7,}$/i.test(trimmed)) return "pmid"
  if (/https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/i.test(trimmed)) return "pmid"

  // URL pattern (catch-all)
  if (/^https?:\/\//i.test(trimmed)) return "url"

  return "unknown"
}

function extractDoi(input: string): string {
  const trimmed = input.trim()

  // Extract from DOI URL
  const doiUrlMatch = trimmed.match(/(?:doi\.org|dx\.doi\.org)\/(10\.\d{4,9}\/[^\s]+)/i)
  if (doiUrlMatch) return doiUrlMatch[1].replace(/[.;,]$/, "")

  // Extract from plain DOI or doi: prefix
  const doiMatch = trimmed.match(/10\.\d{4,9}\/[^\s]+/i)
  return doiMatch ? doiMatch[0].replace(/[.;,]$/, "") : trimmed
}

function extractArxivId(input: string): string {
  const trimmed = input.trim()
  const arxivMatch = trimmed.match(/(\d{4}\.\d{4,5}(v\d+)?)/i)
  return arxivMatch ? arxivMatch[1] : trimmed.replace(/^arxiv:\s*/i, "")
}

function extractPmcid(input: string): string {
  const match = input.match(/PMC\d+/i)
  return match ? match[0] : input.trim()
}

function extractPmid(input: string): string {
  const match = input.match(/\d{7,}/)
  return match ? match[0] : input.trim()
}

// Enhanced fetch with timeout and retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  timeoutMs = 30000,
  maxRetries = 3
): Promise<Response> {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined

  const createTimeoutPromise = () => new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(new Error(`Request timeout after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  let lastError: Error | null = null
  let timeoutPromise = createTimeoutPromise()

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (timer) clearTimeout(timer)

      const res = await Promise.race([
        fetch(url, { ...options, signal: controller.signal }),
        timeoutPromise
      ])

      // Handle rate limiting (429)
      if (res.status === 429 && attempt < maxRetries) {
        const retryAfter = res.headers.get('retry-after')
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(1000 * (attempt + 1) * 2, 30000)
        console.warn(`[fetch-paper] Rate limited (${res.status}), retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      // Handle server errors (5xx)
      if (res.status >= 500 && attempt < maxRetries) {
        const delay = 1000 * (attempt + 1)
        console.warn(`[fetch-paper] Server error (${res.status}), retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      return res

    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      if (attempt < maxRetries && lastError.name !== 'AbortError') {
        const delay = 1000 * (attempt + 1)
        console.warn(`[fetch-paper] Request failed: ${lastError.message}, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else if (lastError.name === 'AbortError') {
        throw new Error(`Request to ${url.slice(0, 80)} timed out after ${timeoutMs}ms`)
      }
    } finally {
      if (timer) clearTimeout(timer)
    }
  }

  throw lastError || new Error('Fetch failed after retries')
}

async function fetchByDoi(doi: string): Promise<FetchResult> {
  const cleanDoi = extractDoi(doi)
  console.log(`[fetch-paper] Fetching by DOI: ${cleanDoi}`)

  try {
    const crossRefUrl = `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`
    const crossRefRes = await fetchWithRetry(crossRefUrl, {
      headers: { "User-Agent": "BioMedResearchAgent/1.0 (mailto:agent@biomed.dev)" },
    }, 20000, 3)

    if (!crossRefRes.ok) {
      let errorDetail = `CrossRef lookup failed with status ${crossRefRes.status}`
      if (crossRefRes.status === 404) {
        errorDetail = `DOI not found: ${cleanDoi}. The DOI may be invalid or the paper may not be registered in CrossRef.`
      } else if (crossRefRes.status === 429) {
        errorDetail = `Rate limited by CrossRef API. Please wait a moment and try again.`
      }
      return {
        success: false,
        text: "",
        source: "crossref",
        error: errorDetail,
        suggestion: "Verify the DOI is correct, or try searching for the paper title instead."
      }
    }

    const crossRefData = await crossRefRes.json()
    const item = crossRefData.message

    const title = item.title?.[0] || ""
    const authors = item.author?.map((a: { given?: string; family?: string }) => `${a.given || ""} ${a.family || ""}`.trim()).join(", ") || ""
    const abstract = item.abstract?.replace(/<[^>]+>/g, "").trim() || ""
    const journal = item["container-title"]?.[0] || ""
    const year = item.published?.["date-parts"]?.[0]?.[0] || item.created?.["date-parts"]?.[0]?.[0] || ""
    const url = item.URL || `https://doi.org/${cleanDoi}`
    const keywords = item.subject?.join(", ") || ""

    let fullText = ""
    let citationCount: number | undefined

    if (abstract) {
      fullText += `## Abstract\n${abstract}\n\n`
    }

    // Try Semantic Scholar for citation count and alternative abstract
    try {
      const ssUrl = `https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(cleanDoi)}?fields=citationCount,abstract`
      const ssRes = await fetchWithRetry(ssUrl, {
        headers: { "User-Agent": "BioMedResearchAgent/1.0" },
      }, 10000, 2)
      if (ssRes.ok) {
        const ssData = await ssRes.json()
        citationCount = ssData.citationCount
        if (!abstract && ssData.abstract) {
          fullText += `## Abstract (Semantic Scholar)\n${ssData.abstract}\n\n`
        }
      }
    } catch (ssErr) {
      console.warn(`[fetch-paper] Semantic Scholar lookup failed for DOI ${cleanDoi}:`, ssErr instanceof Error ? ssErr.message : String(ssErr))
    }

    // Try Unpaywall for open access PDF
    try {
      const unpaywallUrl = `https://api.unpaywall.org/v2/${encodeURIComponent(cleanDoi)}?email=agent@biomed.dev`
      const unpaywallRes = await fetchWithRetry(unpaywallUrl, {}, 15000, 2)

      if (unpaywallRes.ok) {
        const unpaywallData = await unpaywallRes.json()
        const bestOa = unpaywallData.best_oa_location

        if (bestOa?.url_for_pdf) {
          try {
            const pdfRes = await fetchWithTimeout(bestOa.url_for_pdf, {
              headers: { "User-Agent": "BioMedResearchAgent/1.0" },
            }, 25000)
            if (pdfRes.ok) {
              const contentType = pdfRes.headers.get("content-type") || ""
              if (contentType.includes("pdf") || bestOa.url_for_pdf.endsWith(".pdf")) {
                const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer())
                if (pdfBuffer.length > 500) {
                  const pdfParse = (await import("pdf-parse")).default
                  const pdfData = await pdfParse(pdfBuffer)
                  if (pdfData.text?.trim()) {
                    fullText += `## Full Text (Open Access PDF)\n${pdfData.text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()}\n\n`
                    console.log(`[fetch-paper] Successfully fetched PDF via Unpaywall for DOI: ${cleanDoi}`)
                  }
                }
              }
            }
          } catch (pdfErr) {
            console.warn(`[fetch-paper] PDF fetch failed for DOI ${cleanDoi}:`, pdfErr instanceof Error ? pdfErr.message : String(pdfErr))
          }
        }

        if (bestOa?.url_for_landing_page && !fullText.includes("Full Text")) {
          fullText += `Open Access URL: ${bestOa.url_for_landing_page}\n`
        }

        if (unpaywallData.is_oa) {
          fullText += `OA Status: ${unpaywallData.oa_status || "open"}\n`
        }
      }
    } catch (upwErr) {
      console.warn(`[fetch-paper] Unpaywall lookup failed for DOI ${cleanDoi}:`, upwErr instanceof Error ? upwErr.message : String(upwErr))
    }

    const text = `Title: ${title}\nAuthors: ${authors}\nJournal: ${journal}\nYear: ${year}\nDOI: ${cleanDoi}\nURL: ${url}${keywords ? `\nKeywords: ${keywords}` : ""}${citationCount != null ? `\nCitations: ${citationCount}` : ""}\n\n${fullText}`.trim()

    console.log(`[fetch-paper] Success - DOI: ${cleanDoi}, Title: "${title}", Has PDF: ${fullText.includes("Full Text")}`)

    return {
      success: true,
      text,
      source: "crossref+unpaywall",
      title,
      authors,
      abstract,
      doi: cleanDoi,
      url,
      year,
      journal,
      keywords,
      citationCount,
    }
  } catch (err) {
    console.error(`[fetch-paper] Fatal error fetching DOI ${cleanDoi}:`, err)
    return {
      success: false,
      text: "",
      source: "crossref",
      error: `Failed to fetch paper: ${err instanceof Error ? err.message : String(err)}`,
      suggestion: "Please check your internet connection and try again. If the problem persists, the service may be temporarily unavailable."
    }
  }
}

// Simple timeout wrapper (no retry)
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 30000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

async function fetchByArxiv(arxivId: string): Promise<FetchResult> {
  const cleanId = extractArxivId(arxivId)
  console.log(`[fetch-paper] Fetching by arXiv ID: ${cleanId}`)
  const apiUrl = `http://export.arxiv.org/api/query?id_list=${encodeURIComponent(cleanId)}&max_results=1`

  try {
    let res = await fetchWithRetry(apiUrl, {
      headers: { "User-Agent": "BioMedResearchAgent/1.0" },
    }, 20000, 3)

    if (!res.ok) {
      return {
        success: false,
        text: "",
        source: "arxiv",
        error: `arXiv API failed with status ${res.status}`,
        suggestion: "The arXiv ID may be invalid or the service is unavailable."
      }
    }

    const xml = await res.text()

    const titleMatches = xml.match(/<title>([\s\S]*?)<\/title>/g)
    const title = titleMatches && titleMatches.length > 1
      ? titleMatches[1].replace(/<\/?title>/g, "").trim()
      : ""
    const summaryMatch = xml.match(/<summary>([\s\S]*?)<\/summary>/)
    const abstract = summaryMatch?.[1]?.trim() || ""
    const authorMatches = xml.match(/<name>([\s\S]*?)<\/name>/g) || []
    const authors = authorMatches.map((a) => a.replace(/<\/?name>/g, "").trim()).join(", ")
    const pdfLink = xml.match(/href="([^"]+pdf[^"]*)"/)?.[1] || `https://arxiv.org/pdf/${cleanId}.pdf`

    let fullText = `Title: ${title}\nAuthors: ${authors}\narXiv ID: ${cleanId}\nPDF: ${pdfLink}\n\n`

    if (abstract) {
      fullText += `## Abstract\n${abstract}\n\n`
    }

    // Try to fetch PDF for full text with retry
    let pdfFetched = false
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const pdfRes = await fetchWithTimeout(pdfLink, {
          headers: { "User-Agent": "BioMedResearchAgent/1.0" },
        }, 35000)

        if (pdfRes.ok) {
          const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer())
          if (pdfBuffer.length > 1000) {
            const pdfParse = (await import("pdf-parse")).default
            const pdfData = await pdfParse(pdfBuffer)
            if (pdfData.text?.trim()) {
              fullText += `## Full Text (from arXiv PDF)\n${pdfData.text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()}\n`
              console.log(`[fetch-paper] Successfully fetched PDF for arXiv: ${cleanId}`)
              pdfFetched = true
              break
            }
          }
        }
      } catch (pdfErr) {
        console.warn(`[fetch-paper] PDF fetch attempt ${attempt + 1} failed for arXiv:`, pdfErr instanceof Error ? pdfErr.message : String(pdfErr))
        if (attempt === 0) {
          console.log(`[fetch-paper] Retrying arXiv PDF in 2s...`)
          await new Promise(r => setTimeout(r, 2000))
        }
      }
    }

    if (!pdfFetched) {
      console.warn(`[fetch-paper] Could not fetch PDF for arXiv: ${cleanId}, returning metadata only`)
    }

    console.log(`[fetch-paper] Success - arXiv: ${cleanId}, Title: "${title}"`)

    return {
      success: true,
      text: fullText.trim(),
      source: "arxiv",
      title,
      authors,
      abstract,
      url: `https://arxiv.org/abs/${cleanId}`,
    }
  } catch (err) {
    console.error(`[fetch-paper] Error fetching arXiv ${cleanId}:`, err)
    return {
      success: false,
      text: "",
      source: "arxiv",
      error: `Failed to fetch from arXiv: ${err instanceof Error ? err.message : String(err)}`,
      suggestion: "Check the arXiv ID format (e.g., 2301.12345) and try again."
    }
  }
}

async function fetchByUrl(url: string): Promise<FetchResult> {
  const trimmed = url.trim()
  console.log(`[fetch-paper] Fetching by URL: ${trimmed}`)

  // Check if it's actually a known identifier type
  if (/doi\.org/i.test(trimmed)) {
    const doi = extractDoi(trimmed)
    console.log(`[fetch-paper] URL detected as DOI, redirecting...`)
    return fetchByDoi(doi)
  }

  if (/arxiv\.org/i.test(trimmed)) {
    console.log(`[fetch-paper] URL detected as arXiv, redirecting...`)
    return fetchByArxiv(trimmed)
  }

  // Generic URL handling
  try {
    const res = await fetchWithTimeout(trimmed, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BioMedResearchAgent/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    }, 20000)

    if (!res.ok) {
      return {
        success: false,
        text: "",
        source: "url",
        error: `HTTP error ${res.status} when fetching URL`,
        suggestion: "The URL may be broken or the server may be down. Check the URL and try again."
      }
    }

    const contentType = res.headers.get("content-type") || ""

    // Handle PDF URLs
    if (contentType.includes("pdf") || trimmed.endsWith(".pdf")) {
      try {
        const pdfBuffer = Buffer.from(await res.arrayBuffer())

        if (pdfBuffer.length < 500) {
          return {
            success: false,
            text: "",
            source: "url-pdf",
            error: "PDF file too small or empty",
            suggestion: "The PDF at this URL appears to be empty or corrupted."
          }
        }

        const pdfParse = (await import("pdf-parse")).default
        const pdfData = await pdfParse(pdfBuffer)
        const text = pdfData.text?.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim() || ""

        if (!text) {
          return {
            success: false,
            text: "",
            source: "url-pdf",
            error: "PDF text extraction failed",
            suggestion: "This may be a scanned/image-based PDF. Try using a different source or DOI."
          }
        }

        console.log(`[fetch-paper] Successfully parsed PDF from URL`)
        return {
          success: true,
          text,
          source: "url-pdf",
          url: trimmed,
        }
      } catch (parseErr) {
        return {
          success: false,
          text: "",
          source: "url-pdf",
          error: `PDF parsing failed: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
          suggestion: "Could not parse the PDF. It may be corrupted or password-protected."
        }
      }
    }

    // Handle HTML/text content
    if (contentType.includes("html") || contentType.includes("text")) {
      const html = await res.text()
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<nav[\s\S]*?<\/nav>/gi, "")
        .replace(/<footer[\s\S]*?<\/footer>/gi, "")
        .replace(/<header[\s\S]*?<\/header>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#\d+;/g, "")
        .replace(/\s+/g, " ")
        .trim()

      if (!text || text.length < 50) {
        return {
          success: false,
          text: "",
          source: "url-html",
          error: "Extracted text too short or empty",
          suggestion: "The page may require JavaScript rendering or may be blocked. Try copying the content manually."
        }
      }

      console.log(`[fetch-paper] Successfully extracted HTML content from URL`)
      return {
        success: true,
        text: text.slice(0, 50000),
        source: "url-html",
        url: trimmed,
      }
    }

    return {
      success: false,
      text: "",
      source: "url",
      error: `Unsupported content type: ${contentType}`,
      suggestion: "Only HTML, text, and PDF content types are supported."
    }
  } catch (err) {
    console.error(`[fetch-paper] URL fetch failed:`, err)
    return {
      success: false,
      text: "",
      source: "url",
      error: `Failed to fetch URL: ${err instanceof Error ? err.message : String(err)}`,
      suggestion: "Check the URL is correct and accessible. The site may be down or blocking requests."
    }
  }
}

export async function fetchPaperDirect(input: string): Promise<FetchResult> {
  const sourceType = detectSourceType(input)
  console.log(`[fetch-paper] Processing input: "${input}" (detected type: ${sourceType})`)

  let result: FetchResult

  switch (sourceType) {
    case "doi":
      result = await fetchByDoi(input)
      break
    case "arxiv":
      result = await fetchByArxiv(input)
      break
    case "url":
      result = await fetchByUrl(input)
      break
    default:
      console.log(`[fetch-paper] Unknown type, trying as URL...`)
      result = await fetchByUrl(input)
      break
  }

  // Add helpful context if failed
  if (!result.success && !result.suggestion) {
    result.suggestion = `
Tips:
- For DOIs: Use format "10.xxxx/xxxxx" or "https://doi.org/10.xxxx/xxxxx"
- For arXiv: Use format "2301.12345" or "https://arxiv.org/abs/2301.12345"
- For URLs: Ensure the URL is publicly accessible
`.trim()
  }

  return result
}
