"use client"

import { useStore } from "@/lib/store"
import {
  ArrowRight,
  Brain,
  FileText,
  Lightbulb,
  Microscope,
  Shield,
  Sparkles,
} from "lucide-react"
import * as React from "react"
import { ApiSettingsDrawer } from "./api-settings-drawer"
import { DarwinPanel } from "./darwin-panel"
import { GlobalErrorBoundary } from "./error-boundary"
import { GuidedTour, isTourCompleted } from "./guided-tour"
import { LandingPage } from "./landing-page"
import { QuickHints } from "./quick-hints"
import { TopNav } from "./top-nav"
import { Workspace } from "./workspace/workspace"

export function AppShell() {
  const { ready, config, settingsOpen, setSettingsOpen, darwinOpen, setDarwinOpen, toast } = useStore()
  const hasKey = Boolean(config.provider && config.apiKey && config.model)
  const [tourOpen, setTourOpen] = React.useState(false)
  const [showLanding, setShowLanding] = React.useState(true)

  // Check if tour should be shown on first visit
  React.useEffect(() => {
    if (ready && hasKey && !isTourCompleted()) {
      // Delay tour start to allow UI to fully render
      const timer = setTimeout(() => {
        setTourOpen(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [ready, hasKey])

  function handleStartTour() {
    setTourOpen(true)
  }

  function handleGetStarted() {
    setShowLanding(false)
    // If no API key configured, open settings
    if (!hasKey) {
      setSettingsOpen(true)
    }
  }

  function handleTourClose() {
    setTourOpen(false)
  }

  function handleTourComplete() {
    setTourOpen(false)
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-background bg-dot-grid flex items-center justify-center">
        <div className="text-muted-foreground font-mono text-xs">init…</div>
      </div>
    )
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
            <GuidedTour
              isOpen={tourOpen}
              onClose={handleTourClose}
              onComplete={handleTourComplete}
            />

            {/* Quick Hints for new users */}
            {hasKey && <QuickHints />}

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
  )
}

function Onboarding() {
  const { setSettingsOpen } = useStore()

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-purple-950/10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full space-y-12 text-center relative z-10">
        {/* Logo with glow effect */}
        <div className="space-y-6 flex justify-center">
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
                <rect width="64" height="64" rx="14" fill="#070d1a"/>
                <g transform="translate(32, 32)">
                  <path d="M-9,-14 Q-12,-9 -9,-4 Q-6,1 -9,6 Q-12,11 -9,16"
                        stroke="url(#onboardGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <path d="M9,-14 Q12,-9 9,-4 Q6,1 9,6 Q12,11 9,16"
                        stroke="url(#onboardGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <line x1="-8" y1="-11" x2="8" y2="-11" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
                  <line x1="-10" y1="-5" x2="10" y2="-5" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
                  <line x1="-7" y1="1" x2="7" y2="1" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
                  <line x1="-10" y1="7" x2="10" y2="7" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
                  <circle cx="0" cy="0" r="3.5" fill="url(#onboardGrad)"/>
                  <circle cx="0" cy="0" r="1.5" fill="#ffffff"/>
                </g>
              </svg>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
          </div>
        </div>

        {/* Title section */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            BME Research{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Accelerator
            </span>
          </h1>
          <p className="text-lg text-white/40 font-light max-w-md mx-auto leading-relaxed">
            AI-Powered Biomedical Engineering Research Platform
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-indigo-500/40" />
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-indigo-500/40" />
          </div>
        </div>

        {/* Features - Premium cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {[
            {
              icon: FileText,
              title: "PDF Parsing",
              desc: "Extract full content from complex papers",
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              icon: Microscope,
              title: "DOI Resolution",
              desc: "Fetch metadata & citations instantly",
              gradient: "from-violet-500 to-purple-500",
            },
            {
              icon: Brain,
              title: "Smart Analysis",
              desc: "AI-powered research evaluation",
              gradient: "from-orange-500 to-amber-500",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 text-left"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-base mb-2 text-white">{feature.title}</h3>
              <p className="text-xs text-white/35 leading-relaxed font-light">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="space-y-6 pt-6">
          <button
            onClick={() => setSettingsOpen(true)}
            className="group relative w-full px-8 py-5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              Get Started
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>

          <div className="flex items-center justify-center gap-3 text-xs text-white/30 font-medium">
            <Shield className="h-4 w-4" />
            <span>Supports OpenClaw · Anthropic · OpenAI · Gemini · DeepSeek</span>
          </div>

          {/* Tour hint */}
          <div className="pt-6 border-t border-white/[0.05]">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/5 border border-indigo-500/10">
              <Lightbulb className="h-4 w-4 text-indigo-400" />
              <p className="text-xs text-indigo-300/80 font-medium">
                New user? Interactive guide will start after configuration
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
