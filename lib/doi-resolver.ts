import { logger } from './logger';

export interface DOIMetadata {
  doi: string;
  title?: string;
  authors?: string[];
  journal?: string;
  year?: number;
  volume?: string;
  issue?: string;
  pages?: string;
  abstract?: string;
  url?: string;
  type?: string;
  publisher?: string;
  isbn?: string;
  issn?: string;
}

const DOI_REGEX = /^10\.\d{4,9}\/[^\s]+$/;

export function isValidDOI(doi: string): boolean {
  return DOI_REGEX.test(doi.trim());
}

export function normalizeDOI(doi: string): string {
  return doi.trim().toLowerCase();
}

async function resolveDOIMetadata(doi: string): Promise<DOIMetadata> {
  const normalizedDOI = normalizeDOI(doi);

  // Method 1: Use CrossRef API (free, no auth required)
  try {
    const crossrefUrl = `https://api.crossref.org/works/${encodeURIComponent(normalizedDOI)}`;
    const response = await fetch(crossrefUrl, {
      headers: {
        'User-Agent': 'BME-Research-Accelerator/1.0 (mailto:research@example.com)',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const item = data.message;

      return {
        doi: normalizedDOI,
        title: Array.isArray(item.title) ? item.title[0] : item.title,
        authors: item.author?.map((a: { given?: string; family?: string }) =>
          [a.given, a.family].filter(Boolean).join(' ')
        ),
        journal: item['container-title']?.[0],
        year: item.published?.['date-parts']?.[0]?.[0],
        volume: item.volume,
        issue: item.issue,
        pages: item.page,
        abstract: item.abstract,
        url: item.URL,
        type: item.type,
        publisher: item.publisher,
        isbn: item.ISN?.[0],
        issn: item.ISSN?.[0],
      };
    }
  } catch (error) {
    logger.doiResolver.warn('CrossRef API failed', error);
  }

  // Return basic info even if APIs fail
  return {
    doi: normalizedDOI,
    url: `https://doi.org/${normalizedDOI}`,
  };
}

export async function resolveDOI(doi: string): Promise<{
  success: boolean;
  doi: string;
  metadata: DOIMetadata;
  resolvedUrl?: string;
}> {
  if (!isValidDOI(doi)) {
    throw new Error(`Invalid DOI format: ${doi}. Expected format: 10.XXXX/...`);
  }

  const normalizedDOI = normalizeDOI(doi);
  const metadata = await resolveDOIMetadata(normalizedDOI);

  return {
    success: true,
    doi: normalizedDOI,
    metadata,
    resolvedUrl: metadata.url || `https://doi.org/${normalizedDOI}`,
  };
}

export async function getDOIPDFLink(doi: string): Promise<string | null> {
  try {
    const metadata = await resolveDOI(doi);

    // Check for open access link in CrossRef data
    const crossrefUrl = `https://api.crossref.org/works/${encodeURIComponent(normalizeDOI(doi))}`;
    const response = await fetch(crossrefUrl, {
      headers: {
        'User-Agent': 'BME-Research-Accelerator/1.0 (mailto:research@example.com)',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const item = data.message;

      // Check for open access links
      const link = item.link?.find(
        (l: { 'content-type': string; 'intended-application': string }) =>
          l['content-type'] === 'application/pdf' || l['intended-application'] === 'text-mining'
      );

      if (link?.URL) {
        return link.URL;
      }

      // Try Unpaywall as fallback
      const email = encodeURIComponent('research@example.com');
      const unpaywallUrl = `https://api.unpaywall.org/v2/${normalizeDOI(doi)}?email=${email}`;
      const unpaywallResponse = await fetch(unpaywallUrl);

      if (unpaywallResponse.ok) {
        const unpaywallData = await unpaywallResponse.json();

        if (unpaywallData.best_oa_location?.url_for_pdf) {
          return unpaywallData.best_oa_location.url_for_pdf;
        }
      }
    }
  } catch (error) {
    logger.doiResolver.error('getDOIPDFLink failed', error);
  }

  return null;
}

export async function searchByDOI(doi: string): Promise<{
  title?: string;
  authors?: string[];
  abstract?: string;
  journal?: string;
  year?: number;
  citations?: number;
  references?: Array<{ doi: string; title: string }>;
}> {
  const normalizedDOI = normalizeDOI(doi);

  try {
    // Use CrossRef for additional metadata
    const crossrefUrl = `https://api.crossref.org/works/${normalizedDOI}`;
    const response = await fetch(crossrefUrl, {
      headers: { "User-Agent": "BioMedResearchAgent/1.0 (mailto:bme-research@example.com)" }
    });

    if (response.ok) {
      const data = await response.json();
      const item = data.message;

      return {
        title: item.title?.[0] || '',
        authors: item.author?.map((a: any) => `${a.given} ${a.family}`) || [],
        abstract: item.abstract || '',
        journal: item['container-title']?.[0] || '',
        year: item.published?.['date-parts']?.[0]?.[0] || undefined,
        citations: item['is-referenced-by-count'] || 0,
      };
    }
  } catch (error) {
    logger.doiResolver.error('getMetadataByDOI failed', error);
  }

  return {
    doi: normalizedDOI,
    url: `https://doi.org/${normalizedDOI}`,
  };
}
        })),
      };
    }
  } catch (error) {
    logger.doiResolver.error('searchByDOI failed', error);
  }

  // Fallback to basic resolution
  const resolved = await resolveDOI(doi);
  return {
    title: resolved.metadata.title,
    authors: resolved.metadata.authors,
    abstract: resolved.metadata.abstract,
    journal: resolved.metadata.journal,
    year: resolved.metadata.year,
  };
}

export function extractDOIFromText(text: string): string | null {
  const patterns = [/doi[:\s]*(10\.\d{4,9}\/[^\s]+)/gi, /(10\.\d{4,9}\/[^\s]+)/g];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && isValidDOI(match[1] || match[0])) {
      return (match[1] || match[0]).trim();
    }
  }

  return null;
}
