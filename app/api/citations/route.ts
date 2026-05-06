import { NextRequest, NextResponse } from "next/server"

interface Citation {
  id: string
  doi?: string
  pmid?: string
  title: string
  authors: string
  year: number
  journal?: string
  venue?: string
  abstract?: string
  url?: string
  citationCount?: number
  type: "primary" | "secondary" | "method" | "dataset"
}

interface CitationRequest {
  action: "extract" | "format" | "validate" | "enrich" | "lookup_citations" | "lookup_references"
  input?: string
  citations?: Citation[]
  format?: "apa" | "mla" | "chicago" | "ieee" | "bibtex"
  text?: string
  limit?: number
}

async function extractCitationsFromText(text: string): Promise<Citation[]> {
  const citations: Citation[] = []
  
  // DOI extraction patterns
  const doiPatterns = [
    /10\.\d{4,9}\/[^\s\]]+/g,
    /doi[:\s]*(10\.\d{4,9}\/[^\s]+)/gi,
  ]
  
  // PMID patterns
  const pmidPattern = /PMID[:\s]*(\d{7,})/gi
  
  // Author-year pattern (Smith et al., 2024)
  const authorYearPattern = /([A-Z][a-z]+(?:\s+et\s+al\.?)?(?:,\s*(?:\d{4}[a-z]?|\d{4})))\s*[,\)]/g
  
  // Extract DOIs
  for (const pattern of doiPatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const doi = match[1] || match[0]
      if (!citations.some(c => c.doi === doi)) {
        citations.push({
          id: `doi-${doi}`,
          doi,
          title: "",
          authors: "",
          year: new Date().getFullYear(),
          type: "primary",
        })
      }
    }
  }
  
  // Extract PMIDs
  let pmidMatch
  while ((pmidMatch = pmidPattern.exec(text)) !== null) {
    const pmid = pmidMatch[1]
    if (!citations.some(c => c.pmid === pmid)) {
      citations.push({
        id: `pmid-${pmid}`,
        pmid,
        title: "",
        authors: "",
        year: new Date().getFullYear(),
        type: "primary",
      })
    }
  }
  
  return citations
}

