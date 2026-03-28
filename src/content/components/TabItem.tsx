// src/content/components/TabItem.tsx
import './TabItem.css'

export interface TabItemData {
  id: number | string
  title: string
  url?: string
  favIconUrl?: string
  windowId?: number
}

interface TabItemProps {
  tab: TabItemData
  onClick?: () => void
  selected?: boolean
  showUrl?: boolean
  urlDisplayStyle?: 'full' | 'domain' | 'none'
  badge?: string
  onClose?: () => void
  closeLabel?: string
  timeLabel?: string
  suffix?: React.ReactNode
  className?: string
}

// Extract domain from URL for display
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}

// Default icon when no favicon
const DefaultIcon = () => (
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
)

export function TabItem({
  tab,
  onClick,
  selected = false,
  showUrl = true,
  urlDisplayStyle = 'domain',
  badge,
  onClose,
  closeLabel,
  suffix,
  className = ''
}: TabItemProps) {
  const displayUrl =
    showUrl && tab.url && urlDisplayStyle !== 'none'
      ? urlDisplayStyle === 'domain'
        ? extractDomain(tab.url)
        : tab.url
      : null

  return (
    <div
      className={`tt-result-item ${selected ? 'selected' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="tt-result-icon">
        {tab.favIconUrl ? <img src={tab.favIconUrl} alt="" /> : <DefaultIcon />}
      </div>
      <div className="tt-result-info">
        <div className="tt-result-title">{tab.title}</div>
        {displayUrl && <div className="tt-result-url">{displayUrl}</div>}
      </div>
      {badge && <span className="tt-result-badge">{badge}</span>}
      {suffix}
      {onClose && (
        <button
          className="tt-result-delete"
          onClick={e => {
            e.stopPropagation()
            onClose()
          }}
          title={closeLabel || 'Close'}
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
      )}
    </div>
  )
}
