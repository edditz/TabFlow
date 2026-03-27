# 智能标签分类功能 (Smart Tab Classification)

## 概述

智能标签分类功能允许用户一键将所有打开的标签按类型整理到 Chrome Tab Groups 中，通过内置规则和可选 AI 的混合模式实现智能分类。

## 功能特性

- **混合分类模式**：内置规则优先匹配 + AI 智能补充
- **7 大内置分类**：工作、开发、社交、购物、娱乐、新闻、文档
- **开放式 AI 支持**：兼容任意 OpenAI 格式 API 端点
- **可视化预览**：分类前预览结果，用户确认后执行
- **Chrome Tab Groups**：使用浏览器原生标签组功能
- **中英文支持**：完整的国际化支持

## 使用方法

### 基本使用

1. 打开搜索面板（快捷键 `Ctrl+Shift+F` / `Cmd+Shift+F`）
2. 点击右上角的「智能分类」按钮
3. 查看分类预览结果
4. 点击「创建标签组」确认执行

### 配置 AI 分类（可选）

1. 进入扩展设置页面
2. 找到「AI 分类设置」区块
3. 启用「启用 AI 智能分类」
4. 配置 API 端点和 API Key
5. 点击「测试连接」验证配置

## 架构设计

### 整体流程

```
SearchPanel
    │ 点击「智能分类」
    ▼
ClassificationPanel（预览）
    │ 规则匹配 + AI 补充
    ▼
用户确认
    │ 点击「创建标签组」
    ▼
Background Service
    │ chrome.tabs.group()
    ▼
Chrome Tab Groups 创建完成
```

### 文件结构

```
src/
├── classification/
│   ├── index.ts           # 模块导出
│   ├── types.ts           # 类型定义
│   ├── rules.ts           # 内置分类规则
│   ├── classifier.ts      # 分类引擎
│   └── ai-service.ts      # AI API 调用服务
├── content/components/
│   ├── ClassificationPanel.tsx   # 分类预览面板
│   └── ClassificationPanel.css   # 面板样式
└── options/components/
    └── AISettings.tsx            # AI 配置组件
```

## 核心模块

### 1. 类型定义 (types.ts)

```typescript
interface TabInfo {
  id: number
  title: string
  url: string
  favIconUrl?: string
}

interface CategoryGroup {
  name: string
  tabs: TabInfo[]
  color: chrome.tabGroups.ColorEnum
}

interface AISettings {
  enabled: boolean
  endpoint: string
  apiKey: string
  model: string
}
```

### 2. 内置分类规则 (rules.ts)

| 分类 | 匹配规则（域名） |
|------|-----------------|
| 工作 | jira, confluence, notion, slack, teams, zoom, linear, asana |
| 开发 | github, gitlab, stackoverflow, npmjs, docker, vercel, netlify |
| 社交 | twitter, facebook, instagram, linkedin, reddit, discord |
| 购物 | amazon, taobao, jd, ebay, shopify, temu |
| 娱乐 | youtube, bilibili, netflix, spotify, twitch, tiktok |
| 新闻 | bbc, cnn, nytimes, theverge, techcrunch, bloomberg |
| 文档 | docs.*, notion, google docs, office.com |

### 3. AI 服务 (ai-service.ts)

- **getAISettings()**: 从 chrome.storage 获取 AI 配置
- **saveAISettings()**: 保存 AI 配置
- **testAIConnection()**: 测试 API 连接
- **classifyTabsWithAI()**: 调用 AI 对标签进行分类

### 4. 分类引擎 (classifier.ts)

```typescript
async function classifyTabs(tabs: TabInfo[]): Promise<ClassificationResult> {
  // 1. 先用内置规则匹配
  // 2. 未匹配的标签用 AI 分类（如果启用）
  // 3. 合并结果并分组
  // 4. 按标签数量排序
}
```

## AI 配置说明

### 支持的 API 端点

任何兼容 OpenAI Chat Completions API 的端点：

- **OpenAI**: `https://api.openai.com/v1`
- **Azure OpenAI**: `https://YOUR_RESOURCE.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT`
- **Claude (通过适配器)**: 使用 OpenAI 兼容代理
- **本地模型**: Ollama, LM Studio 等
- **国产模型**: 通义千问、文心一言等（需 OpenAI 兼容接口）

### 推荐模型

- `gpt-3.5-turbo` - 速度快、成本低
- `gpt-4` - 准确度更高
- `claude-3-haiku-20240307` - Anthropic 快速模型

### 安全考虑

- API Key 存储在 `chrome.storage.sync`（Chrome 会加密同步）
- 发送请求时只传递标题和 URL，不传递页面内容
- 用户可随时禁用 AI 功能，仅使用内置规则

## Tab Groups 颜色分配

| 分类 | 颜色 |
|------|------|
| 工作 | blue |
| 开发 | purple |
| 社交 | pink |
| 购物 | green |
| 娱乐 | red |
| 新闻 | yellow |
| 文档 | cyan |
| 其他 | grey |

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| AI 未配置 | 显示警告，可继续使用规则分类 |
| API 调用失败 | 降级为规则分类，未分类归入「其他」 |
| API 超时 | 10 秒超时，超时后降级 |
| 无标签可分类 | 显示提示信息 |

## 国际化

支持以下语言的完整翻译：
- English (en)
- 中文 (zh)

翻译键位于 `src/i18n/translations.ts`，前缀为：
- `aiSettings.*` - AI 设置相关
- `category*` - 分类名称
- `smartClassify` 等 - 分类功能相关

## 相关文档

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 项目架构说明
- [I18N.md](./I18N.md) - 国际化实现文档
- [THEME.md](./THEME.md) - 深浅色主题功能
