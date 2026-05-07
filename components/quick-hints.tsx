'use client';

import { cn } from '@/lib/utils';
import { ArrowRight, BookOpen, FileText, Search, Sparkles, Upload, X, Zap } from 'lucide-react';
import * as React from 'react';

type ContextualHint = {
  id: string;
  target: string;
  title: string;
  content: string;
  icon?: React.ComponentType<{ className?: string }>;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
  priority: 'high' | 'medium' | 'low';
};

const CONTEXTUAL_HINTS: ContextualHint[] = [
  {
    id: 'first-upload',
    target: 'input-area',
    title: '📎 开始你的第一次分析',
    content: '上传 PDF 论文或输入 DOI 开始分析。支持拖拽文件到此处！',
    icon: Upload,
    position: 'top',
    priority: 'high',
    action: {
      label: '查看示例',
      onClick: () => {},
    },
  },
  {
    id: 'try-search',
    target: 'right-sidebar',
    title: '🔍 发现相关论文',
    content: '使用右侧搜索工具查找 PubMed 或 OpenAlex 上的文献',
    icon: Search,
    position: 'left',
    priority: 'medium',
  },
  {
    id: 'explore-modules',
    target: 'left-sidebar',
    title: '📚 探索知识库',
    content: '点击左侧的创新等级或参考模块，快速了解 BME 领域知识体系',
    icon: BookOpen,
    position: 'right',
    priority: 'low',
  },
];

const WELCOME_TIPS = [
  {
    id: 'welcome-1',
    icon: Zap,
    text: '💡 新手？试试右侧的「Quick Start Templates」',
    delay: 2000,
  },
  {
    id: 'welcome-2',
    icon: FileText,
    text: '📄 可以直接粘贴 DOI：10.1038/nature12345',
    delay: 5000,
  },
  {
    id: 'welcome-3',
    icon: Sparkles,
    text: '✨ 按 ? 键可随时重新打开引导教程',
    delay: 8000,
  },
];

