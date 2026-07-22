import Badge from '../atoms/Badge'

const ESTADOS = {
  SCHEDULED: { texto: 'Agendada', color: 'warn' },
  CONFIRMED: { texto: 'Confirmada', color: 'good' },
  CANCELLED: { texto: 'Cancelada', color: 'crit' },
  COMPLETED: { texto: 'Completada', color: 'muted' },
  NO_SHOW: { texto: 'No asistió', color: 'crit' },
}

export default function EstadoBadge({ estado }) {
  const { texto, color } = ESTADOS[estado] ?? { texto: estado, color: 'neutral' }
  return <Badge color={color}>{texto}</Badge>
}
