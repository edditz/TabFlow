// src/classification/classifier.ts
import type { TabInfo, CategoryGroup, ClassificationResult } from './types'
import { CATEGORY_COLORS } from './types'
import { matchRule } from './rules'
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

  // Second pass: use AI for unmatched tabs (if enabled)
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
