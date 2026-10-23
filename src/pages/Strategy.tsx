import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHead, EmptyState, Field } from '../components/Ui'
import { MONTHS, OBJECTIVES, angleLabel, objectiveLabel } from '../lib/catalog'
import { buildStrategy, mergeFreshTopics } from '../lib/ideas'
import { uid } from '../lib/ids'
import { useStore } from '../store'
import type { Objective, Pillar } from '../types'

export function StrategyPage() {
  const { data, dispatch, toast } = useStore()
  const pillars = data?.pillars ?? []
  const [editing, setEditing] = useState<Pillar | null>(null)

  function updatePillar(next: Pillar) {
    dispatch({
      type: 'set-pillars',
      pillars: pillars.map((item) => (item.id === next.id ? next : item)),
    })
  }

  function addPillar() {
    const pillar: Pillar = {
      id: uid('pillar'),
      title: 'Nouveau pilier',
      description: 'Décrivez le territoire de parole que vous voulez occuper durablement.',
      topics: [],
    }
    dispatch({ type: 'set-pillars', pillars: [...pillars, pillar] })
    setEditing(pillar)
  }

  function addTopic(pillar: Pillar) {
    updatePillar({
      ...pillar,
      topics: [
        ...pillar.topics,
        { id: uid('topic'), title: 'Nouveau sujet', objective: 'education', notes: '' },
      ],
    })
  }

  const grouped = OBJECTIVES.map((objective) => ({
    objective,
    topics: pillars.flatMap((pillar) =>
      pillar.topics.filter((topic) => topic.objective === objective).map((topic) => ({ ...topic, pillar: pillar.title })),
    ),
  }))

  return (
    <div>
      <PageHead
        kicker="Ligne éditoriale"
        title="Stratégie de contenu"
        subtitle="La ligne ne tourne pas seulement autour de votre métier : quotidien de l’audience, idées reçues, arbitrages, conversations, rythme de l’année."
        actions={
          <div className="toolbar">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                if (!data?.profile) return
                const month = new Date().getMonth()
                const next = mergeFreshTopics(data.profile, pillars, data.posts, 8, month)
                dispatch({ type: 'set-pillars', pillars: next.pillars })
                toast(`${next.ideas.length} idées neuves ajoutées pour ${MONTHS[month]}`)
              }}
            >
              Nouvelles idées du mois
            </button>
            <button className="btn btn-ghost" type="button" onClick={addPillar}>
              Ajouter un pilier
            </button>
            <button
              className="btn btn-soft"
              type="button"
              onClick={() => {
                if (!data?.profile) return
                if (!confirm('Remplacer la stratégie actuelle par une nouvelle répartition plus variée ?')) return
                dispatch({ type: 'set-pillars', pillars: buildStrategy(data.profile) })
                toast('Piliers rééquilibrés')
              }}
            >
              Rééquilibrer
            </button>
          </div>
        }
      />
      <div className="notice" style={{ marginBottom: 16 }}>
        Pour tenir plusieurs mois : chaque mois, générez une fournée d’idées. L’outil évite les
        sujets trop proches de ceux déjà dans la bibliothèque ou le calendrier. Le métier reste un
        pilier parmi six, pas le seul.
      </div>
      {pillars.length === 0 ? (
        <EmptyState
          title="Aucun pilier"
          text="Terminez le profil, puis calculez une première stratégie."
          action={
            <Link className="btn btn-primary" to="/app/profil">
              Ouvrir le profil
            </Link>
          }
        />
      ) : (
        <div className="post-grid">
          {pillars.map((pillar) => (
            <article className="card" key={pillar.id}>
              {editing?.id === pillar.id ? (
                <div className="stack">
                  <Field label="Titre du pilier">
                    <input
                      value={editing.title}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      value={editing.description}
                      onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    />
                  </Field>
                  <div className="toolbar">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => {
                        updatePillar(editing)
                        setEditing(null)
                      }}
                    >
                      Enregistrer
                    </button>
                    <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2>{pillar.title}</h2>
                  <p className="muted" style={{ margin: '8px 0 12px' }}>{pillar.description}</p>
                  <button className="btn btn-ghost" type="button" onClick={() => setEditing(pillar)}>
                    Modifier
                  </button>
                </>
              )}
              <div className="stack" style={{ marginTop: 14 }}>
                {pillar.topics.map((topic) => (
                  <div key={topic.id} className="choice">
                    {topic.angle && (
                      <span className="badge badge-angle" style={{ marginBottom: 8 }}>
                        {angleLabel[topic.angle]}
                      </span>
                    )}
                    <input
                      className="input"
                      style={{ marginTop: topic.angle ? 8 : 0 }}
                      value={topic.title}
                      onChange={(e) =>
                        updatePillar({
                          ...pillar,
                          topics: pillar.topics.map((item) =>
                            item.id === topic.id ? { ...item, title: e.target.value } : item,
                          ),
                        })
                      }
                    />
                    <select
                      className="input"
                      style={{ marginTop: 8 }}
                      value={topic.objective}
                      onChange={(e) =>
                        updatePillar({
                          ...pillar,
                          topics: pillar.topics.map((item) =>
                            item.id === topic.id ? { ...item, objective: e.target.value as Objective } : item,
                          ),
                        })
                      }
                    >
                      {OBJECTIVES.map((item) => (
                        <option key={item} value={item}>
                          {objectiveLabel[item]}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <button className="btn btn-soft" type="button" onClick={() => addTopic(pillar)}>
                  Ajouter un sujet
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <section style={{ marginTop: 28 }}>
        <h2>Sujets par objectif</h2>
        <div className="post-grid" style={{ marginTop: 12 }}>
          {grouped.map((group) => (
            <article className="card" key={group.objective}>
              <div className="tiny">{objectiveLabel[group.objective]}</div>
              <ul style={{ paddingLeft: 18, lineHeight: 1.6 }}>
                {group.topics.length === 0 && <li className="muted">Aucun sujet pour l’instant.</li>}
                {group.topics.map((topic) => (
                  <li key={topic.id}>
                    {topic.title} <span className="muted">· {topic.pillar}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
