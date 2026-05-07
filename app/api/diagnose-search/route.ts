import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<
    string,
    {
      status: number | string;
      count?: number;
      ids?: string[];
      sample?: string[];
      error?: string | null;
    }
  > = {};
  const startTime = Date.now();

  console.log(`[diagnostic] ══════ SEARCH DIAGNOSTIC STARTED ══════`);
  console.log(`[diagnostic] 🎯 MODE: Pure PubMed Only (No Semantic Scholar)`);

  // Test 1: PubMed (PRIMARY SEARCH SOURCE)
  try {
    console.log('[diagnostic] Testing PubMed (NCBI E-utilities)...');

    let pubmedUrl =
      'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=deep+learning+ECG&retmax=5&retmode=json';

    if (process.env.NCBI_API_KEY && process.env.NCBI_API_KEY.trim() !== '') {
      pubmedUrl += '&api_key=' + process.env.NCBI_API_KEY.trim();
      console.log('[diagnostic] ✅ Using NCBI API Key');
    }

    const pubmedRes = await fetch(pubmedUrl, { signal: AbortSignal.timeout(10000) });
    const pubmedData = await pubmedRes.json();
    results['PubMed'] = {
      status: pubmedRes.status,
      count: pubmedData.esearchresult?.count || 0,
      ids: (pubmedData.esearchresult?.idlist || []).slice(0, 5),
      error: null,
    };
    console.log('[diagnostic] ✅ PubMed OK:', pubmedData.esearchresult?.count, 'results found');
  } catch (e) {
    results['PubMed'] = {
      status: 'ERROR',
      count: 0,
      error: e instanceof Error ? e.message : String(e),
    };
    console.log('[diagnostic] ❌ PubMed FAILED:', e instanceof Error ? e.message : String(e));
  }

  // Test 2: OpenAlex (Supplementary)
  try {
    console.log('[diagnostic] Testing OpenAlex (supplementary)...');
    const oaUrl = 'https://api.openalex.org/works?search=deep+learning+ECG&per_page=5&select=title';
    const oaRes = await fetch(oaUrl, {
      headers: { 'User-Agent': 'BME-Research-Accelerator/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    const oaData = await oaRes.json();
    results['OpenAlex'] = {
      status: oaRes.status,
      count: oaData.meta?.result_count || 0,
      sample: (oaData.results || []).slice(0, 2).map((p: any) => p.title),
      error: null,
    };
    console.log('[diagnostic] ✅ OpenAlex OK:', oaData.meta?.result_count || 0, 'results found');
  } catch (e) {
    results['OpenAlex'] = {
      status: 'ERROR',
      count: 0,
      error: e instanceof Error ? e.message : String(e),
    };
    console.log('[diagnostic] ❌ OpenAlex FAILED:', e instanceof Error ? e.message : String(e));
  }

  // Test 3: arXiv (Preprints only)
  try {
    console.log('[diagnostic] Testing arXiv (preprints)...');
    const arxivUrl =
      'http://export.arxiv.org/api/query?search_query=all:deep+learning+ECG&max_results=5';
    const arxivRes = await fetch(arxivUrl, { signal: AbortSignal.timeout(15000) });
    const arxivText = await arxivRes.text();

    const entryCount = (arxivText.match(/<entry>/g) || []).length;
    const titles = [...arxivText.matchAll(/<title>([\s\S]*?)<\/title>/g)]
      .slice(0, 2)
      .map((m) => m[1].replace(/<[^>]+>/g, ''));

    results['arXiv'] = {
      status: arxivRes.status,
      count: entryCount,
      sample: titles,
      error: null,
    };
    console.log('[diagnostic] ✅ arXiv OK:', entryCount, 'results found');
  } catch (e) {
    results['arXiv'] = {
      status: 'ERROR',
      count: 0,
      error: e instanceof Error ? e.message : String(e),
    };
    console.log('[diagnostic] ❌ arXiv FAILED:', e instanceof Error ? e.message : String(e));
  }

  // Test 4: Crossref (DOI metadata)
  try {
    console.log('[diagnostic] Testing Crossref (DOI registry)...');
    const crUrl = 'https://api.crossref.org/works?query=deep+learning+ECG&rows=5&select=DOI,title';
    const crRes = await fetch(crUrl, {
      headers: { 'User-Agent': 'BME-Research-Accelerator/1.0 (mailto:bme-research@example.com)' },
      signal: AbortSignal.timeout(15000),
    });
    const crData = await crRes.json();
    results['Crossref'] = {
      status: crRes.status,
      count: crData.message?.['total-results'] || 0,
      sample: (crData.message?.items || []).slice(0, 2).map((p: any) => p.title?.[0]),
      error: null,
    };
    console.log(
      '[diagnostic] ✅ Crossref OK:',
      crData.message?.['total-results'] || 0,
      'results found'
    );
  } catch (e) {
    results['Crossref'] = {
      status: 'ERROR',
      count: 0,
      error: e instanceof Error ? e.message : String(e),
    };
    console.log('[diagnostic] ❌ Crossref FAILED:', e instanceof Error ? e.message : String(e));
  }

  const totalTime = Date.now() - startTime;

  console.log(`[diagnostic] ══════ DIAGNOSTIC COMPLETED ══════`);
  console.log(`[diagnostic] Total time: ${totalTime}ms`);
  console.log(`[diagnostic] 🎯 Primary Search: PubMed - ${results.PubMed?.status}`);
  console.log(`[diagnostic] ❌ Semantic Scholar: REMOVED (not used)`);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    totalTimeMs: totalTime,
    mode: 'PURE_PUBMED_ONLY',
    query: 'deep learning ECG',
    primarySearchSource: 'PubMed (NCBI)',
    semanticScholarStatus: '❌ REMOVED - Not used in this system',
    results,
    summary: Object.entries(results).map(([name, data]: [string, any]) => ({
      source: name,
      success: data.status !== 'ERROR',
      resultCount: data.count,
      error: data.error,
    })),
    note: 'This system uses ONLY PubMed for academic search. Semantic Scholar has been completely removed.',
  });
}
