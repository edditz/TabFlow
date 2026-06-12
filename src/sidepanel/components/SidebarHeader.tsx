import { LayoutGrid, List, GitBranch, Settings } from 'lucide-react'
import type { SidebarLayout } from '../types'

interface SidebarHeaderProps {
  layout: SidebarLayout
  onLayoutChange: (layout: SidebarLayout) => void
  onOpenSettings: () => void
  labels: {
    sidebarTitle: string
    layoutCompact: string
    layoutCard: string
    layoutTree: string
  }
}

const LAYOUT_OPTIONS: {
  value: SidebarLayout
  icon: typeof List
  labelKey: keyof SidebarHeaderProps['labels']
}[] = [
  { value: 'compact', icon: List, labelKey: 'layoutCompact' },
  { value: 'detailed', icon: LayoutGrid, labelKey: 'layoutCard' },
  { value: 'tree', icon: GitBranch, labelKey: 'layoutTree' }
]

export function SidebarHeader({
  layout,
  onLayoutChange,
  onOpenSettings,
  labels
}: SidebarHeaderProps) {
  return (
    <div className="sidebar-header">
      <span className="sidebar-logo">{labels.sidebarTitle}</span>
      <div className="sidebar-header-actions">
        <div className="layout-switcher">
          {LAYOUT_OPTIONS.map(({ value, icon: Icon, labelKey }) => (
            <button
              key={value}
              className={`layout-btn ${layout === value ? 'active' : ''}`}
              onClick={() => onLayoutChange(value)}
              title={labels[labelKey]}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
        <button className="sidebar-settings-btn" onClick={onOpenSettings} title="Settings">
          <Settings size={14} />
        </button>
      </div>
    </div>
  )
}
