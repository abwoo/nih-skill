export interface PaperResult {
  title: string
  authors?: string
  year?: string
  doi?: string
  arxivId?: string
  pmid?: string
  abstract?: string
  url?: string
  source: string
  relevanceScore?: number
}

export interface SearchAPIStatus {
  success: boolean
  count?: number
  error?: string
}

export interface SearchResponse {
  results: PaperResult[]
  apiStatus: Record<string, SearchAPIStatus>
  performance: {
    elapsedTimeMs: number
  }
  query: string
  totalResults: number
}

export interface APIMetadata {
  id?: string
  title?: string
  version?: string
  status?: 'active' | 'maintenance' | 'deprecated'
}

export type DatabaseSource = 'pubmed' | 'arxiv' | 'openalex' | 'crossref' | 'semantic-scholar' | 'user-llm'

export interface NormalizedPaper {
  title: string
  authors?: string
  year?: string
  doi?: string
  arxivId?: string
  pmid?: string
  abstract?: string
  url?: string
  source: DatabaseSource
}