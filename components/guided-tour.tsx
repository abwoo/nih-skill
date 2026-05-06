"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  FileText,
  Search,
  BookOpen,
  Microscope,
  Settings,
  HelpCircle,
  Keyboard,
  Upload,
  Zap,
  CheckCircle2,
  ChevronRight,
  Circle,
  Trophy,
  Target,
  Star,
  Flame,
  Award,
  Play,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// ============== Types ==============

type TourPhase = "absorb" | "adapt" | "accelerate"
type MilestoneId = string

interface Milestone {
  id: MilestoneId
  phase: TourPhase
  title: string
  description: string
  tasks: string[]
  icon: React.ComponentType<{ className?: string }>
  tips?: string[]
  successCriteria?: string[]
}

interface TourStep {
  id: string
  phase: TourPhase
  milestoneId?: MilestoneId
  title: string
  content: string
  highlight?: string
  tips?: string[]
  target?: string
  icon?: React.ComponentType<{ className?: string }>
  placement?: "top" | "bottom" | "left" | "right" | "center"
}

// ============== Data ==============

const MILESTONES: Milestone[] = [
  // Phase 1: ABSORB (Days 1-7) - Learn the basics
  {
    id: "m1-interface",
    phase: "absorb",
    title: "🎯 界面导航掌握",
    description: "熟悉三栏布局和基本操作",
    tasks: [
      "了解左侧、中间、右侧面板的功能",
      "学会折叠/展开侧边栏",
      "使用顶部模块切换按钮",
    ],
    icon: MessageSquare,
    tips: ["每栏都可以独立折叠以获得更大空间"],
    successCriteria: ["能独立在三个区域间切换", "知道每个区域的主要功能"],
  },
  {
    id: "m2-input-methods",
    phase: "absorb",
    title: "📎 输入方式掌握",
    description: "学会多种输入研究问题的方法",
    tasks: [
      "输入文本描述研究需求",
      "上传 PDF 文件进行分析",
      "粘贴 DOI 链接获取论文",
      "使用拖拽上传文件",
    ],
    icon: Upload,
    tips: ["支持 PDF、TXT、MD 格式，最大 30MB"],
    successCriteria: ["成功上传并分析一个文件", "成功使用 DOI 获取论文"],
  },
  {
    id: "m3-first-analysis",
    phase: "absorb",
    title: "🔬 完成首次分析",
    description: "使用 AI 完成第一次论文分析",
    tasks: [
      "选择分析模式（Decompose）",
      "输入或上传内容",
      "查看 AI 分析结果",
      "理解输出结构",
    ],
    icon: Microscope,
    tips: ["从 Decompose 模式开始最简单"],
    successCriteria: ["独立完成一次完整的分析流程", "理解结果的各个部分"],
  },

  // Phase 2: ADAPT (Days 8-14) - Apply and contribute
  {
    id: "m4-advanced-modules",
    phase: "adapt",
    title: "⚡ 高级模式探索",
    description: "尝试不同的分析模式",
    tasks: [
      "使用 Compare 模式对比两篇论文",
      "尝试 Reproduce 模式生成复现蓝图",
      "探索 Evidence 模式验证声明",
      "使用 Datasets 模式获取数据集推荐",
    ],
    icon: Zap,
    tips: ["每种模式适合不同类型的研究问题"],
    successCriteria: ["至少尝试 3 种不同的分析模式", "知道何时使用每种模式"],
  },
  {
    id: "m5-sidebar-tools",
    phase: "adapt",
    title: "🛠️ 工具栏深度使用",
    description: "充分利用左右两侧工具",
    tasks: [
      "使用左侧创新等级评估 (L1-L5c)",
      "检查致命障碍 (FB-1 到 FB-11)",
      "探索参考知识库 (28个模块)",
      "使用右侧论文搜索工具",
      "探索引用网络分析器",
    ],
    icon: BookOpen,
    tips: ["左侧用于快速评估，右侧用于深度研究"],
    successCriteria: ["熟练使用左侧评估工具", "能用右侧工具发现相关文献"],
  },
  {
    id: "m6-multi-turn",
    phase: "adapt",
    title: "💬 多轮对话进阶",
    description: "与 AI 进行深入的研究对话",
    tasks: [
      "基于首次结果进行追问",
      "要求更详细的分析",
      "请求对比或验证",
      "让 AI 解释术语或概念",
    ],
    icon: MessageSquare,
    tips: ["AI 会记住上下文，可以持续深入探讨"],
    successCriteria: ["能进行 3 轮以上的有效对话", "获得比单次提问更深入的见解"],
  },

  // Phase 3: ACCELERATE (Days 15+) - Master and optimize
  {
    id: "m7-workflow-mastery",
    phase: "accelerate",
    title: "🎓 工作流优化",
    description: "建立高效的研究工作流程",
    tasks: [
      "建立标准的分析流程",
      "使用快捷键提高效率",
      "管理历史记录和会话",
      "定制个人偏好设置",
    ],
    icon: Trophy,
    tips: ["好的工作流可以节省 50% 以上的时间"],
    successCriteria: ["有固定的研究工作流程", "能在 5 分钟内开始新的分析"],
  },
  {
    id: "m8-advanced-features",
    phase: "accelerate",
    title: "🚀 高级功能掌握",
    description: "使用所有高级特性提升效率",
    tasks: [
      "配置高级参数（Temperature, Max Tokens）",
      "使用 Intent 标签加速分析",
      "利用 Quick Start Templates",
      "管理 Token 使用和成本",
    ],
    icon: Star,
    tips: ["高级参数可以显著影响输出质量"],
    successCriteria: ["理解各参数的作用和影响", "能根据需要调整配置"],
  },
]

