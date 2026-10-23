import { Link, Navigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useStore } from '../store'

export function Welcome() {
  const { account, data } = useStore()
  if (account) {
    return <Navigate to={data?.onboardingComplete ? '/app' : '/onboarding'} replace />
  }

  return (
    <div className="hero">
      <div className="hero-grid">
        <section>
          <Logo />
          <div className="kicker" style={{ marginTop: 22 }}>
            Application professionnelle · français · usage mobile
          </div>
          <h1>De l’absence d’idées à une parole LinkedIn cohérente.</h1>
          <p className="lead">
            LinkedIn Studio vous aide à poser un positionnement, des piliers éditoriaux, un
            calendrier et des brouillons prêts à relire. Sans inventer d’expériences, de chiffres
            ou de témoignages.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/inscription">
              Créer un espace
            </Link>
            <Link className="btn btn-ghost" to="/connexion">
              J’ai déjà un compte
            </Link>
          </div>
          <p className="help">
            Les données restent sur cet appareil, isolées par compte. Aucune publication
            automatique vers LinkedIn.
          </p>
        </section>
        <aside className="stack">
          {[
            ['01', 'Positionnement', 'Métier, audience, objectifs, ton — un texte de cadrage éditable.'],
            ['02', 'Stratégie', 'Piliers, sujets, et répartition par objectif professionnel.'],
            ['03', 'Rédaction', 'Structures, accroches, CTA, outils pour raccourcir ou clarifier.'],
            ['04', 'Calendrier', 'Idées, brouillons, prêts, publiés — à replanifier en un geste.'],
          ].map(([num, title, text]) => (
            <article className="card" key={title}>
              <div className="tiny">{num}</div>
              <h3 style={{ margin: '6px 0 8px' }}>{title}</h3>
              <p className="muted">{text}</p>
            </article>
          ))}
        </aside>
      </div>
    </div>
  )
}
