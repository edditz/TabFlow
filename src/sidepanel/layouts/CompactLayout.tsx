import type { TabGroup } from '../types'
import { TabItem } from '../components/TabItem'

interface CompactLayoutProps {
  groups: TabGroup[]
  activeTabId?: number
  onActivateTab: (tabId: number) => void
  onCloseTab: (tabId: number) => void
  onTabContextMenu: (e: React.MouseEvent, tabId: number) => void
  showFavicon: boolean
  showCloseButton: boolean
}

export function CompactLayout({
  groups,
  activeTabId,
  onActivateTab,
  onCloseTab,
  onTabContextMenu,
  showFavicon,
  showCloseButton
}: CompactLayoutProps) {
  const allTabs = groups.flatMap(group => group.tabs)

  return (
    <div className="layout-compact">
      {allTabs.map(tab => (
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
          onContextMenu={e => onTabContextMenu(e, tab.id!)}
        />
      ))}
    </div>
  )
}
