'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import { ArrowUp, Download, Paperclip, X } from 'lucide-react'
import SetupPanels from './SetupPanels'

const AGENT_LABEL = 'BI REQUIREMENTS & WIREFRAME AGENT'

// ─── Helpers ────────────────────────────────────────────────────────────────

function ts() {
  return new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatMarkdown(text) {
  // Very light markdown: bold **x**, inline code `x`, newlines
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-ink/10 px-1 rounded text-[0.8em]">$1</code>')
    .replace(/\n/g, '<br />')
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AgentMessage({ msg }) {
  const ref = useRef(null)
  useEffect(() => {
    gsap.from(ref.current, { x: -16, opacity: 0, duration: 0.45, ease: 'power3.out' })
  }, [])

  return (
    <div ref={ref} className="flex flex-col gap-0 max-w-[78%] self-start">
      <div className="flex items-center gap-2 px-1 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-red flex-shrink-0" />
        <span className="font-mono text-[10px] tracking-widest text-muted uppercase">Agent</span>
        <span className="font-mono text-[10px] text-muted/60 ml-auto">{msg.time}</span>
      </div>
      <div className="relative border border-ink/20 bg-offwhite rounded-2xl rounded-tl-sm overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red" />
        <div
          className="font-mono text-[13px] leading-relaxed text-ink px-5 py-4"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }}
        />
        {msg.streaming && (
          <span className="inline-block w-2 h-4 bg-red animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </div>
  )
}

function UserMessage({ msg }) {
  const ref = useRef(null)
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    gsap.from(ref.current, { x: 16, opacity: 0, duration: 0.35, ease: 'power3.out' })
  }, [])

  const isStructured = msg.text.startsWith("I'm providing my data model")
  const displayText  = isStructured && !expanded
    ? '[ Schema + context submitted ]'
    : msg.text

  return (
    <div ref={ref} className="flex flex-col gap-0 max-w-[68%] self-end items-end">
      <div className="flex items-center gap-2 px-1 mb-1">
        <span className="font-mono text-[10px] text-muted/60">{msg.time}</span>
        <span className="font-mono text-[10px] tracking-widest text-muted uppercase">You</span>
      </div>
      <div
        className={`bg-ink rounded-2xl rounded-tr-sm px-5 py-4 ${isStructured ? 'cursor-pointer' : ''}`}
        onClick={() => isStructured && setExpanded((v) => !v)}
        title={isStructured ? (expanded ? 'Click to collapse' : 'Click to expand') : undefined}
      >
        <p className="font-mono text-[13px] leading-relaxed text-paper whitespace-pre-wrap">
          {isStructured && !expanded
            ? <span className="text-red/80">[ Schema + context submitted ]<br/><span className="text-paper/40 text-[10px]">click to expand</span></span>
            : displayText
          }
        </p>
      </div>
    </div>
  )
}

