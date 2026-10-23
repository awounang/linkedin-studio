import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState, PageHead, StatusBadge } from '../components/Ui'
import { FORMATS, OBJECTIVES, STATUSES, formatLabel, objectiveLabel, statusLabel } from '../lib/catalog'
import { formatLongDate } from '../lib/dates'
import { uid } from '../lib/ids'
import { useStore } from '../store'
import type { Format, Objective, PostStatus, SavedSnippet } from '../types'

export function LibraryPage() {
  const { data, dispatch, toast } = useStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<PostStatus | 'all'>('all')
  const [format, setFormat] = useState<Format | 'all'>('all')
  const [objective, setObjective] = useState<Objective | 'all'>('all')
  const [snippetText, setSnippetText] = useState('')
  const [snippetKind, setSnippetKind] = useState<SavedSnippet['kind']>('hook')

  const posts = data?.posts ?? []
  const snippets = data?.snippets ?? []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((post) => {
      if (status !== 'all' && post.status !== status) return false
      if (format !== 'all' && post.format !== format) return false
      if (objective !== 'all' && post.objective !== objective) return false
      if (!q) return true
      return `${post.title} ${post.content} ${post.topic} ${post.hook}`.toLowerCase().includes(q)
    })
  }, [posts, query, status, format, objective])

  function duplicate(id: string) {
    const post = posts.find((item) => item.id === id)
    if (!post) return
    const copy = {
      ...post,
      id: uid('post'),
      title: `${post.title} (copie)`,
      status: 'idea' as const,
      scheduledDate: undefined,
      isExample: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: 'upsert-post', post: copy })
    toast('Post dupliqué')
    navigate(`/app/editeur/${copy.id}`)
  }

  return (
    <div>
      <PageHead
        kicker="Archives de travail"
        title="Bibliothèque"
        subtitle="Idées, brouillons, posts d’exemple, accroches et appels à poursuivre. Cherchez, filtrez, dupliquez."
        actions={
          <Link className="btn btn-primary" to="/app/creer">
            Nouveau post
          </Link>
        }
      />
      <div className="searchbar">
        <input
          className="input"
          placeholder="Rechercher un titre, un sujet, un extrait…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value as PostStatus | 'all')}>
          <option value="all">Tous les statuts</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {statusLabel[item]}
            </option>
          ))}
        </select>
        <select className="input" value={format} onChange={(e) => setFormat(e.target.value as Format | 'all')}>
          <option value="all">Tous les formats</option>
          {FORMATS.map((item) => (
            <option key={item} value={item}>
              {formatLabel[item]}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={objective}
          onChange={(e) => setObjective(e.target.value as Objective | 'all')}
        >
          <option value="all">Tous les objectifs</option>
          {OBJECTIVES.map((item) => (
            <option key={item} value={item}>
              {objectiveLabel[item]}
            </option>
          ))}
        </select>
      </div>
      <div className="post-grid" style={{ marginTop: 16 }}>
        {filtered.map((post) => (
          <article className="card" key={post.id}>
            <StatusBadge status={post.status} example={post.isExample} />
            <h3 style={{ margin: '10px 0 6px' }}>{post.title}</h3>
            <p className="help">
              {formatLabel[post.format]} · {objectiveLabel[post.objective]} · {formatLongDate(post.scheduledDate)}
            </p>
            <p className="muted" style={{ margin: '10px 0 14px', minHeight: 44 }}>
              {post.hook}
            </p>
            <div className="toolbar">
              <Link className="btn btn-primary" to={`/app/editeur/${post.id}`}>
                Éditer
              </Link>
              <button className="btn btn-ghost" type="button" onClick={() => duplicate(post.id)}>
                Dupliquer
              </button>
              <Link className="btn btn-soft" to={`/app/revue?post=${post.id}`}>
                Relire
              </Link>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <EmptyState title="Aucun contenu" text="Élargissez les filtres, ou créez une première structure." />
      )}
      <section style={{ marginTop: 28 }}>
        <h2>Accroches et appels à poursuivre</h2>
        <div className="card" style={{ marginTop: 12 }}>
          <div className="searchbar">
            <select
              className="input"
              value={snippetKind}
              onChange={(e) => setSnippetKind(e.target.value as SavedSnippet['kind'])}
            >
              <option value="hook">Accroche</option>
              <option value="cta">Appel à poursuivre</option>
            </select>
            <input
              className="input"
              value={snippetText}
              onChange={(e) => setSnippetText(e.target.value)}
              placeholder="Ajouter une formulation réutilisable"
            />
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                if (!snippetText.trim()) return
                dispatch({
                  type: 'upsert-snippet',
                  snippet: {
                    id: uid('snip'),
                    kind: snippetKind,
                    text: snippetText.trim(),
                    createdAt: new Date().toISOString(),
                  },
                })
                setSnippetText('')
                toast('Enregistré dans la bibliothèque')
              }}
            >
              Ajouter
            </button>
          </div>
          <div className="stack" style={{ marginTop: 16 }}>
            {snippets.map((item) => (
              <div key={item.id} className="choice" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div className="tiny">{item.kind === 'hook' ? 'Accroche' : 'CTA'}</div>
                  <div>{item.text}</div>
                </div>
                <button className="btn btn-ghost" type="button" onClick={() => dispatch({ type: 'delete-snippet', id: item.id })}>
                  Retirer
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
