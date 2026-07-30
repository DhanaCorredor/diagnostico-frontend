import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { formatLongDate } from '../../utils/date'

const TITLES = {
  '': 'Panel',
  agenda: 'Agenda',
  pacientes: 'Pacientes',
  medicos: 'Médicos',
  reportes: 'Informes',
  usuarios: 'Usuarios',
  config: 'Configuración',
  citas: 'Nueva cita',
}

export default function Topbar({ onOpenMenu }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const segment = location.pathname.split('/')[1]
  const title = TITLES[segment] ?? 'Panel'
  const canSchedule = user.rol === 'ADMIN' || user.rol === 'RECEPCION'

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
          className="-ml-1 shrink-0 rounded-lg p-1.5 text-ink-2 hover:bg-surface-plane md:hidden"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">{title}</h1>
          <p className="hidden text-xs capitalize text-ink-muted sm:block">{formatLongDate()}</p>
        </div>
      </div>

      {canSchedule && (
        <button
          onClick={() => navigate('/citas/nueva')}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark sm:px-4"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="hidden sm:inline">Nueva cita</span>
        </button>
      )}
    </header>
  )
}
