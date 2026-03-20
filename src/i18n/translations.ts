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
  alwaysShowTabUrl: string
  alwaysShowTabUrlDesc: string

  // Footer
  settingsSaved: string

  // Search Panel
  searchTabs: string
  searchTabsDesc: string
  searchPlaceholder: string
  noTabsFound: string
  closeTab: string
  navigate: string
  open: string
  close: string
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
    alwaysShowTabUrl: 'Always Show Tab URL',
    alwaysShowTabUrlDesc: 'Keep URL visible in candidate rows',

    // Footer
    settingsSaved: 'Settings saved',

    // Search Panel
    searchTabs: 'Search Tabs',
    searchTabsDesc: 'Find and jump to any open browser tab.',
    searchPlaceholder: 'Search title, url, or domain...',
    noTabsFound: 'No tabs found',
    closeTab: 'Close tab',
    navigate: 'Navigate',
    open: 'Open',
    close: 'Close',
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
    alwaysShowTabUrl: '始终显示标签页 URL',
    alwaysShowTabUrlDesc: '在候选行中保持 URL 可见',

    // Footer
    settingsSaved: '设置已保存',

    // Search Panel
    searchTabs: '搜索标签页',
    searchTabsDesc: '查找并跳转到任意打开的浏览器标签页。',
    searchPlaceholder: '搜索标题、网址或域名...',
    noTabsFound: '未找到标签页',
    closeTab: '关闭标签页',
    navigate: '导航',
    open: '打开',
    close: '关闭',
  },
}