async function enrichCitation(citation: Citation): Promise<Citation> {
  try {
    // Try CrossRef API first
    if (citation.doi) {
      const crossRefUrl = `https://api.crossref.org/works/${encodeURIComponent(citation.doi)}`
      const response = await fetchWithTimeout(crossRefUrl, {
        headers: { "User-Agent": "BME-Research-Accelerator/1.0" },
      }, 15000)
      
      if (response.ok) {
        const data = await response.json()
        const item = data.message
        
        return {
          ...citation,
          title: item.title?.[0] || citation.title,
          authors: item.author?.map((a: { given?: string; family?: string }) => 
            `${a.given || ""} ${a.family || ""}`.trim()
          ).join(", ") || citation.authors,
          year: item.published?.["date-parts"]?.[0]?.[0] || citation.year,
          journal: item["container-title"]?.[0],
          venue: item["container-title"]?.[0],
          abstract: item.abstract?.replace(/<[^>]+>/g, ""),
          url: item.URL || `https://doi.org/${citation.doi}`,
        }
      }
    }
    
    // Try PubMed API (with NCBI API Key for higher rate limits)
    if (citation.pmid) {
      let pubmedUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${citation.pmid}&rettype=abstract&retmode=xml`

      // ✅ Add NCBI API Key if available
      if (process.env.NCBI_API_KEY && process.env.NCBI_API_KEY.trim() !== "") {
        pubmedUrl += "&api_key=" + process.env.NCBI_API_KEY.trim()
      }

      const response = await fetchWithTimeout(pubmedUrl, {
        headers: { "User-Agent": "BME-Research-Accelerator/2.0" },
      }, 15000)
      
      if (response.ok) {
        const xml = await response.text()
        
        const titleMatch = xml.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)
        const authorMatches = [...xml.matchAll(/<LastName>([^<]+)<\/LastName>\s*<ForeName>([^<]+)<\/ForeName>/g)]
        const yearMatch = xml.match(/<PubDate>.*?<Year>(\d+)<\/Year>/)
        const journalMatch = xml.match(/<Title>([^<]+)<\/Title>/)
        
        return {
          ...citation,
          title: titleMatch ? cleanXMLText(titleMatch[1]) : citation.title,
          authors: authorMatches.map(m => `${m[2]} ${m[1]}`).join(", ") || citation.authors,
          year: yearMatch ? parseInt(yearMatch[1]) : citation.year,
          journal: journalMatch?.[1],
          venue: journalMatch?.[1],
          url: `https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}/`,
        }
      }
    }
  } catch (error) {
    console.error("[enrichCitation] Error:", error instanceof Error ? error.message : String(error))
  }
  
  return citation
}

function formatCitation(citation: Citation, format: string): string {
  switch (format.toLowerCase()) {
    case "apa":
      return formatAPA(citation)
    case "ieee":
      return formatIEEE(citation)
    case "bibtex":
      return formatBibTeX(citation)
    case "chicago":
      return formatChicago(citation)
    case "mla":
      return formatMLA(citation)
    default:
      return formatAPA(citation)
  }
}

function formatAPA(citation: Citation): string {
  const authorList = citation.authors.split(",").map(a => a.trim())
  const firstAuthor = authorList[0] || ""
  const etAl = authorList.length > 1 ? " et al." : ""
  
  return `${firstAuthor}${etAl} (${citation.year}). ${citation.title}. ${citation.journal || citation.venue || ""}. ${citation.doi ? `https://doi.org/${citation.doi}` : ""}`.trim()
}

function formatIEEE(citation: Citation): string {
  return `${citation.authors}, "${citation.title}," ${citation.journal || citation.venue || ""}, ${citation.year}. ${citation.doi ? `doi: ${citation.doi}` : ""}`.trim()
}

function formatBibTeX(citation: Citation): string {
  const key = citation.id.replace(/^doi-|^pmid-/, "")
  return `@article{${key},
  title={${citation.title}},
  author={${citation.authors}},
  journal={${citation.journal || citation.venue || ""}},
  year={${citation.year}}
}${citation.doi ? `,\n  doi={${citation.doi}}` : ""}
}`
}

function formatChicago(citation: Citation): string {
  return `${citation.authors}. "${citation.title}." ${citation.journal || citation.venue || ""} (${citation.year}).`.trim()
}

function formatMLA(citation: Citation): string {
  return `${citation.authors}. "${citation.title}." ${citation.journal || citation.venue || ""}, ${citation.year}.`.trim()
}

function cleanXMLText(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim()
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 30000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timer)
    return res
  } catch (error) {
    clearTimeout(timer)
    throw error
  }
}

// ═════════════════════════════════════════════════════
// 纯 PubMed/NCBI Citation Lookup (仅使用 NCBI E-utilities)
// 数据源: PubMed (eutils.ncbi.nlm.nih.gov)
// ═════════════════════════════════════════════════════

// ✅ Helper: Add NCBI API Key to URL if available
function addNCBIApiKey(url: string): string {
  if (process.env.NCBI_API_KEY && process.env.NCBI_API_KEY.trim() !== "") {
    return url + (url.includes("?") ? "&" : "?") + "api_key=" + process.env.NCBI_API_KEY.trim()
  }
  return url
}

// ✅ Lookup paper by DOI using NCBI E-search (PURE PUBMED)
async function lookupPaperByDOI(doi: string): Promise<{ pmid: string; pmcid: string; title: string } | null> {
  try {
    // ✅ Use NCBI E-Search to find PMID by DOI (Publisher ID field)
    const searchUrl = addNCBIApiKey(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(doi)}[doi]&retmode=json&retmax=1`
    )
    console.log(`[lookupPaperByDOI] 🔍 Querying NCBI E-Search for DOI: ${doi}`)

    const response = await fetchWithTimeout(searchUrl, {
      headers: { "User-Agent": "BME-Research-Accelerator/2.0" }
    }, 15000)

    if (!response.ok) {
      console.error(`[lookupPaperByDOI] NCBI error: ${response.status}`)
      return null
    }

    const data = await response.json()
    const idList = data.esearchresult?.idlist || []

    if (idList.length === 0) {
      console.log(`[lookupPaperByDOI] Paper not found in PubMed for DOI: ${doi}`)
      return null
    }

    const pmid = idList[0]
    console.log(`[lookupPaperByDOI] ✅ Found PMID: ${pmid}`)

    // ✅ Fetch paper details to get title and PMCID
    const fetchUrl = addNCBIApiKey(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&rettype=abstract&retmode=xml`
    )

    const fetchRes = await fetchWithTimeout(fetchUrl, {
      headers: { "User-Agent": "BME-Research-Accelerator/2.0" }
    }, 20000)

    if (!fetchRes.ok) {
      // Return basic info even if details fail
      return { pmid, pmcid: "", title: "" }
    }

    const xmlText = await fetchRes.text()

    // Extract title
    const titleMatch = xmlText.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)
    const title = titleMatch ? cleanXMLText(titleMatch[1]) : ""

    // Extract PMCID
    const pmcidMatch = xmlText.match(/<ArticleId IdType="pmc">([^<]+)<\/ArticleId>/)
    const pmcid = pmcidMatch?.[1] || ""

    console.log(`[lookupPaperByDOI] ✅ Title: "${title.slice(0, 50)}..." PMCID: ${pmcid || "N/A"}`)

    return { pmid, pmcid, title }

  } catch (error) {
    console.error("[lookupPaperByDOI] Error:", error instanceof Error ? error.message : String(error))
    return null
  }
}

// ✅ Get references from PubMed XML (参考文献 - PURE PUBMED)
async function getReferencesFromPubMed(pmid: string, limit: number): Promise<Citation[]> {
  try {
    console.log(`[getReferencesFromPubMed] 📚 Fetching references for PMID: ${pmid}`)

    // ✅ Use efetch with full XML to get ReferenceList
    const fetchUrl = addNCBIApiKey(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&rettype=full&retmode=xml`
    )

    const response = await fetchWithTimeout(fetchUrl, {
      headers: { "User-Agent": "BME-Research-Accelerator/2.0" }
    }, 30000)

    if (!response.ok) {
      console.error(`[getReferencesFromPubMed] efetch failed: ${response.status}`)
      return []
    }

    const xmlText = await response.text()

    // ✅ Parse ReferenceList from PubMed XML
    const references = parseReferenceListFromXML(xmlText)

    console.log(`[getReferencesFromPubMed] ✅ Parsed ${references.length} references from PubMed XML`)
    return references.slice(0, limit)

  } catch (error) {
    console.error("[getReferencesFromPubMed] Error:", error instanceof Error ? error.message : String(error))
    return []
  }
}

