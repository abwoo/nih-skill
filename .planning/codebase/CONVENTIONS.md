# CONVENTIONS.md - 代码规范与约定

**项目名称**: NIH-Skill BME Research Accelerator
**版本**: 1.0.0
**生成时间**: 2026-05-06

---

## 📋 代码风格规范

### 缩进和空格
- **缩进**: 2 空格 (Space)
- **制表符**: 不使用 Tab (useTabs: false)
- **行宽**: 100 字符 (printWidth: 100)

**配置来源**: [.prettierrc](../../.prettierrc)
```json
{
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100
}
```

### 引号和分号
- **字符串引号**: 单引号 (singleQuote: true)
- **分号**: 必须使用 (semi: true)
- **尾随逗号**: ES5 风格 (trailingComma: "es5")

**示例**:
```typescript
// ✅ 正确
const message = 'Hello, World!';
import { useState } from 'react';

// ❌ 错误
const message = "Hello, World!"  // 应该用单引号
import { useState } from 'react'   // 缺少分号
```

### 括号和间距
- **对象括号**: 括号内加空格 (bracketSpacing: true)
- **箭头函数括号**: 始终使用括号 (arrowParens: "always")
- **行尾换行符**: LF (endOfLine: "lf")

**示例**:
```typescript
// ✅ 正确
const obj = { name: 'test' };
const add = (a: number, b: number): number => a + b;

// ❌ 错误
const obj = {name: 'test'};  // 缺少空格
const add = (a: number, b: number): number => a + b;  // 可以但不够清晰
```

---

## 📘 TypeScript 规范

### 严格模式
项目启用了 TypeScript 严格模式:

**配置来源**: [tsconfig.json](../../tsconfig.json)
```json
{
  "strict": true,
  "noEmit": true,
  "skipLibCheck": true
}
```

### 类型使用原则

#### 1. **优先使用接口 (Interface)**
```typescript
// ✅ 推荐: Interface 用于对象形状
interface User {
  id: string;
  name: string;
  email: string;
}

// ⚠️ 可接受: Type Alias 用于联合类型
type ID = string | number;
type Status = 'pending' | 'success' | 'error';
```

#### 2. **避免使用 any**
```typescript
// ✅ 正确: 使用具体类型
const data: SearchResult[] = [];

// ⚠️ 警告: 允许但有警告 (@typescript-eslint/no-explicit-any: warn)
const data: any[] = [];  // ESLint 会警告

// ❌ 错误: 避免滥用 any
function process(data: any): any { ... }
```

#### 3. **明确的返回类型**
```typescript
// ✅ 推荐: 显式声明返回类型
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// ⚠️ 可接受: 简单函数可以推断
const add = (a: number, b: number): number => a + b;
```

#### 4. **泛型的正确使用**
```typescript
// ✅ 推荐: 有意义的泛型约束
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// ✅ 推荐: 泛型约束
function getProperty<T extends object, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

### 导入/导出规范

#### 1. **导入顺序**
```typescript
// 1. React 和 Next.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. 第三方库
import { clsx } from 'clsx';
import { toast } from 'sonner';

// 3. 内部组件 (使用 @/ 别名)
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// 4. 服务和工具
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// 5. 类型导入 (如果需要)
import type { User, ApiResponse } from '@/lib/types';
```

#### 2. **命名导出优先**
```typescript
// ✅ 推荐: Named exports
export interface User { ... }
export function createUser() { ... }
export const DEFAULT_CONFIG = {};

// ❌ 避免: Default export (除非是组件)
export default function App() { ... }  // 组件可以
```

#### 3. **类型导入**
```typescript
// ✅ TypeScript 5.0+: 使用 import type
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

// ⚠️ 旧方式: 也有效
import { type ReactNode } from 'react';
```

---

## 🧩 React 组件编写约定

### 函数组件
- **所有组件必须是函数组件** (Function Components)
- **使用箭头函数** 或 **函数声明**
- **使用 TypeScript 泛型** 进行类型标注

#### 组件结构模板
```typescript
'use client';  // 如果需要客户端交互

import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  // prop 定义
  className?: string;
  children?: React.ReactNode;
}

export function ComponentName({ className, children }: ComponentProps) {
  // 状态定义
  const [state, setState] = useState<string>('');

  // 副作用
  useEffect(() => {
    // effect logic
  }, []);

  // 事件处理器
  const handleClick = () => {
    // handler logic
  };

  // 渲染
  return (
    <div className={cn('base-class', className)}>
      {children}
    </div>
  );
}
```

### Props 命名
- **布尔值 props**: 使用 `is`, `has`, `should`, `can`, `did` 前缀
- **回调函数**: 使用 `on` 前缀 (onClick, onChange, onSubmit)
- **children**: 始终作为最后一个 prop

**示例**:
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;  // ✅ 布尔值用 is
  disabled?: boolean;
  onClick?: () => void;  // ✅ 回调用 on
  children?: React.ReactNode;
}
```

### Hooks 使用规则
1. **只在顶层调用 Hooks** (不在循环、条件、嵌套函数中)
2. **只在 React 函数组件或自定义 Hooks 中调用**
3. **自定义 Hooks 以 `use` 开头**

**自定义 Hook 模板**:
```typescript
export function useCustomHook<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  const updateValue = (newValue: T) => {
    setValue(newValue);
  };

  return { value, updateValue };
}
```

### 状态管理
- **局部状态**: useState / useReducer
- **全局状态**: Context + useReducer (通过 store.tsx)
- **服务端状态**: 未来可考虑 React Query / SWR

---

## 📝 命名规范

