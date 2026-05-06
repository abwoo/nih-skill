# TESTING.md - 测试策略与现状

**项目名称**: NIH-Skill BME Research Accelerator
**版本**: 1.0.0
**生成时间**: 2026-05-06

---

## 📊 当前测试现状

### ⚠️ 测试覆盖率: **待完善**

经过全面扫描，**当前项目缺少正式的单元测试文件**：

- ❌ 未找到 `*.test.ts` 文件
- ❌ 未找到 `*.test.tsx` 文件
- ❌ 未找到 `*.spec.ts` 文件
- ❌ 未找到 Jest/Vitest 配置文件

### ✅ 现有的测试基础设施

#### 1. 测试提示词文件
- **位置**: [test-prompts.json](../../test-prompts.json)
- **用途**: 组合式测试框架，支持 1000+ 迭代测试
- **状态**: 配置存在，但未见实际测试执行

#### 2. 诊断脚本
- **[diagnose-api.js](../../diagnose-api.js)**: API 健康诊断
  - 检查 API 端点可达性
  - 验证基本功能正常
  
- **[diagnose-memory.js](../../diagnose-memory.js)**: 内存和状态诊断
  - 检查本地存储
  - 验证状态持久化

#### 3. 环境检查
- **[check-env.js](../../check-env.js)**: 环境变量验证
  - 检查必需的环境变量
  - 验证 API 密钥配置

#### 4. 手动测试命令
```bash
npm run health  # curl -s http://localhost:3000/api/health | jq
```

---

## 🎯 建议的测试策略

### 测试金字塔

```
        /\
       /  \        E2E Tests (少量)
      /____\       
     /      \     
    / Integration \  (适中)
   /____________\   
  /                \
 /    Unit Tests    \  (大量)
/____________________\
```

### 1. 单元测试 (Unit Tests) - **优先级: P0**

**目标**: 测试独立的函数、组件、Hooks

#### 推荐工具
- **Vitest** (推荐): 快速、现代、与 Vite 生态集成
  - 优势: 比 Jest 快 2-10x
  - ESM 原生支持
  - 与 TypeScript 无缝集成

- **Jest** (备选): 成熟稳定、社区庞大
  - 优势: 丰富的生态系统
  - React Testing Library 完美支持

#### 需要测试的核心模块

##### **lib/ 工具函数** (最容易开始)
```typescript
// lib/utils.ts
describe('cn() utility', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });
  
  it('should handle conditional classes', () => {
    expect(cn('base', isActive && 'active')).toBe('base active');
  });
});
```

##### **lib/ 服务层**
```typescript
// lib/input-detector.ts
describe('InputDetector', () => {
  describe('detectDOIs()', () => {
    it('should detect valid DOIs in text', () => {
      const text = 'See https://doi.org/10.1234/example for details';
      const dois = detectDOIs(text);
      expect(dois).toContain('10.1234/example');
    });
  });
});

// lib/doi-resolver.ts
describe('DOI Resolver', () => {
  it('should resolve DOI to URL', async () => {
    const url = await resolveDOI('10.1234/example');
    expect(url).toContain('doi.org');
  });
});
```

##### **Hooks**
```typescript
// hooks/use-mobile.ts
describe('useMobile', () => {
  it('should return true on mobile viewport', () => {
    // Mock window.innerWidth
    const { result } = renderHook(() => useMobile());
    expect(result.current).toBe(true/false);
  });
});
```

##### **UI 组件**
```typescript
// components/ui/Button.test.tsx
describe('Button', () => {
  it('should render with default variant', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  
  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. 集成测试 (Integration Tests) - **优先级: P1**

**目标**: 测试模块间的交互

#### 需要测试的场景

##### **API 路由测试**
```typescript
// __tests__/api/health.test.ts
describe('GET /api/health', () => {
  it('should return healthy status', async () => {
    const response = await GET(request);
    const data = await response.json();
    expect(data.status).toBe('ok');
  });
});

