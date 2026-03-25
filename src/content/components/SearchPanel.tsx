import { useState, useEffect, useRef, useCallback } from 'react'
import type { KeyboardEvent } from 'react'
import { translations, type Language } from '../../i18n'
import type { UrlDisplayStyle } from '../../options/App'
import './SearchPanel.css'

interface TabResult {
  id: number
  title: string
  url: string
  favIconUrl?: string
  windowId: number
}

interface ClosedTab {
  sessionId: string
  title: string
  url: string
  favIconUrl?: string
  closedAt: number
}

interface SearchPanelProps {
  onCloseComplete: () => void
  registerCloseCallback: (callback: () => void) => void
  theme: 'light' | 'dark'
  language: Language
  urlDisplayStyle: UrlDisplayStyle
  searchCurrentWindow: boolean
  enableRecentClosed: boolean
  recentClosedTimeWindow: number
  recentClosedMaxResults: number
}

// Extract domain from URL for display
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}

// Format relative time (e.g., "5 minutes ago", "2 hours ago")
function formatRelativeTime(timestamp: number, language: Language): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 1) {
    return language === 'zh' ? '刚刚' : 'Just now'
  } else if (minutes < 60) {
    return language === 'zh' ? `${minutes}分钟前` : `${minutes}m ago`
  } else if (hours < 24) {
    return language === 'zh' ? `${hours}小时前` : `${hours}h ago`
  } else {
    const days = Math.floor(hours / 24)
    return language === 'zh' ? `${days}天前` : `${days}d ago`
  }
}

