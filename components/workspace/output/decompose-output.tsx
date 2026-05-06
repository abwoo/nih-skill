"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Microscope,
  Copy,
  FileDown,
  GitCompare,
  GraduationCap,
  AlertTriangle,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useStore } from "@/lib/store"

const FB_ROWS: { id: number; check: string; rating: "🟢" | "🔴" | "🟡"; detail: string }[] = [
  { id: 1, check: "Data Availability", rating: "🟢", detail: "MIT-BIH 公开" },
  { id: 2, check: "Code Availability", rating: "🔴", detail: "未找到 GitHub 仓库" },
  { id: 3, check: "Conflict of Interest", rating: "🟡", detail: "工业资助" },
  { id: 4, check: "Annotation Quality", rating: "🟢", detail: "双心脏病学家盲法标注" },
  { id: 5, check: "Comparison Fairness", rating: "🟡", detail: "未与最强 baseline 比较" },
  { id: 6, check: "External Validation", rating: "🟡", detail: "仅 PTB-XL 上验证一次" },
  { id: 7, check: "Reproduction Path", rating: "🔴", detail: "缺训练超参表" },
  { id: 8, check: "Label Noise", rating: "🟢", detail: "<2% 估计噪声" },
  { id: 9, check: "Demographic Bias", rating: "🟡", detail: "样本以美国白人为主" },
  { id: 10, check: "Causal Claims", rating: "🟢", detail: "仅声明相关性" },
  { id: 11, check: "Sample Size vs Complexity", rating: "🟢", detail: "47K 样本 / 12M 参数" },
]

const PAPER_TITLE = "Attention-Augmented CNN for ECG Arrhythmia Detection on MIT-BIH"

