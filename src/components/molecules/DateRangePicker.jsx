import { todayISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from '../../utils/date'

const BUTTON = 'rounded-lg border border-line px-3 py-1.5 hover:bg-surface-plane'

export default function DateRangePicker({ from, to, onChange, children }) {
  const today = todayISO()

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <div className="flex gap-1">
        <button type="button" onClick={() => onChange(today, today)} className={BUTTON}>
          Hoy
        </button>
        <button
          type="button"
          onClick={() => onChange(startOfWeek(today), endOfWeek(today))}
          className={BUTTON}
        >
          Esta semana
        </button>
        <button
          type="button"
          onClick={() => onChange(startOfMonth(today), endOfMonth(today))}
          className={BUTTON}
        >
          Este mes
        </button>
      </div>

      <label className="flex items-center gap-2">
        <span className="text-ink-2">Desde</span>
        <input
          type="date"
          value={from}
          onChange={(event) => onChange(event.target.value, to)}
          className="rounded-lg border border-line px-2 py-1.5 outline-none focus:border-brand"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="text-ink-2">Hasta</span>
        <input
          type="date"
          value={to}
          onChange={(event) => onChange(from, event.target.value)}
          className="rounded-lg border border-line px-2 py-1.5 outline-none focus:border-brand"
        />
      </label>

      {children}
    </div>
  )
}
