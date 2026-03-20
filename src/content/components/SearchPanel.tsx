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
}

export function SearchPanel({ onClose }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TabResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock data for placeholder
  useEffect(() => {
    setResults([
      { id: 1, title: 'Example Tab 1', url: 'https://example.com/page1' },
      { id: 2, title: 'Example Tab 2', url: 'https://example.com/page2' },
      { id: 3, title: 'Example Tab 3', url: 'https://example.com/page3' },
    ])
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
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
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
        break
      case 'Enter':
        e.preventDefault()
        const selected = results[selectedIndex]
        if (selected) {
          // Switch to selected tab
          chrome.tabs.update(selected.id, { active: true })
          onClose()
        }
        break
    }
  }, [results, selectedIndex, onClose])

  return (
    <div className="tt-overlay" onClick={onClose}>
      <div className="tt-container" onClick={(e) => e.stopPropagation()}>
        <div className="tt-header">
          <input
            ref={inputRef}
            type="text"
            className="tt-input"
            placeholder="Search tabs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="tt-close-btn" onClick={onClose} title="Close (Esc)">
            ×
          </button>
        </div>

        <div className="tt-results">
          {results.map((tab, index) => (
            <div
              key={tab.id}
              className={`tt-result-item ${index === selectedIndex ? 'selected' : ''}`}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="tt-result-icon">📄</span>
              <div className="tt-result-info">
                <div className="tt-result-title">{tab.title}</div>
                <div className="tt-result-url">{tab.url}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="tt-footer">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  )
}
