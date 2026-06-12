import { useState, useEffect, useCallback } from 'react'
import type { RecentTab } from '../types'

export function useRecentTabs(maxResults: number = 10) {
  const [recentTabs, setRecentTabs] = useState<RecentTab[]>([])

  const refreshRecentTabs = useCallback(() => {
    chrome.sessions.getRecentlyClosed({ maxResults }, sessions => {
      const tabs = sessions
        .filter(session => session.tab)
        .map(session => ({
          sessionId: session.tab!.sessionId!,
          title: session.tab!.title || 'Untitled',
          url: session.tab!.url || '',
          favIconUrl: session.tab!.favIconUrl,
          lastModified: session.lastModified || 0
        }))
      setRecentTabs(tabs)
    })
  }, [maxResults])

  useEffect(() => {
    refreshRecentTabs()
    chrome.tabs.onRemoved.addListener(refreshRecentTabs)
    return () => {
      chrome.tabs.onRemoved.removeListener(refreshRecentTabs)
    }
  }, [refreshRecentTabs])

  const restoreTab = useCallback((sessionId: string) => {
    chrome.sessions.restore(sessionId)
  }, [])

  return { recentTabs, restoreTab, refreshRecentTabs }
}
