// src/content/components/ClassificationPanel.tsx
import { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent
} from '@dnd-kit/core'
import type { TabInfo, CategoryGroup, AISettings } from '../../classification'
import { classifyTabs, DEFAULT_AI_SETTINGS } from '../../classification'
import { TabItem } from './TabItem'
import { DraggableTabItem } from './DraggableTabItem'
import { DroppableCategoryGroup } from './DroppableCategoryGroup'
import './ClassificationPanel.css'

interface ClassificationPanelProps {
  tabs: TabInfo[]
  onClose: () => void
  onBack: () => void
  onConfirm: (groups: CategoryGroup[]) => void
  labels: {
    smartClassify: string
    backToSearch: string
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
    moveToCategory: string
  }
}

type PanelState = 'loading' | 'ai-warning' | 'preview' | 'empty'

export function ClassificationPanel({
  tabs,
  onClose,
  onBack,
  onConfirm,
  labels
}: ClassificationPanelProps) {
  const [state, setState] = useState<PanelState>('loading')
  const [groups, setGroups] = useState<CategoryGroup[]>([])
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<TabInfo | null>(null)
  const [overGroupId, setOverGroupId] = useState<string | null>(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor)
  )

  // Run classification on mount
  useEffect(() => {
    if (tabs.length === 0) {
      setState('empty')
      return
    }

    const runClassification = async () => {
      // Get AI settings to check if configured
      const aiSettings = await new Promise<AISettings>(resolve => {
        chrome.storage.sync.get({ aiSettings: DEFAULT_AI_SETTINGS }, data => {
          resolve(data.aiSettings as AISettings)
        })
      })

      // Run classification
      const result = await classifyTabs(tabs)
      setGroups(result.groups)

      // Show warning if AI not configured and there might be unclassified tabs
      if (!aiSettings.enabled || !aiSettings.apiKey) {
        const hasOtherCategory = result.groups.some(g => g.name === 'Other')
        if (hasOtherCategory) {
          setState('ai-warning')
          return
        }
      }

      setState('preview')
    }

    runClassification()
  }, [tabs])

  const handleGoToSettings = () => {
    chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
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

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupName)) {
        next.delete(groupName)
      } else {
        next.add(groupName)
      }
      return next
    })
  }

  // Helper: Find which group contains a tab
  const findGroupContainingTab = (tabId: number): string | null => {
    for (const group of groups) {
      if (group.tabs.some(t => t.id === tabId)) {
        return group.name
      }
    }
    return null
  }

  // Helper: Move tab between groups (immutable)
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

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const tab = event.active.data.current?.tab as TabInfo | undefined
    if (tab) {
      setActiveTab(tab)
    }
  }

  const handleDragOver = (event: { over: { id: string | number } | null }) => {
    setOverGroupId(event.over?.id ? String(event.over.id) : null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTab(null)
    setOverGroupId(null)

    if (!over) return

    const tabId = parseInt(String(active.id).replace('tab-', ''), 10)
    const targetGroupName = String(over.id).replace('group-', '')
    const sourceGroupName = findGroupContainingTab(tabId)

    if (!sourceGroupName || sourceGroupName === targetGroupName) return

    setGroups(prev => moveTabBetweenGroups(prev, tabId, sourceGroupName, targetGroupName))
  }

  return (
    <>
      {/* Header */}
      <div className="tt-header">
        <div className="tt-header-content cp-header">
          <button className="tt-back-btn" onClick={onBack} aria-label={labels.backToSearch}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>{labels.backToSearch}</span>
          </button>
          <h2 className="cp-title">{labels.smartClassify}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="tt-search-content cp-content-wrapper">
        {state === 'loading' && (
          <div className="cp-loading">
            <div className="cp-spinner" />
            <p>{labels.analyzing}</p>
          </div>
        )}

        {state === 'empty' && (
          <div className="cp-empty">
            <p>{labels.noTabsToClassify}</p>
          </div>
        )}

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="cp-groups">
              {groups.map(group => {
                const isCollapsed = collapsedGroups.has(group.name)
                const isOver = overGroupId === `group-${group.name}`

                return (
                  <DroppableCategoryGroup
                    key={group.name}
                    group={group}
                    isOver={isOver && activeTab !== null}
                    getCategoryLabel={getCategoryLabel}
                    moveToCategoryLabel={labels.moveToCategory}
                    isCollapsed={isCollapsed}
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
                )
              })}
            </div>

            <DragOverlay
              style={{
                position: 'fixed',
                pointerEvents: 'none',
                zIndex: 9999
              }}
            >
              {activeTab && (
                <div
                  style={{
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    borderRadius: '6px',
                    background: 'var(--tt-card, #fff)',
                    padding: '8px 12px',
                    opacity: 0.95,
                    cursor: 'grabbing'
                  }}
                >
                  <TabItem tab={activeTab} showUrl={false} className="cp-tab-item" />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Footer */}
      <div className="tt-footer">
        <div className="tt-footer-actions">
          <button className="cp-btn cp-btn-secondary" onClick={onClose}>
            {labels.cancel}
          </button>
          {state === 'preview' && (
            <button
              className="cp-btn cp-btn-primary"
              onClick={() => onConfirm(groups)}
            >
              {labels.createTabGroups}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
