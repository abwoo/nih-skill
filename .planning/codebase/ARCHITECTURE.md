# ARCHITECTURE.md - 系统架构设计

**项目名称**: NIH-Skill BME Research Accelerator
**版本**: 1.0.0
**生成时间**: 2026-05-06

---

## 🏗️ 整体架构模式

### 架构风格
**全栈单体应用 (Full-Stack Monolith)** with **模块化服务层**

采用 Next.js App Router 的现代架构，结合清晰的分层设计：

```
┌─────────────────────────────────────────────┐
│                 Presentation Layer            │
│              (React Components / Pages)       │
├─────────────────────────────────────────────┤
│                  Application Layer            │
│        (Custom Hooks / State Management)      │
├─────────────────────────────────────────────┤
│                   Domain Layer                │
│         (Business Logic / Services)           │
├─────────────────────────────────────────────┤
│                Infrastructure Layer           │
│      (API Routes / External Integrations)     │
└─────────────────────────────────────────────┘
```

---

## 🎯 核心设计模式

### 1. **组件层级架构**

#### 应用外壳 (App Shell)
- **[app-shell.tsx](../components/app-shell.tsx)**: 应用根容器
  - 管理全局布局
  - 集成主题提供者
  - 错误边界包裹

#### 工作区系统 (Workspace)
- **[workspace.tsx](../components/workspace/workspace.tsx)**: 主工作区
  - **左侧边栏** ([left-sidebar.tsx](../components/workspace/left-sidebar.tsx)): 导航和会话历史
  - **中央面板** ([center-panel.tsx](../components/workspace/center-panel.tsx)): 主内容区
  - **右侧边栏** ([right-sidebar.tsx](../components/workspace/right-sidebar.tsx)): 上下文和附件

#### 页面路由 (Pages)
- **App Router** 结构:
  - `/`: 主页面 ([page.tsx](../app/page.tsx))
  - `/api/*`: API 路由层

### 2. **状态管理模式**

#### 全局状态
- **[store.tsx](../lib/store.tsx)**: React Context + useReducer
  - 应用级状态管理
  - 会话和对话状态
  - 用户偏好设置

#### 本地状态
- **useState / useReducer**: 组件内部状态
- **自定义 Hooks**: 复用状态逻辑
  - [use-mobile.ts](../hooks/use-mobile.ts): 响应式检测
  - [use-toast.ts](../hooks/use-toast.ts): Toast 通知

### 3. **数据流模式**

#### 单向数据流 (Unidirectional Data Flow)
```
User Action → Event Handler → State Update → Re-render
```

#### API 调用模式
```
Component → Hook/Service → API Client → Route Handler → External Service
                                         ↓
                                    Response ← Processing ← Data Transformation
```

### 4. **技能系统架构**

#### 三层技能引擎
1. **Skill Engine** ([skill-engine.ts](../lib/skill-engine.ts))
   - 技能注册表
   - 技能发现和加载
   - 生命周期管理

2. **Execution Engine** ([skill-execution-engine.ts](../lib/skill-execution-engine.ts))
   - 技能执行上下文
   - 参数绑定和验证
   - 结果收集

3. **Orchestrator** ([skill-orchestrator.ts](../lib/skill-orchestrator.ts))
   - 多技能协调
   - 工作流编排
   - 依赖管理

#### 技能安全模型
- **[skill-security.ts](../lib/skill-security.ts)**:
  - 沙箱执行环境
  - 权限等级控制
  - 资源使用限制

---

## 🧩 关键模块职责划分

### 📱 表示层 (Presentation Layer)

#### UI 组件库
- **位置**: [components/ui/](../components/ui/)
- **数量**: 60+ 组件
- **基础**: Radix UI primitives + Tailwind CSS
- **特点**:
  - 完全无障碍 (Accessible)
  - 主题一致
  - 可组合设计

#### 业务组件
- **工作区组件**: [workspace/](../components/workspace/)
- **应用组件**:
  - [conversation-sidebar.tsx](../components/conversation-sidebar.tsx): 会话列表
  - [top-nav.tsx](../components/top-nav.tsx): 顶部导航
  - [guided-tour.tsx](../components/guided-tour.tsx): 引导教程
  - [quick-hints.tsx](../components/quick-hints.tsx): 快速提示

### 🔧 应用层 (Application Layer)

#### 自定义 Hooks
- **[use-mobile.ts](../hooks/use-mobile.ts)**: 移动端响应式
- **[use-toast.ts](../hooks/use-toast.ts)**: Toast 通知系统

#### 状态管理
- **Context Providers**:
  - ThemeProvider: 主题切换
  - Store Provider: 全局状态

### 💼 领域层 (Domain Layer)

#### 核心业务服务
- **搜索服务** ([search-service.ts](../lib/search-service.ts)):
  - 多源聚合搜索
  - 结果排序和过滤
  - 查询优化

- **论文服务** ([fetch-paper-service.ts](../lib/fetch-paper-service.ts)):
  - 论文元数据获取
  - 全文下载
  - 格式转换

- **DOI 服务**:
  - [doi-extractor.ts](../lib/doi-extractor.ts): DOI 识别和提取
  - [doi-resolver.ts](../lib/doi-resolver.ts): DOI 解析和链接
  - [doi-metadata-enricher.ts](../lib/doi-metadata-enricher.ts): 元数据增强
  - [doi-config-manager.ts](../lib/doi-config-manager.ts): 配置管理
  - [doi-gateway.ts](../lib/doi-gateway.ts): 统一网关

