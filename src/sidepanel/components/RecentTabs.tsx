import { Clock, RotateCcw } from 'lucide-react'
import type { RecentTab } from '../types'

interface RecentTabsProps {
  tabs: RecentTab[]
  onRestore: (sessionId: string) => void
  labels: {
    recentTabs: string
    recentClosedEmpty: string
    restoreTab: string
  }
}

export function RecentTabs({ tabs, onRestore, labels }: RecentTabsProps) {
  if (tabs.length === 0) {
    return (
      <div className="recent-empty">
        <Clock size={24} strokeWidth={1.5} />
        <p>{labels.recentClosedEmpty}</p>
      </div>
    )
  }

  return (
    <div className="recent-tabs">
      {tabs.map((tab) => (
        <div key={tab.sessionId} className="recent-tab-item">
          <div className="tab-favicon">
            {tab.favIconUrl ? (
              <img
                src={tab.favIconUrl}
                alt=""
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <div className="tab-favicon-placeholder" />
            )}
          </div>
          <div className="tab-info">
            <div className="tab-title">{tab.title}</div>
          </div>
          <button
            className="recent-restore-btn"
            onClick={() => onRestore(tab.sessionId)}
            title={labels.restoreTab}
          >
            <RotateCcw size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
