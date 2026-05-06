interface URLContent {
  url: string
  title?: string
  description?: string
  text: string
  html?: string
  metadata?: {
    title?: string
    description?: string
    author?: string
    date?: string
    siteName?: string
    image?: string
    type?: string
  }
  links?: string[]
  images?: string[]
}

async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BME-Research-Accelerator/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

function cleanText(html: string): string {
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "\n• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  return decodeHTMLEntities(text)
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
}

function extractMetadata(html: string, url: URL): URLContent["metadata"] {
  const metadata: URLContent["metadata"] = {}
  
  // Open Graph meta tags
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
  const ogDescription = html.match(/<meta[^>]+property="og:description"[^>]+content=["']([^"']+)["']/i)
  const ogImage = html.match(/<meta[^>]+property="og:image"[^>]+content=["']([^"']+)["']/i)
  const ogType = html.match(/<meta[^>]+property="og:type"[^>]+content=["']([^"']+)["']/i)
  const ogSiteName = html.match(/<meta[^>]+property="og:site_name"[^>]+content=["']([^"']+)["']/i)
  
  // Standard meta tags
  const metaTitle = html.match(/<title>([^<]+)<\/title>/i)
  const metaDescription = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
  const metaAuthor = html.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i)
  const metaDate = html.match(/<meta[^>]+name=["'](date|pubdate|article:published_time)["'][^>]+content=["']([^"']+)["']/i)
  
  metadata.title = ogTitle?.[1] || metaTitle?.[1]
  metadata.description = ogDescription?.[1] || metaDescription?.[1]
  metadata.author = metaAuthor?.[1]
  metadata.date = metaDate?.[2]
  metadata.siteName = ogSiteName?.[1] || url.hostname
  metadata.image = ogImage?.[1]
  metadata.type = ogType?.[1]
  
  return metadata
}

function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = []
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi
  let match
  
  while ((match = linkRegex.exec(html)) !== null) {
    let href = match[1]
    
    // Skip javascript:, mailto:, tel: links
    if (href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      continue
    }
    
    // Convert relative URLs to absolute
    if (href.startsWith("/")) {
      href = `${baseUrl}${href}`
    } else if (!href.startsWith("http://") && !href.startsWith("https://")) {
      href = `${baseUrl}/${href}`
    }
    
    links.push(href)
  }
  
  return [...new Set(links)]
}

function extractImages(html: string, baseUrl: string): string[] {
  const images: string[] = []
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  let match
  
  while ((match = imgRegex.exec(html)) !== null) {
    let src = match[1]
    
    // Skip data URIs and tiny images
    if (src.startsWith("data:")) continue
    
    // Convert relative URLs to absolute
    if (src.startsWith("/")) {
      src = `${baseUrl}${src}`
    } else if (!src.startsWith("http://") && !src.startsWith("https://")) {
      src = `${baseUrl}/${src}`
    }
    
    images.push(src)
  }
  
  return [...new Set(images)]
}

export async function fetchURLContent(urlString: string): Promise<URLContent> {
  let url: URL
  
  try {
    url = new URL(urlString)
  } catch {
    throw new Error(`Invalid URL: ${urlString}`)
  }
  
  // Only allow http and https protocols
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Unsupported protocol: ${url.protocol}. Only HTTP and HTTPS are allowed.`)
  }
  
  const response = await fetchWithTimeout(urlString)
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const contentType = response.headers.get("content-type") || ""
  const html = await response.text()
  
  const baseUrl = `${url.protocol}//${url.hostname}`
  
  return {
    url: urlString,
    ...extractMetadata(html, url),
    text: cleanText(html),
    html: html,
    links: extractLinks(html, baseUrl),
    images: extractImages(html, baseUrl),
  }
}

export async function fetchArxivAbstract(arxivId: string): Promise<string> {
  const apiUrl = `https://export.arxiv.org/api/query?id_list=${arxivId}`
  
  try {
    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw new Error(`arXiv API error: ${response.status}`)
    }
    
    const xml = await response.text()
    const summaryMatch = xml.match(/<summary>([\s\S]*?)<\/summary>/)
    
    return summaryMatch?.[1]?.trim() || "Abstract not found"
  } catch (error) {
    console.error("[fetchArxivAbstract] Error:", error)
    throw new Error(`Failed to fetch arXiv abstract: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function fetchPubMedAbstract(pmid: string): Promise<string> {
  const apiUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&rettype=abstract&retmode=text`
  
  try {
    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw new Error(`PubMed API error: ${response.status}`)
    }
    
    return await response.text()
  } catch (error) {
    console.error("[fetchPubMedAbstract] Error:", error)
    throw new Error(`Failed to fetch PubMed abstract: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export function isAcademicURL(url: string): boolean {
  const academicPatterns = [
    /arxiv\.org/i,
    /pubmed\.ncbi\.nlm\.nih\.gov/i,
    /doi\.org/i,
    /scholar\.google\.com/i,
    /semanticscholar\.org/i,
    /researchgate\.net/i,
    /springer\.com/i,
    /ieee\.org/i,
    /acm\.org/i,
    /nature\.com/i,
    /science\.org/i,
    /cell\.com/i,
    /wiley\.com/i,
    /tandfonline\.com/i,
  ]
  
  return academicPatterns.some(pattern => pattern.test(url))
}

export function extractIdentifierFromURL(url: string): { type: "arxiv" | "pubmed" | "doi" | "unknown"; id: string } | null {
  // arXiv
  const arxivMatch = url.match(/arxiv\.org\/abs\/(\d+\.\d+)/i)
  if (arxivMatch) return { type: "arxiv", id: arxivMatch[1] }
  
  // PubMed
  const pubmedMatch = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/i)
  if (pubmedMatch) return { type: "pubmed", id: pubmedMatch[1] }
  
  // DOI
  const doiMatch = url.match(/doi\.org\/(10\.\d{4,9}\/[^\s]+)/i)
  if (doiMatch) return { type: "doi", id: doiMatch[1] }
  
  return null
}
