import type { TabGroup } from '../types'
import { TabItem } from '../components/TabItem'

interface DetailedLayoutProps {
  groups: TabGroup[]
  activeTabId?: number
  onActivateTab: (tabId: number) => void
  onCloseTab: (tabId: number) => void
  onTabContextMenu: (e: React.MouseEvent, tabId: number) => void
  showFavicon: boolean
  showDomain: boolean
  showCloseButton: boolean
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

export function DetailedLayout({
  groups,
  activeTabId,
  onActivateTab,
  onCloseTab,
  onTabContextMenu,
  showFavicon,
  showDomain,
  showCloseButton
}: DetailedLayoutProps) {
  const allTabs = groups.flatMap((group) =>
    group.tabs.map((tab) => ({
      tab,
      groupColor: GROUP_COLOR_MAP[group.color] || GROUP_COLOR_MAP.grey
    }))
  )

  return (
    <div className="layout-detailed">
      {allTabs.map(({ tab, groupColor }) => (
        <TabItem
          key={tab.id}
          title={tab.title || ''}
          url={tab.url}
          favIconUrl={tab.favIconUrl}
          isActive={tab.id === activeTabId}
          showDomain={showDomain}
          showFavicon={showFavicon}
          showCloseButton={showCloseButton}
          groupColor={groupColor}
          variant="detailed"
          onActivate={() => onActivateTab(tab.id!)}
          onClose={() => onCloseTab(tab.id!)}
          onContextMenu={(e) => onTabContextMenu(e, tab.id!)}
        />
      ))}
    </div>
  )
}
