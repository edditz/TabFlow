# Tab Tool - 浏览器标签管理扩展

## 项目说明
一个用于增强 Chrome 和 Edge 浏览器标签页管理功能的扩展。

## 开发指南

### 常用命令
```bash
npm run dev      # 开发模式（热重载）
npm run build    # 生产构建
```

### 加载扩展
1. 运行 `npm run dev` 生成 `dist` 目录
2. Chrome: `chrome://extensions` → 开启开发者模式 → 加载已解压的扩展程序 → 选择 `dist` 文件夹
3. Edge: `edge://extensions` → 开启开发者模式 → 加载解压缩的扩展 → 选择 `dist` 文件夹

### 快捷键
| 功能 | Windows/Linux | macOS |
|------|---------------|-------|
| 搜索面板 | Ctrl+Shift+Z | Cmd+Shift+Z |

## 架构文档
详细的项目架构说明请参考 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 代码规范
- 遵循 `.claude/rules/git-workflow.md` 中的 Git 工作流规范
- 使用 Conventional Commits 格式提交代码
