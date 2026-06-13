# TabFlow 项目架构文档

## 项目概述

TabFlow 是一个浏览器扩展，用于增强 Chrome 和 Edge 的标签页管理功能。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 5.x | 构建工具 |
| CRXJS | 2.x | Chrome 扩展热重载 |
| Chrome Extensions Manifest | V3 | 扩展 API |

## 目录结构

```
tabflow/
├── src/
│   ├── background/          # Service Worker（后台脚本）
│   │   └── index.ts         # 处理快捷键命令、消息转发
│   │
│   ├── content/             # 内容脚本（注入到网页）
│   │   ├── index.tsx        # 入口文件，初始化 React 应用
│   │   ├── styles.css       # 全局样式
│   │   └── components/
│   │       └── SearchPanel.tsx   # 搜索面板组件
│   │
│   ├── popup/               # 扩展弹窗
│   │   ├── index.html
│   │   ├── main.tsx         # React 入口
│   │   └── App.tsx          # 弹窗主组件
│   │
│   ├── sidepanel/           # 侧边栏面板（Side Panel）
│   │   ├── index.html       # 入口 HTML
│   │   ├── main.tsx         # React 入口
│   │   ├── App.tsx          # 侧边栏主组件
│   │   ├── App.css          # 侧边栏样式（支持 Light/Dark 主题 CSS 变量）
│   │   ├── types.ts         # 类型定义
│   │   ├── components/      # UI 组件
│   │   │   ├── index.ts
│   │   │   ├── SidebarHeader.tsx   # 顶部标题栏 + 布局切换 + 设置入口
│   │   │   ├── TabItem.tsx         # 标签页条目
│   │   │   ├── GroupHeader.tsx     # 标签组标题行
│   │   │   ├── RecentTabs.tsx      # 最近关闭的标签页列表
│   │   │   └── ContextMenu.tsx     # 右键上下文菜单（支持子菜单）
│   │   ├── hooks/           # 自定义 Hooks
│   │   │   ├── useTabs.ts             # 标签页列表 + 激活/关闭
│   │   │   ├── useTabGroups.ts        # Tab Groups 分组管理
│   │   │   ├── useRecentTabs.ts       # 最近关闭标签页
│   │   │   └── useSidebarSettings.ts  # 侧边栏设置持久化
│   │   └── layouts/         # 布局组件
│   │       ├── index.ts
│   │       ├── CompactLayout.tsx  # 紧凑布局：分组 + TabItem
│   │       ├── CardLayout.tsx     # 卡片布局：独立卡片含域名、时间、徽标
│   │       └── TreeLayout.tsx     # 树形布局：分组树 + 最近关闭标签页切换
│   │
│   └── options/             # 设置页面
│       ├── index.html
│       ├── main.tsx         # React 入口
│       └── App.tsx          # 设置页主组件（含侧边栏设置区块）
│
├── icons/                   # 扩展图标
├── manifest.json           # 扩展清单（Manifest V3）
├── vite.config.ts          # Vite 配置
└── tsconfig.json           # TypeScript 配置
```

## 核心模块说明

### 1. Background (Service Worker)
- 监听键盘快捷键命令 `toggle-search-panel` 和 `toggle-side-panel`
- 向活动标签页发送消息以切换搜索面板
- 通过 `chrome.sidePanel` API 控制侧边栏面板
- 处理标签页信息查询、激活、关闭、最近关闭恢复等消息
- 处理智能分类的 Tab Groups 创建和取消分组
- 配置 `sidePanel.setPanelBehavior({ openPanelOnActionClick: true })`

### 2. Content Script
- 注入到所有网页
- 监听 `Ctrl+Shift+Z` 快捷键
- 渲染 React 搜索面板组件（含智能分类面板）
- 使用 Shadow DOM 实现样式隔离
- 接收来自 background 的消息

### 3. Side Panel（侧边栏面板）
- 使用 Chrome Side Panel API（`sidePanel` 权限）
- 在浏览器侧边栏中显示，快捷键 `Alt+L`
- 提供三种布局模式：紧凑、卡片、树形
- 展示当前窗口的标签页和标签组
- 支持右键上下文菜单（移动分组、复制链接、关闭其他标签等）
- 支持标签组操作（创建、重命名、改色、折叠/展开、取消分组）
- 显示最近关闭的标签页并支持一键恢复
- 通过 `useSidebarSettings` hook 将设置持久化到 `chrome.storage.sync`

### 4. Popup
- 点击扩展图标弹出
- 提供快速访问搜索和分类功能
- 纯 React 组件

### 5. Options
- 保存用户设置到 Chrome Storage
- 提供主题、搜索选项、侧边栏设置等配置项
- 包含 AI 分类设置（API 端点、Key、模型）
- 包含快捷键配置

## 消息通信流程
```
┌─────────────┐  Ctrl+Shift+Z / Alt+L   ┌─────────────┐
│   Browser   │ ─────────────────────▶ │  Background  │
└─────────────┘                         └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────┐
                    │                          │                      │
                    │ chrome.tabs.sendMessage  │ chrome.sidePanel     │ chrome.runtime
                    ▼                          ▼ .open()             │ .openOptionsPage()
             ┌─────────────┐          ┌─────────────┐       ┌──────────────┐
             │   Content   │          │  Sidepanel  │       │   Options    │
             │   Script    │          │   (Sidebar) │       │   Page       │
             └──────┬──────┘          └──────┬──────┘       └──────────────┘
                    │                        │
                    │ React render           │ React render
                    ▼                        ▼
             ┌─────────────┐          ┌─────────────┐
             │SearchPanel /│          │Sidebar App  │
             │Classification│         │ - Compact   │
             │  Component  │          │ - Card      │
             └─────────────┘          │ - Tree      │
                                      └─────────────┘
```

## 快捷键配置
| 功能 | Windows/Linux | macOS | 说明 |
|------|---------------|-------|------|
| 切换搜索面板 | Ctrl+Shift+Z | Cmd+Shift+Z | 在当前网页打开搜索面板 |
| 切换侧边栏 | Alt+L | Alt+L | 打开/关闭 Chrome 侧边栏面板 |

## 开发命令
```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 生产构建
npm run build

# 类型检查
npm run typecheck
```

## 构建输出
```
dist/
├── manifest.json
├── service-worker-loader.js
├── icons/
├── src/
│   ├── popup/index.html
│   ├── sidepanel/index.html
│   └── options/index.html
└── assets/
    ├── client-C8RhVn0h.js    # React 运行时
    ├── index.tsx-*.js        # Content script
    ├── index.ts-*.js         # Background script
    ├── main.tsx-*.js         # Sidepanel app
    └── App.css-*.js          # Sidepanel styles
```
