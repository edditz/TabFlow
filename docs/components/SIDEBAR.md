# 侧边栏组件

## 概述

侧边栏是 TabFlow 使用 Chrome Side Panel API 实现的标签页管理面板，在浏览器侧边栏中展示当前窗口的标签页和标签组。

## 文件结构

```
src/sidepanel/
├── index.html               # 入口 HTML
├── main.tsx                 # React 入口（render root）
├── App.tsx                  # 侧边栏主组件
├── App.css                  # 样式（Light/Dark 主题 CSS 变量）
├── types.ts                 # 类型定义
├── components/
│   ├── index.ts
│   ├── SidebarHeader.tsx    # 顶部标题栏
│   ├── TabItem.tsx          # 标签页条目
│   ├── GroupHeader.tsx      # 标签组标题行
│   ├── RecentTabs.tsx       # 最近关闭的标签页列表
│   └── ContextMenu.tsx      # 右键上下文菜单
├── hooks/
│   ├── useTabs.ts           # 标签页列表管理
│   ├── useTabGroups.ts      # 标签组管理
│   ├── useRecentTabs.ts     # 最近关闭的标签页
│   └── useSidebarSettings.ts # 侧边栏设置持久化
└── layouts/
    ├── index.ts
    ├── CompactLayout.tsx    # 紧凑布局
    ├── CardLayout.tsx       # 卡片布局
    └── TreeLayout.tsx       # 树形布局
```

## 数据流

```
┌──────────────────────────────────────────────────────────────┐
│                     chrome.storage.sync                      │
│                { sidebarSettings: {...} }                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                   useSidebarSettings()                        │
│  读取/写入 sidebarSettings，监听 onChanged                    │
└──────────────────────────┬───────────────────────────────────┘
                              │ settings
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                        App.tsx                                │
│  - 根据 settings.sidebarLayout 选择布局                      │
│  - 管理 collapsedGroups 状态                                 │
│  - 管理 contextMenu 状态                                     │
│  - 分发右键菜单动作                                          │
└──────┬────────────────┬──────────────────┬───────────────────┘
       │                │                  │
       ▼                ▼                  ▼
┌────────────┐  ┌────────────┐  ┌────────────┐
│ Compact    │  │ Card       │  │ Tree       │
│ Layout     │  │ Layout     │  │ Layout     │
└──────┬─────┘  └──────┬─────┘  └──────┬─────┘
       │               │               │
       ▼               ▼               ▼
┌────────────┐  ┌────────────┐  ┌────────────┐
│ TabItem    │  │ Custom     │  │ TabItem    │
│ GroupHeader│  │ Card       │  │ GroupHeader│
│            │  │ Template   │  │ RecentTabs │
└────────────┘  └────────────┘  └────────────┘
```

## 类型定义 (types.ts)

```typescript
type SidebarLayout = 'compact' | 'detailed' | 'tree'

interface SidebarSettings {
  sidebarLayout: SidebarLayout
  sidebarShowDomain: boolean
  sidebarShowFavicon: boolean
  sidebarShowCloseButton: boolean
  sidebarDefaultExpanded: boolean
  sidebarRecentCount: number        // 5 | 10 | 15
  sidebarShowGroupTag: boolean
  sidebarShowAudioIndicator: boolean
  sidebarShowPinnedIndicator: boolean
  sidebarShowMemory: boolean
}

interface TabGroup {
  id: number
  title: string
  color: chrome.tabGroups.ColorEnum
  collapsed: boolean
  tabs: chrome.tabs.Tab[]
}

interface RecentTab {
  sessionId: string
  title: string
  url: string
  favIconUrl?: string
  lastModified: number
}
```

默认设置值：

```typescript
const DEFAULT_SIDEBAR_SETTINGS: SidebarSettings = {
  sidebarLayout: 'compact',
  sidebarShowDomain: true,
  sidebarShowFavicon: true,
  sidebarShowCloseButton: true,
  sidebarDefaultExpanded: true,
  sidebarRecentCount: 10,
  sidebarShowGroupTag: true,
  sidebarShowAudioIndicator: true,
  sidebarShowPinnedIndicator: true,
  sidebarShowMemory: false
}
```

## 组件详情

### SidebarHeader

顶部标题栏，左侧显示 "TabFlow" 标题，右侧包含布局切换按钮组和设置入口。

