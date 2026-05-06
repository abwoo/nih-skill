# INTEGRATIONS.md - 系统集成概览

**项目名称**: NIH-Skill BME Research Accelerator
**版本**: 1.0.0
**生成时间**: 2026-05-06

---

## 🌐 外部 API 集成

### 核心 API 路由

#### 1. 聊天 API (`/api/chat`)
- **功能**: AI 对话接口
- **位置**: [route.ts](../app/api/chat/route.ts)
- **特性**: 
  - 流式响应支持
  - 多模型提供商适配
  - 上下文管理

#### 2. 搜索 API (`/api/search`)
- **功能**: 学术文献搜索
- **位置**: [route.ts](../app/api/search/route.ts)
- **数据源**:
  - PubMed
  - Semantic Scholar
  - OpenAlex
  - arXiv
  - CrossRef

#### 3. PDF 解析 API (`/api/parse-pdf`)
- **功能**: PDF 文件文本提取
- **位置**: [route.ts](../app/api/parse-pdf/route.ts)
- **技术栈**:
  - pdf-parse (文本提取)
  - pdfjs-dist (渲染支持)

#### 4. 论文获取 API (`/api/fetch-paper`)
- **功能**: 论文元数据和全文获取
- **位置**: [route.ts](../app/api/fetch-paper/route.ts)
- **能力**:
  - DOI 解析
  - URL 抓取
  - 元数据提取

#### 5. 引用服务 API (`/api/citations`)
- **功能**: 论文引用关系查询
- **位置**: [route.ts](../app/api/citations/route.ts)
- **数据**: 引用网络、参考文献列表

#### 6. 技能信息 API (`/api/skill-info`)
- **功能**: 技能系统状态查询
- **位置**: [route.ts](../app/api/skill-info/route.ts)

#### 7. 数据集 API (`/api/datasets`)
- **功能**: 数据集管理和访问
- **位置**: [route.ts](../app/api/datasets/route.ts)

#### 8. 输入检测 API (`/api/detect-input`)
- **功能**: 智能输入类型识别
- **位置**: [route.ts](../app/api/detect-input/route.ts)

#### 9. 诊断 API (`/api/diagnose-search`, `/api/verify-real-api`)
- **功能**: 系统健康诊断
- **用途**: API 连接性验证、问题排查

#### 10. 网关 API (`/api/gateway`)
- **功能**: 统一 API 网关
- **位置**: [route.ts](../app/api/gateway/route.ts)

---

## 🤖 AI 提供商集成

### 支持的 AI 提供商

基于 [providers.ts](../lib/providers.ts) 的配置：

| 提供商 | 用途 | 状态 |
|--------|------|------|
| **OpenAI** | GPT 系列, Embeddings | ✅ 主要 |
| **Anthropic** | Claude 系列 | ✅ 支持 |
| **Google** | Gemini 系列 | ✅ 支持 |
| **Groq** | 快速推理 | ✅ 支持 |
| **其他** | 可扩展 | ⚙️ 可配置 |

### API 密钥管理
- 环境变量配置 (见 .env.example)
- 多密钥支持
- 动态提供商切换

---

## 📚 第三方服务依赖

### 学术数据库服务
- **PubMed Central**: 生物医学文献
- **Semantic Scholar**: AI 驱动的学术搜索
- **OpenAlex**: 开放学术图谱
- **arXiv**: 预印本服务器
- **CrossRef**: DOI 注册机构

### 文档处理服务
- **PDF.js**: PDF 渲染
- **Cheerio**: HTML/XML 解析
- **pdf-parse**: PDF 文本提取

### 分析和可视化
- **Vercel Analytics**: 用户行为分析
- **Recharts**: 数据图表渲染

---

## 🔌 技能系统集成架构

### 技能目录结构
```
openclaw-temp/skills/
├── bioinformatics/          # 生物信息学技能
│   ├── scanpy/             # 单细胞分析
│   ├── scikit-bio/         # 生物计算
│   └── ...
├── data-analysis/           # 数据分析技能
│   ├── pandas/             # 数据处理
│   ├── plotly/             # 可视化
│   └── statistics/         # 统计分析
├── document-processing/     # 文档处理
│   ├── pdf/                # PDF 处理
│   ├── docx/               # Word 文档
│   └── pptx/               # PowerPoint
├── research-tools/          # 研究工具
│   ├── pubmed-search/      # PubMed 搜索
│   ├── arxiv-search/       # arXiv 搜索
│   └── doi-extractor/      # DOI 提取
└── ai-integration/          # AI 集成
    ├── deep-research/       # 深度研究
    └── brainstorming/       # 头脑风暴
```

