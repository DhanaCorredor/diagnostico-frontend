export function hoyISO() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export function formatHora(isoNaive) {
  const d = new Date(isoNaive)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function formatFechaLarga(fecha = new Date()) {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatFechaCorta(isoNaive) {
  const texto = isoNaive.length <= 10 ? `${isoNaive}T00:00:00` : isoNaive
  return new Date(texto).toLocaleDateString('es-ES')
}

export function sumarDias(fechaISO, dias) {
  const d = new Date(`${fechaISO}T00:00:00`)
  d.setDate(d.getDate() + dias)
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export function diaSemana(fechaISO) {
  return new Date(`${fechaISO}T00:00:00`).getDay()
}

export function fechaLargaDesdeISO(fechaISO) {
  return formatFechaLarga(new Date(`${fechaISO}T00:00:00`))
}
