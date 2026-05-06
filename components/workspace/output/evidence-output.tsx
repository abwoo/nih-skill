"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, Quote } from "lucide-react"

const SUPPORT = [
  {
    src: "Rajpurkar et al. 2017 (CheXNet)",
    type: "Original paper",
    strength: 78,
    finding: "DenseNet-121 在 ChestX-ray14 子集 F1 优于 4 名放射科医师平均。",
  },
  {
    src: "McKinney et al. 2020 (Nature)",
    type: "Multi-site validation",
    strength: 72,
    finding: "AI 在乳腺癌筛查 ROC 上略优于美国/英国双中心放射科医师。",
  },
]

const CONTRA = [
  {
    src: "Liu et al. 2019 (Lancet Digital Health, meta-analysis)",
    type: "Meta-analysis",
    strength: 64,
    finding: "在 prospective 真实临床流上，AI 与医师差异统计上不显著。",
  },
  {
    src: "Roberts et al. 2021 (Nat. Mach. Intell.)",
    type: "Bias review",
    strength: 70,
    finding: "62 项 COVID 影像 AI 模型存在严重数据泄露与样本偏倚。",
  },
]

export function EvidenceOutput() {
  return (
    <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-teal" />
          Evidence Verification
        </div>
        <div className="mt-2 rounded-md border-l-4 border-teal bg-secondary/40 p-3">
          <Quote className="h-3.5 w-3.5 text-teal mb-1" />
          <p className="text-sm leading-relaxed text-foreground/90 italic">
            "AI reads chest X-rays better than radiologists."
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
        <ColumnList title="Supporting Evidence" tone="success" items={SUPPORT} />
        <ColumnList title="Contradictory Evidence" tone="danger" items={CONTRA} />
      </div>

      {/* Gauge + verdict */}
      <div className="px-5 py-5 border-t border-border grid md:grid-cols-2 gap-5 items-center">
        <ConfidenceGauge value={58} />
        <div className="rounded-md border border-warning/40 bg-warning/8 p-4">
          <div className="text-warning font-semibold tracking-wide flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> MODERATE · 58% confidence
          </div>
          <p className="text-xs text-foreground/85 mt-1 leading-relaxed">
            ⚠ 该陈述在受控基准上成立，但在 prospective 真实临床流中证据较弱；
            存在数据泄露与人群偏倚风险。建议补充 multi-site 与 prospective 证据。
          </p>
        </div>
      </div>
    </div>
  )
}

function ColumnList({
  title,
  tone,
  items,
}: {
  title: string
  tone: "success" | "danger"
  items: { src: string; type: string; strength: number; finding: string }[]
}) {
  return (
    <div className="p-5">
      <div
        className={cn(
          "text-[11px] font-mono uppercase tracking-wider mb-3",
          tone === "success" ? "text-success" : "text-danger",
        )}
      >
        {title}
      </div>
      <ul className="space-y-3">
        {items.map((it) => (
          <li
            key={it.src}
            className="rounded-md border border-border bg-secondary/30 p-3"
          >
            <div className="text-xs font-mono text-foreground">{it.src}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{it.type}</div>
            <div className="mt-2">
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn(
                    "h-full",
                    tone === "success" ? "bg-success" : "bg-danger",
                  )}
                  style={{ width: `${it.strength}%` }}
                />
              </div>
              <div className="text-[10px] font-mono mt-1 text-muted-foreground">
                strength · {it.strength}%
              </div>
            </div>
            <p className="text-xs mt-2 text-foreground/85 leading-relaxed">{it.finding}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ConfidenceGauge({ value }: { value: number }) {
  // SVG arc gauge
  const r = 70
  const cx = 90
  const cy = 90
  const start = -180 // degrees
  const end = -180 + (value / 100) * 180
  const polar = (deg: number) => {
    const rad = (deg * Math.PI) / 180
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
  }
  const [sx, sy] = polar(start)
  const [ex, ey] = polar(end)
  const largeArc = end - start > 180 ? 1 : 0

  return (
    <div className="grid place-items-center">
      <svg viewBox="0 0 180 110" className="w-full max-w-[260px]">
        <defs>
          <linearGradient id="gauge-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#22d3a0" />
          </linearGradient>
        </defs>
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          stroke="#1a2744"
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`}
          stroke="url(#gauge-grad)"
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
        />
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          className="fill-foreground"
          style={{ fontFamily: "var(--font-dm-mono)", fontSize: 22, fontWeight: 500 }}
        >
          {value}%
        </text>
        <text
          x={cx}
          y={cy + 22}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontFamily: "var(--font-outfit)", fontSize: 9 }}
        >
          MODERATE
        </text>
      </svg>
      <div className="-mt-2 flex justify-between w-full max-w-[260px] px-2 text-[9px] font-mono text-muted-foreground">
        <span>Insufficient</span>
        <span>Weak</span>
        <span>Moderate</span>
        <span>Strong</span>
      </div>
    </div>
  )
}
