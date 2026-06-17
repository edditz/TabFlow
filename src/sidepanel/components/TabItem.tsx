import { X } from 'lucide-react'

interface TabItemProps {
  title: string
  url?: string
  favIconUrl?: string
  isActive: boolean
  isClosing?: boolean
  showDomain?: boolean
  showFavicon?: boolean
  showCloseButton?: boolean
  groupColor?: string
  variant?: 'compact' | 'detailed'
  onActivate: () => void
  onClose: () => void
  onContextMenu: (e: React.MouseEvent) => void
}

export function TabItem({
  title,
  url,
  favIconUrl,
  isActive,
  isClosing = false,
  showDomain = false,
  showFavicon = true,
  showCloseButton = true,
  groupColor,
  variant = 'compact',
  onActivate,
  onClose,
  onContextMenu
}: TabItemProps) {
  let domain = ''
  try {
    if (url) domain = new URL(url).hostname
  } catch {
    domain = ''
  }

  return (
    <div
      className={`tab-item ${isActive ? 'active' : ''} ${isClosing ? 'tab-exit' : ''} variant-${variant}`}
      style={groupColor ? ({ '--group-color': groupColor } as React.CSSProperties) : undefined}
      onClick={onActivate}
      onContextMenu={onContextMenu}
    >
      {showFavicon && (
        <div className="tab-favicon">
          {favIconUrl ? (
            <img
              src={favIconUrl}
              alt=""
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="tab-favicon-placeholder" />
          )}
        </div>
      )}
      <div className="tab-info">
        <div className="tab-title">{title || 'Untitled'}</div>
        {showDomain && domain && <div className="tab-domain">{domain}</div>}
      </div>
      {showCloseButton && (
        <button
          className="tab-close-btn"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          title="Close"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
