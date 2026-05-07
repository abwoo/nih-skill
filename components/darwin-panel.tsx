'use client';

import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  ArrowRight,
  Beaker,
  GitBranch,
  Lightbulb,
  Loader2,
  Shuffle,
  Sparkles,
  Target,
  X,
  Zap,
} from 'lucide-react';
import * as React from 'react';
import { DnaSpinIcon } from './brand-icons';

type Move = 'transplant' | 'constrain' | 'fuse' | 'invert' | 'minimal' | 'extreme';

type EvolvedIdea = {
  title: string;
  rationale: string;
  novelty: string;
  difficulty: string;
  tags: string[];
  operator: string;
  references?: Array<{
    doi?: string;
    pmid?: string;
    title: string;
    year?: number;
  }>;
};

interface LiteratureSources {
  pubmedCount: number;
  papers?: Array<{ pmid: string; title: string }>;
}

interface AuditTrail {
  timestamp: string;
  totalTimeMs: number;
  steps: Array<{
    step: string;
    durationMs: number;
    [key: string]: any;
  }>;
  verification: {
    isRealData: boolean;
    usedLocalDatabase: boolean;
    usedReferencesFolder: boolean;
    externalAPIsCalled: Array<{
      name: string;
      url: string;
      status: string;
    }>;
    dataSources: {
      literatureFrom: string;
      ideasGeneratedBy: string;
      notFrom: string[];
    };
    proofPoints: string[];
  };
}

const MOVES: {
  id: Move;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}[] = [
  {
    id: 'transplant',
    label: 'Transplant',
    icon: GitBranch,
    desc: '把 A 领域的方法迁移到 B 领域',
  },
  {
    id: 'constrain',
    label: 'Constrain',
    icon: Target,
    desc: '在更严苛的约束下重做（小数据、低算力）',
  },
  {
    id: 'fuse',
    label: 'Fuse',
    icon: Shuffle,
    desc: '融合两个独立 paradigm 的优势',
  },
  {
    id: 'invert',
    label: 'Invert',
    icon: Zap,
    desc: '反转优化目标 / 因果方向',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    icon: Beaker,
    desc: '最小可行验证：1 周可完成的对照',
  },
  {
    id: 'extreme',
    label: 'Extreme',
    icon: Lightbulb,
    desc: '推到极端：scaling / regime shift',
  },
];