const TOUR_STEPS: TourStep[] = [
  // ============ PHASE 1: ABSORB ============
  {
    id: "welcome",
    phase: "absorb",
    title: "👋 欢迎来到 BME Research Accelerator！",
    content:
      `这是一个专为**生物医学工程研究者**设计的 AI 研究加速平台！

**🎯 本引导将帮助你：**
• 第 1-7 天：掌握基础操作（Absorb 阶段）
• 第 8-14 天：应用高级功能（Adapt 阶段）
• 第 15 天+：优化工作流程（Accelerate 阶段）

**✨ 你将获得：**
📊 创新等级评估能力
🔍 文献搜索和引用分析
🧠 AI 驱动的深度研究助手
📚 28 个 BME 领域知识库

整个引导采用**三阶段渐进式学习**，让我们开始吧！`,
    placement: "center",
    icon: Sparkles,
    tips: [
      "按 ESC 可随时退出，进度会自动保存",
      "按 → 或 Enter 进入下一步",
      "预计用时：10-15 分钟",
    ],
  },

  {
    id: "phase1-overview",
    phase: "absorb",
    milestoneId: "m1-interface",
    title: "📍 第一阶段：ABSORB（吸收期）",
    content:
      `**📅 时间范围：第 1-7 天**
**🎯 目标：熟悉界面，掌握基础操作**

在这个阶段，你将：
✅ 了解三栏布局结构
✅ 学会输入研究问题的各种方法
✅ 完成你的第一次 AI 分析
✅ 理解基本的输出格式

**💡 学习策略：**
• 不要急于求成，先熟悉界面
• 多尝试不同的输入方式
• 观察和理解 AI 的响应格式

准备好开始探索了吗？`,
    placement: "center",
    icon: Play,
    tips: ["这个阶段就像参观新实验室，先了解每个区域的用途"],
  },

  {
    id: "layout-tour",
    phase: "absorb",
    milestoneId: "m1-interface",
    title: "📐 认识你的工作空间",
    content:
      `界面采用专业的**三栏布局**设计：

**📍 左侧栏 - 快速参考工具箱**
• 🎯 创新等级分类（L1-L5c）
• ⚠️ 致命障碍检查（FB-1~11）
• ✅ 临床验证阶段（V0-V5）
• 📖 BME 知识库（28个模块）

**📍 中间区 - 主分析区域**
• ✏️ 输入研究问题
• 📎 上传文件
• 💬 与 AI 对话
• 📊 查看分析结果

**📍 右侧栏 - 辅助工具面板**
• 🔌 API 状态监控
• ⚡ 快速模板
• 🔍 论文搜索
• 📚 引用探索
• 📜 历史记录`,
    placement: "center",
    icon: MessageSquare,
    tips: ["点击侧边栏边缘的按钮可以折叠该栏"],
  },

  {
    id: "left-sidebar-deep",
    phase: "absorb",
    milestoneId: "m1-interface",
    title: "📚 左侧工具箱详解",
    content:
      `这里是你的 **BME 快速评估工具包**：

**🎯 创新等级 (L1-L5c)**
L1 复现/微调 → L5c 跨领域统一
一键评估论文的创新程度

**⚠️ 致命障碍 (FB-1~11)**
FB-2 代码未开源
FB-6 缺乏外部验证
快速检查论文是否存在致命缺陷

**✅ 临床验证 (V0-V5)**
V0 无验证 → V5 RCT 试验
评估研究的临床证据强度

**📖 参考知识库**
28 个核心 BME 领域参考模块
单击复制引用，双击打开文档`,
    target: "left-sidebar",
    placement: "right",
    icon: BookOpen,
    tips: ["尝试点击 L3 或 L4 查看详细说明"],
  },

  {
    id: "input-guide",
    phase: "absorb",
    milestoneId: "m2-input-methods",
    title: "📎 如何输入你的研究问题",
    content:
      `**方法 1：直接描述** ✏️
"帮我分析这篇论文的创新点"

**方法 2：上传文件** 📁
拖拽或点击上传 PDF/TXT/MD
最大 30MB，自动解析内容

**方法 3：粘贴 DOI** 🔗
10.1038/nature12345
自动获取论文元数据

**方法 4：混合输入** 🔄
上传文件 + 描述具体需求
AI 会结合两者给出综合分析

**💡 新手建议：**
从方法 1 开始，最简单直接！`,
    target: "input-area",
    placement: "top",
    icon: Upload,
    tips: ["PDF 会自动提取文本、识别DOI、解析结构"],
  },

  {
    id: "first-analysis-demo",
    phase: "absorb",
    milestoneId: "m3-first-analysis",
    title: "🔬 让我们完成第一次分析",
    content:
      `**推荐的新手第一步：**

1️⃣ 在右侧找到「Quick Start Templates」
   点击第一个模板："ECG arrhythmia detection with attention"

2️⃣ 或者在中间输入框输入：
   "帮我分析这篇论文的基本信息和创新点"

3️⃣ 点击发送按钮（或按 Enter）

4️⃣ 观察 AI 的响应：
   • 结构化的分析报告
   • 创新等级评估
   • 致命障碍检查
   • 改进建议

**🎉 恭喜！你已经完成了第一次分析！**`,
    placement: "center",
    icon: Microscope,
    tips: ["别担心出错，AI 会引导你完成整个过程"],
  },

  // ============ PHASE 2: ADAPT ============
  {
    id: "phase2-intro",
    phase: "adapt",
    title: "🚀 第二阶段：ADAPT（适应期）",
    content:
      `**📅 时间范围：第 8-14 天**
**🎯 目标：应用高级功能，提升效率**

恭喜完成第一阶段！现在你将：

🔬 **探索 6 种分析模式**
   • Decompose 单篇分解
   • Compare 多篇对比
   • Reproduce 复现蓝图
   • Evidence 证据验证
   • Datasets 数据推荐
   • Paradigm 范式映射

🛠️ **深度使用工具栏**
   • 左侧：创新评估 + 知识库
   •右侧：搜索 + 引用 + 历史

💬 **多轮对话**
   • 追问细节
   • 请求对比
   • 深入探讨

准备好了吗？让我们进入下一级别！`,
    placement: "center",
    icon: Flame,
    tips: ["这个阶段就像开始做实验，尝试不同的方法"],
  },

  {
    id: "modules-detail",
    phase: "adapt",
    milestoneId: "m4-advanced-modules",
    title: "🔬 六大分析模式详解",
    content:
      `**1️⃣ Decompose（分解）** 🎯 最常用
单篇论文的结构化分析
适用：初次阅读任何论文

**2️⃣ Compare（对比）** ⚖️
2-4 篇论文的横向比较
适用：选择方法或相关工作

**3️⃣ Reproduce（复现）** 🧪
生成实验复现的详细步骤
适用：实现已发表的方法

**4️⃣ Evidence（证据）** ✅
验证科学声明的强度
适用：审查重要结论

**5️⃣ Datasets（数据集）** 📚
推荐数据集和实验路线图
适用：设计新实验

**6️⃣ Paradigm（范式）** 🗺️
绘制领域方法论地图
适用：文献综述或领域调研`,
    target: "module-selector",
    placement: "bottom",
    icon: Zap,
    tips: ["不确定选哪个？Decompose 总是安全的选择"],
  },

  {
    id: "sidebar-mastery",
    phase: "adapt",
    milestoneId: "m5-sidebar-tools",
    title: "🛠️ 工具栏完全指南",
    content:
      `**左侧栏 - 快速评估：**

🎯 **创新等级** - 点击任意等级查看：
   • 定义和判断标准
   • 典型案例
   • 一键复制到分析中

⚠️ **致命障碍** - 点击查看：
   • 具体问题描述
   • 建议的改进措施
   • 相关参考文献

**右侧栏 - 研究工具：**

🔍 **Paper Search**
支持 PubMed / Semantic Scholar / OpenAlex
可按关键词、作者、期刊搜索

📚 **Citation Explorer**
输入 DOI 查看：
   • 被引哪些论文（影响力）
   • 引用了哪些文献（基础）
   • 高影响力论文标记 ⭐`,
    placement: "center",
    icon: Settings,
    tips: ["养成习惯：每次分析前先用左侧评估，再用右侧搜索补充"],
  },

  {
    id: "conversation-skills",
    phase: "adapt",
    milestoneId: "m6-multi-turn",
    title: "💬 多轮对话的艺术",
    content:
      `**有效的追问示例：**

❌ "再详细点" （太模糊）

✅ "这篇方法的局限性是什么？
    与传统方法相比优势在哪里？"
    （具体且有针对性）

**🎯 高级追问技巧：**

1️⃣ **请求对比**
"这与 [另一篇论文] 的方法相比如何？"

2️⃣ **要求验证**
"这个结论的证据强度够吗？
有哪些潜在的反例？"

3️⃣ **深入机制**
"为什么这种方法在这个任务上表现更好？
背后的原理是什么？"

4️⃣ **实际应用**
"如果我想在我的数据上使用，
需要注意什么？"

**💡 记住：AI 记住了上下文，
可以持续深入探讨同一个话题！**`,
    placement: "center",
    icon: MessageSquare,
    tips: ["好的追问可以让分析深度翻倍"],
  },

  // ============ PHASE 3: ACCELERATE ============
  {
    id: "phase3-intro",
    phase: "accelerate",
    title: "🏆 第三阶段：ACCELERATE（加速期）",
    content:
      `**📅 时间范围：第 15 天及以后**
**🎯 目标：建立高效工作流，成为高手**

太棒了！你已经掌握了基础和进阶功能。
现在让我们：

⚡ **优化效率**
• 建立标准化工作流程
• 使用快捷键和模板
• 管理成本和资源

🎓 **深度定制**
• 调整高级参数
• 优化输出质量
• 整合到日常研究

🏆 **成为专家**
• 分享最佳实践
• 发现隐藏功能
• 贡献社区

**准备好成为超级用户了吗？**`,
    placement: "center",
    icon: Trophy,
    tips: ["这个阶段就像独立开展研究项目"],
  },

  {
    id: "workflow-optimization",
    phase: "accelerate",
    milestoneId: "m7-workflow-mastery",
    title: "⚡ 建立高效工作流",
    content:
      `**推荐的标准化流程：**

**📋 Step 1: 快速评估（2分钟）**
→ 左侧选择创新等级
→ 检查致命障碍
→ 确定分析方向

**📋 Step 2: 选择模式（1分钟）**
→ 根据目标选择合适的分析模式
→ 不确定？用 Decompose

**📋 Step 3: 输入内容（3分钟）**
→ 上传 PDF 或粘贴 DOI
→ 添加具体的分析需求

**📋 Step 4: 初次分析（5分钟）**
→ 等待 AI 完成
→ 浏览结果要点

**📋 Step 5: 深入探讨（10分钟）**
→ 追问关键点
→ 请求对比或验证
→ 获取可操作的建议

**总时间：约 20 分钟完成深度分析！**`,
    placement: "center",
    icon: RotateCcw,
    tips: ["固定的工作流可以显著提高效率和一致性"],
  },

  {
    id: "advanced-config",
    phase: "accelerate",
    milestoneId: "m8-advanced-features",
    title: "🎛️ 高级配置指南",
    content:
      `**⚙️ 关键参数调优：**

**🌡️ Temperature（温度）**
• 低 (0.1-0.3)：更确定、分析型
• 中 (0.4-0.6)：平衡
• 高 (0.7-1.0)：更有创造性
• 建议：BME 分析用 0.2-0.4

**📏 Max Tokens（最大长度）**
• 默认 8000：足够大多数分析
• 复杂任务：增加到 16000
• 简单查询：可以减少到 4000

**🎯 Inject Skill（注入知识）**
• ✅ 开启：注入完整 SKILL.md（推荐）
• ❌ 关闭：纯通用分析

**💾 Stream（流式输出）**
• ✅ 开启：实时看到思考过程
• 建议：始终开启

**💡 Pro Tip：**
在设置中保存多个配置方案，
针对不同任务快速切换！`,
    placement: "center",
    icon: Settings,
    tips: ["好的配置可以让输出质量提升 30%+"],
  },

  {
    id: "completion",
    phase: "accelerate",
    title: "🎉 恭喜完成全部引导！",
    content:
      `**🏆 你已经完成了三阶段学习：**

✅ **Phase 1: ABSORB** - 基础掌握
   ✓ 界面导航
   ✓ 输入方法
   ✓ 首次分析

✅ **Phase 2: ADAPT** - 进阶应用
   ✓ 6 种分析模式
   ✓ 工具栏深度使用
   ✓ 多轮对话技巧

✅ **Phase 3: ACCELERATE** - 效率优化
   ✓ 工作流建立
   ✓ 高级配置
   ✓ 成为目标用户！

---

**🚀 下一步建议：**

📖 阅读 SKILL.md 了解高级用法
🔗 加入社区分享经验
⭐ 给项目 star 支持
💡 探索 openclaw-temp/ 中的 200+ skills

**感谢你选择 BME Research Accelerator！**
祝研究顺利，成果丰硕！🎓`,
    placement: "center",
    icon: Award,
    tips: [
      "你现在已经是高级用户了！",
      "随时可以通过 ? 按钮重新查看本引导",
    ],
  },
]

