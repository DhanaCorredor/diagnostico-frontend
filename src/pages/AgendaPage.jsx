import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { diaSemana, fechaLargaDesdeISO, formatHora, hoyISO, sumarDias } from '../utils/fecha'
import { indexarPor } from '../utils/datos'
import DetalleCita from '../components/organisms/DetalleCita'
import Spinner from '../components/atoms/Spinner'
import Tarjeta from '../components/atoms/Tarjeta'
import MensajeLista from '../components/atoms/MensajeLista'
import { ESTADOS_CITA } from '../utils/citas'

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
  const [fecha, setFecha] = useState(hoyISO())
  const [filtroMedico, setFiltroMedico] = useState('todos')
  const [citas, setCitas] = useState([])
  const [medicos, setMedicos] = useState([])
  const [servicios, setServicios] = useState([])
  const [pacientes, setPacientes] = useState({})
  const [dispPorMedico, setDispPorMedico] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [citaSel, setCitaSel] = useState(null)

  const puedeGestionar = user.rol === 'ADMIN' || user.rol === 'RECEPCION'

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const [citasDia, listaMedicos, listaServicios, listaPacientes] = await Promise.all([
        api.get(`/citas?fecha=${fecha}`),
        api.get('/medicos'),
        api.get('/servicios'),
        puedeGestionar ? api.get('/pacientes') : Promise.resolve([]),
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
      setPacientes(indexarPor(listaPacientes, 'nombre_completo'))
      setDispPorMedico(dispMapa)
    } catch {
      setError('No se pudo cargar la agenda.')
    } finally {
      setCargando(false)
    }
  }, [fecha, puedeGestionar])

  useEffect(() => {
    cargar()
  }, [cargar])

  const dia = diaSemana(fecha)
  const serviciosMap = indexarPor(servicios, 'nombre')
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
    <Tarjeta className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold capitalize">{fechaLargaDesdeISO(fecha)}</h2>
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
              onClick={() => setFecha(sumarDias(fecha, -1))}
              className="rounded-lg border border-line px-3 py-1.5 hover:bg-surface-plane"
            >
              ‹
            </button>
            <button
              onClick={() => setFecha(hoyISO())}
              className="rounded-lg border border-line px-3 py-1.5 hover:bg-surface-plane"
            >
              Hoy
            </button>
            <button
              onClick={() => setFecha(sumarDias(fecha, 1))}
              className="rounded-lg border border-line px-3 py-1.5 hover:bg-surface-plane"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {cargando ? (
        <Spinner className="py-10 text-center" />
      ) : error ? (
        <MensajeLista tipo="error">{error}</MensajeLista>
      ) : medicosVisibles.length === 0 ? (
        <MensajeLista>No hay médicos que mostrar.</MensajeLista>
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
              <FilaMedico
                key={m.id}
                medico={m}
                dia={dia}
                franjas={dispPorMedico[m.id] ?? []}
                citasDe={citasDe}
                serviciosMap={serviciosMap}
                pacientes={pacientes}
                onSeleccionar={setCitaSel}
              />
            ))}
          </div>
        </div>
      )}

      <p className="mt-2 text-[11px] text-ink-muted">
        Pulsa una cita para ver el detalle. Las celdas grises quedan fuera del horario del médico.
      </p>

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
    </Tarjeta>
  )
}

function FilaMedico({ medico, dia, franjas, citasDe, serviciosMap, pacientes, onSeleccionar }) {
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
                onClick={() => onSeleccionar(c)}
                title={`${formatHora(c.starts_at)} · ${serviciosMap[c.servicio_id] ?? ''}`}
                className={`block w-full rounded px-1.5 py-1 text-left text-[11px] leading-tight hover:brightness-95 ${
                  ESTADOS_CITA[c.estado]?.chip ?? 'bg-brand-light text-brand-dark'
                }`}
              >
                <span className="tnum font-medium">{formatHora(c.starts_at)}</span>{' '}
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