- **引用服务** ([citations-service.ts](../lib/citations-service.ts)):
  - 引用网络构建
  - 影响力分析
  - 相关文献推荐

- **文档处理**:
  - [pdf-parser.ts](../lib/pdf-parser.ts): PDF 解析
  - [file-processor.ts](../lib/file-processor.ts): 通用文件处理
  - [url-fetcher.ts](../lib/url-fetcher.ts): URL 内容抓取

- **智能处理**:
  - [input-detector.ts](../lib/input-detector.ts): 输入类型识别
  - [input-processor.ts](../lib/input-processor.ts): 输入预处理
  - [adaptive-reasoning.ts](../lib/adaptive-reasoning.ts): 自适应推理

### 🏗️ 基础设施层 (Infrastructure Layer)

#### API 路由层
- **位置**: [app/api/](../app/api/)
- **职责**:
  - HTTP 请求处理
  - 参数验证
  - 错误处理
  - 响应格式化

#### 外部集成
- **AI 提供商**: [providers.ts](../lib/providers.ts), [api.ts](../lib/api.ts)
- **安全层**: [api-security.ts](../lib/api-security.ts)
- **日志系统**: [logger.ts](../lib/logger.ts)

---

## 🔗 组件通信机制

### 1. **Props Drilling (受控组件)**
- 适用场景: 父子组件通信
- 示例: Workspace → CenterPanel → MessageCards

### 2. **Context API (跨层级共享)**
- **Theme Context**: 主题状态
- **Store Context**: 全局应用状态
- **Toast Context**: 通知系统

### 3. **事件驱动 (Event Emitter)**
- 自定义事件总线 (如需要)
- 回调函数模式

### 4. **URL 状态 (路由参数)**
- 查询参数传递
- 路由状态同步

---

## 🛡️ 错误处理策略

### 分层错误处理

#### 表示层
- **Error Boundary** ([error-boundary.tsx](../components/error-boundary.tsx)):
  - 捕获渲染错误
  - 友好错误展示
  - 恢复机制

#### 应用层
- Try-Catch 包裹异步操作
- 用户友好的错误消息
- 错误上报到日志

#### 领域层
- 业务逻辑验证
- 数据完整性检查
- 异常情况处理

#### 基础设施层
- API 错误响应标准化
- 网络错误重试
- 超时处理

### 错误类型分类
```typescript
// 伪代码示例
type AppError =
  | ValidationError    // 用户输入错误
  | NetworkError       // 网络连接问题
  | ApiError           // API 调用失败
  | AuthError          // 认证授权问题
  | SkillError         // 技能执行错误
  | UnknownError       // 未预期错误
```

---

## 🎨 设计原则和最佳实践

### 1. **关注点分离 (Separation of Concerns)**
- UI 与业务逻辑分离
- 服务与数据访问分离
- 配置与代码分离

### 2. **DRY (Don't Repeat Yourself)**
- 公共逻辑抽取为工具函数
- 组件复用通过组合
- 服务层避免重复实现

### 3. **单一职责 (Single Responsibility)**
- 每个模块/组件只有一个变更原因
- 函数保持简短专注
- 类/对象职责明确

### 4. **开闭原则 (Open/Closed)**
- 通过扩展而非修改增加功能
- 插件化的技能系统
- 可配置的提供商支持

### 5. **依赖倒置 (Dependency Inversion)**
- 依赖抽象接口
- 依赖注入模式
- 模块间松耦合

---

## 📊 架构决策记录 (ADR)

### ADR-001: 选择 Next.js App Router
**决定**: 使用 Next.js 16 App Router 而非 Pages Router
**原因**:
- 更好的布局系统
- Server Components 支持
- 更简洁的路由结构
- 更优的性能模型

### ADR-002: 使用 Radix UI + shadcn/ui
**决定**: 基于 Radix UI 构建 UI 组件库
**原因**:
- 完整的无障碍支持
- 非样式化的原始组件
- 高度可定制
- 社区活跃且维护良好

### ADR-003: React Context 状态管理
**决定**: 使用 Context + useReducer 而非 Redux/Zustand
**原因**:
- 应用复杂度适中
- 避免额外依赖
- Next.js SSR 友好
- 足够的状态管理能力

### ADR-004: 技能系统插件化架构
**决定**: 采用插件化的技能执行引擎
**原因**:
- 支持动态扩展
- 松耦合设计
- 沙箱安全执行
- 易于测试和维护

---

## 🔄 架构演进路线图

### 当前阶段 (v1.0)
- ✅ 基础架构搭建
- ✅ 核心功能实现
- ✅ 技能系统原型

### 短期目标 (v1.1-v1.2)
- [ ] 性能优化 (懒加载、代码分割)
- [ ] 缓存层引入
- [ ] 测试覆盖率提升

### 中期目标 (v2.0)
- [ ] 微服务拆分准备
- [ ] 实时协作功能
- [ ] 高级分析功能

### 长期愿景
- [ ] 多租户支持
- [ ] 插件市场
- [ ] 云原生部署

---

## 📐 架构约束和技术限制

### 浏览器兼容性
- 现代浏览器 (Chrome, Firefox, Safari, Edge 最新版)
- ES6+ 支持
- 不支持 IE

### 性能目标
- 首屏加载 < 3s
- API 响应 < 500ms
- 交互响应 < 100ms

### 可扩展性
- 支持 100+ 并发用户
- 1000+ 技能注册
- 多 AI 提供商同时运行

### 安全要求
- HTTPS 强制
- API 密钥加密存储
- 输入验证和消毒
- XSS/CSRF 防护
