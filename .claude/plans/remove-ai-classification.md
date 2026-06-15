# Plan: Remove AI Smart Classification Feature

## Context

The AI smart classification feature allows users to classify tabs into Chrome Tab Groups using an OpenAI-compatible API. The user wants to completely remove this feature from the codebase. This includes the classification engine, UI panels, settings, i18n keys, background message handlers, and the `@dnd-kit` dependency (only used by classification).

## Steps

### 1. Create a new branch
```
git checkout -b remove-ai-classification
```

### 2. Delete dedicated classification files (entire `src/classification/` directory)
- `src/classification/index.ts`
- `src/classification/types.ts`
- `src/classification/classifier.ts`
- `src/classification/ai-service.ts`

### 3. Delete classification UI components
- `src/content/components/ClassificationPanel.tsx`
- `src/content/components/ClassificationPanel.css`
- `src/content/components/DraggableTabItem.tsx`
- `src/content/components/DroppableCategoryGroup.tsx`

### 4. Delete AI settings component
- `src/options/components/AISettings.tsx`

### 5. Modify `src/content/index.tsx`
- Remove imports: `ClassificationPanel`, `TabInfo`, `CategoryGroup`, `AISettings`, `DEFAULT_AI_SETTINGS`, `classificationCssText`
- Remove state: `currentView`, `classificationTabs`, `currentAiEnabled`
- Remove `classificationCssText` from Shadow DOM style injection (line 88)
- Remove `aiSettings` from `chrome.storage.sync.get` defaults (line 110) and the `currentAiEnabled` calculation (lines 121-122)
- Remove `changes.aiSettings` listener (lines 175-179)
- Remove classification view branch in `render()` — keep only the `SearchPanel` rendering, remove the `showClassification` and `onShowClassification` props
- Remove `classificationTabs` reset in `hide()` (line 449)

### 6. Modify `src/content/components/SearchPanel.tsx`
- Remove `TabInfo` import from `../../classification`
- Remove `showClassification` and `onShowClassification` from `SearchPanelProps` interface
- Remove the classify button JSX (lines 332-350)
- Remove unused `AppWindow` import from lucide-react

### 7. Modify `src/content/components/SearchPanel.css`
- Remove `.tt-classify-btn` styles (lines 161-185)

### 8. Modify `src/options/App.tsx`
- Remove imports: `AISettingsComponent`, `AISettings` type, `DEFAULT_AI_SETTINGS`
- Remove `aiSettings` from `Settings` interface and `DEFAULT_SETTINGS`
- Remove the dev-mode AI settings auto-fill block (lines 78-103)
- Remove the `<AISettingsComponent>` JSX block (lines 467-484)

### 9. Modify `src/background/index.ts`
- Remove `getCategoryColor()` function (lines 58-70)
- Remove `CLASSIFY_TABS` message handler (lines 189-214)

### 10. Modify `src/i18n/translations.ts`
- Remove from `TranslationKeys` interface (lines 75-121):
  - AI Classification Settings keys: `aiSettings`, `enableAiClassification`, `enableAiClassificationDesc`, `apiEndpoint`, `apiEndpointHint`, `apiKey`, `apiKeyPlaceholder`, `modelName`, `testConnection`, `connectionSuccess`, `connectionFailed`
  - Smart Classification keys: `smartClassify`, `backToSearch`, `analyzing`, `goToSettings`, `createTabGroups`, `cancel`, `noTabsToClassify`, `allTabsClassified`, `classificationComplete`
  - Category names: `categoryWork`, `categoryDevelopment`, `categorySocial`, `categoryShopping`, `categoryEntertainment`, `categoryNews`, `categoryDocs`, `categoryOther`
  - Drag and Drop: `moveToCategory`
  - Classification Error: `classificationError`, `classificationErrorHint`, `retry`
- Remove corresponding values from both `en` and `zh` translation blocks

### 11. Remove `@dnd-kit` dependencies
```
npm uninstall @dnd-kit/core @dnd-kit/utilities
```

### 12. Verify build
```
npm run build
npm run lint
```

## Files Modified (summary)

| Action | File |
|--------|------|
| DELETE | `src/classification/index.ts` |
| DELETE | `src/classification/types.ts` |
| DELETE | `src/classification/classifier.ts` |
| DELETE | `src/classification/ai-service.ts` |
| DELETE | `src/content/components/ClassificationPanel.tsx` |
| DELETE | `src/content/components/ClassificationPanel.css` |
| DELETE | `src/content/components/DraggableTabItem.tsx` |
| DELETE | `src/content/components/DroppableCategoryGroup.tsx` |
| DELETE | `src/options/components/AISettings.tsx` |
| EDIT | `src/content/index.tsx` |
| EDIT | `src/content/components/SearchPanel.tsx` |
| EDIT | `src/content/components/SearchPanel.css` |
| EDIT | `src/options/App.tsx` |
| EDIT | `src/background/index.ts` |
| EDIT | `src/i18n/translations.ts` |
| EDIT | `package.json` (npm uninstall) |
