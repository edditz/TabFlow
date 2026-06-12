# 侧边标签栏功能设计文档

## 概述

TabFlow 侧边标签栏是一个基于 Chrome Side Panel API 的持久化标签管理界面，与现有的搜索面板（Content Script 模态浮层）共存。用户可以在浏览器侧边栏中查看、管理所有标签页和标签分组。

## 需求

### 核心功能

| 功能 | 说明 |
|------|------|
| 标签页列表 | 显示所有打开的标签页，支持点击切换、关闭标签 |
| 标签分组管理 | 完整管理：创建分组、拖拽标签到分组、重命名、删除分组 |
| 最近关闭 | 显示最近关闭的标签页，支持一键恢复 |
| 三种布局 | 紧凑列表 / 详细列表 / 树形视图，用户可配置切换 |

### 交互方式

| 操作 | 方式 |
|------|------|
| 打开侧边栏 | 点击扩展图标 或 快捷键 `Alt+L` |
| 分组管理 | dnd-kit 拖拽 + 右键菜单 |
| 布局切换 | 侧边栏顶部布局切换器 |

### 与现有功能的关系

- **搜索面板**：保持不变，快捷键 `Ctrl+Shift+Z` / `Cmd+Shift+Z` 触发
- **侧边栏**：独立运行，快捷键 `Alt+L` 触发
- 两者共存，互不影响

## 架构

### 整体架构

```
┌──────────────────────────────────────────────────┐
│              Chrome Browser                       │
├──────────┬──────────┬──────────┬─────────────────┤
│ Side     │ Popup    │ Options  │ Content Script  │
│ Panel    │          │ (设置页) │ (搜索面板)      │
│ (新)     │ (现有)   │ (现有)   │ (现有)          │
├──────────┴──────────┴──────────┴─────────────────┤
│           Background Service Worker               │
│     (消息路由、标签操作、分组操作)                  │
└──────────────────────────────────────────────────┘
```

Side Panel 作为独立页面运行，通过 `chrome.runtime.sendMessage` 与 Background 通信，通过 `chrome.storage` 读取用户设置。

### Side Panel 优势

- 拥有完整 Chrome API 权限（`chrome.tabs`、`chrome.tabGroups` 等）
- 不挤占网页空间
- 不依赖 Content Script 注入，无样式污染风险
- 浏览器原生支持（Chrome 114+、Edge 114+）

### 目录结构

```
src/sidepanel/
├── index.html              # Side Panel 入口 HTML
├── main.tsx                # React 入口
├── App.tsx                 # 主组件（布局选择 + 路由）
├── App.css                 # 样式（CSS 变量 + 主题）
├── components/
│   ├── TabList.tsx         # 标签页列表组件
│   ├── TabItem.tsx         # 单个标签项
│   ├── GroupHeader.tsx     # 分组头部（展开/折叠/重命名）
│   ├── GroupContextMenu.tsx # 分组右键菜单
│   ├── TabContextMenu.tsx  # 标签右键菜单
│   ├── RecentTabs.tsx      # 最近关闭的标签
│   ├── SidebarHeader.tsx   # 顶部栏（布局切换、操作按钮）
│   └── LayoutSwitcher.tsx  # 布局切换组件
└── hooks/
    ├── useTabs.ts          # 标签数据 hook
    ├── useTabGroups.ts     # 分组数据 hook
    └── useRecentTabs.ts    # 最近关闭标签 hook
```

### Manifest 变更

```json
{
  "permissions": [
    "sidePanel"
  ],
  "side_panel": {
    "default_path": "src/sidepanel/index.html"
  },
  "commands": {
    "toggle-side-panel": {
      "suggested_key": {
        "default": "Alt+L",
        "mac": "Alt+L"
      },
      "description": "Toggle side panel"
    }
  }
}
```

## 数据流与消息通信

### 消息类型扩展

在现有 Background Service Worker 中新增以下消息类型：

