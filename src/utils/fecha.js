// Pequeñas utilidades de fecha/hora.
//
// El backend trabaja en "hora local naive" (sin zona): las fechas llegan como
// "2026-07-22T09:00:00". `new Date(...)` las interpreta en la hora local del
// navegador, que es justo la del centro. Así que podemos formatearlas directo.

// Fecha de hoy en formato ISO corto (YYYY-MM-DD), para los parámetros de la API.
export function hoyISO() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

// Hora "HH:MM" a partir de un texto ISO del backend.
export function formatHora(isoNaive) {
  const d = new Date(isoNaive)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

// Fecha larga en español: "miércoles, 22 de julio de 2026".
export function formatFechaLarga(fecha = new Date()) {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Fecha corta "dd/mm/aaaa" a partir de un texto ISO.
export function formatFechaCorta(isoNaive) {
  return new Date(isoNaive).toLocaleDateString('es-ES')
}

// Suma (o resta) días a una fecha "YYYY-MM-DD" y devuelve otra "YYYY-MM-DD".
export function sumarDias(fechaISO, dias) {
  const d = new Date(`${fechaISO}T00:00:00`)
  d.setDate(d.getDate() + dias)
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

// Día de la semana (0=domingo … 6=sábado) de una fecha "YYYY-MM-DD".
// Coincide con la convención de `dia_semana` del backend.
export function diaSemana(fechaISO) {
  return new Date(`${fechaISO}T00:00:00`).getDay()
}

// Fecha "YYYY-MM-DD" en texto largo: "miércoles, 22 de julio de 2026".
export function fechaLargaDesdeISO(fechaISO) {
  return formatFechaLarga(new Date(`${fechaISO}T00:00:00`))
}
