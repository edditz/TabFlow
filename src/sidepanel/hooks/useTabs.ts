import { useState, useEffect, useCallback, useRef } from 'react'

export function useTabs() {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<number | undefined>()
  // Monotonic request id: only the most recent query's callback is allowed to
  // write state. Closing the active tab fires onActivated + onRemoved back to
  // back, each triggering a full re-query. If an earlier query resolves after
  // a later one (callback reordering), its stale snapshot would otherwise
  // overwrite the fresh one — re-rendering an already-closed tab for a frame
  // and showing up as an intermittent list jitter.
  const refreshRequestIdRef = useRef(0)

  const refreshTabs = useCallback(() => {
    refreshRequestIdRef.current += 1
    const requestId = refreshRequestIdRef.current
    chrome.tabs.query({ currentWindow: true }, currentTabs => {
      if (requestId !== refreshRequestIdRef.current) return
      setTabs(currentTabs)
      // Derive activeTabId from the same snapshot so tabs and activeTabId
      // update in a single render. Two separate queries could resolve in
      // different ticks, briefly mismatching the active highlight.
      const activeTab = currentTabs.find(tab => tab.active)
      setActiveTabId(activeTab?.id)
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
