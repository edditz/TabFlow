import { useState, useEffect, useCallback } from 'react'

export function useTabs() {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<number | undefined>()

  const refreshTabs = useCallback(() => {
    chrome.tabs.query({ currentWindow: true }, currentTabs => {
      setTabs(currentTabs)
    })
    chrome.tabs.query({ active: true, currentWindow: true }, activeTabs => {
      setActiveTabId(activeTabs[0]?.id)
    })
  }, [])

  useEffect(() => {
    refreshTabs()

    chrome.tabs.onCreated.addListener(refreshTabs)
    chrome.tabs.onRemoved.addListener(refreshTabs)
    chrome.tabs.onUpdated.addListener(refreshTabs)
    chrome.tabs.onActivated.addListener(refreshTabs)
    chrome.tabs.onMoved.addListener(refreshTabs)
    chrome.tabs.onAttached.addListener(refreshTabs)
    chrome.tabs.onDetached.addListener(refreshTabs)

    return () => {
      chrome.tabs.onCreated.removeListener(refreshTabs)
      chrome.tabs.onRemoved.removeListener(refreshTabs)
      chrome.tabs.onUpdated.removeListener(refreshTabs)
      chrome.tabs.onActivated.removeListener(refreshTabs)
      chrome.tabs.onMoved.removeListener(refreshTabs)
      chrome.tabs.onAttached.removeListener(refreshTabs)
      chrome.tabs.onDetached.removeListener(refreshTabs)
    }
  }, [refreshTabs])

  const activateTab = useCallback((tabId: number) => {
    chrome.tabs.update(tabId, { active: true })
  }, [])

  const closeTab = useCallback((tabId: number) => {
    chrome.tabs.remove(tabId)
  }, [])

  return { tabs, activeTabId, activateTab, closeTab, refreshTabs }
}
