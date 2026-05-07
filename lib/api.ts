import type { AppConfig, IntentTag, ModuleId } from './types';

export type ChatMessageContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string; detail?: 'auto' | 'low' | 'high' } }
    >;

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: ChatMessageContent;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
};

export type AnalysisRequest = {
  config: AppConfig;
  module: ModuleId;
  input: string;
  intent?: IntentTag;
  paperB?: string;
  extraPapers?: string[];
  domain?: string;
  scope?: string;
  env?: string[];
  customPrompt?: string;
  images?: string[];
  attachments?: Array<{
    name: string;
    type: 'pdf' | 'text' | 'doi' | 'url';
    content: string;
  }>;
  conversationHistory?: Array<{
    // NEW: Support conversation context for follow-up messages
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
};

export type SkillInfo = {
  name: string;
  description: string;
  lineCount: number;
  charCount: number;
  estimatedTokens: number;
  referenceFiles: string[];
  loaded: boolean;
};

export type StreamCallbacks = {
  onToken?: (token: string) => void;
  onDone?: (fullText: string) => void;
  onError?: (error: string) => void;
};

// Enhanced fetch with timeout and error handling
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 30000
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

function buildUserPrompt(req: AnalysisRequest): string {
  if (req.customPrompt) return req.customPrompt;

  const parts: string[] = [];

  switch (req.module) {
    case 'decompose':
      parts.push(
        `Analyze the following paper using Module 1 (Literature Quick Decomposition):\n\n${req.input}`
      );
      if (req.intent) parts.push(`Intent: ${req.intent}`);
      break;
    case 'compare':
      parts.push(
        `Compare the following papers using Module 2 (Multi-Paper Comparative Analysis):\n\nPaper A:\n${req.input}\n\nPaper B:\n${req.paperB ?? ''}`
      );
      if (req.extraPapers?.length) {
        req.extraPapers.forEach((p, i) => {
          if (p.trim()) parts.push(`\nPaper ${String.fromCharCode(67 + i)}:\n${p}`);
        });
      }
      break;
    case 'reproduce':
      parts.push(
        `Generate a reproduction blueprint using Module 3 (Experiment Reproduction Blueprint):\n\n${req.input}`
      );
      if (req.scope) parts.push(`Target scope: ${req.scope}`);
      if (req.env?.length) parts.push(`Compute environment: ${req.env.join(', ')}`);
      break;
    case 'paradigm':
      parts.push(
        `Map methodological paradigms using Module 4 (Paradigm Analysis):\n\n${req.input}`
      );
      break;
    case 'evidence':
      parts.push(
        `Verify evidence strength using Module 5 (Evidence Verification):\n\nClaim: ${req.input}`
      );
      break;
    case 'datasets':
      parts.push(
        `Find datasets and experiment guidance using Module 6 (Dataset & Experiment Guidance):\n\n${req.input}`
      );
      if (req.domain) parts.push(`Domain: ${req.domain}`);
      break;
  }

  return parts.join('\n\n');
}

function buildMessages(req: AnalysisRequest): ChatMessage[] {
  const userPrompt = buildUserPrompt(req);

  // CRITICAL: Build message array with conversation history for context
  const messages: ChatMessage[] = [];

  // Add conversation history if available (for follow-up messages)
  if (req.conversationHistory && req.conversationHistory.length > 0) {
    console.log(
      '[buildMessages] 💬 Adding',
      req.conversationHistory.length,
      'message(s) from conversation history'
    );

    // Convert history to ChatMessage format and add to messages
    req.conversationHistory.forEach((histMsg) => {
      messages.push({
        role: histMsg.role,
        content: histMsg.content,
      });
    });
  }

  // CRITICAL: If attachments exist, ensure file content is explicitly included
  if (req.attachments && req.attachments.length > 0) {
    console.log(
      '[buildMessages] 📎 Building message with',
      req.attachments.length,
      'attachment(s)'
    );

    // Build enhanced content that includes both user text AND file content
    const attachmentContents = req.attachments
      .map((att, idx) => {
        let content = `\n\n📎 Attachment ${idx + 1}: ${att.name} 📎\n`;
        content += `Type: ${att.type.toUpperCase()}`;

        if (att.type === 'pdf' || att.type === 'text') {
          // Include full content preview for PDF/text
          if (att.content) {
            // PDF files need MORE content for deep analysis (methods, results, etc.)
            // Increase limit for PDF to ensure complete paper analysis
            const maxLength = att.type === 'pdf' ? 50000 : 8000;
            const previewLength = Math.min(att.content.length, maxLength);
            const isFullContent = previewLength >= att.content.length;

            content += `\n✅ FULL PAPER CONTENT AVAILABLE (${previewLength}/${att.content.length} chars${isFullContent ? ' - COMPLETE' : ''})\n`;
            content += `═══════════════════════════════════════\n`;
            content += `${att.content.slice(0, previewLength)}`;
            content += `\n═══════════════════════════════════════`;

            if (!isFullContent) {
              content +=
                '\n⚠️ Note: Content was truncated. Use parse_pdf_content tool for complete extraction if needed.';
            } else {
              content +=
                '\n✅ This is the COMPLETE paper text. Use this for comprehensive analysis including methods, results, discussion, etc.';
            }
          }
        } else if (att.type === 'doi') {
          content += `\nDOI: ${att.content}`;
        }

        return content;
      })
      .join('');

    // Combine user prompt with attachment contents
    const enhancedContent = `${userPrompt}${attachmentContents}`;

    console.log('[buildMessages] 📄 Total message length:', enhancedContent.length, 'chars');

    // Add current user message to the messages array (which may contain history)
    messages.push({
      role: 'user',
      content: enhancedContent,
    });

    return messages; // Return complete array with history + current message
  }

  if (req.images?.length) {
    const content: ChatMessageContent = [
      { type: 'text', text: userPrompt },
      ...req.images.map((img) => ({
        type: 'image_url' as const,
        image_url: { url: img, detail: 'auto' as const },
      })),
    ];
    messages.push({ role: 'user', content });
    return messages;
  }

  // Default: add user message and return complete array
  messages.push({ role: 'user', content: userPrompt });
  return messages;
}

export async function fetchSkillInfo(): Promise<SkillInfo> {
  try {
    const res = await fetchWithTimeout('/api/skill-info', {}, 10000);
    if (!res.ok) throw new Error(`Failed to fetch skill info: ${res.status}`);
    return res.json();
  } catch (err) {
    console.error('[api] fetchSkillInfo error:', err instanceof Error ? err.message : String(err));
    throw err;
  }
}

// ========== SSE STRING EXTRACTOR (Frontend Fallback) ==========
// Extract text content from raw SSE format string
function extractContentFromSSEString(sseString: string): string {
  const lines = sseString.split('\n');
  let content = '';

  for (const line of lines) {
    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
      try {
        const jsonStr = line.replace('data: ', '');
        const parsed = JSON.parse(jsonStr);

        // Extract content from various OpenAI-compatible formats
        if (parsed.choices?.[0]?.delta?.content) {
          content += parsed.choices[0].delta.content;
        } else if (parsed.choices?.[0]?.message?.content) {
          content += parsed.choices[0].message.content;
        } else if (parsed.content && typeof parsed.content === 'string') {
          content += parsed.content;
        } else if (parsed.delta?.text) {
          content += parsed.delta.text;
        }
      } catch (e) {
        // Skip malformed lines
      }
    }
  }

  return content;
}

