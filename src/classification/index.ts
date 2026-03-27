// src/classification/index.ts
export * from './types'
export { classifyTabs } from './classifier'
export { getAISettings, saveAISettings, testAIConnection } from './ai-service'
export { matchRule, CATEGORY_RULES } from './rules'
export type { CategoryRule } from './rules'
