export type SidebarLayout = 'compact' | 'detailed' | 'tree'

export interface SidebarSettings {
  sidebarLayout: SidebarLayout
  sidebarShowDomain: boolean
  sidebarShowFavicon: boolean
  sidebarShowCloseButton: boolean
  sidebarDefaultExpanded: boolean
  sidebarRecentCount: number
}

export const DEFAULT_SIDEBAR_SETTINGS: SidebarSettings = {
  sidebarLayout: 'compact',
  sidebarShowDomain: true,
  sidebarShowFavicon: true,
  sidebarShowCloseButton: true,
  sidebarDefaultExpanded: true,
  sidebarRecentCount: 10
}

export interface TabGroup {
  id: number
  title: string
  color: chrome.tabGroups.ColorEnum
  collapsed: boolean
  tabs: chrome.tabs.Tab[]
}

export interface RecentTab {
  sessionId: string
  title: string
  url: string
  favIconUrl?: string
  lastModified: number
}

export interface ContextMenuAction {
  id: string
  label: string
  icon?: string
  children?: ContextMenuAction[]
}
