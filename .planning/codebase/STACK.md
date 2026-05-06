# STACK.md - 技术栈概览

**项目名称**: NIH-Skill BME Research Accelerator
**版本**: 1.0.0
**生成时间**: 2026-05-06

---

## 🎯 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 16.2.4 | 全栈 React 框架 (App Router) |
| **React** | ^19 | UI 库 |
| **TypeScript** | 5.7.3 | 类型安全的 JavaScript 超集 |

---

## 🎨 UI 组件系统

### 基础 UI 库
- **Radix UI**: 无障碍的原始组件库 (30+ 组件)
  - Accordion, Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu, Popover, Select, Tabs, Toast 等
- **Tailwind CSS** v4.2.0: 实用优先的 CSS 框架
- **shadcn/ui**: 基于 Radix + Tailwind 的组件库模式

### 样式工具
- **tailwind-merge** ^3.3.1: 合并 Tailwind 类名
- **clsx** ^2.1.1: 条件类名工具
- **class-variance-authority** ^0.7.1: 组件变体管理
- **tw-animate-css** ^1.3.3: Tailwind 动画工具

### 图表和数据可视化
- **Recharts** ^2.15.0: React 图表库

### 表单处理
- **react-hook-form** ^7.54.1: 高性能表单验证
- **@hookform/resolvers** ^3.9.1: 表单解析器集成
- **zod** ^3.24.1: TypeScript-first schema 验证

### 其他 UI 组件
- **Lucide React** ^0.564.0: 图标库
- **Sonner** ^1.7.1: Toast 通知
- **date-fns** ^4.1.0: 日期处理
- **cmdk** ^1.1.1: 命令面板
- **embla-carousel-react** ^8.6.0: 轮播组件
- **next-themes** ^0.4.6: 主题切换

---

## 📡 API 和数据层

### HTTP 客户端
- 内置 Fetch API (通过 lib/api.ts 封装)
- 支持流式响应 (Streaming)

### 数据处理
- **cheerio** ^1.0.0: 服务端 HTML 解析
- **pdf-parse** ^1.1.1: PDF 文本提取
- **pdfjs-dist** ^4.0.379: PDF.js 渲染引擎

### 分析
- **@vercel/analytics** ^1.6.1: Vercel 分析

---

## 🔧 开发工具链

### 代码质量
- **ESLint**: JavaScript/TypeScript 代码检查
  - 扩展: eslint:recommended, @typescript-eslint/recommended, next/core-web-vitals
- **Prettier**: 代码格式化
  - 配置: 单引号, 2空格缩进, 分号, 100字符行宽
- **EditorConfig**: 编辑器统一配置

### 构建工具
- **PostCSS** ^8.5: CSS 处理
- **Autoprefixer** ^10.4.20: CSS 自动前缀
- **@tailwindcss/postcss** ^4.2.0: Tailwind CSS 处理

### 类型系统
- **TypeScript** 严格模式启用
- **@types/node**, **@types/react**, **@types/react-dom**: 类型定义

---

## 🐳 容器和部署

### Docker
- **Dockerfile**: 多阶段构建
  - 基础镜像: node:20-alpine
  - 阶段: deps → builder → runner
  - 生产环境优化
- **Docker Compose**:
  - 服务定义: nih-skill
  - 端口映射: 3000:3000
  - 健康检查配置
  - 环境变量管理

---

## 📦 NPM Scripts

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | ESLint 检查 |
| `npm run lint:fix` | ESLint 自动修复 |
| `npm run format` | Prettier 格式化 |
| `npm run format:check` | Prettier 检查 |
| `npm run type-check` | TypeScript 类型检查 |
| `npm run clean` | 清理构建缓存 |
| `npm run rebuild` | 清理后重新构建 |
| `npm run docker:build` | 构建 Docker 镜像 |
| `npm run docker:up` | 启动 Docker 容器 |
| `npm run docker:down` | 停止 Docker 容器 |
| `npm run health` | 健康检查 |

---

## ⚙️ Next.js 配置要点

```javascript
// next.config.mjs 关键配置
{
  images: { unoptimized: true },  // 禁用图像优化
  serverExternalPackages: ["fs", "path", "cheerio", "pdf-parse", "pdfjs-dist"],
  typescript: { ignoreBuildErrors: true },  // 开发阶段临时忽略类型错误
  pageExtensions: ['tsx', 'ts', 'js', 'jsx']
}
```

---

## 🎯 项目定位

这是一个 **生物医学工程研究加速器**，专注于：
- 学术文献搜索和分析
- PDF 解析和处理
- DOI 管理和引用追踪
- AI 驱动的技能系统（生物信息学、数据分析等）
- 多提供商 AI API 集成

---

## 📊 技术栈成熟度评估

- ✅ **前端框架**: 成熟稳定 (Next.js 16 + React 19)
- ✅ **UI 系统**: 企业级 (Radix UI + shadcn/ui)
- ✅ **类型安全**: 严格模式 (TypeScript strict)
- ✅ **容器化**: 生产就绪 (Docker 多阶段构建)
- ⚠️ **测试覆盖**: 待完善 (需补充单元测试)
- ⚠️ **类型检查**: 开发阶段暂时放宽 (ignoreBuildErrors: true)
