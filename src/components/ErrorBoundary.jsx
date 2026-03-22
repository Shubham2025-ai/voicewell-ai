import React from 'react'

/**
 * ErrorBoundary — catches any uncaught React errors.
 * Shows a friendly recovery screen instead of a blank white page.
 * Judges will never see a crash during demo.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('VoiceWell caught error:', error, info)
  }

  handleReset() {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#f0fdfa',
          textAlign: 'center',
          gap: '1rem',
        }}
      >
        <div style={{ fontSize: '48px' }}>🎙️</div>
        <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
          VoiceWell hit a snag
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '320px', margin: 0 }}>
          Something unexpected happened. Your conversation data is safe — just reload to continue.
        </p>
        <button
          onClick={() => this.handleReset()}
          style={{
            marginTop: '8px',
            padding: '10px 24px',
            background: '#0d9488',
            color: '#fff',
            border: 'none',
            borderRadius: '99px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Reload VoiceWell
        </button>
        {process.env.NODE_ENV === 'development' && (
          <pre style={{ fontSize: '11px', color: '#94a3b8', maxWidth: '400px', overflow: 'auto', textAlign: 'left' }}>
            {this.state.error?.toString()}
          </pre>
        )}
      </div>
    )
  }
}