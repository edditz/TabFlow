// Background service worker for TabFlow extension

interface ShortcutKey {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
}

interface ShortcutConfig {
  id: string
  shortcut: ShortcutKey | null
}

const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  { id: 'toggle-search-panel', shortcut: { key: 'a', ctrl: true, meta: true } }
]

// Convert ShortcutKey to Chrome extension shortcut format
function toChromeFormat(shortcut: ShortcutKey | null): string {
  if (!shortcut || !shortcut.key) return ''
  const parts: string[] = []
  if (shortcut.ctrl) parts.push('Ctrl')
  if (shortcut.alt) parts.push('Alt')
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.meta) parts.push('Command')
  let key = shortcut.key.toUpperCase()
  if (key === ' ') key = 'Space'
  if (key.startsWith('ARROW')) key = key.replace('ARROW', '')
  parts.push(key)
  return parts.join('+')
}

// Sync shortcuts from storage to chrome.commands
function syncShortcuts(shortcuts: ShortcutConfig[]): void {
  const commands = chrome.commands as typeof chrome.commands & {
    update: (detail: { name: string; shortcut: string }) => void
  }
  for (const s of shortcuts) {
    const chromeShortcut = toChromeFormat(s.shortcut)
    if (s.id && chromeShortcut) {
      commands.update({ name: s.id, shortcut: chromeShortcut })
    }
  }
}

// Load and sync shortcuts on startup
chrome.storage.sync.get({ shortcuts: DEFAULT_SHORTCUTS }, data => {
  const storedShortcuts = data.shortcuts as ShortcutConfig[] | undefined
  const shortcuts = storedShortcuts?.length === DEFAULT_SHORTCUTS.length
    ? storedShortcuts
    : DEFAULT_SHORTCUTS
  syncShortcuts(shortcuts)
})

// Configure side panel behavior — only open via keyboard shortcut, not action click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })

// Track side panel open state for toggle (Chrome API has no close method)
// Persist to storage so state survives browser restarts
let sidePanelOpen = false

// Load persisted side panel state on startup
chrome.storage.local.get({ sidePanelOpen: false }, data => {
  sidePanelOpen = data.sidePanelOpen
})

function setSidePanelOpen(open: boolean) {
  sidePanelOpen = open
  chrome.storage.local.set({ sidePanelOpen: open })
}

// Listen for keyboard shortcut commands
chrome.commands.onCommand.addListener(command => {
  console.log('Command received:', command)

  if (command === 'toggle-search-panel') {
    // Send message to active tab to toggle search panel
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs[0]
      if (activeTab?.id) {
        chrome.tabs.sendMessage(activeTab.id, { type: 'TOGGLE_SEARCH_PANEL' })
      }
    })
  }

  if (command === 'toggle-side-panel') {
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      const activeTab = tabs[0]
      if (activeTab?.windowId) {
        if (sidePanelOpen) {
          // Close: toggle enabled off to dismiss, then re-enable for next open
          await chrome.sidePanel.setOptions({ enabled: false })
          await chrome.sidePanel.setOptions({ enabled: true, path: 'src/sidepanel/index.html' })
          setSidePanelOpen(false)
        } else {
          await chrome.sidePanel.open({ windowId: activeTab.windowId })
          setSidePanelOpen(true)
        }
      }
    })
  }
})

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message, 'from:', sender)

  if (message.type === 'GET_ALL_TABS') {
    const queryOptions: chrome.tabs.QueryInfo = message.currentWindow ? { currentWindow: true } : {}
    chrome.tabs.query(queryOptions, tabs => {
      chrome.windows.getCurrent(currentWindow => {
        sendResponse({ tabs, currentWindowId: currentWindow?.id })
      })
    })
    return true // Required for async response
  }

  if (message.type === 'GET_TAB_STATS') {
    chrome.tabs.query({}, allTabs => {
      chrome.windows.getAll(windows => {
        chrome.tabs.query({ currentWindow: true }, currentWindowTabs => {
          sendResponse({
            totalTabs: allTabs.length,
            totalWindows: windows.length,
            currentWindowTabs: currentWindowTabs.length
          })
        })
      })
    })
    return true // Required for async response
  }

  if (message.type === 'ACTIVATE_TAB') {
    // Get tab info to find its window, then focus both window and tab
    chrome.tabs.get(message.tabId, tab => {
      if (tab && tab.windowId) {
        // Focus the window first, then activate the tab
        chrome.windows.update(tab.windowId, { focused: true }, () => {
          chrome.tabs.update(message.tabId, { active: true })
        })
      }
    })
    return false
  }

  if (message.type === 'CLOSE_TAB') {
    chrome.tabs.remove(message.tabId, () => {
      sendResponse({ success: true })
    })
    return true
  }

  if (message.type === 'GET_RECENTLY_CLOSED') {
    chrome.sessions.getRecentlyClosed({ maxResults: message.maxResults || 25 }, sessions => {
      sendResponse({ sessions })
    })
    return true
  }

  if (message.type === 'RESTORE_TAB') {
    chrome.sessions.restore(message.sessionId, session => {
      sendResponse({ success: !!session })
    })
    return true
  }

  if (message.type === 'OPEN_OPTIONS_PAGE') {
    chrome.runtime.openOptionsPage()
    return false
  }

  if (message.type === 'UPDATE_SHORTCUTS') {
    syncShortcuts(message.shortcuts as ShortcutConfig[])
    sendResponse({ success: true })
    return true
  }

  if (message.type === 'UNGROUP_ALL') {
    ;(async () => {
      try {
        const tabs = await chrome.tabs.query({ currentWindow: true })
        const groupedTabs = tabs.filter(tab => tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE)
        if (groupedTabs.length > 0) {
          await chrome.tabs.ungroup(groupedTabs.map(tab => tab.id!))
        }
        sendResponse({ success: true, ungroupedCount: groupedTabs.length })
      } catch (error) {
        console.error('[TabFlow] Error ungrouping tabs:', error)
        sendResponse({ success: false, error: String(error) })
      }
    })()
    return true
  }

  return false
})

// Extension installed/updated handler
chrome.runtime.onInstalled.addListener(details => {
  console.log('TabFlow installed:', details.reason)

  if (details.reason === 'install') {
    // Open options page on first install
    chrome.runtime.openOptionsPage()
  }
})

export {}
