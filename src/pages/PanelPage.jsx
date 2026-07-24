import { useCallback, useEffect, useState } from 'react'
import { api } from '../config/api'
import { useAuth } from '../auth/useAuth'
import EstadoBadge from '../components/molecules/EstadoBadge'
import DetalleCita from '../components/organisms/DetalleCita'
import Spinner from '../components/atoms/Spinner'
import Alerta from '../components/atoms/Alerta'
import Tarjeta from '../components/atoms/Tarjeta'
import TarjetaKPI from '../components/molecules/TarjetaKPI'
import MensajeLista from '../components/atoms/MensajeLista'
import { formatTime, todayISO } from '../utils/date'
import { indexBy } from '../utils/data'
import { APPOINTMENT_STATES } from '../utils/citas'

export default function PanelPage() {
  const { user } = useAuth()
  const [citas, setCitas] = useState([])
  const [medicos, setMedicos] = useState([])
  const [servicios, setServicios] = useState([])
  const [pacientes, setPacientes] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [citaSel, setCitaSel] = useState(null)

  const canManage = user.rol === 'ADMIN' || user.rol === 'RECEPCION'

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [citasHoy, listaMedicos, listaServicios, listaPacientes] = await Promise.all([
        api.get(`/citas?fecha=${todayISO()}`),
        api.get('/medicos'),
        api.get('/servicios'),
        canManage ? api.get('/pacientes') : Promise.resolve([]),
      ])
      setCitas(citasHoy)
      setMedicos(listaMedicos)
      setServicios(listaServicios)
      setPacientes(indexBy(listaPacientes, 'nombre_completo'))
    } catch {
      setError('No se pudieron load los datos del panel.')
    } finally {
      setLoading(false)
    }
  }, [canManage])

  useEffect(() => {
    load()
  }, [load])

  const medicosMap = indexBy(medicos, 'nombre_completo')
  const serviciosMap = indexBy(servicios, 'nombre')
  const confirmadas = citas.filter((c) => c.estado === 'CONFIRMED').length
  const pendientes = citas.filter((c) => c.estado === 'SCHEDULED').length
  const ordenadas = [...citas].sort((a, b) => a.starts_at.localeCompare(b.starts_at))

  if (loading) return <Spinner />
  if (error) return <Alerta>{error}</Alerta>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TarjetaKPI title="Citas hoy" value={citas.length} />
        <TarjetaKPI title="Confirmadas" value={confirmadas} nota={`${pendientes} pendientes de confirmar`} />
        <TarjetaKPI title="Pendientes" value={pendientes} />
      </div>

      <Tarjeta>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-semibold">Agenda de hoy</h2>
          <span className="text-xs text-ink-muted">
            {user.rol === 'MEDICO' ? 'Tu agenda' : 'Todos los médicos'}
          </span>
        </div>

        {ordenadas.length === 0 ? (
          <MensajeLista>No hay citas para hoy.</MensajeLista>
        ) : (
          <div className="divide-y divide-line">
            {ordenadas.map((c) => (
              <button
                key={c.id}
                onClick={() => setCitaSel(c)}
                className="flex w-full items-center gap-4 px-5 py-3.5 text-left hover:bg-surface-plane"
              >
                <span className="tnum w-14 text-sm font-medium text-ink-2">
                  {formatTime(c.starts_at)}
                </span>
                <span className={`h-9 w-1 rounded-full ${APPOINTMENT_STATES[c.estado]?.bar ?? 'bg-ink-muted'}`} />
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
      </Tarjeta>

      {citaSel && (
        <DetalleCita
          cita={citaSel}
          nombrePaciente={pacientes[citaSel.paciente_id]}
          medicos={medicos}
          servicios={servicios}
          canManage={canManage}
          onClose={() => setCitaSel(null)}
          onUpdated={() => {
            setCitaSel(null)
            load()
          }}
        />
      )}
    </div>
  )
}
