'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowDown,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  Github,
  Globe,
  Heart,
  Lightbulb,
  Menu,
  Microscope,
  Play,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Upload,
  Users,
  X,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('');

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ['features', 'how-it-works', 'use-cases', 'pricing'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      {/* Animated background gradient - Enhanced */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: `
            radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.08), transparent 40%),
            radial-gradient(600px circle at ${mousePosition.x * 0.8}px ${mousePosition.y * 1.2}px, rgba(168, 85, 247, 0.05), transparent 40%)
          `,
        }}
      />

      {/* Subtle grid pattern with animation */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          animation: 'grid-move 20s linear infinite',
        }}
      />

      {/* Floating orbs */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="fixed bottom-20 right-10 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '2s' }}
      />

      {/* Navigation - Premium Glass Effect */}
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-[#030712]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl shadow-black/20'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo with subtle glow */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Image
                  src="/icon.svg"
                  alt="BME Research Accelerator"
                  width={42}
                  height={42}
                  className="rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white leading-none">
                  Research
                  <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Accelerator
                  </span>
                </span>
                <span className="text-[10px] text-white/40 font-medium tracking-wider uppercase mt-0.5">
                  BME Platform
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { id: 'features', label: 'Features' },
                { id: 'how-it-works', label: 'How it works' },
                { id: 'use-cases', label: 'Use cases' },
                { id: 'pricing', label: 'Pricing' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    'text-sm font-medium transition-all duration-300 relative py-1',
                    activeSection === item.id ? 'text-white' : 'text-white/50 hover:text-white/80'
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      'absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-300',
                      activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                    )}
                  />
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-white/60 hover:text-white hover:bg-white/5 font-medium"
              >
                <a
                  href="#documentation"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('pricing');
                  }}
                >
                  Documentation
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
              <Button
                size="sm"
                onClick={onGetStarted}
                className="gap-2 relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 font-semibold"
              >
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="h-4 w-4 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 hover:opacity-100 transition-opacity duration-500" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white/80 hover:text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/[0.06] shadow-2xl">
              <div className="px-6 py-6 space-y-4">
                {['features', 'how-it-works', 'use-cases', 'pricing'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className="block w-full text-left text-base font-medium text-white/70 hover:text-white capitalize transition-colors py-2"
                  >
                    {item.replace('-', ' ')}
                  </button>
                ))}
                <div className="pt-4 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-center border-white/20 text-white/80 hover:bg-white/5"
                    asChild
                  >
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      Documentation
                    </a>
                  </Button>
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onGetStarted();
                    }}
                    className="w-full justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  >
                    Get Started Free
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Ultra Premium */}
      <section className="relative pt-40 pb-32 sm:pt-52 sm:pb-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge - Refined with animation */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 mb-10 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span className="text-sm font-semibold text-indigo-300 tracking-wide">
                AI-Powered Biomedical Engineering Research Platform
              </span>
              <ChevronRight className="h-4 w-4 text-indigo-400/60" />
            </div>

            {/* Headline - Large, bold, with gradient accent */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-8 leading-[1.08] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <span className="text-white block mb-2">Accelerate your</span>
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  biomedical research
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 8C50 2 250 2 298 8"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
                      <stop offset="50%" stopColor="#c084fc" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#f472b6" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subheadline - More descriptive */}
            <p className="text-xl lg:text-2xl text-white/45 max-w-3xl mx-auto mb-14 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              An intelligent research assistant that parses papers, evaluates innovation levels,
              identifies fatal barriers, and accelerates experimental design —{' '}
              <span className="text-white/65 font-medium">all powered by advanced AI</span>.
            </p>

            {/* CTA Buttons - Premium styling with micro-interactions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="group gap-3 px-10 py-7 text-lg font-bold bg-white text-gray-900 hover:bg-white/95 transition-all duration-300 shadow-[0_0_50px_-10px_rgba(255,255,255,0.25)] hover:shadow-[0_0_70px_-10px_rgba(255,255,255,0.35)] hover:-translate-y-0.5 rounded-xl relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Start for free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="group gap-3 px-10 py-7 text-lg font-semibold border-white/15 text-white/75 hover:text-white hover:bg-white/[0.06] hover:border-white/25 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 rounded-xl"
                onClick={() => alert('Demo video coming soon!')}
              >
                <Play className="h-5 w-5 transition-transform group-hover:scale-110" />
                Watch demo
                <span className="ml-1 px-2 py-0.5 text-xs bg-white/10 rounded-md">2 min</span>
              </Button>
            </div>

            {/* Stats - Minimal, monospace with icons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              {[
                {
                  value: '200+',
                  label: 'Knowledge modules',
                  icon: BookOpen,
                  color: 'from-blue-400 to-cyan-400',
                },
                {
                  value: '28',
                  label: 'BME domains',
                  icon: Microscope,
                  color: 'from-violet-400 to-purple-400',
                },
                {
                  value: '6',
                  label: 'Analysis modes',
                  icon: Zap,
                  color: 'from-orange-400 to-amber-400',
                },
                {
                  value: '10x',
                  label: 'Faster research',
                  icon: TrendingUp,
                  color: 'from-emerald-400 to-green-400',
                },
              ].map((stat, idx) => (
                <div key={idx} className="group text-center cursor-default">
                  <div
                    className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} mb-4 opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 shadow-lg`}
                  >
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1 tabular-nums tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/30 uppercase tracking-widest font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Preview - Ultra premium dark themed */}
          <div className="mt-28 relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <div className="relative max-w-6xl mx-auto">
              {/* Multi-layer glow effect */}
              <div className="absolute -inset-8 bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-pink-500/30 rounded-3xl blur-3xl opacity-50 animate-pulse" />
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-3xl blur-2xl opacity-60" />

              {/* Mock UI - Dark theme with glass morphism */}
              <div className="relative bg-gradient-to-b from-[#0f1119] to-[#0a0d14]/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                {/* Window controls - macOS style with glow */}
                <div className="flex items-center gap-2.5 px-6 py-4 bg-gradient-to-b from-white/[0.04] to-transparent border-b border-white/[0.05]">
                  <div className="flex gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-red-500/30" />
                    <div className="w-3.5 h-3.5 rounded-full bg-[#febc2e] hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-yellow-500/30" />
                    <div className="w-3.5 h-3.5 rounded-full bg-[#28c840] hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-green-500/30" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs text-white/30 font-mono">
                        BME Research Accelerator — Workspace
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content preview with realistic layout */}
                <div className="grid grid-cols-12 gap-0 min-h-[480px] p-5">
                  {/* Left sidebar mockup */}
                  <div className="col-span-3 border-r border-white/[0.05] pr-4 space-y-3 hidden md:block">
                    <div className="h-10 bg-gradient-to-r from-white/[0.05] to-white/[0.02] rounded-lg border border-white/[0.06] flex items-center px-3 gap-2">
                      <Search className="h-3.5 w-3.5 text-white/20" />
                      <div className="h-3 w-20 bg-white/[0.06] rounded" />
                    </div>
                    <div className="space-y-2.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`bg-white/[0.02] rounded-lg border border-white/[0.04] p-3 hover:border-white/[0.08] transition-colors ${i === 1 ? 'border-indigo-500/30 bg-indigo-500/5' : ''}`}
                        >
                          <div className="h-2.5 w-3/4 bg-white/[0.06] rounded mb-2" />
                          <div className="h-2 w-1/2 bg-white/[0.04] rounded" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Center panel mockup */}
                  <div className="col-span-12 md:col-span-6 px-4 space-y-4">
                    <div className="h-12 bg-gradient-to-r from-white/[0.05] to-white/[0.02] rounded-xl border border-white/[0.06] flex items-center px-4 gap-3">
                      <div className="flex gap-1.5">
                        {['Decompose', 'Compare', 'Evidence'].map((tab, i) => (
                          <div
                            key={tab}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium ${i === 0 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-white/30'}`}
                          >
                            {tab}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3.5">
                      <div className="h-32 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 rounded-xl border border-indigo-500/20 p-4">
                        <div className="h-2.5 w-2/3 bg-white/10 rounded mb-3" />
                        <div className="h-2 w-full bg-white/5 rounded mb-2" />
                        <div className="h-2 w-4/5 bg-white/5 rounded" />
                      </div>
                      <div className="space-y-2.5">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="bg-white/[0.02] rounded-lg border border-white/[0.04] p-4 hover:border-white/[0.06] transition-colors"
                            style={{ height: `${64 + i * 16}px` }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shrink-0 mt-0.5" />
                              <div className="flex-1 space-y-2">
                                <div className="h-2.5 w-3/4 bg-white/[0.06] rounded" />
                                <div className="h-2 w-full bg-white/[0.04] rounded" />
                                <div className="h-2 w-2/3 bg-white/[0.04] rounded" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right sidebar mockup */}
                  <div className="col-span-3 border-l border-white/[0.05] pl-4 space-y-3 hidden lg:block">
                    <div className="h-10 bg-gradient-to-r from-white/[0.05] to-white/[0.02] rounded-lg border border-white/[0.06]" />
                    <div className="space-y-2.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="bg-white/[0.02] rounded-lg border border-white/[0.04] p-3 hover:border-white/[0.06] transition-colors"
                          style={{ height: `${56 + (i % 2) * 12}px` }}
                        >
                          <div className="h-2 w-full bg-white/[0.05] rounded mb-1.5" />
                          <div className="h-2 w-2/3 bg-white/[0.04] rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom glow line */}
              <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By - Subtle with logos */}
      <section className="py-24 border-t border-white/[0.05] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-950/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <p className="text-center text-sm text-white/25 mb-12 uppercase tracking-[0.3em] font-medium">
            Trusted by researchers at leading institutions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-16 opacity-20 hover:opacity-40 transition-opacity duration-700">
            {[
              'Harvard Medical',
              'Stanford BME',
              'MIT',
              'Johns Hopkins',
              'Oxford',
              'Cambridge',
              'ETH Zurich',
              'Tsinghua',
            ].map((name, idx) => (
              <div
                key={idx}
                className="text-base font-semibold text-white/90 tracking-wide whitespace-nowrap transition-transform hover:scale-105"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Card-based with enhanced visuals */}
      <section id="features" className="py-36 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-24">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/[0.08] text-xs font-bold text-indigo-400 mb-8 uppercase tracking-widest">
              <Zap className="h-4 w-4" /> Core Capabilities
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-8 text-white leading-tight">
              Everything you need to <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                accelerate research
              </span>
            </h2>
            <p className="text-lg text-white/35 font-light max-w-2xl mx-auto leading-relaxed">
              From paper parsing to experiment design — a complete toolkit for modern biomedical
              research.
            </p>
          </div>

          {/* Features Grid - Elevated cards with hover effects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[
              {
                icon: FileText,
                title: 'Intelligent PDF Parsing',
                description:
                  'Extract full content including figures, tables, and references from complex multi-column layouts.',
                gradient: 'from-blue-500 to-cyan-500',
                tag: 'Core',
              },
              {
                icon: Search,
                title: 'DOI Resolution Engine',
                description:
                  'Input any DOI to retrieve metadata, citation counts, and discover related literature instantly.',
                gradient: 'from-violet-500 to-purple-500',
                tag: 'Auto',
              },
              {
                icon: Brain,
                title: 'AI-Powered Analysis',
                description:
                  'LLM-driven structural analysis that evaluates innovation levels and identifies critical gaps.',
                gradient: 'from-orange-500 to-amber-500',
                tag: 'AI',
              },
              {
                icon: Microscope,
                title: 'Innovation Classification',
                description:
                  '12-tier system from reproduction (L1) to cross-domain unification (L5c).',
                gradient: 'from-emerald-500 to-green-500',
                tag: 'Smart',
              },
              {
                icon: Shield,
                title: 'Fatal Barrier Detection',
                description:
                  '11-dimension defect checker for data availability, code reproducibility, and validation.',
                gradient: 'from-red-500 to-rose-500',
                tag: 'Quality',
              },
              {
                icon: BookOpen,
                title: 'BME Knowledge Base',
                description:
                  '28 domain-specific modules covering gene editing, biomaterials, medical imaging, and more.',
                gradient: 'from-indigo-500 to-violet-500',
                tag: 'Rich',
              },
              {
                icon: Target,
                title: 'Multi-Mode Analysis',
                description:
                  'Six specialized modes: Decompose, Compare, Reproduce, Evidence, Datasets, Paradigm.',
                gradient: 'from-teal-500 to-emerald-500',
                tag: 'Flexible',
              },
              {
                icon: Users,
                title: 'Contextual Dialogue',
                description:
                  'Multi-turn conversations with full context retention for deep exploration and understanding.',
                gradient: 'from-pink-500 to-fuchsia-500',
                tag: 'Chat',
              },
              {
                icon: Globe,
                title: 'Unified Literature Search',
                description:
                  'Single interface for PubMed, OpenAlex, arXiv, and Crossref databases.',
                gradient: 'from-amber-500 to-yellow-500',
                tag: 'Unified',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-2 cursor-pointer"
              >
                {/* Tag badge */}
                <div className="absolute top-6 right-6 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold text-white/35 uppercase tracking-wider">
                  {feature.tag}
                </div>

                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br shadow-lg',
                    feature.gradient
                  )}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-indigo-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/35 leading-relaxed font-light">
                  {feature.description}
                </p>

                {/* Hover arrow indicator */}
                <div className="mt-6 flex items-center gap-2 text-indigo-400/0 group-hover:text-indigo-400/80 transition-all duration-300">
                  <span className="text-xs font-semibold">Learn more</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>

                {/* Multi-layer hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-2xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15" />
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 -z-10 blur-xl bg-white/[0.03]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Timeline style with animations */}
      <section
        id="how-it-works"
        className="py-36 bg-gradient-to-b from-white/[0.01] to-transparent relative"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/[0.08] text-xs font-bold text-indigo-400 mb-8 uppercase tracking-widest">
              <Rocket className="h-4 w-4" /> Workflow
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-8 text-white">
              Four steps to{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                deep insights
              </span>
            </h2>
            <p className="text-lg text-white/35 font-light">
              From upload to actionable insights in under 15 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection line with gradient */}
            <div className="hidden lg:block absolute top-28 left-[12.5%] right-[12.5%] h-px">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>

            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload Content',
                description:
                  'Drag & drop PDFs, paste DOIs, or describe your research question directly.',
                color: 'text-blue-400',
                bgColor: 'bg-blue-500/10',
                borderColor: 'border-blue-500/20',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                step: '02',
                icon: Zap,
                title: 'Select Mode',
                description:
                  'Choose from six specialized analysis modes tailored to your specific goal.',
                color: 'text-violet-400',
                bgColor: 'bg-violet-500/10',
                borderColor: 'border-violet-500/20',
                gradient: 'from-violet-500 to-purple-500',
              },
              {
                step: '03',
                icon: Brain,
                title: 'AI Analysis',
                description:
                  'System extracts information, evaluates innovation, identifies potential issues.',
                color: 'text-orange-400',
                bgColor: 'bg-orange-500/10',
                borderColor: 'border-orange-500/20',
                gradient: 'from-orange-500 to-amber-500',
              },
              {
                step: '04',
                icon: CheckCircle2,
                title: 'Get Insights',
                description:
                  'Receive structured reports with actionable recommendations and related work.',
                color: 'text-emerald-400',
                bgColor: 'bg-emerald-500/10',
                borderColor: 'border-emerald-500/20',
                gradient: 'from-emerald-500 to-green-500',
              },
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-2 h-full">
                  {/* Step number with gradient ring */}
                  <div className="relative mb-6">
                    <div
                      className={cn(
                        'inline-flex items-center justify-center w-16 h-16 rounded-2xl border-2',
                        item.bgColor,
                        item.borderColor
                      )}
                    >
                      <item.icon className={cn('w-8 h-8', item.color)} />
                    </div>
                    <div
                      className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white shadow-lg"
                      style={{
                        backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                        background: `linear-gradient(to bottom right, ${item.gradient.includes('blue') ? '#3b82f6, #06b6d4' : item.gradient.includes('violet') ? '#8b5cf6, #a855f7' : item.gradient.includes('orange') ? '#f97316, #f59e0b' : '#10b981, #22c55e'})`,
                      }}
                    >
                      {item.step}
                    </div>
                  </div>
                  <div className="text-xs font-mono text-white/20 mb-3 uppercase tracking-[0.2em] font-bold">
                    Step {item.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{item.title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed font-light">
                    {item.description}
                  </p>

                  {/* Step connector for mobile */}
                  {idx < 3 && (
                    <div className="lg:hidden flex justify-center mt-6">
                      <ArrowDown className="h-5 w-5 text-white/10" />
                    </div>
                  )}
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-2xl bg-gradient-to-br from-white/[0.05] to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases - Enhanced cards */}
      <section id="use-cases" className="py-36 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/3 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/[0.08] text-xs font-bold text-indigo-400 mb-8 uppercase tracking-widest">
              <Lightbulb className="h-4 w-4" /> Use Cases
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-8 text-white">
              Built for every{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                research scenario
              </span>
            </h2>
            <p className="text-lg text-white/35 font-light">
              Whether you're a student, PI, or clinician — there's a workflow for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {[
              {
                icon: BookOpen,
                title: 'Literature Review',
                subtitle: 'Comprehensive surveying',
                description:
                  'Rapidly understand the state of the art, identify research gaps, and discover high-impact papers in your field.',
                tags: ['Paradigm Mode', 'Citation Explorer'],
                user: 'PhD Students / Postdocs',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Microscope,
                title: 'Method Selection',
                subtitle: 'Comparative analysis',
                description:
                  'Compare multiple approaches side-by-side to select the optimal technical path for your research.',
                tags: ['Compare Mode', 'Innovation Levels'],
                user: 'Researchers / PIs',
                gradient: 'from-violet-500 to-purple-500',
              },
              {
                icon: FileText,
                title: 'Paper Reviewing',
                subtitle: 'Quality assessment',
                description:
                  'Systematically evaluate manuscript quality, check for methodological flaws, provide improvement suggestions.',
                tags: ['Evidence Mode', 'Fatal Barriers'],
                user: 'Reviewers / Editors',
                gradient: 'from-orange-500 to-amber-500',
              },
              {
                icon: Zap,
                title: 'Experiment Reproduction',
                subtitle: 'Blueprint generation',
                description:
                  'Generate detailed reproduction blueprints including parameter settings, code frameworks, and data requirements.',
                tags: ['Reproduce Mode', 'Dataset Recommendations'],
                user: 'Graduate Students / Engineers',
                gradient: 'from-emerald-500 to-green-500',
              },
            ].map((useCase, idx) => (
              <div
                key={idx}
                className="group relative p-9 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-2 cursor-pointer"
              >
                <div className="flex items-start gap-5 mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <useCase.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1 text-white group-hover:text-indigo-300 transition-colors">
                      {useCase.title}
                    </h3>
                    <p className="text-sm text-white/25 font-mono font-medium">
                      {useCase.subtitle}
                    </p>
                  </div>
                </div>
                <p className="text-white/45 mb-7 leading-relaxed font-light text-[15px]">
                  {useCase.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {useCase.tags.map((tag, tagIdx) => (
                      <span
                        key={tagIdx}
                        className="px-3 py-1.5 text-xs rounded-lg bg-white/[0.04] text-white/50 border border-white/[0.06] font-medium hover:bg-white/[0.06] transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-indigo-400/70 font-bold uppercase tracking-wider">
                    {useCase.user}
                  </span>
                </div>

                {/* Multi-layer hover effects */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Social proof */}
      <section className="py-36 bg-gradient-to-b from-white/[0.01] to-transparent relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-8 text-white">
              What researchers say
            </h2>
            <p className="text-lg text-white/35 font-light">
              Feedback from leading institutions worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[
              {
                quote:
                  'This tool has completely transformed my literature review workflow. What used to take a week now takes a day.',
                author: 'Dr. Sarah Chen',
                role: 'Postdoctoral Fellow, Stanford University',
                avatar: 'SC',
                rating: 5,
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                quote:
                  'The innovation classification system is incredibly precise. It helps me quickly determine which papers are worth reading deeply.',
                author: 'Prof. Michael Zhang',
                role: 'Principal Investigator, Harvard Medical School',
                avatar: 'MZ',
                rating: 5,
                gradient: 'from-violet-500 to-purple-500',
              },
              {
                quote:
                  'As a reviewer, the Fatal Barriers feature helped me discover hidden methodological issues in several manuscripts.',
                author: 'Dr. Emily Wang',
                role: 'Reviewer, Nature Biomedical Engineering',
                avatar: 'EW',
                rating: 5,
                gradient: 'from-orange-500 to-amber-500',
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="group p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400/90 text-yellow-400/90" />
                  ))}
                </div>
                <p className="text-white/55 mb-8 leading-relaxed italic font-light text-[15px]">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{testimonial.author}</div>
                    <div className="text-xs text-white/30 mt-0.5">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Premium card design */}
      <section id="pricing" className="py-36 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/[0.08] text-xs font-bold text-indigo-400 mb-8 uppercase tracking-widest">
              <Award className="h-4 w-4" /> Pricing
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-8 text-white">
              Simple,{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                transparent
              </span>{' '}
              pricing
            </h2>
            <p className="text-lg text-white/35 font-light">
              Just bring your own API key. No hidden fees.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="relative p-12 rounded-3xl bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent border border-white/[0.08] shadow-2xl shadow-black/30 hover:shadow-3xl hover:shadow-indigo-500/5 transition-all duration-500 hover:-translate-y-1">
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-xl shadow-indigo-500/40 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Recommended
              </div>

              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold mb-4 text-white">Free forever</h3>
                <div className="text-7xl font-black mb-3 text-white">
                  $0<span className="text-xl text-white/30 font-normal">/mo</span>
                </div>
                <p className="text-white/40 text-sm font-medium">Bring your own API key</p>
              </div>

              <ul className="space-y-5 mb-12">
                {[
                  'Unlimited analyses',
                  'All 6 analysis modes',
                  'PDF parsing & DOI resolution',
                  '28 BME knowledge modules',
                  'Multi-turn AI conversations',
                  'Literature search & citation explorer',
                  'Priority support',
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3.5 text-white/70 group/item">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover/item:bg-emerald-500/30 transition-colors">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <span className="font-medium text-[15px]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                onClick={onGetStarted}
                className="w-full gap-3 py-7 text-base font-bold bg-white text-gray-900 hover:bg-white/95 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 rounded-xl"
              >
                Get started free
                <ArrowRight className="h-5 w-5" />
              </Button>

              <p className="text-center text-xs text-white/25 mt-6 font-medium">
                No credit card required · Setup in 2 minutes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Powerful closing */}
      <section className="py-36 bg-gradient-to-b from-transparent via-indigo-950/10 to-indigo-950/20 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-indigo-400 mb-8">
            <Rocket className="h-4 w-4" />
            Join the future of research
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-8 text-white leading-tight">
            Ready to accelerate
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              your research?
            </span>
          </h2>
          <p className="text-xl text-white/35 mb-14 max-w-2xl mx-auto font-light leading-relaxed">
            Join thousands of researchers experiencing the new paradigm of AI-powered biomedical
            engineering research.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="group gap-3 px-14 py-8 text-lg font-bold bg-white text-gray-900 hover:bg-white/95 transition-all duration-300 shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_70px_-10px_rgba(255,255,255,0.4)] hover:-translate-y-1 rounded-xl relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                Start for free
                <Rocket className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-3 px-14 py-8 text-lg font-semibold border-white/20 text-white/80 hover:bg-white/[0.06] hover:text-white hover:border-white/30 transition-all duration-300 hover:-translate-y-1 rounded-xl"
              asChild
            >
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
                View on GitHub
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-white/25">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure & Private</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>No Data Retention</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Instant Setup</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Premium minimal */}
      <footer className="py-20 border-t border-white/[0.05] relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <Image
                  src="/icon.svg"
                  alt="BME Research Accelerator"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
                <span className="font-bold text-white/90 text-lg">
                  Research<span className="text-indigo-400">Accelerator</span>
                </span>
              </div>
              <p className="text-sm text-white/30 leading-relaxed font-light">
                AI-powered biomedical engineering research platform for the next generation of
                scientists.
              </p>
            </div>

            {/* Product links */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">
                Product
              </h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Use Cases', 'Changelog'].map((link) => (
                  <li key={link}>
                    <button
                      onClick={() =>
                        scrollToSection(
                          link.toLowerCase() === 'features'
                            ? 'features'
                            : link.toLowerCase() === 'pricing'
                              ? 'pricing'
                              : 'use-cases'
                        )
                      }
                      className="text-sm text-white/35 hover:text-white/70 transition-colors font-medium"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources links */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">
                Resources
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-sm text-white/35 hover:text-white/70 transition-colors font-medium flex items-center gap-1.5"
                  >
                    Documentation
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/35 hover:text-white/70 transition-colors font-medium flex items-center gap-1.5"
                  >
                    GitHub
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-sm text-white/35 hover:text-white/70 transition-colors font-medium flex items-center gap-1.5"
                  >
                    API Reference
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-sm text-white/35 hover:text-white/70 transition-colors font-medium"
                  >
                    Status
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-sm text-white/35 hover:text-white/70 transition-colors font-medium"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-sm text-white/35 hover:text-white/70 transition-colors font-medium"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-sm text-white/35 hover:text-white/70 transition-colors font-medium"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-sm text-white/25">
              <span>© {new Date().getFullYear()} Research Accelerator</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-red-400/60" />
                <span>Built for BME researchers</span>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/25 hover:text-white/60 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-white/25 hover:text-white/60 transition-colors"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animation keyframes */}
      <style jsx>{`
        @keyframes grid-move {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-20px, 20px);
          }
          50% {
            transform: translate(-20px, -20px);
          }
          75% {
            transform: translate(20px, -20px);
          }
        }
      `}</style>
    </div>
  );
}
