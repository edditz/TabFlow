import type { TabGroup } from '../types'
import { TabItem } from '../components/TabItem'
import { GroupHeader } from '../components/GroupHeader'

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

interface TreeLayoutProps {
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
  labels: {
    ungrouped: string
  }
}

export function TreeLayout({
  groups,
  activeTabId,
  collapsedGroups,
  onToggleGroup,
  onActivateTab,
  onCloseTab,
  onTabContextMenu,
  onGroupContextMenu,
  showFavicon,
  showCloseButton,
  labels
}: TreeLayoutProps) {
  return (
    <div className="layout-tree">
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
                    groupColor={GROUP_COLOR_MAP[group.color]}
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
  )
}
