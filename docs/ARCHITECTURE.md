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
│   └── options/             # 设置页面
│       ├── index.html
│       ├── main.tsx         # React 入口
│       └── App.tsx          # 设置页主组件
│
├── icons/                   # 扩展图标
├── manifest.json           # 扩展清单（Manifest V3）
├── vite.config.ts          # Vite 配置
└── tsconfig.json           # TypeScript 配置
```

## 核心模块说明

### 1. Background (Service Worker)
- 监听键盘快捷键命令 `toggle-search-panel`
- 向活动标签页发送消息以切换搜索面板
- 处理来自 content script 和 popup 的消息

### 2. Content Script
- 注入到所有网页
- 监听 `Ctrl+Shift+Z` 快捷键
- 渲染 React 搜索面板组件
- 接收来自 background 的消息

### 3. Popup
- 点击扩展图标弹出
- 提供快速访问搜索和设置功能
- 纯 React 组件

- 保存用户设置到 Chrome Storage
- 提供主题、搜索选项等配置项

## 消息通信流程
```
┌─────────────┐     Ctrl+Shift+Z      ┌─────────────┐
│   Browser   │ ──────────────────▶ │  Background  │
└─────────────┘                       └──────┬──────┘
                                             │
                                             │ chrome.tabs.sendMessage
                                             ▼
                                      ┌─────────────┐
                                      │   Content   │
                                      │   Script    │
                                      └──────┬──────┘
                                             │
                                             │ React render
                                             ▼
                                      ┌─────────────┐
                                      │SearchPanel  │
                                      │  Component  │
                                      └─────────────┘
```

## 快捷键配置
| 功能 | Windows/Linux | macOS |
|------|---------------|-------|
| 切换搜索面板 | Ctrl+Shift+Z | Cmd+Shift+Z |

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
│   └── options/index.html
└── assets/
    ├── client-C8RhVn0h.js    # React 运行时
    ├── index.tsx-*.js        # Content script
    └── index.ts-*.js         # Background script
```
