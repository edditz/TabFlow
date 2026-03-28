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
- **无缝切换**：分类面板与搜索面板共用同一容器，切换流畅

## 使用方法

### 基本使用

1. 打开搜索面板（快捷键 `Ctrl+Shift+A` / `Cmd+Shift+A`）
2. 点击右上角的「智能分类」按钮
3. 查看分类预览结果
4. 点击「创建标签组」确认执行

### 返回搜索

- 在分类面板左上角点击「返回搜索」按钮
- 可随时在搜索和分类之间切换

### 配置 AI 分类（可选）

1. 进入扩展设置页面（点击扩展图标 → 设置）
2. 找到「AI 分类设置」区块
3. 启用「启用 AI 智能分类」
4. 配置 API 端点和 API Key
5. 点击「测试连接」验证配置

## 架构设计

### 整体流程

```
┌─────────────────────────────────────────────────────────────┐
│                      Panel Container                         │
│                   (.tt-overlay + .tt-container)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   SearchPanel  ──点击「智能分类」──▶  ClassificationPanel   │
│       │                                    │                │
│       │◀───────点击「返回」───────────────│                │
│       │                                    │                │
│       │                              点击「创建标签组」      │
│       │                                    │                │
│       │                                    ▼                │
│       │                          Background Service         │
│       │                           chrome.tabs.group()       │
│       │                                    │                │
│       │                                    ▼                │
│       │                          Chrome Tab Groups 创建完成 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### UI 切换机制

- **统一容器**：SearchPanel 和 ClassificationPanel 共用同一个 `.tt-overlay` 和 `.tt-container`
- **无重建切换**：切换视图时只更换内部内容，外部容器保持不变
- **平滑过渡**：避免闪烁和重新渲染

### 文件结构

```
src/
├── classification/
│   ├── index.ts           # 模块导出
│   ├── types.ts           # 类型定义
│   ├── rules.ts           # 内置分类规则
│   ├── classifier.ts      # 分类引擎
│   └── ai-service.ts      # AI API 调用服务
├── content/
│   ├── index.tsx          # 面板容器管理、视图切换
│   └── components/
│       ├── SearchPanel.tsx        # 搜索面板（内部内容）
│       ├── ClassificationPanel.tsx # 分类预览面板（内部内容）
│       └── ClassificationPanel.css # 分类面板样式
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

interface ClassificationResult {
  groups: CategoryGroup[]
  unclassifiedTabs: TabInfo[]
}
```

### 2. 内置分类规则 (rules.ts)

| 分类 | 匹配规则（域名/关键词） |
|------|------------------------|
| 工作 | jira, confluence, notion, slack, teams, zoom, linear, asana, monday, trello, clickup |
| 开发 | github, gitlab, bitbucket, stackoverflow, npmjs, pypi, docker, vercel, netlify, codepen, codesandbox, stackblitz, dev.to |
| 社交 | twitter, x.com, facebook, instagram, linkedin, reddit, weibo, discord, telegram, whatsapp, messenger |
| 购物 | amazon, taobao, jd.com, ebay, shopify, temu, pinduoduo, aliexpress, walmart, target |
| 娱乐 | youtube, bilibili, netflix, spotify, twitch, tiktok, douyin, iqiyi, youku, hulu, disneyplus, hbo |
| 新闻 | news.*, bbc, cnn, nytimes, theverge, techcrunch, reuters, guardian, wsj, bloomberg, medium, substack |
| 文档 | docs.*, documentation.*, google docs/sheets/slides, office.com, sharepoint, dropbox, drive.google |

### 3. 分类引擎 (classifier.ts)

```typescript
async function classifyTabs(tabs: TabInfo[]): Promise<ClassificationResult> {
  // 1. 先用内置规则匹配
  for (const tab of tabs) {
    const category = matchRule(tab)
    if (category) {
      ruleClassified.set(tab.id, category)
    } else {
      unmatchedTabs.push(tab)
    }
  }

  // 2. 未匹配的标签用 AI 分类（如果启用）
  if (aiSettings.enabled && aiSettings.apiKey && unmatchedTabs.length > 0) {
    aiClassified = await classifyTabsWithAI(unmatchedTabs, aiSettings)
  }

  // 3. 合并结果并分组
  // 4. 未分类的归入「Other」
  // 5. 按标签数量排序（大组在前）
}
```

### 4. ClassificationPanel 组件

面板状态：
- `loading` - 正在分析标签
- `ai-warning` - AI 未配置警告（有未分类标签时）
- `preview` - 显示分类预览
- `empty` - 无标签可分类

组件结构：
```tsx
<>
  {/* Header */}
  <div className="tt-header">
    <button className="tt-back-btn">返回搜索</button>
    <h2>智能分类</h2>
    <button className="tt-close-btn">关闭</button>
  </div>

  {/* Content */}
  <div className="tt-search-content">
    {/* loading / ai-warning / preview / empty */}
  </div>

  {/* Footer */}
  <div className="tt-footer">
    <button>取消</button>
    <button>创建标签组</button>
  </div>
</>
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

## 面板切换流程

```
index.tsx (容器管理)
    │
    ├── currentView: 'search' | 'classification'
    │
    └── render() 渲染统一容器
            │
            ├── currentView === 'search'
            │       └── <SearchPanel ... />
            │
            └── currentView === 'classification'
                    └── <ClassificationPanel ... />
```

切换视图时：
1. 更新 `currentView` 状态
2. 调用 `render()` 重新渲染容器内容
3. 容器本身保持不变，只有内部内容切换

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| AI 未配置 | 显示警告提示，可选择继续分类或前往设置 |
| API 调用失败 | 降级为规则分类，未分类归入「Other」 |
| API 超时 | 10 秒超时，超时后降级 |
| 无标签可分类 | 显示「没有需要分类的标签」提示 |

## 国际化

支持以下语言的完整翻译：
- English (en)
- 中文 (zh)

翻译键位于 `src/i18n/translations.ts`，前缀为：
- `smartClassify` - 智能分类
- `backToSearch` - 返回搜索
- `analyzing` - 正在分析
- `aiNotConfigured` - AI 未配置
- `aiNotConfiguredDesc` - AI 未配置描述
- `classifyAnyway` - 仍要分类
- `goToSettings` - 去设置
- `createTabGroups` - 创建标签组
- `cancel` - 取消
- `noTabsToClassify` - 没有需要分类的标签
- `categoryWork` - 工作
- `categoryDevelopment` - 开发
- `categorySocial` - 社交
- `categoryShopping` - 购物
- `categoryEntertainment` - 娱乐
- `categoryNews` - 新闻
- `categoryDocs` - 文档
- `categoryOther` - 其他

## 相关文档

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 项目架构说明
- [I18N.md](./I18N.md) - 国际化实现文档
- [THEME.md](./THEME.md) - 深浅色主题功能