export function QuickHints() {
  const [visibleHints, setVisibleHints] = React.useState<Set<string>>(new Set());
  const [dismissedHints, setDismissedHints] = React.useState<Set<string>>(new Set());
  const [welcomeTips, setWelcomeTips] = React.useState<number[]>([]);
  const [currentTipIndex, setCurrentTipIndex] = React.useState(0);

  // Use refs to track initialization and prevent infinite loops
  const initializedRef = React.useRef(false);
  const isMountingRef = React.useRef(true);

  // Load dismissed hints from localStorage - only once on mount
  React.useEffect(() => {
    if (initializedRef.current) return; // Prevent re-running
    initializedRef.current = true;

    try {
      const stored = localStorage.getItem('bme_dismissed_hints');
      if (stored) {
        const parsed = JSON.parse(stored);
        setDismissedHints(new Set(parsed));
      }
    } catch {
      // Silently fail
    }
  }, []); // Empty dependency array - runs only once

  // Show contextual hints after initialization - use a separate effect with proper guards
  React.useEffect(() => {
    if (isMountingRef.current) {
      isMountingRef.current = false;
      return; // Skip on first render to avoid loops
    }

    try {
      // Check if tour was completed (don't show hints if tour not done)
      const tourCompleted = localStorage.getItem('bme_tour_completed') === 'true';
      if (!tourCompleted) return;

      // Only show hints that haven't been dismissed
      const newHints = new Set<string>();
      CONTEXTUAL_HINTS.forEach((hint) => {
        if (!dismissedHints.has(hint.id)) {
          newHints.add(hint.id);
        }
      });

      if (newHints.size > 0) {
        const timer = setTimeout(() => {
          setVisibleHints(newHints);
        }, 3000);
        return () => clearTimeout(timer);
      }
    } catch {
      // Silently fail
    }
  }, [dismissedHints]); // This is okay now because we guard against initial render

  // Rotate welcome tips - fixed to avoid infinite loop
  React.useEffect(() => {
    let tipTimer: NodeJS.Timeout | null = null;
    let hideTimer: NodeJS.Timeout | null = null;

    if (visibleHints.size === 0 && dismissedHints.size < 3) {
      // Show first tip immediately (only if not already showing)
      setWelcomeTips((prev) => (prev.length === 0 ? [0] : prev));

      // Start rotation after initial display
      tipTimer = setInterval(() => {
        setCurrentTipIndex((prev) => {
          const next = (prev + 1) % WELCOME_TIPS.length;
          // Update welcome tips in the same callback to avoid multiple renders
          setTimeout(() => {
            setWelcomeTips([next]);
          }, 0);
          return next;
        });
      }, 4000);

      // Hide tips after some time
      hideTimer = setTimeout(() => {
        setWelcomeTips([]);
        if (tipTimer) clearInterval(tipTimer);
      }, 15000);
    }

    return () => {
      if (tipTimer) clearInterval(tipTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [visibleHints.size, dismissedHints.size]); // Use .size to compare primitive values

  // Stable dismiss functions using useCallback
  const dismissHint = React.useCallback((hintId: string) => {
    setDismissedHints((prev) => {
      const next = new Set(prev);
      next.add(hintId);
      try {
        localStorage.setItem('bme_dismissed_hints', JSON.stringify([...next]));
      } catch {
        // Silently fail
      }
      return next;
    });

    setVisibleHints((prev) => {
      const next = new Set(prev);
      next.delete(hintId);
      return next;
    });
  }, []);

  const dismissWelcomeTip = React.useCallback(
    (tipId: string) => {
      // Remove from welcome tips immediately
      const numericId = parseInt(tipId.replace('welcome-', ''));
      setWelcomeTips((prev) => prev.filter((id) => id !== numericId));

      // Also add to dismissed hints so it doesn't reappear
      dismissHint(tipId);
    },
    [dismissHint]
  );

  if (visibleHints.size === 0 && welcomeTips.length === 0) return null;

  return (
    <>
      {/* Contextual Hints */}
      {CONTEXTUAL_HINTS.filter((h) => visibleHints.has(h.id)).map((hint) => (
        <ContextualBubble key={hint.id} hint={hint} onDismiss={() => dismissHint(hint.id)} />
      ))}

      {/* Welcome Tips */}
      {welcomeTips.map((tipIdx) => {
        const tip = WELCOME_TIPS[tipIdx];
        if (!tip) return null;
        return (
          <WelcomeTipBubble
            key={`welcome-${tipIdx}`}
            tip={tip}
            onDismiss={() => dismissWelcomeTip(`welcome-${tipIdx}`)}
          />
        );
      })}
    </>
  );
}

function ContextualBubble({ hint, onDismiss }: { hint: ContextualHint; onDismiss: () => void }) {
  const [position, setPosition] = React.useState<{
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  }>({});

  React.useEffect(() => {
    const element = document.querySelector(`[data-tour="${hint.target}"]`);
    if (element) {
      const rect = element.getBoundingClientRect();
      const offset = 12;

      switch (hint.position) {
        case 'top':
          setPosition({
            bottom: window.innerHeight - rect.top + offset,
            left: rect.left + rect.width / 2,
          });
          break;
        case 'bottom':
          setPosition({
            top: rect.bottom + offset,
            left: rect.left + rect.width / 2,
          });
          break;
        case 'left':
          setPosition({
            top: rect.top + rect.height / 2,
            right: window.innerWidth - rect.left + offset,
          });
          break;
        case 'right':
          setPosition({
            top: rect.top + rect.height / 2,
            left: rect.right + offset,
          });
          break;
      }
    }
  }, [hint.target, hint.position]);

  if (Object.keys(position).length === 0) return null;

  const HintIcon = hint.icon;

  return (
    <div
      className={cn(
        'fixed z-[90] animate-in fade-in slide-in-from-bottom-2 duration-300',
        'max-w-sm px-4 py-3 rounded-xl shadow-lg border',
        hint.priority === 'high'
          ? 'bg-gradient-to-br from-primary to-teal text-white border-primary/30'
          : 'bg-card text-foreground border-border'
      )}
      style={{
        ...position,
        transform:
          hint.position === 'left' || hint.position === 'right'
            ? 'translateY(-50%)'
            : 'translateX(-50%)',
      }}
    >
      <div className="flex items-start gap-3">
        {HintIcon && (
          <div
            className={cn(
              'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
              hint.priority === 'high' ? 'bg-white/20' : 'bg-primary/10'
            )}
          >
            <HintIcon className="h-4 w-4" />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="font-semibold text-sm leading-tight">{hint.title}</div>
          <div className="text-xs opacity-90 leading-relaxed">{hint.content}</div>

          {hint.action && (
            <button
              onClick={hint.action.onClick}
              className="inline-flex items-center gap-1.5 text-xs font-medium opacity-90 hover:opacity-100 underline underline-offset-2 transition-opacity"
            >
              {hint.action.label}
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDismiss();
          }}
          className={cn(
            'p-1 rounded-md transition-colors shrink-0',
            hint.priority === 'high' ? 'hover:bg-white/20' : 'hover:bg-secondary'
          )}
          aria-label="关闭提示"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Priority indicator */}
      {hint.priority === 'high' && (
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-yellow-400 animate-pulse" />
      )}
    </div>
  );
}

function WelcomeTipBubble({
  tip,
  onDismiss,
}: {
  tip: (typeof WELCOME_TIPS)[0];
  onDismiss: () => void;
}) {
  const TipIcon = tip.icon;

  // Handle dismiss with event prevention to ensure it works
  const handleDismiss = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onDismiss();
    },
    [onDismiss]
  );

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-5 py-3 rounded-xl bg-card border border-border shadow-xl max-w-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <TipIcon className="h-4 w-4 text-primary" />
          </div>

          <p className="text-sm text-foreground/90 flex-1">{tip.text}</p>

          <button
            onClick={handleDismiss}
            className="p-1 rounded hover:bg-secondary transition-colors cursor-pointer"
            aria-label="关闭提示"
            type="button"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
