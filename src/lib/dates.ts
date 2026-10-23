import { MONTHS, WEEKDAY_SHORT } from './catalog'

export function isoDate(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseIsoDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso)
  date.setDate(date.getDate() + days)
  return isoDate(date)
}

export function startOfMonth(year: number, monthIndex: number): Date {
  return new Date(year, monthIndex, 1)
}

export function formatLongDate(iso?: string): string {
  if (!iso) return 'Non planifié'
  const date = parseIsoDate(iso)
  const weekday = WEEKDAY_SHORT[(date.getDay() + 6) % 7]
  return `${weekday} ${date.getDate()} ${MONTHS[date.getMonth()]}`
}

export function formatMonthTitle(year: number, monthIndex: number): string {
  const name = MONTHS[monthIndex]
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`
}

export function todayIso(): string {
  return isoDate(new Date())
}

export function publishingSlots(
  year: number,
  monthIndex: number,
  occupied: Set<string>,
  count: number,
): string[] {
  const days = new Date(year, monthIndex + 1, 0).getDate()
  const preferred = [2, 4, 1, 3, 5]
  const slots: string[] = []
  for (const dow of preferred) {
    for (let day = 1; day <= days; day += 1) {
      const date = new Date(year, monthIndex, day)
      if (date.getDay() !== dow) continue
      const iso = isoDate(date)
      if (occupied.has(iso)) continue
      slots.push(iso)
      if (slots.length >= count) return slots
    }
  }
  return slots
}

export function monthCells(year: number, monthIndex: number): (string | null)[] {
  const first = startOfMonth(year, monthIndex)
  const offset = (first.getDay() + 6) % 7
  const days = new Date(year, monthIndex + 1, 0).getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < offset; i += 1) cells.push(null)
  for (let d = 1; d <= days; d += 1) {
    cells.push(isoDate(new Date(year, monthIndex, d)))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}
