'use client';

import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Brain,
  Dna,
  FileText,
  Keyboard,
  Library,
  Lightbulb,
  Microscope,
  ShieldCheck,
  Upload,
  X,
  Zap,
} from 'lucide-react';
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
  scenario?: string; // 新增：使用场景
};

// 完全重写的上下文提示系统 - 基于真实BME研究场景
const CONTEXTUAL_HINTS: ContextualHint[] = [
  {
    id: 'first-input-hint',
    target: 'input-area',
    title: '开始你的第一个分析',
    content: `有3种方式可以开始：

1️⃣ 直接输入研究问题或DOI
   例："分析这篇论文：10.1038/nature12345"

2️⃣ 上传PDF论文（支持拖拽）
   最大30MB，支持批量上传

3️⃣ 使用右侧的Quick Start模板
   预设的真实研究场景，一键启动`,
    icon: Upload,
    position: 'top',
    priority: 'high',
    scenario: '首次使用 / 新手入门',
  },
  {
    id: 'module-selection-hint',
    target: 'module-buttons',
    title: '选择合适的分析模式',
    content: `根据你的目标选择：

🔬 Decompose → 深入读懂单篇论文
⚖️ Compare → 对比2-4篇方法的优劣
🧪 Reproduce → 生成实验复现蓝图
📦 Paradigm → 绘制领域方法全景图
✅ Evidence → 验证科学声明的可靠性
📊 Datasets → 推荐数据集和实验路线

💡 不确定？先用Decompose（默认）`,
    icon: Brain,
    position: 'bottom',
    priority: 'high',
    scenario: '选择分析模式时',
  },
  {
    id: 'templates-hint',
    target: 'templates',
    title: '快速开始模板',
    content: `这些是真实的研究场景示例：

• ECG arrhythmia detection with attention
  → 分析注意力机制在心电图中的应用

• CheXNet vs AlphaFold2 innovation delta
  → 比较两个系统的创新差异

点击任意模板自动填充输入框`,
    icon: Zap,
    position: 'left',
    priority: 'medium',
    scenario: '不知道如何开始时',
  },
  {
    id: 'innovation-level-hint',
    target: 'innovation-levels',
    title: '创新等级参考体系',
    content: `L1-L5c 是标准化的创新等级分类：

L1-L2: 增量改进（新技巧/新模块）
L3: 新方法解决老问题（AlphaFold级别）
L4: 定义新任务/新问题
L5a-c: 范式转变/奠基理论/跨领域统一

💡 点击任意等级查看详细解释和经典案例`,
    icon: Microscope,
    position: 'right',
    priority: 'medium',
    scenario: '评估论文创新性时',
  },
  {
    id: 'fatal-blockers-hint',
    target: 'fatal-blockers',
    title: '致命缺陷检测清单',
    content: `11项质量检测维度（来自顶级期刊审稿标准）：

FB-1 数据可用性 | FB-2 代码可用性
FB-3 利益冲突 | FB-4 标注质量
FB-5 对比公平性 | ...共11项

🔴 红色 = 必须关注的问题
🟡 黄色 = 需要留意
🟢 绿色 = 通过检测`,
    icon: ShieldCheck,
    position: 'left',
    priority: 'medium',
    scenario: '审稿/评估论文质量时',
  },
  {
    id: 'darwin-hint',
    target: 'darwin-button',
    title: 'Darwin: 研究想法进化器',
    content: `从已有工作中催生新的研究方向：

🧬 Transplant - 把A领域方法搬到B领域
🎯 Constrain - 在更苛刻条件下重做
🔀 Fuse - 融合两个paradigm的优势
↩️ Invert - 反转优化目标
🧪 Minimal - 1周内可完成的对照
💡 Extreme - 把方法推到极限

适合：Research Ideation阶段`,
    icon: Dna,
    position: 'bottom',
    priority: 'low',
    scenario: '寻找研究方向/产生新idea时',
  },
  {
    id: 'references-hint',
    target: 'references-button',
    title: 'References: 文献管理器',
    content: `集中管理你的参考文献库：

📚 通过DOI/PubMed搜索添加文献
🏷️ 按项目分组 + 标签管理
🔗 直接发送到各分析模式
📊 追踪阅读进度和研究趋势

适合：文献综述、写Related Work`,
    icon: Library,
    position: 'bottom',
    priority: 'low',
    scenario: '管理大量参考文献时',
  },
];

