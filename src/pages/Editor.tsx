import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHead, StatusBadge } from '../components/Ui'
import {
  FORMATS,
  LENGTHS,
  OBJECTIVES,
  STATUSES,
  TONES,
  formatLabel,
  lengthLabel,
  objectiveLabel,
  statusLabel,
  toneLabel,
} from '../lib/catalog'
import { adjustTone, assemblePost, clarifyText, expandText, shortenText } from '../lib/engines'
import { todayIso } from '../lib/dates'
import { uid } from '../lib/ids'
import { useStore } from '../store'
import type { Format, Length, Objective, Post, PostStatus, Tone } from '../types'

export function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, dispatch, toast, account } = useStore()
  const original = data?.posts.find((item) => item.id === id)
  const [post, setPost] = useState<Post | undefined>(original)

  useEffect(() => {
    setPost(original)
  }, [original])

  const current = post
  const profile = data?.profile
  const snippets = data?.snippets ?? []
  const previewName = account?.name ?? 'Vous'

  const tools = useMemo(() => {
    if (!current) return []
    return [
      { label: 'Raccourcir', run: () => shortenText(current.content) },
      {
        label: 'Développer',
        run: () => (profile ? expandText(current.content, profile, current.objective) : current.content),
      },
      { label: 'Clarifier', run: () => clarifyText(current.content) },
      { label: 'Ajuster le ton', run: () => adjustTone(current.content, current.tone) },
    ]
  }, [current, profile])

  if (!original || !current) {
    return (
      <div className="card">
        <h2>Post introuvable</h2>
        <Link to="/app/bibliotheque">Retour à la bibliothèque</Link>
      </div>
    )
  }

  const editing = current

  function patch<K extends keyof Post>(key: K, value: Post[K]) {
    setPost({ ...editing, [key]: value, updatedAt: new Date().toISOString() } as Post)
  }

  function applyContent(next: string) {
    setPost({ ...editing, content: next, updatedAt: new Date().toISOString() })
  }

  return (
    <div>
      <PageHead
        kicker="Éditeur"
        title={current.title}
        subtitle="Modifiez le texte, choisissez une accroche, enregistrez un statut et une date. La revue ne réécrit pas à votre place."
        actions={
          <div className="toolbar">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(current.content)
                toast('Texte copié')
              }}
            >
              Copier
            </button>
            <Link className="btn btn-soft" to={`/app/revue?post=${current.id}`}>
              Relire
            </Link>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                dispatch({ type: 'upsert-post', post: current })
                toast('Enregistré')
              }}
            >
              Enregistrer
            </button>
          </div>
        }
      />
      <div className="split editor">
        <div className="stack">
          <label className="field">
            <span>Titre interne</span>
            <input value={current.title} onChange={(e) => patch('title', e.target.value)} />
          </label>
          <div>
            <div className="legend">Accroches</div>
            <div className="stack" style={{ marginTop: 8 }}>
              {current.hooks.map((hook) => (
                <button
                  key={hook}
                  type="button"
                  className={`choice${current.hook === hook ? ' on' : ''}`}
                  onClick={() =>
                    setPost({
                      ...current,
                      hook,
                      content: assemblePost(hook, current.content.replace(current.hook, '').trim(), current.cta),
                      updatedAt: new Date().toISOString(),
                    })
                  }
                >
                  {hook}
                </button>
              ))}
            </div>
            {snippets.filter((item) => item.kind === 'hook').length > 0 && (
              <select
                className="input"
                style={{ marginTop: 8 }}
                defaultValue=""
                onChange={(e) => {
                  if (!e.target.value) return
                  const hook = e.target.value
                  setPost({
                    ...current,
                    hook,
                    hooks: current.hooks.includes(hook) ? current.hooks : [...current.hooks, hook],
                    updatedAt: new Date().toISOString(),
                  })
                }}
              >
                <option value="">Insérer une accroche enregistrée</option>
                {snippets
                  .filter((item) => item.kind === 'hook')
                  .map((item) => (
                    <option key={item.id} value={item.text}>
                      {item.text}
                    </option>
                  ))}
              </select>
            )}
          </div>
          <label className="field">
            <span>Texte du post · {current.content.length} caractères</span>
            <textarea rows={16} value={current.content} onChange={(e) => patch('content', e.target.value)} />
          </label>
          <label className="field">
            <span>Appel à poursuivre</span>
            <textarea rows={3} value={current.cta} onChange={(e) => patch('cta', e.target.value)} />
          </label>
          <select
            className="input"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) patch('cta', e.target.value)
            }}
          >
            <option value="">Insérer un CTA enregistré</option>
            {snippets
              .filter((item) => item.kind === 'cta')
              .map((item) => (
                <option key={item.id} value={item.text}>
                  {item.text}
                </option>
              ))}
          </select>
          <div className="toolbar">
            {tools.map((tool) => (
              <button key={tool.label} className="btn btn-ghost" type="button" onClick={() => applyContent(tool.run())}>
                {tool.label}
              </button>
            ))}
            <button
              className="btn btn-soft"
              type="button"
              onClick={() => {
                dispatch({
                  type: 'upsert-snippet',
                  snippet: {
                    id: uid('snip'),
                    kind: 'hook',
                    text: current.hook,
                    createdAt: new Date().toISOString(),
                  },
                })
                toast('Accroche enregistrée')
              }}
            >
              Sauver l’accroche
            </button>
            <button
              className="btn btn-soft"
              type="button"
              onClick={() => {
                dispatch({
                  type: 'upsert-snippet',
                  snippet: {
                    id: uid('snip'),
                    kind: 'cta',
                    text: current.cta,
                    createdAt: new Date().toISOString(),
                  },
                })
                toast('CTA enregistré')
              }}
            >
              Sauver le CTA
            </button>
          </div>
        </div>
        <aside className="stack">
          <article className="card stack">
            <StatusBadge status={current.status} example={current.isExample} />
            <label className="field">
              <span>Statut</span>
              <select
                className="input"
                value={current.status}
                onChange={(e) => patch('status', e.target.value as PostStatus)}
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {statusLabel[item]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Date prévue</span>
              <input
                type="date"
                value={current.scheduledDate ?? ''}
                onChange={(e) => patch('scheduledDate', e.target.value || undefined)}
              />
            </label>
            <button className="btn btn-ghost" type="button" onClick={() => patch('scheduledDate', todayIso())}>
              Planifier aujourd’hui
            </button>
            <div className="form-grid">
              <select className="input" value={current.format} onChange={(e) => patch('format', e.target.value as Format)}>
                {FORMATS.map((item) => (
                  <option key={item} value={item}>
                    {formatLabel[item]}
                  </option>
                ))}
              </select>
              <select className="input" value={current.length} onChange={(e) => patch('length', e.target.value as Length)}>
                {LENGTHS.map((item) => (
                  <option key={item} value={item}>
                    {lengthLabel[item]}
                  </option>
                ))}
              </select>
              <select className="input" value={current.tone} onChange={(e) => patch('tone', e.target.value as Tone)}>
                {TONES.map((item) => (
                  <option key={item} value={item}>
                    {toneLabel[item]}
                  </option>
                ))}
              </select>
              <select
                className="input"
                value={current.objective}
                onChange={(e) => patch('objective', e.target.value as Objective)}
              >
                {OBJECTIVES.map((item) => (
                  <option key={item} value={item}>
                    {objectiveLabel[item]}
                  </option>
                ))}
              </select>
            </div>
          </article>
          <article className="linkedin-preview">
            <div className="preview-head">
              <div className="avatar">{previewName.slice(0, 1).toUpperCase()}</div>
              <div>
                <strong>{previewName}</strong>
                <div className="help">{profile?.profession}</div>
              </div>
            </div>
            <div className="preview-body">{current.content}</div>
          </article>
          <article className="card">
            <div className="tiny">Plan</div>
            <ol style={{ paddingLeft: 18 }}>
              {current.outline.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
          <button
            className="btn btn-danger"
            type="button"
            onClick={() => {
              dispatch({ type: 'delete-post', id: current.id })
              navigate('/app/bibliotheque')
            }}
          >
            Supprimer
          </button>
        </aside>
      </div>
    </div>
  )
}
