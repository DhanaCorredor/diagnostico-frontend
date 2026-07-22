// Pastilla de color para el estado de una cita.
// Mapea cada valor de EstadoCita (backend) a su etiqueta y color de marca.

const ESTADOS = {
  SCHEDULED: { texto: 'Agendada', clase: 'bg-warn/10 text-[#8a6100]' },
  CONFIRMED: { texto: 'Confirmada', clase: 'bg-good/10 text-good' },
  CANCELLED: { texto: 'Cancelada', clase: 'bg-crit/10 text-crit' },
  COMPLETED: { texto: 'Completada', clase: 'bg-ink-muted/10 text-ink-2' },
  NO_SHOW: { texto: 'No asistió', clase: 'bg-crit/10 text-crit' },
}

export default function EstadoBadge({ estado }) {
  const { texto, clase } = ESTADOS[estado] ?? {
    texto: estado,
    clase: 'bg-surface-plane text-ink-2',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${clase}`}>{texto}</span>
  )
}
