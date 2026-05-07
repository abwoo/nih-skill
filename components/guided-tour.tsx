'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Dna,
  Keyboard,
  Library,
  Lightbulb,
  Microscope,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import * as React from 'react';

// ============== Types ==============

type TourStep = {
  id: string;
  phase: 'learn' | 'practice' | 'master';
  title: string;
  subtitle?: string;
  content: string;
  highlight?: string;
  actionText?: string;
  targetSelector?: string;
  icon: React.ComponentType<{ className?: string }>;
  tips?: string[];
  example?: string;
};

// ============== Complete Tour Data ==============
// Designed for BME researcher onboarding with real scenarios

const TOUR_STEPS: TourStep[] = [
  // ===== PHASE 1: LEARN (认识界面) =====
  {
    id: 'welcome',
    phase: 'learn',
    title: '欢迎使用 BME Research Accelerator',
    subtitle: '你的AI驱动生物医学工程研究助手',
    icon: Sparkles,
    content: `我是你的BME研究向导。接下来我会带你了解这个平台的全部功能。

这个工具专门为生物医学工程研究者设计，能帮你：
• 快速理解复杂论文的核心贡献
• 比较不同方法的优劣
• 生成实验复现蓝图
• 验证科学声明的证据强度

预计用时：5-8分钟，你可以随时退出。`,
    example: '想象你是一个刚开始做ECG心律失常检测研究的博士生...',
    tips: ['按 ESC 或点击 × 可随时关闭'],
  },
  {
    id: 'layout-overview',
    phase: 'learn',
    title: '三栏式工作区布局',
    subtitle: '左 · 中 · 右 各司其职',
    icon: Microscope,
    content: `界面采用专业的三栏布局：

【左侧栏】知识工具箱
• 创新等级参考 (L1-L5c)
• 致命缺陷检测清单 (FB-1~11)
• 临床验证等级 (V0-V5)
• BME领域知识库 (27个模块)

【中间栏】主操作区
• 输入论文/问题
• 查看AI分析结果
• 多轮对话深入探讨

【右侧栏】信息面板
• API连接状态
• Token使用量
• 快速开始模板
• 文献搜索工具`,
    highlight: '.workspace-container',
    tips: ['每栏都可以独立折叠，点击边缘图标即可'],
  },
  {
    id: 'top-modules',
    phase: 'learn',
    title: '顶部6大核心分析模式',
    subtitle: '这是你最常用的6个工具',
    icon: Brain,
    content: `顶部的6个按钮代表6种不同的分析模式：

🔬 Decompose（分解）
   用途：深入分析单篇论文
   场景："帮我读懂这篇关于AlphaFold的论文"

⚖️ Compare（比较）
   用途：对比2-4篇论文的方法差异
   场景："ResNet和ViT在医学图像上哪个更好？"

🧪 Reproduce（复现）
   用途：生成实验复现的详细蓝图
   场景："我想复现这篇论文的实验"

📦 Paradigm（范式）
   用途：绘制某个领域的方法全景图
   场景："心电信号处理领域有哪些主流方法？"

✅ Evidence（证据）
   用途：验证科学声明的可靠性
   场景："这篇论文说准确率99%，可信吗？"

📊 Datasets（数据集）
   用途：推荐合适的数据集和实验路线
   场景："做ECG分类应该用哪些数据集？"`,
    highlight: "[data-tour='module-buttons']",
    tips: ['每个模式都有专门的AI提示词优化', '切换模式会改变分析的侧重点'],
  },

  // ===== PHASE 2: PRACTICE (第一次实操) =====
  {
    id: 'first-input',
    phase: 'practice',
    title: '第一次输入：试试Quick Read',
    subtitle: '最快上手的方式',
    icon: Upload,
    content: `现在来试试！中间的大文本框是你的主要输入区域。

你可以通过以下方式输入：

1️⃣ 直接打字
   例："分析这篇论文的创新点：10.1038/s41586-020-2649-2"

2️⃣ 上传PDF文件
   点击「Attach Files」按钮，支持拖拽上传

3️⃣ 粘贴DOI链接
   点击「Add DOI」按钮，自动获取论文元数据

💡 新手建议：先用DOI试试，这是最快的方式！`,
    highlight: "[data-tour='input-area']",
    actionText: '去输入框看看',
    example: '试着输入：10.1038/nature12345 （这是一个示例DOI）',
    tips: ['PDF最大30MB', '支持批量上传多篇论文进行比较'],
  },
  {
    id: 'quick-start-templates',
    phase: 'practice',
    title: '右侧模板：不想手写？用模板！',
    subtitle: '预设的研究场景一键启动',
    icon: Zap,
    content: `右侧面板有「Quick Start Templates」（快速开始模板）。

这些是我们为你准备的真实研究场景：

📋 常见模板示例：
• "ECG arrhythmia detection with attention"
  → 自动启动Decompose模式分析注意力机制在心电图中的应用

• "CheXNet vs AlphaFold2 innovation delta"
  → 自动启动Compare模式比较两个系统的创新点差异

• "Self-supervised ECG representation learning"
  → 启动Paradigm模式绘制自监督学习在ECG领域的应用全景

🎯 使用方法：
1. 点击任意模板
2. 系统自动填充输入框
3. 选择合适的分析模式
4. 点击发送开始分析`,
    highlight: "[data-tour='templates']",
    actionText: '查看右侧模板',
    tips: ['模板只是起点，你可以自由修改内容', '每个模板都经过BME专家验证'],
  },
  {
    id: 'analysis-modes-detail',
    phase: 'practice',
    title: '选择分析模式：6种模式详解',
    subtitle: '根据你的需求选择正确的工具',
    icon: Target,
    content: `点击输入框上方的模式卡片可以选择分析强度：

📖 Quick Read（快速阅读）⚡⚡⚡
   时间：~15秒 | 工具：3个
   适用：快速浏览论文要点、会议前准备
   输出：结构化摘要 + 关键发现

🔍 Evidence Verify（证据验证）⚡⚡
   时间：~25秒 | 工具：4个
   适用：审稿时验证声明、检查统计方法
   输出：事实核查报告 + Fatal Barriers检测

🔬 Reproduce（复现蓝图生成）⚡
   时间：~35秒 | 工具：5个
   适用：复现他人实验、写thesis的方法论章节
   输出：分步骤实施指南 + 代码框架 + 数据需求

⚖️ Compare（多论文比较）⚡
   时间：~40秒 | 工具：6个
   适用：方法选型、写Related Work、Survey
   输出：对比表格 + 创新差异 + 推荐方案

💡 Ideate（研究想法生成）⚡⚡
   时间：~30秒 | 工具：4个
   适用：找research gap、申请基金、选题
   输出：未解决问题列表 + 创新方向建议

📊 Dataset Match（数据集匹配）⚡⚡
   时间：~25秒 | 工具：4个
   适用：找benchmark数据集、规划实验
   输出：推荐数据集列表 + 获取方式 + 实验路线图`,
    highlight: "[data-tour='mode-selector']",
    tips: ['不确定选哪个？Quick Read是最安全的选择', 'Compare模式需要提供2-4篇论文'],
  },

  // ===== PHASE 3: MASTER (进阶功能) =====
  {
    id: 'left-sidebar-tools',
    phase: 'master',
    title: '左侧工具栏：专业评估体系',
    subtitle: 'BME领域的标准化评估框架',
    icon: ShieldCheck,
    content: `左侧边栏不是装饰，它是你的专业评估工具包：

━━━ Innovation Level（创新等级）━━━
L1 复现/微调     → 已有方法的简单应用
L2 增量改进       → 新训练技巧/新损失函数/新模块
L3 新方法解决老问题 → AlphaFold这种级别
L4 新任务/新问题定义 → 首次提出federated diagnosis
L5a 范式转变      → Transformer取代RNN
L5b 领域奠基理论   → 信息论
L5c 跨领域统一     → GPT通用助手

💡 点击任意等级可以看到详细解释和经典案例！

━━━ Fatal Blockers（致命缺陷）━━━
11项质量检测维度：
FB-1 数据可用性     → 训练数据是否公开？
FB-2 代码可用性     → 能否运行他们的代码？
FB-3 利益冲突       → 是否有潜在偏见？
FB-4 标注质量       → 标注是否可靠？
FB-5 对比公平性     → baseline是否公平？
...共11项

🔴 红色 = 必须关注的问题
🟡 黄色 = 需要留意
🟢 绿色 = 通过检测`,
    highlight: "[data-tour='left-sidebar']",
    actionText: '探索左侧工具',
    tips: ['这些标准来自Nature Medicine等顶级期刊的审稿要求'],
  },
  {
    id: 'darwin-panel',
    phase: 'master',
    title: 'Darwin面板：研究想法进化器',
    subtitle: '从已有工作中催生新想法',
    icon: Dna,
    content: `点击顶部的「Darwin」按钮打开研究进化器。

这是一个独特的功能，帮你从现有研究中产生新的研究方向：

🧬 6种进化操作：

Transplant（移植）
  把A领域的方法搬到B领域
  例：把NLP的attention用到ECG时序分析

Constrain（约束）
  在更苛刻条件下重做
  例：原论文用1000GPU，你能用1张卡吗？

Fuse（融合）
  合并两个paradigm的优势
  例：CNN的空间特征 + RNN的时序建模

Invert（反转）
  反转优化目标或因果方向
  例：不从信号分类疾病，而是预测健康信号

Minimal（最小可行）
  1周内能完成的对照实验
  例：只改一个变量证明核心假设

Extreme（极端推演）
  把方法推到极限
  例：从单模态扩展到多模态融合

🎯 典型使用流程：
1. 输入一个已有的研究想法（seed）
2. 选择1-2种进化操作
3. AI生成多个进化后的新idea
4. 评估新颖性和可行性
5. 选中的idea自动发送到Decompose进行分析`,
    highlight: "[data-tour='darwin-button']",
    actionText: '打开Darwin',
    tips: ['适合Research Ideation阶段使用', '生成的idea可以直接进入分析流程'],
  },
  {
    id: 'references-manager',
    phase: 'master',
    title: 'References管理器：文献管家',
    subtitle: '集中管理你的参考文献库',
    icon: Library,
    content: `点击顶部的「References」按钮打开文献管理器。

核心功能：

📚 添加文献
   • 手动输入标题/作者/年份
   • 通过DOI自动抓取元数据
   • 从PubMed/Semantic Scholar搜索导入
   • 批量导入BibTeX文件

🏷️ 组织管理
   • 创建文件夹分组（按项目/主题）
   • 添加标签便于筛选
   • 星标重要文献
   • 添加阅读笔记

🔗 关联分析
   • 选中的文献可直接发送到各分析模式
   • 自动提取引用关系网络
   • 生成引用格式（APA/MLA/IEEE等）

📊 统计洞察
   • 阅读进度追踪
   • 引用频率分析
   • 研究趋势可视化`,
    highlight: "[data-tour='references-button']",
    actionText: '打开References',
    tips: ['与主工作区无缝集成', '支持导出到Zotero/EndNote'],
  },
  {
    id: 'real-scenarios',
    phase: 'master',
    title: '真实研究场景指南',
    subtitle: '根据你的身份选择路径',
    icon: Lightbulb,
    content: `不同研究阶段的典型工作流：

━━━ 🎓 博士生 ━━━
第1年：文献综述
  → Paradigm模式 + References管理器
  目标：画出领域全景图，找到gap

第2-3年：方法创新
  → Darwin进化器 → Decompose分析
  目标：产生新idea并验证可行性

第4年：实验与写作
  → Reproduce模式 + Evidence模式
  目标：复现baseline + 验证自己的claims

━━━ 👨‍🔬 Postdoc ━━━
基金申请
  → Ideate模式 + Evidence验证
  目标：论证研究价值和创新点

论文投稿
  → Compare模式 + Fatal Blockers检查
  目标：突出自己的contribution + 预判reviewer问题

━━━ 🏥 临床医生 ━━━
技术评估
  → Evidence模式 + Clinical Validation等级
  目标：判断新技术是否ready for clinical use

━━━ 🔬 企业研究员 ━━━
竞品分析
  → Compare模式 + Innovation Level评估
  目标：了解竞争对手的技术路线`,
    tips: ['以上都是真实用户的典型用法', '你可以组合多种模式完成复杂任务'],
  },
  {
    id: 'completion',
    phase: 'master',
    title: '🎉 恭喜完成入门学习！',
    subtitle: '你已经掌握了核心功能',
    icon: CheckCircle2,
    content: `你已经了解了BME Research Accelerator的全部核心功能！

📌 记住这几个关键点：

1. 不知道用什么模式？→ 先试Quick Read
2. 有具体论文要分析？→ Decompose或Evidence
3. 要比较方法？→ Compare（需2-4篇论文）
4. 想复现实验？→ Reproduce（生成详细蓝图）
5. 找research gap？→ Paradigm或Darwin
6. 找数据集？→ Datasets模式

🆘 需要帮助？
• 按 ? 键重新打开此引导
• 左下角有交互式帮助提示
• 右侧模板提供即用示例
• 顶部Help图标随时可用

🚀 现在就开始你的第一个分析吧！`,
    actionText: '开始使用',
    tips: ['引导记录已保存，下次不会再自动弹出', '随时可以按 ? 重新查看'],
  },
];