### 技能执行引擎
核心文件：
- [skill-engine.ts](../lib/skill-engine.ts): 技能注册和调度
- [skill-execution-engine.ts](../lib/skill-execution-engine.ts): 技能执行逻辑
- [skill-orchestrator.ts](../lib/skill-orchestrator.ts): 技能编排和协调
- [skill-security.ts](../lib/skill-security.ts): 安全沙箱

### 技能数量统计
- **总计**: 120+ 个技能
- **类别**: 15+ 个主要类别
- **语言**: Python 为主，部分 Node.js

---

## 🔄 数据流架构

### 典型请求流程

```
用户输入 → 输入检测 → 技能选择 → API 调用 → 结果处理 → UI 渲染
```

### 详细数据流

1. **输入阶段**
   - [input-detector.ts](../lib/input-detector.ts): 识别输入类型 (DOI, URL, 文本, 文件)
   - [input-processor.ts](../lib/input-processor.ts): 预处理和标准化

2. **API 层**
   - [api.ts](../lib/api.ts): 统一 API 客户端封装
   - [api-security.ts](../lib/api-security.ts): 安全验证层

3. **服务层**
   - [search-service.ts](../lib/search-service.ts): 搜索聚合
   - [fetch-paper-service.ts](../lib/fetch-paper-service.ts): 论文获取
   - [doi-resolver.ts](../lib/doi-resolver.ts): DOI 解析链
   - [citations-service.ts](../lib/citations-service.ts): 引用数据
   - [pdf-parser.ts](../lib/pdf-parser.ts): PDF 处理
   - [file-processor.ts](../lib/file-processor.ts): 通用文件处理

4. **输出阶段**
   - [url-fetcher.ts](../lib/url-fetcher.ts): URL 内容抓取
   - [markdown-renderer.ts](../components/workspace/markdown-renderer.tsx): Markdown 渲染

---

## 🔐 安全集成

### API 安全
- [api-security.ts](../lib/api-security.ts):
  - 请求验证
  - Rate limiting 准备
  - 输入消毒

### 环境变量保护
- .env.local 被 .gitignore 排除
- .env.example 提供模板
- 敏感信息不硬编码

### 技能沙箱
- [skill-security.ts](../lib/skill-security.ts):
  - 技能执行隔离
  - 权限控制
  - 资源限制

---

## 🌍 外部服务连接状态

| 服务 | 协议 | 认证方式 | 用途 |
|------|------|----------|------|
| PubMed API | REST | API Key | 生物医学文献 |
| Semantic Scholar | REST | API Key | 学术搜索 |
| OpenAlex | REST | 无需 (开放) | 开放学术数据 |
| arXiv API | REST | 无需 | 预印本论文 |
| CrossRef | REST | Email | DOI 元数据 |
| OpenAI API | REST | API Key | AI 模型 |
| Anthropic API | REST | API Key | Claude 模型 |
| Google AI | REST | API Key | Gemini 模型 |

---

## 📈 集成模式总结

### 设计原则
1. **统一 API 层**: 所有外部调用通过 lib/api.ts 封装
2. **服务解耦**: 每个服务独立模块化
3. **错误隔离**: 每个集成点独立错误处理
4. **可观测性**: 诊断端点和日志记录
5. **可扩展性**: 提供商抽象层便于添加新服务

### 扩展能力
- ✅ 新增 AI 提供商: 在 providers.ts 添加配置
- ✅ 新增数据源: 创建新的 service 文件
- ✅ 新增技能: 在 skills/ 目录添加 SKILL.md
- ✅ 新增 API 路由: 在 app/api/ 添加 route.ts

---

## ⚠️ 集成注意事项

### 依赖风险
- **第三方 API 可用性**: 需要错误重试机制
- **API 限制**: Rate limiting 和配额管理
- **数据一致性**: 缓存策略需要完善

### 性能考虑
- **并行请求**: 搜索多个数据源时的并发控制
- **超时管理**: 外部 API 调用的超时设置
- **缓存策略**: 频繁查询结果的本地缓存

### 未来改进方向
- [ ] 添加 API 响应缓存层
- [ ] 实现请求去重和合并
- [ ] 添加断路器模式 (Circuit Breaker)
- [ ] 完善监控和告警机制
