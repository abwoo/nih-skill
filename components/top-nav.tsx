"use client"

import { Button } from "@/components/ui/button"
import { getProvider } from "@/lib/providers"
import { useStore } from "@/lib/store"
import type { ModuleId } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  CheckCircle2,
  Database,
  Dna,
  FlaskConical,
  HelpCircle,
  Library,
  Microscope,
  Scale,
  Settings,
  Zap,
  Shield,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import * as React from "react"

const MODULES: Array<{
  id: ModuleId
  icon: React.ComponentType<{ className?: string }>
  label: string
  gradient: string
}> = [
  { id: "decompose", icon: Microscope, label: "Decompose", gradient: "from-blue-500 to-cyan-500" },
  { id: "compare", icon: Scale, label: "Compare", gradient: "from-violet-500 to-purple-500" },
  { id: "reproduce", icon: FlaskConical, label: "Reproduce", gradient: "from-emerald-500 to-green-500" },
  { id: "paradigm", icon: Database, label: "Paradigm", gradient: "from-orange-500 to-amber-500" },
  { id: "evidence", icon: CheckCircle2, label: "Evidence", gradient: "from-teal-500 to-emerald-500" },
  { id: "datasets", icon: BookOpen, label: "Datasets", gradient: "from-pink-500 to-fuchsia-500" },
]

interface TopNavProps {
  connected: boolean
  onTourStart?: () => void
}

export function TopNav({ connected, onTourStart }: TopNavProps) {
  const { config, module: currentModule, setModule, toggleSettings, toggleDarwin } = useStore()
  const providerInfo = getProvider(config.provider || "")

  return (
    <header className="h-[4rem] border-b border-white/[0.06] bg-[#070d1a]/95 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-5 shadow-lg shadow-black/20">
      {/* Left: Logo with GSD branding */}
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#0f1829] to-[#0a1322] border border-white/[0.08] grid place-items-center overflow-hidden shadow-lg shadow-indigo-500/10 group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:scale-105">
            <svg viewBox="0 0 32 32" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="navGradGSD" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                  <stop offset="50%" stopColor="#a78bfa" stopOpacity={1} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={1} />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="#070d1a"/>
              <g transform="translate(16, 16)">
                <path d="M-4.5,-7 Q-6,-4.5 -4.5,-2 Q-3,0.5 -4.5,3 Q-6,5.5 -4.5,7"
                      stroke="url(#navGradGSD)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
                <path d="M4.5,-7 Q6,-4.5 4.5,-2 Q3,0.5 4.5,3 Q6,5.5 4.5,7"
                      stroke="url(#navGradGSD)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
                <line x1="-4" y1="-5.5" x2="4" y2="-5.5" stroke="#22d3ee" strokeWidth="1" strokeLinecap="round" opacity="0.9"/>
                <line x1="-5" y1="-2.5" x2="5" y2="-2.5" stroke="#22d3ee" strokeWidth="1" strokeLinecap="round" opacity="0.9"/>
                <line x1="-3.5" y1="0.5" x2="3.5" y2="0.5" stroke="#10b981" strokeWidth="1" strokeLinecap="round" opacity="0.9"/>
                <line x1="-5" y1="3.5" x2="5" y2="3.5" stroke="#10b981" strokeWidth="1" strokeLinecap="round" opacity="0.9"/>
                <circle cx="0" cy="0" r="2" fill="url(#navGradGSD)"/>
                <circle cx="0" cy="0" r="1" fill="#ffffff"/>
              </g>
            </svg>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[13px] font-bold tracking-tight text-white">BME RA</span>
            <span className="text-[9px] text-white/35 font-medium tracking-wider uppercase mt-0.5">Research Accelerator</span>
          </div>
        </Link>
      </div>

      {/* Center: Provider Info + Module Switcher with GSD styling */}
      <div className="flex items-center gap-3 flex-1 max-w-4xl mx-auto">
        {/* Provider & Model Badge - Premium glass effect */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm shrink-0 shadow-sm hover:border-white/[0.12] transition-all duration-300">
          <div className={cn(
            "w-2 h-2 rounded-full shadow-sm",
            connected ? "bg-emerald-400 animate-pulse shadow-emerald-400/50" : "bg-white/20"
          )} />
          <span className="text-[11px] font-semibold text-white/80 tracking-wide">{providerInfo?.name || "No Provider"}</span>
          <span className="text-white/20 text-[10px]">·</span>
          <span className="text-[11px] text-white/50 truncate max-w-[120px] font-mono">{config.model || "no model"}</span>
        </div>

        {/* Module Buttons - GSD gradient style */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          {MODULES.map((m) => {
            const Icon = m.icon
            const isActive = currentModule === m.id
            return (
              <button
                key={m.id}
                onClick={() => setModule(m.id)}
                className={cn(
                  "relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300",
                  isActive
                    ? "text-white shadow-lg"
                    : "text-white/45 hover:text-white/80 hover:bg-white/[0.04]"
                )}
              >
                {isActive && (
                  <div className={cn("absolute inset-0 rounded-lg bg-gradient-to-br opacity-90", m.gradient)} style={{background: `linear-gradient(to bottom right, ${m.gradient.includes('blue') ? '#3b82f6, #06b6d4' : m.gradient.includes('violet') ? '#8b5cf6, #a855f7' : m.gradient.includes('emerald') ? '#10b981, #22c55e' : m.gradient.includes('orange') ? '#f97316, #f59e0b' : m.gradient.includes('teal') ? '#14b8a6, #10b981' : '#ec4899, #d946ef'})`}} />
                )}
                <Icon className={cn("w-3.5 h-3.5 relative z-10", isActive && "drop-shadow-sm")} />
                <span className="relative z-10 hidden sm:inline">{m.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: Token Usage + Actions - Refined buttons */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Token Usage - Minimal design */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[10px] font-mono text-white/40">
          <Zap className="w-3 h-3 text-yellow-400/60" />
          <span>~4.2K</span>
          <span className="text-white/20">/</span>
          <span>200K</span>
        </div>

        {/* Darwin Button - Enhanced with glow */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarwin}
          className={cn(
            "gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg",
            "bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20",
            "text-amber-400 border border-amber-500/25 hover:border-amber-500/40",
            "shadow-sm hover:shadow-md hover:shadow-amber-500/10 transition-all duration-300"
          )}
        >
          <Dna className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Darwin</span>
        </Button>

        {/* Reference Manager Button - Gradient accent */}
        <Link href="/reference-manager">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg",
              "bg-gradient-to-r from-indigo-500/10 to-violet-500/10 hover:from-indigo-500/20 hover:to-violet-500/20",
              "text-indigo-300 border border-indigo-500/25 hover:border-indigo-500/40",
              "shadow-sm hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300"
            )}
          >
            <Library className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">References</span>
          </Button>
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-white/[0.06]" />

        {/* Settings - Subtle icon button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSettings}
          className="gap-1 p-2 h-8 w-8 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all duration-300"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Button>

        {/* Help / Guided Tour - With badge */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onTourStart}
          className="gap-1 p-2 h-8 w-8 rounded-lg text-white/50 hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/25 transition-all duration-300 relative"
          title="Guided Tour / Help"
        >
          <HelpCircle className="w-4 h-4" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-400" />
        </Button>
      </div>
    </header>
  )
}
