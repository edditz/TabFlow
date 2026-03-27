// Background service worker for Tab Tool extension

// Category color mapping for tab groups
function getCategoryColor(category: string): chrome.tabGroups.ColorEnum {
  const colorMap: Record<string, chrome.tabGroups.ColorEnum> = {
    Work: 'blue',
    Development: 'purple',
    Social: 'pink',
    Shopping: 'green',
    Entertainment: 'red',
    News: 'yellow',
    Docs: 'cyan',
    Other: 'grey'
  }
  return colorMap[category] || 'grey'
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

  if (message.type === 'CLASSIFY_TABS') {
    // Create tab groups from classification results
    ;(async () => {
      try {
        const createdGroups: { name: string; groupId: number }[] = []

        for (const group of message.groups) {
          if (group.tabs && group.tabs.length > 0) {
            const tabIds = group.tabs.map((tab: { id: number }) => tab.id)
            const groupId = await chrome.tabs.group({ tabIds })
            await chrome.tabGroups.update(groupId, {
              title: group.name,
              color: getCategoryColor(group.name)
            })
            createdGroups.push({ name: group.name, groupId })
          }
        }

        sendResponse({ success: true, groups: createdGroups })
      } catch (error) {
        console.error('[Tab Tool] Error creating tab groups:', error)
        sendResponse({ success: false, error: String(error) })
      }
    })()
    return true // Required for async response
  }

  return false
})

// Extension installed/updated handler
chrome.runtime.onInstalled.addListener(details => {
  console.log('Tab Tool installed:', details.reason)

  if (details.reason === 'install') {
    // Open options page on first install
    chrome.runtime.openOptionsPage()
  }
})

export {}