**Props:**
```typescript
interface SidebarHeaderProps {
  layout: SidebarLayout
  onLayoutChange: (layout: SidebarLayout) => void
  onOpenSettings: () => void
  labels: {
    sidebarTitle: string
    layoutCompact: string
    layoutCard: string
    layoutTree: string
  }
}
```

**布局按钮:**
- `List` 图标 → `compact`（紧凑）
- `LayoutGrid` 图标 → `detailed`（卡片）
- `GitBranch` 图标 → `tree`（树形）

### TabItem

单个标签页条目，支持两种变体（`compact` / `detailed`）。

**Props:**
```typescript
interface TabItemProps {
  title: string
  url?: string
  favIconUrl?: string
  isActive: boolean
  showDomain?: boolean
  showFavicon?: boolean
  showCloseButton?: boolean
  groupColor?: string
  variant?: 'compact' | 'detailed'
  onActivate: () => void
  onClose: () => void
  onContextMenu: (e: React.MouseEvent) => void
}
```

**视觉效果:**
- 左侧可选的彩色竖线（`groupColor`）指示分组
- 左侧图标区域：显示 favicon 或占位符
- 中间信息区域：标题（必选）+ 域名（可选，从 URL 解析）
- 右侧关闭按钮：悬停时显示（CSS `display: none` → `block` 过渡）

**交互:**
- 点击 → `onActivate`（切换到该标签页）
- 右键 → `onContextMenu`（打开上下文菜单）
- 点击 × → `onClose`（关闭标签页，使用 `e.stopPropagation()` 防止触发激活）

### GroupHeader

标签组标题行，点击可折叠/展开组内标签页。

**Props:**
```typescript
interface GroupHeaderProps {
  title: string
  color: string
  tabCount: number
  collapsed: boolean
  onToggle: () => void
  onContextMenu: (e: React.MouseEvent) => void
}
```

**视觉效果:**
- 彩色圆点（使用 Chrome TabGroup 颜色映射：`grey`, `blue`, `red`, `yellow`, `green`, `pink`, `purple`, `cyan`）
- 分组名称
- 标签数量徽标
- ChevronRight 箭头：折叠时 0°，展开时旋转 90°（CSS transition 0.15s）
- MoreHorizontal 图标：点击打开分组右键菜单

### RecentTabs

显示最近关闭的标签页列表。空状态时显示时钟图标和提示文本。

**Props:**
```typescript
interface RecentTabsProps {
  tabs: RecentTab[]
  onRestore: (sessionId: string) => void
  labels: {
    recentTabs: string
    recentClosedEmpty: string
    restoreTab: string
  }
}
```

**空状态:**
- 使用 `lucide-react` 的 `Clock` 图标（24px, strokeWidth 1.5）
- 显示 `recentClosedEmpty` 提示文本

**列表项:**
- Favicon 或占位符
- 标签页标题
- 恢复按钮（`RotateCcw` 图标，12px）

### ContextMenu

右键上下文菜单，支持分隔线、危险操作和子菜单。

**Props:**
```typescript
interface MenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  danger?: boolean
  divider?: boolean
  children?: MenuItem[]   // 子菜单项
}

interface ContextMenuProps {
  x: number    // 菜单左上角 X 坐标
  y: number    // 菜单左上角 Y 坐标
  items: MenuItem[]
  onClose: () => void
  onAction: (actionId: string) => void
}
```

**位置调整:**
- 自动调整 Y 坐标（防止超出窗口底部）：`Math.min(y, window.innerHeight - items.length * 32 - 20)`
- 自动调整 X 坐标（防止超出窗口右侧）：`Math.min(x, window.innerWidth - 180)`

**关闭方式:**
- 点击菜单外部（`mousedown` 事件监听）
- 按 `Escape` 键
- 点击菜单项执行操作后

**子菜单:**
- hover 菜单项时，如果 `item.children` 存在，在右侧显示子菜单
- 通过 `getBoundingClientRect()` 定位子菜单位置

## 布局组件

### CompactLayout

紧凑列表布局，按分组排列标签页。每个标签页为单行条目，使用 `TabItem` 组件。

