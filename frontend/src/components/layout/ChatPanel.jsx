import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Bot, Trash2, Sparkles } from 'lucide-react'
import { MessageBubble } from '../chat/MessageBubble'
import { ChatInput } from '../chat/ChatInput'
import { TypingIndicator } from '../chat/TypingIndicator'
import { useChat } from '../../context/ChatContext'
import { useChatActions } from '../../hooks/useChat'
import { useApp } from '../../context/AppContext'
import { ConfirmDeleteModal } from '../ui/ConfirmDeleteModal'
import { deleteItem } from '../../lib/api'
import { uid, formatTimestamp } from '../../lib/utils'

export function ChatPanel() {
  const { messages, isThinking, clearChat, dispatch } = useChat()
  const { send } = useChatActions()
  const { refreshWorkspace } = useApp()
  const bottomRef = useRef(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  // Inject a bot message directly into chat (for post-action feedback)
  const addBotMessage = useCallback((content, isError = false) => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: uid(),
        role: 'assistant',
        content,
        sources: [],
        timestamp: formatTimestamp(new Date()),
        isError,
      },
    })
  }, [dispatch])

  const handleSend = async (text) => {
    const res = await send(text)
    if (res?.action === 'confirm_delete') {
      setDeleteTarget(res.target)
    } else if (res?.action === 'reindex') {
      refreshWorkspace()
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid #1e2330',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
          background: '#0d0f14',
        }}
      >
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(110,142,251,0.2), rgba(167,139,250,0.2))',
            border: '1px solid rgba(110,142,251,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bot size={16} color="#a78bfa" />
        </div>
        <div>
          <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>Fol-Tree</div>
          <div style={{ fontSize: '10px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Ready
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {messages.length > 0 && (
          <button
            id="clear-chat-btn"
            onClick={clearChat}
            title="Clear chat"
            style={{
              background: 'none',
              border: '1px solid #1e2330',
              borderRadius: '5px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '5px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2330'; e.currentTarget.style.color = '#64748b' }}
          >
            <Trash2 size={12} />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {messages.length === 0 ? (
          <EmptyState onChipClick={handleSend} />
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        {isThinking && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isThinking} />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            try {
              await deleteItem(deleteTarget)
              setDeleteTarget(null)
              refreshWorkspace()
              addBotMessage(`✅ Deleted \`${deleteTarget}\` successfully.`)
            } catch (e) {
              setDeleteTarget(null)
              addBotMessage(`❌ Failed to delete \`${deleteTarget}\`: ${e.message}`, true)
            }
          }}
        />
      )}
    </div>
  )
}

const EXAMPLE_PROMPTS = [
  { label: '📂 List all files', text: 'List all files in this folder' },
  { label: '🔍 Search content', text: 'Find files containing "TODO"' },
  { label: '📊 Folder stats', text: 'Give me a summary of this folder' },
  { label: '✏️ Rename a file', text: 'Rename notes.txt to notes_backup.txt' },
  { label: '🗂️ Move a file', text: 'Move report.pdf to archive' },
  { label: '📄 Create a file', text: 'Create a file called todo.txt' },
  { label: '📁 Create a folder', text: 'Create a folder called backup' },
  { label: '🗑️ Delete a file', text: 'Delete old_draft.txt' },
]

function EmptyState({ onChipClick }) {
  return (
    <div
      className="animate-fade-in"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        color: '#64748b',
        fontSize: '13px',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(110,142,251,0.15), rgba(167,139,250,0.15))',
          border: '1px solid rgba(110,142,251,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Sparkles size={24} color="#6e8efb" />
      </div>
      <div>
        <div style={{ fontSize: '15px', color: '#e2e8f0', fontWeight: 600, marginBottom: '6px' }}>
          Ask Fol-Tree anything
        </div>
        <div style={{ maxWidth: '340px', lineHeight: 1.6 }}>
          Search, summarize, rename, move, create, or delete — just type a command or click a suggestion below.
        </div>
      </div>

      {/* Clickable example prompt chips */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          marginTop: '8px',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        {EXAMPLE_PROMPTS.map((p, i) => (
          <button
            key={i}
            id={`prompt-chip-${i}`}
            onClick={() => onChipClick(p.text)}
            style={{
              padding: '8px 12px',
              background: '#141720',
              border: '1px solid #1e2330',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#94a3b8',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: "'JetBrains Mono', monospace",
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#6e8efb'
              e.currentTarget.style.color = '#c4b5fd'
              e.currentTarget.style.background = 'rgba(110,142,251,0.07)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#1e2330'
              e.currentTarget.style.color = '#94a3b8'
              e.currentTarget.style.background = '#141720'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: '10px', color: '#374151', marginTop: '4px' }}>
        Click a suggestion or type your own command
      </div>
    </div>
  )
}
