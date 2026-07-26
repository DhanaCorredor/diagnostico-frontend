import { useCallback, useEffect, useState } from 'react'
import { api } from '../config/api'
import { useAuth } from '../auth/useAuth'
import { weekday, longDateFromISO, formatTime, todayISO, addDays } from '../utils/date'
import { indexBy } from '../utils/data'
import AppointmentDetail from '../components/organisms/AppointmentDetail'
import Spinner from '../components/atoms/Spinner'
import Card from '../components/atoms/Card'
import ListMessage from '../components/atoms/ListMessage'
import { APPOINTMENT_STATES } from '../utils/citas'

const HORAS = Array.from({ length: 11 }, (_, i) => 7 + i)

function horaDisponible(franjas, dia, h) {
  return franjas.some((f) => {
    if (f.dia_semana !== dia) return false
    const ini = Number(f.hora_inicio.slice(0, 2)) * 60 + Number(f.hora_inicio.slice(3, 5))
    const fin = Number(f.hora_fin.slice(0, 2)) * 60 + Number(f.hora_fin.slice(3, 5))
    return (h + 1) * 60 > ini && h * 60 < fin
  })
}

function nombreCorto(nombre = '') {
  const partes = nombre.split(' ').filter(Boolean)
  if (partes.length < 2) return nombre
  return `${partes[0][0]}. ${partes[partes.length - 1]}`
}

export default function AgendaPage() {
  const { user } = useAuth()
  const [fecha, setFecha] = useState(todayISO())
  const [filtroMedico, setFiltroMedico] = useState('todos')
  const [citas, setCitas] = useState([])
  const [medicos, setMedicos] = useState([])
  const [servicios, setServicios] = useState([])
  const [pacientes, setPacientes] = useState({})
  const [dispPorMedico, setDispPorMedico] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [citaSel, setCitaSel] = useState(null)

  const canManage = user.rol === 'ADMIN' || user.rol === 'RECEPCION'

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [citasDia, listaMedicos, listaServicios, listaPacientes] = await Promise.all([
        api.get(`/citas?fecha=${fecha}`),
        api.get('/medicos'),
        api.get('/servicios'),
        canManage ? api.get('/pacientes') : Promise.resolve([]),
      ])
      const franjas = await Promise.all(
        listaMedicos.map((m) => api.get(`/disponibilidad?medico_id=${m.id}`)),
      )
      const dispMapa = {}
      listaMedicos.forEach((m, i) => {
        dispMapa[m.id] = franjas[i]
      })

      setCitas(citasDia)
      setMedicos(listaMedicos)
      setServicios(listaServicios)
      setPacientes(indexBy(listaPacientes, 'nombre_completo'))
      setDispPorMedico(dispMapa)
    } catch {
      setError('No se pudo cargar la agenda.')
    } finally {
      setLoading(false)
    }
  }, [fecha, canManage])

  useEffect(() => {
    load()
  }, [load])

  const dia = weekday(fecha)
  const serviciosMap = indexBy(servicios, 'nombre')
  const medicosVisibles =
    user.rol === 'MEDICO'
      ? medicos.filter((m) => m.id === user.id)
      : filtroMedico === 'todos'
        ? medicos
        : medicos.filter((m) => m.id === filtroMedico)

  function citasDe(medicoId, h) {
    return citas.filter(
      (c) => c.medico_id === medicoId && new Date(c.starts_at).getHours() === h,
    )
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold capitalize">{longDateFromISO(fecha)}</h2>
        <div className="flex items-center gap-2 text-sm">
          {user.rol !== 'MEDICO' && (
            <select
              value={filtroMedico}
              onChange={(e) => setFiltroMedico(e.target.value)}
              className="rounded-lg border border-line px-3 py-1.5 outline-none focus:border-brand"
            >
              <option value="todos">Todos los médicos</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre_completo}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-1">
            <button
              onClick={() => setFecha(addDays(fecha, -1))}
              className="rounded-lg border border-line px-3 py-1.5 hover:bg-surface-plane"
            >
              ‹
            </button>
            <button
              onClick={() => setFecha(todayISO())}
              className="rounded-lg border border-line px-3 py-1.5 hover:bg-surface-plane"
            >
              Hoy
            </button>
            <button
              onClick={() => setFecha(addDays(fecha, 1))}
              className="rounded-lg border border-line px-3 py-1.5 hover:bg-surface-plane"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Spinner className="py-10 text-center" />
      ) : error ? (
        <ListMessage type="error">{error}</ListMessage>
      ) : medicosVisibles.length === 0 ? (
        <ListMessage>No hay médicos que mostrar.</ListMessage>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <div
            className="grid gap-px bg-line text-sm"
            style={{ gridTemplateColumns: `160px repeat(${HORAS.length}, minmax(96px, 1fr))` }}
          >
            <div className="sticky left-0 z-10 bg-surface-plane px-3 py-2 text-left text-[11px] font-semibold">
              Médico
            </div>
            {HORAS.map((h) => (
              <div key={h} className="bg-surface-plane py-2 text-center text-[11px] font-semibold">
                {String(h).padStart(2, '0')}:00
              </div>
            ))}

            {medicosVisibles.map((m) => (
              <DoctorRow
                key={m.id}
                medico={m}
                dia={dia}
                franjas={dispPorMedico[m.id] ?? []}
                citasDe={citasDe}
                serviciosMap={serviciosMap}
                pacientes={pacientes}
                onSelect={setCitaSel}
              />
            ))}
          </div>
        </div>
      )}

      <p className="mt-2 text-[11px] text-ink-muted">
        Pulsa una cita para ver el detalle. Las celdas grises quedan fuera del horario del médico.
      </p>

      {citaSel && (
        <AppointmentDetail
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
    </Card>
  )
}

function DoctorRow({ medico, dia, franjas, citasDe, serviciosMap, pacientes, onSelect }) {
  return (
    <>
      <div className="sticky left-0 z-10 bg-white px-3 py-2 shadow-[1px_0_0_var(--color-line)]">
        <p className="text-xs font-medium">{medico.nombre_completo}</p>
        <p className="text-[10px] text-ink-muted">
          {medico.especialidades[0]?.nombre ?? 'General'}
        </p>
      </div>
      {HORAS.map((h) => {
        const disponible = horaDisponible(franjas, dia, h)
        const enHora = citasDe(medico.id, h)
        return (
          <div
            key={h}
            className={`min-h-[46px] space-y-1 p-1 ${disponible ? 'bg-white' : 'bg-surface-plane'}`}
          >
            {enHora.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                title={`${formatTime(c.starts_at)} · ${serviciosMap[c.servicio_id] ?? ''}`}
                className={`block w-full rounded px-1.5 py-1 text-left text-[11px] leading-tight hover:brightness-95 ${
                  APPOINTMENT_STATES[c.estado]?.chip ?? 'bg-brand-light text-brand-dark'
                }`}
              >
                <span className="tnum font-medium">{formatTime(c.starts_at)}</span>{' '}
                {pacientes[c.paciente_id] ? nombreCorto(pacientes[c.paciente_id]) : ''}
                <span className="block text-[10px] opacity-80">
                  {serviciosMap[c.servicio_id] ?? ''}
                </span>
              </button>
            ))}
          </div>
        )
      })}
    </>
  )
}
