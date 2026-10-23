import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHead, Field } from '../components/Ui'
import {
  FORMATS,
  LENGTHS,
  OBJECTIVES,
  TONES,
  formatHelp,
  angleLabel,
  formatLabel,
  lengthHelp,
  lengthLabel,
  objectiveLabel,
  toneLabel,
} from '../lib/catalog'
import { generateDraft } from '../lib/engines'
import { nextUnusedIdea } from '../lib/ideas'
import { uid } from '../lib/ids'
import { useStore } from '../store'
import type { Angle, Format, Length, Objective, Tone } from '../types'

export function CreatePost() {
  const { data, dispatch, toast } = useStore()
  const navigate = useNavigate()
  const profile = data?.profile
  const topics = data?.pillars.flatMap((pillar) =>
    pillar.topics.map((topic) => ({ ...topic, pillarId: pillar.id, pillar: pillar.title })),
  ) ?? []

  const [format, setFormat] = useState<Format>('educational')
  const [length, setLength] = useState<Length>('medium')
  const [tone, setTone] = useState<Tone>(profile?.tone ?? 'direct')
  const [objective, setObjective] = useState<Objective>(profile?.objectives[0] ?? 'education')
  const [topicId, setTopicId] = useState(topics[0]?.id ?? '')
  const [customTopic, setCustomTopic] = useState('')
  const [notes, setNotes] = useState('')
  const [audience, setAudience] = useState(profile?.audience ?? '')
  const [angle, setAngle] = useState<Angle | undefined>()

  const topic = topics.find((item) => item.id === topicId)
  const topicTitle = customTopic.trim() || topic?.title || 'Sujet professionnel'

  const preview = useMemo(() => {
    if (!profile) return null
    return generateDraft(profile, {
      format,
      length,
      tone,
      objective,
      topic: topicTitle,
      notes,
      pillarId: topic?.pillarId,
      audience,
      formatLabel: formatLabel[format],
    })
  }, [profile, format, length, tone, objective, topicTitle, notes, topic?.pillarId, audience])

  function create(status: 'idea' | 'draft') {
    if (!profile || !preview) return
    const id = uid('post')
    dispatch({
      type: 'upsert-post',
      post: {
        id,
        ...preview,
        format,
        length,
        tone,
        audience,
        objective,
        topic: topicTitle,
        pillarId: topic?.pillarId,
        angle,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes,
      },
    })
    toast(status === 'idea' ? 'Idée enregistrée' : 'Brouillon créé')
    navigate(`/app/editeur/${id}`)
  }

  return (
    <div>
      <PageHead
        kicker="Rédaction"
        title="Créer un post"
        subtitle="Variez les angles : quotidien de l’audience, idées reçues, moment de l’année, limites — pas seulement “voici ce que je fais”."
      />
      <div className="notice" style={{ marginBottom: 16 }}>
        Version actuelle : rédaction assistée par modèles, à partir de votre profil. Pas d’API
        d’intelligence artificielle payante. Les crochets [comme ceci] doivent être remplacés par
        des éléments que vous assumez.
      </div>
      <div className="split editor">
        <div className="stack">
          <div className="choice-grid">
            {FORMATS.map((item) => (
              <button
                key={item}
                type="button"
                className={`choice${format === item ? ' on' : ''}`}
                onClick={() => setFormat(item)}
              >
                <strong>{formatLabel[item]}</strong>
                <p className="help">{formatHelp[item]}</p>
              </button>
            ))}
          </div>
          <Field label="Sujet issu de la stratégie">
            <select className="input" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
              <option value="">Aucun</option>
              {topics.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ou un sujet libre" hint="Restez factuel. N’écrivez pas une victoire que vous n’avez pas vécue.">
            <input value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} />
          </Field>
          <button
            className="btn btn-soft"
            type="button"
            onClick={() => {
              if (!profile || !data) return
              const idea = nextUnusedIdea(profile, data.posts, data.pillars)
              if (!idea) {
                toast('Plus d’idée inédite ce mois-ci. Ajoutez-en dans Stratégie ou passez au mois suivant.')
                return
              }
              setCustomTopic(idea.title)
              setTopicId('')
              setFormat(idea.format)
              setObjective(idea.objective)
              setNotes(idea.notes)
              setAngle(idea.angle)
              toast(`Nouvel angle : ${angleLabel[idea.angle]}`)
            }}
          >
            Proposer un sujet encore non traité
          </button>
          {angle && <span className="badge badge-angle">{angleLabel[angle]}</span>}
          <Field label="Notes réelles (facultatif)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Un fait, une question, un distinguo — pas une statistique inventée."
            />
          </Field>
          <div className="form-grid">
            <Field label="Longueur">
              <select className="input" value={length} onChange={(e) => setLength(e.target.value as Length)}>
                {LENGTHS.map((item) => (
                  <option key={item} value={item}>
                    {lengthLabel[item]} — {lengthHelp[item]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ton">
              <select className="input" value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
                {TONES.map((item) => (
                  <option key={item} value={item}>
                    {toneLabel[item]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Objectif">
              <select className="input" value={objective} onChange={(e) => setObjective(e.target.value as Objective)}>
                {OBJECTIVES.map((item) => (
                  <option key={item} value={item}>
                    {objectiveLabel[item]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Audience pour ce post">
              <input value={audience} onChange={(e) => setAudience(e.target.value)} />
            </Field>
          </div>
          <div className="toolbar">
            <button className="btn btn-ghost" type="button" onClick={() => create('idea')}>
              Garder comme idée
            </button>
            <button className="btn btn-primary" type="button" onClick={() => create('draft')}>
              Ouvrir dans l’éditeur
            </button>
          </div>
        </div>
        <aside className="stack">
          <article className="card">
            <div className="tiny">Plan proposé</div>
            <h3 style={{ margin: '8px 0' }}>{preview?.title}</h3>
            <ol style={{ paddingLeft: 18, lineHeight: 1.55 }}>
              {preview?.outline.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
          <article className="card">
            <div className="tiny">Accroches</div>
            <ul style={{ paddingLeft: 18, lineHeight: 1.55 }}>
              {preview?.hooks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="linkedin-preview">
            <div className="preview-head">
              <div className="avatar">{(profile?.profession ?? 'S').slice(0, 1).toUpperCase()}</div>
              <div>
                <strong>Aperçu</strong>
                <div className="help">Structure, pas publication</div>
              </div>
            </div>
            <div className="preview-body">{preview?.content}</div>
          </article>
        </aside>
      </div>
    </div>
  )
}
