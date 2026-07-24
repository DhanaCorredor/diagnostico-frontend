export function todayISO() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export function formatTime(isoNaive) {
  const d = new Date(isoNaive)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function formatLongDate(fecha = new Date()) {
  return fecha.toLocaleDateString('es-ES', {
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

export function addDays(fechaISO, dias) {
  const d = new Date(`${fechaISO}T00:00:00`)
  d.setDate(d.getDate() + dias)
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export function weekday(fechaISO) {
  return new Date(`${fechaISO}T00:00:00`).getDay()
}

export function longDateFromISO(fechaISO) {
  return formatLongDate(new Date(`${fechaISO}T00:00:00`))
}