**Props:**
```typescript
interface CompactLayoutProps {
  groups: TabGroup[]
  activeTabId?: number
  collapsedGroups: Set<number>
  onToggleGroup: (groupId: number) => void
  onActivateTab: (tabId: number) => void
  onCloseTab: (tabId: number) => void
  onTabContextMenu: (e: React.MouseEvent, tabId: number) => void
  onGroupContextMenu: (e: React.MouseEvent, groupId: number) => void
  showFavicon: boolean
  showCloseButton: boolean
}
```

**特性:**
- 分组标题行（GroupHeader）可折叠，折叠时隐藏组内所有标签页
- 未分组标签页显示在最后，无 GroupHeader

### CardLayout

卡片布局，每个标签页渲染为独立的信息卡片（不嵌套在分组中）。所有标签页扁平化排列。

**Props:**
```typescript
interface CardLayoutProps {
  groups: TabGroup[]
  activeTabId?: number
  onActivateTab: (tabId: number) => void
  onCloseTab: (tabId: number) => void
  onTabContextMenu: (e: React.MouseEvent, tabId: number) => void
  showFavicon: boolean
  showGroupTag: boolean
  showAudioIndicator: boolean
  showPinnedIndicator: boolean
  showCloseButton: boolean
  labels: {
    justNow: string
    minutesAgo: string
    hoursAgo: string
    daysAgo: string
  }
}
```

**卡片结构:**
```
┌─────────────────────────────────────┐
│ ▌ [favicon] Title           🔊📌 [×]│
│ ▌ domain.com  [Group Tag]  5m ago  │
└─────────────────────────────────────┘
```

- **左侧彩色竖线**: 根据分组颜色
- **第一行**: favicon（可选）+ 标题 + 徽标（音频 🔊、固定 📌）+ 关闭按钮（可选）
- **第二行**: 域名 + 分组标签（可选，彩色背景 + 分组名）+ 相对时间

**时间格式化 (`formatTime`):**
- 60 秒内 → `justNow`（"just now" / "刚刚"）
- 60 分钟内 → `minutesAgo`（"{n} min ago" / "{n} 分钟前"）
- 24 小时内 → `hoursAgo`（"{n}h ago" / "{n} 小时前"）
- 超过 24 小时 → `daysAgo`（"{n}d ago" / "{n} 天前"）

### TreeLayout

树形布局，左侧有 Tabs / Recent 标签页切换。

**Props:**
```typescript
interface TreeLayoutProps {
  groups: TabGroup[]
  activeTabId?: number
  recentTabs: RecentTab[]
  collapsedGroups: Set<number>
  onToggleGroup: (groupId: number) => void
  onActivateTab: (tabId: number) => void
  onCloseTab: (tabId: number) => void
  onTabContextMenu: (e: React.MouseEvent, tabId: number) => void
  onGroupContextMenu: (e: React.MouseEvent, groupId: number) => void
  onRestoreTab: (sessionId: string) => void
  showFavicon: boolean
  showCloseButton: boolean
  labels: {
    recentTabs: string
    recentClosedEmpty: string
    restoreTab: string
    ungrouped: string
  }
}
```

**两个视图:**
1. **Tabs 视图**: 按分组树展示标签页，未分组标签以 "Ungrouped" 标题显示
2. **Recent 视图**: 最近关闭的标签页列表，使用 `RecentTabs` 组件

## Hooks

### useTabs

管理当前窗口标签页列表，实时监听标签页事件。

```typescript
function useTabs(): {
  tabs: chrome.tabs.Tab[]
  activeTabId: number | undefined
  activateTab: (tabId: number) => void
  closeTab: (tabId: number) => void
  refreshTabs: () => void
}
```

**监听事件:**
- `onCreated`, `onRemoved`, `onUpdated`, `onActivated`, `onMoved`, `onAttached`, `onDetached`

### useTabGroups

管理 Chrome Tab Groups 的分组列表和操作。

```typescript
function useTabGroups(tabs: chrome.tabs.Tab[]): {
  groups: TabGroup[]
  createGroup: (tabIds: number[], title: string, color: ColorEnum) => Promise<void>
  renameGroup: (groupId: number, title: string) => void
  changeGroupColor: (groupId: number, color: ColorEnum) => void
  ungroupTabs: (tabIds: number[]) => void
  moveTabToGroup: (tabId: number, groupId: number) => Promise<void>
  closeGroupTabs: (groupTabs: chrome.tabs.Tab[]) => void
}
```

