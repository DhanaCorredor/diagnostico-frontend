import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { formatFechaLarga } from '../../utils/fecha'

const TITULOS = {
  '': 'Panel',
  agenda: 'Agenda',
  pacientes: 'Pacientes',
  medicos: 'Médicos',
  usuarios: 'Usuarios',
  config: 'Configuración',
  citas: 'Nueva cita',
}

export default function Topbar() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const segmento = location.pathname.split('/')[1]
  const titulo = TITULOS[segmento] ?? 'Panel'
  const puedeAgendar = user.rol === 'ADMIN' || user.rol === 'RECEPCION'

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white/90 px-8 py-4 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold">{titulo}</h1>
        <p className="text-xs capitalize text-ink-muted">{formatFechaLarga()}</p>
      </div>

      {puedeAgendar && (
        <button
          onClick={() => navigate('/citas/nueva')}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nueva cita
        </button>
      )}
    </header>
  )
}
