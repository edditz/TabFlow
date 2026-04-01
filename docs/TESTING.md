# 浏览器扩展测试指南

## 概述

本文档介绍如何使用 Playwright 为 TabFlow 浏览器扩展编写和运行测试。

## 测试架构

由于浏览器扩展需要 `chrome.*` API（如 `chrome.storage`），而普通浏览器环境无法提供这些 API，我们采用了以下方案：

```
┌─────────────────────────────────────────────────────────────┐
│                    Playwright Test                          │
├─────────────────────────────────────────────────────────────┤
│  1. Vite Preview Server (localhost:4173)                    │
│  2. Chrome API Mock (注入到页面)                             │
│  3. 测试页面 UI 逻辑                                         │
└─────────────────────────────────────────────────────────────┘
```

### 核心组件

| 组件 | 说明 |
|------|------|
| **Vite Preview** | 提供本地 HTTP 服务器，服务构建后的文件 |
| **Chrome API Mock** | 模拟 `chrome.storage` 等扩展 API |
| **Playwright** | 浏览器自动化测试框架 |

## 目录结构

```
specs/
├── helpers/
│   └── chrome-mock.ts        # Chrome API Mock 实现
├── settings/
│   ├── page-load.spec.ts     # 页面加载测试
│   ├── theme-switch.spec.ts  # 主题切换测试
│   ├── language-switch.spec.ts # 语言切换测试
│   ├── toggle-settings.spec.ts # 开关设置测试
│   ├── select-settings.spec.ts # 下拉选择测试
│   └── persistence.spec.ts   # 设置持久化测试
├── seed.spec.ts              # 种子文件
└── settings-test-plan.md     # 测试计划文档

playwright.config.ts          # Playwright 配置
```

## 快速开始

### 安装依赖

```bash
# 安装 Playwright
npm install -D @playwright/test playwright

# 安装浏览器
npx playwright install chromium
```

### 运行测试

```bash
# 先构建扩展
npm run build

# 运行所有测试
npx playwright test

# 带界面运行（推荐调试时使用）
npx playwright test --ui

# 生成 HTML 报告
npx playwright test --reporter=html
npx playwright show-report
```

## Chrome API Mock

### 工作原理

在页面加载前注入 mock 脚本，模拟 Chrome 扩展 API：

```typescript
// specs/helpers/chrome-mock.ts
export const chromeMockScript = `
const mockStorage = {
  data: { /* 默认设置 */ },
  get: function(keys, callback) { /* ... */ },
  set: function(items, callback) { /* ... */ },
  // ...
};

window.chrome = {
  storage: { sync: mockStorage },
  runtime: { /* ... */ },
};
`
```

### 在测试中使用

```typescript
import { injectChromeMock } from '../helpers/chrome-mock'

test.beforeEach(async ({ page }) => {
  await injectChromeMock(page)  // 注入 mock
  await page.goto('/src/options/index.html')
  await page.waitForSelector('h1')
})
```

### Mock 的 API

| API | 支持程度 |
|-----|---------|
| `chrome.storage.sync.get()` | ✅ 完整支持 |
| `chrome.storage.sync.set()` | ✅ 完整支持 |
| `chrome.storage.onChanged` | ✅ 完整支持 |
| `chrome.runtime.getManifest()` | ✅ 基础支持 |

## 编写测试

### 基本模式

```typescript
import { test, expect } from '@playwright/test'
import { injectChromeMock } from '../helpers/chrome-mock'

test.describe('功能名称', () => {
  test.beforeEach(async ({ page }) => {
    await injectChromeMock(page)
    await page.goto('/src/options/index.html')
    await page.waitForSelector('h1')
  })

  test('测试用例描述', async ({ page }) => {
    // 定位元素
    const element = page.locator('.selector')

    // 操作
    await element.click()

    // 断言
    await expect(element).toHaveValue('expected')
  })
})
```

### 常用选择器

```typescript
// 过滤包含特定文本的元素
page.locator('.setting-item').filter({
  hasText: /Theme|主题/
})

// 定位 select 元素
page.locator('select')

// 定位开关按钮
page.locator('button[role="switch"]')

// 组合定位
page.locator('.setting-item').filter({ hasText: /Theme/ }).locator('select')
```

### 常用断言

```typescript
// 可见性
await expect(element).toBeVisible()

// 属性值
await expect(element).toHaveValue('value')
await expect(element).toHaveAttribute('aria-checked', 'true')

// 文本内容
await expect(element).toContainText('文本')

// 数量
await expect(elements).toHaveCount(3)

// CSS 类
await expect(element).toHaveClass(/active/)
```

## 配置说明

### playwright.config.ts

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './specs',
  workers: 1,  // 单线程，避免状态冲突
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { baseURL: 'http://localhost:4173' },
    },
  ],
  webServer: {
    command: 'npx vite preview --port 4173',
    url: 'http://localhost:4173/src/options/index.html',
    reuseExistingServer: !process.env.CI,
  },
})
```

## 测试计划

测试计划文档位于 `specs/settings-test-plan.md`，包含以下测试场景：

1. **页面加载和初始状态** - 验证页面正确加载和默认设置
2. **主题切换功能** - 浅色/深色/跟随系统
3. **语言切换功能** - 中文/英文
4. **开关设置功能** - 各开关的状态切换
5. **下拉选择功能** - URL 显示样式选择
6. **设置持久化** - 刷新后设置保持

## 注意事项

### Mock 的局限性

- Mock 无法模拟真实的扩展环境（如 Service Worker、Content Script）
- 对于需要真实扩展 ID 的场景，需要使用其他方案
- 复杂的扩展功能可能需要集成测试

### 最佳实践

1. **先构建再测试**：运行 `npm run build` 确保最新代码
2. **使用 UI 模式调试**：`npx playwright test --ui`
3. **查看 Trace**：失败时自动生成截图和 trace
4. **单线程运行**：避免并发导致的扩展状态冲突

## 相关资源

- [Playwright 官方文档](https://playwright.dev/)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)
- [项目测试计划](../specs/settings-test-plan.md)
