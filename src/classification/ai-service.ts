// src/classification/ai-service.ts
import type { AISettings, TabInfo } from './types'
import { DEFAULT_AI_SETTINGS } from './types'

/**
 * Get AI settings from environment variables (development mode only)
 * Returns null if not in development mode or env vars are not set
 */
function getEnvAISettings(): Partial<AISettings> | null {
  // Only apply env vars in development mode
  if (!import.meta.env.VITE_DEV) {
    return null
  }

  const envSettings: Partial<AISettings> = {}

  if (import.meta.env.VITE_AI_ENABLED !== undefined) {
    envSettings.enabled = import.meta.env.VITE_AI_ENABLED === 'true'
  }

  if (import.meta.env.VITE_AI_ENDPOINT) {
    envSettings.endpoint = import.meta.env.VITE_AI_ENDPOINT
  }

  if (import.meta.env.VITE_AI_API_KEY) {
    envSettings.apiKey = import.meta.env.VITE_AI_API_KEY
  }

  if (import.meta.env.VITE_AI_MODEL) {
    envSettings.model = import.meta.env.VITE_AI_MODEL
  }

  // Return null if no env vars are set
  if (Object.keys(envSettings).length === 0) {
    return null
  }

  return envSettings
}

export function getAISettings(): Promise<AISettings> {
  return new Promise(resolve => {
    // In development mode, environment variables override storage settings
    const envSettings = getEnvAISettings()

    if (envSettings) {
      // Merge env vars with defaults (storage settings are ignored in dev mode)
      resolve({ ...DEFAULT_AI_SETTINGS, ...envSettings })
      return
    }

    // Production mode: use storage settings
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
      console.error('[TabFlow] AI classification failed:', response.status)
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
    console.error('[TabFlow] AI classification error:', error)
    return result
  }
}
