import { useState } from 'react'
import type { TabGroup, RecentTab } from '../types'
import { TabItem } from '../components/TabItem'
import { GroupHeader } from '../components/GroupHeader'
import { RecentTabs } from '../components/RecentTabs'

interface TreeLayoutProps {
  groups: TabGroup[]
  activeTabId?: number
  recentTabs: RecentTab[]
  collapsedGroups: Set<number>
  onToggleGroup: (groupId: number) => void
  onActivateTab: (tabId: number) => void
  onCloseTab: (tabId: number) => void
  onTabContextMenu: (e: React.MouseEvent, tabId: number) => void
  onGroupContextMenu: (e: React.MouseEvent, groupId: number) => void
  onRestoreTab: (sessionId: string) => void
  showFavicon: boolean
  showCloseButton: boolean
  labels: {
    recentTabs: string
    recentClosedEmpty: string
    restoreTab: string
    ungrouped: string
  }
}

export function TreeLayout({
  groups,
  activeTabId,
  recentTabs,
  collapsedGroups,
  onToggleGroup,
  onActivateTab,
  onCloseTab,
  onTabContextMenu,
  onGroupContextMenu,
  onRestoreTab,
  showFavicon,
  showCloseButton,
  labels
}: TreeLayoutProps) {
  const [view, setView] = useState<'tabs' | 'recent'>('tabs')

  return (
    <div className="layout-tree">
      <div className="tree-tabs">
        <button
          className={`tree-tab ${view === 'tabs' ? 'active' : ''}`}
          onClick={() => setView('tabs')}
        >
          Tabs
        </button>
        <button
          className={`tree-tab ${view === 'recent' ? 'active' : ''}`}
          onClick={() => setView('recent')}
        >
          {labels.recentTabs}
        </button>
      </div>

      {view === 'tabs' ? (
        <div className="tree-content">
          {groups.map((group) => {
            const isUngrouped = group.id === chrome.tabGroups.TAB_GROUP_ID_NONE
            const isCollapsed = collapsedGroups.has(group.id)

            return (
              <div key={group.id} className="tree-group">
                <GroupHeader
                  title={isUngrouped ? labels.ungrouped : group.title}
                  color={group.color}
                  tabCount={group.tabs.length}
                  collapsed={isCollapsed}
                  onToggle={() => onToggleGroup(group.id)}
                  onContextMenu={(e) => onGroupContextMenu(e, group.id)}
                />
                {!isCollapsed && (
                  <div className="tree-group-children">
                    {group.tabs.map((tab) => (
                      <TabItem
                        key={tab.id}
                        title={tab.title || ''}
                        url={tab.url}
                        favIconUrl={tab.favIconUrl}
                        isActive={tab.id === activeTabId}
                        showFavicon={showFavicon}
                        showCloseButton={showCloseButton}
                        variant="compact"
                        onActivate={() => onActivateTab(tab.id!)}
                        onClose={() => onCloseTab(tab.id!)}
                        onContextMenu={(e) => onTabContextMenu(e, tab.id!)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <RecentTabs
          tabs={recentTabs}
          onRestore={onRestoreTab}
          labels={{
            recentTabs: labels.recentTabs,
            recentClosedEmpty: labels.recentClosedEmpty,
            restoreTab: labels.restoreTab
          }}
        />
      )}
    </div>
  )
}
