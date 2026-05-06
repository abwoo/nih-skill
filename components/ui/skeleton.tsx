"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Skeleton base component
export function Skeleton({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-secondary/80",
        className
      )}
      {...props}
    />
  )
}

// Chat message skeleton (for loading states)
export function MessageSkeleton({ type = "assistant" }: { type?: "user" | "assistant" | "tool" }) {
  if (type === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[85%] lg:max-w-[75%]">
          <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-sm px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-3 w-12 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-full ml-auto" />
            </div>
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded mt-1.5" />
          </div>
        </div>
      </div>
    )
  }

  if (type === "tool") {
    return (
      <div className="flex justify-start mb-3 opacity-80">
        <div className="max-w-[70%]">
          <div className="border border-border/50 bg-secondary/30 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded-full" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Assistant skeleton (default)
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%] lg:max-w-[80%]">
        <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
          {/* Avatar + Header */}
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-7 h-7 rounded-full" />
            <Skeleton className="h-3.5 w-32 rounded" />
            <Skeleton className="h-3 w-16 rounded ml-auto" />
          </div>
          
          {/* Content lines */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-4/6 rounded" />
          </div>

          {/* Action buttons */}
          <div className="mt-2 pt-2 flex gap-1">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Multiple messages loading state
export function ChatSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <MessageSkeleton key={i} type={i % 2 === 0 ? "user" : "assistant"} />
      ))}
    </div>
  )
}

// PDF upload skeleton
export function UploadSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {/* File info */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Processing PDF...</span>
          <Skeleton className="h-3 w-12 rounded" />
        </div>
        <Skeleton className="h-2 w-full rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-primary/40 rounded-full animate-pulse" />
        </Skeleton>
      </div>

      {/* Extraction steps */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {['Text', 'Metadata', 'Structure'].map((step) => (
          <div key={step} className="p-3 rounded-lg bg-secondary/30 text-center space-y-2">
            <Skeleton className="h-5 w-5 rounded mx-auto" />
            <Skeleton className="h-3 w-16 rounded mx-auto" />
            <Skeleton className="h-2 w-8 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Search results skeleton
export function SearchResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3 rounded-lg border border-border bg-card space-y-2">
          <div className="flex items-start gap-3">
            <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-3 w-14 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Sidebar section skeleton
export function SidebarSectionSkeleton({ itemCount = 8 }: { itemCount?: number }) {
  return (
    <div className="p-3 space-y-2">
      <Skeleton className="h-4 w-32 rounded mb-3" />
      
      <div className="space-y-1.5">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className={`h-3 ${i % 3 === 0 ? 'w-28' : i % 3 === 1 ? 'w-36' : 'w-24'} rounded`} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Full page loading skeleton
export function PageSkeleton() {
  return (
    <div className="min-h-screen flex">
      {/* Left sidebar */}
      <div className="hidden lg:block w-64 border-r border-border p-4 space-y-4">
        <SidebarSectionSkeleton itemCount={6} />
        <SidebarSectionSkeleton itemCount={11} />
        <SidebarSectionSkeleton itemCount={6} />
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-4 w-96 rounded" />
        </div>

        {/* Input area */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg ml-auto" />
          </div>
        </div>

        {/* Messages area */}
        <ChatSkeleton count={2} />
      </div>

      {/* Right sidebar */}
      <div className="hidden xl:block w-72 border-l border-border p-4 space-y-4">
        <SidebarSectionSkeleton itemCount={4} />
        <SearchResultsSkeleton count={3} />
      </div>
    </div>
  )
}

// Inline loading spinner
export function Spinner({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
  )
}

import { Loader2 } from "lucide-react"
