'use client';

import { useStore } from '@/lib/store';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Database,
  Dna,
  FileText,
  FlaskConical,
  Library,
  Lightbulb,
  Microscope,
  Scale,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react';
import * as React from 'react';
import { ApiSettingsDrawer } from './api-settings-drawer';
import { DarwinPanel } from './darwin-panel';
import { GlobalErrorBoundary } from './error-boundary';
import { GuidedTour, isTourCompleted } from './guided-tour';
import { LandingPage } from './landing-page';
import { QuickHints } from './quick-hints';
import { TopNav } from './top-nav';
import { Workspace } from './workspace/workspace';

export function AppShell() {
  const { ready, config, settingsOpen, setSettingsOpen, darwinOpen, setDarwinOpen, toast } =
    useStore();
  const hasKey = Boolean(config.provider && config.apiKey && config.model);
  const [tourOpen, setTourOpen] = React.useState(false);
  const [showLanding, setShowLanding] = React.useState(true);

  // Check if tour should be shown on first visit
  React.useEffect(() => {
    if (ready && hasKey && !isTourCompleted()) {
      // Delay tour start to allow UI to fully render
      const timer = setTimeout(() => {
        setTourOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ready, hasKey]);

  function handleStartTour() {
    setTourOpen(true);
  }

  function handleGetStarted() {
    setShowLanding(false);
    // If no API key configured, open settings
    if (!hasKey) {
      setSettingsOpen(true);
    }
  }

  function handleTourClose() {
    setTourOpen(false);
  }

  function handleTourComplete() {
    setTourOpen(false);
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-background bg-dot-grid flex items-center justify-center">
        <div className="text-muted-foreground font-mono text-xs">init…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {showLanding ? (
        <>
          <LandingPage onGetStarted={handleGetStarted} />
          {/* Keep settings drawer accessible from landing page */}
          <ApiSettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
        </>
      ) : (
        <GlobalErrorBoundary>
          <>
            {/* Add background grid only for app view */}
            <div className="fixed inset-0 bg-dot-grid pointer-events-none" aria-hidden="true" />

            <TopNav connected={hasKey} onTourStart={handleStartTour} />

            <main className="flex-1 relative">
              <GlobalErrorBoundary>
                {hasKey ? (
                  <Workspace />
                ) : (
                  <div className="relative h-full min-h-[calc(100vh-3.5rem)]">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none select-none opacity-30 blur-sm"
                    >
                      <Workspace decorative />
                    </div>
                    <Onboarding />
                  </div>
                )}
              </GlobalErrorBoundary>
            </main>

            <ApiSettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
            <DarwinPanel open={darwinOpen} onOpenChange={setDarwinOpen} />

            {/* Guided Tour */}
            <GuidedTour open={tourOpen} onClose={handleTourClose} />

            {/* Quick Hints for new users - show even without API key for better onboarding */}
            <QuickHints />

            {/* Toast */}
            {toast && (
              <div
                role="status"
                aria-live="polite"
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-3 py-2 rounded-md border border-border bg-card/95 backdrop-blur shadow-lg text-xs font-mono text-foreground/90 animate-in fade-in slide-in-from-bottom-2"
              >
                {toast}
              </div>
            )}
          </>
        </GlobalErrorBoundary>
      )}
    </div>
  );
}

function Onboarding() {
  const { setSettingsOpen } = useStore();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-purple-950/10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full space-y-10 text-center relative z-10">
        {/* Logo with glow effect */}
        <div className="space-y-5 flex justify-center">
          <div className="relative group">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#0f1829] to-[#0a1322] border border-white/[0.08] flex items-center justify-center shadow-2xl shadow-black/30 group-hover:shadow-indigo-500/20 transition-all duration-500 group-hover:scale-105">
              <svg viewBox="0 0 64 64" className="w-16 h-16" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="onboardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                    <stop offset="50%" stopColor="#a78bfa" stopOpacity={1} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <rect width="64" height="64" rx="14" fill="#070d1a" />
                <g transform="translate(32, 32)">
                  <path
                    d="M-9,-14 Q-12,-9 -9,-4 Q-6,1 -9,6 Q-12,11 -9,16"
                    stroke="url(#onboardGrad)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9,-14 Q12,-9 9,-4 Q6,1 9,6 Q12,11 9,16"
                    stroke="url(#onboardGrad)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <line
                    x1="-8"
                    y1="-11"
                    x2="8"
                    y2="-11"
                    stroke="#22d3ee"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                  <line
                    x1="-10"
                    y1="-5"
                    x2="10"
                    y2="-5"
                    stroke="#22d3ee"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                  <line
                    x1="-7"
                    y1="1"
                    x2="7"
                    y2="1"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                  <line
                    x1="-10"
                    y1="7"
                    x2="10"
                    y2="7"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                  <circle cx="0" cy="0" r="3.5" fill="url(#onboardGrad)" />
                  <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                </g>
              </svg>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
          </div>
        </div>

        {/* Title section */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            BME Research{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Accelerator
            </span>
          </h1>
          <p className="text-lg text-white/45 font-light leading-relaxed">
            AI-Powered Biomedical Engineering Research Platform
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-indigo-500/40" />
            <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-indigo-500/40" />
          </div>
        </div>

        {/* Feature Overview Cards - Complete Functionality Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto mt-8">
          {/* Core Analysis Modes (6 modes) */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 text-left group">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">6大核心分析模式</h3>
                <p className="text-xs text-white/35 font-mono">Core Analysis Modules</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                {
                  icon: Microscope,
                  name: 'Decompose',
                  desc: '深入分析单篇论文',
                  gradient: 'from-blue-500 to-cyan-500',
                  color: 'border-blue-500/25 hover:border-blue-400/50',
                },
                {
                  icon: Scale,
                  name: 'Compare',
                  desc: '对比2-4篇方法',
                  gradient: 'from-violet-500 to-purple-500',
                  color: 'border-violet-500/25 hover:border-violet-400/50',
                },
                {
                  icon: FlaskConical,
                  name: 'Reproduce',
                  desc: '生成复现蓝图',
                  gradient: 'from-emerald-500 to-green-500',
                  color: 'border-emerald-500/25 hover:border-emerald-400/50',
                },
                {
                  icon: Database,
                  name: 'Paradigm',
                  desc: '绘制领域全景图',
                  gradient: 'from-orange-500 to-amber-500',
                  color: 'border-orange-500/25 hover:border-orange-400/50',
                },
                {
                  icon: ShieldCheck,
                  name: 'Evidence',
                  desc: '验证证据强度',
                  gradient: 'from-teal-500 to-emerald-500',
                  color: 'border-teal-500/25 hover:border-teal-400/50',
                },
                {
                  icon: BookOpen,
                  name: 'Datasets',
                  desc: '推荐数据集路线',
                  gradient: 'from-pink-500 to-fuchsia-500',
                  color: 'border-pink-500/25 hover:border-pink-400/50',
                },
              ].map((mode) => (
                <div
                  key={mode.name}
                  className={`group/item p-3 rounded-xl bg-white/[0.03] border ${mode.color} cursor-pointer hover:bg-white/[0.05] transition-all duration-200`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mode.gradient} flex items-center justify-center mb-2 group-hover/item:scale-110 transition-transform`}
                  >
                    <mode.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-[11px] font-bold text-white/80 mb-0.5">{mode.name}</div>
                  <div className="text-[9px] text-white/35 leading-tight">{mode.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Tools (Darwin + References) */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 text-left group space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Dna className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">进阶工具</h3>
                <p className="text-xs text-white/35 font-mono">Advanced Tools</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer group/item">
                <div className="flex items-center gap-2.5 mb-2">
                  <Dna className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white/80">Darwin 进化器</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  从已有研究催生新想法 · 6种进化操作
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer group/item">
                <div className="flex items-center gap-2.5 mb-2">
                  <Library className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white/80">References 管理器</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  文献集中管理 · DOI抓取 · 引用格式
                </p>
              </div>
            </div>
          </div>

          {/* Professional Evaluation System */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 text-left group">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">专业评估体系</h3>
                <p className="text-xs text-white/35 font-mono">Evaluation Framework</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[11px] text-white/60">创新等级 L1-L5c</span>
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-400 font-mono font-bold">
                  12级
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[11px] text-white/60">致命缺陷检测</span>
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-red-500/15 text-red-400 font-mono font-bold">
                  11项
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[11px] text-white/60">临床验证等级</span>
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-mono font-bold">
                  V0-V5
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[11px] text-white/60">BME知识库</span>
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 font-mono font-bold">
                  27模块
                </span>
              </div>
            </div>
          </div>

          {/* Input Methods & Quick Start */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 text-left group">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">多种输入方式 + 快速开始</h3>
                <p className="text-xs text-white/35 font-mono">Input Methods & Quick Start</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                  输入方式
                </div>
                {[
                  { icon: FileText, label: '直接输入文本或DOI', desc: '例：10.1038/nature12345' },
                  { icon: Upload, label: '上传PDF文件', desc: '支持拖拽，最大30MB' },
                  { icon: Search, label: '粘贴URL链接', desc: '自动解析内容' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[11px] font-medium text-white/70">{item.label}</div>
                      <div className="text-[9px] text-white/30">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5">
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                  快速开始模板
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20">
                  <div className="text-[11px] font-medium text-indigo-300 mb-1.5">
                    热门场景示例：
                  </div>
                  <ul className="space-y-1.5">
                    {[
                      'ECG arrhythmia detection with attention',
                      'CheXNet vs AlphaFold2 innovation delta',
                      'Self-supervised ECG representation learning',
                    ].map((template) => (
                      <li
                        key={template}
                        className="flex items-center gap-1.5 text-[10px] text-white/50 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-indigo-400/60 shrink-0" />
                        <span className="truncate">{template}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="space-y-6 pt-8 max-w-2xl mx-auto">
          <button
            onClick={() => setSettingsOpen(true)}
            className="group relative w-full px-10 py-5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              Get Started - Configure API Key
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>

          <div className="flex items-center justify-center gap-4 text-xs text-white/35 font-medium">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400/60" />
              <span>Supports OpenClaw · Anthropic · OpenAI · Gemini · DeepSeek</span>
            </div>
          </div>

          {/* Tour hint */}
          <div className="pt-4 border-t border-white/[0.05]">
            <div
              className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 hover:border-indigo-500/30 transition-all group cursor-pointer"
              onClick={() => {
                // Trigger guided tour
                const event = new CustomEvent('start-guided-tour');
                window.dispatchEvent(event);
              }}
            >
              <Lightbulb className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="text-sm font-semibold text-indigo-300">新用户？查看完整引导教程</p>
                <p className="text-[10px] text-indigo-400/60 mt-0.5">
                  10分钟掌握全部功能 · 模拟BME导师教学
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-indigo-400/60 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
