import { FormEvent, useState } from 'react'
import { PageHead, Field } from '../components/Ui'
import { OBJECTIVES, TONES, objectiveLabel, toneLabel } from '../lib/catalog'
import { buildPositioning } from '../lib/engines'
import { useStore } from '../store'
import type { Objective, Tone } from '../types'

export function ProfilePage() {
  const { data, dispatch, toast } = useStore()
  const profile = data?.profile
  const [profession, setProfession] = useState(profile?.profession ?? '')
  const [expertiseText, setExpertiseText] = useState(profile?.expertise.join(', ') ?? '')
  const [audience, setAudience] = useState(profile?.audience ?? '')
  const [audienceDetails, setAudienceDetails] = useState(profile?.audienceDetails ?? '')
  const [objectives, setObjectives] = useState<Objective[]>(profile?.objectives ?? [])
  const [tone, setTone] = useState<Tone>(profile?.tone ?? 'direct')
  const [positioning, setPositioning] = useState(profile?.positioning ?? '')
  const [notes, setNotes] = useState(profile?.communicationNotes ?? '')

  function toggle(value: Objective) {
    setObjectives((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  function save(event: FormEvent) {
    event.preventDefault()
    dispatch({
      type: 'set-profile',
      profile: {
        profession,
        expertise: expertiseText.split(',').map((item) => item.trim()).filter(Boolean),
        audience,
        audienceDetails,
        objectives,
        tone,
        positioning,
        communicationNotes: notes,
      },
    })
    toast('Profil enregistré')
  }

  return (
    <div>
      <PageHead
        kicker="Cadrage"
        title="Profil et positionnement"
        subtitle="Ces éléments alimentent la stratégie, les structures de posts et la revue. Vous pouvez tout modifier à tout moment."
      />
      <form className="stack" onSubmit={save}>
        <div className="form-grid">
          <Field label="Profession">
            <input value={profession} onChange={(e) => setProfession(e.target.value)} required />
          </Field>
          <Field label="Audience">
            <input value={audience} onChange={(e) => setAudience(e.target.value)} required />
          </Field>
        </div>
        <Field label="Expertises, séparées par des virgules">
          <input value={expertiseText} onChange={(e) => setExpertiseText(e.target.value)} />
        </Field>
        <Field label="Situation de l’audience">
          <textarea value={audienceDetails} onChange={(e) => setAudienceDetails(e.target.value)} />
        </Field>
        <div>
          <div className="legend">Objectifs</div>
          <div className="chip-row" style={{ marginTop: 8 }}>
            {OBJECTIVES.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip${objectives.includes(item) ? ' on' : ''}`}
                onClick={() => toggle(item)}
              >
                {objectiveLabel[item]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="legend">Ton préféré</div>
          <div className="chip-row" style={{ marginTop: 8 }}>
            {TONES.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip${tone === item ? ' on' : ''}`}
                onClick={() => setTone(item)}
              >
                {toneLabel[item]}
              </button>
            ))}
          </div>
        </div>
        <Field label="Positionnement">
          <textarea value={positioning} onChange={(e) => setPositioning(e.target.value)} rows={5} />
        </Field>
        <Field label="Préférences de communication">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <div className="toolbar">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() =>
              setPositioning(
                buildPositioning({
                  profession,
                  expertise: expertiseText.split(',').map((item) => item.trim()).filter(Boolean),
                  audience,
                  objectives,
                  tone,
                }),
              )
            }
          >
            Régénérer le texte de cadrage
          </button>
          <button className="btn btn-primary">Enregistrer</button>
        </div>
      </form>
    </div>
  )
}
