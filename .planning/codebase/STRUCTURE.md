# STRUCTURE.md - 项目目录结构详解

**项目名称**: NIH-Skill BME Research Accelerator
**版本**: 1.0.0
**生成时间**: 2026-05-06

---

## 📂 顶层目录结构

```
D:\nih-skill/
├── app/                          # Next.js App Router 应用代码
│   ├── api/                      # API 路由层
│   │   ├── chat/                 # 聊天接口
│   │   ├── citations/            # 引用服务
│   │   ├── datasets/             # 数据集接口
│   │   ├── detect-input/         # 输入检测
│   │   ├── diagnose-search/      # 搜索诊断
│   │   ├── fetch-paper/          # 论文获取
│   │   ├── gateway/              # API 网关
│   │   ├── health/               # 健康检查
│   │   ├── parse-pdf/            # PDF 解析
│   │   ├── search/               # 搜索服务
│   │   ├── skill-info/           # 技能信息
│   │   └── verify-real-api/      # API 验证
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 主页面
│
├── components/                   # React 组件
│   ├── agent/                    # Agent 相关组件
│   │   └── message-cards.tsx     # 消息卡片
│   ├── ui/                       # UI 基础组件库 (60+)
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ... (更多组件)
│   ├── workspace/                # 工作区组件
│   │   ├── attachment-card.tsx   # 附件卡片
│   │   ├── center-panel.tsx      # 中央面板
│   │   ├── left-sidebar.tsx      # 左侧边栏
│   │   ├── markdown-renderer.tsx # Markdown 渲染器
│   │   ├── right-sidebar.tsx     # 右侧边栏
│   │   └── workspace.tsx         # 工作区主组件
│   ├── api-settings-drawer.tsx   # API 设置抽屉
│   ├── app-shell.tsx             # 应用外壳
│   ├── brand-icons.tsx           # 品牌图标
│   ├── conversation-sidebar.tsx  # 会话侧边栏
│   ├── darwin-panel.tsx          # Darwin 面板
│   ├── error-boundary.tsx        # 错误边界
│   ├── guided-tour.tsx           # 引导教程
│   ├── quick-hints.tsx           # 快速提示
│   ├── theme-provider.tsx        # 主题提供者
│   └── top-nav.tsx              # 顶部导航
│
├── hooks/                        # 自定义 React Hooks
│   ├── use-mobile.ts            # 移动端检测
│   └── use-toast.ts             # Toast 通知
│
├── lib/                          # 核心业务逻辑库
│   ├── adaptive-reasoning.ts     # 自适应推理
│   ├── api.ts                   # API 客户端封装
│   ├── api-security.ts          # API 安全
│   ├── citations-service.ts     # 引用服务
│   ├── doi-*                     # DOI 相关服务 (6个文件)
│   ├── fetch-paper-service.ts   # 论文获取服务
│   ├── file-processor.ts        # 文件处理器
│   ├── input-detector.ts        # 输入检测器
│   ├── input-processor.ts       # 输入处理器
│   ├── logger.ts                # 日志系统
│   ├── pdf-parser.ts            # PDF 解析器
│   ├── providers.ts             # AI 提供商配置
│   ├── search-service.ts        # 搜索服务
│   ├── skill-engine.ts          # 技能引擎
│   ├── skill-execution-engine.ts # 技能执行引擎
│   ├── skill-orchestrator.ts    # 技能编排器
│   ├── skill-security.ts        # 技能安全
│   ├── store.tsx                # 状态管理
│   ├── types.ts                 # 类型定义
│   ├── url-fetcher.ts           # URL 抓取器
│   └── utils.ts                 # 工具函数
│
├── openclaw-temp/                # OpenClaw 技能模板
│   └── skills/                  # 120+ 技能定义
│       ├── bioinformatics/
│       ├── data-analysis/
│       ├── document-processing/
│       ├── research-tools/
│       └── ...
│
├── darwin-skill-temp/            # Darwin 技能资源
│   ├── assets/                  # 图片和媒体资源
│   ├── docs/                    # 文档
│   ├── scripts/                 # 脚本
│   └── templates/               # 模板
│
├── public/                       # 静态资源
│   ├── *.png, *.svg             # 图标和图片
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service Worker
│
├── references/                   # 参考文档
│   ├── *-methodology.md         # 方法论文档
│   └── ...                      # 更多参考
│
├── styles/                       # 样式文件
│   └── globals.css              # 全局样式
│
├── types/                        # TypeScript 类型声明
│   └── pdf-parse.d.ts           # PDF 解析类型
│
├── .planning/                    # GSD 规划文档 (新建)
│   └── codebase/               # 代码库映射
│
├── .next/                        # Next.js 构建输出
├── .vscode/                      # VS Code 配置
│   ├── extensions.json          # 推荐扩展
│   └── settings.json            # 编辑器设置
│
├── .dockerignore                 # Docker 忽略文件
├── .editorconfig                 # 编辑器配置
├── .env.example                  # 环境变量示例
├── .eslintrc.json                # ESLint 配置
├── .gitignore                    # Git 忽略文件
├── .prettierignore               # Prettier 忽略文件
├── .prettierrc                   # Prettier 配置
├── COMPETITIVE-MOAT-ANALYSIS.md  # 竞争分析
├── DIAGNOSTIC_REPORT.md          # 诊断报告
├── Dockerfile                    # Docker 构建文件
├── MEMORY_DIAGNOSTIC_REPORT.md   # 内存诊断报告
├── README.md                     # 项目说明
├── SKILL.md                      # 技能定义
├── check-env.js                  # 环境检查脚本
├── diagnose-api.js               # API 诊断脚本
├── diagnose-memory.js            # 内存诊断脚本
├── docker-compose.yml            # Docker Compose 配置
├── next.config.mjs              # Next.js 配置
├── package.json                 # 项目依赖
├── postcss.config.mjs           # PostCSS 配置
├── setup.bat / setup.sh          # 安装脚本
├── test-prompts.json            # 测试提示词
├── tsconfig.json                # TypeScript 配置
└── results.tsv                  # 结果数据
```

