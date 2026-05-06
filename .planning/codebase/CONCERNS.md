# CONCERNS.md - 技术债务与关注点

**项目名称**: NIH-Skill BME Research Accelerator
**版本**: 1.0.0
**生成时间**: 2026-05-06
**严重程度**: ⚠️ 中等 (需要关注但不紧急)

---

## 📊 总览统计

| 优先级 | 数量 | 影响范围 |
|--------|------|----------|
| 🔴 P0 - 紧急 | 3 | 安全性和稳定性 |
| 🟠 P1 - 高 | 8 | 性能和可维护性 |
| 🟡 P2 - 中 | 10 | 代码质量和开发效率 |
| 🟢 P3 - 低 | 7 | 优化和改进 |
| **总计** | **28** | - |

---

## 🔴 P0 - 紧急问题 (立即修复)

### 1. **TypeScript 严格模式被绕过**
- **位置**: [next.config.mjs](../../next.config.mjs#L10)
- **问题**: `typescript: { ignoreBuildErrors: true }`
- **影响**: 
  - 类型错误在构建时被忽略
  - 可能导致运行时错误
  - 降低代码质量和安全性
- **风险等级**: 🔴 高
- **建议修复**:
  ```javascript
  // next.config.mjs
  typescript: {
    ignoreBuildErrors: false,  // 改回 false
  },
  ```
  - 先修复所有现有类型错误
  - 启用严格的类型检查
  - 在 CI 中强制类型检查通过
- **工作量**: 2-3 天 (取决于错误数量)
- **关联**: [tsconfig.json](../../tsconfig.json) strict mode

---

### 2. **缺少正式的测试覆盖**
- **位置**: 项目范围
- **问题**: 
  - 0% 单元测试覆盖率
  - 无集成测试
  - 无 E2E 测试
  - 只有诊断脚本 (diagnose-*.js)
- **影响**:
  - 回归风险高
  - 重构困难
  - Bug 难以早期发现
  - 代码质量无法量化
- **风险等级**: 🔴 高
- **建议修复**:
  - 立即安装 Vitest + React Testing Library
  - 为核心模块编写测试 (utils, services, hooks)
  - 目标: 1 个月内达到 50% 覆盖率
  - 详见 [TESTING.md](./TESTING.md)
- **工作量**: 1-2 周 (初始设置 + 核心测试)
- **优先测试模块**:
  1. `lib/utils.ts` (简单, 快速见效)
  2. `lib/input-detector.ts` (重要, 逻辑清晰)
  3. `lib/doi-*.ts` (核心业务)
  4. `components/ui/button.tsx` (组件示例)

---

### 3. **API 安全层不完整**
- **位置**: [lib/api-security.ts](../../lib/api-security.ts)
- **潜在问题**:
  - 可能缺少 Rate Limiting
  - 输入验证可能不充分
  - CORS 配置可能过于宽松
  - 缺少请求签名或认证
- **影响**:
  - API 滥用风险
  - 注入攻击可能性
  - 数据泄露风险
- **风险等级**: 🔴 高
- **建议修复**:
  ```typescript
  // lib/api-security.ts 增强
  export class ApiSecurity {
    // 1. Rate Limiting
    private rateLimiter = new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 分钟
      max: 100, // 每 IP 最大请求数
    });
    
    // 2. Input Validation
    validateInput(input: unknown): ValidationResult {
      // 使用 Zod schema 验证
    }
    
    // 3. CORS Configuration
    corsOptions = {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };
    
    // 4. Request Authentication
    authenticateRequest(req: Request): boolean {
      // API Key or JWT validation
    }
  }
  ```
- **工作量**: 3-5 天
- **参考**: [.env.example](../../.env.example) 查看现有的安全配置

---

## 🟠 P1 - 高优先级问题

### 4. **性能瓶颈: 搜索服务**
- **位置**: [lib/search-service.ts](../../lib/search-service.ts)
- **问题**:
  - 可能串行调用多个数据源
  - 无结果缓存
  - 无请求去重
  - 超时处理可能不完善
- **影响**:
  - 搜索响应慢 (>3s)
  - 并发请求可能导致 API 限制
  - 用户体验差
- **风险等级**: 🟠 中高
- **建议优化**:
  ```typescript
  // 1. 并行请求
  const results = await Promise.allSettled([
    pubMedSearch(query),
    semanticScholarSearch(query),
    openAlexSearch(query),
  ]);
  
  // 2. 结果缓存 (Redis/Memory)
  const cacheKey = `search:${hashQuery(query)}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;
  
  // 3. 请求去重
  const dedupedResults = deduplicateResults(allResults);
  
  // 4. 超时控制
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 5000)
  );
  ```
- **工作量**: 2-3 天
- **预期提升**: 搜索速度提升 50-70%

---

### 5. **PDF 解析性能和可靠性**
- **位置**: [lib/pdf-parser.ts](../../lib/pdf-parser.ts)
- **问题**:
  - 大文件可能阻塞事件循环
  - 内存占用高
  - 错误恢复机制不足
  - 无进度反馈
- **影响**:
  - 上传大 PDF 时界面卡顿
  - 内存溢出风险
  - 解析失败无友好提示
- **风险等级**: 🟠 中高
- **建议优化**:
  - 使用 Web Worker 处理 (客户端)
  - 服务端流式处理
  - 添加文件大小限制 (如 50MB)
  - 实现解析进度回调
  - 添加更好的错误处理
- **工作量**: 3-4 天
- **参考**: [app/api/parse-pdf/route.ts](../../app/api/parse-pdf/route.ts)

---

### 6. **状态管理复杂度增长**
- **位置**: [lib/store.tsx](../../lib/store.tsx)
- **问题**:
  - 单一 Context 可能变得臃肿
  - 状态更新可能导致不必要的重渲染
  - 缺少状态持久化策略
  - 无时间旅行调试
- **影响**:
  - 应用变慢
  - 调试困难
  - 新功能添加困难
- **风险等级**: 🟠 中
- **建议优化**:
  ```typescript
  // 方案 1: 切片 Reducer
  const rootReducer = combineReducers({
    ui: uiReducer,
    conversations: conversationReducer,
    settings: settingsReducer,
    skills: skillReducer,
  });
  
  // 方案 2: 迁移到 Zustand (轻量级)
  // 方案 3: 使用 Jotai (原子化状态)
  ```
- **工作量**: 3-5 天 (重构)
- **当前可接受**: 如果应用不太复杂，暂不需要改动

---

### 7. **错误处理不一致**
- **位置**: 多个文件
- **问题**:
  - 错误格式不统一
  - 部分地方吞掉错误 (空 catch)
  - 用户看到的错误信息不友好
  - 缺少错误上报机制
- **示例**:
  ```typescript
  // ❌ 问题代码 (假设)
  try {
    await riskyOperation();
  } catch (e) {
    // 错误被忽略!
  }
  
  // ✅ 应该改为
  try {
    await riskyOperation();
  } catch (error) {
    logger.error('Operation failed', { error, context });
    throw new UserFriendlyError('操作失败，请稍后重试');
  }
  ```
- **影响**:
  - 调试困难
  - 用户体验差
  - 无法监控生产错误
- **风险等级**: 🟠 中
- **建议修复**:
  - 创建统一的错误类 `AppError`
  - 实现全局错误处理器
  - 集成 Sentry 或类似服务
  - 统一错误响应格式
- **工作量**: 2-3 天

---

### 8. **内存泄漏风险**
- **位置**: React 组件, Event Listeners, Timers
- **潜在问题**:
  - useEffect 清理不完整
  - 定时器未清除
  - 事件监听器未移除
  - 闭包引用大对象
- **影响**:
  - 长时间使用后应用变慢
  - 浏览器崩溃
  - 移动设备电池消耗快
- **风险等级**: 🟠 中
- **建议检查**:
  ```typescript
  // ✅ 正确的 useEffect 清理
  useEffect(() => {
    const interval = setInterval(() => {
      // polling logic
    }, 5000);
    
    const handleResize = () => {
      // resize logic
    };
    window.addEventListener('resize', handleResize);
    
    // 清理函数
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  ```
- **工具**: React DevTools Profiler, Chrome Memory tab
- **工作量**: 1-2 天 (审查和修复)

---

### 9. **代码重复和 DRY 违反**
- **位置**: 多处
- **已识别的重复**:
  - API 调用模式重复 (lib/api.ts vs 各 service 文件)
  - 错误处理代码重复
  - 类型定义可能重复
  - UI 组件中的相似逻辑
- **影响**:
  - 维护成本高
  - Bug 修复需要多处修改
  - 代码库膨胀
- **风险等级**: 🟠 中
- **建议优化**:
  - 提取公共的 API 调用包装器
  - 创建统一的错误处理高阶组件/Hook
  - 集中管理类型定义
  - 使用自定义 Hooks 封装重复逻辑
- **工作量**: 2-3 天

---

### 10. **缺少日志和监控**
- **位置**: [lib/logger.ts](../../lib/logger.ts) (可能不完善)
- **问题**:
  - 结构化日志可能缺失
  - 无性能指标收集
  - 无用户行为跟踪
  - 无异常报警
- **影响**:
  - 生产问题难以定位
  - 无法了解用户使用情况
  - 性能退化不可见
- **风险等级**: 🟠 中
- **建议增强**:
  ```typescript
  // 增强的 Logger
  class StructuredLogger {
    info(message: string, meta?: object) {
      console.log(JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        message,
        meta,
        // 添加 request_id, user_id 等
      }));
    }
    
    // 性能计时
    time(label: string) {
      const start = Date.now();
      return {
        end: () => {
          const duration = Date.now() - start;
          this.info(`${label} completed`, { duration });
        },
      };
    }
  }
  ```
- **集成方案**:
  - **开发环境**: Console + DevTools
  - **生产环境**: Datadog/Sentry/LogRocket
- **工作量**: 2-3 天

---

### 11. **依赖过时风险**
- **位置**: [package.json](../../package.json)
- **需要关注的依赖**:
  - **pdf-parse**: 维护状态不明
  - **cheerio**: 版本可能有安全漏洞
  - 部分 Radix UI 组件: 版本碎片化
- **影响**:
  - 安全漏洞
  - 兼容性问题
  - 错失新功能和性能改进
- **风险等级**: 🟠 低中
- **建议操作**:
  ```bash
  # 检查过期依赖
  npm outdated
  
  # 审计安全漏洞
  npm audit
  
  # 自动修复 (谨慎使用)
  npm audit fix
  ```
- **定期任务**: 每月审查一次
- **工作量**: 1 天 (审计和升级)

---

## 🟡 P2 - 中优先级问题

### 12. **组件粒度和职责**
- **位置**: [components/](../components/)
- **问题**:
  - 部分组件过大 (>300 行)
  - 组件职责可能不单一
  - Props drilling 过深
- **示例**: workspace.tsx, center-panel.tsx 可能较复杂
- **建议**:
  - 拆分为更小的子组件
  - 使用 Compound Component 模式
  - 考虑使用 Context 减少 props 传递
- **工作量**: 3-5 天 (渐进式重构)

---

### 13. **Accessibility (a11y) 缺陷**
- **位置**: UI 组件
- **潜在问题**:
  - 可能缺少 ARIA labels
  - 键盘导航可能不完整
  - 颜色对比度可能不足
  - 屏幕阅读器支持未知
- **建议**:
  - 运行 axe-core 自动化测试
  - 手动键盘导航测试
  - 使用 WAVE 工具审查
  - 添加 aria-label 和 role 属性
- **工具**: @axe-core/react, eslint-plugin-jsx-a11y
- **工作量**: 2-3 天

---

### 14. **国际化 (i18n) 未考虑**
- **位置**: 项目范围
- **问题**:
  - 硬编码的中英文字符串
  - 日期/数字格式未本地化
  - RTL 布局不支持
- **影响**: 无法支持多语言用户
- **建议**: 如果需要国际化的未来版本
  - 使用 react-intl 或 next-intl
  - 提取所有字符串到 locale 文件
- **优先级**: 仅当有国际化需求时
- **工作量**: 5-7 天

---

### 15. **Bundle Size 优化空间**
- **位置**: 构建产物
- **问题**:
  - 可能导入未使用的代码
  - 未使用代码分割
  - 图片未优化
  - 字体加载策略不佳
- **建议**:
  ```javascript
  // next.config.mjs 优化
  const nextConfig = {
    images: {
      formats: ['image/avif', 'image/webp'],
    },
    experimental: {
      optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },
  };
  ```
- **工具**: webpack-bundle-analyzer, Lighthouse
- **预期收益**: 首屏加载减少 20-40%
- **工作量**: 2-3 天

---

### 16. **SEO 和 Meta 标签不完善**
- **位置**: [app/layout.tsx](../../app/layout.tsx)
- **问题**:
  - 可能缺少动态 Meta 标签
  - Open Graph 标签可能缺失
  - 结构化数据 (JSON-LD) 未实现
- **影响**: 社交分享效果差, SEO 排名低
- **建议**:
  ```typescript
  // app/layout.tsx 或 metadata.ts
  export const metadata: Metadata = {
    title: {
      default: 'NIH-Skill BME Research Accelerator',
      template: '%s | NIH-Skill',
    },
    description: 'AI-powered biomedical engineering research assistant',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://your-domain.com',
      siteName: 'NIH-Skill',
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
  ```
- **工作量**: 1 天

---

### 17-21. **其他中等优先级问题**

#### 17. **环境变量管理混乱**
- **问题**: .env.example 可能不完整
- **建议**: 使用 zod 验证环境变量
- **工作量**: 半天

#### 18. **Git 分支策略未定义**
- **问题**: 无 CONTRIBUTING.md 或分支规范
- **建议**: 采用 Git Flow 或 GitHub Flow
- **工作量**: 1 天 (文档)

#### 19. **README 不完整**
- **问题**: README 可能缺少安装和使用说明
- **建议**: 补充详细的 Getting Started 指南
- **工作量**: 1 天

#### 20. **缺少贡献指南**
- **问题**: 新开发者上手困难
- **建议**: 添加 ARCHITECTURE.md, DEVELOPMENT.md
- **工作量**: 1-2 天 (部分已完成 ✓)

#### 21. **性能基准未建立**
- **问题**: 无 Lighthouse/性能预算
- **建议**: 建立 Core Web Vitals 目标
- **工作量**: 半天

---

## 🟢 P3 - 低优先级改进

### 22-28. **优化和建议**

#### 22. **添加 Loading States**
- 改善 UX 的骨架屏和加载动画
- **工作量**: 1-2 天

#### 23. **离线支持增强**
- Service Worker 策略优化
- **工作量**: 2-3 天

#### 24. **Dark Mode 完善**
- 确保所有组件支持暗色主题
- **工作量**: 1-2 天

#### 25. **动画和过渡效果**
- 添加微交互提升体验
- **工作量**: 2-3 天

#### 26. **快捷键支持**
- Power user 的键盘快捷键
- **工作量**: 2-3 天

#### 27. **PWA 功能完善**
- Install prompt, offline indicator
- **工作量**: 1-2 天

#### 28. **文档网站**
- Storybook 或类似工具展示组件
- **工作量**: 3-5 天

---

## 📈 技术债务趋势图

```
技术债务总量
    ↑
 28 |█████████████████████████ ← 现在
    |
 20 |████████████████████
    |
 10 |██████████
    |
  0 +--|--|--|--|--|--|--|--→ 时间
      现在  1月  2月  3月  6月  1年
    
目标趋势:
- 1个月内: 解决所有 P0 (→ 25)
- 3个月内: 解决 P0 + P1 (→ 17)
- 6个月内: 解决 P0-P2 (→ 7)
- 持续: 保持 P3 在可控范围
```

---

## 🎯 推荐的行动计划

### 立即行动 (本周)
1. ✅ **修复 TypeScript 严格模式** - 重新启用类型检查
2. ✅ **开始测试基础设施** - 安装 Vitest, 写前几个测试
3. ✅ **安全审查** - 检查 API 安全层

### 短期目标 (本月)
1. 📊 **达到 50% 测试覆盖率** - 核心模块全覆盖
2. 🔒 **安全加固** - Rate limiting, 输入验证, CORS
3. ⚡ **性能优化** - 搜索并行化, 缓存层
4. 🧹 **代码清理** - 去除重复, 统一错误处理

### 中期目标 (下季度)
1. 📈 **70%+ 测试覆盖率** - 包括集成测试
2. 🚀 **性能基线** - Core Web Vitals 达标
3. 📝 **文档完善** - 开发者文档, API 文档
4. 🛡️ **监控体系** - 错误追踪, 性能监控

### 长期目标 (明年)
1. 🔄 **架构升级** - 如需要, 考虑微服务拆分
2. 🌍 **国际化** - 支持多语言
3. ♿ **无障碍** - WCAG 2.1 AA 合规
4. 📚 **知识库** - 完整的设计系统和文档

---

## 📊 投资回报分析

### 修复技术债务的收益

| 投资 | 收益 | ROI |
|------|------|-----|
| 测试基础设施 (2周) | 减少 80% 回归 bug | 🔥 高 |
| 安全加固 (1周) | 避免数据泄露损失 | 🔥 高 |
| 性能优化 (1周) | 提升 50% 用户体验 | ⭐⭐⭐ 高 |
| 代码重构 (2周) | 提升 30% 开发效率 | ⭐⭐ 中 |
| 文档完善 (1周) | 缩短 50% 新人上手时间 | ⭐⭐ 中 |

### 不修复的风险

| 风险 | 概率 | 影响 | 预估损失 |
|------|------|------|----------|
| 安全漏洞被利用 | 中 | 高 | $50K-$500K |
| 重大回归 Bug | 高 | 中 | $10K-$50K |
| 性能导致用户流失 | 中 | 中 | $20K-$100K |
| 开发效率下降 | 高 | 低 | $5K-$20K/月 |

---

## ✅ 总结

### 核心发现

1. **✅ 优点**:
   - 现代技术栈 (Next.js 16, React 19)
   - 良好的组件库 (Radix UI + shadcn/ui)
   - 清晰的目录结构
   - TypeScript 严格模式 (大部分)
   - Docker 支持

2. **⚠️ 需要关注**:
   - **测试覆盖率为零** - 最高优先级
   - **TypeScript 检查被禁用** - 需要修复
   - **安全性需要加强** - API 保护层
   - **性能有优化空间** - 特别是搜索和 PDF

3. **💡 建议**:
   - 立即着手测试基础设施建设
   - 逐步解决 P0 和 P1 问题
   - 建立定期的代码审查和重构实践
   - 设置技术债务追踪仪表板

### 下一步行动

👉 **推荐从这里开始**:
1. 阅读 [TESTING.md](./TESTING.md) - 设置测试环境
2. 修复 [next.config.mjs](../../next.config.mjs) - 启用类型检查
3. 审查 [lib/api-security.ts](../../lib/api-security.ts) - 加强安全性

---

**文档生成工具**: GSD Codebase Mapper v1.0  
**下次更新建议**: 重大功能发布后或每季度复审
