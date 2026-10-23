import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, PageHead, StatusBadge } from '../components/Ui'
import { reviewPost } from '../lib/engines'
import { useStore } from '../store'

const SCORE_LABEL: Record<string, string> = {
  clarity: 'Clarté',
  structure: 'Structure',
  readability: 'Lisibilité',
  relevance: 'Pertinence',
}

export function ReviewPage() {
  const { data } = useStore()
  const [params, setParams] = useSearchParams()
  const postId = params.get('post') ?? data?.posts[0]?.id ?? ''
  const post = data?.posts.find((item) => item.id === postId)
  const result = useMemo(
    () => (post ? reviewPost(post, data?.profile ?? null) : null),
    [post, data?.profile],
  )

  return (
    <div>
      <PageHead
        kicker="Relecture"
        title="Revue de contenu"
        subtitle="La revue signale le flou, les formules toutes faites et les affirmations non sourcées. Elle ne réécrit pas votre message."
      />
      {!post || !result ? (
        <EmptyState
          title="Aucun post à relire"
          text="Créez d’abord une structure, puis revenez ici."
          action={
            <Link className="btn btn-primary" to="/app/creer">
              Créer un post
            </Link>
          }
        />
      ) : (
        <div className="split editor">
          <div className="stack">
            <label className="field">
              <span>Choisir un post</span>
              <select
                className="input"
                value={post.id}
                onChange={(e) => setParams({ post: e.target.value })}
              >
                {data?.posts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <article className="linkedin-preview">
              <StatusBadge status={post.status} example={post.isExample} />
              <div className="preview-body" style={{ marginTop: 12 }}>
                {post.content}
              </div>
            </article>
            <Link className="btn btn-primary" to={`/app/editeur/${post.id}`}>
              Corriger dans l’éditeur
            </Link>
          </div>
          <aside className="stack">
            <div className="score-grid">
              {Object.entries(result.scores).map(([key, value]) => (
                <article className="score" key={key}>
                  <div className="tiny">{SCORE_LABEL[key]}</div>
                  <strong>{value}</strong>
                  <span className="muted"> / 5</span>
                </article>
              ))}
            </div>
            <article className="card">
              <h3>Points de vigilance</h3>
              <div className="stack" style={{ marginTop: 12 }}>
                {result.issues.length === 0 && (
                  <p className="muted">Rien de bloquant détecté. Relisez encore à voix haute.</p>
                )}
                {result.issues.map((issue) => (
                  <div key={issue.title + (issue.excerpt ?? '')} className={`issue${issue.severity === 'warning' ? ' warn' : ''}`}>
                    <strong>{issue.title}</strong>
                    <p style={{ marginTop: 6 }}>{issue.detail}</p>
                    {issue.excerpt && <p className="tiny" style={{ marginTop: 8 }}>{issue.excerpt}</p>}
                  </div>
                ))}
              </div>
            </article>
            <article className="card">
              <h3>Suggestions</h3>
              <ul style={{ paddingLeft: 18, lineHeight: 1.55 }}>
                {result.suggestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </aside>
        </div>
      )}
    </div>
  )
}
