import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { OBJECTIVES, TONES, objectiveHelp, objectiveLabel, toneHelp, toneLabel } from '../lib/catalog'
import { buildPositioning, defaultSnippets } from '../lib/engines'
import { buildStrategy, planMonth } from '../lib/ideas'
import { examplePosts, exampleSnippets } from '../lib/samples'
import { useStore } from '../store'
import type { Objective, Profile, Tone } from '../types'

const STEPS = ['Métier', 'Audience', 'Objectifs', 'Ton', 'Positionnement']

export function Onboarding() {
  const { data, dispatch } = useStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [profession, setProfession] = useState(data?.profile?.profession ?? '')
  const [expertiseText, setExpertiseText] = useState(data?.profile?.expertise.join(', ') ?? '')
  const [audience, setAudience] = useState(data?.profile?.audience ?? '')
  const [audienceDetails, setAudienceDetails] = useState(data?.profile?.audienceDetails ?? '')
  const [objectives, setObjectives] = useState<Objective[]>(data?.profile?.objectives ?? [])
  const [tone, setTone] = useState<Tone>(data?.profile?.tone ?? 'direct')
  const [positioning, setPositioning] = useState(data?.profile?.positioning ?? '')
  const [notes, setNotes] = useState(data?.profile?.communicationNotes ?? '')
  const [includeExamples, setIncludeExamples] = useState(true)

  const draftProfile: Profile = useMemo(
    () => ({
      profession,
      expertise: expertiseText
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      audience,
      audienceDetails,
      objectives: objectives.length ? objectives : ['education'],
      tone,
      positioning,
      communicationNotes: notes,
    }),
    [profession, expertiseText, audience, audienceDetails, objectives, tone, positioning, notes],
  )

  if (data?.onboardingComplete) return <Navigate to="/app" replace />

  function toggleObjective(value: Objective) {
    setObjectives((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  function next() {
    if (step === 3) {
      setPositioning(buildPositioning(draftProfile))
    }
    setStep((value) => Math.min(value + 1, STEPS.length - 1))
  }

  function finish() {
    const profile = {
      ...draftProfile,
      positioning: positioning.trim() || buildPositioning(draftProfile),
    }
    const now = new Date()
    const planned = planMonth(
      profile,
      buildStrategy(profile),
      [],
      now.getFullYear(),
      now.getMonth(),
      8,
    )
    const pillars = planned.pillars
    const posts = includeExamples ? [...examplePosts(), ...planned.posts] : planned.posts
    const snippets = includeExamples
      ? [...defaultSnippets(profile), ...exampleSnippets()]
      : defaultSnippets(profile)
    dispatch({
      type: 'replace-workspace',
      data: {
        profile,
        onboardingComplete: true,
        pillars,
        posts,
        snippets,
      },
    })
    navigate('/app')
  }

  return (
    <div className="onboarding">
      <div className="tiny">Installation guidée · {STEPS[step]}</div>
      <div className="progress" style={{ margin: '12px 0 20px' }}>
        <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      {step === 0 && (
        <>
          <h1>Quel est votre métier ?</h1>
          <p className="lead">Nous n’inventons pas de titres. Écrivez le vôtre tel que vous l’assumez.</p>
          <div className="stack" style={{ marginTop: 22 }}>
            <label className="field">
              <span>Profession</span>
              <input
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="ex. architecte d’intérieur indépendante"
              />
            </label>
            <label className="field">
              <span>Expertises (séparées par des virgules)</span>
              <textarea
                value={expertiseText}
                onChange={(e) => setExpertiseText(e.target.value)}
                placeholder="ex. rénovation, suivi de chantier, conseil matériaux"
              />
              <span className="help">
                Elles nourrissent un pilier parmi d’autres. Le quotidien de votre audience, les
                idées reçues et le rythme de l’année comptent autant que “ce que vous faites”.
              </span>
            </label>
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <h1>À qui parlez-vous ?</h1>
          <p className="lead">Plus l’audience est précise, plus les sujets seront utiles.</p>
          <div className="stack" style={{ marginTop: 22 }}>
            <label className="field">
              <span>Audience principale</span>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="ex. dirigeants de PME industrielles"
              />
            </label>
            <label className="field">
              <span>Situation dans laquelle ils se trouvent</span>
              <textarea
                value={audienceDetails}
                onChange={(e) => setAudienceDetails(e.target.value)}
                placeholder="ex. ils doivent clarifier une offre sans équipe marketing dédiée"
              />
            </label>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <h1>Que cherchez-vous à faire ?</h1>
          <p className="lead">Choisissez un à trois objectifs. Ils orientent le calendrier.</p>
          <div className="choice-grid" style={{ marginTop: 22 }}>
            {OBJECTIVES.map((item) => (
              <button
                key={item}
                type="button"
                className={`choice${objectives.includes(item) ? ' on' : ''}`}
                onClick={() => toggleObjective(item)}
              >
                <strong>{objectiveLabel[item]}</strong>
                <p className="help">{objectiveHelp[item]}</p>
              </button>
            ))}
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <h1>Quel ton vous convient ?</h1>
          <p className="lead">Le ton se retrouve dans les accroches et les outils d’édition.</p>
          <div className="choice-grid" style={{ marginTop: 22 }}>
            {TONES.map((item) => (
              <button
                key={item}
                type="button"
                className={`choice${tone === item ? ' on' : ''}`}
                onClick={() => setTone(item)}
              >
                <strong>{toneLabel[item]}</strong>
                <p className="help">{toneHelp[item]}</p>
              </button>
            ))}
          </div>
        </>
      )}
      {step === 4 && (
        <>
          <h1>Votre positionnement</h1>
          <p className="lead">Texte proposé à partir de vos réponses. Corrigez tout ce qui sonne faux.</p>
          <div className="stack" style={{ marginTop: 22 }}>
            <label className="field">
              <span>Texte de positionnement</span>
              <textarea value={positioning} onChange={(e) => setPositioning(e.target.value)} rows={6} />
            </label>
            <label className="field">
              <span>Préférences de communication</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ex. pas d’émojis, tutoiement, pas de storytelling familial"
              />
            </label>
            <label className="choice">
              <input
                type="checkbox"
                checked={includeExamples}
                onChange={(e) => setIncludeExamples(e.target.checked)}
              />{' '}
              Inclure des posts et un calendrier d’exemple, clairement marqués comme tels.
            </label>
            <div className="notice">
              Les brouillons générés laissent des [crochets] pour vos faits réels. L’application ne
              fabrique ni anecdotes, ni statistiques, ni témoignages.
            </div>
          </div>
        </>
      )}
      <div className="toolbar" style={{ marginTop: 24 }}>
        {step > 0 && (
          <button className="btn btn-ghost" type="button" onClick={() => setStep((value) => value - 1)}>
            Retour
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary" type="button" onClick={next} disabled={step === 0 && !profession.trim()}>
            Continuer
          </button>
        ) : (
          <button className="btn btn-primary" type="button" onClick={finish}>
            Créer ma stratégie
          </button>
        )}
      </div>
    </div>
  )
}