```typescript
type MessageType =
  // --- 现有（保持不变）---
  | 'GET_ALL_TABS'
  | 'GET_TAB_STATS'
  | 'ACTIVATE_TAB'
  | 'CLOSE_TAB'
  | 'CLASSIFY_TABS'
  | 'UPDATE_SHORTCUTS'
  | 'TOGGLE_SEARCH_PANEL'
  // --- 新增 ---
  | 'TOGGLE_SIDE_PANEL'           // 切换侧边栏
  | 'GET_TAB_GROUPS'              // 获取所有标签分组
  | 'CREATE_TAB_GROUP'            // 创建分组
  | 'UPDATE_TAB_GROUP'            // 更新分组（重命名、颜色）
  | 'DELETE_TAB_GROUP'            // 删除分组
  | 'MOVE_TAB_TO_GROUP'           // 移动标签到分组
  | 'REMOVE_TAB_FROM_GROUP'       // 从分组中移除标签
  | 'GET_RECENTLY_CLOSED'         // 获取最近关闭的标签
  | 'RESTORE_TAB'                 // 恢复关闭的标签
```

### 数据流

```
┌─────────────────┐     chrome.runtime.sendMessage      ┌──────────────┐
│   Side Panel    │ ──────────────────────────────────▶ │  Background  │
│                 │                                      │   Service    │
│  useTabs()      │ ◀──────── chrome.tabs.query()  ──── │   Worker     │
│  useTabGroups() │       实时数据返回                    │              │
│  useRecentTabs()│                                      │  - 路由消息   │
│                 │     chrome.storage.onChanged         │  - 操作标签   │
│                 │ ◀──────── 设置变更通知 ────────────── │  - 管理分组   │
└─────────────────┘                                      └──────────────┘
        │                                                       │
        │                chrome.tabs / chrome.tabGroups         │
        └──────────── 直接调用（Side Panel 有完整 API 权限）───┘
```

### API 调用策略

- **直接调用**（Side Panel 自行处理）：`chrome.tabs.query`、`chrome.tabGroups.query`、`chrome.tabs.update`、`chrome.tabs.remove`
- **通过 Background**（需要协调）：拖拽分组、快捷键触发、标签变化广播

### 实时更新

Background 监听以下事件，广播给 Side Panel：

```typescript
chrome.tabs.onCreated      → 广播 TAB_UPDATED
chrome.tabs.onRemoved      → 广播 TAB_UPDATED
chrome.tabs.onUpdated      → 广播 TAB_UPDATED
chrome.tabGroups.onCreated → 广播 GROUP_UPDATED
chrome.tabGroups.onUpdated → 广播 GROUP_UPDATED
chrome.tabGroups.onRemoved → 广播 GROUP_UPDATED
```

Side Panel 的 hooks 监听这些广播，自动刷新数据。

## 组件设计

### 三种布局

| 布局 | 特点 |
|------|------|
| **紧凑列表** | 按分组折叠显示，每行仅图标+标题，信息密度高 |
| **详细列表** | 每个标签显示图标+标题+域名，左侧色条标识分组，不折叠 |
| **树形视图** | 分组可折叠展开，类似文件树，顶部 Tab 切换全部/最近关闭 |

### 组件复用

```
App.tsx (布局选择器)
  ├── layout === 'compact'  → CompactLayout
  ├── layout === 'detailed' → DetailedLayout
  └── layout === 'tree'     → TreeLayout

共享组件:
  ├── TabItem        (三种布局复用，通过 props 控制显示内容)
  ├── GroupHeader    (三种布局复用，通过 props 控制样式)
  ├── ContextMenu    (统一右键菜单)
  └── RecentTabs     (底部区域，三种布局复用)
```

### TabItem Props

```typescript
interface TabItemProps {
  tab: chrome.tabs.Tab
  showDomain?: boolean    // 详细列表模式显示域名
  showCloseButton?: boolean
  isActive?: boolean      // 当前活动标签高亮
  onActivate: (tabId: number) => void
  onClose: (tabId: number) => void
  onContextMenu: (e: React.MouseEvent, tabId: number) => void
}
```

### 拖拽设计（dnd-kit）

```
DndContext
  ├── SortableContext (分组间排序)
  │     ├── GroupContainer[0] → SortableContext (组内标签排序)
  │     │     ├── TabItem (可拖拽)
  │     │     └── TabItem (可拖拽)
  │     ├── GroupContainer[1] → SortableContext
  │     │     └── TabItem (可拖拽)
  │     └── "未分组" 容器 → SortableContext
  │           └── TabItem (可拖拽)
  │
  DragOverlay → 拖拽时显示的预览
```