---

## 📁 目录职责说明

### `/app/` - Next.js 应用入口

**职责**: 应用路由、页面和 API 端点

**关键文件**:
- **layout.tsx**: 定义 HTML 结构、元数据、全局样式导入
- **page.tsx**: 应用首页，包含主要 UI 结构
- **globals.css**: Tailwind 基础样式和自定义变量

**API 路由组织**:
- 每个 API 功能独立目录
- 遵循 RESTful 约定
- 统一的错误处理模式

---

### `/components/` - React 组件库

**职责**: 可复用的 UI 组件和业务组件

**子目录说明**:

#### `/components/ui/` - 基础 UI 组件
- **数量**: 60+ 组件
- **基础**: Radix UI primitives
- **样式**: Tailwind CSS + CVA (class-variance-authority)
- **特点**:
  - 完整的类型定义
  - 可访问性支持
  - 一致的 API 设计
  - 复合组件模式

**常用组件示例**:
```typescript
// Button 组件用法
<Button variant="default" size="sm">
  Click me
</Button>

// Dialog 组件用法
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

#### `/components/workspace/` - 工作区组件
- **workspace.tsx**: 主工作区容器，三栏布局
- **left-sidebar.tsx**: 会话历史、导航菜单
- **center-panel.tsx**: 主内容区，消息显示和输入
- **right-sidebar.tsx**: 上下文信息、附件列表
- **attachment-card.tsx**: 附件预览卡片
- **markdown-renderer.tsx**: Markdown 内容渲染

#### `/components/agent/` - Agent 组件
- **message-cards.tsx**: AI 消息卡片展示

#### 应用级组件
- **app-shell.tsx**: 应用外壳，包裹整个应用
- **top-nav.tsx**: 顶部导航栏
- **conversation-sidebar.tsx**: 会话列表侧边栏
- **error-boundary.tsx**: React 错误边界
- **guided-tour.tsx**: 新手引导
- **quick-hints.tsx**: 操作提示
- **theme-provider.tsx**: 主题切换提供者

---

### `/hooks/` - 自定义 Hooks

**职责**: 封装可复用的状态逻辑和副作用

**现有 Hooks**:

#### `use-mobile.ts`
```typescript
// 用途: 检测移动设备视口
// 返回: boolean
const isMobile = useMobile()
```

#### `use-toast.ts`
```typescript
// 用途: Toast 通知系统
// 返回: { toast, dismiss, toasts }
const { toast } = useToast()
toast({ title: "Success", description: "File uploaded" })
```

---

### `/lib/` - 核心业务逻辑

**职责**: 应用核心功能、服务层、工具函数

**模块分组**:

#### 1️⃣ API 层
- **api.ts**: 统一 API 客户端
  - HTTP 请求封装
  - 流式响应处理
  - 错误处理
  - 超时管理

- **api-security.ts**: 安全层
  - 请求验证
  - 输入消毒
  - 权限检查

- **providers.ts**: AI 提供商配置
  - 支持的模型列表
  - API 密钥配置
  - 提供商切换逻辑

#### 2️⃣ 服务层
- **search-service.ts**: 搜索聚合
  - 多源搜索 (PubMed, Semantic Scholar, etc.)
  - 结果排序和过滤
  - 查询优化

- **fetch-paper-service.ts**: 论文获取
  - DOI/URL 解析
  - 元数据抓取
  - 全文下载

- **citations-service.ts**: 引用服务
  - 引用关系查询
  - 影响力计算
  - 相关文献推荐

- **pdf-parser.ts**: PDF 处理
  - 文本提取
  - 元数据解析
  - 内容分段

- **file-processor.ts**: 通用文件处理
  - 文件类型识别
  - 格式转换
  - 大文件处理

- **url-fetcher.ts**: URL 抓取
  - 网页内容提取
  - HTML 解析
  - 内容清洗

#### 3️⃣ DOI 服务套件
- **doi-extractor.ts**: 从文本提取 DOI
- **doi-resolver.ts**: DOI 到 URL/元数据的解析
- **doi-metadata-enricher.ts**: 元数据增强
- **doi-config-manager.ts**: DOI 配置管理
- **doi-gateway.ts**: 统一 DOI 网关
- **doi-extractor-types.ts**: 类型定义

#### 4️⃣ 输入处理
- **input-detector.ts**: 智能输入识别
  - DOI 检测
  - URL 识别
  - 文本分类
  - 文件类型判断

- **input-processor.ts**: 输入预处理
  - 格式标准化
  - 内容清理
  - 预验证

#### 5️⃣ 技能系统
- **skill-engine.ts**: 技能引擎核心
  - 技能注册和发现
  - 生命周期管理
  - 技能匹配算法

- **skill-execution-engine.ts**: 执行引擎
  - 上下文管理
  - 参数绑定
  - 结果收集

- **skill-orchestrator.ts**: 编排器
  - 多技能协调
  - 工作流执行
  - 依赖解析

- **skill-security.ts**: 安全沙箱
  - 执行隔离
  - 权限控制
  - 资源限制

#### 6️⃣ 基础设施
- **store.tsx**: 全局状态管理
  - React Context
  - useReducer
  - 状态切片

- **logger.ts**: 日志系统
  - 多级别日志
  - 结构化输出
  - 环境感知

- **utils.ts**: 工具函数
  - cn() - 类名合并
  - 通用辅助函数

- **types.ts**: 共享类型定义
  - 接口定义
  - 类型别名
  - 枚举

- **adaptive-reasoning.ts**: 自适应推理
  - 查询理解
  - 策略选择
  - 结果优化

---

### `/openclaw-temp/skills/` - 技能定义库

**职责**: 存储所有可用技能的定义和元数据

**结构**:
```
skills/
├── _meta.json              # 技能元数据索引
├── skill-name/
│   └── SKILL.md            # 技能定义文件
└── ...
```

**技能分类** (15+ 类别):
1. **bioinformatics/** - 生物信息学 (scanpy, biopython, etc.)
2. **data-analysis/** - 数据分析 (pandas, polars, etc.)
3. **chemistry/** - 化学 (rdkit, chembl, etc.)
4. **document-processing/** - 文档处理 (pdf, docx, pptx)
5. **research-tools/** - 研究工具 (pubmed, arxiv, etc.)
6. **visualization/** - 可视化 (matplotlib, plotly, etc.)
7. **ml-ai/** - 机器学习 (scikit-learn, transformers)
8. **statistics/** - 统计学 (statsmodels, scipy)
9. **genomics/** - 基因组学
10. **proteomics/** - 蛋白质组学
11. **imaging/** - 医学影像
12. **clinical/** - 临床数据
13. **integration/** - 集成工具
14. **ai-integration/** - AI 集成
15. **utilities/** - 实用工具

**每个技能包含**:
- **SKILL.md**: 技能描述、参数、示例
- **可选文件**: API.py, 配置文件, 资源

---

### `/public/` - 静态资源

**职责**: 存放不需要构建处理的静态文件

**内容**:
- **图标**: PNG, SVG 格式的应用图标
- **manifest.json**: PWA (Progressive Web App) 清单
- **sw.js**: Service Worker 离线支持
- **占位图片**: 默认头像、logo 等

---

### `/references/` - 参考文档

**职责**: 领域知识和方法论参考

**内容**:
- 生物医学工程方法论
- 数据分析最佳实践
- 研究伦理指南
- 技术规范文档

---

### `/styles/` - 样式文件

**职责**: 全局和应用级样式

**内容**:
- **globals.css**: Tailwind 基础样式、CSS 变量、自定义样式

---

### `/types/` - 类型声明

**职责**: 第三方库的 TypeScript 类型定义

**内容**:
- **pdf-parse.d.ts**: pdf-parse 库的类型补充

---

## 📝 文件命名规范

### 组件文件
- **格式**: PascalCase (大驼峰)
- **示例**: `Button.tsx`, `Workspace.tsx`, `MarkdownRenderer.tsx`
- **后缀**: `.tsx` (带 JSX), `.ts` (纯逻辑)

### 工具/服务文件
- **格式**: kebab-case (短横线分隔)
- **示例**: `api.ts`, `search-service.ts`, `pdf-parser.ts`
- **后缀**: `.ts`

### 配置文件
- **格式**: 点分隔或 kebab-case
- **示例**: `.eslintrc.json`, `.prettierrc`, `next.config.mjs`

### 页面和布局
- **固定名称**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- **位置**: 决定路由路径

---

## 🗂️ 模块组织方式

### 1. **功能模块化 (Feature-based)**
按业务功能组织代码:
- 搜索功能: search-service.ts + /api/search/
- PDF 处理: pdf-parser.ts + /api/parse-pdf/
- 引用服务: citations-service.ts + /api/citations/

### 2. **层次化分层 (Layered Architecture)**
```
表示层 (components/) → 应用层 (hooks/) → 领域层 (lib/services) → 基础设施层 (lib/api)
```

### 3. **关注点分离 (Separation of Concerns)**
- UI 组件只负责展示
- Hooks 封装状态逻辑
- Services 处理业务逻辑
- API 层处理通信

### 4. **公共导出 (Barrel Exports)**
- 每个模块有清晰的导出接口
- 类型定义集中管理
- 避免循环依赖

---

## 🎯 代码组织最佳实践

### ✅ 推荐做法
1. **相关文件就近放置**: 组件和服务放在相邻位置
2. **单一职责**: 每个文件只做一件事
3. **清晰命名**: 文件名反映其用途
4. **合理深度**: 目录层级不超过 3-4 层
5. **索引文件**: 使用 index.ts 导出公共 API

### ❌ 避免做法
1. **巨型文件**: 单文件超过 300 行考虑拆分
2. **深层嵌套**: 过多的子目录增加复杂度
3. **循环依赖**: 模块间相互引用
4. **散乱放置**: 相关文件分散在不同位置

---

## 📊 代码规模统计

| 类别 | 文件数 | 估计行数 |
|------|--------|----------|
| React 组件 | ~80 | ~15,000 |
| API 路由 | ~13 | ~2,000 |
| 服务/逻辑 | ~30 | ~12,000 |
| 技能定义 | ~120+ | ~30,000+ |
| 配置/工具 | ~15 | ~2,000 |
| **总计** | **~260+** | **~61,000+** |

---

## 🔍 快速定位指南

### "我想找..."
- **UI 组件?** → `/components/ui/`
- **页面组件?** → `/app/` 或 `/components/`
- **API 端点?** → `/app/api/[feature]/route.ts`
- **业务逻辑?** → `/lib/[service].ts`
- **类型定义?** → `/lib/types.ts` 或 `/types/`
- **技能定义?** → `/openclaw-temp/skills/[name]/SKILL.md`
- **配置文件?** → 项目根目录 (`.config` 文件)
- **静态资源?** → `/public/`
- **样式?** → `/app/globals.css` 或 `/styles/`