// ✅ Parse PubMed ReferenceList XML into Citations
function parseReferenceListFromXML(xml: string): Citation[] {
  const citations: Citation[] = []

  // Match each <Reference> block within <ReferenceList>
  const refRegex = /<Reference>([\s\S]*?)<\/Reference>/g

  let match
  let index = 0
  while ((match = refRegex.exec(xml)) !== null && index < 100) {
    const refXml = match[1]
    index++

    // Extract citation text
    const citationMatch = refXml.match(/<Citation>([\s\S]*?)<\/Citation>/)
    if (!citationMatch) continue

    const citationText = cleanXMLText(citationMatch[1])

    // Try to extract structured data from ArticleIdList
    const doiMatch = refXml.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/)
    const pmidMatch = refXml.match(/<ArticleId IdType="pubmed">([^<]+)<\/ArticleId>/)

    // Extract year from citation text (pattern: "Author (YEAR)")
    const yearMatch = citationText.match(/\((\d{4})\)/)
    const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear()

    // Generate a short title from the first part of citation
    const parts = citationText.split(".")
    const shortTitle = parts[0]?.trim() || citationText.slice(0, 100)

    citations.push({
      id: `ref-${index}`,
      doi: doiMatch?.[1],
      pmid: pmidMatch?.[1],
      title: shortTitle,
      authors: extractAuthorsFromCitation(citationText),
      year,
      type: "primary",
    })
  }

  return citations
}

