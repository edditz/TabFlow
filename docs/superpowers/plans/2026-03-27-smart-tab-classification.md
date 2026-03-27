# 智能标签分类功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Tab Tool 添加智能标签分类功能，一键将所有打开的标签按类型整理到 Chrome Tab Groups 中。

**Architecture:** 混合分类模式（内置规则 + AI 补充），在 SearchPanel 添加入口，弹出 ClassificationPanel 预览分类结果，确认后通过 Background Service 创建 Tab Groups。

**Tech Stack:** React, TypeScript, Chrome Extension APIs (tabs, tabGroups, storage), OpenAI-compatible API

---

## 文件结构

```
src/
├── classification/
│   ├── index.ts                 # 模块导出
│   ├── types.ts                 # 类型定义
│   ├── rules.ts                 # 内置分类规则
│   ├── classifier.ts            # 分类引擎（规则 + AI）
│   └── ai-service.ts            # AI API 调用服务
├── content/components/
│   ├── ClassificationPanel.tsx  # 分类预览面板组件
│   └── ClassificationPanel.css  # 面板样式
├── options/components/
│   └── AISettings.tsx           # AI API 配置组件
├── i18n/
│   └── translations.ts          # 新增翻译键
├── options/
│   └── App.tsx                  # 添加 AI 配置区块
├── background/
│   └── index.ts                 # 添加 Tab Groups 消息处理
└── content/components/
    └── SearchPanel.tsx          # 添加智能分类按钮
```

---

## Task 1: 类型定义和翻译

**Files:**
- Create: `src/classification/types.ts`
- Create: `src/classification/index.ts`
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
// src/classification/types.ts

export interface TabInfo {
  id: number
  title: string
  url: string
  favIconUrl?: string
}

export interface ClassifiedTab {
  tab: TabInfo
  category: string
}

export interface CategoryGroup {
  name: string
  tabs: TabInfo[]
  color: chrome.tabGroups.ColorEnum
}

export interface AISettings {
  enabled: boolean
  endpoint: string
  apiKey: string
  model: string
}

export interface ClassificationResult {
  groups: CategoryGroup[]
  unclassifiedTabs: TabInfo[]
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  enabled: false,
  endpoint: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-3.5-turbo'
}

export const CATEGORY_COLORS: chrome.tabGroups.ColorEnum[] = [
  'grey',
  'blue',
  'red',
  'yellow',
  'green',
  'pink',
  'purple',
  'cyan'
]
```

- [ ] **Step 2: 创建模块导出文件**

```typescript
// src/classification/index.ts
export * from './types'
export { classifyTabs } from './classifier'
export { getAISettings, saveAISettings, testAIConnection } from './ai-service'
```

- [ ] **Step 3: 添加翻译键到 TranslationKeys 接口**

在 `src/i18n/translations.ts` 的 `TranslationKeys` 接口中添加：

```typescript
  // AI Classification Settings
  aiSettings: string
  enableAiClassification: string
  enableAiClassificationDesc: string
  apiEndpoint: string
  apiEndpointHint: string
  apiKey: string
  apiKeyPlaceholder: string
  modelName: string
  modelNameHint: string
  testConnection: string
  connectionSuccess: string
  connectionFailed: string

  // Smart Classification
  smartClassify: string
  analyzing: string
  aiNotConfigured: string
  aiNotConfiguredDesc: string
  classifyAnyway: string
  goToSettings: string
  createTabGroups: string
  cancel: string
  noTabsToClassify: string
  allTabsClassified: string
  classificationComplete: string

  // Category names
  categoryWork: string
  categoryDevelopment: string
  categorySocial: string
  categoryShopping: string
  categoryEntertainment: string
  categoryNews: string
  categoryDocs: string
  categoryOther: string
```

- [ ] **Step 4: 添加英文翻译**

在 `translations` 对象的 `en` 部分添加：

```typescript
    // AI Classification Settings
    aiSettings: 'AI Classification Settings',
    enableAiClassification: 'Enable AI Smart Classification',
    enableAiClassificationDesc: 'Use AI to classify tabs that don\'t match built-in rules',
    apiEndpoint: 'API Endpoint',
    apiEndpointHint: 'Supports any OpenAI-compatible endpoint',
    apiKey: 'API Key',
    apiKeyPlaceholder: 'Enter your API key',
    modelName: 'Model Name',
    modelNameHint: 'Common: gpt-3.5-turbo, gpt-4, claude-3-haiku-20240307',
    testConnection: 'Test Connection',
    connectionSuccess: 'Connection successful',
    connectionFailed: 'Connection failed',

    // Smart Classification
    smartClassify: 'Smart Classify',
    analyzing: 'Analyzing tabs...',
    aiNotConfigured: 'AI Not Configured',
    aiNotConfiguredDesc: 'Will use built-in rules only. Some tabs may not be accurately categorized.',
    classifyAnyway: 'Classify Anyway',
    goToSettings: 'Go to Settings',
    createTabGroups: 'Create Tab Groups',
    cancel: 'Cancel',
    noTabsToClassify: 'No tabs to classify',
    allTabsClassified: 'All tabs are already classified',
    classificationComplete: 'Classification complete!',

    // Category names
    categoryWork: 'Work',
    categoryDevelopment: 'Development',
    categorySocial: 'Social',
    categoryShopping: 'Shopping',
    categoryEntertainment: 'Entertainment',
    categoryNews: 'News',
    categoryDocs: 'Docs',
    categoryOther: 'Other'