// __tests__/api/search.test.ts
describe('POST /api/search', () => {
  it('should search papers with query', async () => {
    const request = new Request('http://localhost:3000/api/search', {
      method: 'POST',
      body: JSON.stringify({ query: 'CRISPR gene editing' }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(data.results).toBeDefined();
    expect(Array.isArray(data.results)).toBe(true);
  });
});
```

##### **服务层集成测试**
```typescript
// __tests__/services/search-service.test.ts
describe('SearchService', () => {
  it('should aggregate results from multiple sources', async () => {
    const results = await searchPapers('machine learning healthcare');
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('title');
    expect(results[0]).toHaveProperty('authors');
  });
});
```

##### **技能系统测试**
```typescript
// __tests__/skills/skill-engine.test.ts
describe('SkillEngine', () => {
  it('should register and discover skills', () => {
    const engine = new SkillEngine();
    engine.registerSkill(testSkill);
    
    const skills = engine.discoverSkills('pdf processing');
    expect(skills).toContain(testSkill);
  });
  
  it('should execute skill with context', async () => {
    const result = await engine.executeSkill('parse-pdf', { filePath: '/tmp/test.pdf' });
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('text');
  });
});
```

### 3. E2E 测试 (End-to-End Tests) - **优先级: P2**

**目标**: 测试完整用户流程

#### 推荐工具
- **Playwright**: 现代、快速、多浏览器支持
- **Cypress**: 成熟、优秀的调试体验

#### 关键用户流程

##### **核心功能流程**
```typescript
// e2e/search-flow.spec.ts
test('complete paper search workflow', async ({ page }) => {
  // 1. 打开应用
  await page.goto('/');
  
  // 2. 输入搜索查询
  await page.fill('[data-testid="search-input"]', 'CRISPR gene editing');
  await page.click('[data-testid="search-button"]');
  
  // 3. 等待结果加载
  await page.waitForSelector('[data-testid="result-item"]');
  
  // 4. 点击结果查看详情
  await page.click('[data-testid="result-item"]:first-child');
  
  // 5. 验证详情页加载
  await page.expect(page.locator('[data-testid="paper-detail"]')).toBeVisible();
});
```

##### **PDF 上传流程**
```typescript
// e2e/pdf-upload.spec.ts
test('upload and parse PDF', async ({ page }) => {
  // 1. 上传文件
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.click('[data-testid="upload-button"]');
  const fileChooser = await fileChooserPromise;
  
  await fileChooser.setFiles('test-fixtures/sample.pdf');
  
  // 2. 等待解析完成
  await page.waitForSelector('[data-testid="parsed-content"]');
  
  // 3. 验证内容
  await expect(page.locator('[data-testid="parsed-text"]')).toContainText('Abstract');
});
```

##### **AI 对话流程**
```typescript
// e2e/chat-flow.spec.ts
test('chat with AI assistant', async ({ page }) => {
  // 1. 发送消息
  await page.fill('[data-testid="chat-input"]', 'Explain this paper');
  await page.click('[data-testid="send-button"]');
  
  // 2. 等待 AI 响应
  await page.waitForSelector('[data-testid="ai-response"]');
  
  // 3. 验证响应
  await expect(page.locator('[data-testid="ai-response"]')).not.toBeEmpty();
});
```

---

## 🛠️ 推荐的技术栈和配置

### 方案 A: Vitest + React Testing Library (推荐)

#### 安装
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

#### 配置文件
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.next/', '*.config.*'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

#### Setup 文件
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

#### package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test"
  }
}
```

### 方案 B: Jest + React Testing Library (备选)

#### 安装
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom ts-jest @types/jest
```

#### 配置
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
```

---

## 📋 测试实施计划

### Phase 1: 基础设施搭建 (1-2 天)
- [ ] 安装测试框架 (Vitest/Jest)
- [ ] 配置测试环境
- [ ] 创建 setup 和 mock 文件
- [ ] 添加测试脚本到 package.json

### Phase 2: 核心单元测试 (3-5 天)
- [ ] lib/utils.ts 工具函数测试
- [ ] lib/input-detector.ts 输入检测测试
- [ ] lib/doi-*.ts DOI 服务测试
- [ ] hooks/use-mobile.ts, use-toast.ts 测试
- [ ] components/ui/ 核心组件测试 (Button, Input, Dialog)

**目标覆盖率**: 60-70%

### Phase 3: 服务层测试 (3-5 天)
- [ ] lib/api.ts API 客户端测试
- [ ] lib/search-service.ts 搜索服务测试
- [ ] lib/pdf-parser.ts PDF 解析测试
- [ ] lib/citations-service.ts 引用服务测试
- [ ] lib/skill-engine.ts 技能引擎测试

**目标覆盖率**: 70-80%

### Phase 4: API 路由测试 (2-3 天)
- [ ] /api/health 健康检查测试
- [ ] /api/search 搜索接口测试
- [ ] /api/parse-pdf PDF 解析接口测试
- [ ] /api/chat 聊天接口测试
- [ ] 错误处理和边界情况测试

### Phase 5: 集成测试 (3-5 天)
- [ ] 完整搜索流程测试
- [ ] PDF 上传和解析流程测试
- [ ] AI 对话流程测试
- [ ] 技能执行流程测试

### Phase 6: E2E 测试 (可选, 5-7 天)
- [ ] 安装 Playwright/Cypress
- [ ] 编写关键用户流程测试
- [ ] 配置 CI/CD 集成

---

## 📈 测试指标和目标

### 覆盖率目标

| 模块 | 当前 | 目标 | 优先级 |
|------|------|------|--------|
| lib/utils.ts | 0% | >90% | P0 |
| lib/services | 0% | >80% | P0 |
| hooks/ | 0% | >85% | P0 |
| components/ui/ | 0% | >75% | P1 |
| app/api/ | 0% | >70% | P1 |
| components/business/ | 0% | >60% | P2 |
| **总体** | **0%** | **>70%** | - |

### CI/CD 集成建议

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
```

---

## 🧪 测试最佳实践

### 1. 测试命名规范
```typescript
describe('ComponentName', () => {
  describe('methodName()', () => {
    it('should do X when Y', () => { ... });
    it('should throw error when Z', () => { ... });
  });
});
```

### 2. AAA 模式 (Arrange-Act-Assert)
```typescript
it('should calculate total price', () => {
  // Arrange - 准备测试数据
  const cart = new Cart();
  cart.addItem(item, 2);
  
  // Act - 执行操作
  const total = cart.calculateTotal();
  
  // Assert - 验证结果
  expect(total).toBe(29.98);
});
```

### 3. 测试独立性
- 每个测试应该独立运行
- 不依赖其他测试的执行顺序
- 使用 beforeEach/afterEach 清理状态

### 4. Mock 外部依赖
```typescript
// Mock API 调用
jest.mock('@/lib/api', () => ({
  fetchPapers: jest.fn().mockResolvedValue(mockPapers),
}));

// Mock 文件系统
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue('file content'),
}));
```

### 5. 测试用户行为而非实现细节
```typescript
// ✅ 好: 测试用户可见的行为
it('should display error message when API fails', () => {
  // ...
  expect(screen.getByText('Failed to load')).toBeVisible();
});

