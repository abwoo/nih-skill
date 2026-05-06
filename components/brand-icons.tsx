import * as React from "react"

export function HelixIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id="helix-grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#4f8ef7" />
          <stop offset="100%" stopColor="#22d3a0" />
        </linearGradient>
      </defs>
      <path
        d="M5 3c4 4 10 4 14 0M5 21c4-4 10-4 14 0M5 8c4 4 10 4 14 0M5 16c4-4 10-4 14 0"
        stroke="url(#helix-grad)"
      />
      <path d="M7 3v18M17 3v18" stroke="url(#helix-grad)" opacity="0.55" />
    </svg>
  )
}

export function ClawIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
    >
      <path d="M3 18c4-2 6-7 6-12" />
      <path d="M9 19c4-2 6-7 6-12" />
      <path d="M15 20c4-2 6-7 6-12" />
    </svg>
  )
}

export function DnaSpinIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="dna-spin" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#22d3a0" />
        </linearGradient>
      </defs>
      <g
        fill="none"
        stroke="url(#dna-spin)"
        strokeWidth={1.5}
        strokeLinecap="round"
      >
        <path d="M6 4c6 6 14 6 20 0" />
        <path d="M6 28c6-6 14-6 20 0" />
        <path d="M6 11c6 6 14 6 20 0" />
        <path d="M6 21c6-6 14-6 20 0" />
        <path d="M9 4v24M23 4v24" opacity="0.55" />
      </g>
    </svg>
  )
}
