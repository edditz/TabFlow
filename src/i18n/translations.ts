export type Language = 'en' | 'zh'

export interface TranslationKeys {
  // Header
  settingsTitle: string
  settingsSubtitle: string

  // Keyboard Shortcuts Section
  keyboardShortcuts: string
  toggleSearchPanel: string
  toggleSearchPanelDesc: string
  openExtensionPopup: string
  openExtensionPopupDesc: string
  clickToRecord: string
  recording: string
  resetToDefault: string
  shortcutConflict: string

  // General Settings Section
  generalSettings: string
  enableSearchPanel: string
  enableSearchPanelDesc: string
  showTabCountBadge: string
  showTabCountBadgeDesc: string
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
}

export const translations: Record<Language, TranslationKeys> = {
  en: {
    // Header
    settingsTitle: 'Tab Tool Settings',
    settingsSubtitle: 'Configure your tab management preferences',

    // Keyboard Shortcuts Section
    keyboardShortcuts: 'Keyboard Shortcuts',
    toggleSearchPanel: 'Toggle Search Panel',
    toggleSearchPanelDesc: 'Open/close the global tab search panel',
    openExtensionPopup: 'Open Extension Popup',
    openExtensionPopupDesc: 'Open the extension popup window',
    clickToRecord: 'Click to record...',
    recording: 'Recording...',
    resetToDefault: 'Reset to Default',
    shortcutConflict: 'This shortcut conflicts with another',

    // General Settings Section
    generalSettings: 'General Settings',
    enableSearchPanel: 'Enable Search Panel',
    enableSearchPanelDesc: 'Show the global search panel on any page',
    showTabCountBadge: 'Show Tab Count Badge',
    showTabCountBadgeDesc: 'Display the number of open tabs on the extension icon',
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
  },
  zh: {
    // Header
    settingsTitle: 'Tab Tool 设置',
    settingsSubtitle: '配置您的标签页管理偏好',

    // Keyboard Shortcuts Section
    keyboardShortcuts: '键盘快捷键',
    toggleSearchPanel: '切换搜索面板',
    toggleSearchPanelDesc: '打开/关闭全局标签页搜索面板',
    openExtensionPopup: '打开扩展弹窗',
    openExtensionPopupDesc: '打开扩展弹出窗口',
    clickToRecord: '点击录入...',
    recording: '录入中...',
    resetToDefault: '恢复默认',
    shortcutConflict: '快捷键冲突',

    // General Settings Section
    generalSettings: '常规设置',
    enableSearchPanel: '启用搜索面板',
    enableSearchPanelDesc: '在任意页面显示全局搜索面板',
    showTabCountBadge: '显示标签页数量徽章',
    showTabCountBadgeDesc: '在扩展图标上显示打开的标签页数量',
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
  },
}
