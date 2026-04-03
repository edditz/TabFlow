// src/content/components/TabItem.tsx
import { File, X } from 'lucide-react'
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
const DefaultIcon = () => <File size={16} strokeWidth={1.5} />

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
          <X size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}
