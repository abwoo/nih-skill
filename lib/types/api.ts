export interface PaperResult {
  title: string;
  authors?: string;
  year?: string;
  doi?: string;
  arxivId?: string;
  pmid?: string;
  abstract?: string;
  url?: string;
  source: string;
  relevanceScore?: number;
}

export interface SearchAPIStatus {
  success: boolean;
  count?: number;
  error?: string;
}

export interface SearchResponse {
  results: PaperResult[];
  apiStatus: Record<string, SearchAPIStatus>;
  performance: {
    elapsedTimeMs: number;
  };
  query: string;
  totalResults: number;
}

export interface APIMetadata {
  id?: string;
  title?: string;
  version?: string;
  status?: 'active' | 'maintenance' | 'deprecated';
}

export type DatabaseSource =
  | 'pubmed'
  | 'arxiv'
  | 'openalex'
  | 'crossref'
  | 'semantic-scholar'
  | 'user-llm';

export interface NormalizedPaper {
  title: string;
  authors?: string;
  year?: string;
  doi?: string;
  arxivId?: string;
  pmid?: string;
  abstract?: string;
  url?: string;
  source: DatabaseSource;
}

// Dataset types for datasets API
export interface UCIDatasetItem {
  name: string;
  description?: string;
  task?: string;
  format?: string;
  size?: string;
}

export interface UCIMetadata {
  name: string;
  description: string;
  task?: string;
  format?: string;
  size?: string;
}

export interface UCITaskItem {
  name: string;
  description?: string;
}

// Crossref API response types
export interface CrossrefMessage {
  items?: Array<{
    DOI?: string;
    title?: string[];
  }>;
  ['total-results']?: number;
}

// Verify API status type
export interface APIVerificationResult {
  name: string;
  status: '✅ LIVE' | '⚠️ PARTIAL' | '❌ DOWN';
  isReal?: boolean;
  details?: string;
}

// Raw paper result from various sources (internal use)
export interface RawPaperResult {
  title: string;
  authors?: string;
  year?: string;
  doi?: string;
  arxivId?: string;
  pmid?: string;
  abstract?: string;
  url?: string;
  source: DatabaseSource;
  [key: string]: unknown;
}