// ❌ 差: 测试内部实现
it('should set error state to true', () => {
  // ...
  expect(component.state('hasError')).toBe(true);  // implementation detail
});
```

---

## 🚀 快速开始: 第一个测试

### 创建测试文件
```typescript
// lib/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should filter falsy values', () => {
    expect(cn('foo', false && 'bar', null, undefined)).toBe('foo');
  });

  it('should merge tailwind classes properly', () => {
    expect(cn('px-4 py-2', 'bg-blue-500')).toBe('px-4 py-2 bg-blue-500');
  });
});
```

### 运行测试
```bash
# 安装 Vitest (如果还没安装)
npm install -D vitest

# 运行测试
npx vitest

# 运行特定文件
npx vitest run lib/utils.test.ts

# 查看覆盖率
npx vitest --coverage
```

---

## 📚 学习资源

### 官方文档
- [Vitest Guide](https://vitest.dev/guide/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Documentation](https://playwright.dev/)

### 最佳实践
- [Kent C. Dodds - Testing Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing JavaScript Book](https://testingjavascript.com/)

### 项目特定
- 查看 `test-prompts.json` 了解测试场景设计思路
- 参考 `diagnose-api.js` 了解如何验证 API 行为

---

## ✅ 总结和行动项

### 立即行动 (本周)
1. **选择测试框架**: 推荐 Vitest (更快更现代)
2. **安装和配置**: 按照上述配置设置环境
3. **编写第一个测试**: 从 `lib/utils.ts` 开始

### 短期目标 (本月)
1. **核心模块覆盖**: utils, input-detector, doi services
2. **组件测试**: 至少 10 个核心 UI 组件
3. **CI 集成**: GitHub Actions 自动运行测试

### 中期目标 (下季度)
1. **70%+ 代码覆盖率**
2. **E2E 测试覆盖主要流程**
3. **性能测试和负载测试**

### 长期目标
1. **测试驱动开发 (TDD)**: 新功能先写测试
2. **契约测试**: 确保 API 兼容性
3. **视觉回归测试**: UI 一致性保证
