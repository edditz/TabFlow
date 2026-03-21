# 组件知识库

本目录收录项目中使用的各类组件和工具的详细文档。

## 文档列表

| 文档 | 说明 |
|------|------|
| [Agentation 接入指南](./components/AGENTATION.md) | 可视化标注工具，帮助 AI 编程助手理解用户想要修改的页面元素 |
| [快捷键录入组件](./components/SHORTCUT_RECORDER.md) | 用于让用户自定义设置快捷键的组件 |

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

---

> 如需添加新的组件文档，请将文档放入 `docs/components/` 目录，并更新本索引。
