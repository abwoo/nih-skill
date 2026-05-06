"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Scale, Target, FlaskConical, BarChart3 } from "lucide-react"

const TABS = [
  { id: "methods", label: "Methods", icon: FlaskConical },
  { id: "datasets", label: "Datasets", icon: Target },
  { id: "benchmarks", label: "Benchmarks", icon: BarChart3 },
  { id: "innovation", label: "Innovation", icon: Scale },
] as const

type TabId = (typeof TABS)[number]["id"]

const TABLE_DATA: Record<TabId, { headers: [string, string]; rows: [string, string, string][] }> = {
  methods: {
    headers: ["Paper A · CheXnet", "Paper B · AlphaFold2"],
    rows: [
      ["Backbone", "DenseNet-121 (2D)", "Evoformer + IPA"],
      ["Attention", "Channel-wise SE", "Pair / triangular attention"],
      ["Loss", "Weighted BCE", "FAPE + distogram"],
      ["Training", "SGD · cosine", "AdamW · warm-up"],
      ["Compute", "Titan X ×4 / 12h", "TPUv3 ×128 / 11d"],
    ],
  },
  datasets: {
    headers: ["Paper A · CheXnet", "Paper B · AlphaFold2"],
    rows: [
      ["Domain", "Chest X-ray", "Protein structure"],
      ["Training set", "ChestX-ray14 · 112K", "PDB · 170K chains"],
      ["External eval", "Stanford CheXpert", "CASP14 (87 targets)"],
      ["Modality", "Single-image", "MSA + templates"],
      ["License", "CC0 (public)", "Mixed · PDB redistribution"],
    ],
  },
  benchmarks: {
    headers: ["Paper A · CheXnet", "Paper B · AlphaFold2"],
    rows: [
      ["Primary metric", "F1 = 0.435", "GDT-TS = 92.4"],
      ["vs human", "F1 0.387 (radiologist)", "—"],
      ["vs prior SOTA", "+4.1 F1 over Wang+2017", "+30 GDT vs RoseTTAFold"],
      ["External drop", "−6.8% F1", "−1.2 GDT"],
      ["Inference", "~50ms / image", "~15min / chain"],
    ],
  },
  innovation: {
    headers: ["Paper A · CheXnet", "Paper B · AlphaFold2"],
    rows: [
      ["Innovation level", "L2d (new module)", "L5a (paradigm shift)"],
      ["Novel ingredient", "Pretraining + class re-balancing", "Geometric attention block"],
      ["Reproducibility", "★★★★☆", "★★☆☆☆"],
      ["Code released", "Yes (PyTorch)", "Partial · weights only"],
      ["Field impact", "Medical imaging adoption", "Redefined structure prediction"],
    ],
  },
}

const GAPS = [
  {
    title: "缺乏跨人群外部验证",
    feasibility: 78,
    tags: ["HIGH_IMPACT", "EXECUTABLE_NOW"],
    db: "PhysioNet · UK Biobank ECG",
  },
  {
    title: "未与最新 transformer 对比",
    feasibility: 64,
    tags: ["EXECUTABLE_NOW", "NEEDS_COMPUTE"],
    db: "Papers With Code · arXiv",
  },
  {
    title: "公开代码 + 训练日志缺失",
    feasibility: 32,
    tags: ["NEEDS_DATA"],
    db: "GitHub · Zenodo",
  },
]

export function CompareOutput() {
  const [tab, setTab] = React.useState<TabId>("methods")
  const data = TABLE_DATA[tab]
  return (
    <div className="mt-6 rounded-xl border border-border bg-card">
      <div className="px-5 py-4 border-b border-border">
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Scale className="h-3.5 w-3.5 text-violet" />
          Comparative Analysis
        </div>
        <h2 className="mt-1 text-lg font-semibold">
          Paper A · CheXnet 2017 <span className="text-muted-foreground mx-2">vs</span>{" "}
          Paper B · AlphaFold2 2021
        </h2>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-3 border-b border-border flex gap-1" role="tablist">
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-3 py-1.5 rounded-t-md text-xs font-medium border-b-2 inline-flex items-center gap-1.5",
                active
                  ? "border-violet text-violet"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="p-5">
        {/* Comparison table — content changes per tab */}
        <div
          key={tab}
          className="rounded-md border border-border overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <table className="w-full text-xs">
            <thead className="bg-secondary/60 text-muted-foreground font-mono">
              <tr className="text-left">
                <th className="px-3 py-2 font-normal w-1/4">{tab.charAt(0).toUpperCase() + tab.slice(1)}</th>
                <th className="px-3 py-2 font-normal">{data.headers[0]}</th>
                <th className="px-3 py-2 font-normal">{data.headers[1]}</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-2 text-muted-foreground">{r[0]}</td>
                  <td className="px-3 py-2 font-mono">{r[1]}</td>
                  <td className="px-3 py-2 font-mono">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Research gaps (only on Innovation tab — hint at gap analysis) */}
        {tab === "innovation" && (
          <div className="mt-6">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Research Gaps
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {GAPS.map((g) => (
                <div key={g.title} className="rounded-lg border border-border bg-secondary/40 p-3">
                  <div className="text-sm font-medium text-balance">{g.title}</div>
                  <div className="mt-2">
                    <div className="text-[10px] font-mono text-muted-foreground flex justify-between">
                      <span>feasibility</span>
                      <span>{g.feasibility}%</span>
                    </div>
                    <div className="h-1.5 mt-1 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={cn(
                          "h-full",
                          g.feasibility > 70
                            ? "bg-success"
                            : g.feasibility > 40
                              ? "bg-warning"
                              : "bg-danger",
                        )}
                        style={{ width: `${g.feasibility}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {g.tags.map((t) => (
                      <span
                        key={t}
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-mono border",
                          t === "HIGH_IMPACT" && "bg-warning/10 text-warning border-warning/40",
                          t === "EXECUTABLE_NOW" &&
                            "bg-success/10 text-success border-success/40",
                          t === "NEEDS_DATA" && "bg-pink/10 text-pink border-pink/40",
                          t === "NEEDS_COMPUTE" && "bg-primary/10 text-primary border-primary/40",
                        )}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Search: <span className="text-foreground/80 font-mono">{g.db}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