```

- [ ] **Step 5: 添加中文翻译**

在 `translations` 对象的 `zh` 部分添加：

```typescript
    // AI Classification Settings
    aiSettings: 'AI 分类设置',
    enableAiClassification: '启用 AI 智能分类',
    enableAiClassificationDesc: '使用 AI 对不匹配内置规则的标签进行分类',
    apiEndpoint: 'API 端点',
    apiEndpointHint: '支持任意 OpenAI 兼容端点',
    apiKey: 'API Key',
    apiKeyPlaceholder: '输入您的 API 密钥',
    modelName: '模型名称',
    modelNameHint: '常用: gpt-3.5-turbo, gpt-4, claude-3-haiku-20240307',
    testConnection: '测试连接',
    connectionSuccess: '连接成功',
    connectionFailed: '连接失败',

    // Smart Classification
    smartClassify: '智能分类',
    analyzing: '正在分析标签...',
    aiNotConfigured: 'AI 未配置',
    aiNotConfiguredDesc: '将仅使用内置规则进行分类，部分标签可能无法准确归类。',
    classifyAnyway: '仍要分类',
    goToSettings: '去设置',
    createTabGroups: '创建标签组',
    cancel: '取消',
    noTabsToClassify: '没有需要分类的标签',
    allTabsClassified: '所有标签已分类',
    classificationComplete: '分类完成！',

    // Category names
    categoryWork: '工作',
    categoryDevelopment: '开发',
    categorySocial: '社交',
    categoryShopping: '购物',
    categoryEntertainment: '娱乐',
    categoryNews: '新闻',
    categoryDocs: '文档',
    categoryOther: '其他'
```

- [ ] **Step 6: 提交**

```bash
git add src/classification/types.ts src/classification/index.ts src/i18n/translations.ts
git commit -m "feat: add classification types and i18n translations"
```

---

## Task 2: 内置分类规则

**Files:**
- Create: `src/classification/rules.ts`

- [ ] **Step 1: 创建分类规则文件**

```typescript
// src/classification/rules.ts
import type { TabInfo } from './types'

export interface CategoryRule {
  name: string
  nameKey: string // i18n key
  patterns: RegExp[]
}

export const CATEGORY_RULES: CategoryRule[] = [
  {
    name: 'Work',
    nameKey: 'categoryWork',
    patterns: [
      /jira\./i,
      /confluence\./i,
      /notion\./i,
      /slack\./i,
      /teams\./i,
      /zoom\./i,
      /linear\./i,
      /asana\./i,
      /monday\./i,
      /trello\./i,
      /clickup\./i
    ]
  },
  {
    name: 'Development',
    nameKey: 'categoryDevelopment',
    patterns: [
      /github\./i,
      /gitlab\./i,
      /bitbucket\./i,
      /stackoverflow\./i,
      /npmjs\./i,
      /pypi\./i,
      /docker\./i,
      /vercel\./i,
      /netlify\./i,
      /codepen\./i,
      /codesandbox\./i,
      /stackblitz\./i,
      /dev\.to/i
    ]
  },
  {
    name: 'Social',
    nameKey: 'categorySocial',
    patterns: [
      /twitter\./i,
      /x\.com/i,
      /facebook\./i,
      /instagram\./i,
      /linkedin\./i,
      /reddit\./i,
      /weibo\./i,
      /discord\./i,
      /telegram\./i,
      /whatsapp\./i,
      /messenger\./i
    ]
  },
  {
    name: 'Shopping',
    nameKey: 'categoryShopping',
    patterns: [
      /amazon\./i,
      /taobao\./i,
      /jd\.com/i,
      /ebay\./i,
      /shopify\./i,
      /temu\./i,
      /pinduoduo\./i,
      /aliexpress\./i,
      /walmart\./i,
      /target\./i
    ]
  },
  {
    name: 'Entertainment',
    nameKey: 'categoryEntertainment',
    patterns: [
      /youtube\./i,
      /bilibili\./i,
      /netflix\./i,
      /spotify\./i,
      /twitch\./i,
      /tiktok\./i,
      /douyin\./i,
      /iqiyi\./i,
      /youku\./i,
      /hulu\./i,
      /disneyplus\./i,
      /hbo\./i
    ]
  },
  {
    name: 'News',
    nameKey: 'categoryNews',
    patterns: [
      /news\./i,
      /bbc\./i,
      /cnn\./i,
      /nytimes\./i,
      /theverge\./i,
      /techcrunch\./i,
      /reuters\./i,
      /guardian\./i,
      /wsj\./i,
      /bloomberg\./i,
      /medium\./i,
      /substack\./i
    ]
  },
  {
    name: 'Docs',
    nameKey: 'categoryDocs',
    patterns: [
      /docs\./i,
      /documentation\./i,
      /google\.com\/docs/i,
      /google\.com\/sheets/i,
      /google\.com\/slides/i,
      /office\.com/i,
      /sharepoint\./i,
      /dropbox\./i,
      /drive\.google\./i
    ]
  }
]

