"use client"

import { Database } from "lucide-react"
import { cn } from "@/lib/utils"

const DATASETS = [
  {
    name: "MIT-BIH Arrhythmia",
    size: "47K beats · 48 records",
    access: "Open",
    creds: false,
    tags: ["ECG", "Open Access", "Classic"],
    complexity: 2,
  },
  {
    name: "PTB-XL",
    size: "21K records",
    access: "Open",
    creds: false,
    tags: ["ECG", "Large scale", "Multi-label"],
    complexity: 3,
  },
  {
    name: "MIMIC-IV ECG",
    size: "800K records",
    access: "Credentialed",
    creds: true,
    tags: ["ECG", "Clinical", "Large scale"],
    complexity: 4,
  },
  {
    name: "Icentia11k",
    size: "11K patients · 2B beats",
    access: "Open",
    creds: false,
    tags: ["ECG", "Self-supervised friendly"],
    complexity: 4,
  },
]

export function DatasetsOutput() {
  return (
    <div className="mt-6 rounded-xl border border-border bg-card">
      <div className="px-5 py-4 border-b border-border">
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Database className="h-3.5 w-3.5 text-pink" />
          Dataset Recommendations · ECG
        </div>
        <h2 className="mt-1 text-lg font-semibold">建议数据集 + 实验路线图</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-3 p-5">
        {DATASETS.map((d) => (
          <div
            key={d.name}
            className="rounded-lg border border-border bg-secondary/40 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-medium">{d.name}</div>
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded border",
                  d.access === "Open"
                    ? "bg-success/10 text-success border-success/40"
                    : "bg-warning/10 text-warning border-warning/40",
                )}
              >
                {d.access}
              </span>
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-1">{d.size}</div>
            {d.creds && (
              <div className="text-[10px] font-mono text-warning mt-1">
                ⚠ Requires PhysioNet credentialing
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {d.tags.map((t) => (
                <span
                  key={t}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-pink/10 text-pink border border-pink/40"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
              <span>preprocessing</span>
              <span className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      n <= d.complexity ? "bg-warning" : "bg-secondary border border-border",
                    )}
                  />
                ))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
