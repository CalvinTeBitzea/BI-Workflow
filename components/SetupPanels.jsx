'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { gsap } from 'gsap'
import { Upload, X, FileText, AlertCircle } from 'lucide-react'

// ─── Constants ───────────────────────────────────────────────────────────────

const SCHEMA_PLACEHOLDER = `-- FACT TABLES
fact_orders (order_id, order_date, customer_id, region_id, product_id,
             quantity, unit_price, discount_amount, status)
  e.g. order_id=1042, order_date=2024-03-15, quantity=3,
       unit_price=49.99, discount_amount=5.00, status='completed'

-- DIMENSION TABLES
dim_customers (customer_id, full_name, email, signup_date, segment, tier)
  e.g. customer_id='C-201', segment='SMB', tier='gold'

dim_products (product_id, product_name, category, sub_category, cost_price)
  e.g. category='Electronics', sub_category='Laptops', cost_price=310.00

dim_regions (region_id, country, state, city)
  e.g. country='Australia', state='NSW', city='Sydney'

dim_date (date_id, full_date, week, month, quarter, year, is_weekday)

-- RELATIONSHIPS
fact_orders.customer_id → dim_customers.customer_id
fact_orders.product_id  → dim_products.product_id
fact_orders.region_id   → dim_regions.region_id
fact_orders.date_id     → dim_date.date_id`

const CONTEXT_PLACEHOLDER = `Who will use this dashboard, what decisions should it support, and what does "success" look like for them?

Example: "Sales managers need a weekly view of revenue by region and product category. They currently spend 4 hours every Monday pulling reports from Salesforce and Excel. Key questions: Where are we vs. target? Which reps are underperforming? Which products are stalling? They want to be able to filter by quarter and region."`

const TEXT_EXTENSIONS = new Set(['txt', 'csv', 'json', 'md', 'markdown', 'tsv', 'xml', 'yaml', 'yml', 'sql'])
const BINARY_EXTENSIONS = new Set(['xlsx', 'xls', 'docx', 'doc', 'pdf', 'pptx', 'ppt'])

// ─── File reading ─────────────────────────────────────────────────────────────

function getExt(filename) {
  return filename.split('.').pop().toLowerCase()
}

async function readUploadedFile(file) {
  const ext = getExt(file.name)
  const id  = `${file.name}-${file.size}`

  if (BINARY_EXTENSIONS.has(ext)) {
    return { id, name: file.name, ext, content: null, binary: true }
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload  = (e) => resolve({ id, name: file.name, ext, content: e.target.result, binary: false })
    reader.onerror = ()  => resolve({ id, name: file.name, ext, content: null, binary: true, readError: true })
    reader.readAsText(file)
  })
}

// ─── Schema Card ─────────────────────────────────────────────────────────────

function SchemaCard({ value, onChange }) {
  const [focused, setFocused] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    gsap.from(cardRef.current, { x: -20, opacity: 0, duration: 0.55, ease: 'power3.out', delay: 0.1 })
  }, [])

  return (
    <div
      ref={cardRef}
      className={`flex flex-col border-2 rounded-2xl overflow-hidden transition-all duration-200 ${
        focused ? 'border-ink shadow-[4px_4px_0px_#111]' : 'border-ink/30 shadow-[2px_2px_0px_#11111120]'
      }`}
    >
      {/* Card header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b-2 transition-colors duration-200 ${focused ? 'border-ink bg-ink' : 'border-ink/30 bg-surface'}`}>
        <div className="flex items-center gap-2">
          <span className={`font-mono text-[10px] tracking-[0.2em] font-bold transition-colors ${focused ? 'text-red' : 'text-muted'}`}>01 /</span>
          <span className={`font-mono text-[11px] tracking-widest uppercase font-bold transition-colors ${focused ? 'text-paper' : 'text-ink'}`}>
            Data Model Schema
          </span>
        </div>
        <span className={`font-mono text-[10px] transition-colors ${focused ? 'text-paper/50' : 'text-muted/60'}`}>
          {value.length > 0 ? `${value.length} chars` : 'paste or type'}
        </span>
      </div>

      {/* Textarea */}
      <div className={`relative flex-1 transition-colors duration-200 ${focused ? 'bg-offwhite' : 'bg-paper'}`}>
        {focused && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red" />}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={SCHEMA_PLACEHOLDER}
          className="w-full h-full min-h-[240px] font-mono text-[12px] leading-relaxed text-ink bg-transparent outline-none resize-none px-5 py-4 placeholder:text-muted/35"
          spellCheck={false}
        />
      </div>
    </div>
  )
}

// ─── Context Card ─────────────────────────────────────────────────────────────

