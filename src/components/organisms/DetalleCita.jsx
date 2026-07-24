import { useState } from 'react'
import { api, ApiError } from '../../config/api'
import { formatShortDate, formatTime } from '../../utils/date'
import { indexBy } from '../../utils/data'
import EstadoBadge from '../molecules/EstadoBadge'
import Modal from '../molecules/Modal'
import Boton from '../atoms/Boton'
import CamposCita from '../molecules/CamposCita'
import Dato from '../molecules/Dato'

const ESTADOS_ACTIVOS = ['SCHEDULED', 'CONFIRMED']

function duracionDe(cita) {
  return Math.round((new Date(cita.ends_at) - new Date(cita.starts_at)) / 60000)
}

export default function DetalleCita({
  cita,
  nombrePaciente,
  medicos,
  servicios,
  canManage,
  onClose,
  onUpdated,
}) {
  const medicosMap = indexBy(medicos, 'nombre_completo')
  const serviciosMap = indexBy(servicios, 'nombre')

  const [editing, setEditing] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

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
  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function run(action) {
    setError(null)
    setBusy(true)
    try {
      await action()
      onUpdated()
    } catch (err) {
      if (err instanceof ApiError) setError({ mensaje: err.message, candidatos: err.detail?.candidatos })
      else setError({ mensaje: 'No se pudo completar la acción.' })
      setBusy(false)
    }
  }

  function cancel() {
    run(() => api.post(`/citas/${cita.id}/cancel`))
  }
  function markAttendance(estado) {
    run(() => api.post(`/citas/${cita.id}/asistencia`, { estado }))
  }
  function saveEdit(e) {
    e.preventDefault()
    if (Number(form.hora.slice(3, 5)) % 15 !== 0) {
      setError({ mensaje: 'La hora debe empezar en :00, :15, :30 o :45.' })
      return
    }
    run(() =>
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

  if (editing) {
    const footer = (
      <>
        <Boton variant="secondary" type="button" onClick={() => setEditing(false)}>
          Volver
        </Boton>
        <Boton type="submit" form="form-editar-cita" disabled={busy}>
          {busy ? 'Guardando…' : 'Guardar cambios'}
        </Boton>
      </>
    )
    return (
      <Modal title="Editar cita" subtitle="Se revalidan disponibilidad y solapamientos." onClose={onClose} footer={footer}>
        <form id="form-editar-cita" onSubmit={saveEdit} className="space-y-4">
          {cajaError}
          <CamposCita form={form} set={set} medicos={medicos} servicios={servicios} />
        </form>
      </Modal>
    )
  }

  const footer = canManage && activa && (
    <>
      <Boton variant="secondary" size="sm" onClick={() => markAttendance('NO_SHOW')} disabled={busy}>
        No asistió
      </Boton>
      <Boton variant="success" size="sm" onClick={() => markAttendance('COMPLETED')} disabled={busy}>
        Atendida
      </Boton>
      <Boton variant="danger" size="sm" onClick={cancel} disabled={busy}>
        Cancelar cita
      </Boton>
      <Boton
        size="sm"
        onClick={() => {
          setError(null)
          setEditing(true)
        }}
        disabled={busy}
      >
        Editar
      </Boton>
    </>
  )

  return (
    <Modal title="Detalle de la cita" onClose={onClose} footer={footer || undefined}>
      {cajaError}
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">{nombrePaciente ?? 'Paciente'}</p>
        <EstadoBadge estado={cita.estado} />
      </div>
      <dl className="space-y-2 text-sm">
        <Dato label="Médico" value={medicosMap[cita.medico_id]} />
        <Dato label="Servicio" value={serviciosMap[cita.servicio_id]} />
        <Dato label="Fecha" value={formatShortDate(cita.starts_at)} />
        <Dato
          label="Horario"
          value={`${formatTime(cita.starts_at)}–${formatTime(cita.ends_at)}`}
          tnum
        />
        {cita.motivo && <Dato label="Motivo" value={cita.motivo} />}
      </dl>
      {!activa && (
        <p className="rounded-lg bg-surface-plane px-3 py-2 text-xs text-ink-muted">
          Esta cita ya está cerrada; no admite cambios.
        </p>
      )}
    </Modal>
  )
}
