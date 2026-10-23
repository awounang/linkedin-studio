import { formatLongDate } from './dates'
import { formatLabel, objectiveLabel, statusLabel } from './catalog'
import type { Post, Profile } from '../types'

export function postsToCsv(posts: Post[]): string {
  const header = [
    'Date',
    'Titre',
    'Statut',
    'Format',
    'Objectif',
    'Sujet',
    'Accroche',
    'Contenu',
  ]
  const rows = [...posts]
    .sort((a, b) => (a.scheduledDate ?? '9999').localeCompare(b.scheduledDate ?? '9999'))
    .map((post) =>
      [
        post.scheduledDate ?? '',
        post.title,
        statusLabel[post.status],
        formatLabel[post.format],
        objectiveLabel[post.objective],
        post.topic,
        post.hook,
        post.content,
      ].map(csvCell).join(','),
    )
  return [header.join(','), ...rows].join('\n')
}

function csvCell(value: string): string {
  const escaped = value.replace(/"/g, '""')
  return `"${escaped}"`
}

export function postsToIcs(posts: Post[], profile: Profile | null): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LinkedIn Studio//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]
  for (const post of posts) {
    if (!post.scheduledDate) continue
    const day = post.scheduledDate.replace(/-/g, '')
    const description = escapeIcs(
      `${post.title}\n\n${post.content}\n\nStatut : ${statusLabel[post.status]}`,
    )
    lines.push(
      'BEGIN:VEVENT',
      `UID:${post.id}@linkedin-studio`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day}`,
      `DTEND;VALUE=DATE:${day}`,
      `SUMMARY:${escapeIcs(`LinkedIn — ${post.title}`)}`,
      `DESCRIPTION:${description}`,
      profile ? `ORGANIZER:CN=${escapeIcs(profile.profession)}` : '',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.filter(Boolean).join('\r\n')
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

export function downloadText(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function calendarSummary(posts: Post[]): string {
  return posts
    .filter((post) => post.scheduledDate)
    .sort((a, b) => (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? ''))
    .map(
      (post) =>
        `${formatLongDate(post.scheduledDate)} — ${statusLabel[post.status]} — ${post.title}`,
    )
    .join('\n')
}
