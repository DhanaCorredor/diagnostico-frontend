export function todayISO() {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
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
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

export function weekday(isoDate) {
  return new Date(`${isoDate}T00:00:00`).getDay()
}

export function longDateFromISO(isoDate) {
  return formatLongDate(new Date(`${isoDate}T00:00:00`))
}
