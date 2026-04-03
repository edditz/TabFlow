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
