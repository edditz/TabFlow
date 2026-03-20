import { useState, useEffect, useRef, useCallback } from 'react'
import type { KeyboardEvent } from 'react'
import './SearchPanel.css'

interface TabResult {
  id: number
  title: string
  url: string
  favIconUrl?: string
}

interface SearchPanelProps {
  onClose: () => void
  theme?: 'light' | 'dark'
}

// Hook to detect and respond to system theme changes
function useSystemTheme(): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light')
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return theme
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
  theme: propTheme,
}: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TabResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Determine theme - use prop or system preference (reactive to changes)
  const systemTheme = useSystemTheme()
  const theme = propTheme ?? systemTheme

  // Mock data for placeholder
  useEffect(() => {
    setResults([
      {
        id: 1,
        title: 'GitHub - Project Repository',
        url: 'https://github.com/user/project',
        favIconUrl: '',
      },
      {
        id: 2,
        title: 'Documentation - Getting Started',
        url: 'https://docs.example.com/getting-started',
        favIconUrl: '',
      },
      {
        id: 3,
        title: 'Dashboard - Analytics Overview',
        url: 'https://app.example.com/dashboard',
        favIconUrl: '',
      },
    ])
  }, [])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % results.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev - 1 >= 0 ? prev - 1 : results.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          const selected = results[selectedIndex]
          if (selected) {
            chrome.tabs.update(selected.id, { active: true })
            onClose()
          }
          break
      }
    },
    [results, selectedIndex, onClose]
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
          <h2 className="tt-title">Search Tabs</h2>
          <p className="tt-description">
            Find and jump to any open browser tab.
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
              placeholder="Search title, url, or domain..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Results List */}
          <div
            className="tt-results"
            onMouseLeave={() => setSelectedIndex(-1)}
          >
            {results.length === 0 ? (
              <div className="tt-empty">No tabs found</div>
            ) : (
              results.map((tab, index) => (
                <div
                  key={tab.id}
                  className={`tt-result-item ${index === selectedIndex ? 'selected' : ''}`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    chrome.tabs.update(tab.id, { active: true })
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
                    onClick={(e) => {
                      e.stopPropagation()
                      chrome.tabs.remove(tab.id)
                      setResults((prev) => prev.filter((t) => t.id !== tab.id))
                    }}
                    title="Close tab"
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
            <span>↑↓ Navigate</span>
            <span>•</span>
            <span>Enter Open</span>
          </div>
          <div className="tt-footer-hint">
            <kbd>Esc</kbd>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
