# 快捷键录入组件 (ShortcutRecorder)

用于让用户自定义设置快捷键的组件，支持点击录入、实时预览、冲突检测等功能。

## 文件结构

```
src/options/components/
├── ShortcutRecorder.tsx    # 单个快捷键录入组件
└── ShortcutSettings.tsx    # 快捷键设置面板组件
```

## ShortcutRecorder

单个快捷键录入组件，负责捕获用户按下的组合键。

### Props

```typescript
interface ShortcutRecorderProps {
  value: ShortcutKey | null      // 当前快捷键值
  onChange: (shortcut: ShortcutKey | null) => void  // 快捷键变化回调
  placeholder?: string           // 占位文本，默认 'Press shortcut keys...'
  disabled?: boolean             // 是否禁用
}
```

### ShortcutKey 类型

```typescript
interface ShortcutKey {
  key: string       // 按键名称，如 'a', 'Z', 'Space'
  ctrl?: boolean    // 是否包含 Ctrl
  alt?: boolean     // 是否包含 Alt
  shift?: boolean   // 是否包含 Shift
  meta?: boolean    // 是否包含 Meta (Mac: ⌘, Windows: Win)
}
```

### 使用示例

```tsx
import { ShortcutRecorder, ShortcutKey } from './components/ShortcutRecorder'

function MyComponent() {
  const [shortcut, setShortcut] = useState<ShortcutKey | null>(null)

  return (
    <ShortcutRecorder
      value={shortcut}
      onChange={setShortcut}
      placeholder="点击录入快捷键"
    />
  )
}
```

### 交互行为

| 操作 | 结果 |
|------|------|
| 点击组件 | 进入录制模式 |
| 按下有效组合键 | 保存快捷键，退出录制模式 |
| 按 Escape | 取消录入，恢复原值 |
| 点击其他地方 | 取消录入，恢复原值 |

### 校验规则

- **必须包含至少一个修饰键**：Ctrl / Alt / Shift / Meta
- 单独按下修饰键不会触发保存
- 单独按下普通按键会显示错误提示

### 导出的工具函数

```typescript
// 检查快捷键是否有效
function isValidShortcut(shortcut: ShortcutKey | null): boolean

// 格式化为显示文本 (Mac 显示符号)
function formatShortcut(shortcut: ShortcutKey | null): string
// 示例: { key: 'a', ctrl: true, meta: true } => '⌃ + ⌘ + A'

// 转换为 Chrome 扩展格式
function toChromeFormat(shortcut: ShortcutKey | null): string
// 示例: { key: 'a', ctrl: true, meta: true } => 'Ctrl+Command+A'

// 从 Chrome 格式解析
function fromChromeFormat(shortcut: string): ShortcutKey | null
// 示例: 'Ctrl+Shift+Z' => { key: 'Z', ctrl: true, shift: true }
```

---

## ShortcutSettings

快捷键设置面板组件，管理快捷键配置，支持冲突检测和恢复默认。

### Props

```typescript
interface ShortcutSettingsProps {
  shortcuts: ShortcutConfig[]    // 快捷键配置列表
  onChange: (shortcuts: ShortcutConfig[]) => void  // 变化回调
  labels: {                      // 国际化文本
    toggleSearchPanel: string
    toggleSearchPanelDesc: string
    clickToRecord: string
    recording: string
    resetToDefault: string
    shortcutConflict: string
  }
}

interface ShortcutConfig {
  id: string                     // 唯一标识
  shortcut: ShortcutKey | null   // 快捷键值
}
```

### 默认配置

```typescript
const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  {
    id: 'toggle-search-panel',
    shortcut: { key: 'a', ctrl: true, meta: true },  // ⌃+⌘+A
  },
]
```

### 使用示例

```tsx
import {
  ShortcutSettings,
  ShortcutConfig,
  DEFAULT_SHORTCUTS,
} from './components/ShortcutSettings'

function SettingsPage() {
  const [shortcuts, setShortcuts] = useState<ShortcutConfig[]>(DEFAULT_SHORTCUTS)

  const handleSave = () => {
    chrome.storage.sync.set({ shortcuts })
  }

  return (
    <ShortcutSettings
      shortcuts={shortcuts}
      onChange={setShortcuts}
      labels={{
        toggleSearchPanel: '切换搜索面板',
        toggleSearchPanelDesc: '打开/关闭全局标签页搜索面板',
        clickToRecord: '点击录入...',
        recording: '录入中...',
        resetToDefault: '恢复默认',
        shortcutConflict: '快捷键冲突',
      }}
    />
  )
}
```

### 功能特性

- **冲突检测**：自动检测多个快捷键是否相同，显示警告
- **恢复默认**：一键恢复到默认快捷键配置
- **国际化支持**：通过 `labels` 属性传入翻译文本

---

## 样式

组件样式定义在 `src/options/App.css` 中：

```css
/* Shortcut Recorder */
.shortcut-recorder { ... }
.shortcut-recorder.recording { ... }
.shortcut-recorder.error { ... }

/* Shortcut Settings */
.shortcut-settings { ... }
.shortcut-item { ... }
.shortcut-actions { ... }
```

---

## 数据持久化

快捷键配置存储在 `chrome.storage.sync`：

```typescript
interface StorageData {
  shortcuts: ShortcutConfig[]
}
```

### 读取配置

```typescript
chrome.storage.sync.get({ shortcuts: DEFAULT_SHORTCUTS }, (data) => {
  const shortcuts = data.shortcuts
})
```

### 监听变化

```typescript
chrome.storage.onChanged.addListener((changes) => {
  if (changes.shortcuts) {
    const newShortcuts = changes.shortcuts.newValue
  }
})
```

---

## Content Script 集成

在 Content Script 中使用自定义快捷键：

```typescript
import type { ShortcutKey } from '../options/components/ShortcutRecorder'

// 检查键盘事件是否匹配快捷键
function matchesShortcut(e: KeyboardEvent, shortcut: ShortcutKey | null): boolean {
  if (!shortcut || !shortcut.key) return false

  const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
  const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey
  const altMatch = shortcut.alt ? e.altKey : !e.altKey
  const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
  const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey

  return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch
}

// 监听键盘事件
document.addEventListener('keydown', (e) => {
  if (matchesShortcut(e, currentShortcut)) {
    e.preventDefault()
    // 执行操作
  }
})
```

---

## 显示格式

### Mac 显示符号

| 修饰键 | 符号 |
|--------|------|
| Ctrl | ⌃ |
| Alt | ⌥ |
| Shift | ⇧ |
| Meta (Command) | ⌘ |

### 特殊按键

| 按键 | 显示 |
|------|------|
| Space | Space |
| ArrowUp | ↑ |
| ArrowDown | ↓ |
| ArrowLeft | ← |
| ArrowRight | → |
