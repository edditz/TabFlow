// Background service worker for Tab Tool extension

// Listen for keyboard shortcut commands
chrome.commands.onCommand.addListener((command) => {
  console.log('Command received:', command)

  if (command === 'toggle-search-panel') {
    // Send message to active tab to toggle search panel
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
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
    const queryOptions: chrome.tabs.QueryInfo = message.currentWindow
      ? { currentWindow: true }
      : {}
    chrome.tabs.query(queryOptions, (tabs) => {
      sendResponse({ tabs })
    })
    return true // Required for async response
  }

  if (message.type === 'GET_TAB_STATS') {
    chrome.tabs.query({}, (allTabs) => {
      chrome.windows.getAll((windows) => {
        chrome.tabs.query({ currentWindow: true }, (currentWindowTabs) => {
          sendResponse({
            totalTabs: allTabs.length,
            totalWindows: windows.length,
            currentWindowTabs: currentWindowTabs.length,
          })
        })
      })
    })
    return true // Required for async response
  }

  if (message.type === 'ACTIVATE_TAB') {
    // Get tab info to find its window, then focus both window and tab
    chrome.tabs.get(message.tabId, (tab) => {
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

  return false
})

// Extension installed/updated handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Tab Tool installed:', details.reason)

  if (details.reason === 'install') {
    // Open options page on first install
    chrome.runtime.openOptionsPage()
  }
})

export {}
