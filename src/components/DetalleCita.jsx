import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { formatFechaCorta, formatHora } from '../utils/fecha'
import { indexarPor } from '../utils/datos'
import EstadoBadge from './EstadoBadge'
import Modal from './Modal'
import Campo, { claseInput } from './Campo'

const DURACIONES = [15, 30, 45, 60, 90]
const ESTADOS_ACTIVOS = ['SCHEDULED', 'CONFIRMED']

function duracionDe(cita) {
  return Math.round((new Date(cita.ends_at) - new Date(cita.starts_at)) / 60000)
}

export default function DetalleCita({
  cita,
  nombrePaciente,
  medicos,
  servicios,
  puedeGestionar,
  onCerrar,
  onActualizada,
}) {
  const medicosMap = indexarPor(medicos, 'nombre_completo')
  const serviciosMap = indexarPor(servicios, 'nombre')

  const [editando, setEditando] = useState(false)
  const [error, setError] = useState(null)
  const [ocupado, setOcupado] = useState(false)

  const activa = ESTADOS_ACTIVOS.includes(cita.estado)

  const [form, setForm] = useState({
    medico_id: cita.medico_id,
    servicio_id: cita.servicio_id,
    fecha: cita.starts_at.slice(0, 10),
    hora: cita.starts_at.slice(11, 16),
    duracion_min: duracionDe(cita),
    motivo: cita.motivo ?? '',
    permitir_sobrecupo: false,
  })
  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function ejecutar(accion) {
    setError(null)
    setOcupado(true)
    try {
      await accion()
      onActualizada()
    } catch (err) {
      if (err instanceof ApiError) setError({ mensaje: err.message, candidatos: err.detail?.candidatos })
      else setError({ mensaje: 'No se pudo completar la acción.' })
      setOcupado(false)
    }
  }

  function cancelar() {
    ejecutar(() => api.post(`/citas/${cita.id}/cancelar`))
  }
  function marcarAsistencia(estado) {
    ejecutar(() => api.post(`/citas/${cita.id}/asistencia`, { estado }))
  }
  function guardarEdicion(e) {
    e.preventDefault()
    if (Number(form.hora.slice(3, 5)) % 15 !== 0) {
      setError({ mensaje: 'La hora debe empezar en :00, :15, :30 o :45.' })
      return
    }
    ejecutar(() =>
      api.put(`/citas/${cita.id}`, {
        medico_id: form.medico_id,
        servicio_id: form.servicio_id,
        starts_at: `${form.fecha}T${form.hora}:00`,
        duracion_min: Number(form.duracion_min),
        motivo: form.motivo.trim() || null,
        permitir_sobrecupo: form.permitir_sobrecupo,
      }),
    )
  }

  const cajaError = error && (
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
  )

  if (editando) {
    const footer = (
      <>
        <button
          type="button"
          onClick={() => setEditando(false)}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-surface-plane"
        >
          Volver
        </button>
        <button
          type="submit"
          form="form-editar-cita"
          disabled={ocupado}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {ocupado ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </>
    )
    return (
      <Modal titulo="Editar cita" subtitulo="Se revalidan disponibilidad y solapamientos." onClose={onCerrar} footer={footer}>
        <form id="form-editar-cita" onSubmit={guardarEdicion} className="space-y-4">
          {cajaError}
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Médico">
              <select value={form.medico_id} onChange={(e) => set('medico_id', e.target.value)} className={claseInput}>
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre_completo}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Servicio">
              <select value={form.servicio_id} onChange={(e) => set('servicio_id', e.target.value)} className={claseInput}>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Campo label="Fecha">
              <input type="date" value={form.fecha} onChange={(e) => set('fecha', e.target.value)} required className={claseInput} />
            </Campo>
            <Campo label="Hora">
              <input type="time" step="900" value={form.hora} onChange={(e) => set('hora', e.target.value)} required className={claseInput} />
            </Campo>
            <Campo label="Duración">
              <select value={form.duracion_min} onChange={(e) => set('duracion_min', e.target.value)} className={claseInput}>
                {DURACIONES.map((d) => (
                  <option key={d} value={d}>
                    {d} min
                  </option>
                ))}
              </select>
            </Campo>
          </div>
          <Campo label="Motivo (opcional)">
            <input value={form.motivo} onChange={(e) => set('motivo', e.target.value)} className={claseInput} />
          </Campo>
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="checkbox"
              checked={form.permitir_sobrecupo}
              onChange={(e) => set('permitir_sobrecupo', e.target.checked)}
              className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
            />
            Forzar cupo extra (sobrecupo)
          </label>
        </form>
      </Modal>
    )
  }

  const footer = puedeGestionar && activa && (
    <>
      <button
        onClick={() => marcarAsistencia('NO_SHOW')}
        disabled={ocupado}
        className="rounded-lg border border-line px-3 py-2 text-sm font-medium hover:bg-surface-plane disabled:opacity-60"
      >
        No asistió
      </button>
      <button
        onClick={() => marcarAsistencia('COMPLETED')}
        disabled={ocupado}
        className="rounded-lg border border-good/40 px-3 py-2 text-sm font-medium text-good hover:bg-good/5 disabled:opacity-60"
      >
        Atendida
      </button>
      <button
        onClick={cancelar}
        disabled={ocupado}
        className="rounded-lg border border-crit/40 px-3 py-2 text-sm font-medium text-crit hover:bg-crit/5 disabled:opacity-60"
      >
        Cancelar cita
      </button>
      <button
        onClick={() => {
          setError(null)
          setEditando(true)
        }}
        disabled={ocupado}
        className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        Editar
      </button>
    </>
  )

  return (
    <Modal titulo="Detalle de la cita" onClose={onCerrar} footer={footer || undefined}>
      {cajaError}
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">{nombrePaciente ?? 'Paciente'}</p>
        <EstadoBadge estado={cita.estado} />
      </div>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-2">Médico</dt>
          <dd className="font-medium">{medicosMap[cita.medico_id] ?? '—'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-2">Servicio</dt>
          <dd className="font-medium">{serviciosMap[cita.servicio_id] ?? '—'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-2">Fecha</dt>
          <dd className="font-medium">{formatFechaCorta(cita.starts_at)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-2">Horario</dt>
          <dd className="tnum font-medium">
            {formatHora(cita.starts_at)}–{formatHora(cita.ends_at)}
          </dd>
        </div>
        {cita.motivo && (
          <div className="flex justify-between">
            <dt className="text-ink-2">Motivo</dt>
            <dd className="font-medium">{cita.motivo}</dd>
          </div>
        )}
      </dl>
      {!activa && (
        <p className="rounded-lg bg-surface-plane px-3 py-2 text-xs text-ink-muted">
          Esta cita ya está cerrada; no admite cambios.
        </p>
      )}
    </Modal>
  )
}