export function SearchPanel({
  onCloseComplete,
  registerCloseCallback,
  theme,
  language,
  urlDisplayStyle,
  searchCurrentWindow,
  enableRecentClosed,
  recentClosedTimeWindow,
  recentClosedMaxResults
}: SearchPanelProps) {
  const t = translations[language]
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TabResult[]>([])
  const [closedTabs, setClosedTabs] = useState<ClosedTab[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isKeyboardNav, setIsKeyboardNav] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [stats, setStats] = useState<{
    totalTabs: number
    totalWindows: number
    currentWindowTabs: number
  } | null>(null)
  const [currentWindowId, setCurrentWindowId] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedItemRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle close with exit animation
  const handleClose = useCallback(() => {
    setIsClosing(true)
  }, [])

  // Register close callback for external triggers (e.g., keyboard shortcut)
  useEffect(() => {
    registerCloseCallback(handleClose)
  }, [registerCloseCallback, handleClose])

  // Prevent body scroll when panel is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Fetch real tabs from all windows via background script
  useEffect(() => {
    const fetchTabs = async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'GET_ALL_TABS',
          currentWindow: searchCurrentWindow
        })
        if (response?.tabs) {
          if (response.currentWindowId) {
            setCurrentWindowId(response.currentWindowId)
          }
          const tabResults: TabResult[] = response.tabs.map((tab: chrome.tabs.Tab) => ({
            id: tab.id!,
            title: tab.title || 'Untitled',
            url: tab.url || '',
            favIconUrl: tab.favIconUrl || '',
            windowId: tab.windowId!
          }))
          setResults(tabResults)
        }
      } catch (_error) {
        setResults([])
      }
    }

    fetchTabs()
  }, [searchCurrentWindow])

  // Fetch tab statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_TAB_STATS' })
        if (response) {
          setStats(response)
        }
      } catch (_error) {
        // Ignore errors
      }
    }
    fetchStats()
  }, [])

  // Fetch recently closed tabs
  useEffect(() => {
    if (!enableRecentClosed) {
      setClosedTabs([])
      return
    }

    const fetchClosedTabs = async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'GET_RECENTLY_CLOSED',
          maxResults: 25
        })

        const sessions = response?.sessions || []
        console.log('[Tab Tool] Raw sessions:', sessions)
        console.log('[Tab Tool] Config:', {
          enableRecentClosed,
          recentClosedTimeWindow,
          recentClosedMaxResults
        })

        const now = Date.now()
        const timeLimit = recentClosedTimeWindow * 60 * 60 * 1000

        const tabs: ClosedTab[] = sessions
          .filter((s: chrome.sessions.Session) => s.tab && now - s.lastModified * 1000 < timeLimit)
          .slice(0, recentClosedMaxResults)
          .map((s: chrome.sessions.Session) => ({
            sessionId: s.tab!.sessionId!,
            title: s.tab!.title || 'Untitled',
            url: s.tab!.url || '',
            favIconUrl: s.tab!.favIconUrl,
            closedAt: s.lastModified * 1000
          }))

        console.log('[Tab Tool] Filtered closed tabs:', tabs)
        setClosedTabs(tabs)
      } catch (error) {
        console.error('[Tab Tool] Error fetching closed tabs:', error)
        setClosedTabs([])
      }
    }

    fetchClosedTabs()
  }, [enableRecentClosed, recentClosedTimeWindow, recentClosedMaxResults])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Handle exit animation completion
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleAnimationEnd = (e: AnimationEvent) => {
      if (isClosing && e.animationName === 'tt-container-exit') {
        onCloseComplete()
      }
    }

    container.addEventListener('animationend', handleAnimationEnd)
    return () => container.removeEventListener('animationend', handleAnimationEnd)
  }, [isClosing, onCloseComplete])

  // Filter results based on query
  const filteredResults = results.filter(tab => {
    if (!query.trim()) return true
    const lowerQuery = query.toLowerCase()
    return (
      tab.title.toLowerCase().includes(lowerQuery) ||
      tab.url.toLowerCase().includes(lowerQuery) ||
      extractDomain(tab.url).toLowerCase().includes(lowerQuery)
    )
  })

  // Filter closed tabs based on query
  const filteredClosedTabs = enableRecentClosed
    ? closedTabs.filter(tab => {
        if (!query.trim()) return true
        const lowerQuery = query.toLowerCase()
        return (
          tab.title.toLowerCase().includes(lowerQuery) ||
          tab.url.toLowerCase().includes(lowerQuery) ||
          extractDomain(tab.url).toLowerCase().includes(lowerQuery)
        )
      })
    : []

  // Total items for keyboard navigation (open tabs + closed tabs)
  const totalItems = filteredResults.length + filteredClosedTabs.length

  // Restore a closed tab
  const restoreTab = useCallback(
    async (tab: ClosedTab) => {
      try {
        await chrome.runtime.sendMessage({ type: 'RESTORE_TAB', sessionId: tab.sessionId })
        handleClose()
      } catch (_error) {
        // Session might have expired
      }
    },
    [handleClose]
  )

  // Reset selected index when query changes - select first result if available
  useEffect(() => {
    setIsKeyboardNav(false)
    // Defer to ensure filteredResults is updated
    const timer = setTimeout(() => {
      setSelectedIndex(totalItems > 0 && query.trim() ? 0 : -1)
    }, 0)
    return () => clearTimeout(timer)
  }, [query, totalItems])

  // Auto-scroll to keep selected item visible (keyboard navigation only)
  useEffect(() => {
    if (selectedItemRef.current && isKeyboardNav) {
      selectedItemRef.current.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      })
    }
  }, [selectedIndex, isKeyboardNav])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'Escape':
          handleClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setIsKeyboardNav(true)
          setSelectedIndex(prev => (prev + 1) % totalItems)
          break
        case 'ArrowUp':
          e.preventDefault()
          setIsKeyboardNav(true)
          setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : totalItems - 1))
          break
        case 'Enter':
          // Ignore Enter during IME composition (Chinese/Japanese input)
          if (e.nativeEvent.isComposing) {
            break
          }
          e.preventDefault()
          if (selectedIndex >= 0) {
            if (selectedIndex < filteredResults.length) {
              // Open tab
              const selected = filteredResults[selectedIndex]
              chrome.runtime.sendMessage({ type: 'ACTIVATE_TAB', tabId: selected.id })
              handleClose()
            } else {
              // Closed tab
              const closedIndex = selectedIndex - filteredResults.length
              const closedTab = filteredClosedTabs[closedIndex]
              if (closedTab) {
                restoreTab(closedTab)
              }
            }
          }
          break
      }
    },
    [filteredResults, filteredClosedTabs, totalItems, selectedIndex, handleClose, restoreTab]
  )

  return (
    <div
      className={`tt-overlay ${isClosing ? 'tt-closing' : ''}`}
      onClick={handleClose}
      data-theme={theme}
    >
      <div
        ref={containerRef}
        className={`tt-container ${isClosing ? 'tt-closing' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="tt-header">
          <div className="tt-header-content">
            <div className="tt-header-text">
              <h2 className="tt-title">{t.searchTabs}</h2>
              <p className="tt-description">{t.searchTabsDesc}</p>
            </div>
            {stats && (
              <div className="tt-header-stats">
                {searchCurrentWindow ? (
                  <span className="tt-stats-item">
                    {stats.currentWindowTabs} {t.tabs}
                    <span className="tt-stats-divider">•</span>
                    {t.currentWindowTabs}
                  </span>
                ) : (
                  <>
                    <span className="tt-stats-item">
                      {stats.totalTabs} {t.tabs}
                    </span>
                    <span className="tt-stats-item">
                      {stats.totalWindows} {t.windows}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search Content */}
        <div className="tt-search-content">
          {/* Search Input */}
          <div className="tt-input-wrapper">
            <svg
              className="tt-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="tt-input"
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Results List */}
          <div
            className={`tt-results ${isKeyboardNav ? 'keyboard-nav' : ''}`}
            onMouseMove={() => setIsKeyboardNav(false)}
            onMouseLeave={() => setSelectedIndex(-1)}
          >
            {filteredResults.length === 0 &&
            (!enableRecentClosed || filteredClosedTabs.length === 0) ? (
              <div className="tt-empty">{t.noTabsFound}</div>
            ) : (
              <>
                {/* Open Tabs */}
                {filteredResults.map((tab, index) => (
                  <div
                    key={tab.id}
                    ref={index === selectedIndex ? selectedItemRef : null}
                    className={`tt-result-item ${index === selectedIndex ? 'selected' : ''}`}
                    onMouseEnter={() => {
                      if (!isKeyboardNav) {
                        setSelectedIndex(index)
                      }
                    }}
                    onClick={() => {
                      chrome.runtime.sendMessage({ type: 'ACTIVATE_TAB', tabId: tab.id })
                      handleClose()
                    }}
                  >
                    <div className="tt-result-icon">
                      {tab.favIconUrl ? (
                        <img src={tab.favIconUrl} alt="" />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          width="16"
                          height="16"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                      )}
                    </div>
                    <div className="tt-result-info">
                      <div className="tt-result-title">{tab.title}</div>
                      {urlDisplayStyle !== 'none' && (
                        <div className="tt-result-url">
                          {urlDisplayStyle === 'domain' ? extractDomain(tab.url) : tab.url}
                        </div>
                      )}
                    </div>
                    {!searchCurrentWindow &&
                      currentWindowId !== null &&
                      tab.windowId !== currentWindowId && (
                        <span className="tt-result-badge">{t.otherWindow}</span>
                      )}
                    <button
                      className="tt-result-delete"
                      onClick={async e => {
                        e.stopPropagation()
                        await chrome.runtime.sendMessage({ type: 'CLOSE_TAB', tabId: tab.id })
                        setResults(prev => prev.filter(t => t.id !== tab.id))
                      }}
                      title={t.closeTab}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="16"
                        height="16"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Recently Closed Section */}
                {enableRecentClosed && filteredClosedTabs.length > 0 && (
                  <div className="tt-section">
                    <div className="tt-section-header">
                      <h3>{t.recentClosedSection}</h3>
                    </div>
                    {filteredClosedTabs.map((tab, index) => {
                      const globalIndex = filteredResults.length + index
                      const isSelected = globalIndex === selectedIndex
                      return (
                        <div
                          key={tab.sessionId}
                          ref={isSelected ? selectedItemRef : null}
                          className={`tt-result-item closed-tab ${isSelected ? 'selected' : ''}`}
                          onMouseEnter={() => {
                            if (!isKeyboardNav) {
                              setSelectedIndex(globalIndex)
                            }
                          }}
                          onClick={() => restoreTab(tab)}
                        >
                          <div className="tt-result-icon">
                            {tab.favIconUrl ? (
                              <img src={tab.favIconUrl} alt="" />
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                width="16"
                                height="16"
                              >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                            )}
                          </div>
                          <div className="tt-result-info">
                            <div className="tt-result-title">{tab.title}</div>
                            {urlDisplayStyle !== 'none' && (
                              <div className="tt-result-url">
                                {urlDisplayStyle === 'domain' ? extractDomain(tab.url) : tab.url}
                              </div>
                            )}
                          </div>
                          <span className="tt-result-time">
                            {formatRelativeTime(tab.closedAt, language)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="tt-footer">
          <div className="tt-footer-hint">
            <span>↑↓ {t.navigate}</span>
            <span>•</span>
            <span>Enter {t.open}</span>
          </div>
          <div className="tt-footer-hint">
            <kbd>Esc</kbd>
            <span>{t.close}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