**分组构建逻辑 (`buildGroups`):**
1. 获取所有 Chrome Tab Groups
2. 将标签页分配到对应分组
3. 未分组标签页放入 `TAB_GROUP_ID_NONE` 分组

### useRecentTabs

获取和管理最近关闭的标签页。

```typescript
function useRecentTabs(maxResults: number = 10): {
  recentTabs: RecentTab[]
  restoreTab: (sessionId: string) => void
  refreshRecentTabs: () => void
}
```

**实现:**
- 通过 `chrome.sessions.getRecentlyClosed()` 获取
- 过滤出 `.tab` 类型的会话（排除窗口类型）
- 恢复时调用 `chrome.sessions.restore(sessionId)`

### useSidebarSettings

读取和写入侧边栏设置，支持实时监听变化。

```typescript
function useSidebarSettings(): {
  settings: SidebarSettings
  updateSetting: <K extends keyof SidebarSettings>(key: K, value: SidebarSettings[K]) => void
  updateLayout: (layout: SidebarLayout) => void
}
```

**持久化:**
- 设置存储在 `chrome.storage.sync.sidebarSettings` 下
- 初始化时从 storage 读取，合并默认值
- 监听 `chrome.storage.onChanged` 以跨页面同步（侧边栏 ↔ 设置页面）
- 变更时立即写入 storage

## 右键菜单操作

### 标签页右键菜单

| 操作 | Action ID | 说明 |
|------|-----------|------|
| 移动到分组 | `move-to-{groupId}` | 子菜单，列出所有可用分组 |
| 从分组中移除 | `remove-from-group` | 仅在当前标签有分组时显示 |
| --- | `divider-*` | 分隔线 |
| 关闭其他标签 | `close-other-tabs` | 关闭同组内的其他标签页 |
| 复制链接 | `copy-url` | 复制标签页 URL 到剪贴板 |
| --- | `divider-*` | 分隔线 |
| 关闭标签 | `close-tab` | 使用 danger 样式（红色） |

### 分组右键菜单

| 操作 | Action ID | 说明 |
|------|-----------|------|
| 重命名 | `rename-group` | 弹出 `prompt` 输入新名称 |
| 更改颜色 | `change-color` | 弹出 `prompt` 输入颜色名 |
| --- | `divider-*` | 分隔线 |
| 关闭所有标签 | `close-group-tabs` | danger 样式，关闭组内所有标签 |
| 取消分组 | `ungroup` | 保留标签页但移除分组 |

## 侧边栏设置项

在设置页面（`src/options/App.tsx`）中，侧边栏设置区块提供以下配置项：

| 设置项 | 存储键 | 类型 | 默认值 |
|--------|--------|------|--------|
| 布局样式 | `sidebarLayout` | `select` | `compact` |
| 显示域名 | `sidebarShowDomain` | `switch` | `true` |
| 显示图标 | `sidebarShowFavicon` | `switch` | `true` |
| 显示关闭按钮 | `sidebarShowCloseButton` | `switch` | `true` |
| 显示分组标签 | `sidebarShowGroupTag` | `switch` | `true` |
| 显示音频指示 | `sidebarShowAudioIndicator` | `switch` | `true` |
| 显示固定指示 | `sidebarShowPinnedIndicator` | `switch` | `true` |
| 显示内存占用 | `sidebarShowMemory` | `switch` | `false` |
| 展开所有分组 | `sidebarDefaultExpanded` | `switch` | `true` |
| 最近关闭数量 | `sidebarRecentCount` | `select` | `10` |

## 关键交互细节

1. **Hover jitter 修复**：TabItem 关闭按钮使用 `opacity` + CSS transition 控制显示，而不是 `display: none → block`，避免元素突然出现导致的布局抖动。

2. **Compact/Tree 布局间距**：分组内的 TabItem 之间添加了垂直 margin 以提升可读性。

3. **设置同步**：sidebar 和 options 页面通过 `chrome.storage.sync` 的 `sidebarSettings` 嵌套键双向同步，options 页面同时监听 `onChanged` 事件以确保不会覆盖其他来源的变更。

4. **侧边栏通过点击扩展图标或快捷键 `Alt+L` 打开**，在 `manifest.json` 中配置 `side_panel`，在 `background/index.ts` 中调用 `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })`。