export function matchRule(tab: TabInfo): string | null {
  const url = tab.url.toLowerCase()
  const title = tab.title.toLowerCase()

  for (const rule of CATEGORY_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(url) || pattern.test(title)) {
        return rule.name
      }
    }
  }

  return null
}
```

- [ ] **Step 2: 提交**

```bash
git add src/classification/rules.ts
git commit -m "feat: add built-in classification rules"
```

---

## Task 3: AI 服务

**Files:**
- Create: `src/classification/ai-service.ts`

- [ ] **Step 1: 创建 AI 服务文件**

```typescript
// src/classification/ai-service.ts
import type { AISettings, TabInfo } from './types'
import { DEFAULT_AI_SETTINGS } from './types'

export function getAISettings(): Promise<AISettings> {
  return new Promise(resolve => {
    chrome.storage.sync.get({ aiSettings: DEFAULT_AI_SETTINGS }, data => {
      resolve(data.aiSettings as AISettings)
    })
  })
}

export function saveAISettings(settings: AISettings): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ aiSettings: settings }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

export async function testAIConnection(settings: AISettings): Promise<{ success: boolean; error?: string }> {
  if (!settings.apiKey) {
    return { success: false, error: 'API Key is required' }
  }

  try {
    const response = await fetch(`${settings.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      }),
      signal: AbortSignal.timeout(10000)
    })

    if (response.ok) {
      return { success: true }
    } else {
      const error = await response.text()
      return { success: false, error: `HTTP ${response.status}: ${error}` }
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

interface AIClassificationResponse {
  [index: string]: string
}

export async function classifyTabsWithAI(tabs: TabInfo[], settings: AISettings): Promise<Map<number, string>> {
  const result = new Map<number, string>()

  if (!settings.enabled || !settings.apiKey || tabs.length === 0) {
    return result
  }

  const tabList = tabs.map((tab, index) => `${index + 1}. [${tab.title}] - ${tab.url}`).join('\n')

  const prompt = `你是一个标签分类助手。根据以下标签的标题和URL，返回最合适的分类。
分类只能是以下之一：Work, Development, Social, Shopping, Entertainment, News, Docs, Other
只返回 JSON 格式，不要解释。

标签列表:
${tabList}

输出格式（JSON）:
{"1": "分类名", "2": "分类名", ...}`

  try {
    const response = await fetch(`${settings.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.3
      }),
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      console.error('[Tab Tool] AI classification failed:', response.status)
      return result
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return result
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    const classifications: AIClassificationResponse = JSON.parse(jsonStr)

    for (const [index, category] of Object.entries(classifications)) {
      const tabIndex = parseInt(index, 10) - 1
      if (tabIndex >= 0 && tabIndex < tabs.length) {
        result.set(tabs[tabIndex].id, category)
      }
    }

    return result
  } catch (error) {
    console.error('[Tab Tool] AI classification error:', error)
    return result
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/classification/ai-service.ts
git commit -m "feat: add AI service for tab classification"
```

---

## Task 4: 分类引擎

**Files:**
- Create: `src/classification/classifier.ts`

- [ ] **Step 1: 创建分类引擎文件**

```typescript
// src/classification/classifier.ts
import type { TabInfo, CategoryGroup, ClassificationResult, AISettings } from './types'
import { CATEGORY_COLORS } from './types'
import { matchRule } from './rules'
import { classifyTabsWithAI, getAISettings } from './ai-service'

function getCategoryColor(category: string, index: number): chrome.tabGroups.ColorEnum {
  // Map category names to preferred colors
  const colorMap: Record<string, chrome.tabGroups.ColorEnum> = {
    Work: 'blue',
    Development: 'purple',
    Social: 'pink',
    Shopping: 'green',
    Entertainment: 'red',
    News: 'yellow',
    Docs: 'cyan',
    Other: 'grey'
  }

  return colorMap[category] || CATEGORY_COLORS[index % CATEGORY_COLORS.length]
}

export async function classifyTabs(tabs: TabInfo[]): Promise<ClassificationResult> {
  const aiSettings = await getAISettings()

  // First pass: match with built-in rules
  const ruleClassified = new Map<number, string>()
  const unmatchedTabs: TabInfo[] = []

  for (const tab of tabs) {
    const category = matchRule(tab)
    if (category) {
      ruleClassified.set(tab.id, category)
    } else {
      unmatchedTabs.push(tab)
    }
  }

  // Second pass: use AI for unmatched tabs
  let aiClassified = new Map<number, string>()
  if (aiSettings.enabled && aiSettings.apiKey && unmatchedTabs.length > 0) {
    aiClassified = await classifyTabsWithAI(unmatchedTabs, aiSettings)
  }

  // Merge results
  const allClassified = new Map<number, string>()
  for (const [tabId, category] of ruleClassified) {
    allClassified.set(tabId, category)
  }
  for (const [tabId, category] of aiClassified) {
    allClassified.set(tabId, category)
  }

  // Group tabs by category
  const categoryMap = new Map<string, TabInfo[]>()
  const unclassifiedTabs: TabInfo[] = []

  for (const tab of tabs) {
    const category = allClassified.get(tab.id)
    if (category) {
      if (!categoryMap.has(category)) {
        categoryMap.set(category, [])
      }
      categoryMap.get(category)!.push(tab)
    } else {
      unclassifiedTabs.push(tab)
    }
  }

  // Add unclassified tabs to "Other" category
  if (unclassifiedTabs.length > 0) {
    categoryMap.set('Other', unclassifiedTabs)
  }

  // Convert to CategoryGroup array
  const groups: CategoryGroup[] = []
  let colorIndex = 0

  for (const [name, groupTabs] of categoryMap) {
    groups.push({
      name,
      tabs: groupTabs,
      color: getCategoryColor(name, colorIndex)
    })
    colorIndex++
  }

  // Sort groups by size (largest first)
  groups.sort((a, b) => b.tabs.length - a.tabs.length)

  return {
    groups,
    unclassifiedTabs: []
  }
}
```

- [ ] **Step 2: 更新模块导出**

更新 `src/classification/index.ts`：

```typescript
// src/classification/index.ts
export * from './types'
export { classifyTabs } from './classifier'
export { getAISettings, saveAISettings, testAIConnection } from './ai-service'
export { matchRule, CATEGORY_RULES } from './rules'
```

- [ ] **Step 3: 提交**

```bash
git add src/classification/classifier.ts src/classification/index.ts
git commit -m "feat: add classification engine combining rules and AI"
```

---

## Task 5: Background Service - Tab Groups 支持

**Files:**
- Modify: `src/background/index.ts`

- [ ] **Step 1: 添加 Tab Groups 消息处理**

在 `src/background/index.ts` 的 `chrome.runtime.onMessage.addListener` 中添加新的消息类型处理：

```typescript
  if (message.type === 'CLASSIFY_TABS') {
    // Get all tabs in current window
    chrome.tabs.query({ currentWindow: true }, async tabs => {
      try {
        // Group tabs by category
        const categoryMap = new Map<string, number[]>()

        for (const group of message.groups) {
          const tabIds = group.tabs.map((tab: { id: number }) => tab.id)
          categoryMap.set(group.name, tabIds)
        }

        // Create tab groups
        const createdGroups: { name: string; groupId: number }[] = []

        for (const [category, tabIds] of categoryMap) {
          if (tabIds.length > 0) {
            const groupId = await chrome.tabs.group({ tabIds })
            await chrome.tabGroups.update(groupId, {
              title: category,
              color: getCategoryColor(category)
            })
            createdGroups.push({ name: category, groupId })
          }
        }

        sendResponse({ success: true, groups: createdGroups })
      } catch (error) {
        console.error('[Tab Tool] Error creating tab groups:', error)
        sendResponse({ success: false, error: String(error) })
      }
    })
    return true // Required for async response
  }
```

- [ ] **Step 2: 添加颜色辅助函数**

在 `src/background/index.ts` 文件顶部添加：

```typescript
// Category color mapping for tab groups
function getCategoryColor(category: string): chrome.tabGroups.ColorEnum {
  const colorMap: Record<string, chrome.tabGroups.ColorEnum> = {
    Work: 'blue',
    Development: 'purple',
    Social: 'pink',
    Shopping: 'green',
    Entertainment: 'red',
    News: 'yellow',
    Docs: 'cyan',
    Other: 'grey'
  }
  return colorMap[category] || 'grey'
}
```

- [ ] **Step 3: 提交**

```bash
git add src/background/index.ts
git commit -m "feat: add tab groups creation support in background service"
```

---

## Task 6: AI 设置组件

**Files:**
- Create: `src/options/components/AISettings.tsx`

- [ ] **Step 1: 创建 AI 设置组件**

```typescript
// src/options/components/AISettings.tsx
import { useState, useEffect, useCallback } from 'react'
import type { AISettings, TranslationKeys } from '../../classification'
import { DEFAULT_AI_SETTINGS } from '../../classification'
import { testAIConnection } from '../../classification'
import { Switch } from './Switch'

interface AISettingsProps {
  settings: AISettings
  onChange: (settings: AISettings) => void
  labels: {
    aiSettings: string
    enableAiClassification: string
    enableAiClassificationDesc: string
    apiEndpoint: string
    apiEndpointHint: string
    apiKey: string
    apiKeyPlaceholder: string
    modelName: string
    modelNameHint: string
    testConnection: string
    connectionSuccess: string
    connectionFailed: string
  }
}

export function AISettings({ settings, onChange, labels }: AISettingsProps) {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTest = useCallback(async () => {
    if (!settings.apiKey) {
      setTestResult({ success: false, message: 'Please enter API key first' })
      return
    }

    setTesting(true)
    setTestResult(null)

    const result = await testAIConnection(settings)
    setTesting(false)

    if (result.success) {
      setTestResult({ success: true, message: labels.connectionSuccess })
    } else {
      setTestResult({ success: false, message: result.error || labels.connectionFailed })
    }
  }, [settings, labels.connectionSuccess, labels.connectionFailed])

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(settings)
    }, 500)
    return () => clearTimeout(timer)
  }, [settings, onChange])

  const updateField = <K extends keyof AISettings>(key: K, value: AISettings[K]) => {
    onChange({ ...settings, [key]: value })
  }

  return (
    <section className="options-section">
      <div className="section-header">
        <svg
          className="section-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
        <h2 className="section-title">{labels.aiSettings}</h2>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <div className="setting-label">{labels.enableAiClassification}</div>
          <div className="setting-desc">{labels.enableAiClassificationDesc}</div>
        </div>
        <Switch checked={settings.enabled} onChange={checked => updateField('enabled', checked)} />
      </div>

      {settings.enabled && (
        <>
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">{labels.apiEndpoint}</div>
              <div className="setting-desc">{labels.apiEndpointHint}</div>
            </div>
            <input
              type="text"
              className="setting-input"
              value={settings.endpoint}
              onChange={e => updateField('endpoint', e.target.value)}
              placeholder={DEFAULT_AI_SETTINGS.endpoint}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">{labels.apiKey}</div>
            </div>
            <input
              type="password"
              className="setting-input"
              value={settings.apiKey}
              onChange={e => updateField('apiKey', e.target.value)}
              placeholder={labels.apiKeyPlaceholder}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">{labels.modelName}</div>
              <div className="setting-desc">{labels.modelNameHint}</div>
            </div>
            <input
              type="text"
              className="setting-input"
              value={settings.model}
              onChange={e => updateField('model', e.target.value)}
              placeholder={DEFAULT_AI_SETTINGS.model}
            />
          </div>

          <div className="setting-item">
            <button
              className="setting-button"
              onClick={handleTest}
              disabled={testing || !settings.apiKey}
            >
              {testing ? 'Testing...' : labels.testConnection}
            </button>
            {testResult && (
              <span className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                {testResult.message}
              </span>
            )}
          </div>
        </>
      )}
    </section>
  )
}
```

- [ ] **Step 2: 添加样式到 App.css**

在 `src/options/App.css` 中添加：

```css
/* AI Settings */
.setting-input {
  width: 100%;
  max-width: 300px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background: var(--input-bg);
  color: var(--foreground);
}