// ============== Main Component ==============

export function GuidedTour({
  isOpen,
  onClose,
  onComplete,
}: {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isHighlighted, setIsHighlighted] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)
  const [completedMilestones, setCompletedMilestones] = React.useState<Set<MilestoneId>>(new Set())
  const [checkedTasks, setCheckedTasks] = React.useState<Set<string>>(new Set())

  // Load saved state
  React.useEffect(() => {
    if (isOpen) {
      const savedStep = getSavedProgress()
      setCurrentStep(savedStep >= 0 ? savedStep : 0)
      setIsVisible(true)
      setTimeout(() => setIsHighlighted(true), 100)

      // Load completed milestones
      try {
        const saved = localStorage.getItem("bme_completed_milestones")
        if (saved) setCompletedMilestones(new Set(JSON.parse(saved)))

        const savedTasks = localStorage.getItem("bme_checked_tasks")
        if (savedTasks) setCheckedTasks(new Set(JSON.parse(savedTasks)))
      } catch {
        // Silently fail
      }
    } else {
      setIsVisible(false)
      setIsHighlighted(false)
    }
  }, [isOpen])

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "Escape":
          e.preventDefault()
          handleClose()
          break
        case "ArrowRight":
        case "Enter":
          e.preventDefault()
          if (!isLastStep) handleNext()
          break
        case "ArrowLeft":
          e.preventDefault()
          if (!isFirstStep) handlePrev()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentStep])

  const step = TOUR_STEPS[currentStep]
  const isLastStep = currentStep === TOUR_STEPS.length - 1
  const isFirstStep = currentStep === 0
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100

  const currentPhase = step?.phase || "absorb"
  const phaseProgress = getPhaseProgress(currentPhase, currentStep)

  function handleNext() {
    if (isLastStep) {
      handleComplete()
    } else {
      saveProgress(currentStep + 1)
      setCurrentStep((prev) => prev + 1)
      triggerHighlight()
    }
  }

  function handlePrev() {
    if (!isFirstStep) {
      saveProgress(currentStep - 1)
      setCurrentStep((prev) => prev - 1)
      triggerHighlight()
    }
  }

  function handleComplete() {
    markTourAsCompleted()
    clearSavedProgress()
    onComplete()
  }

  function handleClose() {
    saveProgress(currentStep)
    onClose()
  }

  function handleSkip() {
    markTourAsCompleted()
    clearSavedProgress()
    onClose()
  }

  function triggerHighlight() {
    setIsHighlighted(false)
    setTimeout(() => setIsHighlighted(true), 50)
  }

  function toggleTask(task: string) {
    setCheckedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(task)) {
        next.delete(task)
      } else {
        next.add(task)
      }
      // Save to localStorage
      try {
        localStorage.setItem("bme_checked_tasks", JSON.stringify([...next]))
      } catch {
        // Silently fail
      }
      return next
    })
  }

  function toggleMilestone(milestoneId: MilestoneId) {
    setCompletedMilestones((prev) => {
      const next = new Set(prev)
      if (next.has(milestoneId)) {
        next.delete(milestoneId)
      } else {
        next.add(milestoneId)
      }
      // Save to localStorage
      try {
        localStorage.setItem("bme_completed_milestones", JSON.stringify([...next]))
      } catch {
        // Silently fail
      }
      return next
    })
  }

  if (!isOpen || !step || !isVisible) return null

  const StepIcon = step.icon
  const currentMilestone = step.milestoneId
    ? MILESTONES.find((m) => m.id === step.milestoneId)
    : null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-all duration-500 backdrop-blur-sm",
          isHighlighted ? "opacity-100" : "opacity-40"
        )}
        onClick={handleSkip}
      />

      {/* Spotlight */}
      {step.target && step.placement !== "center" && (
        <Spotlight target={step.target} active={isHighlighted} />
      )}

      {/* Main Card */}
      <div
        className={cn(
          "absolute pointer-events-auto transition-all duration-300 ease-out",
          step.placement === "center" && "inset-0 flex items-center justify-center p-4 md:p-8",
          step.placement !== "center" && "inset-4 flex items-center justify-center"
        )}
      >
        <div
          className={cn(
            "bg-card border border-border rounded-2xl shadow-2xl overflow-hidden",
            "animate-in fade-in zoom-in-95 duration-300",
            "max-h-[90vh] overflow-y-auto w-full",
            step.placement === "center" ? "max-w-3xl" : "max-w-xl"
          )}
        >
          {/* Phase Progress Bar */}
          <div className="h-1.5 bg-border">
            <div
              className={cn(
                "h-full transition-all duration-500 ease-out",
                currentPhase === "absorb" && "bg-blue-500",
                currentPhase === "adapt" && "bg-purple-500",
                currentPhase === "accelerate" && "bg-amber-500"
              )}
              style={{ width: `${phaseProgress}%` }}
            />
          </div>

          {/* Phase Indicator */}
          <div className="px-6 py-3 bg-secondary/30 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentPhase === "absorb" && (
                  <>
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-semibold text-blue-600">PHASE 1: ABSORB</span>
                  </>
                )}
                {currentPhase === "adapt" && (
                  <>
                    <Flame className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-semibold text-purple-600">PHASE 2: ADAPT</span>
                  </>
                )}
                {currentPhase === "accelerate" && (
                  <>
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-600">PHASE 3: ACCELERATE</span>
                  </>
                )}
              </div>

              <div className="text-xs text-muted-foreground font-mono">
                {Math.round(progress)}% 完成
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start gap-4">
              {StepIcon && (
                <div
                  className={cn(
                    "h-14 w-14 rounded-xl flex items-center justify-center shrink-0 border",
                    currentPhase === "absorb" && "bg-blue-500/10 border-blue-500/30",
                    currentPhase === "adapt" && "bg-purple-500/10 border-purple-500/30",
                    currentPhase === "accelerate" && "bg-amber-500/10 border-amber-500/30"
                  )}
                >
                  <StepIcon
                    className={cn(
                      "h-7 w-7",
                      currentPhase === "absorb" && "text-blue-600",
                      currentPhase === "adapt" && "text-purple-600",
                      currentPhase === "accelerate" && "text-amber-600"
                    )}
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-foreground leading-tight mb-2">
                  {step.title}
                </h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-mono">
                    步骤 {currentStep + 1} / {TOUR_STEPS.length}
                  </span>
                  <span>·</span>
                  <span>里程碑 {getPhaseMilestoneCount(currentPhase, currentStep)}</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors group shrink-0"
                aria-label="关闭引导 (ESC)"
              >
                <X className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <div className="text-base text-foreground/90 leading-relaxed whitespace-pre-line">
                {step.content}
              </div>
            </div>

            {/* Milestone Tasks */}
            {currentMilestone && (
              <div className="bg-secondary/30 border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Award className="h-4 w-4 text-primary" />
                    里程碑任务
                  </div>
                  <button
                    onClick={() => toggleMilestone(currentMilestone.id)}
                    className={cn(
                      "text-xs px-2 py-1 rounded-md border transition-colors",
                      completedMilestones.has(currentMilestone.id)
                        ? "bg-success/20 text-success border-success/40"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80 border-border"
                    )}
                  >
                    {completedMilestones.has(currentMilestone.id) ? "✓ 已完成" : "标记完成"}
                  </button>
                </div>

                <ul className="space-y-2">
                  {currentMilestone.tasks.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <button
                        onClick={() => toggleTask(`${currentMilestone.id}-${idx}`)}
                        className={cn(
                          "mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                          checkedTasks.has(`${currentMilestone.id}-${idx}`)
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border bg-background hover:border-primary/50"
                        )}
                      >
                        {checkedTasks.has(`${currentMilestone.id}-${idx}`) && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                      </button>
                      <span
                        className={cn(
                          "text-sm leading-relaxed",
                          checkedTasks.has(`${currentMilestone.id}-${idx}`)
                            ? "text-foreground line-through opacity-60"
                            : "text-foreground/90"
                        )}
                      >
                        {task}
                      </span>
                    </li>
                  ))}
                </ul>

                {completedMilestones.has(currentMilestone.id) &&
                  currentMilestone.successCriteria && (
                    <div className="pt-2 mt-2 border-t border-border">
                      <p className="text-xs font-medium text-success mb-1">✨ 完成标准：</p>
                      <ul className="space-y-1">
                        {currentMilestone.successCriteria.map((criteria, idx) => (
                          <li key={idx} className="text-xs text-success/80 flex items-start gap-1">
                            <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            {/* Tips */}
            {step.tips && step.tips.length > 0 && (
              <div
                className={cn(
                  "rounded-lg p-4 space-y-2 border",
                  currentPhase === "absorb" && "bg-blue-500/5 border-blue-500/20",
                  currentPhase === "adapt" && "bg-purple-500/5 border-purple-500/20",
                  currentPhase === "accelerate" && "bg-amber-500/5 border-amber-500/20"
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium",
                    currentPhase === "absorb" && "text-blue-600",
                    currentPhase === "adapt" && "text-purple-600",
                    currentPhase === "accelerate" && "text-amber-600"
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                  小贴士
                </div>
                <ul className="space-y-1.5">
                  {step.tips.map((tip, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 opacity-60" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrev}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    上一步
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!isLastStep && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    跳过
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={handleNext}
                  className={cn(
                    "gap-2 font-medium",
                    isLastStep
                      ? cn(
                          "text-white",
                          currentPhase === "absorb" && "bg-gradient-to-r from-blue-500 to-blue-600",
                          currentPhase === "adapt" && "bg-gradient-to-r from-purple-500 to-purple-600",
                          currentPhase === "accelerate" && "bg-gradient-to-r from-amber-500 to-amber-600"
                        )
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {isLastStep ? (
                    <>
                      完成学习 <Trophy className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      下一步 <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Keyboard hint */}
            <div className="flex justify-center pt-2">
              <div className="inline-flex items-center gap-3 text-xs text-muted-foreground font-mono">
                <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border">←</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border">→</kbd>
                <span>导航</span>
                <span className="text-border">|</span>
                <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border">ESC</kbd>
                <span>退出</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============== Helper Components ==============

function Spotlight({ target, active }: { target: string; active: boolean }) {
  const [position, setPosition] = React.useState<DOMRect | null>(null)

  React.useEffect(() => {
    const element = document.querySelector(`[data-tour="${target}"]`)
    if (element) {
      const rect = element.getBoundingClientRect()
      setPosition(rect)
    }
  }, [target, active])

  if (!position) return null

  return (
    <div
      className={cn(
        "fixed rounded-xl border-2 transition-all duration-300 pointer-events-none",
        active
          ? "border-primary shadow-[0_0_30px_rgba(var(--primary),0.6)] scale-[1.02]"
          : "border-primary/40 shadow-lg scale-100"
      )}
      style={{
        top: position.top - 12,
        left: position.left - 12,
        width: position.width + 24,
        height: position.height + 24,
      }}
    >
      {active && (
        <div className="absolute inset-0 rounded-xl animate-ping bg-primary/20" />
      )}
    </div>
  )
}

// ============== Utility Functions ==============

function getPhaseProgress(phase: TourPhase, currentStep: number): number {
  const phaseSteps = TOUR_STEPS.filter((s) => s.phase === phase)
  const currentPhaseStep = TOUR_STEPS.findIndex((s) => s.id === TOUR_STEPS[currentStep].id)
  const firstStepIndex = TOUR_STEPS.findIndex((s) => s.phase === phase)

  if (firstStepIndex === -1) return 0

  const progressInPhase = currentPhaseStep - firstStepIndex + 1
  return (progressInPhase / phaseSteps.length) * 100
}

function getPhaseMilestoneCount(phase: TourPhase, currentStep: number): string {
  const phaseMilestones = MILESTONES.filter((m) => m.phase === phase)
  const currentStepData = TOUR_STEPS[currentStep]
  if (!currentStepData?.milestoneId) return `1/${phaseMilestones.length}`

  const milestoneIndex = phaseMilestones.findIndex((m) => m.id === currentStepData.milestoneId)
  return `${milestoneIndex + 1}/${phaseMilestones.length}`
}

// ============== Storage Utilities ==============

const TOUR_STORAGE_KEY = "bme_tour_completed"
const TOUR_PROGRESS_KEY = "bme_tour_progress"

export function isTourCompleted(): boolean {
  if (typeof window === "undefined") return true
  try {
    return localStorage.getItem(TOUR_STORAGE_KEY) === "true"
  } catch {
    return true
  }
}

export function markTourAsCompleted(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, "true")
  } catch {
    // Silently fail
  }
}

function getSavedProgress(): number {
  if (typeof window === "undefined") return -1
  try {
    const saved = localStorage.getItem(TOUR_PROGRESS_KEY)
    return saved ? parseInt(saved, 10) : -1
  } catch {
    return -1
  }
}

function saveProgress(step: number): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(TOUR_PROGRESS_KEY, step.toString())
  } catch {
    // Silently fail
  }
}

function clearSavedProgress(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(TOUR_PROGRESS_KEY)
  } catch {
    // Silently fail
  }
}

export function resetTour(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(TOUR_STORAGE_KEY)
    localStorage.removeItem(TOUR_PROGRESS_KEY)
    localStorage.removeItem("bme_completed_milestones")
    localStorage.removeItem("bme_checked_tasks")
  } catch {
    // Silently fail
  }
}