export async function runAnalysis(
  req: AnalysisRequest,
  callbacks?: StreamCallbacks
): Promise<string> {
  const messages = buildMessages(req);

  // 🎯🎯🎯 CRITICAL: Force non-streaming mode when attachments are present!
  // This ensures DSML tool calls are properly processed before showing to user
  const hasAttachments = req.attachments && req.attachments.length > 0;

  // If has attachments, override stream to false in the config sent to backend
  const effectiveStream = hasAttachments ? false : req.config.stream;

  console.log(
    `[runAnalysis] 📎 Attachments: ${hasAttachments ? 'YES (' + req.attachments?.length + ')' : 'NO'}, Stream mode: ${effectiveStream}`
  );

  // Wrap config in config object as expected by backend /api/chat
  const requestBody = {
    config: {
      provider: req.config.provider,
      apiKey: req.config.apiKey,
      model:
        req.config.provider === 'custom' && req.config.customModel
          ? req.config.customModel
          : req.config.model,
      temperature: req.config.temperature,
      maxTokens: req.config.maxTokens,
      stream: effectiveStream, // Use effectiveStream (false if attachments)
      injectSkill: req.config.injectSkill,
      includeRefs: req.config.includeRefs,
      baseUrl: req.config.baseUrl,
      deployment: req.config.deployment,
      enableTools: true,
    },
    messages,
  };

  if (effectiveStream && callbacks) {
    return streamAnalysis(requestBody, callbacks);
  }

  try {
    const res = await fetchWithTimeout(
      '/api/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...requestBody, stream: false }),
      },
      120000
    ); // 2分钟超时

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      const errMsg = err.error || `HTTP ${res.status}`;
      callbacks?.onError?.(errMsg);
      throw new Error(errMsg);
    }

    // 🛡️ Robust JSON parsing with SSE fallback
    let data;
    const responseText = await res.text();

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.warn(
        '[runAnalysis] ⚠️ Failed to parse as JSON, attempting SSE extraction:',
        parseError instanceof Error ? parseError.message : parseError
      );

      // If it looks like SSE format, extract content manually
      if (responseText.includes('data: ') || responseText.startsWith('data:')) {
        const extractedContent = extractContentFromSSEString(responseText);
        callbacks?.onDone?.(extractedContent);
        return extractedContent;
      }

      throw new Error(`Invalid response format: ${responseText.slice(0, 100)}...`);
    }

    const content =
      data.choices?.[0]?.message?.content ||
      data.content?.[0]?.text ||
      data.content || // Fallback for direct content field
      '';
    callbacks?.onDone?.(content);
    return content;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    callbacks?.onError?.(errMsg);
    throw err;
  }
}

