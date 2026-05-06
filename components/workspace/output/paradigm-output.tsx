"use client"

import { Map as MapIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const FAMILIES = [
  {
    name: "Hand-crafted features + classical ML",
    period: "2000–2014",
    examples: ["Wavelet + SVM", "QRS detection + Random Forest"],
    status: "legacy",
  },
  {
    name: "End-to-end CNN",
    period: "2014–2019",
    examples: ["1D-ResNet", "Inception-time"],
    status: "mature",
  },
  {
    name: "Self-supervised pretraining",
    period: "2020–now",
    examples: ["CLOCS", "ECG-SSL"],
    status: "frontier",
  },
  {
    name: "Foundation / multimodal",
    period: "2023–now",
    examples: ["ECG-FM", "ClinicalBERT × ECG"],
    status: "emerging",
  },
]

export function ParadigmOutput() {
  return (
    <div className="mt-6 rounded-xl border border-border bg-card">
      <div className="px-5 py-4 border-b border-border">
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <MapIcon className="h-3.5 w-3.5 text-orange" />
          Methodological Paradigm Map · ECG diagnostics
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div className="relative pl-4 border-l border-border space-y-4">
          {FAMILIES.map((f) => (
            <div key={f.name} className="relative">
              <span
                className={cn(
                  "absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2",
                  f.status === "legacy" && "bg-secondary border-muted-foreground",
                  f.status === "mature" && "bg-primary/40 border-primary",
                  f.status === "frontier" && "bg-warning/40 border-warning",
                  f.status === "emerging" && "bg-pink/40 border-pink",
                )}
              />
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <div className="font-medium">{f.name}</div>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {f.period}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {f.examples.map((e) => (
                  <span
                    key={e}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-secondary/60 text-foreground/85 border border-border"
                  >
                    {e}
                  </span>
                ))}
                <span
                  className={cn(
                    "ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono border",
                    f.status === "legacy" &&
                      "border-muted-foreground/40 text-muted-foreground",
                    f.status === "mature" && "border-primary/40 bg-primary/10 text-primary",
                    f.status === "frontier" &&
                      "border-warning/40 bg-warning/10 text-warning",
                    f.status === "emerging" && "border-pink/40 bg-pink/10 text-pink",
                  )}
                >
                  {f.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
