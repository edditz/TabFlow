# 深浅色主题功能实现文档

## 概述

TabFlow 支持三种主题模式：浅色、深色、跟随系统。用户可以在设置页面切换主题，搜索面板和设置页面都会实时响应主题变化。

## 涉及文件

| 文件 | 作用 |
|------|------|
| `src/content/index.tsx` | 读取主题设置，监听变化，传递给 SearchPanel |
| `src/content/components/SearchPanel.tsx` | 接收主题 prop，应用到组件 |
| `src/content/components/SearchPanel.css` | 定义搜索面板的主题 CSS 变量 |
| `src/options/App.tsx` | 设置页面：主题选择器 + 主题应用逻辑 |
| `src/options/App.css` | 定义设置页面的主题 CSS 变量 |

## 核心逻辑

### 1. 主题设置存储

主题设置存储在 `chrome.storage.sync`，值为 `'system' | 'light' | 'dark'`：

```typescript
interface Settings {
  theme: 'system' | 'light' | 'dark'
  // ...其他设置
}
```

### 2. 获取实际主题

当设置为 `system` 时，需要检测系统主题偏好：

```typescript
function getActualTheme(themeSetting: 'system' | 'light' | 'dark'): 'light' | 'dark' {
  if (themeSetting === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return themeSetting
}
```

### 3. CSS 主题变量

使用 CSS 变量定义颜色，通过 `[data-theme='dark']` 选择器切换：

```css
/* Light Theme (default) */
:root {
  --background: #ffffff;
  --foreground: #111827;
  --card: #ffffff;
  /* ... */
}

/* Dark Theme */
[data-theme='dark'] {
  --background: #0f0f11;
  --foreground: #e8e8ea;
  --card: #1a182e;
  /* ... */
}
```

### 4. 监听变化

需要监听两种变化：

#### 4.1 设置变化

```typescript
chrome.storage.onChanged.addListener((changes) => {
  if (changes.theme) {
    // 更新主题
  }
})
```

#### 4.2 系统主题变化

```typescript
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
mediaQuery.addEventListener('change', () => {
  if (currentTheme === 'system') {
    // 更新主题
  }
})
```

## 数据流

```
┌─────────────────────────────────────────────────────────────┐
│                    chrome.storage.sync                       │
│                   { theme: 'system' }                        │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   Content Script        │     │    Options Page         │
│   (index.tsx)           │     │    (App.tsx)            │
│                         │     │                         │
│  1. 读取设置            │     │  1. 读取设置            │
│  2. 监听设置变化        │     │  2. 监听设置变化        │
│  3. 监听系统主题变化    │     │  3. 监听系统主题变化    │
│  4. 计算实际主题        │     │  4. 计算实际主题        │
│  5. 传递给 SearchPanel  │     │  5. 应用到 document     │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   SearchPanel           │     │   document.documentElement
│   data-theme="dark"     │     │   data-theme="dark"     │
└─────────────────────────┘     └─────────────────────────┘
```

## 用户体验

1. 用户在设置页面选择主题
2. 设置立即保存到 `chrome.storage.sync`
3. 所有页面（搜索面板、设置页面）监听到变化
4. 计算实际主题值（`light` 或 `dark`）
5. 设置 `data-theme` 属性到 DOM
6. CSS 变量自动切换，界面更新
