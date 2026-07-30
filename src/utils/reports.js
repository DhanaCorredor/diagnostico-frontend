export function countBy(items, getKey) {
  const counts = {}
  for (const item of items) {
    const key = getKey(item)
    counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

export function ranking(counts, names, fallback = 'Sin asignar') {
  return Object.entries(counts)
    .map(([id, count]) => ({ id, name: names[id] ?? fallback, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

export function noShowRate(appointments) {
  const closed = appointments.filter(
    (appointment) => appointment.estado === 'COMPLETED' || appointment.estado === 'NO_SHOW',
  )
  if (closed.length === 0) return null
  const missed = closed.filter((appointment) => appointment.estado === 'NO_SHOW').length
  return missed / closed.length
}

export function formatPercent(rate) {
  if (rate == null) return '—'
  return `${Math.round(rate * 100)} %`
}
