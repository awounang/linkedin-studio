import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHead, StatusBadge, Modal } from '../components/Ui'
import { MONTHS, STATUSES, WEEKDAY_SHORT, statusLabel } from '../lib/catalog'
import { formatLongDate, formatMonthTitle, monthCells, todayIso } from '../lib/dates'
import { planMonth } from '../lib/ideas'
import { useStore } from '../store'
import type { Post, PostStatus } from '../types'

export function CalendarPage() {
  const { data, dispatch, toast } = useStore()
  const navigate = useNavigate()
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [selected, setSelected] = useState<Post | null>(null)
  const posts = data?.posts ?? []
  const cells = useMemo(() => monthCells(cursor.year, cursor.month), [cursor])
  const today = todayIso()

  function postsOn(iso: string) {
    return posts.filter((post) => post.scheduledDate === iso)
  }

  function move(post: Post, date: string) {
    dispatch({
      type: 'upsert-post',
      post: { ...post, scheduledDate: date, updatedAt: new Date().toISOString() },
    })
    toast('Date mise à jour')
  }

  const unscheduled = posts.filter((post) => !post.scheduledDate)
  const monthPrefix = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`
  const monthPosts = [...posts]
    .filter((post) => post.scheduledDate?.startsWith(monthPrefix))
    .sort((a, b) => (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? ''))

  return (
    <div>
      <PageHead
        kicker="Planification"
        title="Calendrier éditorial"
        subtitle="Planifiez, replanifiez, et générez un mois d’idées nouvelles — sans republier les mêmes angles."
        actions={
          <div className="toolbar">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                if (!data?.profile) return
                const planned = planMonth(
                  data.profile,
                  data.pillars,
                  posts,
                  cursor.year,
                  cursor.month,
                  8,
                )
                if (planned.posts.length === 0) {
                  toast('Plus de créneau libre ou d’idée inédite pour ce mois')
                  return
                }
                dispatch({ type: 'set-pillars', pillars: planned.pillars })
                dispatch({ type: 'add-posts', posts: planned.posts })
                toast(`${planned.posts.length} idées posées en ${MONTHS[cursor.month]}`)
              }}
            >
              Remplir ce mois
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() =>
                setCursor((value) => {
                  const date = new Date(value.year, value.month - 1, 1)
                  return { year: date.getFullYear(), month: date.getMonth() }
                })
              }
            >
              Mois précédent
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setCursor({ year: now.getFullYear(), month: now.getMonth() })}
            >
              Aujourd’hui
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() =>
                setCursor((value) => {
                  const date = new Date(value.year, value.month + 1, 1)
                  return { year: date.getFullYear(), month: date.getMonth() }
                })
              }
            >
              Mois suivant
            </button>
          </div>
        }
      />
      <h2 style={{ marginBottom: 12 }}>{formatMonthTitle(cursor.year, cursor.month)}</h2>
      <div className="calendar" style={{ marginBottom: 8 }}>
        {WEEKDAY_SHORT.map((day) => (
          <div key={day} className="tiny" style={{ textAlign: 'center' }}>
            {day}
          </div>
        ))}
      </div>
      <div className="calendar">
        {cells.map((iso, index) => (
          <div
            key={iso ?? `e-${index}`}
            className={`cal-cell${iso ? '' : ' empty'}${iso === today ? ' today' : ''}`}
            onDragOver={(event) => iso && event.preventDefault()}
            onDrop={(event) => {
              if (!iso) return
              const id = event.dataTransfer.getData('text/plain')
              const post = posts.find((item) => item.id === id)
              if (post) move(post, iso)
            }}
          >
            {iso && <div className="cal-day">{Number(iso.slice(-2))}</div>}
            {iso &&
              postsOn(iso).map((post) => (
                <button
                  key={post.id}
                  type="button"
                  className="cal-item"
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData('text/plain', post.id)}
                  onClick={() => setSelected(post)}
                >
                  {post.title}
                </button>
              ))}
          </div>
        ))}
      </div>
      <section style={{ marginTop: 24 }}>
        <h3>Publications du mois</h3>
        <div className="stack" style={{ marginTop: 12 }}>
          {monthPosts.length === 0 && <p className="muted">Aucune date posée ce mois-ci.</p>}
          {monthPosts.map((post) => (
            <button key={post.id} type="button" className="choice" onClick={() => setSelected(post)}>
              <StatusBadge status={post.status} example={post.isExample} />
              <strong style={{ display: 'block', margin: '6px 0 4px' }}>{post.title}</strong>
              <span className="help">{formatLongDate(post.scheduledDate)}</span>
            </button>
          ))}
        </div>
      </section>
      {unscheduled.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h3>Non planifiés</h3>
          <p className="help">Glissez un titre vers un jour, ou ouvrez-le pour choisir une date.</p>
          <div className="chip-row" style={{ marginTop: 10 }}>
            {unscheduled.map((post) => (
              <button
                key={post.id}
                type="button"
                className="chip"
                draggable
                onDragStart={(event) => event.dataTransfer.setData('text/plain', post.id)}
                onClick={() => setSelected(post)}
              >
                {post.title}
              </button>
            ))}
          </div>
        </section>
      )}
      <Modal open={Boolean(selected)} title={selected?.title ?? ''} onClose={() => setSelected(null)}>
        {selected && (
          <div className="stack">
            <StatusBadge status={selected.status} example={selected.isExample} />
            <label className="field">
              <span>Replanifier</span>
              <input
                type="date"
                value={selected.scheduledDate ?? ''}
                onChange={(e) => {
                  const next = { ...selected, scheduledDate: e.target.value || undefined }
                  setSelected(next)
                  dispatch({
                    type: 'upsert-post',
                    post: { ...next, updatedAt: new Date().toISOString() },
                  })
                }}
              />
            </label>
            <label className="field">
              <span>Statut</span>
              <select
                className="input"
                value={selected.status}
                onChange={(e) => {
                  const next = { ...selected, status: e.target.value as PostStatus }
                  setSelected(next)
                  dispatch({
                    type: 'upsert-post',
                    post: { ...next, updatedAt: new Date().toISOString() },
                  })
                }}
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {statusLabel[item]}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => navigate(`/app/editeur/${selected.id}`)}
            >
              Ouvrir l’éditeur
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