### 文件和文件夹命名
- **组件文件**: PascalCase (例: `UserProfile.tsx`)
- **工具文件**: kebab-case (例: `api-client.ts`)
- **页面文件**: 固定名称 (例: `page.tsx`, `layout.tsx`)
- **文件夹**: kebab-case 或 camelCase

### 变量和函数命名
- **变量/常量**: camelCase
  ```typescript
  const userName = 'John';
  const MAX_RETRY_COUNT = 3;
  ```

- **函数**: camelCase, 动词开头
  ```typescript
  function fetchData() { ... }
  function handleSubmit() { ... }
  function isValidEmail(email: string): boolean { ... }
  ```

- **类/接口/类型**: PascalCase
  ```typescript
  class UserService { ... }
  interface ApiResponse<T> { ... }
  type Status = 'active' | 'inactive';
  ```

- **常量**: UPPER_SNAKE_CASE
  ```typescript
  const API_BASE_URL = 'https://api.example.com';
  const MAX_ITEMS_PER_PAGE = 20;
  ```

- **枚举值**: PascalCase
  ```typescript
  enum UserRole {
    Admin = 'ADMIN',
    User = 'USER',
    Guest = 'GUEST',
  }
  ```

### CSS 类名命名
- **使用 Tailwind CSS 工具类**
- **自定义类**: kebab-case
- **状态类**: 使用前缀 (is-, has-)

**示例**:
```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm is-active has-error">
  {/* content */}
</div>
```

---

## 🔧 错误处理模式

### 同步错误处理
```typescript
try {
  const result = riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: error.message };
}
```

### 异步错误处理
```typescript
async function asyncOperation(): Promise<ApiResponse<Data>> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Async operation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### React 错误边界
```typescript
// 已实现在 components/error-boundary.tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <RiskyComponent />
</ErrorBoundary>
```

### API 错误处理
```typescript
// lib/api.ts 中的模式
try {
  const response = await fetchWithTimeout(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || 'Request failed');
  }
  
  return await response.json();
} catch (error) {
  if (error instanceof TypeError) {
    throw new NetworkError('Network connection failed');
  }
  throw error;
}
```

---

## 📦 代码组织规范

### 文件结构顺序
```typescript
// 1. 导入语句 (按顺序)
import React from 'react';

// 2. 类型定义
interface Props { ... }
type State = { ... };

// 3. 常量定义
const CONSTANT_VALUE = '...';

// 4. 组件/函数定义
export function Component() { ... }

// 5. 默认导出 (如果是组件)
export default Component;
```

### 注释规范
- **JSDoc**: 用于公开 API
- **行内注释**: 解释复杂逻辑
- **TODO/FIXME**: 标记待办事项

**示例**:
```typescript
/**
 * Fetches user data from the API
 * @param id - User ID
 * @returns Promise<User> User object
 * @throws {ApiError} When request fails
 */
async function fetchUser(id: string): Promise<User> {
  // TODO: Add caching layer
  const response = await fetch(`/api/users/${id}`);
  // FIXME: Handle rate limiting
  return response.json();
}
```

---

## ✅ ESLint 规则重点

**配置来源**: [.eslintrc.json](../../.eslintrc.json)

### 强制规则 (Error)
- **prefer-const**: 必须使用 const (不能 let)
- **no-var**: 禁止使用 var
- **@typescript-eslint/no-unused-vars**: 未使用变量 (warn, 允许 _ 前缀)

### 警告规则 (Warn)
- **no-console**: console.log 警告 (允许 console.warn/error)
- **@typescript-eslint/no-explicit-any**: any 类型警告

### 忽略的目录
- `.next/`
- `node_modules/`
- `out/`
- `openclaw-temp/`
- `darwin-skill-temp/`

---

## 🎨 UI 组件编写约定 (shadcn/ui 风格)

### 组件变体模式
```typescript
// 使用 class-variance-authority (CVA)
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // 基础样式
  'inline-flex items-center justify-center rounded-md text-sm font-medium...',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground...',
        outline: 'border border-input bg-background...',
        // ...更多变体
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
```

### 组合组件模式
```typescript
// Dialog 示例
const Dialog = DialogRoot;
Dialog.Trigger = DialogTrigger;
Dialog.Portal = DialogPortal;
Dialog.Overlay = DialogOverlay;
Dialog.Content = DialogContent;
Dialog.Header = DialogHeader;
Dialog.Footer = DialogFooter;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
Dialog.Close = DialogClose;

export { Dialog };
```

---

## 🔄 Git 提交规范 (建议)

虽然项目中未强制使用 commitlint，但建议遵循 Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具变更

**示例**:
```
feat(search): add multi-source aggregation for PubMed and Semantic Scholar

fix(api): handle timeout errors in fetch-paper service

docs(readme): update installation instructions for Windows
```

---

## 📚 学习资源和参考

### 官方文档
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

### 项目特定
- **UI 组件**: 参考 `/components/ui/` 中的现有组件
- **API 模式**: 参考 `lib/api.ts` 的封装方式
- **技能系统**: 参考 `lib/skill-*.ts` 的实现
- **状态管理**: 参考 `lib/store.tsx` 的 Context 模式

---

## ✨ 总结: 核心原则

1. **一致性**: 保持整个项目的代码风格统一
2. **可读性**: 代码应该自解释，配合必要的注释
3. **类型安全**: 充分利用 TypeScript 的类型系统
4. **可维护性**: 遵循 SOLID 原则，编写模块化代码
5. **性能意识**: 注意不必要的重渲染和内存泄漏
6. **用户体验**: 编写无障碍、响应式的 UI
