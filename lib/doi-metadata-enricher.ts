import type { ExtractedDOI } from './doi-extractor-types';
import type { DOIMetadata } from './doi-resolver';

export interface EnhancedPaperMetadata extends DOIMetadata {
  doi: string;
  extractionSource: string;
  extractionConfidence: string;
  validated: boolean;
  validationDate: string;
  enrichmentSources: string[];

  openAlex?: {
    concepts: Array<{
      id: string;
      display_name: string;
      score: number;
      level: number;
    }>;
    topics: Array<{
      id: string;
      display_name: string;
      score: number;
    }>;
    apc: number | null;
    citedByPercentileYear: number;
    oaStatus: string;
  };

  unpaywall?: {
    isOA: boolean;
    oaStatus: string;
    bestOaLocation: {
      urlForPdf?: string;
      urlForLandingPage?: string;
      hostType?: string;
      version?: string;
      license?: string;
    } | null;
  };

  pubmed?: {
    pmid: string;
    pmcid: string;
    meshTerms: string[];
    grantList: Array<{
      agency: string;
      country: string;
    }>;
    publicationTypes: string[];
  };
}

export interface EnrichmentResult {
  success: boolean;
  doi: string;
  metadata: EnhancedPaperMetadata | null;
  errors: string[];
  warnings: string[];
  sourcesUsed: string[];
  processingTime: number;
}

export interface DOIEnrichmentConfig {
  enableCrossref: boolean;
  enableOpenAlex: boolean;
  enableUnpaywall: boolean;
  enablePubMed: boolean;

  timeout: {
    crossref: number;
    openAlex: number;
    unpaywall: number;
    pubMed: number;
  };

  fallbackOrder: string[];
  maxRetries: number;
  cacheResults: boolean;
}

export const DEFAULT_ENRICHMENT_CONFIG: DOIEnrichmentConfig = {
  enableCrossref: true,
  enableOpenAlex: true,
  enableUnpaywall: true,
  enablePubMed: true,

  timeout: {
    crossref: 15000,
    openAlex: 12000,
    unpaywall: 10000,
    pubMed: 12000,
  },

  fallbackOrder: ['crossref', 'openalex'],
  maxRetries: 2,
  cacheResults: true,
};

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchCrossrefMetadata(
  doi: string,
  timeout: number
): Promise<Partial<EnhancedPaperMetadata>> {
  try {
    const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
    const response = await fetchWithTimeout(
      url,
      {
        headers: {
          'User-Agent': 'BioMedResearchAgent/1.0 (mailto:agent@biomed.dev)',
        },
      },
      timeout
    );

    if (!response.ok) throw new Error(`CrossRef API error: ${response.status}`);

    const data = await response.json();
    const item = data.message;

    return {
      doi: item.DOI || doi,
      title: item.title?.[0] || '',
      authors:
        item.author?.map((a: { given?: string; family?: string }) =>
          `${a.given || ''} ${a.family || ''}`.trim()
        ) || [],
      journal: item['container-title']?.[0] || '',
      year: item.published?.['date-parts']?.[0]?.[0],
      volume: item.volume,
      issue: item.issue,
      pages: item.page,
      abstract: item.abstract?.replace(/<[^>]+>/g, '').trim() || '',
      url: item.URL || `https://doi.org/${doi}`,
      type: item.type,
      publisher: item.publisher,
      isbn: item.ISN?.[0],
      issn: item.ISSN?.[0],
    };
  } catch (error) {
    console.error('[enrichment] CrossRef error:', error);
    throw error;
  }
}

