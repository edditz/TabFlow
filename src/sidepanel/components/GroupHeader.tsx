import { ChevronRight, MoreHorizontal } from 'lucide-react'

interface GroupHeaderProps {
  title: string
  color: string
  tabCount: number
  collapsed: boolean
  onToggle: () => void
  onContextMenu: (e: React.MouseEvent) => void
}

const GROUP_COLOR_MAP: Record<string, string> = {
  grey: '#6b7280',
  blue: '#3b82f6',
  red: '#ef4444',
  yellow: '#f59e0b',
  green: '#22c55e',
  pink: '#ec4899',
  purple: '#a855f7',
  cyan: '#06b6d4'
}

export function GroupHeader({
  title,
  color,
  tabCount,
  collapsed,
  onToggle,
  onContextMenu
}: GroupHeaderProps) {
  const displayColor = GROUP_COLOR_MAP[color] || GROUP_COLOR_MAP.grey

  return (
    <div className="group-header" onClick={onToggle} onContextMenu={onContextMenu}>
      <div className="group-color-dot" style={{ backgroundColor: displayColor }} />
      <span className="group-title">{title}</span>
      <span className="group-count">{tabCount}</span>
      <button
        className="group-toggle"
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
      >
        <ChevronRight
          size={12}
          style={{
            transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)',
            transition: 'transform 0.15s'
          }}
        />
      </button>
      <button
        className="group-more"
        onClick={(e) => {
          e.stopPropagation()
          onContextMenu(e)
        }}
      >
        <MoreHorizontal size={12} />
      </button>
    </div>
  )
}
