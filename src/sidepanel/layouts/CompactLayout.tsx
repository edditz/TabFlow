import type { TabGroup } from '../types'
import { TabItem } from '../components/TabItem'
import { GroupHeader } from '../components/GroupHeader'

interface CompactLayoutProps {
  groups: TabGroup[]
  activeTabId?: number
  collapsedGroups: Set<number>
  onToggleGroup: (groupId: number) => void
  onActivateTab: (tabId: number) => void
  onCloseTab: (tabId: number) => void
  onTabContextMenu: (e: React.MouseEvent, tabId: number) => void
  onGroupContextMenu: (e: React.MouseEvent, groupId: number) => void
  showFavicon: boolean
  showCloseButton: boolean
}

export function CompactLayout({
  groups,
  activeTabId,
  collapsedGroups,
  onToggleGroup,
  onActivateTab,
  onCloseTab,
  onTabContextMenu,
  onGroupContextMenu,
  showFavicon,
  showCloseButton
}: CompactLayoutProps) {
  return (
    <div className="layout-compact">
      {groups.map((group) => {
        const isUngrouped = group.id === chrome.tabGroups.TAB_GROUP_ID_NONE
        const isCollapsed = collapsedGroups.has(group.id)

        return (
          <div key={group.id} className="compact-group">
            {!isUngrouped && (
              <GroupHeader
                title={group.title}
                color={group.color}
                tabCount={group.tabs.length}
                collapsed={isCollapsed}
                onToggle={() => onToggleGroup(group.id)}
                onContextMenu={(e) => onGroupContextMenu(e, group.id)}
              />
            )}
            {!isCollapsed &&
              group.tabs.map((tab) => (
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
        )
      })}
    </div>
  )
}
