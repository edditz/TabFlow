# 智能分类面板拖拽功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在智能分类面板中添加拖拽功能，允许用户手动调整标签页的分类归属。

**Architecture:** 使用 dnd-kit 库实现拖拽，创建两个包装组件（DraggableTabItem 和 DroppableCategoryGroup）包裹现有 TabItem 和分类组，通过 DndContext 管理拖拽状态和数据流。

**Tech Stack:** React, TypeScript, @dnd-kit/core, @dnd-kit/utilities

---

## 文件结构

| 文件 | 责任 |
|------|------|
| `src/content/components/DraggableTabItem.tsx` | 可拖拽标签页包装器，绑定 useDraggable hook |
| `src/content/components/DroppableCategoryGroup.tsx` | 可放置分类组包装器，绑定 useDroppable hook，显示拖放提示 |
| `src/content/components/ClassificationPanel.tsx` | 主面板，引入 DndContext，处理拖拽事件，管理 groups 状态 |
| `src/content/components/ClassificationPanel.css` | 拖拽相关样式（半透明、高亮、提示） |
| `src/i18n/translations.ts` | 添加 moveToCategory 翻译键 |

---

## Task 1: 安装 dnd-kit 依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装 @dnd-kit/core 和 @dnd-kit/utilities**

```bash
cd /Users/eddie/projects/tab-tool/.worktrees/drag-drop && npm install @dnd-kit/core @dnd-kit/utilities
```

Expected: 依赖安装成功，package.json 更新

- [ ] **Step 2: 验证安装**

```bash
npm ls @dnd-kit/core @dnd-kit/utilities
```

Expected: 显示已安装的版本

- [ ] **Step 3: 提交**

```bash
git add package.json package-lock.json && git commit -m "chore: add @dnd-kit dependencies for drag-drop"
```

---

## Task 2: 添加国际化翻译键

**Files:**
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: 添加 moveToCategory 到 TranslationKeys 接口**

在 `TranslationKeys` 接口中添加：

```typescript
// 在 smartClassify 相关键附近添加
moveToCategory: string
```

- [ ] **Step 2: 添加英文翻译**

在 `translations.en` 对象中添加：

```typescript
moveToCategory: 'Move to {category}',
```

- [ ] **Step 3: 添加中文翻译**

在 `translations.zh` 对象中添加：

```typescript
moveToCategory: '移动到 {category}',
```

- [ ] **Step 4: 验证 TypeScript 编译**

```bash
npm run typecheck
```

Expected: 无错误

- [ ] **Step 5: 提交**

```bash
git add src/i18n/translations.ts && git commit -m "feat(i18n): add moveToCategory translation key"
```

---

## Task 3: 创建 DraggableTabItem 组件

**Files:**
- Create: `src/content/components/DraggableTabItem.tsx`

- [ ] **Step 1: 创建 DraggableTabItem 组件文件**

```tsx
// src/content/components/DraggableTabItem.tsx
import { useDraggable } from '@dnd-kit/core'
import { TabItem } from './TabItem'
import type { TabInfo } from '../../classification'

interface DraggableTabItemProps {
  tab: TabInfo
  isDragging: boolean
}

export function DraggableTabItem({ tab, isDragging }: DraggableTabItemProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `tab-${tab.id}`,
    data: { tab }
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cp-draggable-tab ${isDragging ? 'dragging' : ''}`}
    >
      <TabItem tab={tab} showUrl={false} className="cp-tab-item" />
    </div>
  )
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npm run typecheck
```

Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/content/components/DraggableTabItem.tsx && git commit -m "feat: add DraggableTabItem component"
```

---

## Task 4: 创建 DroppableCategoryGroup 组件

**Files:**
- Create: `src/content/components/DroppableCategoryGroup.tsx`

- [ ] **Step 1: 创建 DroppableCategoryGroup 组件文件**

