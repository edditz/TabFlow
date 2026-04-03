// src/content/components/ClassificationPanel.tsx
import { useState, useEffect } from 'react'
import { ChevronLeft, RefreshCw } from 'lucide-react'
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
import type { TabInfo, CategoryGroup } from '../../classification'
import { classifyTabs } from '../../classification'
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
    classificationError: string
    classificationErrorHint: string
    retry: string
  }
}

type PanelState = 'loading' | 'preview' | 'empty' | 'error'

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
  const [errorMessage, setErrorMessage] = useState('')

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
      setState('loading')
      try {
        const result = await classifyTabs(tabs)
        setGroups(result.groups)
        setState('preview')
      } catch (error) {
        console.error('[TabFlow] Classification failed:', error)
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
        setState('error')
      }
    }

    runClassification()
  }, [tabs])

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

  const handleRetry = async () => {
    setState('loading')
    try {
      const result = await classifyTabs(tabs)
      setGroups(result.groups)
      setState('preview')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
      setState('error')
    }
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
            <ChevronLeft size={20} />
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

        {state === 'error' && (
          <div className="cp-error">
            <div className="cp-error-icon">
              <svg viewBox="0 0 48 48" fill="none" width="56" height="56">
                <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" strokeDasharray="138" strokeDashoffset="138" className="cp-error-circle" />
                <path d="M24 14v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="cp-error-line" />
                <circle cx="24" cy="34" r="1.5" fill="currentColor" className="cp-error-dot" />
              </svg>
            </div>
            <h3 className="cp-error-title">{labels.classificationError}</h3>
            <p className="cp-error-hint">{labels.classificationErrorHint}</p>
            <div className="cp-error-detail">
              <code>{errorMessage}</code>
            </div>
            <div className="cp-error-actions">
              <button className="cp-btn cp-btn-primary cp-error-retry" onClick={handleRetry}>
                <RefreshCw size={16} />
                {labels.retry}
              </button>
              <button className="cp-btn cp-btn-secondary" onClick={onBack}>
                {labels.backToSearch}
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
                <div className="cp-drag-overlay">
                  <div className="cp-draggable-tab">
                    <TabItem tab={activeTab} showUrl={false} className="cp-tab-item" />
                  </div>
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