支持的操作：
- **标签 → 标签**：组内排序
- **标签 → 分组**：移动到目标分组
- **标签 → 未分组区域**：从分组中移出
- **分组 → 分组**：分组排序

### 右键菜单

**标签右键菜单**：

| 操作 | 说明 |
|------|------|
| 移动到分组 → | 子菜单列出所有分组 |
| 从分组中移除 | 移到未分组 |
| 关闭标签 | 关闭当前标签 |
| 关闭其他标签 | 关闭同组其他标签 |
| 复制 URL | 复制标签 URL |

**分组右键菜单**：

| 操作 | 说明 |
|------|------|
| 重命名 | 内联编辑分组名 |
| 更改颜色 | 颜色选择器 |
| 关闭分组 | 关闭组内所有标签 |
| 取消分组 | 解散分组，保留标签 |
| 新建分组 | 创建新分组 |

## 设置集成

### 新增设置项

在 Options 页面新增「侧边栏」设置区块：

```typescript
interface SidebarSettings {
  // 布局偏好
  sidebarLayout: 'compact' | 'detailed' | 'tree'

  // 显示选项
  sidebarShowDomain: boolean      // 是否显示域名
  sidebarShowFavicon: boolean     // 是否显示网站图标
  sidebarShowCloseButton: boolean // 悬停时显示关闭按钮
  sidebarDefaultExpanded: boolean // 默认展开所有分组

  // 最近关闭
  sidebarRecentCount: number      // 显示最近关闭的标签数量 (5/10/15)
}
```

存储在 `chrome.storage.sync`，与现有设置共享 storage 空间。

### 主题系统

Side Panel 使用与 Options 页面相同的方式应用主题：

```typescript
function applyTheme(themeSetting: 'system' | 'light' | 'dark') {
  const actual = themeSetting === 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    : themeSetting

  document.documentElement.setAttribute('data-theme', actual)
}
```

复用现有 CSS 变量，与搜索面板保持视觉一致性。无需 Shadow DOM（Side Panel 是独立页面，无样式污染）。

### 国际化

复用 `src/i18n/` 模块，新增翻译键：

```typescript
// 侧边栏翻译键
sidebarTitle: string
sidebarLayout: string
layoutCompact: string
layoutDetailed: string
layoutTree: string
recentTabs: string
noGroupsYet: string
ungrouped: string
newGroup: string
renameGroup: string
changeColor: string
closeGroup: string
ungroup: string
moveToGroup: string
removeFromGroup: string
closeOtherTabs: string
copyUrl: string
restoreTab: string
```

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| 无打开标签 | 显示空状态插图 + 提示文字 |
| 无标签分组 | 显示平铺标签列表，隐藏分组相关 UI |
| 拖拽失败（API 错误） | 回滚 UI 到拖拽前状态，显示 toast 提示 |
| 分组操作失败 | toast 提示错误信息，不阻塞界面 |
| Chrome API 不可用 | 降级显示，提示用户浏览器版本过低 |
| Side Panel 被关闭后重开 | 从 storage 读取设置，重新查询标签数据 |

## Edge 兼容性

- Edge 支持 `chrome.sidePanel` API（称为 Sidebar API）
- 已知 Edge 在切换标签时可能重新加载面板 — 通过 `chrome.storage` 缓存状态减少闪烁
- 最低版本要求：Chrome 114+ / Edge 114+

## 测试策略

| 测试类型 | 范围 | 方式 |
|----------|------|------|
| 单元测试 | hooks（useTabs、useTabGroups、useRecentTabs）、工具函数 | Vitest + Chrome API mock |
| 组件测试 | TabItem、GroupHeader、ContextMenu、LayoutSwitcher | React Testing Library |
| 集成测试 | 拖拽操作流程、右键菜单操作、设置联动 | Playwright（复用现有 mock 方案） |
| 手动测试 | Side Panel 在真实浏览器中的表现 | Chrome + Edge 加载扩展验证 |
