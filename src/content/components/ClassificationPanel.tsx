// src/content/components/ClassificationPanel.tsx
import { useState, useEffect } from 'react'
import type { TabInfo, CategoryGroup, AISettings } from '../../classification'
import { classifyTabs, DEFAULT_AI_SETTINGS } from '../../classification'
import { TabItem } from './TabItem'
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
          <div className="cp-groups">
            {groups.map(group => {
              const isCollapsed = collapsedGroups.has(group.name)
              return (
                <div key={group.name} className="cp-group">
                  <div
                    className="cp-group-header"
                    onClick={() => toggleGroupCollapse(group.name)}
                    role="button"
                    aria-expanded={!isCollapsed}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleGroupCollapse(group.name)
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
                  <div className={`cp-group-tabs-wrapper ${isCollapsed ? 'cp-collapsed' : ''}`}>
                    <div className="cp-group-tabs">
                      {group.tabs.map(tab => (
                        <TabItem key={tab.id} tab={tab} showUrl={false} className="cp-tab-item" />
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
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
