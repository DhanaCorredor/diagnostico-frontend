import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import Avatar from './atoms/Avatar'

const iconos = {
  panel: (
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  ),
  agenda: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  pacientes: (
    <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z" />
  ),
  medicos: <path d="M12 2a3 3 0 00-3 3v1a3 3 0 006 0V5a3 3 0 00-3-3zM6 21v-2a6 6 0 0112 0v2" />,
  usuarios: <path d="M10 15l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  config: (
    <>
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
}

const NAV = [
  { to: '/', icono: 'panel', texto: 'Panel', roles: ['ADMIN', 'RECEPCION', 'MEDICO'], end: true },
  { to: '/agenda', icono: 'agenda', texto: 'Agenda', roles: ['ADMIN', 'RECEPCION', 'MEDICO'] },
  { to: '/pacientes', icono: 'pacientes', texto: 'Pacientes', roles: ['ADMIN', 'RECEPCION'] },
  { to: '/medicos', icono: 'medicos', texto: 'Médicos', roles: ['ADMIN', 'RECEPCION'] },
  { divisor: true, roles: ['ADMIN'] },
  { to: '/usuarios', icono: 'usuarios', texto: 'Usuarios', roles: ['ADMIN'] },
  { to: '/config', icono: 'config', texto: 'Configuración', roles: ['ADMIN'] },
]

const ROL_LABEL = { ADMIN: 'Administrador', RECEPCION: 'Recepción', MEDICO: 'Médico' }

function claseEnlace({ isActive }) {
  const base = 'flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer'
  return isActive
    ? `${base} bg-[#e8f2f0] font-semibold text-brand-dark`
    : `${base} text-ink-2 hover:bg-surface-plane`
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function salir() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="fixed inset-y-0 left-0 flex w-60 flex-col border-r border-line bg-white">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand font-bold text-white">
          D
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Diagnóstico</p>
          <p className="text-[11px] text-ink-muted">Gestión de Citas</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3 text-sm">
        {NAV.filter((item) => item.roles.includes(user.rol)).map((item, i) =>
          item.divisor ? (
            <div key={`div-${i}`} className="my-2 border-t border-line" />
          ) : (
            <NavLink key={item.to} to={item.to} end={item.end} className={claseEnlace}>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                {iconos[item.icono]}
              </svg>
              {item.texto}
            </NavLink>
          ),
        )}
      </nav>

      <div className="border-t border-line px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar nombre={user.nombre_completo} tamano="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.nombre_completo}</p>
            <p className="text-[11px] text-ink-muted">{ROL_LABEL[user.rol] ?? user.rol}</p>
          </div>
          <button onClick={salir} title="Salir" className="text-ink-muted hover:text-crit">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