function ThinkingBubble({ hint }) {
  const ref = useRef(null)
  useEffect(() => {
    gsap.from(ref.current, { x: -16, opacity: 0, duration: 0.35, ease: 'power3.out' })
  }, [])

  return (
    <div ref={ref} className="flex flex-col gap-0 max-w-[78%] self-start">
      <div className="flex items-center gap-2 px-1 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-red animate-ping" />
        <span className="font-mono text-[10px] tracking-widest text-muted uppercase">
          {hint === 'tool' ? 'Using tool…' : 'Thinking…'}
        </span>
      </div>
      <div className="relative border border-ink/20 bg-offwhite rounded-2xl rounded-tl-sm overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red/40" />
        <div className="flex items-center gap-2 px-5 py-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-red/60"
              style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function FilesPanel({ files, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    gsap.from(ref.current, { y: 20, opacity: 0, duration: 0.4, ease: 'power3.out' })
  }, [])

  return (
    <div
      ref={ref}
      className="absolute bottom-full right-0 mb-2 w-72 bg-offwhite border border-ink/20 rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink/10">
        <div className="flex items-center gap-2">
          <Paperclip size={13} className="text-red" />
          <span className="font-mono text-[11px] tracking-widest uppercase text-ink">Files</span>
        </div>
        <button onClick={onClose} className="text-muted hover:text-ink transition-colors">
          <X size={14} />
        </button>
      </div>
      {files.length === 0 ? (
        <p className="font-mono text-[11px] text-muted px-4 py-4">No files yet.</p>
      ) : (
        <ul className="divide-y divide-ink/10 max-h-64 overflow-y-auto">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between px-4 py-3 hover:bg-surface/60 transition-colors">
              <span className="font-mono text-[11px] text-ink truncate pr-2">{f.filename ?? f.id}</span>
              <a
                href={`/api/files/${f.id}/download`}
                download
                className="flex-shrink-0 text-red hover:text-ink transition-colors"
              >
                <Download size={13} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChatInterface() {
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [agentStatus, setAgentStatus] = useState('idle') // idle | thinking | streaming
  const [thinkHint, setThinkHint] = useState('thinking')
  const [files, setFiles]         = useState([])
  const [filesOpen, setFilesOpen] = useState(false)

  const bottomRef    = useRef(null)
  const headerRef    = useRef(null)
  const bodyRef      = useRef(null)
  const inputAreaRef = useRef(null)
  const textareaRef  = useRef(null)

  // Entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, { y: -24, opacity: 0, duration: 0.7, ease: 'power3.out' })
      gsap.from(bodyRef.current,   { opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.2 })
      gsap.from(inputAreaRef.current, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.35 })
    })
    return () => ctx.revert()
  }, [])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, agentStatus])

  // Fetch files
  const fetchFiles = useCallback(async () => {
    try {
      const res  = await fetch('/api/files')
      const data = await res.json()
      setFiles(data.files ?? [])
    } catch {}
  }, [])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }, [])

  // Send message
  const sendMessage = useCallback(async (override) => {
    const text = (typeof override === 'string' ? override : input).trim()
    if (!text || agentStatus !== 'idle') return

    if (typeof override !== 'string') {
      setInput('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }
    setAgentStatus('thinking')
    setThinkHint('thinking')

    const userMsg  = { role: 'user',  text, time: ts(), id: Date.now() }
    const agentId  = Date.now() + 1
    const agentMsg = { role: 'agent', text: '', time: ts(), id: agentId, streaming: true }

    setMessages((prev) => [...prev, userMsg, agentMsg])

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text }),
      })

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buf += decoder.decode(value, { stream: true })
        const parts = buf.split('\n\n')
        buf = parts.pop() ?? ''

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue
          let data
          try { data = JSON.parse(part.slice(6)) } catch { continue }

          if (data.type === 'thinking') {
            setAgentStatus('thinking')
            setThinkHint('thinking')
          } else if (data.type === 'tool') {
            setThinkHint('tool')
          } else if (data.type === 'message') {
            setAgentStatus('streaming')
            setMessages((prev) =>
              prev.map((m) => (m.id === agentId ? { ...m, text: data.text } : m))
            )
          } else if (data.type === 'done') {
            setMessages((prev) =>
              prev.map((m) => (m.id === agentId ? { ...m, streaming: false } : m))
            )
            setAgentStatus('idle')
            fetchFiles()
          } else if (data.type === 'error') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === agentId
                  ? { ...m, text: `[Error: ${data.message}]`, streaming: false, error: true }
                  : m
              )
            )
            setAgentStatus('idle')
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === agentId
            ? { ...m, text: `[Network error: ${err.message}]`, streaming: false, error: true }
            : m
        )
      )
      setAgentStatus('idle')
    }
  }, [input, agentStatus, fetchFiles])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const isIdle = agentStatus === 'idle'
  const showThinking = (agentStatus === 'thinking' || thinkHint === 'tool') &&
    messages[messages.length - 1]?.role !== 'agent'

  return (
    <div className="flex flex-col h-screen bg-paper font-grotesk overflow-hidden">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header ref={headerRef} className="flex-shrink-0 border-b-2 border-ink px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Status dot */}
          <span className="relative flex h-2.5 w-2.5">
            {!isIdle && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isIdle ? 'bg-ink/30' : 'bg-red'}`} />
          </span>

          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted leading-none mb-0.5">
              {isIdle ? 'IDLE' : agentStatus === 'thinking' ? 'THINKING' : 'RESPONDING'}
            </p>
            <h1 className="font-grotesk font-bold text-[13px] tracking-tight text-ink leading-none">
              {AGENT_LABEL}
            </h1>
          </div>
        </div>

        {/* Files button */}
        <div className="relative">
          <button
            onClick={() => setFilesOpen((v) => !v)}
            className="flex items-center gap-1.5 font-mono text-[11px] tracking-widest uppercase border border-ink/20 rounded-full px-3 py-1.5 text-ink hover:bg-ink hover:text-paper transition-all duration-200 btn-magnetic"
          >
            <Paperclip size={11} />
            Files
            {files.length > 0 && (
              <span className="bg-red text-paper text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {files.length}
              </span>
            )}
          </button>
          {filesOpen && <FilesPanel files={files} onClose={() => setFilesOpen(false)} />}
        </div>
      </header>

      {/* ── MESSAGES ───────────────────────────────────────────────────── */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-start justify-start pt-2 pb-4">
            <div className="mb-5 select-none">
              <p className="font-serif italic text-3xl text-ink/15 leading-tight">Ready.</p>
              <p className="font-mono text-[10px] tracking-widest uppercase text-muted/50 mt-1">
                Provide your data model and context below — the agent will produce a requirements spec and wireframe.
              </p>
            </div>
            <SetupPanels onSubmit={sendMessage} disabled={agentStatus !== 'idle'} />
          </div>
        )}

        <div className="flex flex-col gap-5">
          {messages.map((msg) =>
            msg.role === 'user'
              ? <UserMessage  key={msg.id} msg={msg} />
              : <AgentMessage key={msg.id} msg={msg} />
          )}

          {(agentStatus === 'thinking' || agentStatus === 'streaming') &&
            messages[messages.length - 1]?.role === 'user' && (
              <ThinkingBubble hint={thinkHint} />
            )}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ──────────────────────────────────────────────────────── */}
      <div ref={inputAreaRef} className="flex-shrink-0 border-t-2 border-ink bg-paper px-6 py-4">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => { setInput(e.target.value); resizeTextarea() }}
            onKeyDown={handleKeyDown}
            placeholder="Describe your schema or paste business context…"
            disabled={!isIdle}
            className="flex-1 resize-none bg-transparent font-mono text-[13px] text-ink placeholder:text-muted/50 outline-none leading-relaxed disabled:opacity-40 min-h-[40px] max-h-[140px] py-2"
          />
          <button
            onClick={sendMessage}
            disabled={!isIdle || !input.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-ink flex items-center justify-center text-paper disabled:opacity-30 hover:bg-red transition-all duration-200 btn-magnetic"
          >
            <ArrowUp size={16} />
          </button>
        </div>
        <p className="font-mono text-[10px] text-muted/50 mt-2 text-right tracking-widest uppercase">
          Enter to send · Shift+Enter for new line
        </p>
      </div>

    </div>
  )
}
