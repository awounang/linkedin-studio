import { FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Field } from '../components/Ui'
import { useStore } from '../store'

export function Auth({ mode }: { mode: 'login' | 'signup' }) {
  const { account, data, login, signup } = useStore()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (account) {
    return <Navigate to={data?.onboardingComplete ? '/app' : '/onboarding'} replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const result =
      mode === 'signup' ? await signup(name, email, password) : await login(email, password)
    setBusy(false)
    if (result) {
      setError(result)
      return
    }
    navigate(mode === 'signup' ? '/onboarding' : '/app')
  }

  return (
    <div className="hero" style={{ maxWidth: 480 }}>
      <Logo />
      <div className="auth-wrap" style={{ marginTop: 24 }}>
        <div className="tiny">{mode === 'signup' ? 'Nouvel espace' : 'Connexion locale'}</div>
        <h1 style={{ margin: '8px 0 12px' }}>
          {mode === 'signup' ? 'Créer votre espace de travail' : 'Revenir à votre espace'}
        </h1>
        <p className="help" style={{ marginBottom: 18 }}>
          Authentification locale sur cet appareil. Aucun serveur n’est requis. Vos contenus ne
          sont pas synchronisés entre navigateurs.
        </p>
        <form className="stack" onSubmit={onSubmit}>
          {mode === 'signup' && (
            <Field label="Prénom ou nom d’usage">
              <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </Field>
          )}
          <Field label="E-mail">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </Field>
          <Field
            label="Mot de passe"
            hint={mode === 'signup' ? 'Au moins 8 caractères. Stocké sous forme hachée, localement.' : undefined}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === 'signup' ? 8 : 1}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </Field>
          {error && <div className="issue warn">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Veuillez patienter…' : mode === 'signup' ? 'Commencer' : 'Se connecter'}
          </button>
        </form>
        <p className="help" style={{ marginTop: 16 }}>
          {mode === 'signup' ? (
            <>
              Déjà un espace ? <Link to="/connexion">Connexion</Link>
            </>
          ) : (
            <>
              Pas encore d’espace ? <Link to="/inscription">Créer un compte</Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