async function fetchOpenAlexMetadata(
  doi: string,
  timeout: number
): Promise<Partial<EnhancedPaperMetadata>> {
  try {
    const url = `https://api.openalex.org/works/doi:${encodeURIComponent(doi)}`;
    const response = await fetchWithTimeout(
      url,
      {
        headers: {
          'User-Agent': 'mailto:agent@biomed.dev',
        },
      },
      timeout
    );

    if (!response.ok) throw new Error(`OpenAlex API error: ${response.status}`);

    const data = await response.json();

    return {
      title: data.title || '',
      authors:
        data.authorships?.map((a: { author: { display_name: string } }) => a.author.display_name) ||
        [],
      year: data.publication_year,
      journal: data.primary_location?.source?.display_name || '',
      type: data.type,
      publisher: data.host_organization_name || '',

      openAlex: {
        concepts:
          data.concepts?.map(
            (c: { id: string; display_name: string; score: number; level: number }) => ({
              id: c.id,
              display_name: c.display_name,
              score: c.score,
              level: c.level,
            })
          ) || [],
        topics:
          data.topics?.map((t: { id: string; display_name: string; score: number }) => ({
            id: t.id,
            display_name: t.display_name,
            score: t.score,
          })) || [],
        apc: data.apc ?? null,
        citedByPercentileYear: data.cited_by_percentile_year || 0,
        oaStatus: data.open_access?.oa_status || 'unknown',
      },

      ...(data.pmid && {
        pubmed: {
          pmid: String(data.pmid),
          pmcid: data.pmcid || '',
          meshTerms: [],
          grantList: [],
          publicationTypes: [],
        },
      }),
    };
  } catch (error) {
    console.error('[enrichment] OpenAlex error:', error);
    throw error;
  }
}

async function fetchUnpaywallData(
  doi: string,
  timeout: number
): Promise<Partial<EnhancedPaperMetadata>> {
  try {
    const url = `https://api.unpaywall.org/v2/${encodeURIComponent(doi)}?email=agent@biomed.dev`;
    const response = await fetchWithTimeout(url, {}, timeout);

    if (!response.ok) throw new Error(`Unpaywall API error: ${response.status}`);

    const data = await response.json();

    return {
      unpaywall: {
        isOA: data.is_oa || false,
        oaStatus: data.oa_status || 'unknown',
        bestOaLocation: data.best_oa_location
          ? {
              urlForPdf: data.best_oa_location.url_for_pdf || undefined,
              urlForLandingPage: data.best_oa_location.url_for_landing_page || undefined,
              hostType: data.best_oa_location.host_type || undefined,
              version: data.best_oa_location.version || undefined,
              license: data.best_oa_location.license || undefined,
            }
          : null,
      },
    };
  } catch (error) {
    console.error('[enrichment] Unpaywall error:', error);
    throw error;
  }
}

