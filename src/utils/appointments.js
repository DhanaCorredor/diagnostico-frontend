export const APPOINTMENT_STATES = {
  SCHEDULED: { text: 'Agendada', color: 'warn', bar: 'bg-warn', chip: 'bg-warn/10 text-warn-ink' },
  CONFIRMED: { text: 'Confirmada', color: 'good', bar: 'bg-good', chip: 'bg-good/10 text-good' },
  CANCELLED: { text: 'Cancelada', color: 'crit', bar: 'bg-crit', chip: 'bg-crit/10 text-crit' },
  COMPLETED: { text: 'Completada', color: 'muted', bar: 'bg-ink-muted', chip: 'bg-ink-muted/10 text-ink-2' },
  NO_SHOW: { text: 'No asistió', color: 'crit', bar: 'bg-crit', chip: 'bg-crit/10 text-crit' },
}