async function streamAnalysis(
  body: Record<string, unknown>,
  callbacks: StreamCallbacks
): Promise<string> {
  try {
    const res = await fetchWithTimeout(
      '/api/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      180000
    ); // 3分钟超时

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      const errMsg = err.error || `HTTP ${res.status}`;
      callbacks.onError?.(errMsg);
      throw new Error(errMsg);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]' || trimmed === '[DONE]') continue;

        // Robust SSE parsing: handle multiple prefix formats
        let jsonStr = trimmed;

        // Remove various possible SSE prefixes
        const prefixes = ['data: ', 'data:', 'event: data ', 'event:data '];
        for (const prefix of prefixes) {
          if (jsonStr.startsWith(prefix)) {
            jsonStr = jsonStr.slice(prefix.length);
            break;
          }
        }

        // Skip if not JSON-like after prefix removal
        if (!jsonStr.startsWith('{') && !jsonStr.startsWith('[')) continue;

        try {
          const json = JSON.parse(jsonStr);

          // Extract content from multiple possible formats
          let token = '';

          // Standard OpenAI format: choices[0].delta.content
          if (json.choices?.[0]?.delta?.content) {
            token = json.choices[0].delta.content;
          }
          // Our wrapped format: { content: "..." }
          else if (typeof json.content === 'string' && !Array.isArray(json.content)) {
            token = json.content;
          }
          // Anthropic-style delta
          else if (json.delta?.text) {
            token = json.delta.text;
          }
          // Content array format
          else if (Array.isArray(json.content) && json.content.length > 0 && json.content[0].text) {
            token = (json.content as Array<{ text: string }>)[0].text;
          }

          if (token) {
            fullText += token;
            callbacks.onToken?.(token);
          }
        } catch (parseErr) {
          // Log but don't crash on malformed SSE lines
          console.warn(
            '[streamAnalysis] Skipping malformed SSE line:',
            parseErr instanceof Error ? parseErr.message : parseErr
          );
        }
      }
    }

    callbacks.onDone?.(fullText);
    return fullText;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    callbacks.onError?.(errMsg);
    throw err;
  }
}

export async function testConnection(config: AppConfig): Promise<{ ok: boolean; latency: number }> {
  const start = Date.now();

  try {
    const res = await fetchWithTimeout(
      '/api/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            provider: config.provider,
            apiKey: config.apiKey,
            model: config.model,
            temperature: 0,
            maxTokens: 10,
            stream: false,
            injectSkill: false,
            includeRefs: false,
            baseUrl: config.baseUrl,
            deployment: config.deployment,
            enableTools: false,
          },
          messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
        }),
      },
      15000
    ); // 15秒超时

    const latency = Date.now() - start;
    return { ok: res.ok, latency };
  } catch (err) {
    const latency = Date.now() - start;
    console.warn('[api] testConnection failed:', err instanceof Error ? err.message : String(err));
    return { ok: false, latency };
  }
}

export type FetchPaperResult = {
  success: boolean;
  text: string;
  source: string;
  title?: string;
  authors?: string;
  abstract?: string;
  fullText?: string;
  doi?: string;
  pmid?: string;
  pmcid?: string;
  url?: string;
  year?: string | number;
  journal?: string;
  keywords?: string;
  citationCount?: number;
  error?: string;
};

export async function fetchPaper(input: string): Promise<FetchPaperResult> {
  try {
    const res = await fetchWithTimeout(
      '/api/fetch-paper',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      },
      60000
    ); // 60秒超时

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[api] fetchPaper error:', errMsg);
    return {
      success: false,
      text: '',
      source: 'error',
      error: errMsg,
    };
  }
}

export type ParsePdfResult = {
  success: boolean;
  text: string;
  pages: number;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  sections?: Array<{ heading: string; content: string }>;
  references?: string[];
  error?: string;
  isScannedPdf?: boolean;
};