async function fetchPubMedMetadata(
  pmid: string,
  timeout: number
): Promise<Partial<EnhancedPaperMetadata>> {
  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/fetch.fcgi?db=pubmed&id=${pmid}&rettype=json&retmode=json`;
    const response = await fetchWithTimeout(url, {}, timeout);

    if (!response.ok) throw new Error(`PubMed API error: ${response.status}`);

    const data = await response.json();

    const article = data.result?.[pmid];
    if (!article) throw new Error('Article not found in PubMed');

    return {
      pubmed: {
        pmid,
        pmcid: article.pmcid || article['pmcid'] || article.PMCID || '',
        meshTerms:
          article.meshheadinglist?.meshheading?.map((m: { descriptorname: { string: string[] } }) =>
            m.descriptorname.string.join(', ')
          ) || [],
        grantList:
          article.grantlist?.grant?.map((g: { grantagency: string; country: string }) => ({
            agency: g.grantagency,
            country: g.country,
          })) || [],
        publicationTypes: article.publicationtype?.publicationtype || [],
      },
    };
  } catch (error) {
    console.error('[enrichment] PubMed error:', error);
    throw error;
  }
}

function mergeMetadata(
  base: Partial<EnhancedPaperMetadata>,
  ...sources: Partial<EnhancedPaperMetadata>[]
): EnhancedPaperMetadata {
  const merged: EnhancedPaperMetadata = {
    doi: base.doi || '',
    title: base.title || '',
    authors: base.authors || [],
    journal: base.journal || '',
    year: base.year,
    volume: base.volume,
    issue: base.issue,
    pages: base.pages,
    abstract: base.abstract || '',
    url: base.url || '',
    type: base.type || '',
    publisher: base.publisher || '',
    isbn: base.isbn,
    issn: base.issn,

    extractionSource: '',
    extractionConfidence: '',
    validated: false,
    validationDate: new Date().toISOString(),
    enrichmentSources: [],
  };

  for (const source of sources) {
    if (!source) continue;

    merged.title = source.title || merged.title;
    merged.authors = source.authors?.length ? source.authors : merged.authors;
    merged.journal = source.journal || merged.journal;
    merged.year = source.year || merged.year;
    merged.volume = source.volume || merged.volume;
    merged.issue = source.issue || merged.issue;
    merged.pages = source.pages || merged.pages;
    merged.abstract = source.abstract || merged.abstract;
    merged.url = source.url || merged.url;
    merged.type = source.type || merged.type;
    merged.publisher = source.publisher || merged.publisher;
    merged.isbn = source.isbn || merged.isbn;
    merged.issn = source.issn || merged.issn;

    if (source.openAlex && !merged.openAlex) {
      merged.openAlex = source.openAlex;
    } else if (source.openAlex && merged.openAlex) {
      Object.assign(merged.openAlex, source.openAlex);
    }

    if (source.unpaywall && !merged.unpaywall) {
      merged.unpaywall = source.unpaywall;
    } else if (source.unpaywall && merged.unpaywall) {
      Object.assign(merged.unpaywall, source.unpaywall);
    }

    if (source.pubmed && !merged.pubmed) {
      merged.pubmed = source.pubmed;
    } else if (source.pubmed && merged.pubmed) {
      Object.assign(merged.pubmed, source.pubmed);
    }
  }

  return merged;
}

export async function enrichDOIMetadata(
  extractedDOI: ExtractedDOI,
  config: Partial<DOIEnrichmentConfig> = {}
): Promise<EnrichmentResult> {
  const startTime = Date.now();
  const fullConfig = { ...DEFAULT_ENRICHMENT_CONFIG, ...config };

  const result: EnrichmentResult = {
    success: false,
    doi: extractedDOI.doi,
    metadata: null,
    errors: [],
    warnings: [],
    sourcesUsed: [],
    processingTime: 0,
  };

  try {
    let baseMetadata: Partial<EnhancedPaperMetadata> = {};
    const enrichments: Partial<EnhancedPaperMetadata>[] = [];

    for (const source of fullConfig.fallbackOrder) {
      try {
        let metadata: Partial<EnhancedPaperMetadata>;

        switch (source) {
          case 'crossref':
            if (!fullConfig.enableCrossref) continue;
            metadata = await fetchCrossrefMetadata(extractedDOI.doi, fullConfig.timeout.crossref);
            break;

          case 'openalex':
            if (!fullConfig.enableOpenAlex) continue;
            metadata = await fetchOpenAlexMetadata(extractedDOI.doi, fullConfig.timeout.openAlex);
            break;

          default:
            continue;
        }

        if (metadata && Object.keys(metadata).length > 0) {
          if (!baseMetadata.title) {
            baseMetadata = metadata;
          } else {
            enrichments.push(metadata);
          }
          result.sourcesUsed.push(source);
          console.log(`[enrichment] Successfully fetched from ${source}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.warnings.push(`${source}: ${errorMsg}`);
        console.warn(`[enrichment] ${source} failed:`, errorMsg);
      }
    }

    if (fullConfig.enableUnpaywall) {
      try {
        const unpaywallData = await fetchUnpaywallData(
          extractedDOI.doi,
          fullConfig.timeout.unpaywall
        );
        if (unpaywallData) {
          enrichments.push(unpaywallData);
          result.sourcesUsed.push('unpaywall');
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.warnings.push(`unpaywall: ${errorMsg}`);
      }
    }

    const finalMetadata = mergeMetadata(baseMetadata, ...enrichments);

    finalMetadata.doi = extractedDOI.doi;
    finalMetadata.extractionSource = extractedDOI.source;
    finalMetadata.extractionConfidence = extractedDOI.confidence;
    finalMetadata.validated = result.sourcesUsed.length > 0;
    finalMetadata.enrichmentSources = result.sourcesUsed;

    if (finalMetadata.pubmed?.pmid && fullConfig.enablePubMed) {
      try {
        const pubmedData = await fetchPubMedMetadata(
          finalMetadata.pubmed.pmid,
          fullConfig.timeout.pubMed
        );
        if (pubmedData) {
          Object.assign(finalMetadata, pubmedData);
          if (!result.sourcesUsed.includes('pubmed')) {
            result.sourcesUsed.push('pubmed');
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.warnings.push(`pubmed: ${errorMsg}`);
      }
    }

    result.metadata = finalMetadata;
    result.success = result.sourcesUsed.length > 0;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(errorMsg);
    console.error('[enrichment] Fatal error:', errorMsg);
  }

  result.processingTime = Date.now() - startTime;
  return result;
}
