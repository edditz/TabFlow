# TabFlow

[English](./README.md) | **中文**

一款增强标签页管理的浏览器扩展，支持 Chrome 和 Edge。

## 功能特性

- **全局搜索面板**：跨所有打开的标签页快速搜索，支持按标题、URL 或域名实时过滤
- **侧边栏标签管理器**：Chrome 侧边栏面板，提供紧凑、卡片、树形三种布局，用于浏览和管理打开的标签页、标签组和最近关闭的标签页
- **最近关闭标签**：恢复最近关闭的标签页，可配置时间窗口和结果数量上限
- **丰富的设置选项**：主题（浅色/深色/跟随系统）、语言（中/英）、搜索范围、URL 显示样式等
- **自定义快捷键**：用户可自定义快捷键，支持 Mac 符号显示和冲突检测
- **国际化支持**：完整的中英文界面，支持实时语言切换
- **主题系统**：浅色、深色、跟随系统三种主题，使用 Shadow DOM 实现样式隔离
- **跨浏览器支持**：支持 Chrome 和 Edge

## 开发

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装

```bash
# 安装依赖
npm install

# 启动开发服务器（热重载）
npm run dev

# 生产构建
npm run build
```

### 代码质量

```bash
# 运行 ESLint 检查
npm run lint

# 运行 ESLint 并自动修复
npm run lint:fix

# 使用 Prettier 格式化代码
npm run format
```

### 加载扩展

#### Chrome

1. 打开 `chrome://extensions/`
2. 开启右上角的「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择 `dist` 文件夹

#### Edge

1. 打开 `edge://extensions/`
2. 开启左侧面板的「开发人员模式」
3. 点击「加载解压缩的扩展」
4. 选择 `dist` 文件夹

### 快捷键

| 功能 | Windows/Linux | macOS |
|------|--------------|-------|
| 切换搜索面板 | `Ctrl+Shift+Z` | `Cmd+Shift+Z` |
| 切换侧边栏 | `Alt+L` | `Alt+L` |
| 打开扩展弹窗 | `Ctrl+Shift+Y` | `Cmd+Shift+Y` |

## 项目结构

```
tabflow/
├── src/
│   ├── background/     # Service Worker（后台脚本）
│   ├── content/        # 内容脚本（注入到网页）
│   ├── popup/          # 扩展弹窗
│   ├── sidepanel/      # 侧边栏面板（标签页管理器）
│   ├── options/        # 设置页面
│   ├── i18n/           # 国际化
│   └── shared/         # 共享工具
├── icons/              # 扩展图标
├── manifest.json       # 扩展清单（MV3）
├── vite.config.ts      # Vite 配置
└── tsconfig.json       # TypeScript 配置
```

## 技术栈

- [React](https://react.dev/) - UI 框架
- [Vite](https://vitejs.dev/) - 构建工具
- [CRXJS](https://crxjs.dev/) - Vite 的 Chrome 扩展支持
- [TypeScript](https://www.typescriptlang.org/) - 类型安全

## 许可证

MIT
