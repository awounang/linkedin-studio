import { useEffect, useState } from 'react'
import { PageHead } from '../components/Ui'
import { calendarSummary, downloadText, postsToCsv, postsToIcs } from '../lib/export'
import { useStore } from '../store'

type BeforeInstall = Event & { prompt: () => Promise<void> }

export function SettingsPage() {
  const { account, data, dispatch, logout, toast } = useStore()
  const [installEvent, setInstallEvent] = useState<BeforeInstall | null>(null)
  const [standalone, setStandalone] = useState(false)

  useEffect(() => {
    setStandalone(window.matchMedia('(display-mode: standalone)').matches)
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstall)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const posts = data?.posts ?? []

  return (
    <div>
      <PageHead
        kicker="Espace de travail"
        title="Paramètres, export et limites"
        subtitle="Tout fonctionne en local. L’application n’envoie rien vers LinkedIn, ni vers une API d’IA."
      />
      <div className="stack">
        <article className="card">
          <h2>Compte local</h2>
          <p className="muted" style={{ margin: '8px 0 14px' }}>
            {account?.name} · {account?.email}
          </p>
          <p className="help">
            Mot de passe haché dans ce navigateur. Pas de récupération en ligne : si vous effacez
            les données du site, l’espace disparaît.
          </p>
          <div className="toolbar" style={{ marginTop: 14 }}>
            <button className="btn btn-ghost" type="button" onClick={logout}>
              Se déconnecter
            </button>
            <button
              className="btn btn-danger"
              type="button"
              onClick={() => {
                if (confirm('Supprimer définitivement cet espace sur cet appareil ?')) {
                  dispatch({ type: 'delete-account' })
                }
              }}
            >
              Supprimer l’espace
            </button>
          </div>
        </article>
        <article className="card">
          <h2>Installer l’application</h2>
          {standalone ? (
            <p className="muted">L’application est déjà ouverte comme PWA.</p>
          ) : installEvent ? (
            <div className="install-banner">
              <div>
                <strong>Ajouter à l’écran d’accueil</strong>
                <div className="help" style={{ color: '#e8efe9' }}>
                  Usage hors-ligne après la première visite.
                </div>
              </div>
              <button
                className="btn btn-gold"
                type="button"
                onClick={async () => {
                  await installEvent.prompt()
                  setInstallEvent(null)
                }}
              >
                Installer
              </button>
            </div>
          ) : (
            <p className="help">
              Sur iPhone : bouton Partager, puis « Sur l’écran d’accueil ». Sur Chrome ordinateur
              ou Android, le navigateur peut proposer l’installation après quelques visites.
            </p>
          )}
        </article>
        <article className="card">
          <h2>Exporter</h2>
          <p className="help">Copiez un post depuis l’éditeur, ou exportez le calendrier.</p>
          <div className="toolbar" style={{ marginTop: 14 }}>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                downloadText('calendrier-linkedin-studio.csv', postsToCsv(posts), 'text/csv;charset=utf-8')
                toast('CSV téléchargé')
              }}
            >
              Calendrier CSV
            </button>
            <button
              className="btn btn-soft"
              type="button"
              onClick={() => {
                downloadText(
                  'calendrier-linkedin-studio.ics',
                  postsToIcs(posts, data?.profile ?? null),
                  'text/calendar;charset=utf-8',
                )
                toast('Fichier calendrier téléchargé')
              }}
            >
              Calendrier ICS
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(calendarSummary(posts))
                toast('Résumé copié')
              }}
            >
              Copier le résumé
            </button>
          </div>
        </article>
        <article className="card">
          <h2>Ce qui fonctionne tout de suite</h2>
          <ul style={{ lineHeight: 1.65 }}>
            <li>Compte local, données privées par utilisateur sur cet appareil.</li>
            <li>Onboarding, profil, piliers, sujets, calendrier, bibliothèque, revue.</li>
            <li>Structures de posts, accroches, plans, CTA, outils d’édition.</li>
            <li>Posts d’exemple et calendrier de démarrage, marqués comme tels.</li>
            <li>Export CSV / ICS, copie du texte, installation PWA selon le navigateur.</li>
          </ul>
        </article>
        <article className="notice">
          <strong>Ce qui demande une configuration supplémentaire</strong>
          <p style={{ marginTop: 8 }}>
            La génération « intelligente » au sens d’un modèle de langage nécessite une clé API
            (OpenAI, Anthropic ou autre) et un backend pour ne pas exposer cette clé. Cette version
            s’en passe volontairement. Une publication directe sur LinkedIn exigerait une
            application LinkedIn officielle, un consentement OAuth, et n’est pas implémentée.
            Une synchronisation multi-appareils exigerait un serveur d’authentification.
          </p>
        </article>
      </div>
    </div>
  )
}