```tsx
// src/content/components/DroppableCategoryGroup.tsx
import { useDroppable } from '@dnd-kit/core'
import type { CategoryGroup } from '../../classification'

interface DroppableCategoryGroupProps {
  group: CategoryGroup
  isOver: boolean
  getCategoryLabel: (name: string) => string
  moveToCategoryLabel: string
  isCollapsed: boolean
  onToggleCollapse: () => void
  children: React.ReactNode
}

export function DroppableCategoryGroup({
  group,
  isOver,
  getCategoryLabel,
  moveToCategoryLabel,
  isCollapsed,
  onToggleCollapse,
  children
}: DroppableCategoryGroupProps) {
  const { setNodeRef } = useDroppable({
    id: `group-${group.name}`,
    data: { group }
  })

  const dropHintText = moveToCategoryLabel.replace('{category}', getCategoryLabel(group.name))

  return (
    <div
      ref={setNodeRef}
      className={`cp-group ${isOver ? 'drop-target' : ''}`}
    >
      {/* Header */}
      <div
        className="cp-group-header"
        onClick={onToggleCollapse}
        role="button"
        aria-expanded={!isCollapsed}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggleCollapse()
          }
        }}
      >
        <button
          className="cp-collapse-btn"
          aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          tabIndex={-1}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="16"
            height="16"
            className={isCollapsed ? 'cp-collapse-icon-collapsed' : ''}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <span className={`cp-group-color cp-color-${group.color}`} />
        <span className="cp-group-name">{getCategoryLabel(group.name)}</span>
        <span className="cp-group-count">{group.tabs.length}</span>
      </div>

      {/* Drop hint */}
      {isOver && (
        <div className="cp-drop-hint">
          {dropHintText}
        </div>
      )}

      {/* Tabs */}
      <div className={`cp-group-tabs-wrapper ${isCollapsed ? 'cp-collapsed' : ''}`}>
        <div className="cp-group-tabs">
          {children}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npm run typecheck
```

Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/content/components/DroppableCategoryGroup.tsx && git commit -m "feat: add DroppableCategoryGroup component"
```

---

## Task 5: 添加拖拽相关 CSS 样式

**Files:**
- Modify: `src/content/components/ClassificationPanel.css`

- [ ] **Step 1: 添加拖拽样式到 ClassificationPanel.css**

在文件末尾添加：

```css
/* ========================================
   Drag and Drop Styles
   ======================================== */

/* Draggable tab */
.cp-draggable-tab {
  cursor: grab;
}

.cp-draggable-tab.dragging {
  opacity: 0.4;
  cursor: grabbing;
}

/* Drop target highlight */
.cp-group.drop-target {
  border: 2px dashed var(--tt-primary);
  background: color-mix(in srgb, var(--tt-primary) 5%, var(--tt-card));
}

/* Drop hint tooltip */
.cp-drop-hint {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--tt-primary);
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
  animation: cp-hint-fade-in 0.15s ease;
  pointer-events: none;
}

@keyframes cp-hint-fade-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/content/components/ClassificationPanel.css && git commit -m "feat: add drag-drop styles"
```

---

## Task 6: 修改 ClassificationPanel 集成拖拽功能

**Files:**
- Modify: `src/content/components/ClassificationPanel.tsx`

- [ ] **Step 1: 添加导入语句**

在文件顶部添加：

```tsx
import { useState } from 'react'
import { DndContext, DragOverlay, closestCenter, useDroppable } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent, Active, Over } from '@dnd-kit/core'
import { DraggableTabItem } from './DraggableTabItem'
import { DroppableCategoryGroup } from './DroppableCategoryGroup'
```

- [ ] **Step 2: 添加 activeTab 状态和辅助函数**

在组件内部，`useState` 声明区域添加：

```tsx
const [activeTab, setActiveTab] = useState<TabInfo | null>(null)
```

在组件内部，`getCategoryLabel` 函数之后添加辅助函数：

```tsx
// Parse tab ID: "tab-123" -> 123
const parseTabId = (id: string): number => {
  return parseInt(id.replace('tab-', ''), 10)
}

// Parse group ID: "group-Work" -> "Work"
const parseGroupId = (id: string): string => {
  return id.replace('group-', '')
}

// Find which group contains a tab
const findGroupContaining = (tabId: number): string | null => {
  for (const group of groups) {
    if (group.tabs.some(t => t.id === tabId)) {
      return group.name
    }
  }
  return null
}

