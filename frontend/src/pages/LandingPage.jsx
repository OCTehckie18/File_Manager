import React, { useState } from 'react'
import { FolderOpen, Zap, AlertTriangle, ArrowRight, Bot } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useScanner } from '../hooks/useScanner'

export function LandingPage() {
  const [folderPath, setFolderPath] = useState('')
  const [error, setError] = useState('')
  const { scan } = useScanner()

  async function handleScan() {
    const trimmed = folderPath.trim()
    if (!trimmed) {
      setError('Please enter a folder path.')
      return
    }
    setError('')
    await scan(trimmed)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleScan()
  }

  const hasPath = folderPath.trim().length > 0

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d0f14',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(110,142,251,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(110,142,251,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Glow blobs */}
      <div style={{
        position: 'absolute',
        top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(ellipse, rgba(110,142,251,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px', right: '10%',
        width: '400px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(167,139,250,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Content card */}
      <div
        className="animate-fade-in-up"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '560px',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            className="animate-pulse-glow"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(110,142,251,0.15), rgba(167,139,250,0.15))',
              border: '1px solid rgba(110,142,251,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={36} color="#6e8efb" />
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: 0 }}>
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #6e8efb, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Fol-Tree
              </span>
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#64748b' }}>
              AI-powered folder intelligence — search, summarize, explore.
            </p>
          </div>
        </div>

        {/* Picker card */}
        <div
          style={{
            width: '100%',
            background: '#141720',
            border: '1px solid #1e2330',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Enter the folder path to index
          </div>

          {/* Path input */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FolderOpen size={16} color={hasPath ? '#6e8efb' : '#3d4a63'} />
            </div>
            <input
              id="folder-path-input"
              type="text"
              value={folderPath}
              onChange={e => { setFolderPath(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              placeholder="C:\Users\YourName\Projects\MyFolder"
              spellCheck={false}
              autoComplete="off"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '13px',
                padding: '13px 14px 13px 40px',
                background: '#0d0f14',
                border: `1px solid ${hasPath ? '#6e8efb' : '#252d40'}`,
                borderRadius: '8px',
                color: '#e2e8f0',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: hasPath ? '0 0 0 3px rgba(110,142,251,0.08)' : 'none',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#6e8efb'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(110,142,251,0.08)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = hasPath ? '#6e8efb' : '#252d40'
                e.currentTarget.style.boxShadow = hasPath ? '0 0 0 3px rgba(110,142,251,0.08)' : 'none'
              }}
            />
          </div>

          {/* Helper hint */}
          <div style={{ fontSize: '11px', color: '#3d4a63', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💡</span>
            <span>
              Copy the path from your file manager's address bar and paste it above.
            </span>
          </div>

          {/* Error message */}
          {error && (
            <div style={{ fontSize: '11px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={12} />
              {error}
            </div>
          )}

          {/* Start button */}
          <Button
            id="start-scan-btn"
            size="lg"
            disabled={!hasPath}
            onClick={handleScan}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Zap size={15} />
            Start Indexing
            <ArrowRight size={15} />
          </Button>
        </div>

        {/* Disclaimer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '10px 14px',
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.15)',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#94a3b8',
            lineHeight: 1.6,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>
            <strong style={{ color: '#f59e0b' }}>Note:</strong>{' '}
            The backend server must be running on <code style={{ color: '#6e8efb', background: 'rgba(110,142,251,0.1)', padding: '1px 5px', borderRadius: '3px' }}>localhost:8000</code>.
            Binary files and password-protected documents are automatically skipped.
          </span>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Backend-powered', 'PDF & DOCX', 'AI chat', 'Local LLM'].map(feat => (
            <span
              key={feat}
              style={{
                fontSize: '10px',
                padding: '3px 10px',
                background: '#141720',
                border: '1px solid #1e2330',
                borderRadius: '99px',
                color: '#64748b',
              }}
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
