# 组件知识库

本目录收录项目中使用的各类组件和工具的详细文档。

## 文档列表

| 文档 | 说明 |
|------|------|
| [Agentation 接入指南](./components/AGENTATION.md) | 可视化标注工具，帮助 AI 编程助手理解用户想要修改的页面元素 |
| [快捷键录入组件](./components/SHORTCUT_RECORDER.md) | 用于让用户自定义设置快捷键的组件 |
| [侧边栏组件](./components/SIDEBAR.md) | 侧边栏面板的 UI 组件、布局、Hook 和自定义设置 |

## 快速导航

### 开发工具

- **[Agentation](./components/AGENTATION.md)** - 可视化标注工具
  - 支持 React 组件和编程式 API 两种使用方式
  - 适用于 Content Script 场景
  - 提供元素选择、标注、复制等功能

### UI 组件

- **[ShortcutRecorder](./components/SHORTCUT_RECORDER.md)** - 快捷键录入组件
  - 支持点击录入、实时预览
  - 支持冲突检测
  - 支持 Mac 符号显示
  - 集成 chrome.storage 持久化

### 侧边栏 (Side Panel)

- **[SidebarHeader](./components/SIDEBAR.md#sidebarheader)** - 侧边栏顶部标题栏
  - 布局切换按钮（紧凑 / 卡片 / 树形）
  - 设置入口按钮
  - 使用 lucide-react 图标

- **[TabItem](./components/SIDEBAR.md#tabitem)** - 标签页条目组件
  - 支持紧凑和卡片两种变体
  - 显示图标、域名、分组颜色条
  - 悬停显示关闭按钮

- **[GroupHeader](./components/SIDEBAR.md#groupheader)** - 标签组标题行
  - 显示分组颜色圆点、名称、标签数量
  - 折叠/展开切换（ChevronRight 旋转动画）
  - 右键更多操作入口

- **[RecentTabs](./components/SIDEBAR.md#recenttabs)** - 最近关闭的标签页
  - 空状态提示（时钟图标）
  - 一键恢复按钮

- **[ContextMenu](./components/SIDEBAR.md#contextmenu)** - 右键上下文菜单
  - 支持分隔线和危险操作样式
  - 支持子菜单（hover 展开）
  - 自动调整位置防止溢出
  - 点击外部 / Escape 关闭

- **[CompactLayout](./components/SIDEBAR.md#compactlayout)** - 紧凑布局
  - 按分组排列标签页，支持折叠
  - 每个标签页为单行条目

- **[CardLayout](./components/SIDEBAR.md#cardlayout)** - 卡片布局
  - 每个标签页为独立卡片，显示标题、域名、时间
  - 可选徽标：分组标签、音频播放、固定状态
  - 扁平化展示所有标签

- **[TreeLayout](./components/SIDEBAR.md#treelayout)** - 树形布局
  - 分组树 + "最近关闭"标签页切换
  - 未分组标签页以 "Ungrouped" 显示

- **[useTabs](./components/SIDEBAR.md#hooks)** - 标签页列表 Hook
  - 实时监听标签页创建、移除、更新、激活等事件

- **[useTabGroups](./components/SIDEBAR.md#hooks)** - Tab Groups 管理 Hook
  - 分组创建、重命名、改色、取消分组、移动标签等操作

- **[useRecentTabs](./components/SIDEBAR.md#hooks)** - 最近关闭标签页 Hook
  - 通过 `chrome.sessions` API 获取和恢复

- **[useSidebarSettings](./components/SIDEBAR.md#hooks)** - 侧边栏设置 Hook
  - 从 `chrome.storage.sync` 读取/写入设置
  - 实时监听设置变化

---

> 如需添加新的组件文档，请将文档放入 `docs/components/` 目录，并更新本索引。
