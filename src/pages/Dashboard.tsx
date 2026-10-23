import { Link } from 'react-router-dom'
import { PageHead, StatusBadge } from '../components/Ui'
import { formatLabel, objectiveLabel, statusLabel } from '../lib/catalog'
import { formatLongDate, todayIso } from '../lib/dates'
import { PILLAR_META, upcomingGap } from '../lib/ideas'
import { useStore } from '../store'

export function Dashboard() {
  const { account, data } = useStore()
  const posts = data?.posts ?? []
  const gap = upcomingGap(posts)
  const hasAudiencePillar = (data?.pillars ?? []).some(
    (pillar) => pillar.title === PILLAR_META.audience.title,
  )
  const upcoming = [...posts]
    .filter((post) => post.scheduledDate && post.scheduledDate >= todayIso() && post.status !== 'published')
    .sort((a, b) => (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? ''))
    .slice(0, 4)
  const counts = {
    idea: posts.filter((p) => p.status === 'idea').length,
    draft: posts.filter((p) => p.status === 'draft').length,
    ready: posts.filter((p) => p.status === 'ready').length,
    published: posts.filter((p) => p.status === 'published').length,
  }

  return (
    <div>
      <PageHead
        kicker={`Bonjour ${account?.name ?? ''}`}
        title="Votre studio éditorial"
        subtitle="Passez d’une intention à un calendrier, puis à un texte relisible. Rien n’est publié à votre place."
        actions={
          <Link className="btn btn-primary" to="/app/creer">
            Rédiger un post
          </Link>
        }
      />
      <div className="stat-grid">
        {(['idea', 'draft', 'ready', 'published'] as const).map((status) => (
          <article className="card" key={status}>
            <div className="tiny">{statusLabel[status]}</div>
            <div className="display" style={{ fontSize: '2rem', marginTop: 8 }}>
              {counts[status]}
            </div>
          </article>
        ))}
      </div>
      {!hasAudiencePillar && (
        <div className="notice" style={{ marginBottom: 16 }}>
          Votre stratégie actuelle insiste surtout sur le métier. Pour varier sur plusieurs mois,
          ouvrez Stratégie puis « Rééquilibrer » ou « Nouvelles idées du mois ».
        </div>
      )}
      <section className="stack" style={{ marginTop: 22 }}>
        <article className="card">
          <div className="tiny">Positionnement</div>
          <p style={{ marginTop: 10, lineHeight: 1.55 }}>{data?.profile?.positioning}</p>
          <div className="toolbar" style={{ marginTop: 14 }}>
            <Link className="btn btn-soft" to="/app/profil">
              Modifier le profil
            </Link>
            <Link className="btn btn-ghost" to="/app/strategie">
              Voir les piliers
            </Link>
          </div>
        </article>
        <div className="split">
          <article className="card">
            <h2>Prochaines publications</h2>
            <div className="stack" style={{ marginTop: 12 }}>
              {upcoming.length === 0 && <p className="muted">Rien de planifié. Ouvrez le calendrier pour poser des dates.</p>}
              {upcoming.map((post) => (
                <Link key={post.id} to={`/app/editeur/${post.id}`} className="choice">
                  <StatusBadge status={post.status} example={post.isExample} />
                  <strong style={{ display: 'block', margin: '6px 0 4px' }}>{post.title}</strong>
                  <span className="help">
                    {formatLongDate(post.scheduledDate)} · {formatLabel[post.format]} · {objectiveLabel[post.objective]}
                  </span>
                </Link>
              ))}
            </div>
          </article>
          <article className="card">
            <h2>Continuer</h2>
            <div className="stack" style={{ marginTop: 12 }}>
              <Link className="choice" to="/app/creer">
                <strong>Générer une structure de post</strong>
                <p className="help">Formats, ton, objectif, crochets à compléter.</p>
              </Link>
              <Link className="choice" to="/app/revue">
                <strong>Relire un brouillon</strong>
                <p className="help">Clarté, structure, formulations génériques, affirmations non sourcées.</p>
              </Link>
              <Link className="choice" to="/app/calendrier">
                <strong>Replanifier la semaine</strong>
                <p className="help">Glissez une date, changez un statut, exportez le calendrier.</p>
              </Link>
              <Link className="choice" to="/app/strategie">
                <strong>
                  {gap < 4 ? 'Renouveler les idées du mois' : 'Ouvrir la stratégie'}
                </strong>
                <p className="help">
                  {gap < 4
                    ? 'Peu de publications à venir : générez une fournée d’angles différents (audience, idées reçues, saison…).'
                    : 'Six piliers, pas seulement votre métier. Ajoutez des idées sans recycler les anciennes.'}
                </p>
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