// ✅ Extract author names from citation text
function extractAuthorsFromCitation(citation: string): string {
  // Pattern: "Author1, Author2, and Author3 (YEAR)" or "Author1 et al"
  const etAlIndex = citation.indexOf(" et al")
  const parenIndex = citation.indexOf(" (")

  let authorPart = citation
  if (etAlIndex > 0) {
    authorPart = citation.substring(0, etAlIndex).trim()
  } else if (parenIndex > 0) {
    authorPart = citation.substring(0, parenIndex).trim()
  }

  // Take last part (usually the main author list)
  const lastComma = authorPart.lastIndexOf(",")
  if (lastComma > 0 && lastComma < authorPart.length - 5) {
    authorPart = authorPart.substring(lastComma + 1).trim()
  }

  return authorPart || "Unknown Authors"
}

export async function POST(request: NextRequest) {
  try {
    const body: CitationRequest = await request.json()
    const { action, input, format, text } = body
    const citations: typeof body.citations = body.citations || []  // Initialize with empty array to avoid TDZ

    console.log(`[citations] Action: ${action}`)

    // Use if-else instead of switch to avoid block-scoping issues with citations variable
    if (action === "extract") {
      if (!text) {
        return NextResponse.json(
          { error: "Text is required for extraction" },
          { status: 400 }
        )
      }
      
      const extractedCitations = await extractCitationsFromText(text)
      
      return NextResponse.json({
        success: true,
        action: "extract",
        count: extractedCitations.length,
        citations: extractedCitations,
      })

    } else if (action === "enrich") {
      if (!citations || !Array.isArray(citations) || citations.length === 0) {
        return NextResponse.json(
          { error: "Citations array is required for enrichment" },
          { status: 400 }
        )
      }
      
      const enrichedCitations = await Promise.all(
        citations.map(citation => enrichCitation(citation))
      )
      
      return NextResponse.json({
        success: true,
        action: "enrich",
        count: enrichedCitations.length,
        citations: enrichedCitations,
      })

    } else if (action === "format") {
      if (!citations || !Array.isArray(citations) || citations.length === 0) {
        return NextResponse.json(
          { error: "Citations array is required for formatting" },
          { status: 400 }
        )
      }
      
      const targetFormat = format || "apa"
      const formattedCitations = citations.map(citation => ({
        original: citation,
        formatted: formatCitation(citation, targetFormat),
      }))
      
      return NextResponse.json({
        success: true,
        action: "format",
        format: targetFormat,
        count: formattedCitations.length,
        citations: formattedCitations,
      })

      } else if (action === "validate") {
        if (!input) {
          return NextResponse.json(
            { error: "Input (DOI or PMID) is required for validation" },
            { status: 400 }
          )
        }
        
        // Check if it's a valid DOI or PMID
        const doiRegex = /^10\.\d{4,9}\/[^\s]+$/
        const pmidRegex = /^\d{7,}$/
        
        const isValidDOI = doiRegex.test(input.trim())
        const isValidPMID = pmidRegex.test(input.trim())
        
        if (!isValidDOI && !isValidPMID) {
          return NextResponse.json({
            valid: false,
            type: "unknown",
            message: "Input does not appear to be a valid DOI or PMID",
          })
        }
        
        // Try to validate via API
        try {
          let validationUrl: string
          
          if (isValidDOI) {
            validationUrl = `https://api.crossref.org/works/${encodeURIComponent(input.trim())}`
          } else {
            validationUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${input}&rettype=abstract&retmode=xml`
          }
          
          const response = await fetchWithTimeout(validationUrl, {}, 15000)
          
          return NextResponse.json({
            valid: response.ok,
            type: isValidDOI ? "doi" : "pmid",
            exists: response.ok,
            message: response.ok 
              ? `Valid ${isValidDOI ? "DOI" : "PMID"} found in database`
              : `${isValidDOI ? "DOI" : "PMID"} not found in database`,
          })
        } catch (error) {
          return NextResponse.json({
            valid: false,
            type: isValidDOI ? "doi" : "pmid",
            message: "Validation service unavailable",
          })
        }

      } else if (action === "lookup_citations") {
        // ⚠️ 注意: PubMed/NCBI 不直接提供"被引论文"查询功能
        // 此功能需要使用 CrossRef 或 Semantic Scholar API
        return NextResponse.json({
          success: false,
          doi: input?.trim() || "",
          direction: "citations",
          paperTitle: "",
          count: 0,
          results: [],
          error: "⚠️ 被引论文查询功能说明:\n\nPubMed/NCBI API 不直接提供'哪些论文引用了这篇论文'的查询功能。\n\n✅ 可用功能:\n- 📚 参考文献 (References): 查询这篇论文引用了哪些其他论文\n\n💡 如需被引论文查询，建议:\n1. 使用 Google Scholar 搜索论文标题 + 'cited by'\n2. 访问 https://www.crossref.org 手动查询",
          source: "PubMed",
        })

      } else if (action === "lookup_references") {
        if (!input) {
          return NextResponse.json(
            { error: "DOI is required for reference lookup" },
            { status: 400 }
          )
        }

        console.log(`[citations] Looking up references (参考文献) for DOI: ${input}`)

        // ✅ Use PURE PubMed (NCBI E-utilities) to find paper by DOI
        const refLookup = await lookupPaperByDOI(input.trim())

        if (!refLookup) {
          console.log(`[citations] Paper not found in PubMed for DOI: ${input}`)
          return NextResponse.json({
            success: false,
            doi: input.trim(),
            direction: "references",
            paperTitle: "",
            count: 0,
            results: [],
            error: "Paper not found in PubMed. Please verify the DOI or try a different paper.",
          })
        }

        console.log(`[citations] ✅ Found paper: "${refLookup.title}" (PMID: ${refLookup.pmid})`)

        // ✅ Get references from PURE PubMed XML (ReferenceList)
        const refLimit = body.limit || 10
        const references = await getReferencesFromPubMed(refLookup.pmid, refLimit)

        console.log(`[citations] ✅ Retrieved ${references.length} references from PubMed`)

        return NextResponse.json({
          success: true,
          doi: input.trim(),
          direction: "references",
          paperTitle: refLookup.title,
          count: references.length,
          results: references,
          source: "PubMed (NCBI)",
        })

      } else {
        return NextResponse.json(
          { error: `Unknown action: ${action}. Supported actions: extract, enrich, format, validate, lookup_citations, lookup_references` },
          { status: 400 }
        )
      }
  } catch (error) {
    console.error("[citations] Error:", error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Citation processing failed",
        suggestion: "Please check your input and try again.",
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/citations",
    method: "POST",
    contentType: "application/json",
    version: "3.0-enhanced",
    description: "Academic citation management with Semantic Scholar integration for real citation/reference lookup",
    parameters: {
      action: "Required: 'extract', 'enrich', 'format', 'validate', 'lookup_citations', or 'lookup_references'",
      text: "For 'extract': Text to extract citations from",
      citations: "For 'enrich'/'format': Array of citation objects",
      format: "For 'format': Target format ('apa', 'mla', 'chicago', 'ieee', 'bibtex')",
      input: "For 'validate'/'lookup_citations'/'lookup_references': DOI or PMID to lookup",
      limit: "For 'lookup_*': Number of results (default: 10, max: 50)",
    },
    supportedFormats: ["APA", "MLA", "Chicago", "IEEE", "BibTeX"],
    features: [
      "✨ Automatic citation extraction from text",
      "✨ Metadata enrichment via CrossRef & PubMed APIs",
      "✨ Multiple citation format support",
      "✨ DOI/PMID validation",
      "✨ Real-time citation lookup via Semantic Scholar API",
      "✨ Reference list retrieval via Semantic Scholar API",
      "✨ Influential paper identification (⭐)",
      "✨ Batch processing support",
      "✨ Timeout protection for reliable API calls",
    ],
    examples: {
      extract: {
        action: "extract",
        text: "Recent studies (Smith et al., 2023; 10.1038/nature12373) have shown...",
      },
      lookupCitations: {
        action: "lookup_citations",
        input: "10.1038/s41586-021-03819-2",
        limit: 20,
      },
      lookupReferences: {
        action: "lookup_references",
        input: "10.1038/s41586-021-03819-2",
        limit: 20,
      },
    },
  })
}
