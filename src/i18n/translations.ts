export type Language = 'en' | 'zh'

export interface TranslationKeys {
  // Header
  settingsTitle: string
  settingsSubtitle: string

  // Keyboard Shortcuts Section
  keyboardShortcuts: string
  toggleSearchPanel: string
  toggleSearchPanelDesc: string
  toggleSidePanel: string
  toggleSidePanelDesc: string
  clickToRecord: string
  recording: string
  resetToDefault: string
  shortcutConflict: string

  // General Settings Section
  generalSettings: string
  enableSearchPanel: string
  enableSearchPanelDesc: string
  theme: string
  themeDesc: string
  themeSystem: string
  themeLight: string
  themeDark: string
  language: string
  languageDesc: string
  languageEn: string
  languageZh: string

  // Search Settings Section
  searchSettings: string
  searchCurrentWindowOnly: string
  searchCurrentWindowOnlyDesc: string
  urlDisplayStyle: string
  urlDisplayStyleDesc: string
  urlDisplayStyleNone: string
  urlDisplayStyleDomain: string
  urlDisplayStyleFull: string

  // Footer
  settingsSaved: string

  // Recently Closed Settings Section
  recentClosedSettings: string
  enableRecentClosed: string
  enableRecentClosedDesc: string
  recentClosedTimeWindow: string
  recentClosedTimeWindowDesc: string
  recentClosedMaxResults: string
  recentClosedMaxResultsDesc: string
  hours: string

  // Search Panel
  searchTabs: string
  searchTabsDesc: string
  searchPlaceholder: string
  noTabsFound: string
  closeTab: string
  navigate: string
  open: string
  close: string
  searchPanelDisabled: string
  searchPanelDisabledHint: string
  tabs: string
  windows: string
  currentWindowTabs: string
  otherWindow: string
  recentClosedSection: string
  recentClosedEmpty: string
  restoreTab: string

  // Popup
  popupSearchTabs: string
  popupSettings: string
  popupUngroupAll: string
  popupOpenSidebar: string

  // Sidebar
  sidebarTitle: string
  sidebarLayout: string
  layoutCompact: string
  layoutCard: string
  layoutTree: string
  recentTabs: string
  noGroupsYet: string
  ungrouped: string
  newGroup: string
  renameGroup: string
  changeColor: string
  closeGroup: string
  closeGroupTabs: string
  ungroup: string
  moveToGroup: string
  removeFromGroup: string
  closeOtherTabs: string
  copyUrl: string
  noTabsOpen: string
  noTabsOpenHint: string
  sidebarSettings: string
  sidebarLayoutDesc: string
  sidebarShowDomain: string
  sidebarShowDomainDesc: string
  sidebarShowFavicon: string
  sidebarShowFaviconDesc: string
  sidebarShowCloseButton: string
  sidebarShowCloseButtonDesc: string
  sidebarDefaultExpanded: string
  sidebarDefaultExpandedDesc: string
  sidebarRecentCount: string
  sidebarRecentCountDesc: string
  sidebarShowRecent: string
  sidebarShowRecentDesc: string
  sidebarShowGroupTag: string
  sidebarShowGroupTagDesc: string
  justNow: string
  minutesAgo: string
  hoursAgo: string
  daysAgo: string
  groupCollapsed: string
  groupExpanded: string
  tabCount: string
}

