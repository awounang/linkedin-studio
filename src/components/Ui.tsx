import { useEffect, type ReactNode } from 'react'
import { statusLabel } from '../lib/catalog'
import type { PostStatus } from '../types'

export function PageHead({
  kicker,
  title,
  subtitle,
  actions,
}: {
  kicker?: string
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <header className="page-head">
      {kicker && <div className="tiny">{kicker}</div>}
      <div className="split" style={{ alignItems: 'end' }}>
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="muted" style={{ marginTop: 8, lineHeight: 1.5 }}>{subtitle}</p>}
        </div>
        {actions}
      </div>
    </header>
  )
}

export function StatusBadge({ status, example }: { status: PostStatus; example?: boolean }) {
  return (
    <span className="status-row">
      <span className={`badge badge-${status}`}>{statusLabel[status]}</span>
      {example && <span className="badge badge-example">Exemple</span>}
    </span>
  )
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <h2>{title}</h2>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Fermer
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="card empty">
      <h3>{title}</h3>
      <p style={{ margin: '8px 0 16px' }}>{text}</p>
      {action}
    </div>
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <span className="help">{hint}</span>}
    </label>
  )
}