function ContextCard({ value, onChange, files, onFilesChange }) {
  const [focused,   setFocused]   = useState(false)
  const [dragging,  setDragging]  = useState(false)
  const fileInputRef = useRef(null)
  const cardRef      = useRef(null)

  useEffect(() => {
    gsap.from(cardRef.current, { x: 20, opacity: 0, duration: 0.55, ease: 'power3.out', delay: 0.2 })
  }, [])

  const handleFiles = useCallback(async (rawFiles) => {
    const incoming = await Promise.all(Array.from(rawFiles).map(readUploadedFile))
    onFilesChange((prev) => {
      const existingIds = new Set(prev.map((f) => f.id))
      return [...prev, ...incoming.filter((f) => !existingIds.has(f.id))]
    })
  }, [onFilesChange])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeFile = (id) => onFilesChange((prev) => prev.filter((f) => f.id !== id))

  return (
    <div
      ref={cardRef}
      className={`flex flex-col border-2 rounded-2xl overflow-hidden transition-all duration-200 ${
        focused || dragging
          ? 'border-ink shadow-[4px_4px_0px_#111]'
          : 'border-ink/30 shadow-[2px_2px_0px_#11111120]'
      }`}
    >
      {/* Card header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b-2 transition-colors duration-200 ${focused || dragging ? 'border-ink bg-ink' : 'border-ink/30 bg-surface'}`}>
        <div className="flex items-center gap-2">
          <span className={`font-mono text-[10px] tracking-[0.2em] font-bold transition-colors ${focused || dragging ? 'text-red' : 'text-muted'}`}>02 /</span>
          <span className={`font-mono text-[11px] tracking-widest uppercase font-bold transition-colors ${focused || dragging ? 'text-paper' : 'text-ink'}`}>
            Business Context
          </span>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors ${focused || dragging ? 'text-red hover:text-paper' : 'text-muted hover:text-ink'}`}
        >
          <Upload size={11} />
          Upload file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.csv,.json,.md,.xlsx,.xls,.docx,.doc,.pdf,.tsv,.sql,.yaml,.yml"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Textarea + drop zone */}
      <div
        className={`relative flex-1 transition-colors duration-200 ${
          dragging ? 'bg-red/5' : focused ? 'bg-offwhite' : 'bg-paper'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {(focused || dragging) && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red" />}

        {dragging && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-red">
              <Upload size={28} />
              <span className="font-mono text-[11px] tracking-widest uppercase">Drop to attach</span>
            </div>
          </div>
        )}

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={CONTEXT_PLACEHOLDER}
          className={`w-full min-h-[180px] font-grotesk text-[13px] leading-relaxed text-ink bg-transparent outline-none resize-none px-5 py-4 placeholder:text-muted/35 transition-opacity ${dragging ? 'opacity-20' : 'opacity-100'}`}
        />
      </div>

      {/* Attached files */}
      {files.length > 0 && (
        <div className="border-t border-ink/10 bg-surface/60 px-4 py-3 flex flex-col gap-2">
          <span className="font-mono text-[10px] tracking-widest uppercase text-muted mb-1">Attached</span>
          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-2">
              {f.binary || f.readError
                ? <AlertCircle size={12} className="text-red flex-shrink-0" />
                : <FileText size={12} className="text-muted flex-shrink-0" />
              }
              <span className="font-mono text-[11px] text-ink truncate flex-1">{f.name}</span>
              {(f.binary || f.readError) && (
                <span className="font-mono text-[9px] text-red/80 uppercase tracking-wider flex-shrink-0">
                  {f.readError ? 'read error' : 'binary — content not extracted'}
                </span>
              )}
              <button
                onClick={() => removeFile(f.id)}
                className="flex-shrink-0 text-muted hover:text-red transition-colors ml-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function SetupPanels({ onSubmit, disabled }) {
  const [schema,  setSchema]  = useState('')
  const [context, setContext] = useState('')
  const [files,   setFiles]   = useState([])
  const btnRef   = useRef(null)
  const wrapRef  = useRef(null)

  useEffect(() => {
    gsap.from(wrapRef.current, { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out', delay: 0.05 })
  }, [])

  const hasContent = schema.trim() || context.trim() || files.length > 0

  const handleSubmit = () => {
    if (!hasContent || disabled) return

    const parts = ['I\'m providing my data model and business context for dashboard planning.\n']

    if (schema.trim()) {
      parts.push(`## DATA MODEL SCHEMA\n\`\`\`\n${schema.trim()}\n\`\`\``)
    }

    if (context.trim()) {
      parts.push(`## BUSINESS CONTEXT\n${context.trim()}`)
    }

    for (const f of files) {
      if (f.binary || f.readError) {
        parts.push(`## ATTACHED FILE: ${f.name}\n(Binary file attached — content could not be extracted automatically. Filename provided for reference.)`)
      } else if (f.content) {
        parts.push(`## ATTACHED FILE: ${f.name}\n\`\`\`\n${f.content.slice(0, 40000)}\n\`\`\``)
      }
    }

    onSubmit(parts.join('\n\n'))
  }

  return (
    <div ref={wrapRef} className="flex flex-col gap-5 w-full max-w-4xl mx-auto">

      {/* Two-column cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SchemaCard  value={schema}  onChange={setSchema} />
        <ContextCard value={context} onChange={setContext} files={files} onFilesChange={setFiles} />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] text-muted/60 tracking-wider uppercase">
          {!hasContent
            ? 'Fill in at least one field to continue'
            : `Ready — ${[schema.trim() && 'schema', context.trim() && 'context', files.length && `${files.length} file${files.length > 1 ? 's' : ''}`].filter(Boolean).join(' + ')} provided`
          }
        </p>

        <button
          ref={btnRef}
          onClick={handleSubmit}
          disabled={!hasContent || disabled}
          className="flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase bg-ink text-paper px-5 py-2.5 rounded-full disabled:opacity-30 hover:bg-red transition-all duration-200 btn-magnetic"
        >
          Send to Agent
          <span className="text-[14px] leading-none">→</span>
        </button>
      </div>
    </div>
  )
}