export const translations: Record<Language, TranslationKeys> = {
  en: {
    // Header
    settingsTitle: 'TabFlow Settings',
    settingsSubtitle: 'Configure your tab management preferences',

    // Keyboard Shortcuts Section
    keyboardShortcuts: 'Keyboard Shortcuts',
    toggleSearchPanel: 'Toggle Search Panel',
    toggleSearchPanelDesc: 'Open/close the global tab search panel',
    toggleSidePanel: 'Toggle Sidebar',
    toggleSidePanelDesc: 'Open/close the sidebar tab manager',
    clickToRecord: 'Click to record...',
    recording: 'Recording...',
    resetToDefault: 'Reset to Default',
    shortcutConflict: 'This shortcut conflicts with another',

    // General Settings Section
    generalSettings: 'General Settings',
    enableSearchPanel: 'Enable Search Panel',
    enableSearchPanelDesc: 'Show the global search panel on any page',
    theme: 'Theme',
    themeDesc: 'Choose the appearance of the search panel',
    themeSystem: 'System Default',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language',
    languageDesc: 'Choose the display language',
    languageEn: 'English',
    languageZh: 'Chinese',

    // Search Settings Section
    searchSettings: 'Search Settings',
    searchCurrentWindowOnly: 'Search Current Window Only',
    searchCurrentWindowOnlyDesc: 'Limit results to tabs from the active window',
    urlDisplayStyle: 'URL Display Style',
    urlDisplayStyleDesc: 'Choose how to display URL in search results',
    urlDisplayStyleNone: 'Hide URL',
    urlDisplayStyleDomain: 'Domain Only',
    urlDisplayStyleFull: 'Full URL',

    // Footer
    settingsSaved: 'Settings saved',

    // Recently Closed Settings Section
    recentClosedSettings: 'Recently Closed Settings',
    enableRecentClosed: 'Enable Recently Closed Search',
    enableRecentClosedDesc: 'Show recently closed tabs in search panel',
    recentClosedTimeWindow: 'Time Window',
    recentClosedTimeWindowDesc: 'Show tabs closed within this time',
    recentClosedMaxResults: 'Maximum Results',
    recentClosedMaxResultsDesc: 'Maximum number of recently closed tabs to show',
    hours: 'hours',

    // Search Panel
    searchTabs: 'Search Tabs',
    searchTabsDesc: 'Find and jump to any open browser tab.',
    searchPlaceholder: 'Search title, url, or domain...',
    noTabsFound: 'No tabs found',
    closeTab: 'Close tab',
    navigate: 'Navigate',
    open: 'Open',
    close: 'Close',
    searchPanelDisabled: 'Search Panel is Disabled',
    searchPanelDisabledHint: 'Enable it in extension settings',
    tabs: 'tabs',
    windows: 'windows',
    currentWindowTabs: 'current window',
    otherWindow: 'Other window',
    recentClosedSection: 'Recently Closed',
    recentClosedEmpty: 'No recently closed tabs',
    restoreTab: 'Restore',

    // Popup
    popupSearchTabs: 'Search Tabs',
    popupSettings: 'Settings',
    popupUngroupAll: 'Ungroup All',
    popupOpenSidebar: 'Open Sidebar',

    // Sidebar
    sidebarTitle: 'TabFlow',
    sidebarLayout: 'Layout',
    layoutCompact: 'Compact',
    layoutCard: 'Card',
    layoutTree: 'Tree',
    recentTabs: 'Recently Closed',
    noGroupsYet: 'No tab groups',
    ungrouped: 'Ungrouped',
    newGroup: 'New Group',
    renameGroup: 'Rename',
    changeColor: 'Change Color',
    closeGroup: 'Ungroup',
    closeGroupTabs: 'Close All Tabs',
    ungroup: 'Ungroup',
    moveToGroup: 'Move to Group',
    removeFromGroup: 'Remove from Group',
    closeOtherTabs: 'Close Other Tabs',
    copyUrl: 'Copy URL',
    noTabsOpen: 'No tabs open',
    noTabsOpenHint: 'Open a tab to see it here',
    sidebarSettings: 'Sidebar Settings',
    sidebarLayoutDesc: 'Choose the sidebar layout style',
    sidebarShowDomain: 'Show Domain',
    sidebarShowDomainDesc: 'Display the domain name under each tab',
    sidebarShowFavicon: 'Show Favicon',
    sidebarShowFaviconDesc: 'Display website icons for each tab',
    sidebarShowCloseButton: 'Show Close Button',
    sidebarShowCloseButtonDesc: 'Show close button on hover',
    sidebarDefaultExpanded: 'Expand All Groups',
    sidebarDefaultExpandedDesc: 'Expand all groups by default',
    sidebarRecentCount: 'Recent Tabs Count',
    sidebarRecentCountDesc: 'Number of recently closed tabs to show',
    sidebarShowRecent: 'Show Recently Closed',
    sidebarShowRecentDesc: 'Show recently closed tabs section in the sidebar',
    sidebarShowGroupTag: 'Show Group Tag',
    sidebarShowGroupTagDesc: 'Display group name tag on each card',
    justNow: 'just now',
    minutesAgo: '{n} min ago',
    hoursAgo: '{n}h ago',
    daysAgo: '{n}d ago',
    groupCollapsed: 'Collapsed',
    groupExpanded: 'Expanded',
    tabCount: '{count} tabs'
  },
  zh: {
    // Header
    settingsTitle: 'TabFlow 设置',
    settingsSubtitle: '配置您的标签页管理偏好',

    // Keyboard Shortcuts Section
    keyboardShortcuts: '键盘快捷键',
    toggleSearchPanel: '切换搜索面板',
    toggleSearchPanelDesc: '打开/关闭全局标签页搜索面板',
    toggleSidePanel: '切换侧边栏',
    toggleSidePanelDesc: '打开/关闭侧边栏标签页管理器',
    clickToRecord: '点击录入...',
    recording: '录入中...',
    resetToDefault: '恢复默认',
    shortcutConflict: '快捷键冲突',

    // General Settings Section
    generalSettings: '常规设置',
    enableSearchPanel: '启用搜索面板',
    enableSearchPanelDesc: '在任意页面显示全局搜索面板',
    theme: '主题',
    themeDesc: '选择搜索面板的外观',
    themeSystem: '跟随系统',
    themeLight: '浅色',
    themeDark: '深色',
    language: '语言',
    languageDesc: '选择显示语言',
    languageEn: '英文',
    languageZh: '中文',

    // Search Settings Section
    searchSettings: '搜索设置',
    searchCurrentWindowOnly: '仅搜索当前窗口',
    searchCurrentWindowOnlyDesc: '将结果限制为当前活动窗口的标签页',
    urlDisplayStyle: 'URL 显示样式',
    urlDisplayStyleDesc: '选择搜索结果中 URL 的显示方式',
    urlDisplayStyleNone: '不显示',
    urlDisplayStyleDomain: '仅显示域名',
    urlDisplayStyleFull: '显示完整 URL',

    // Footer
    settingsSaved: '设置已保存',

    // Recently Closed Settings Section
    recentClosedSettings: '最近关闭设置',
    enableRecentClosed: '启用最近关闭搜索',
    enableRecentClosedDesc: '在搜索面板中显示最近关闭的标签页',
    recentClosedTimeWindow: '时间窗口',
    recentClosedTimeWindowDesc: '显示过去多久时间内关闭的标签页',
    recentClosedMaxResults: '最大数量',
    recentClosedMaxResultsDesc: '最多显示多少个最近关闭的标签页',
    hours: '小时',

    // Search Panel
    searchTabs: '搜索标签页',
    searchTabsDesc: '查找并跳转到任意打开的浏览器标签页。',
    searchPlaceholder: '搜索标题、网址或域名...',
    noTabsFound: '未找到标签页',
    closeTab: '关闭标签页',
    navigate: '导航',
    open: '打开',
    close: '关闭',
    searchPanelDisabled: '搜索面板已禁用',
    searchPanelDisabledHint: '请在扩展设置中启用',
    tabs: '个标签页',
    windows: '个窗口',
    currentWindowTabs: '当前窗口',
    otherWindow: '其他窗口',
    recentClosedSection: '最近关闭',
    recentClosedEmpty: '没有最近关闭的标签页',
    restoreTab: '恢复',

    // Popup
    popupSearchTabs: '搜索标签页',
    popupSettings: '设置',
    popupUngroupAll: '取消所有分组',
    popupOpenSidebar: '打开侧边栏',

    // Sidebar
    sidebarTitle: 'TabFlow',
    sidebarLayout: '布局',
    layoutCompact: '紧凑',
    layoutCard: '卡片',
    layoutTree: '树形',
    recentTabs: '最近关闭',
    noGroupsYet: '暂无标签分组',
    ungrouped: '未分组',
    newGroup: '新建分组',
    renameGroup: '重命名',
    changeColor: '更改颜色',
    closeGroup: '取消分组',
    closeGroupTabs: '关闭所有标签',
    ungroup: '取消分组',
    moveToGroup: '移动到分组',
    removeFromGroup: '从分组中移除',
    closeOtherTabs: '关闭其他标签',
    copyUrl: '复制链接',
    noTabsOpen: '没有打开的标签页',
    noTabsOpenHint: '打开一个标签页即可在此显示',
    sidebarSettings: '侧边栏设置',
    sidebarLayoutDesc: '选择侧边栏的布局样式',
    sidebarShowDomain: '显示域名',
    sidebarShowDomainDesc: '在每个标签下方显示域名',
    sidebarShowFavicon: '显示图标',
    sidebarShowFaviconDesc: '为每个标签显示网站图标',
    sidebarShowCloseButton: '显示关闭按钮',
    sidebarShowCloseButtonDesc: '悬停时显示关闭按钮',
    sidebarDefaultExpanded: '展开所有分组',
    sidebarDefaultExpandedDesc: '默认展开所有分组',
    sidebarRecentCount: '最近关闭数量',
    sidebarRecentCountDesc: '显示最近关闭的标签页数量',
    sidebarShowRecent: '显示最近关闭',
    sidebarShowRecentDesc: '在侧边栏显示最近关闭的标签页',
    sidebarShowGroupTag: '显示分组标签',
    sidebarShowGroupTagDesc: '在每张卡片上显示分组名称标签',
    justNow: '刚刚',
    minutesAgo: '{n} 分钟前',
    hoursAgo: '{n} 小时前',
    daysAgo: '{n} 天前',
    groupCollapsed: '已折叠',
    groupExpanded: '已展开',
    tabCount: '{count} 个标签'
  }
}
