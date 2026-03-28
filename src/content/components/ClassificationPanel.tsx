// src/content/components/ClassificationPanel.tsx
import { useState, useEffect } from 'react'
import type { TabInfo, CategoryGroup, AISettings } from '../../classification'
import { classifyTabs, DEFAULT_AI_SETTINGS } from '../../classification'
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

  return (
    <>
      {/* Header - matches SearchPanel structure */}
      <div className="tt-header">
        <div className="tt-header-content">
          <div className="tt-header-left">
            <button className="tt-back-btn" onClick={onBack} aria-label={labels.backToSearch}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>{labels.backToSearch}</span>
            </button>
          </div>
          <div className="tt-header-text cp-header-title">
            <h2 className="tt-title">{labels.smartClassify}</h2>
          </div>
          <button className="tt-close-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
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
            {groups.map(group => (
              <div key={group.name} className="cp-group">
                <div className="cp-group-header">
                  <span className={`cp-group-color cp-color-${group.color}`} />
                  <span className="cp-group-name">{getCategoryLabel(group.name)}</span>
                  <span className="cp-group-count">{group.tabs.length}</span>
                </div>
                <div className="cp-group-tabs">
                  {group.tabs.slice(0, 3).map(tab => (
                    <div key={tab.id} className="cp-tab">
                      {tab.favIconUrl && (
                        <img src={tab.favIconUrl} alt="" className="cp-tab-icon" />
                      )}
                      <span className="cp-tab-title">{tab.title}</span>
                    </div>
                  ))}
                  {group.tabs.length > 3 && (
                    <div className="cp-tab-more">+{group.tabs.length - 3} more</div>
                  )}
                </div>
              </div>
            ))}
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