// Move tab between groups (immutable)
const moveTabBetweenGroups = (
  prevGroups: CategoryGroup[],
  tabId: number,
  sourceGroupName: string,
  targetGroupName: string
): CategoryGroup[] => {
  let movedTab: TabInfo | null = null

  // Remove from source and find the tab
  const newGroups = prevGroups.map(group => {
    if (group.name === sourceGroupName) {
      const tabIndex = group.tabs.findIndex(t => t.id === tabId)
      if (tabIndex !== -1) {
        movedTab = group.tabs[tabIndex]
        return {
          ...group,
          tabs: [...group.tabs.slice(0, tabIndex), ...group.tabs.slice(tabIndex + 1)]
        }
      }
    }
    return group
  })

  // Add to target
  if (movedTab) {
    return newGroups.map(group => {
      if (group.name === targetGroupName) {
        return {
          ...group,
          tabs: [...group.tabs, movedTab!]
        }
      }
      return group
    })
  }

  return newGroups
}
```

- [ ] **Step 3: 添加拖拽事件处理函数**

在辅助函数之后添加：

```tsx
const handleDragStart = (event: DragStartEvent) => {
  const tab = event.active.data.current?.tab as TabInfo | undefined
  if (tab) {
    setActiveTab(tab)
  }
}

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event
  setActiveTab(null)

  if (!over) return

  const tabId = parseTabId(String(active.id))
  const targetGroupName = parseGroupId(String(over.id))
  const sourceGroupName = findGroupContaining(tabId)

  if (!sourceGroupName || sourceGroupName === targetGroupName) return

  setGroups(prev => moveTabBetweenGroups(prev, tabId, sourceGroupName, targetGroupName))
}
```

- [ ] **Step 4: 替换 preview 状态的 JSX**

将现有的 `{state === 'preview' && (...)}` 部分替换为：

```tsx
        {state === 'preview' && (
          <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
          >
            <div className="cp-groups">
              {groups.map(group => (
                <DroppableCategoryGroup
                  key={group.name}
                  group={group}
                  isOver={activeTab !== null && findGroupContaining(activeTab.id) !== group.name}
                  getCategoryLabel={getCategoryLabel}
                  moveToCategoryLabel={labels.moveToCategory}
                  isCollapsed={collapsedGroups.has(group.name)}
                  onToggleCollapse={() => toggleGroupCollapse(group.name)}
                >
                  {group.tabs.map(tab => (
                    <DraggableTabItem
                      key={tab.id}
                      tab={tab}
                      isDragging={activeTab?.id === tab.id}
                    />
                  ))}
                </DroppableCategoryGroup>
              ))}
            </div>

            <DragOverlay>
              {activeTab && (
                <TabItem tab={activeTab} showUrl={false} className="cp-tab-item" />
              )}
            </DragOverlay>
          </DndContext>
        )}
```

- [ ] **Step 5: 更新 labels 接口添加 moveToCategory**

在 `ClassificationPanelProps` 的 `labels` 接口中添加：

```tsx
  labels: {
    // ... 现有标签
    moveToCategory: string
  }
```

- [ ] **Step 6: 验证 TypeScript 编译**

```bash
npm run typecheck
```

Expected: 无错误

- [ ] **Step 7: 提交**

```bash
git add src/content/components/ClassificationPanel.tsx && git commit -m "feat: integrate drag-drop into ClassificationPanel"
```

---

## Task 7: 更新 index.tsx 传递新的 label

**Files:**
- Modify: `src/content/index.tsx`

- [ ] **Step 1: 在 ClassificationPanel 的 labels prop 中添加 moveToCategory**

找到传递给 `ClassificationPanel` 的 `labels` 对象，添加：

```tsx
moveToCategory: t.moveToCategory,
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npm run typecheck
```

Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/content/index.tsx && git commit -m "feat: pass moveToCategory label to ClassificationPanel"
```

---

## Task 8: 构建并手动测试

**Files:**
- None (验证)

- [ ] **Step 1: 构建扩展**

```bash
npm run build
```

Expected: 构建成功，无错误

- [ ] **Step 2: 手动测试清单**

1. 在浏览器中加载扩展（chrome://extensions → 加载已解压的扩展程序 → 选择 dist 文件夹）
2. 打开多个标签页
3. 触发搜索面板（Cmd+Shift+A）
4. 点击「智能分类」按钮
5. 验证以下功能：
   - [ ] 可以拖拽标签页（鼠标变为 grab）
   - [ ] 拖拽时原标签页半透明
   - [ ] 悬停在目标分类时显示高亮边框
   - [ ] 悬停时显示"移动到 [分类名]"提示
   - [ ] 释放后标签页移动到目标分类
   - [ ] 拖拽到同一分类不做任何操作
   - [ ] 拖拽到空白区域标签页回弹
   - [ ] 移走所有标签后分类组仍显示（数量为 0）

- [ ] **Step 3: 修复发现的问题（如有）**

如果测试发现问题，修复后提交：

```bash
git add . && git commit -m "fix: [问题描述]"
```

---

## Task 9: 合并到主分支

**Files:**
- None

- [ ] **Step 1: 确保所有更改已提交**

```bash
git status
```

Expected: working tree clean

- [ ] **Step 2: 切换到 main 分支并合并**

```bash
git checkout main && git merge feature/drag-drop-classification --no-ff -m "feat: add drag-drop classification feature"
```

- [ ] **Step 3: 清理 worktree**

```bash
git worktree remove .worktrees/drag-drop
```
