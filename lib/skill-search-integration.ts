// ═══════════════════════════════════════════════════════════
// 🧬 ENHANCED LLM SEARCH INTEGRATION FOR SKILL ENGINE
// Real-time literature search with verification for use in conversations
// ═══════════════════════════════════════════════════════════

import { EnhancedLLMSearchEngine, type EnhancedSearchResult } from './enhanced-llm-search-engine';

const searchEngine = new EnhancedLLMSearchEngine();

export interface SearchContext {
  userQuery: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  detectedDomain?: string;
  userIntent?: 'LITERATURE_SEARCH' | 'VERIFICATION' | 'BACKGROUND' | 'COMPARISON';
  timePreference?: 'latest' | 'classic' | 'any';
}

export interface SearchResponse {
  success: boolean;
  results: EnhancedSearchResult | null;
  summaryForUser: string;
  suggestedActions: string[];
  canProceedWithAnalysis: boolean;
}

/**
 * Main integration function for Skill Engine to call enhanced search
 * This function handles the entire search + verify + format pipeline
 */
export async function searchLiteratureWithContext(
  context: SearchContext,
  options: {
    maxPapers?: number;
    requireVerification?: boolean;
    autoAnalyze?: boolean;
  } = {}
): Promise<SearchResponse> {
  const { maxPapers = 8, requireVerification = true, autoAnalyze = false } = options;

  console.log(`\n🔬 [Skill Engine Integration] Starting contextual search`);
  console.log(`   User Query: ${context.userQuery}`);
  console.log(`   Detected Domain: ${context.detectedDomain || 'auto-detect'}`);
  console.log(`   User Intent: ${context.userIntent || 'general'}`);

  try {
    // Execute enhanced search with automatic domain detection if not provided
    const searchResult = await searchEngine.searchAndVerify(context.userQuery, {
      maxPapers,
      sources: ['pubmed'],
      domain: context.detectedDomain,
      verifyResults: requireVerification,
    });

    // Check if we have verified results
    const hasVerifiedResults =
      searchResult.verificationStatus.overall === 'VERIFIED' ||
      searchResult.verificationStatus.overall === 'PARTIAL';

    if (!hasVerifiedResults && requireVerification) {
      return {
        success: false,
        results: searchResult,
        summaryForUser: `⚠️ 搜索完成但数据验证未通过（${searchResult.verificationStatus.overall}: ${searchResult.verificationStatus.papersVerified}/${searchResult.verificationStatus.papersTotal}）。建议重新搜索或检查网络连接。`,
        suggestedActions: ['尝试简化搜索关键词', '检查网络连接是否正常', '使用更通用的术语'],
        canProceedWithAnalysis: false,
      };
    }

    // Generate human-readable summary
    const summary = generateUserSummary(searchResult, context);

    // Suggest follow-up actions based on results
    const actions = suggestFollowUpActions(searchResult, context);

    return {
      success: true,
      results: searchResult,
      summaryForUser: summary,
      suggestedActions: actions,
      canProceedWithAnalysis: searchResult.totalResults > 0,
    };
  } catch (error) {
    console.error('❌ [Skill Engine Integration] Search failed:', error);

    return {
      success: false,
      results: null,
      summaryForUser: `❌ 搜索失败：${error instanceof Error ? error.message : '未知错误'}。请稍后重试或联系技术支持。`,
      suggestedActions: ['检查拼写和语法', '使用更简单的查询词', '稍后重试'],
      canProceedWithAnalysis: false,
    };
  }
}

