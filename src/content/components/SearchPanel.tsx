import { useState, useEffect, useRef, useCallback } from 'react'
import type { KeyboardEvent } from 'react'
import { translations, type Language } from '../../i18n'
import './SearchPanel.css'

interface TabResult {
  id: number
  title: string
  url: string
  favIconUrl?: string
}

interface SearchPanelProps {
  onClose: () => void
  theme: 'light' | 'dark'
  language: Language
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

export function SearchPanel({
  onClose,
  theme,
  language,
}: SearchPanelProps) {
  const t = translations[language]
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TabResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isKeyboardNav, setIsKeyboardNav] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedItemRef = useRef<HTMLDivElement>(null)

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
        const response = await chrome.runtime.sendMessage({ type: 'GET_ALL_TABS' })
        if (response?.tabs) {
          const tabResults: TabResult[] = response.tabs.map((tab: chrome.tabs.Tab) => ({
            id: tab.id!,
            title: tab.title || 'Untitled',
            url: tab.url || '',
            favIconUrl: tab.favIconUrl || '',
          }))
          setResults(tabResults)
        }
      } catch (error) {
        setResults([])
      }
    }

    fetchTabs()
  }, [])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Filter results based on query
  const filteredResults = results.filter((tab) => {
    if (!query.trim()) return true
    const lowerQuery = query.toLowerCase()
    return (
      tab.title.toLowerCase().includes(lowerQuery) ||
      tab.url.toLowerCase().includes(lowerQuery) ||
      extractDomain(tab.url).toLowerCase().includes(lowerQuery)
    )
  })

  // Reset selected index when filtered results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Auto-scroll to keep selected item visible (keyboard navigation only)
  useEffect(() => {
    if (selectedItemRef.current && isKeyboardNav) {
      selectedItemRef.current.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      })
    }
  }, [selectedIndex, isKeyboardNav])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setIsKeyboardNav(true)
          setSelectedIndex((prev) => (prev + 1) % filteredResults.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setIsKeyboardNav(true)
          setSelectedIndex((prev) =>
            prev - 1 >= 0 ? prev - 1 : filteredResults.length - 1
          )
          break
        case 'Enter':
          // Ignore Enter during IME composition (Chinese/Japanese input)
          if (e.nativeEvent.isComposing) {
            break
          }
          e.preventDefault()
          const selected = filteredResults[selectedIndex]
          if (selected) {
            chrome.runtime.sendMessage({ type: 'ACTIVATE_TAB', tabId: selected.id })
            onClose()
          }
          break
      }
    },
    [filteredResults, selectedIndex, onClose]
  )

  return (
    <div
      className="tt-overlay"
      onClick={onClose}
      data-theme={theme}
    >
      <div
        className="tt-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="tt-header">
          <h2 className="tt-title">{t.searchTabs}</h2>
          <p className="tt-description">
            {t.searchTabsDesc}
          </p>
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
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Results List */}
          <div
            className={`tt-results ${isKeyboardNav ? 'keyboard-nav' : ''}`}
            onMouseMove={() => setIsKeyboardNav(false)}
            onMouseLeave={() => setSelectedIndex(-1)}
          >
            {filteredResults.length === 0 ? (
              <div className="tt-empty">{t.noTabsFound}</div>
            ) : (
              filteredResults.map((tab, index) => (
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
                    onClose()
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
                    <div className="tt-result-url">
                      {extractDomain(tab.url)}
                    </div>
                  </div>
                  <button
                    className="tt-result-delete"
                    onClick={async (e) => {
                      e.stopPropagation()
                      await chrome.runtime.sendMessage({ type: 'CLOSE_TAB', tabId: tab.id })
                      setResults((prev) => prev.filter((t) => t.id !== tab.id))
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
              ))
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