// 重写的欢迎提示 - 更加实用和具体
const WELCOME_TIPS = [
  {
    id: 'welcome-1',
    icon: Lightbulb,
    text: '💡 新手推荐：先试试右侧的「ECG arrhythmia detection」模板',
    delay: 2000,
    action: '点击右侧模板区域',
  },
  {
    id: 'welcome-2',
    icon: FileText,
    text: '📄 快速方式：直接粘贴DOI到输入框，如 10.1038/nature12345',
    delay: 5000,
    action: '在中间输入框粘贴',
  },
  {
    id: 'welcome-3',
    icon: Keyboard,
    text: '⌨️ 按 ? 键可打开完整的交互式引导教程（10分钟掌握全部功能）',
    delay: 8000,
    action: '按键盘 ? 键',
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

  // Show welcome tips sequentially after mount
  React.useEffect(() => {
    if (isMountingRef.current) {
      isMountingRef.current = false;

      // Show tips one by one with delays
      WELCOME_TIPS.forEach((tip, index) => {
        setTimeout(() => {
          setWelcomeTips((prev) => [...prev, index]);
          setVisibleHints((prev) => new Set([...prev, tip.id]));

          // Auto-dismiss after 8 seconds
          setTimeout(() => {
            setVisibleHints((prev) => {
              const next = new Set(prev);
              next.delete(tip.id);
              return next;
            });
          }, 8000);
        }, tip.delay);
      });
    }
  }, []);

  // Show contextual hints based on user interaction (simplified for now)
  React.useEffect(() => {
    // Could add intersection observer or event-based triggering here
    // For now, hints are manually triggered or shown on load
  }, []);

  function dismissHint(hintId: string) {
    setVisibleHints((prev) => {
      const next = new Set(prev);
      next.delete(hintId);
      return next;
    });

    // Save to localStorage
    setDismissedHints((prev) => {
      const updated = new Set(prev);
      updated.add(hintId);

      try {
        localStorage.setItem('bme_dismissed_hints', JSON.stringify([...updated]));
      } catch {}

      return updated;
    });
  }

  function dismissAllWelcomeTips() {
    WELCOME_TIPS.forEach((tip) => {
      setVisibleHints((prev) => {
        const next = new Set(prev);
        next.delete(tip.id);
        return next;
      });
      dismissHint(tip.id);
    });
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3 max-w-md">
      {/* Welcome Tips - Enhanced styling */}
      {WELCOME_TIPS.map(
        (tip, idx) =>
          visibleHints.has(tip.id) &&
          !dismissedHints.has(tip.id) && (
            <div
              key={tip.id}
              className="animate-in slide-in-from-bottom-3 fade-in duration-500 group"
            >
              <div
                className={cn(
                  'relative p-4 rounded-xl backdrop-blur-xl',
                  'bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-transparent',
                  'border border-indigo-500/25 shadow-lg shadow-indigo-500/10',
                  'hover:border-indigo-400/40 hover:shadow-xl hover:shadow-indigo-500/20',
                  'transition-all duration-300'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <tip.icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90 font-medium leading-relaxed">{tip.text}</p>
                    {tip.action && (
                      <p className="text-xs text-indigo-300 mt-1.5 flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-3 w-3" />
                        {tip.action}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => dismissHint(tip.id)}
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-all shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Dismiss all button on last tip */}
                {idx === welcomeTips.length - 1 && (
                  <button
                    onClick={dismissAllWelcomeTips}
                    className="mt-3 w-full px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-[10px] font-medium text-white/50 hover:text-white/80 border border-white/[0.06] transition-all"
                  >
                    关闭所有提示（不再显示）
                  </button>
                )}
              </div>
            </div>
          )
      )}

      {/* Contextual Hints - Only show if not dismissed */}
      {CONTEXTUAL_HINTS.map(
        (hint) =>
          !dismissedHints.has(hint.id) && (
            <div key={hint.id} className="animate-in fade-in zoom-in-95 duration-300">
              {/* Contextual hint implementation could go here */}
              {/* For now, we're focusing on the welcome tips */}
            </div>
          )
      )}
    </div>
  );
}

export function resetHints() {
  try {
    localStorage.removeItem('bme_dismissed_hints');
  } catch {}
}
