import type {
  DatabaseSource,
  NormalizedPaper,
  PaperResult,
  SearchAPIStatus,
} from '@/lib/types/api';
import { describe, expect, it } from '@jest/globals';

describe('API Types', () => {
  describe('PaperResult', () => {
    const validPaper: PaperResult = {
      title: 'Test Paper',
      authors: 'John Doe',
      year: '2024',
      doi: '10.1234/test',
      source: 'pubmed',
    };

    it('should create valid PaperResult', () => {
      expect(validPaper.title).toBe('Test Paper');
      expect(validPaper.source).toBe('pubmed');
    });

    it('should allow optional fields', () => {
      const minimalPaper: PaperResult = {
        title: 'Minimal',
        source: 'arxiv' as DatabaseSource,
      };
      expect(minimalPaper.authors).toBeUndefined();
      expect(minimalPaper.doi).toBeUndefined();
    });
  });

  describe('SearchAPIStatus', () => {
    it('should represent success status', () => {
      const status: SearchAPIStatus = {
        success: true,
        count: 10,
      };
      expect(status.success).toBe(true);
      expect(status.count).toBe(10);
    });

    it('should represent error status', () => {
      const status: SearchAPIStatus = {
        success: false,
        error: 'Rate limited',
      };
      expect(status.success).toBe(false);
      expect(status.error).toBe('Rate limited');
    });
  });

  describe('DatabaseSource', () => {
    const validSources: DatabaseSource[] = [
      'pubmed',
      'arxiv',
      'openalex',
      'crossref',
      'semantic-scholar',
      'user-llm',
    ];

    it.each(validSources)('should accept %s as valid source', (source) => {
      const paper: NormalizedPaper = {
        title: 'Test',
        source,
      };
      expect(paper.source).toBe(source);
    });
  });
});

describe('Logger', () => {
  // Note: Logger is tested indirectly through behavior
  it('should be importable', async () => {
    const { logger } = await import('@/lib/logger');
    expect(logger).toBeDefined();
    expect(typeof logger.log).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.warn).toBe('function');
  });
});
