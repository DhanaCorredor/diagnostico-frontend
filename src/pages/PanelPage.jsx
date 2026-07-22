import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../auth/useAuth'
import EstadoBadge from '../components/EstadoBadge'
import DetalleCita from '../components/DetalleCita'
import { formatHora, hoyISO } from '../utils/fecha'
import { indexarPor } from '../utils/datos'

const BARRA = {
  SCHEDULED: 'bg-warn',
  CONFIRMED: 'bg-good',
  CANCELLED: 'bg-crit',
  COMPLETED: 'bg-ink-muted',
  NO_SHOW: 'bg-crit',
}

function Kpi({ titulo, valor, nota }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <p className="text-sm text-ink-2">{titulo}</p>
      <p className="tnum mt-2 text-3xl font-semibold">{valor}</p>
      {nota && <p className="mt-1 text-xs text-ink-muted">{nota}</p>}
    </div>
  )
}

export default function PanelPage() {
  const { user } = useAuth()
  const [citas, setCitas] = useState([])
  const [medicos, setMedicos] = useState([])
  const [servicios, setServicios] = useState([])
  const [pacientes, setPacientes] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [citaSel, setCitaSel] = useState(null)

  const puedeGestionar = user.rol === 'ADMIN' || user.rol === 'RECEPCION'

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const [citasHoy, listaMedicos, listaServicios, listaPacientes] = await Promise.all([
        api.get(`/citas?fecha=${hoyISO()}`),
        api.get('/medicos'),
        api.get('/servicios'),
        puedeGestionar ? api.get('/pacientes') : Promise.resolve([]),
      ])
      setCitas(citasHoy)
      setMedicos(listaMedicos)
      setServicios(listaServicios)
      setPacientes(indexarPor(listaPacientes, 'nombre_completo'))
    } catch {
      setError('No se pudieron cargar los datos del panel.')
    } finally {
      setCargando(false)
    }
  }, [puedeGestionar])

  useEffect(() => {
    cargar()
  }, [cargar])

  const medicosMap = indexarPor(medicos, 'nombre_completo')
  const serviciosMap = indexarPor(servicios, 'nombre')
  const confirmadas = citas.filter((c) => c.estado === 'CONFIRMED').length
  const pendientes = citas.filter((c) => c.estado === 'SCHEDULED').length
  const ordenadas = [...citas].sort((a, b) => a.starts_at.localeCompare(b.starts_at))

  if (cargando) return <p className="text-ink-muted">Cargando…</p>
  if (error) return <p className="rounded-lg bg-crit/10 px-4 py-3 text-crit">{error}</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi titulo="Citas hoy" valor={citas.length} />
        <Kpi titulo="Confirmadas" valor={confirmadas} nota={`${pendientes} pendientes de confirmar`} />
        <Kpi titulo="Pendientes" valor={pendientes} />
      </div>

      <div className="rounded-xl border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-semibold">Agenda de hoy</h2>
          <span className="text-xs text-ink-muted">
            {user.rol === 'MEDICO' ? 'Tu agenda' : 'Todos los médicos'}
          </span>
        </div>

        {ordenadas.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-muted">
            No hay citas para hoy.
          </p>
        ) : (
          <div className="divide-y divide-line">
            {ordenadas.map((c) => (
              <button
                key={c.id}
                onClick={() => setCitaSel(c)}
                className="flex w-full items-center gap-4 px-5 py-3.5 text-left hover:bg-surface-plane"
              >
                <span className="tnum w-14 text-sm font-medium text-ink-2">
                  {formatHora(c.starts_at)}
                </span>
                <span className={`h-9 w-1 rounded-full ${BARRA[c.estado] ?? 'bg-ink-muted'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {pacientes[c.paciente_id] ?? c.motivo ?? 'Paciente'}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {medicosMap[c.medico_id] ?? 'Médico'} · {serviciosMap[c.servicio_id] ?? 'Servicio'}
                  </p>
                </div>
                <EstadoBadge estado={c.estado} />
              </button>
            ))}
          </div>
        )}
      </div>

      {citaSel && (
        <DetalleCita
          cita={citaSel}
          nombrePaciente={pacientes[citaSel.paciente_id]}
          medicos={medicos}
          servicios={servicios}
          puedeGestionar={puedeGestionar}
          onCerrar={() => setCitaSel(null)}
          onActualizada={() => {
            setCitaSel(null)
            cargar()
          }}
        />
      )}
    </div>
  )
}
