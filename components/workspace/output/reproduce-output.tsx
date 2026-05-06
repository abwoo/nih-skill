"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { FlaskConical, AlertTriangle, ChevronRight, Github } from "lucide-react"

const PIPELINE = [
  { id: "data", label: "Data" },
  { id: "preprocess", label: "Preprocess" },
  { id: "features", label: "Features" },
  { id: "model", label: "Model" },
  { id: "post", label: "Postprocess" },
  { id: "eval", label: "Evaluate" },
]

const STEPS = [
  {
    id: "data",
    title: "Step 1 · 数据获取",
    op: "下载 MIT-BIH (PhysioNet) 与 PTB-XL，按 subject-level 划分。",
    code: "wget https://physionet.org/files/mitdb/1.0.0/\nsplit by subject_id, ratio=70/15/15",
    pitfall: "不要按片段切分，否则同一受试者会泄漏",
  },
  {
    id: "preprocess",
    title: "Step 2 · 预处理",
    op: "0.5–40Hz 带通；下采样至 250Hz；30s 窗口、1s 步长。",
    code: "scipy.signal.filtfilt(b, a, sig)\nsig = resample(sig, 250)",
    pitfall: "不要 z-score 整段后再切窗，会引入未来信息",
  },
  {
    id: "model",
    title: "Step 3 · 模型",
    op: "1D-ResNet34 + temporal self-attention head；focal loss γ=2。",
    code: "model = ResNet1D(34) + TemporalSelfAttention(d=512, h=8)",
    pitfall: "原文未公开 attention 头维度，建议 d=512、h=8 起步",
  },
]

const PARAMS = [
  ["Learning rate", "3e-4", "3e-4", "high"],
  ["Batch size", "256", "128–256", "high"],
  ["Optimizer", "AdamW", "AdamW", "high"],
  ["Window (s)", "30", "30", "high"],
  ["Attention heads", "—", "8", "med"],
  ["Dropout", "—", "0.2", "low"],
] as const

export function ReproduceOutput() {
  const [active, setActive] = React.useState("data")

  return (
    <div className="mt-6 rounded-xl border border-border bg-card">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FlaskConical className="h-3.5 w-3.5 text-emerald" />
            Reproduction Blueprint
          </div>
          <h2 className="mt-1 text-lg font-semibold">
            Self-supervised ECG Representation Learning
          </h2>
        </div>
        <div className="text-right text-xs">
          <div className="text-warning">★★★★☆</div>
          <div className="text-muted-foreground mt-0.5">Difficulty</div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center flex-wrap gap-1.5">
          {PIPELINE.map((p, i) => (
            <React.Fragment key={p.id}>
              <button
                onClick={() => setActive(p.id)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-mono border",
                  active === p.id
                    ? "bg-emerald/15 text-emerald border-emerald/50"
                    : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {p.label}
              </button>
              {i < PIPELINE.length - 1 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="px-5 py-4 space-y-3 border-b border-border">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className="rounded-md border border-border bg-secondary/30 p-3"
          >
            <div className="font-medium text-sm">{s.title}</div>
            <p className="text-xs text-muted-foreground mt-1">{s.op}</p>
            <pre className="mt-2 font-mono text-[11px] bg-background/60 border border-border rounded p-2 overflow-x-auto whitespace-pre">
              {s.code}
            </pre>
            <div className="mt-2 flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 px-2 py-1.5 text-[11px]">
              <AlertTriangle className="h-3 w-3 text-warning shrink-0 mt-0.5" />
              <span className="text-warning/95">⚠ Pitfall: {s.pitfall}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Param table */}
      <div className="px-5 py-4 border-b border-border">
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Parameters
        </div>
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-secondary/60 text-muted-foreground font-mono">
              <tr className="text-left">
                <th className="px-3 py-2 font-normal">Parameter</th>
                <th className="px-3 py-2 font-normal">Paper Value</th>
                <th className="px-3 py-2 font-normal">Best Guess</th>
                <th className="px-3 py-2 font-normal">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {PARAMS.map((p, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-1.5">{p[0]}</td>
                  <td className="px-3 py-1.5 font-mono">{p[1]}</td>
                  <td className="px-3 py-1.5 font-mono">{p[2]}</td>
                  <td className="px-3 py-1.5">
                    <span
                      className={cn(
                        "text-[10px] font-mono px-1.5 py-0.5 rounded border",
                        p[3] === "high" && "bg-success/10 text-success border-success/40",
                        p[3] === "med" && "bg-warning/10 text-warning border-warning/40",
                        p[3] === "low" && "bg-danger/10 text-danger border-danger/40",
                      )}
                    >
                      {p[3]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code section */}
      <div className="px-5 py-4">
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Official Code
        </div>
        <div className="rounded-md border border-border bg-secondary/40 p-3 flex items-center gap-3">
          <Github className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Not found on Papers With Code · 建议联系作者或在 Zenodo / OSF 搜索
          </span>
          <span className="ml-auto text-[10px] font-mono text-danger">FB-2: 🔴</span>
        </div>
      </div>
    </div>
  )
}
