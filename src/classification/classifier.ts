// src/classification/classifier.ts
import type { TabInfo, CategoryGroup, ClassificationResult } from './types'
import { CATEGORY_COLORS } from './types'
import { getAISettings, classifyTabsWithAI } from './ai-service'

// Map category names to preferred colors
const CATEGORY_COLOR_MAP: Record<string, chrome.tabGroups.ColorEnum> = {
  Work: 'blue',
  Development: 'purple',
  Social: 'pink',
  Shopping: 'green',
  Entertainment: 'red',
  News: 'yellow',
  Docs: 'cyan',
  Other: 'grey'
}

function getCategoryColor(category: string, index: number): chrome.tabGroups.ColorEnum {
  return CATEGORY_COLOR_MAP[category] || CATEGORY_COLORS[index % CATEGORY_COLORS.length]
}

export async function classifyTabs(tabs: TabInfo[]): Promise<ClassificationResult> {
  const aiSettings = await getAISettings()

  if (!aiSettings.enabled || !aiSettings.apiKey) {
    throw new Error('AI classification is not configured')
  }

  const aiClassified = await classifyTabsWithAI(tabs, aiSettings)

  // Group tabs by category
  const categoryMap = new Map<string, TabInfo[]>()

  for (const tab of tabs) {
    const category = aiClassified.get(tab.id)
    if (category) {
      if (!categoryMap.has(category)) {
        categoryMap.set(category, [])
      }
      categoryMap.get(category)!.push(tab)
    }
  }

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

  groups.sort((a, b) => b.tabs.length - a.tabs.length)

  return { groups }
}
