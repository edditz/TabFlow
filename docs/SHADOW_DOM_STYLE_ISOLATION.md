# Shadow DOM 样式隔离实现指南

## 问题背景

当使用 Content Script 向网页注入 UI 组件时，宿主页面的 CSS 样式可能会污染注入组件的样式，导致：
- 字体、颜色被覆盖
- 布局被破坏
- 不同网站上显示效果不一致

## 解决方案

使用 **Shadow DOM** 实现完全的样式隔离。Shadow DOM 创建一个独立的 DOM 子树，其样式与外部完全隔离。

## 实现步骤

### 1. 修改 CSS 选择器

Shadow DOM 使用 `:host` 选择器代替 `:root`：

```css
/* 之前 - 使用 :root */
:root {
  --my-color: #ffffff;
}

[data-theme='dark'] {
  --my-color: #000000;
}

/* 之后 - 使用 :host */
:host {
  --my-color: #ffffff;
}

:host([data-theme='dark']) {
  --my-color: #000000;
}
```

### 2. 创建 Shadow DOM 并注入样式

```typescript
// 导入 CSS 作为原始字符串（Vite 的 ?inline 查询参数）
import cssText from './styles.css?inline'

function init() {
  // 1. 创建宿主元素
  const shadowHost = document.createElement('div')
  shadowHost.id = 'my-extension-root'
  document.body.appendChild(shadowHost)

  // 2. 创建 Shadow DOM
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' })

  // 3. 注入样式到 Shadow DOM
  const styleElement = document.createElement('style')
  styleElement.textContent = cssText
  shadowRoot.appendChild(styleElement)

  // 4. 创建应用容器
  const appContainer = document.createElement('div')
  shadowRoot.appendChild(appContainer)

  // 5. 渲染 React 应用
  const root = createRoot(appContainer)
  root.render(<App />)
}
```

### 3. 主题切换实现

通过在宿主元素上设置 `data-theme` 属性来切换主题：

```typescript
function updateTheme(theme: 'light' | 'dark') {
  if (shadowHost) {
    shadowHost.setAttribute('data-theme', theme)
  }
}
```

CSS 会自动响应：

```css
/* Light theme (default) */
:host {
  --background: #ffffff;
  --foreground: #000000;
}

/* Dark theme */
:host([data-theme='dark']) {
  --background: #1a1a1a;
  --foreground: #ffffff;
}
```

### 4. 多个 CSS 文件合并

如果有多个 CSS 文件，合并后注入：

```typescript
import mainCss from './main.css?inline'
import toastCss from './toast.css?inline'

const styleElement = document.createElement('style')
styleElement.textContent = mainCss + '\n' + toastCss
shadowRoot.appendChild(styleElement)
```

## 关键要点

### Vite 配置

使用 `?inline` 查询参数将 CSS 作为字符串导入：

```typescript
import cssText from './styles.css?inline'
```

### 选择器转换对照表

| 原选择器 | Shadow DOM 选择器 |
|---------|------------------|
| `:root` | `:host` |
| `[data-theme='dark']` | `:host([data-theme='dark'])` |
| `.parent .child` | `.parent .child`（无需改变） |

### 注意事项

1. **事件冒泡**：Shadow DOM 内部的事件会冒泡到外部，但 `event.target` 会被重新指向宿主元素

2. **全局样式**：`body`、`html` 等全局选择器在 Shadow DOM 内不生效，需要使用具体的选择器

3. **字体加载**：如果使用自定义字体，需要在 Shadow DOM 内部的 `<style>` 中也包含 `@font-face` 声明

4. **表单元素**：某些表单元素的默认样式可能仍受外部影响，需要显式重置

5. **可访问性**：Shadow DOM 内的元素仍然可以被屏幕阅读器访问

## 替代方案对比

| 方案 | 优点 | 缺点 |
|-----|------|------|
| **Shadow DOM** | 完全隔离、原生支持 | 需要调整 CSS 选择器 |
| CSS 前缀 + !important | 简单 | 不够可靠、维护困难 |
| iframe | 完全隔离 | 性能开销、通信复杂 |

## 参考资源

- [MDN: Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [CSS Scoping Module](https://drafts.csswg.org/css-scoping/)