.setting-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.setting-button {
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.setting-button:hover:not(:disabled) {
  background: var(--primary-dark);
}

.setting-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.test-result {
  margin-left: 12px;
  font-size: 13px;
}

.test-result.success {
  color: #10b981;
}

.test-result.error {
  color: #ef4444;
}
```

- [ ] **Step 3: 提交**

```bash
git add src/options/components/AISettings.tsx src/options/App.css
git commit -m "feat: add AI settings component"
```

---

## Task 7: 设置页面集成 AI 配置

**Files:**
- Modify: `src/options/App.tsx`

- [ ] **Step 1: 导入 AI 设置组件**

在 `src/options/App.tsx` 顶部添加导入：

```typescript
import { AISettings as AISettingsComponent } from './components/AISettings'
import type { AISettings } from '../classification'
import { DEFAULT_AI_SETTINGS } from '../classification'
```

- [ ] **Step 2: 扩展 Settings 接口**

在 `Settings` 接口中添加：

```typescript
interface Settings {
  // ... existing fields
  aiSettings: AISettings
}
```

- [ ] **Step 3: 更新默认设置**

在 `DEFAULT_SETTINGS` 中添加：

```typescript
const DEFAULT_SETTINGS: Settings = {
  // ... existing fields
  aiSettings: DEFAULT_AI_SETTINGS
}
```

- [ ] **Step 4: 添加 AI 设置区块**

在 `return` 语句中，在 "Recently Closed Settings" 区块后添加：

```typescript
      {/* AI Classification Settings */}
      <AISettingsComponent
        settings={settings.aiSettings}
        onChange={aiSettings => updateSetting('aiSettings', aiSettings)}
        labels={{
          aiSettings: t.aiSettings,
          enableAiClassification: t.enableAiClassification,
          enableAiClassificationDesc: t.enableAiClassificationDesc,
          apiEndpoint: t.apiEndpoint,
          apiEndpointHint: t.apiEndpointHint,
          apiKey: t.apiKey,
          apiKeyPlaceholder: t.apiKeyPlaceholder,
          modelName: t.modelName,
          modelNameHint: t.modelNameHint,
          testConnection: t.testConnection,
          connectionSuccess: t.connectionSuccess,
          connectionFailed: t.connectionFailed
        }}
      />
```

- [ ] **Step 5: 提交**

```bash
git add src/options/App.tsx
git commit -m "feat: integrate AI settings into options page"
```

---

## Task 8: 分类预览面板组件

**Files:**
- Create: `src/content/components/ClassificationPanel.tsx`
- Create: `src/content/components/ClassificationPanel.css`

- [ ] **Step 1: 创建分类面板组件**

```typescript
// src/content/components/ClassificationPanel.tsx
import { useState, useEffect } from 'react'
import type { TabInfo, CategoryGroup, AISettings } from '../../classification'
import { classifyTabs, DEFAULT_AI_SETTINGS } from '../../classification'
import './ClassificationPanel.css'

interface ClassificationPanelProps {
  tabs: TabInfo[]
  theme: 'light' | 'dark'
  language: 'en' | 'zh'
  onClose: () => void
  onConfirm: (groups: CategoryGroup[]) => void
  labels: {
    analyzing: string
    aiNotConfigured: string
    aiNotConfiguredDesc: string
    classifyAnyway: string
    goToSettings: string
    createTabGroups: string
    cancel: string
    noTabsToClassify: string
    categoryWork: string
    categoryDevelopment: string
    categorySocial: string
    categoryShopping: string
    categoryEntertainment: string
    categoryNews: string
    categoryDocs: string
    categoryOther: string
  }
}

type PanelState = 'loading' | 'ai-warning' | 'preview' | 'empty'

export function ClassificationPanel({ tabs, theme, language, onClose, onConfirm, labels }: ClassificationPanelProps) {
  const [state, setState] = useState<PanelState>('loading')
  const [groups, setGroups] = useState<CategoryGroup[]>([])
  const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS)

  // Load AI settings
  useEffect(() => {
    chrome.storage.sync.get({ aiSettings: DEFAULT_AI_SETTINGS }, data => {
      setAiSettings(data.aiSettings as AISettings)
    })
  }, [])

  // Run classification
  useEffect(() => {
    if (tabs.length === 0) {
      setState('empty')
      return
    }

    const runClassification = async () => {
      // Check if AI is configured
      if (!aiSettings.enabled || !aiSettings.apiKey) {
        // Check if there are tabs that won't match rules
        const hasUnmatched = tabs.some(tab => {
          const url = tab.url.toLowerCase()
          const title = tab.title.toLowerCase()
          // Simple check - if URL doesn't contain common patterns
          return ![
            'jira',
            'confluence',
            'notion',
            'slack',
            'github',
            'gitlab',
            'twitter',
            'youtube',
            'amazon'
          ].some(p => url.includes(p) || title.includes(p))
        })

        if (hasUnmatched) {
          setState('ai-warning')
          // Still classify with rules only
          const result = await classifyTabs(tabs)
          setGroups(result.groups)
          return
        }
      }

      const result = await classifyTabs(tabs)
      setGroups(result.groups)
      setState('preview')
    }

    runClassification()
  }, [tabs, aiSettings])

  const handleGoToSettings = () => {
    chrome.runtime.openOptionsPage()
    onClose()
  }

  const getCategoryLabel = (name: string): string => {
    const labelMap: Record<string, string> = {
      Work: labels.categoryWork,
      Development: labels.categoryDevelopment,
      Social: labels.categorySocial,
      Shopping: labels.categoryShopping,
      Entertainment: labels.categoryEntertainment,
      News: labels.categoryNews,
      Docs: labels.categoryDocs,
      Other: labels.categoryOther
    }
    return labelMap[name] || name
  }

  return (
    <div className="cp-overlay" onClick={onClose} data-theme={theme}>
      <div className="cp-container" onClick={e => e.stopPropagation()}>
        <div className="cp-header">
          <h2>Smart Classify</h2>
          <button className="cp-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="cp-content">
          {state === 'loading' && (
            <div className="cp-loading">
              <div className="cp-spinner" />
              <p>{labels.analyzing}</p>
            </div>
          )}

          {state === 'empty' && <div className="cp-empty">{labels.noTabsToClassify}</div>}

          {state === 'ai-warning' && (
            <div className="cp-warning">
              <div className="cp-warning-icon">⚠️</div>
              <h3>{labels.aiNotConfigured}</h3>
              <p>{labels.aiNotConfiguredDesc}</p>
              <div className="cp-warning-actions">
                <button className="cp-btn cp-btn-secondary" onClick={() => setState('preview')}>
                  {labels.classifyAnyway}
                </button>
                <button className="cp-btn cp-btn-primary" onClick={handleGoToSettings}>
                  {labels.goToSettings}
                </button>
              </div>
            </div>
          )}

          {state === 'preview' && (
            <>
              <div className="cp-groups">
                {groups.map(group => (
                  <div key={group.name} className="cp-group">
                    <div className="cp-group-header">
                      <span className={`cp-group-color cp-color-${group.color}`} />
                      <span className="cp-group-name">{getCategoryLabel(group.name)}</span>
                      <span className="cp-group-count">{group.tabs.length}</span>
                    </div>
                    <div className="cp-group-tabs">
                      {group.tabs.slice(0, 3).map(tab => (
                        <div key={tab.id} className="cp-tab">
                          {tab.favIconUrl && <img src={tab.favIconUrl} alt="" className="cp-tab-icon" />}
                          <span className="cp-tab-title">{tab.title}</span>
                        </div>
                      ))}
                      {group.tabs.length > 3 && (
                        <div className="cp-tab-more">+{group.tabs.length - 3} more</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="cp-footer">
                <button className="cp-btn cp-btn-secondary" onClick={onClose}>
                  {labels.cancel}
                </button>
                <button className="cp-btn cp-btn-primary" onClick={() => onConfirm(groups)}>
                  {labels.createTabGroups}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建分类面板样式**

```css
/* src/content/components/ClassificationPanel.css */

/* Overlay */
.cp-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2147483646;
  animation: tt-fade-in 0.15s ease;
}

/* Container */
.cp-container {
  background: var(--background);
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.cp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.cp-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--foreground);
}

.cp-close {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--muted);
  border-radius: 4px;
}

.cp-close:hover {
  background: var(--hover);
}

/* Content */
.cp-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* Loading */
.cp-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--muted);
}

.cp-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: cp-spin 0.8s linear infinite;
}

@keyframes cp-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty */
.cp-empty {
  text-align: center;
  padding: 40px;
  color: var(--muted);
}

/* Warning */
.cp-warning {
  text-align: center;
  padding: 20px;
}

.cp-warning-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.cp-warning h3 {
  margin: 0 0 8px;
  color: var(--foreground);
}

.cp-warning p {
  margin: 0 0 20px;
  color: var(--muted);
  font-size: 14px;
}

.cp-warning-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* Groups */
.cp-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cp-group {
  background: var(--card);
  border-radius: 8px;
  overflow: hidden;
}

.cp-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--hover);
}

.cp-group-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.cp-color-grey {
  background: #6b7280;
}
.cp-color-blue {
  background: #3b82f6;
}
.cp-color-red {
  background: #ef4444;
}
.cp-color-yellow {
  background: #f59e0b;
}
.cp-color-green {
  background: #10b981;
}
.cp-color-pink {
  background: #ec4899;
}
.cp-color-purple {
  background: #8b5cf6;
}
.cp-color-cyan {
  background: #06b6d4;
}

.cp-group-name {
  font-weight: 500;
  color: var(--foreground);
}

.cp-group-count {
  margin-left: auto;
  font-size: 13px;
  color: var(--muted);
  background: var(--background);
  padding: 2px 8px;
  border-radius: 10px;
}

.cp-group-tabs {
  padding: 8px 12px;
}

.cp-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
}

.cp-tab-icon {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.cp-tab-title {
  color: var(--foreground);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cp-tab-more {
  font-size: 12px;
  color: var(--muted);
  padding: 4px 0;
}

/* Footer */
.cp-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}

/* Buttons */
.cp-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}

.cp-btn-primary {
  background: var(--primary);
  color: white;
}

.cp-btn-primary:hover {
  background: var(--primary-dark);
}

.cp-btn-secondary {
  background: var(--hover);
  color: var(--foreground);
}

.cp-btn-secondary:hover {
  background: var(--border-color);
}

/* Dark theme adjustments */
[data-theme='dark'] .cp-container {
  background: var(--card);
}

[data-theme='dark'] .cp-group {
  background: var(--background);
}

[data-theme='dark'] .cp-group-header {
  background: rgba(255, 255, 255, 0.05);
}
```

- [ ] **Step 3: 提交**

```bash
git add src/content/components/ClassificationPanel.tsx src/content/components/ClassificationPanel.css
git commit -m "feat: add classification preview panel component"
```

---

## Task 9: SearchPanel 集成智能分类

**Files:**
- Modify: `src/content/components/SearchPanel.tsx`
- Modify: `src/content/components/SearchPanel.css`

- [ ] **Step 1: 导入 ClassificationPanel**

在 `SearchPanel.tsx` 顶部添加：

```typescript
import { ClassificationPanel } from './ClassificationPanel'
import type { TabInfo, CategoryGroup } from '../../classification'
```

- [ ] **Step 2: 添加状态管理**

在 `SearchPanel` 组件中添加状态：

```typescript
  const [showClassification, setShowClassification] = useState(false)
```

- [ ] **Step 3: 添加智能分类按钮**

在 header stats 区域后添加按钮（找到 `tt-header-stats` div，在其后添加）：

```typescript
            {stats && (
              <div className="tt-header-stats">
                {/* ... existing stats */}
              </div>
            )}
            <button
              className="tt-classify-btn"
              onClick={() => setShowClassification(true)}
              title={t.smartClassify}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="16"
                height="16"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>{t.smartClassify}</span>
            </button>
```

- [ ] **Step 4: 添加分类面板渲染**

在组件 return 语句的末尾，添加 ClassificationPanel：

```typescript
      {showClassification && (
        <ClassificationPanel
          tabs={results.map(tab => ({
            id: tab.id,
            title: tab.title,
            url: tab.url,
            favIconUrl: tab.favIconUrl
          }))}
          theme={theme}
          language={language}
          onClose={() => setShowClassification(false)}
          onConfirm={(groups: CategoryGroup[]) => {
            // Send to background to create tab groups
            chrome.runtime.sendMessage(
              {
                type: 'CLASSIFY_TABS',
                groups: groups.map(g => ({
                  name: g.name,
                  tabs: g.tabs,
                  color: g.color
                }))
              },
              response => {
                if (response?.success) {
                  setShowClassification(false)
                  handleClose()
                }
              }
            )
          }}
          labels={{
            analyzing: t.analyzing,
            aiNotConfigured: t.aiNotConfigured,
            aiNotConfiguredDesc: t.aiNotConfiguredDesc,
            classifyAnyway: t.classifyAnyway,
            goToSettings: t.goToSettings,
            createTabGroups: t.createTabGroups,
            cancel: t.cancel,
            noTabsToClassify: t.noTabsToClassify,
            categoryWork: t.categoryWork,
            categoryDevelopment: t.categoryDevelopment,
            categorySocial: t.categorySocial,
            categoryShopping: t.categoryShopping,
            categoryEntertainment: t.categoryEntertainment,
            categoryNews: t.categoryNews,
            categoryDocs: t.categoryDocs,
            categoryOther: t.categoryOther
          }}
        />
      )}
```

- [ ] **Step 5: 添加按钮样式**

在 `SearchPanel.css` 中添加：

```css
/* Smart Classify Button */
.tt-classify-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.tt-classify-btn:hover {
  background: var(--hover);
  color: var(--foreground);
  border-color: var(--muted);
}

.tt-classify-btn svg {
  flex-shrink: 0;
}
```

- [ ] **Step 6: 提交**

```bash
git add src/content/components/SearchPanel.tsx src/content/components/SearchPanel.css
git commit -m "feat: integrate smart classification into search panel"
```

---

## Task 10: 构建和测试

**Files:**
- 无新文件

- [ ] **Step 1: 运行类型检查**

```bash
npm run typecheck
```

Expected: No errors

- [ ] **Step 2: 运行 ESLint**

```bash
npm run lint
```

Expected: No errors (or fix them with `npm run lint:fix`)

- [ ] **Step 3: 构建扩展**

```bash
npm run build
```

Expected: Build succeeds, `dist/` folder created

- [ ] **Step 4: 手动测试**

1. 在 Chrome 中加载 `dist/` 目录
2. 打开设置页面，验证 AI 设置区块
3. 打开多个不同类型的标签页
4. 使用快捷键打开搜索面板
5. 点击"智能分类"按钮
6. 验证分类预览面板
7. 确认创建 Tab Groups

- [ ] **Step 5: 最终提交**

```bash
git add -A
git commit -m "feat: complete smart tab classification feature"
```

---

## 自检清单

- [x] 所有类型定义完整且一致
- [x] 翻译键在中英文都有定义
- [x] AI 服务支持任意 OpenAI 兼容端点
- [x] 分类规则覆盖常见网站
- [x] 错误处理完善（超时、失败降级）
- [x] UI 遵循现有设计模式
- [x] 自动保存设置（无需保存按钮）