export async function parsePdf(file: File): Promise<ParsePdfResult> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetchWithTimeout(
      '/api/parse-pdf',
      {
        method: 'POST',
        body: formData,
      },
      60000
    ); // 60秒超时

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[api] parsePdf error:', errMsg);
    return {
      success: false,
      text: '',
      pages: 0,
      error: errMsg,
    };
  }
}

export type SearchResult = {
  title: string;
  authors: string;
  year: number | string;
  doi: string;
  pmid?: string;
  pmcid?: string;
  arxivId?: string;
  abstract: string;
  url: string;
  pdfUrl?: string;
  source: string;
  citationCount?: number;
  venue?: string;
};

export type SearchResponse = {
  success: boolean;
  query: string;
  source: string;
  count: number;
  totalAvailable?: number;
  hasRealData?: boolean; // NEW: indicates if results are from real APIs or fallback data
  apiStatus?: Record<string, { success: boolean; count: number; error?: string }>; // NEW: detailed API status per source
  performance?: { elapsedTimeMs: number }; // NEW: search timing information
  results: SearchResult[];
};

export async function searchPapers(
  query: string,
  source: 'all' | 'pubmed' | 'openalex' | 'arxiv' | 'crossref' = 'all',
  limit: number = 10,
  yearFrom?: number,
  yearTo?: number,
  sortBy: 'relevance' | 'date' | 'citations' = 'relevance'
): Promise<SearchResponse> {
  try {
    console.log('[api] searchPapers called:', { query, source, limit, yearFrom, yearTo, sortBy });

    const res = await fetchWithTimeout(
      '/api/search',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          source,
          limit,
          ...(yearFrom && { yearFrom }),
          ...(yearTo && { yearTo }),
          sortBy,
        }),
      },
      45000
    ); // 45秒超时

    console.log('[api] searchPapers response status:', res.status, res.ok);

    if (!res.ok) {
      const text = await res.text();
      let errorMsg = `HTTP ${res.status}`;

      try {
        const errJson = JSON.parse(text);
        errorMsg = errJson.error || errorMsg;
      } catch {
        if (text.includes('Internal Server Error')) {
          errorMsg = 'Server error - please try again';
        } else if (text.length < 200) {
          errorMsg = text || errorMsg;
        }
      }

      throw new Error(errorMsg);
    }

    const data = await res.json();
    console.log('[api] searchPapers success:', data.count, 'results');
    return data;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[api] searchPapers error:', errMsg);
    return {
      success: false,
      query,
      source,
      count: 0,
      results: [],
    };
  }
}

export type CitationEntry = {
  title: string;
  authors: string;
  year: number | string;
  doi: string;
  pmid?: string;
  citationCount?: number;
  url: string;
  source?: string;
  abstract?: string;
  venue?: string;
  isInfluential?: boolean;
};

export type CitationsResponse = {
  success: boolean;
  doi: string;
  direction: string;
  paperTitle: string;
  count: number;
  error?: string;
  results: CitationEntry[];
};

export async function getCitations(
  doi: string,
  direction: 'citations' | 'references' = 'citations',
  limit: number = 10
): Promise<CitationsResponse> {
  try {
    // Use the new lookup actions for real citation/reference data
    const action = direction === 'citations' ? 'lookup_citations' : 'lookup_references';

    const res = await fetchWithTimeout(
      '/api/citations',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          input: doi.trim(),
          limit,
        }),
      },
      30000
    ); // 30秒超时

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[api] getCitations error:', errMsg);
    return {
      success: false,
      doi,
      direction,
      paperTitle: '',
      count: 0,
      results: [],
    };
  }
}

export function detectInputType(input: string): string {
  const t = input.trim();
  if (/^10\.\d{4,9}\/[^\s]+$/i.test(t)) return 'DOI';
  if (/^doi:/i.test(t)) return 'DOI';
  if (/https?:\/\/doi\.org\//i.test(t)) return 'DOI';
  if (/https?:\/\/arxiv\.org\//i.test(t)) return 'arXiv';
  if (/^arxiv:/i.test(t)) return 'arXiv';
  if (/^\d{4}\.\d{4,5}(v\d+)?$/i.test(t)) return 'arXiv';
  if (/^PMC\d+$/i.test(t)) return 'PMC';
  if (/https?:\/\/www\.ncbi\.nlm\.nih\.gov\/pmc\//i.test(t)) return 'PMC';
  if (/https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\//i.test(t)) return 'PubMed';
  if (/^\d{7,}$/.test(t)) return 'PMID';
  if (/^https?:\/\//i.test(t)) return 'URL';
  return 'text';
}
