function toISO(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function todayISO() {
  return toISO(new Date())
}

export function formatTime(isoNaive) {
  const d = new Date(isoNaive)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function formatLongDate(date = new Date()) {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatShortDate(isoNaive) {
  const text = isoNaive.length <= 10 ? `${isoNaive}T00:00:00` : isoNaive
  return new Date(text).toLocaleDateString('es-ES')
}

export function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00`)
  d.setDate(d.getDate() + days)
  return toISO(d)
}

export function weekday(isoDate) {
  return new Date(`${isoDate}T00:00:00`).getDay()
}

export function longDateFromISO(isoDate) {
  return formatLongDate(new Date(`${isoDate}T00:00:00`))
}

export function startOfWeek(isoDate) {
  const day = weekday(isoDate)
  return addDays(isoDate, day === 0 ? -6 : 1 - day)
}

export function endOfWeek(isoDate) {
  return addDays(startOfWeek(isoDate), 6)
}

export function startOfMonth(isoDate) {
  return `${isoDate.slice(0, 7)}-01`
}

export function endOfMonth(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`)
  return toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

export function daysBetween(fromISO, toDateISO) {
  const from = new Date(`${fromISO}T00:00:00`)
  const to = new Date(`${toDateISO}T00:00:00`)
  return Math.round((to - from) / 86400000)
}