// ============== Main Component ==============

export function GuidedTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [direction, setDirection] = React.useState<'forward' | 'backward'>('forward');
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [showTips, setShowTips] = React.useState(false);
  const tourRef = React.useRef<HTMLDivElement>(null);

  // Save progress to localStorage
  React.useEffect(() => {
    if (!open) return;
    try {
      localStorage.setItem('bme_tour_current_step', currentStep.toString());
      localStorage.setItem('bme_tour_completed_steps', JSON.stringify([...completedSteps]));
    } catch {}
  }, [currentStep, completedSteps, open]);

  // Load progress on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('bme_tour_current_step');
      if (saved) setCurrentStep(parseInt(saved));
      const completed = localStorage.getItem('bme_tour_completed_steps');
      if (completed) setCompletedSteps(new Set(JSON.parse(completed)));
    } catch {}
  }, []);

  // Mark step as completed when moving forward
  function goToStep(index: number) {
    if (index >= 0 && index < TOUR_STEPS.length) {
      setDirection(index > currentStep ? 'forward' : 'backward');
      if (index > currentStep) {
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
      }
      setCurrentStep(index);
      setShowTips(false);
    }
  }

  function nextStep() {
    goToStep(currentStep + 1);
  }

  function prevStep() {
    goToStep(currentStep - 1);
  }

  function closeTour() {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    try {
      localStorage.setItem('bme_tour_completed', 'true');
      localStorage.setItem('bme_tour_completed_at', Date.now().toString());
    } catch {}
    onClose();
  }

  function restartTour() {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setDirection('forward');
    try {
      localStorage.removeItem('bme_tour_completed');
      localStorage.removeItem('bme_tour_current_step');
      localStorage.removeItem('bme_tour_completed_steps');
    } catch {}
  }

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          e.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevStep();
          break;
        case 'Escape':
          e.preventDefault();
          closeTour();
          break;
        case '?':
          e.preventDefault();
          setShowTips((prev) => !prev);
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentStep]);

  if (!open) return null;

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={closeTour}
      />

      {/* Tour Card */}
      <div
        ref={tourRef}
        className={cn(
          'relative w-full max-w-2xl bg-gradient-to-b from-[#0f1525] via-[#0d1220] to-[#0a0f1a]',
          'border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden',
          'animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-300',
          direction === 'forward'
            ? 'animate-in fade-in slide-in-from-right-4'
            : 'animate-in fade-in slide-in-from-left-4'
        )}
      >
        {/* Header */}
        <div className="relative px-8 pt-7 pb-5 border-b border-white/[0.06]">
          {/* Close button */}
          <button
            onClick={closeTour}
            className="absolute top-4 right-4 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
            title="关闭引导 (ESC)"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/[0.05]">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Phase indicator */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className={cn(
                'px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md',
                step.phase === 'learn' && 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
                step.phase === 'practice' &&
                  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
                step.phase === 'master' &&
                  'bg-purple-500/15 text-purple-400 border border-purple-500/30'
              )}
            >
              {step.phase === 'learn' && 'Phase 1: 认识'}
              {step.phase === 'practice' && 'Phase 2: 实操'}
              {step.phase === 'master' && 'Phase 3: 进阶'}
            </span>
            <span className="text-xs text-white/30 font-mono">
              {currentStep + 1} / {TOUR_STEPS.length}
            </span>
          </div>

          {/* Title & Icon */}
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg',
                step.phase === 'learn' && 'bg-gradient-to-br from-blue-500 to-cyan-500',
                step.phase === 'practice' && 'bg-gradient-to-br from-emerald-500 to-green-500',
                step.phase === 'master' && 'bg-gradient-to-br from-violet-500 to-purple-500'
              )}
            >
              <step.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white leading-tight mb-1">{step.title}</h2>
              {step.subtitle && (
                <p className="text-sm text-white/40 font-medium">{step.subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
          <div className="prose prose-invert max-w-none">
            {step.content.split('\n').map((line, idx) => {
              if (
                line.startsWith('•') ||
                line.startsWith('🔬') ||
                line.startsWith('⚖️') ||
                line.startsWith('🧪') ||
                line.startsWith('📦') ||
                line.startsWith('✅') ||
                line.startsWith('📊') ||
                line.startsWith('📖') ||
                line.startsWith('🔍') ||
                line.startsWith('💡')
              ) {
                return (
                  <div key={idx} className="flex items-start gap-2.5 mb-2 pl-2">
                    <span className="text-indigo-400 mt-0.5 shrink-0">{line[0]}</span>
                    <span className="text-sm text-white/65 leading-relaxed">
                      {line.slice(1).trim()}
                    </span>
                  </div>
                );
              }
              if (line.startsWith('━━━')) {
                return (
                  <div key={idx} className="py-3">
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
                      {line.replace(/━/g, '').trim()}
                    </div>
                  </div>
                );
              }
              if (
                line.match(/^\d+️⃣/) ||
                line.trim().startsWith('例：') ||
                line.trim().startsWith('→') ||
                line.trim().startsWith('目标：') ||
                line.trim().startsWith('输出：') ||
                line.trim().startsWith('适用：') ||
                line.trim().startsWith('时间：') ||
                line.trim().startsWith('工具：')
              ) {
                return (
                  <div
                    key={idx}
                    className={`pl-4 mb-1.5 ${line.includes('例：') || line.includes('→') ? 'border-l-2 border-indigo-500/40' : ''}`}
                  >
                    <span className="text-sm text-white/55 leading-relaxed">{line}</span>
                  </div>
                );
              }
              if (line.trim() === '') return <br key={idx} />;
              return (
                <p key={idx} className="text-sm text-white/75 leading-relaxed mb-2">
                  {line}
                </p>
              );
            })}
          </div>

          {/* Example box */}
          {step.example && (
            <div className="mt-5 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
                    Example
                  </div>
                  <p className="text-sm text-indigo-200/80 italic leading-relaxed">
                    {step.example}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tips section */}
          {(showTips || step.tips) && (
            <div
              className={cn(
                'mt-5 p-4 rounded-xl transition-all duration-300',
                showTips
                  ? 'bg-amber-500/10 border border-amber-500/20'
                  : 'bg-white/[0.02] border border-white/[0.06]'
              )}
            >
              <div className="flex items-start gap-2">
                <Keyboard className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                    Tips
                  </div>
                  <ul className="space-y-1.5">
                    {(step.tips || []).map((tip, idx) => (
                      <li key={idx} className="text-xs text-white/60 flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-amber-400/60" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-white/[0.06] bg-white/[0.01]">
          <div className="flex items-center justify-between">
            {/* Left: Step indicators */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToStep(idx)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-200',
                    idx === currentStep && 'w-6 bg-indigo-500',
                    idx < currentStep && 'bg-emerald-500/60',
                    idx > currentStep && 'bg-white/15 hover:bg-white/25'
                  )}
                  title={`Step ${idx + 1}: ${TOUR_STEPS[idx].title}`}
                />
              ))}
            </div>

            {/* Right: Navigation buttons */}
            <div className="flex items-center gap-3">
              {!isFirstStep && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  className="gap-2 text-white/60 hover:text-white hover:bg-white/[0.06]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  上一步
                </Button>
              )}

              {isLastStep ? (
                <Button
                  onClick={closeTour}
                  className="gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 rounded-xl"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  开始使用
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  className="gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 rounded-xl"
                >
                  下一步
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              {/* Restart button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={restartTour}
                className="gap-1.5 text-white/30 hover:text-white/60 p-2"
                title="重新开始引导"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-white/25">
            <span className="flex items-center gap-1">
              <Keyboard className="h-3 w-3" /> ← → 导航
            </span>
            <span>·</span>
            <span>ESC 关闭</span>
            <span>·</span>
            <span>? 显示提示</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== Utility Functions ==============

export function isTourCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('bme_tour_completed') === 'true';
  } catch {
    return false;
  }
}

export function resetTourProgress(): void {
  try {
    localStorage.removeItem('bme_tour_completed');
    localStorage.removeItem('bme_tour_completed_at');
    localStorage.removeItem('bme_tour_current_step');
    localStorage.removeItem('bme_tour_completed_steps');
  } catch {}
}
