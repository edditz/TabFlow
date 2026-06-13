import type { TabGroup } from '../types'

interface CardLayoutProps {
  groups: TabGroup[]
  activeTabId?: number
  closingTabIds: Set<number>
  onActivateTab: (tabId: number) => void
  onCloseTab: (tabId: number) => void
  onTabContextMenu: (e: React.MouseEvent, tabId: number) => void
  showFavicon: boolean
  showGroupTag: boolean
  showCloseButton: boolean
  labels: {
    justNow: string
    minutesAgo: string
    hoursAgo: string
    daysAgo: string
  }
}

const GROUP_COLOR_MAP: Record<string, string> = {
  grey: '#6b7280',
  blue: '#3b82f6',
  red: '#ef4444',
  yellow: '#f59e0b',
  green: '#22c55e',
  pink: '#ec4899',
  purple: '#a855f7',
  cyan: '#06b6d4'
}

const GROUP_BG_COLOR_MAP: Record<string, string> = {
  grey: 'rgba(107, 114, 128, 0.15)',
  blue: 'rgba(59, 130, 246, 0.15)',
  red: 'rgba(239, 68, 68, 0.15)',
  yellow: 'rgba(245, 158, 11, 0.15)',
  green: 'rgba(34, 197, 94, 0.15)',
  pink: 'rgba(236, 72, 153, 0.15)',
  purple: 'rgba(168, 85, 247, 0.15)',
  cyan: 'rgba(6, 182, 212, 0.15)'
}

function formatTime(timestamp: number | undefined, labels: CardLayoutProps['labels']): string {
  if (!timestamp) return ''
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return labels.justNow
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return labels.minutesAgo.replace('{n}', String(minutes))
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return labels.hoursAgo.replace('{n}', String(hours))
  const days = Math.floor(hours / 24)
  return labels.daysAgo.replace('{n}', String(days))
}

function getDomain(url: string | undefined): string {
  if (!url) return ''
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

export function CardLayout({
  groups,
  activeTabId,
  closingTabIds,
  onActivateTab,
  onCloseTab,
  onTabContextMenu,
  showFavicon,
  showGroupTag,
  showCloseButton,
  labels
}: CardLayoutProps) {
  const allTabs = groups.flatMap(group =>
    group.tabs.map(tab => ({
      tab,
      groupColor: GROUP_COLOR_MAP[group.color] || GROUP_COLOR_MAP.grey,
      groupBgColor: GROUP_BG_COLOR_MAP[group.color] || GROUP_BG_COLOR_MAP.grey,
      groupTitle: group.title,
      isUngrouped: group.id === chrome.tabGroups.TAB_GROUP_ID_NONE
    }))
  )

  return (
    <div className="layout-card">
      {allTabs.map(({ tab, groupColor, groupBgColor, groupTitle, isUngrouped }) => {
        const isActive = tab.id === activeTabId
        const isClosing = closingTabIds.has(tab.id!)

        return (
          <div
            key={tab.id}
            className={`card-tab ${isActive ? 'active' : ''} ${isClosing ? 'card-exit' : ''}`}
            onClick={() => onActivateTab(tab.id!)}
            onContextMenu={e => onTabContextMenu(e, tab.id!)}
          >
            <div className="card-color-bar" style={{ backgroundColor: groupColor }} />
            <div className="card-content">
              <div className="card-row-primary">
                {showFavicon && (
                  <div className="card-favicon">
                    {tab.favIconUrl ? (
                      <img src={tab.favIconUrl} alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <div className="card-favicon-placeholder" />
                    )}
                  </div>
                )}
                <div className="card-title">{tab.title || 'Untitled'}</div>
                <div className="card-badges">
                </div>
              </div>
              <div className="card-row-meta">
                <span className="card-domain">{getDomain(tab.url)}</span>
                {!isUngrouped && showGroupTag && (
                  <span className="card-group-tag" style={{ backgroundColor: groupBgColor, color: groupColor }}>{groupTitle}</span>
                )}
                <span className="card-time">{formatTime(tab.lastAccessed, labels)}</span>
              </div>
            </div>
            {showCloseButton && (
              <button
                className="card-close-btn"
                onClick={e => { e.stopPropagation(); onCloseTab(tab.id!) }}
                title="Close"
              >
                ×
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