function generateUserSummary(result: EnhancedSearchResult, context: SearchContext): string {
  const { papers, verificationStatus, executionTime, optimizedQuery } = result;

  if (papers.length === 0) {
    return `🔍 未找到与 "${context.userQuery}" 直接相关的论文。建议尝试不同的关键词或扩大搜索范围。`;
  }

  const topPaper = papers[0];
  const domains = [...new Set(papers.flatMap((p) => p.domainRelevance || []))];

  let summary = `✅ 找到 **${papers.length}** 篇相关论文`;

  // Add verification status
  if (verificationStatus) {
    const emoji =
      verificationStatus.overall === 'VERIFIED'
        ? '✅'
        : verificationStatus.overall === 'PARTIAL'
          ? '⚠️'
          : '⚡';
    summary += ` | 数据验证: ${emoji} ${verificationStatus.overall}`;
  }

  // Add timing info
  summary += ` | 耗时 ${executionTime}ms\n\n`;

  // Top result highlight
  if (topPaper) {
    summary += `**最相关论文**:\n`;
    summary += `- 📄 *${topPaper.title.substring(0, 100)}${topPaper.title.length > 100 ? '...' : ''}*\n`;
    summary += `- 👥 ${topPaper.authors.split(',')[0]} et al. (${topPaper.year})\n`;

    if (topPaper.citationCount) {
      summary += `- 📊 引用次数: ${topPaper.citationCount}\n`;
    }

    if (topPaper.enhancedScore) {
      summary += `- 🔥 相关性评分: ${(topPaper.relevanceScore * 100).toFixed(0)}%\n`;
    }

    if (domains.length > 0) {
      summary += `- 🏷️ 领域: ${domains.slice(0, 3).join(', ')}\n`;
    }
  }

  // Add note about query optimization if it was significantly changed
  if (
    optimizedQuery &&
    optimizedQuery !== context.userQuery &&
    optimizedQuery.length > context.userQuery.length * 1.5
  ) {
    summary += `\n💡 *系统自动优化了您的查询以获得更好的结果*`;
  }

  return summary;
}

function suggestFollowUpActions(result: EnhancedSearchResult, context: SearchContext): string[] {
  const actions: string[] = [];

  if (result.totalResults === 0) {
    actions.push('尝试使用同义词搜索');
    actions.push('扩大时间范围');
    return actions;
  }

  // Always offer these
  actions.push('查看论文详细分析');

  if (result.totalResults >= 3) {
    actions.push('对比分析前3篇论文');
  }

  if (context.userIntent === 'VERIFICATION') {
    actions.push('验证特定结论的可靠性');
  }

  if (context.userIntent === 'BACKGROUND') {
    actions.push('获取该领域的综述文章');
  }

  // Suggest domain-specific actions based on results
  const domains = [...new Set(result.papers.flatMap((p) => p.domainRelevance || []))];
  if (domains.includes('ECG')) {
    actions.push('查看ECG方法学最佳实践');
  }
  if (domains.includes('Medical Imaging')) {
    actions.push('了解医学影像数据集');
  }
  if (domains.includes('NLP')) {
    actions.push('探索临床NLP工具包');
  }

  // Limit to 5 suggestions
  return actions.slice(0, 5);
}

/**
 * Quick search function for simple queries (returns just papers, no analysis)
 */
export async function quickSearch(
  query: string,
  maxPapers: number = 5
): Promise<EnhancedSearchResult | null> {
  try {
    const result = await searchEngine.searchAndVerify(query, {
      maxPapers,
      verifyResults: true,
    });

    return result.totalResults > 0 ? result : null;
  } catch (error) {
    console.error('Quick search failed:', error);
    return null;
  }
}

/**
 * Verify a specific paper's data integrity in real-time
 */
export async function verifyPaperData(doi: string): Promise<{
  valid: boolean;
  details: any;
  timestamp: Date;
}> {
  try {
    const proof = await searchEngine.getRealtimeDataProof(doi);

    return {
      valid: proof.existsInDatabase,
      details: proof,
      timestamp: proof.retrievalTimestamp,
    };
  } catch (error) {
    console.error('Paper verification failed:', error);
    return {
      valid: false,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      timestamp: new Date(),
    };
  }
}

// Export convenience functions for direct usage in skill-execution-engine.ts
export { searchEngine as defaultSearchEngine, EnhancedLLMSearchEngine };