export function DarwinPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { config, prefillFor, showToast } = useStore();
  const [seed, setSeed] = React.useState(
    'ECG arrhythmia detection · MIT-BIH · ResNet-1D + attention'
  );
  const [picked, setPicked] = React.useState<Move[]>(['transplant', 'fuse']);
  const [running, setRunning] = React.useState(false);
  const [shown, setShown] = React.useState(false);
  const [ideas, setIdeas] = React.useState<EvolvedIdea[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [performance, setPerformance] = React.useState<{
    elapsedTimeMs: number;
    breakdown?: { literatureSearch: number; promptBuild: number; llmInference: number };
  } | null>(null);
  const [literatureSources, setLiteratureSources] = React.useState<LiteratureSources | null>(null);
  const [auditTrail, setAuditTrail] = React.useState<AuditTrail | null>(null);

  function sendToDecompose(text: string) {
    prefillFor('decompose', text);
    onOpenChange(false);
    showToast('已发送到 Decompose 并切换模块');
  }

  function toggle(id: Move) {
    setPicked((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function evolve() {
    if (running || picked.length === 0) return;

    // Validate seed input
    const trimmedSeed = seed.trim();
    if (!trimmedSeed || trimmedSeed.length < 5) {
      setError('❌ Seed Idea 至少需要 5 个字符');
      showToast('请输入研究想法（至少5个字符）');
      return;
    }

    // Check for API key
    if (!config.apiKey) {
      setError('❌ 请先配置 API Key（点击右上角 Settings）');
      showToast('请先配置 API Key');
      return;
    }

    setRunning(true);
    setShown(false);
    setError(null);
    setIdeas([]);
    setPerformance(null);

    console.log(
      `[Darwin] Starting evolution with seed: "${trimmedSeed}" and operators: [${picked.join(', ')}]`
    );

    try {
      const startTime = Date.now();

      const response = await fetch('/api/darwin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seed: trimmedSeed, // Use trimmed version
          operators: picked,
          config: {
            provider: config.provider,
            apiKey: config.apiKey,
            model: config.model,
            temperature: config.temperature || 0.8,
            maxTokens: config.maxTokens || 4000,
          },
        }),
      });

      const data = await response.json();
      const elapsed = Date.now() - startTime;
      setPerformance({
        elapsedTimeMs: elapsed,
        breakdown: data.performance?.breakdown,
      });

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || `HTTP ${response.status}`);
      }

      console.log(`[Darwin] ✅ Evolution completed! Generated ${data.count} ideas in ${elapsed}ms`);

      setIdeas(data.ideas || []);
      setLiteratureSources(data.literatureSources || null);
      setAuditTrail(data.auditTrail || null);

      // Log audit trail for verification
      if (data.auditTrail) {
        console.log(`[Darwin] 🔍 AUDIT TRAIL:`);
        console.log(`  - isRealData: ${data.auditTrail.verification.isRealData}`);
        console.log(`  - usedLocalDatabase: ${data.auditTrail.verification.usedLocalDatabase}`);
        console.log(
          `  - APIs called: ${data.auditTrail.verification.externalAPIsCalled.map((a) => a.name).join(', ')}`
        );
        console.log(`  - Proof points:`, data.auditTrail.verification.proofPoints);
      }
      setShown(true);

      // Show literature info if available
      const litInfo = data.literatureSources;
      if (litInfo && litInfo.pubmedCount > 0) {
        showToast(
          `🧬 演化完成！${data.count}个想法 | 📚 ${litInfo.pubmedCount} PubMed论文 (${elapsed}ms)`
        );
      } else {
        showToast(`🧬 演化完成！生成 ${data.count} 个新研究想法 (${elapsed}ms)`);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[Darwin] ❌ Evolution failed:', errMsg);
      setError(errMsg);
      showToast(`演化失败: ${errMsg.slice(0, 100)}`);
    } finally {
      setRunning(false);
    }
  }

  function handleClose() {
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="darwin-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'absolute right-0 top-0 h-full w-full sm:max-w-[560px]',
          'bg-card border-l border-border shadow-2xl',
          'flex flex-col',
          'animate-in slide-in-from-right duration-300 ease-out'
        )}
      >
        {/* Header */}
        <header className="px-5 py-4 border-b border-border flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 grid place-items-center rounded-md bg-warning/15 text-warning">
            <DnaSpinIcon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="darwin-title" className="text-base font-semibold flex items-center gap-2">
              Darwin · Idea Evolution
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-warning/15 text-warning border border-warning/30 flex-shrink-0">
                REAL-TIME LLM
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              通过 LLM 将 seed idea 演化为多个创新研究方向
            </p>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'hover:bg-secondary text-muted-foreground hover:text-foreground'
            )}
            aria-label="关闭面板"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Seed */}
          <section className="space-y-2">
            <h3 className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
              Seed Idea
            </h3>
            <textarea
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              rows={2}
              className={cn(
                'w-full px-3 py-2 rounded-md',
                'bg-secondary/40 border border-border text-sm font-mono',
                'resize-none focus:outline-none focus:ring-2 focus:ring-warning/50',
                'placeholder:text-muted-foreground/50'
              )}
              placeholder="输入你的研究想法..."
            />
          </section>

          {/* Moves */}
          <section className="space-y-2">
            <h3 className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
              Evolution Moves · 选择 1-6 个
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {MOVES.map((m) => {
                const active = picked.includes(m.id);
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggle(m.id)}
                    className={cn(
                      'text-left p-3 rounded-md border transition-all duration-150',
                      'bg-secondary/30 hover:bg-secondary/60',
                      active
                        ? 'border-warning/60 ring-1 ring-warning/40 bg-warning/5'
                        : 'border-border hover:border-primary/30'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        className={cn(
                          'h-4 w-4 transition-colors',
                          active ? 'text-warning' : 'text-muted-foreground'
                        )}
                      />
                      <span
                        className={cn(
                          'text-sm font-medium transition-colors',
                          active ? 'text-warning' : 'text-foreground'
                        )}
                      >
                        {m.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-relaxed">
                      {m.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Run Button */}
          <button
            type="button"
            onClick={evolve}
            disabled={running || picked.length === 0}
            className={cn(
              'w-full px-4 py-3 rounded-lg font-medium transition-all duration-200',
              'bg-warning text-[#070d1a] hover:bg-warning/90',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              running && 'animate-pulse'
            )}
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 inline-block animate-spin" />
                正在搜索文献 & 调用 LLM...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1.5 inline-block" /> 🧬 Run Evolution (LLM + PubMed)
              </>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="rounded-md border border-danger/30 bg-danger/10 p-3 space-y-1 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-danger text-sm font-medium">
                <AlertCircle className="h-4 w-4" />
                演化失败
              </div>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          )}

          {/* Audit Trail - Transparency Report */}
          {shown && auditTrail && (
            <div className="rounded-md border border-success/30 bg-success/5 p-3 space-y-2 animate-in fade-in duration-500">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('audit-trail-details');
                  if (el) el.classList.toggle('hidden');
                }}
                className="w-full flex items-center justify-between text-[11px] font-mono text-success font-medium hover:text-success/80"
              >
                <span>🔍 Data Source Verification Report</span>
                <span className="text-[9px]">Click to expand</span>
              </button>

              {/* Quick Summary */}
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div
                  className={cn(
                    'px-2 py-1 rounded border',
                    auditTrail.verification.isRealData
                      ? 'border-success/30 bg-success/10 text-success'
                      : 'border-danger/30 bg-danger/10 text-danger'
                  )}
                >
                  ✅ Real External APIs:{' '}
                  {
                    auditTrail.verification.externalAPIsCalled.filter((a) => a.status === 'SUCCESS')
                      .length
                  }
                  /{auditTrail.verification.externalAPIsCalled.length}
                </div>
                <div
                  className={cn(
                    'px-2 py-1 rounded border',
                    !auditTrail.verification.usedLocalDatabase
                      ? 'border-success/30 bg-success/10 text-success'
                      : 'border-danger/30 bg-danger/10 text-danger'
                  )}
                >
                  ❌ Local Database:{' '}
                  {auditTrail.verification.usedLocalDatabase ? 'YES (BAD)' : 'NO (GOOD)'}
                </div>
              </div>

              {/* Detailed Audit Trail (collapsible) */}
              <div
                id="audit-trail-details"
                className="hidden space-y-2 mt-2 pt-2 border-t border-border/50"
              >
                {/* APIs Called */}
                <div className="space-y-1">
                  <div className="text-[9px] font-mono text-muted-foreground">
                    External APIs Called:
                  </div>
                  {auditTrail.verification.externalAPIsCalled.map((api, idx) => (
                    <div key={idx} className="text-[8px] font-mono pl-2 flex items-center gap-1">
                      <span className={api.status === 'SUCCESS' ? 'text-success' : 'text-warning'}>
                        {api.status === 'SUCCESS' ? '✅' : '⚠️'}
                      </span>
                      <a
                        href={api.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate max-w-[200px]"
                        title={api.url}
                      >
                        {api.name}
                      </a>
                      <span className="text-muted-foreground">({api.status})</span>
                    </div>
                  ))}
                </div>

                {/* Time Breakdown */}
                {performance?.breakdown && (
                  <div className="space-y-1">
                    <div className="text-[9px] font-mono text-muted-foreground">
                      Time Breakdown:
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[8px] font-mono pl-2">
                      <div>📚 PubMed: {performance.breakdown.literatureSearch}ms</div>
                      <div>📝 Prompt: {performance.breakdown.promptBuild}ms</div>
                      <div>🧠 LLM: {performance.breakdown.llmInference}ms</div>
                    </div>
                  </div>
                )}

                {/* Proof Points */}
                <div className="space-y-1">
                  <div className="text-[9px] font-mono text-muted-foreground">Evidence:</div>
                  {auditTrail.verification.proofPoints.map((point, idx) => (
                    <div key={idx} className="text-[8px] font-mono pl-2 text-success/80">
                      • {point}
                    </div>
                  ))}
                </div>

                {/* Data Sources */}
                <div className="space-y-1">
                  <div className="text-[9px] font-mono text-muted-foreground">Data Sources:</div>
                  <div className="text-[8px] font-mono pl-2 space-y-0.5">
                    <div className="text-primary">
                      From: {auditTrail.verification.dataSources.literatureFrom}
                    </div>
                    <div className="text-primary">
                      Generated by: {auditTrail.verification.dataSources.ideasGeneratedBy}
                    </div>
                    <div className="text-danger/60">
                      NOT from: {auditTrail.verification.dataSources.notFrom.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-[8px] font-mono text-muted-foreground pt-1 border-t border-border/30">
                  Verification timestamp: {new Date(auditTrail.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Output */}
          {shown && ideas.length > 0 && (
            <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
                  🧬 Evolved Ideas · {ideas.length}
                </h3>
                <div className="flex items-center gap-2">
                  {performance && (
                    <span className="text-[9px] font-mono text-success">
                      ⏱️ {performance.elapsedTimeMs}ms
                    </span>
                  )}
                  {literatureSources && literatureSources.pubmedCount > 0 && (
                    <span className="text-[9px] font-mono text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                      📚 {literatureSources.pubmedCount} PubMed
                    </span>
                  )}
                </div>
              </div>

              {/* Literature Sources Summary - Only show if we actually have papers */}
              {literatureSources &&
                literatureSources.papers &&
                literatureSources.papers.length > 0 && (
                  <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5 space-y-1.5">
                    <div className="text-[10px] font-mono text-primary font-medium flex items-center gap-1">
                      📚 Academic Literature Sources (Real-time from PubMed)
                    </div>

                    <div className="space-y-1">
                      <div className="text-[9px] text-muted-foreground">From PubMed:</div>
                      {literatureSources.papers.slice(0, 3).map((paper, idx) => (
                        <div
                          key={idx}
                          className="text-[9px] font-mono text-muted-foreground pl-2 truncate"
                          title={`PMID: ${paper.pmid} - ${paper.title}`}
                        >
                          • {paper.title.slice(0, 60)}...
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="space-y-3">
                {ideas.map((idea, index) => (
                  <article
                    key={index}
                    className={cn(
                      'rounded-md border border-border bg-secondary/30 p-3',
                      'hover:border-primary/30 hover:bg-secondary/50 transition-all duration-200'
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-sm font-medium leading-snug text-balance">
                        {idea.title}
                      </h4>
                      <span className="text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded bg-violet/15 text-violet border border-violet/30">
                        {idea.novelty}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      {idea.rationale}
                    </p>

                    {/* References */}
                    {idea.references && idea.references.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                        <div className="text-[9px] font-mono text-primary flex items-center gap-1">
                          📖 References ({idea.references.length})
                        </div>
                        {idea.references.map((ref, refIdx) => (
                          <div key={refIdx} className="text-[9px] text-muted-foreground pl-2">
                            {ref.doi ? (
                              <a
                                href={`https://doi.org/${ref.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary underline"
                              >
                                DOI: {ref.doi}
                              </a>
                            ) : ref.pmid ? (
                              <a
                                href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary underline"
                              >
                                PMID: {ref.pmid}
                              </a>
                            ) : null}
                            {ref.title && (
                              <span
                                className="ml-1 truncate inline-block max-w-[200px]"
                                title={ref.title}
                              >
                                {ref.title}
                              </span>
                            )}
                            {ref.year && (
                              <span className="ml-1 text-muted-foreground/60">({ref.year})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex flex-wrap gap-1">
                        {idea.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border"
                          >
                            {t}
                          </span>
                        ))}
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-warning/10 text-warning border border-warning/20">
                          {idea.operator}
                        </span>
                        {idea.references && idea.references.length > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            📚 {idea.references.length} refs
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sendToDecompose(idea.title);
                        }}
                        className="text-[11px] inline-flex items-center gap-1 text-primary hover:text-primary/80 hover:underline transition-colors"
                      >
                        Send to Decompose
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {!shown && !running && !error && picked.length > 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm space-y-2">
              <Sparkles className="h-8 w-8 mx-auto opacity-20" />
              <p>选择算子后点击按钮开始演化</p>
              <p className="text-[10px]">将调用真实 LLM API + PubMed 生成研究想法</p>
            </div>
          )}

          {/* No API Key Warning */}
          {!config.apiKey && !running && (
            <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-center">
              <p className="text-[11px] text-warning">
                ⚠️ 请先在 Settings 中配置 API Key 才能使用达尔文演化功能
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-5 py-3 border-t border-border text-[11px] text-muted-foreground font-mono flex items-center justify-between bg-secondary/20 shrink-0">
          <span>Darwin v3.0 · LLM + PubMed</span>
          <div className="flex items-center gap-2">
            {literatureSources && literatureSources.pubmedCount > 0 && (
              <span className="text-primary">📚 {literatureSources.pubmedCount} refs</span>
            )}
            <span className="font-bold text-warning">{picked.length} ops</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
