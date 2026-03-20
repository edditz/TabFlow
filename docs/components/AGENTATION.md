# Agentation 接入指南

[Agentation](https://www.npmjs.com/package/agentation) 是一个可视化标注工具，用于帮助 AI 编程助手理解用户想要修改的页面元素。本文档介绍如何在项目中接入和使用 Agentation。

## 安装

```bash
npm install agentation -D
```

> **注意**: Agentation 仅用于开发环境，不应在生产环境中使用。

## 使用方式

项目提供了两种使用 Agentation 的方式：

### 方式一：React 组件（推荐）

使用 `AgentationWrapper` 组件，支持两种渲染模式：

#### Inline 模式

直接在 React 组件树中渲染，适合普通 React 应用：

```tsx
import { AgentationWrapper } from '../shared'

function App() {
  return (
    <>
      <YourApp />
      <AgentationWrapper
        mode="inline"
        visible={true}
        onAnnotationAdd={(annotation) => {
          console.log('New annotation:', annotation)
        }}
      />
    </>
  )
}
```

#### Portal 模式

注入到 `document.body` 中，适合：
- Content Script 场景
- 需要完全控制渲染位置的情况
- 需要动态显示/隐藏的情况

```tsx
import { useState } from 'react'
import { AgentationWrapper } from '../shared'

function App() {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <button onClick={() => setVisible(!visible)}>
        Toggle Agentation
      </button>
      <AgentationWrapper
        mode="portal"
        visible={visible}
        containerId="my-agentation"
        zIndex={2147483647}
        onAnnotationAdd={(annotation) => {
          console.log('New annotation:', annotation)
        }}
      />
    </>
  )
}
```

### 方式二：编程式 API

使用 `createAgentationInstance` 创建独立实例，适合：
- 非 React 环境
- Content Script（无 React 上下文）
- 需要完全控制生命周期

```tsx
import { createAgentationInstance, type Annotation } from '../shared'

// 创建实例
const agentation = createAgentationInstance({
  containerId: 'my-agentation',
  zIndex: 2147483647,
  visible: false,
  onAnnotationAdd: (annotation: Annotation) => {
    console.log('Annotation added:', annotation)
  },
  onAnnotationDelete: (annotation: Annotation) => {
    console.log('Annotation deleted:', annotation)
  },
  onCopy: (markdown: string) => {
    console.log('Copied:', markdown)
  }
})

// 显示
agentation.show()

// 隐藏
agentation.hide()

// 切换
agentation.toggle()

// 检查状态
agentation.isVisible() // boolean

// 销毁
agentation.destroy()
```

## API 参考

### AgentationWrapper Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mode` | `'inline' \| 'portal'` | `'inline'` | 渲染模式 |
| `visible` | `boolean` | `true` | 是否显示 |
| `containerId` | `string` | `'agentation-root'` | Portal 模式的容器 ID |
| `zIndex` | `number` | `2147483647` | z-index 层级 |
| `onAnnotationAdd` | `(annotation: Annotation) => void` | - | 注解添加回调 |
| `onAnnotationDelete` | `(annotation: Annotation) => void` | - | 注解删除回调 |
| `onAnnotationUpdate` | `(annotation: Annotation) => void` | - | 注解更新回调 |
| `onAnnotationsClear` | `(annotations: Annotation[]) => void` | - | 清空注解回调 |
| `onCopy` | `(markdown: string) => void` | - | 复制回调 |
| `copyToClipboard` | `boolean` | `true` | 是否复制到剪贴板 |

### createAgentationInstance Options

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `containerId` | `string` | `'agentation-root'` | 容器 ID |
| `zIndex` | `number` | `2147483647` | z-index 层级 |
| `visible` | `boolean` | `false` | 初始显示状态 |
| 其他回调 | 同上 | - | 同 AgentationWrapper Props |

### Annotation 类型

```typescript
type Annotation = {
  id: string
  x: number              // 视口宽度百分比
  y: number              // 距顶部像素
  comment: string        // 用户注释
  element: string        // 元素类型，如 "Button"
  elementPath: string    // CSS 选择器路径
  timestamp: number

  // 可选元数据
  selectedText?: string
  boundingBox?: { x: number; y: number; width: number; height: number }
  nearbyText?: string
  cssClasses?: string
  nearbyElements?: string
  computedStyles?: string
  fullPath?: string
  accessibility?: string
  isMultiSelect?: boolean
  isFixed?: boolean
}
```

## Content Script 场景示例

在浏览器扩展的 Content Script 中使用：

```tsx
// src/content/index.tsx
import { createRoot } from 'react-dom/client'
import { SearchPanel } from './components/SearchPanel'
import { createAgentationInstance, type Annotation } from '../shared'
import './styles.css'

const isDev = import.meta.env.VITE_DEV === 'true'

let searchRoot = null
let searchContainer = null
let agentationInstance = null
let isVisible = false

function init() {
  // 创建 SearchPanel 容器
  searchContainer = document.createElement('div')
  searchContainer.id = 'tab-tool-root'
  document.body.appendChild(searchContainer)
  searchRoot = createRoot(searchContainer)

  // 初始化 Agentation（仅开发环境）
  if (isDev) {
    agentationInstance = createAgentationInstance({
      containerId: 'tab-tool-agentation',
      zIndex: 2147483647,
      visible: false,
      onAnnotationAdd: (annotation: Annotation) => {
        console.log('Annotation:', annotation)
      }
    })
  }
}

function toggle() {
  isVisible = !isVisible
  render()
}

function render() {
  if (isVisible) {
    searchRoot.render(<SearchPanel onClose={hide} />)
    if (isDev && agentationInstance) {
      agentationInstance.show()
    }
  } else {
    searchRoot.render(null)
    if (isDev && agentationInstance) {
      agentationInstance.hide()
    }
  }
}

function hide() {
  isVisible = false
  render()
}

init()
```

## z-index 层级说明

为确保 Agentation 显示在最上层，项目使用以下层级：

| 元素 | z-index |
|------|---------|
| SearchPanel overlay | 2147483646 |
| Agentation 工具栏/弹窗/标记 | 2147483647 |

CSS 选择器确保 Agentation 元素具有最高层级：

```css
[data-feedback-toolbar],
[data-annotation-popup],
[data-annotation-marker] {
  z-index: 2147483647 !important;
}
```

## 注意事项

1. **仅开发环境**: Agentation 只应在开发环境使用，生产环境应通过 tree-shaking 移除
2. **延迟加载**: Agentation 模块采用动态 `import()` 加载，避免影响初始加载性能
3. **生命周期管理**: 使用 `portal` 模式或 `createAgentationInstance` 时，注意在组件卸载时调用 `destroy()` 清理资源

## 相关文件

- `src/shared/components/AgentationWrapper.tsx` - 封装组件
- `src/shared/components/AgentationWrapper.css` - z-index 样式
- `src/shared/index.ts` - 导出入口
- `src/content/index.tsx` - Content Script 使用示例
