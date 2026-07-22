// Página Agenda (ruta /agenda). Rejilla médico × hora de un día.
//
// - Filas: médicos (filtrables). Columnas: horas del día (07–17).
// - Las citas aparecen como "chips" en la celda de su médico y su hora.
// - Las horas fuera de la disponibilidad del médico se grisan (bloqueadas).
// - Un MÉDICO solo ve su propia agenda (el backend ya se lo filtra).

import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { diaSemana, fechaLargaDesdeISO, formatHora, hoyISO, sumarDias } from '../utils/fecha'
import { indexarPor } from '../utils/datos'

// Horas visibles (el centro atiende 07:30–17:30).
const HORAS = Array.from({ length: 11 }, (_, i) => 7 + i) // 7..17

// ¿La hora `h` está dentro de alguna franja del médico ese día de la semana?
function horaDisponible(franjas, dia, h) {
  return franjas.some((f) => {
    if (f.dia_semana !== dia) return false
    const ini = Number(f.hora_inicio.slice(0, 2)) * 60 + Number(f.hora_inicio.slice(3, 5))
    const fin = Number(f.hora_fin.slice(0, 2)) * 60 + Number(f.hora_fin.slice(3, 5))
    // La celda [h:00, h+1:00) se solapa con la franja.
    return (h + 1) * 60 > ini && h * 60 < fin
  })
}

// Nombre corto para el chip: "Carlos Mendoza" -> "C. Mendoza".
function nombreCorto(nombre = '') {
  const partes = nombre.split(' ').filter(Boolean)
  if (partes.length < 2) return nombre
  return `${partes[0][0]}. ${partes[partes.length - 1]}`
}

const CHIP = {
  SCHEDULED: 'bg-warn/10 text-[#8a6100]',
  CONFIRMED: 'bg-good/10 text-good',
  COMPLETED: 'bg-ink-muted/10 text-ink-2',
  CANCELLED: 'bg-crit/10 text-crit',
  NO_SHOW: 'bg-crit/10 text-crit',
}

export default function AgendaPage() {
  const { user } = useAuth()
  const [fecha, setFecha] = useState(hoyISO())
  const [filtroMedico, setFiltroMedico] = useState('todos')
  const [citas, setCitas] = useState([])
  const [medicos, setMedicos] = useState([])
  const [servicios, setServicios] = useState({})
  const [pacientes, setPacientes] = useState({})
  const [dispPorMedico, setDispPorMedico] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const puedeVerPacientes = user.rol === 'ADMIN' || user.rol === 'RECEPCION'

  useEffect(() => {
    async function cargar() {
      setCargando(true)
      setError('')
      try {
        const [citasDia, listaMedicos, listaServicios, listaPacientes] = await Promise.all([
          api.get(`/citas?fecha=${fecha}`),
          api.get('/medicos'),
          api.get('/servicios'),
          puedeVerPacientes ? api.get('/pacientes') : Promise.resolve([]),
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
        setServicios(indexarPor(listaServicios, 'nombre'))
        setPacientes(indexarPor(listaPacientes, 'nombre_completo'))
        setDispPorMedico(dispMapa)
      } catch {
        setError('No se pudo cargar la agenda.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [fecha, puedeVerPacientes])

  const dia = diaSemana(fecha)
  const medicosVisibles =
    filtroMedico === 'todos' ? medicos : medicos.filter((m) => m.id === filtroMedico)

  // Citas de un médico en una hora concreta (ignora canceladas visualmente).
  function citasDe(medicoId, h) {
    return citas.filter(
      (c) => c.medico_id === medicoId && new Date(c.starts_at).getHours() === h,
    )
  }

  return (
    <div className="rounded-xl border border-line bg-white p-5">
      {/* Controles */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold capitalize">{fechaLargaDesdeISO(fecha)}</h2>
        <div className="flex items-center gap-2 text-sm">
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
        <p className="py-10 text-center text-sm text-ink-muted">Cargando…</p>
      ) : error ? (
        <p className="py-10 text-center text-sm text-crit">{error}</p>
      ) : medicosVisibles.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-muted">No hay médicos que mostrar.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <div
            className="grid gap-px bg-line text-sm"
            style={{ gridTemplateColumns: `160px repeat(${HORAS.length}, minmax(96px, 1fr))` }}
          >
            {/* Cabecera */}
            <div className="sticky left-0 z-10 bg-surface-plane px-3 py-2 text-left text-[11px] font-semibold">
              Médico
            </div>
            {HORAS.map((h) => (
              <div key={h} className="bg-surface-plane py-2 text-center text-[11px] font-semibold">
                {String(h).padStart(2, '0')}:00
              </div>
            ))}

            {/* Filas por médico */}
            {medicosVisibles.map((m) => (
              <FilaMedico
                key={m.id}
                medico={m}
                dia={dia}
                franjas={dispPorMedico[m.id] ?? []}
                citasDe={citasDe}
                servicios={servicios}
                pacientes={pacientes}
              />
            ))}
          </div>
        </div>
      )}

      <p className="mt-2 text-[11px] text-ink-muted">
        Las celdas grises quedan fuera del horario del médico ese día.
      </p>
    </div>
  )
}

// Una fila del calendario (un médico y sus 11 celdas de hora).
function FilaMedico({ medico, dia, franjas, citasDe, servicios, pacientes }) {
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
              <span
                key={c.id}
                title={`${formatHora(c.starts_at)} · ${servicios[c.servicio_id] ?? ''}`}
                className={`block rounded px-1.5 py-1 text-[11px] leading-tight ${
                  CHIP[c.estado] ?? 'bg-brand-light text-brand-dark'
                }`}
              >
                <span className="tnum font-medium">{formatHora(c.starts_at)}</span>{' '}
                {pacientes[c.paciente_id] ? nombreCorto(pacientes[c.paciente_id]) : ''}
                <span className="block text-[10px] opacity-80">
                  {servicios[c.servicio_id] ?? ''}
                </span>
              </span>
            ))}
          </div>
        )
      })}
    </>
  )
}
