import { useState, useCallback, useMemo, useRef } from 'react'
import './App.css'
import { useTabs } from './hooks/useTabs'
import { useTabGroups } from './hooks/useTabGroups'
import { useRecentTabs } from './hooks/useRecentTabs'
import { useSidebarSettings } from './hooks/useSidebarSettings'
import { SidebarHeader } from './components/SidebarHeader'
import { CompactLayout } from './layouts/CompactLayout'
import { CardLayout } from './layouts/CardLayout'
import { TreeLayout } from './layouts/TreeLayout'
import { ContextMenu, type MenuItem } from './components/ContextMenu'
import { useTranslation } from '../i18n'

export function App() {
  const { t } = useTranslation()
  const { settings, updateLayout } = useSidebarSettings()
  const { tabs, activeTabId, activateTab, closeTab } = useTabs()
  const {
    groups,
    renameGroup,
    changeGroupColor,
    ungroupTabs,
    moveTabToGroup,
    closeGroupTabs
  } = useTabGroups(tabs)
  const { recentTabs, restoreTab } = useRecentTabs(settings.sidebarRecentCount)

  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set())
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    items: MenuItem[]
  } | null>(null)

  // Track which tab/group the context menu is for
  const contextTabIdRef = useRef<number | null>(null)
  const contextGroupIdRef = useRef<number | null>(null)

  const handleToggleGroup = useCallback((groupId: number) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }, [])

  const handleOpenSettings = useCallback(() => {
    chrome.runtime.openOptionsPage()
  }, [])

  const handleTabContextMenu = useCallback((e: React.MouseEvent, tabId: number) => {
    e.preventDefault()
    contextTabIdRef.current = tabId
    contextGroupIdRef.current = null

    const currentGroup = groups.find(g => g.tabs.some(tab => tab.id === tabId))

    const groupItems: MenuItem[] = groups
      .filter(g => g.id !== chrome.tabGroups.TAB_GROUP_ID_NONE && g.id !== currentGroup?.id)
      .map(g => ({
        id: `move-to-${g.id}`,
        label: g.title
      }))

    const items: MenuItem[] = [
      ...(groupItems.length > 0
        ? [{ id: 'move-to-group', label: t.moveToGroup, children: groupItems }]
        : []),
      ...(currentGroup && currentGroup.id !== chrome.tabGroups.TAB_GROUP_ID_NONE
        ? [{ id: 'remove-from-group', label: t.removeFromGroup }]
        : []),
      { id: 'divider-1', label: '', divider: true },
      { id: 'close-other-tabs', label: t.closeOtherTabs },
      { id: 'copy-url', label: t.copyUrl },
      { id: 'divider-2', label: '', divider: true },
      { id: 'close-tab', label: t.closeTab, danger: true }
    ]

    setContextMenu({ x: e.clientX, y: e.clientY, items })
  }, [groups, t])

  const handleGroupContextMenu = useCallback((e: React.MouseEvent, groupId: number) => {
    e.preventDefault()
    contextGroupIdRef.current = groupId
    contextTabIdRef.current = null

    const items: MenuItem[] = [
      { id: 'rename-group', label: t.renameGroup },
      { id: 'change-color', label: t.changeColor },
      { id: 'divider-1', label: '', divider: true },
      { id: 'close-group-tabs', label: t.closeGroupTabs, danger: true },
      { id: 'ungroup', label: t.ungroup }
    ]

    setContextMenu({ x: e.clientX, y: e.clientY, items })
  }, [groups, t])

  const handleContextAction = useCallback(async (actionId: string) => {
    const tabId = contextTabIdRef.current
    const groupId = contextGroupIdRef.current

    if (actionId === 'close-tab' && tabId !== null) {
      closeTab(tabId)
    }

    if (actionId.startsWith('move-to-')) {
      const targetGroupId = parseInt(actionId.replace('move-to-', ''), 10)
      if (tabId !== null) {
        await moveTabToGroup(tabId, targetGroupId)
      }
    }

    if (actionId === 'remove-from-group' && tabId !== null) {
      await moveTabToGroup(tabId, chrome.tabGroups.TAB_GROUP_ID_NONE)
    }

    if (actionId === 'close-other-tabs' && tabId !== null) {
      const currentGroup = groups.find(g => g.tabs.some(tab => tab.id === tabId))
      if (currentGroup) {
        const otherTabIds = currentGroup.tabs
          .filter(tab => tab.id !== tabId && tab.id !== null)
          .map(tab => tab.id as number)
        if (otherTabIds.length > 0) {
          chrome.tabs.remove(otherTabIds)
        }
      }
    }

    if (actionId === 'copy-url' && tabId !== null) {
      const tab = tabs.find(tb => tb.id === tabId)
      if (tab?.url) {
        await navigator.clipboard.writeText(tab.url)
      }
    }

    if (actionId === 'ungroup' && groupId !== null) {
      const group = groups.find(g => g.id === groupId)
      if (group) {
        const tabIds = group.tabs
          .filter(tab => tab.id !== null)
          .map(tab => tab.id as number)
        ungroupTabs(tabIds)
      }
    }

    if (actionId === 'close-group-tabs' && groupId !== null) {
      const group = groups.find(g => g.id === groupId)
      if (group) {
        closeGroupTabs(group.tabs)
      }
    }

    if (actionId === 'rename-group' && groupId !== null) {
      const newName = prompt('Enter new group name:')
      if (newName) {
        renameGroup(groupId, newName)
      }
    }

    if (actionId === 'change-color' && groupId !== null) {
      const colors: chrome.tabGroups.ColorEnum[] = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan']
      const color = prompt(`Choose color: ${colors.join(', ')}`)
      if (color && colors.includes(color as chrome.tabGroups.ColorEnum)) {
        changeGroupColor(groupId, color as chrome.tabGroups.ColorEnum)
      }
    }
  }, [closeTab, moveTabToGroup, groups, tabs, ungroupTabs, closeGroupTabs, renameGroup, changeGroupColor])

  const layoutLabels = useMemo(() => ({
    sidebarTitle: t.sidebarTitle,
    layoutCompact: t.layoutCompact,
    layoutCard: t.layoutCard,
    layoutTree: t.layoutTree
  }), [t])

  return (
    <div className="sidebar-container">
      <SidebarHeader
        layout={settings.sidebarLayout}
        onLayoutChange={updateLayout}
        onOpenSettings={handleOpenSettings}
        labels={layoutLabels}
      />

      {tabs.length === 0 ? (
        <div className="sidebar-empty">
          <p className="sidebar-empty-title">{t.noTabsOpen}</p>
          <p className="sidebar-empty-hint">{t.noTabsOpenHint}</p>
        </div>
      ) : (
        <>
          {settings.sidebarLayout === 'compact' && (
            <CompactLayout
              groups={groups}
              activeTabId={activeTabId}
              onActivateTab={activateTab}
              onCloseTab={closeTab}
              onTabContextMenu={handleTabContextMenu}
              showFavicon={settings.sidebarShowFavicon}
              showCloseButton={settings.sidebarShowCloseButton}
            />
          )}
          {settings.sidebarLayout === 'detailed' && (
            <CardLayout
              groups={groups}
              activeTabId={activeTabId}
              onActivateTab={activateTab}
              onCloseTab={closeTab}
              onTabContextMenu={handleTabContextMenu}
              showFavicon={settings.sidebarShowFavicon}
              showGroupTag={settings.sidebarShowGroupTag}
              showCloseButton={settings.sidebarShowCloseButton}
              labels={{
                justNow: t.justNow,
                minutesAgo: t.minutesAgo,
                hoursAgo: t.hoursAgo,
                daysAgo: t.daysAgo
              }}
            />
          )}
          {settings.sidebarLayout === 'tree' && (
            <TreeLayout
              groups={groups}
              activeTabId={activeTabId}
              collapsedGroups={collapsedGroups}
              onToggleGroup={handleToggleGroup}
              onActivateTab={activateTab}
              onCloseTab={closeTab}
              onTabContextMenu={handleTabContextMenu}
              onGroupContextMenu={handleGroupContextMenu}
              showFavicon={settings.sidebarShowFavicon}
              showCloseButton={settings.sidebarShowCloseButton}
              labels={{
                ungrouped: t.ungrouped
              }}
            />
          )}
        </>
      )}

      {settings.sidebarShowRecent && recentTabs.length > 0 && (
        <div className="sidebar-recent-section">
          <div className="sidebar-section-title">{t.recentTabs}</div>
          {recentTabs.slice(0, settings.sidebarRecentCount).map(tab => (
            <div
              key={tab.sessionId}
              className="recent-tab-item"
              onClick={() => restoreTab(tab.sessionId)}
            >
              <div className="tab-favicon">
                {tab.favIconUrl ? (
                  <img src={tab.favIconUrl} alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <div className="tab-favicon-placeholder" />
                )}
              </div>
              <div className="tab-info">
                <div className="tab-title">{tab.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
          onAction={handleContextAction}
        />
      )}
    </div>
  )
}