export function DecomposeOutput() {
  const { prefillFor, showToast } = useStore()

  async function copyMarkdown() {
    const md = `# ${PAPER_TITLE}

- Innovation: L3 (Novel Method)
- Verdict: PARTIAL — code unavailable (FB-2), reproduction path missing (FB-7)
- Dataset: MIT-BIH (47K) · External: PTB-XL
- Validation: V2 External

## Method
1D-ResNet (34) + temporal self-attention head; focal loss; AdamW (3e-4); cosine schedule.

## Results
MIT-BIH F1 = 0.91 · External PTB-XL F1 = 0.83 · Baseline 0.78
`
    try {
      await navigator.clipboard.writeText(md)
      showToast("已复制 Markdown 摘要")
    } catch {
      showToast("无法访问剪贴板")
    }
  }

  function exportPdf() {
    showToast("PDF 导出准备中…（mock）")
  }
  function addToCompare() {
    prefillFor("compare", PAPER_TITLE)
    showToast("已发送到 Compare · 添加 Paper B 即可比较")
  }
  function learnMore() {
    showToast("Learn 模块即将上线")
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
      {/* Title bar */}
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <Microscope className="h-3.5 w-3.5 text-primary" />
            Paper Decomposition
          </div>
          <h2 className="mt-1 text-lg font-semibold text-balance leading-snug">
            Attention-Augmented CNN for ECG Arrhythmia Detection on MIT-BIH
          </h2>
          <p className="text-xs text-muted-foreground mt-1 stream-caret">
            Hannun et al., 2019 · Nature Medicine
          </p>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-md bg-violet/15 text-violet border border-violet/40 text-[10px] font-mono">
          L3 · Novel Method
        </span>
      </div>

      {/* Meta chips */}
      <div className="px-5 py-3 border-b border-border flex flex-wrap gap-2">
        <Chip>Dataset: MIT-BIH</Chip>
        <Chip mono>N = 47,000</Chip>
        <Chip>
          Reproducibility: <span className="text-warning">★★★☆☆</span>
        </Chip>
        <Chip>Validation: V2 External</Chip>
        <Chip tone="success">Full text: ✓ PMC</Chip>
      </div>

      {/* Accordion sections */}
      <div className="px-5 py-3 border-b border-border">
        <Accordion type="multiple" defaultValue={["problem", "method"]} className="space-y-1">
          {[
            {
              id: "problem",
              title: "Problem",
              tag: "FACT",
              body: "在 ICU 临床场景下，自动识别 12 类心律失常仍受限于标注不一致和外部泛化能力差。",
            },
            {
              id: "gap",
              title: "Gap",
              tag: "FACT",
              body: "现有 CNN 模型缺乏对长程节律依赖的建模能力，外部数据集 AUROC 比内部下降 8–12%。",
            },
            {
              id: "method",
              title: "Method",
              tag: "FACT — full text",
              body:
                "1D-ResNet (34 层) + 时间维度 self-attention head；输入 30 秒、单导联、360Hz；focal loss；AdamW (3e-4)；cosine schedule。",
              code: true,
            },
            {
              id: "dataset",
              title: "Dataset",
              tag: "FACT",
              body: "MIT-BIH (47K 心拍片段) 训练；PTB-XL 21K 样本作外部验证。",
            },
            {
              id: "experiment",
              title: "Experiment",
              tag: "INFERENCE",
              body: "5-fold subject-level CV；推断 batch=32；NVIDIA V100 ×4。",
            },
            {
              id: "results",
              title: "Results",
              tag: "FACT — full text",
              body: "MIT-BIH F1 = 0.91；外部 PTB-XL F1 = 0.83；优于 baseline (0.78)。",
            },
            {
              id: "limitations",
              title: "Limitations",
              tag: "FACT + INFERENCE",
              body:
                "样本以北美白人为主；未发布训练代码；未与最新 transformer baseline 对比。",
            },
          ].map((s) => (
            <AccordionItem
              key={s.id}
              value={s.id}
              className="border border-border rounded-md bg-secondary/30 data-[state=open]:bg-secondary/50"
            >
              <AccordionTrigger className="px-3 py-2 hover:no-underline">
                <div className="flex items-center gap-2 w-full">
                  <span className="font-medium text-sm">{s.title}</span>
                  <FactTag>{s.tag}</FactTag>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 pt-0">
                <p
                  className={cn(
                    "text-xs leading-relaxed text-foreground/90",
                    s.code && "font-mono bg-background/60 border border-border rounded p-2",
                  )}
                >
                  {s.body}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Fatal Blockers Table */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5 text-warning" />
          Fatal Blockers
        </div>
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr className="text-left">
                <th className="px-3 py-2 w-10 font-mono font-normal">#</th>
                <th className="px-3 py-2 font-mono font-normal">Check</th>
                <th className="px-3 py-2 w-20 text-center font-mono font-normal">Rating</th>
                <th className="px-3 py-2 font-mono font-normal">Detail</th>
              </tr>
            </thead>
            <tbody>
              {FB_ROWS.map((r) => (
                <tr
                  key={r.id}
                  className={cn(
                    "border-t border-border",
                    r.rating === "🔴" && "bg-danger/10",
                  )}
                >
                  <td className="px-3 py-1.5 font-mono text-muted-foreground">
                    {String(r.id).padStart(2, "0")}
                  </td>
                  <td className="px-3 py-1.5">{r.check}</td>
                  <td className="px-3 py-1.5 text-center">{r.rating}</td>
                  <td className="px-3 py-1.5 text-foreground/80">{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verdict */}
      <div className="px-5 py-4 border-b border-border">
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Reproducibility Verdict
        </div>
        <div className="rounded-md border border-warning/40 bg-warning/8 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <div className="text-warning font-semibold tracking-wide">⚠ PARTIAL</div>
            <div className="text-xs text-foreground/85 mt-0.5">
              Code unavailable (FB-2: 🔴) · Reproduction Path missing (FB-7: 🔴) ·
              建议先尝试 baseline，待原作者公开代码后再完整复现。
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-5 py-3 flex flex-wrap items-center gap-2">
        <ActionBtn icon={Copy} onClick={copyMarkdown}>
          Copy Markdown
        </ActionBtn>
        <ActionBtn icon={FileDown} onClick={exportPdf}>
          Export PDF
        </ActionBtn>
        <ActionBtn icon={GitCompare} onClick={addToCompare}>
          Add to Compare
        </ActionBtn>
        <ActionBtn icon={GraduationCap} primary onClick={learnMore}>
          Learn →
        </ActionBtn>
      </div>
    </div>
  )
}

function Chip({
  children,
  mono,
  tone,
}: {
  children: React.ReactNode
  mono?: boolean
  tone?: "success"
}) {
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-md border text-[11px]",
        mono && "font-mono",
        tone === "success"
          ? "border-success/40 bg-success/10 text-success"
          : "border-border bg-secondary/60 text-foreground/85",
      )}
    >
      {children}
    </span>
  )
}

function FactTag({ children }: { children: React.ReactNode }) {
  const text = String(children)
  const tone = text.includes("INFERENCE")
    ? "info"
    : text.includes("FACT")
      ? "success"
      : "warning"
  return (
    <span
      className={cn(
        "ml-auto mr-2 text-[10px] font-mono px-1.5 py-0.5 rounded border",
        tone === "info" && "bg-primary/10 text-primary border-primary/40",
        tone === "success" && "bg-success/10 text-success border-success/40",
        tone === "warning" && "bg-warning/10 text-warning border-warning/40",
      )}
    >
      [{children}]
    </span>
  )
}

function ActionBtn({
  children,
  icon: Icon,
  primary,
  onClick,
}: {
  children: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  primary?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border",
        primary
          ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
          : "border-border bg-secondary/40 hover:bg-secondary text-foreground/90",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  )
}
