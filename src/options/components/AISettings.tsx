// src/options/components/AISettings.tsx
import { useState, useCallback, useEffect } from 'react'
import type { AISettings } from '../../classification'
import { DEFAULT_AI_SETTINGS, testAIConnection } from '../../classification'
import { Switch } from './Switch'

interface AISettingsProps {
  settings: AISettings
  onChange: (settings: AISettings) => void
  labels: {
    aiSettings: string
    enableAiClassification: string
    enableAiClassificationDesc: string
    apiEndpoint: string
    apiEndpointHint: string
    apiKey: string
    apiKeyPlaceholder: string
    modelName: string
    modelNameHint: string
    testConnection: string
    connectionSuccess: string
    connectionFailed: string
  }
}

export function AISettings({ settings, onChange, labels }: AISettingsProps) {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTest = useCallback(async () => {
    if (!settings.apiKey) {
      setTestResult({ success: false, message: 'Please enter API key first' })
      return
    }

    setTesting(true)
    setTestResult(null)

    const result = await testAIConnection(settings)
    setTesting(false)

    if (result.success) {
      setTestResult({ success: true, message: labels.connectionSuccess })
    } else {
      setTestResult({ success: false, message: result.error || labels.connectionFailed })
    }
  }, [settings, labels.connectionSuccess, labels.connectionFailed])

  // Clear test result when settings change
  useEffect(() => {
    setTestResult(null)
  }, [settings.apiKey, settings.endpoint, settings.model])

  const updateField = <K extends keyof AISettings>(key: K, value: AISettings[K]) => {
    onChange({ ...settings, [key]: value })
  }

  return (
    <section className="options-section">
      <div className="section-header">
        <svg
          className="section-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
        <h2 className="section-title">{labels.aiSettings}</h2>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <div className="setting-label">{labels.enableAiClassification}</div>
          <div className="setting-desc">{labels.enableAiClassificationDesc}</div>
        </div>
        <Switch checked={settings.enabled} onChange={checked => updateField('enabled', checked)} />
      </div>

      {settings.enabled && (
        <>
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">{labels.apiEndpoint}</div>
              <div className="setting-desc">{labels.apiEndpointHint}</div>
            </div>
            <input
              type="text"
              className="setting-input"
              value={settings.endpoint}
              onChange={e => updateField('endpoint', e.target.value)}
              placeholder={DEFAULT_AI_SETTINGS.endpoint}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">{labels.apiKey}</div>
            </div>
            <input
              type="password"
              className="setting-input"
              value={settings.apiKey}
              onChange={e => updateField('apiKey', e.target.value)}
              placeholder={labels.apiKeyPlaceholder}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">{labels.modelName}</div>
              <div className="setting-desc">{labels.modelNameHint}</div>
            </div>
            <input
              type="text"
              className="setting-input"
              value={settings.model}
              onChange={e => updateField('model', e.target.value)}
              placeholder={DEFAULT_AI_SETTINGS.model}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label"></div>
            </div>
            <div className="setting-action">
              <button
                className="setting-button"
                onClick={handleTest}
                disabled={testing || !settings.apiKey}
              >
                {testing ? 'Testing...' : labels.testConnection}
              </button>
              {testResult && (
                <span className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                  {testResult.message}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
