"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Conversation } from "@/lib/store"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Copy,
  Info,
  MessageSquare,
  Zap,
  Shield,
  BookOpen,
  Layers,
  Target,
} from "lucide-react"
import * as React from "react"

// GSD Reference Button Component - Premium styling
function ReferenceButton({
  name,
  desc,
  onClick
}: {
  name: string
  desc: string
  onClick: (name: string) => void
}) {
  return (
    <button
      onClick={() => onClick(name)}
      className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[10px] font-mono font-medium hover:bg-white/[0.05] hover:border-indigo-500/30 active:scale-95 transition-all duration-200 cursor-pointer"
      title={`${desc}\nClick to view encapsulated metadata`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 group-hover:shadow-emerald-400/70 transition-shadow" />
      <span className="text-white/70 group-hover:text-white/90 transition-colors">{name}</span>
      <Info className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity" />
    </button>
  )
}

const LEVELS: {
  id: string
  gradient: string
  desc: string
  example: string
}[] = [
  { id: "L1", gradient: "from-slate-500 to-slate-600", desc: "Replication / minor tweak", example: "标准 ResNet 在已知数据集复跑" },
  { id: "L2", gradient: "from-blue-500 to-cyan-500", desc: "Incremental method", example: "在已有 backbone 上换 attention" },
  { id: "L2b", gradient: "from-blue-500 to-cyan-500", desc: "New training trick", example: "新型数据增广策略" },
  { id: "L2c", gradient: "from-blue-500 to-cyan-500", desc: "New loss / regularizer", example: "新型对比损失" },
  { id: "L2d", gradient: "from-blue-500 to-cyan-500", desc: "New module", example: "替换 self-attention 为 MoE" },
  { id: "L2e", gradient: "from-blue-500 to-cyan-500", desc: "Architecture refinement", example: "U-Net + transformer skip" },
  { id: "L2f", gradient: "from-blue-500 to-cyan-500", desc: "New evaluation protocol", example: "新型外部验证流程" },
  { id: "L3", gradient: "from-violet-500 to-purple-500", desc: "Novel method on existing problem", example: "AlphaFold for protein folding" },
  { id: "L4", gradient: "from-orange-500 to-amber-500", desc: "New task / problem framing", example: "首次提出 federated diagnosis" },
  { id: "L5a", gradient: "from-red-500 to-rose-500", desc: "Paradigm shift", example: "Transformers replace RNN" },
  { id: "L5b", gradient: "from-yellow-400 to-amber-500", desc: "Field-defining theory", example: "Information theory" },
  { id: "L5c", gradient: "from-pink-500 via-purple-500 to-indigo-500", desc: "Cross-domain unification", example: "GPT 通用助手" },
]

const FB: {
  id: string;
  name: string;
  status: "none" | "red" | "amber" | "green";
  description?: string;
  action?: string;
}[] = [
  { id: "FB-1", name: "Data Availability", status: "green", description: "训练数据公开可用", action: "检查数据集链接" },
  { id: "FB-2", name: "Code Availability", status: "red", description: "代码未开源或链接失效", action: "联系作者获取代码" },
  { id: "FB-3", name: "Conflict of Interest", status: "amber", description: "潜在利益冲突需声明", action: "审查利益冲突声明" },
  { id: "FB-4", name: "Annotation Quality", status: "green", description: "标注质量经过验证", action: "查看标注协议" },
  { id: "FB-5", name: "Comparison Fairness", status: "amber", description: "基线对比可能不公平", action: "统一评估指标" },
  { id: "FB-6", name: "External Validation", status: "amber", description: "缺乏外部验证数据集", action: "添加多中心验证" },
  { id: "FB-7", name: "Reproduction Path", status: "red", description: "复现路径不清晰", action: "完善实验细节" },
  { id: "FB-8", name: "Label Noise", status: "green", description: "标签噪声可控", action: "查看噪声分析" },
  { id: "FB-9", name: "Demographic Bias", status: "amber", description: "可能存在人口统计学偏差", action: "进行公平性分析" },
  { id: "FB-10", name: "Causal Claims", status: "green", description: "因果声明合理", action: "审查因果推理" },
  { id: "FB-11", name: "Sample Size vs Complexity", status: "green", description: "样本量与模型复杂度匹配", action: "进行功效分析" },
]

const VSTAGES = [
  { id: "V0", label: "No validation", icon: AlertTriangle, color: "text-white/30" },
  { id: "V1", label: "Internal", icon: CheckCircle2, color: "text-white/50" },
  { id: "V2", label: "External", icon: CheckCircle2, color: "text-indigo-400" },
  { id: "V3", label: "Multi-site", icon: CheckCircle2, color: "text-emerald-400" },
  { id: "V4", label: "Prospective", icon: CheckCircle2, color: "text-teal-400" },
  { id: "V5", label: "RCT", icon: CheckCircle2, color: "text-green-400" },
]

export function LeftSidebar() {
  const { showToast, conversations: storeConversations, switchConversation, deleteConversation } = useStore()
  const [refsOpen, setRefsOpen] = React.useState(true)
  const [baselinesOpen, setBaselinesOpen] = React.useState(false)
  const [selectedLevel, setSelectedLevel] = React.useState<string | null>(null)
  const [selectedFB, setSelectedFB] = React.useState<string | null>(null)
  const currentValidation = "V2"

  // Get conversations from store (sorted by most recent)
  const conversations = React.useMemo(() => {
    return [...storeConversations].sort((a, b) => b.updatedAt - a.updatedAt)
  }, [storeConversations])

  // Format timestamp to relative time
  function formatTimeAgo(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  // Handle conversation click
  function handleConversationClick(conv: Conversation) {
    switchConversation(conv.id)
    showToast(`Loaded conversation: ${conv.title}`)
  }

  // Handle delete conversation
  function handleDeleteConversation(e: React.MouseEvent, convId: string) {
    e.stopPropagation()
    deleteConversation(convId)
    showToast("Conversation deleted")
  }

  function handleLevelClick(levelId: string) {
    setSelectedLevel(levelId)
    showToast(`Selected innovation level: ${levelId}`)
  }

  function handleFBClick(fbId: string) {
    setSelectedFB(fbId === selectedFB ? null : fbId)
    const fb = FB.find(f => f.id === fbId)
    if (fb) {
      showToast(`${fb.name}: ${fb.status.toUpperCase()}${fb.description ? ' - ' + fb.description : ''}`)
    }
  }

  function handleValidationClick(vId: string) {
    showToast(`Clinical validation level: ${vId} - ${VSTAGES.find(v => v.id === vId)?.label || ''}`)
  }

  function handleReferenceClick(refName: string) {
    showToast(`📚 ${refName}: Loading encapsulated metadata...`)

    fetch(`/api/skill-info?action=get_metadata&ref=${refName}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.metadata) {
          const meta = data.metadata
          showToast(
            `${meta.displayName} (v${meta.version})\n` +
            `📂 ${meta.category}\n` +
            `🎯 ${meta.applicableProtocols.length} applicable modules\n` +
            `📊 ${meta.sections.length} core sections\n` +
            `✅ Content securely encapsulated - Raw Markdown inaccessible`
          )
        } else {
          showToast(`Reference: ${refName}`)
        }
      })
      .catch(() => {
        showToast(`Reference: ${refName}`)
      })
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6 space-y-8 bg-[#070d1a]/50">
      {/* View Chat History - Premium card */}
      <div className="group p-3.5 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-indigo-500/10"
           onClick={() => {
             const convToggle = document.querySelector('[aria-label="Expand conversation sidebar"]') as HTMLButtonElement
             if (convToggle) {
               convToggle.click()
             } else {
               showToast("💬 Open conversation sidebar from left edge")
             }
           }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">View Chat History</div>
            <div className="text-[9px] text-white/35 mt-0.5">Click to open conversation panel →</div>
          </div>
          <ChevronDown className="w-4 h-4 text-white/30 group-hover:text-indigo-400 transition-colors" />
        </div>
      </div>

      {/* Quick Reference Section Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Quick Reference</h3>
        </div>
        <div className="h-px bg-gradient-to-r from-indigo-500/30 to-transparent" />
      </div>

      {/* Innovation Level - GSD styled */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-violet-400" />
          <h4 className="text-[11px] font-semibold text-white/80">Innovation Level</h4>
        </div>
        <div className="-mx-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="flex gap-1.5 px-1 w-max">
            {LEVELS.map((l) => (
              <Popover key={l.id}>
                <PopoverTrigger asChild>
                  <button
                    onClick={() => handleLevelClick(l.id)}
                    className={cn(
                      "relative px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border whitespace-nowrap",
                      "hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer",
                      "bg-gradient-to-br shadow-sm hover:shadow-md",
                      l.gradient,
                      selectedLevel === l.id && "ring-2 ring-white/40 shadow-lg scale-105",
                    )}
                  >
                    <span className="relative z-10 text-white drop-shadow-sm">{l.id}</span>
                    {/* Subtle glow on selected */}
                    {selectedLevel === l.id && (
                      <div className="absolute inset-0 rounded-lg bg-white/20 blur-md -z-10" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 bg-[#0f1525] border-white/[0.1] text-xs p-4 shadow-2xl">
                  <div className="font-mono font-bold text-white text-base mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{l.id}</div>
                  <div className="text-white/60 mt-2 leading-relaxed">{l.desc}</div>
                  <div className="mt-3 pt-3 border-t border-white/[0.08]">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">Example</span>
                    <div className="text-white/80 mt-1.5 pl-2 border-l-2 border-indigo-500/50">{l.example}</div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`[${l.id}] ${l.desc}: ${l.example}`)
                      showToast("Copied innovation level info")
                    }}
                    className="mt-3 w-full px-3 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-[10px] font-mono flex items-center gap-2 text-white/60 hover:text-white transition-colors border border-white/[0.06]"
                  >
                    <Copy className="h-3 w-3" /> Copy to clipboard
                  </button>
                </PopoverContent>
              </Popover>
            ))}
          </div>
        </div>
      </div>

      {/* Fatal Blockers - Enhanced list */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-red-400" />
          <h4 className="text-[11px] font-semibold text-white/80">Fatal Blockers</h4>
        </div>
        <ul className="space-y-1">
          {FB.map((b) => (
            <li
              key={b.id}
              onClick={() => handleFBClick(b.id)}
              className={cn(
                "group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px]",
                "cursor-pointer transition-all duration-200",
                "border border-transparent hover:border-white/[0.08]",
                b.status === "red" && "bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/20",
                b.status === "amber" && "bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/20",
                b.status === "green" && "bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/20",
                selectedFB === b.id && "ring-1 ring-indigo-500/50 bg-indigo-500/10 border-indigo-500/30",
              )}
            >
              <span className="font-mono text-[10px] text-white/40 w-10 shrink-0 font-bold">{b.id}</span>
              <span className="flex-1 truncate text-white/70 group-hover:text-white/90 transition-colors font-medium">{b.name}</span>
              <StatusDot status={b.status} />
            </li>
          ))}
        </ul>

        {/* Show details for selected FB */}
        {selectedFB && (
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] animate-in fade-in slide-in-from-bottom-2 duration-200">
            {(() => {
              const fb = FB.find(f => f.id === selectedFB)
              return fb ? (
                <div className="space-y-2">
                  <div className="text-[11px] font-medium text-white/80 leading-relaxed">{fb.description}</div>
                  {fb.action && (
                    <div className="text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1.5 transition-colors" onClick={(e) => {
                      e.stopPropagation()
                      showToast("Suggested action: " + fb.action!)
                    }}>
                      <Target className="h-3 w-3" />
                      {fb.action}
                    </div>
                  )}
                </div>
              ) : null
            })()}
          </div>
        )}
      </div>

      {/* Clinical Validation - Premium styled */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <h4 className="text-[11px] font-semibold text-white/80">Clinical Validation</h4>
        </div>
        <ol className="space-y-1.5 mt-2 pl-1">
          {VSTAGES.map((v, i) => {
            const reached = VSTAGES.findIndex((x) => x.id === currentValidation) >= i
            const current = v.id === currentValidation
            const Icon = v.icon

            return (
              <li key={v.id}>
                <button
                  onClick={() => handleValidationClick(v.id)}
                  className={cn(
                    "group w-full flex items-center gap-2.5 text-[11px]",
                    "rounded-lg px-3 py-2 cursor-pointer transition-all duration-200",
                    "border border-transparent hover:border-white/[0.08] hover:bg-white/[0.03]",
                    current && "bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border-indigo-500/30 shadow-sm",
                  )}
                >
                  <span
                    className={cn(
                      "h-5 w-5 grid place-items-center rounded-lg font-mono text-[9px] font-bold border shrink-0 transition-all duration-200",
                      current
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-400 shadow-md"
                        : reached
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : "bg-white/[0.04] text-white/30 border-white/[0.08]",
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                  <span className={cn(
                    "flex-1 text-left transition-colors",
                    current ? "text-white font-bold" : "text-white/50 group-hover:text-white/80",
                  )}>
                    {v.label}
                  </span>
                  {current && (
                    <span className="px-2 py-0.5 text-[9px] font-bold text-indigo-300 bg-indigo-500/20 rounded-md uppercase tracking-wider">Current</span>
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Active References - Complete knowledge base with GSD styling */}
      <Collapsible
        open={refsOpen}
        onToggle={() => setRefsOpen(!refsOpen)}
        title="Active References (27)"
      >
        <div className="space-y-4">
          {/* Signal Processing & Biosignals */}
          <ReferenceCategory
            title="Signal Processing & Biosignals"
            references={[
              { name: "ecg-methodology", desc: "ECG分析方法论" },
              { name: "eeg-bci-methodology", desc: "EEG脑机接口" },
              { name: "signal-processing-foundations", desc: "信号处理基础" },
              { name: "physionet-datasets", desc: "PhysioNet数据集" },
            ]}
            onClick={handleReferenceClick}
          />

          {/* Deep Learning & AI */}
          <ReferenceCategory
            title="Deep Learning & AI"
            references={[
              { name: "deep-learning-bme", desc: "深度学习BME应用" },
              { name: "clinical-nlp-llm-methodology", desc: "临床NLP与LLM" },
            ]}
            onClick={handleReferenceClick}
          />

          {/* Clinical & Statistical */}
          <ReferenceCategory
            title="Clinical & Statistical"
            references={[
              { name: "clinical-statistical-framework", desc: "临床统计框架" },
              { name: "clinical-documentation-decision-support", desc: "临床文档决策支持" },
              { name: "clinical-trial-design-methodology", desc: "临床试验设计" },
              { name: "research-ethics-fairness", desc: "研究伦理与公平性" },
              { name: "reproducibility-infrastructure", desc: "可复现性基础设施" },
            ]}
            onClick={handleReferenceClick}
          />

          {/* Genomics & Bioinformatics */}
          <ReferenceCategory
            title="Genomics & Bioinformatics"
            references={[
              { name: "genomics-bioinformatics-methodology", desc: "基因组学生物信息学" },
              { name: "causal-genomics-methodology", desc: "因果基因组学" },
              { name: "crispr-design-methodology", desc: "CRISPR设计方法" },
              { name: "epitranscriptomics-methodology", desc: "表观转录组学" },
              { name: "hi-c-3d-genome-methodology", desc: "Hi-C 3D基因组学" },
            ]}
            onClick={handleReferenceClick}
          />

          {/* Medical Imaging */}
          <ReferenceCategory
            title="Medical Imaging"
            references={[
              { name: "medical-imaging-methodology", desc: "医学影像方法论" },
            ]}
            onClick={handleReferenceClick}
          />

          {/* Drug Discovery & Pharmacology */}
          <ReferenceCategory
            title="Drug Discovery & Pharmacology"
            references={[
              { name: "drug-discovery-pharmacology-methodology", desc: "药物发现与药理学" },
              { name: "network-pharmacology-systems-biology", desc: "网络药理学与系统生物学" },
              { name: "precision-oncology-immunotherapy-methodology", desc: "精准肿瘤学与免疫治疗" },
              { name: "immunoinformatics-methodology", desc: "免疫信息学" },
            ]}
            onClick={handleReferenceClick}
          />

          {/* Experimental Methods */}
          <ReferenceCategory
            title="Experimental Methods"
            references={[
              { name: "experimental-design-methodology", desc: "实验设计方法论" },
              { name: "flow-cytometry-methodology", desc: "流式细胞术方法" },
              { name: "liquid-biopsy-methodology", desc: "液体活检方法" },
            ]}
            onClick={handleReferenceClick}
          />

          {/* Data & Integration */}
          <ReferenceCategory
            title="Data & Integration"
            references={[
              { name: "database-api-guide", desc: "数据库API指南" },
              { name: "research-synthesis-matching", desc: "研究综合与匹配" },
            ]}
            onClick={handleReferenceClick}
          />

          <div className="pt-4 border-t border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-white/30">
              <BookOpen className="h-3 w-3" />
              <span>27 core reference modules · Complete BME knowledge base</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-white/25">
              <Shield className="h-3 w-3" />
              <span>All content securely encapsulated · Raw Markdown inaccessible</span>
            </div>
          </div>
        </div>
      </Collapsible>

      {/* Baselines - Enhanced table */}
      <Collapsible
        open={baselinesOpen}
        onToggle={() => setBaselinesOpen(!baselinesOpen)}
        title="Baselines"
      >
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/[0.06]">
                <th className="text-left py-2.5 px-3 font-bold text-white/50 uppercase tracking-wider">Task</th>
                <th className="text-right py-2.5 px-3 font-bold text-white/50 uppercase tracking-wider">Human</th>
                <th className="text-right py-2.5 px-3 font-bold text-white/50 uppercase tracking-wider">Best AI</th>
              </tr>
            </thead>
            <tbody>
              {[
                { task: "ECG diag.", human: "75–85%", ai: "85–95%", aiColor: "text-emerald-400" },
                { task: "Chest X-ray", human: "70–80%", ai: "85–92%", aiColor: "text-emerald-400" },
                { task: "Sepsis AUROC", human: "—", ai: "70–85%", aiColor: "text-amber-400" },
              ].map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.04] cursor-pointer transition-colors group"
                  onClick={() => showToast(`${row.task}: Human ${row.human} vs AI ${row.ai}`)}
                >
                  <td className="py-2.5 px-3 text-white/70 group-hover:text-white transition-colors font-medium">{row.task}</td>
                  <td className="py-2.5 px-3 text-right text-white/50">{row.human}</td>
                  <td className={cn("py-2.5 px-3 text-right font-bold", row.aiColor)}>{row.ai}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Collapsible>

      {/* Interactive info panel - Minimal */}
      <div className="pt-4 border-t border-white/[0.06]">
        <button
          onClick={() => showToast("Left sidebar provides quick reference and interactive tools · 🔒 Secure encapsulation mode")}
          className="w-full text-left text-[10px] text-white/25 hover:text-white/50 transition-colors flex items-center gap-2 group"
        >
          <Info className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
          <span>All elements are interactive · 🔒 Secure mode</span>
        </button>
      </div>
    </div>
  )
}

// Helper Components with GSD Styling

function ReferenceCategory({
  title,
  references,
  onClick
}: {
  title: string
  references: Array<{ name: string; desc: string }>
  onClick: (name: string) => void
}) {
  return (
    <div>
      <div className="text-[9px] font-bold text-indigo-400/80 mb-2 uppercase tracking-widest flex items-center gap-1.5">
        <div className="w-1 h-1 rounded-full bg-indigo-400/60" />
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {references.map((r) => (
          <ReferenceButton key={r.name} name={r.name} desc={r.desc} onClick={onClick} />
        ))}
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: "none" | "red" | "amber" | "green" }) {
  if (status === "none")
    return <span className="h-2 w-2 rounded-full border border-white/20" />

  const colorMap = {
    red: "bg-red-500 shadow-sm shadow-red-500/50",
    amber: "bg-amber-500 shadow-sm shadow-amber-500/50",
    green: "bg-emerald-500 shadow-sm shadow-emerald-500/50",
  }

  return (
    <span className={cn(
      "h-2 w-2 rounded-full animate-pulse",
      colorMap[status]
    )} />
  )
}

function Collapsible({
  open,
  onToggle,
  title,
  children,
}: {
  open: boolean
  onToggle: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-[11px] font-bold text-white/70 hover:text-white transition-colors duration-200 cursor-pointer group"
      >
        <span className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400/60" />
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-300 text-white/30 group-hover:text-indigo-400",
            !open && "-rotate-90"
          )}
        />
      </button>
      {open && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  )
}
