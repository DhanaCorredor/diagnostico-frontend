// Página Nueva cita (ruta /citas/nueva). Formulario de agendado.
//
// Al guardar hace POST /citas, que aplica TODAS las reglas de negocio:
//   - upsert de paciente por nombre + edad
//   - la cita debe empezar en :00/:15/:30/:45
//   - dentro de la disponibilidad del médico (salvo sobrecupo)
//   - sin solaparse con otra cita del mismo médico
// Cada regla que falla vuelve como error HTTP y aquí lo mostramos claro.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { hoyISO } from '../utils/fecha'

const DURACIONES = [15, 30, 45, 60, 90]
const claseInput =
  'w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20'

function Campo({ label, hint, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-ink-muted">{hint}</p>}
    </div>
  )
}

export default function NuevaCitaPage() {
  const navigate = useNavigate()
  const [medicos, setMedicos] = useState([])
  const [servicios, setServicios] = useState([])

  const [form, setForm] = useState({
    nombre_completo: '',
    edad: '',
    medico_id: '',
    servicio_id: '',
    fecha: hoyISO(),
    hora: '09:00',
    duracion_min: 30,
    motivo: '',
    permitir_sobrecupo: false,
  })
  const [error, setError] = useState(null) // { mensaje, candidatos? }
  const [guardando, setGuardando] = useState(false)

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  // Cargamos los desplegables (médicos y servicios) al entrar.
  useEffect(() => {
    async function cargar() {
      try {
        const [ms, ss] = await Promise.all([api.get('/medicos'), api.get('/servicios')])
        setMedicos(ms)
        setServicios(ss)
      } catch {
        setError({ mensaje: 'No se pudieron cargar médicos y servicios.' })
      }
    }
    cargar()
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)

    // Validación previa: la hora debe caer en un cuarto de hora exacto.
    const minutos = Number(form.hora.slice(3, 5))
    if (minutos % 15 !== 0) {
      setError({ mensaje: 'La hora debe empezar en :00, :15, :30 o :45.' })
      return
    }

    setGuardando(true)
    const cuerpo = {
      nombre_completo: form.nombre_completo.trim(),
      edad: Number(form.edad),
      medico_id: form.medico_id,
      servicio_id: form.servicio_id,
      starts_at: `${form.fecha}T${form.hora}:00`, // hora local naive (sin zona)
      duracion_min: Number(form.duracion_min),
      motivo: form.motivo.trim() || null,
      permitir_sobrecupo: form.permitir_sobrecupo,
    }

    try {
      await api.post('/citas', cuerpo)
      navigate('/agenda')
    } catch (err) {
      if (err instanceof ApiError) {
        // Ambigüedad de paciente (409): el backend adjunta los candidatos.
        const candidatos = err.detail?.candidatos
        setError({ mensaje: err.message, candidatos })
      } else {
        setError({ mensaje: 'No se pudo agendar la cita.' })
      }
      setGuardando(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-xl border border-line bg-white">
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold">Nueva cita</h2>
          <p className="text-xs text-ink-muted">
            Si el paciente no existe, se crea automáticamente al guardar.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-lg border border-crit/30 bg-crit/5 p-3 text-sm">
              <p className="font-medium text-crit">{error.mensaje}</p>
              {error.candidatos && (
                <ul className="mt-1 list-inside list-disc text-ink-2">
                  {error.candidatos.map((c) => (
                    <li key={c.id}>
                      {c.nombre_completo} · {c.edad} años
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Paciente */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Campo label="Paciente (nombre completo)">
                <input
                  value={form.nombre_completo}
                  onChange={(e) => set('nombre_completo', e.target.value)}
                  required
                  autoFocus
                  className={claseInput}
                />
              </Campo>
            </div>
            <Campo label="Edad">
              <input
                type="number"
                min="0"
                max="120"
                value={form.edad}
                onChange={(e) => set('edad', e.target.value)}
                required
                className={claseInput}
              />
            </Campo>
          </div>

          {/* Médico y servicio */}
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Médico">
              <select
                value={form.medico_id}
                onChange={(e) => set('medico_id', e.target.value)}
                required
                className={claseInput}
              >
                <option value="">Selecciona…</option>
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre_completo}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Servicio">
              <select
                value={form.servicio_id}
                onChange={(e) => set('servicio_id', e.target.value)}
                required
                className={claseInput}
              >
                <option value="">Selecciona…</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          {/* Fecha, hora y duración */}
          <div className="grid grid-cols-3 gap-3">
            <Campo label="Fecha">
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => set('fecha', e.target.value)}
                required
                className={claseInput}
              />
            </Campo>
            <Campo label="Hora" hint=":00 · :15 · :30 · :45">
              <input
                type="time"
                step="900"
                value={form.hora}
                onChange={(e) => set('hora', e.target.value)}
                required
                className={claseInput}
              />
            </Campo>
            <Campo label="Duración">
              <select
                value={form.duracion_min}
                onChange={(e) => set('duracion_min', e.target.value)}
                className={claseInput}
              >
                {DURACIONES.map((d) => (
                  <option key={d} value={d}>
                    {d} min
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          {/* Motivo */}
          <Campo label="Motivo (opcional)">
            <input
              value={form.motivo}
              onChange={(e) => set('motivo', e.target.value)}
              className={claseInput}
            />
          </Campo>

          {/* Sobrecupo */}
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="checkbox"
              checked={form.permitir_sobrecupo}
              onChange={(e) => set('permitir_sobrecupo', e.target.checked)}
              className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
            />
            Forzar cupo extra (sobrecupo) fuera de disponibilidad
          </label>

          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-surface-plane"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {guardando ? 'Guardando…' : 'Guardar cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
