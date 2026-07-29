import { useState } from 'react'
import { useForm } from '../../hooks/useForm'
import ErrorCita from '../molecules/ErrorCita'
import { api, ApiError } from '../../config/api'
import { formatShortDate, formatTime } from '../../utils/date'
import { indexBy } from '../../utils/data'
import StatusBadge from '../molecules/StatusBadge'
import Modal from '../molecules/Modal'
import Button from '../atoms/Button'
import AppointmentFields from '../molecules/AppointmentFields'
import DataRow from '../molecules/DataRow'

const ACTIVE_STATES = ['SCHEDULED', 'CONFIRMED']

function durationOf(appointment) {
  return Math.round((new Date(appointment.ends_at) - new Date(appointment.starts_at)) / 60000)
}

export default function AppointmentDetail({
  cita,
  nombrePaciente,
  medicos,
  servicios,
  canManage,
  onClose,
  onUpdated,
}) {
  const doctorNames = indexBy(medicos, 'nombre_completo')
  const serviceNames = indexBy(servicios, 'nombre')

  const [editing, setEditing] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const isActive = ACTIVE_STATES.includes(cita.estado)

  const [form, set] = useForm({
    medico_id: cita.medico_id,
    servicio_id: cita.servicio_id,
    fecha: cita.starts_at.slice(0, 10),
    hora: cita.starts_at.slice(11, 16),
    duracion_min: durationOf(cita),
    motivo: cita.motivo ?? '',
    permitir_sobrecupo: false,
  })

  async function run(action) {
    setError(null)
    setBusy(true)
    try {
      await action()
      onUpdated()
    } catch (err) {
      if (err instanceof ApiError)
        setError({ mensaje: err.message, candidatos: err.detail?.candidatos })
      else setError({ mensaje: 'No se pudo completar la acción.' })
      setBusy(false)
    }
  }

  function cancel() {
    run(() => api.post(`/citas/${cita.id}/cancelar`))
  }
  function markAttendance(estado) {
    run(() => api.post(`/citas/${cita.id}/asistencia`, { estado }))
  }
  function saveEdit(event) {
    event.preventDefault()
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

  const errorBox = <ErrorCita error={error} />

  if (editing) {
    const footer = (
      <>
        <Button variant="secondary" type="button" onClick={() => setEditing(false)}>
          Volver
        </Button>
        <Button type="submit" form="appointment-edit-form" disabled={busy}>
          {busy ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </>
    )
    return (
      <Modal
        title="Editar cita"
        subtitle="Se revalidan disponibilidad y solapamientos."
        onClose={onClose}
        footer={footer}
      >
        <form id="appointment-edit-form" onSubmit={saveEdit} className="space-y-4">
          {errorBox}
          <AppointmentFields form={form} set={set} medicos={medicos} servicios={servicios} />
        </form>
      </Modal>
    )
  }

  const footer = canManage && isActive && (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => markAttendance('NO_SHOW')}
        disabled={busy}
      >
        No asistió
      </Button>
      <Button variant="success" size="sm" onClick={() => markAttendance('COMPLETED')} disabled={busy}>
        Atendida
      </Button>
      <Button variant="danger" size="sm" onClick={cancel} disabled={busy}>
        Cancelar cita
      </Button>
      <Button
        size="sm"
        onClick={() => {
          setError(null)
          setEditing(true)
        }}
        disabled={busy}
      >
        Editar
      </Button>
    </>
  )

  return (
    <Modal title="Detalle de la cita" onClose={onClose} footer={footer || undefined}>
      {errorBox}
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">{nombrePaciente ?? 'Paciente'}</p>
        <StatusBadge estado={cita.estado} />
      </div>
      <dl className="space-y-2 text-sm">
        <DataRow label="Médico" value={doctorNames[cita.medico_id]} />
        <DataRow label="Servicio" value={serviceNames[cita.servicio_id]} />
        <DataRow label="Fecha" value={formatShortDate(cita.starts_at)} />
        <DataRow
          label="Horario"
          value={`${formatTime(cita.starts_at)}–${formatTime(cita.ends_at)}`}
          tnum
        />
        {cita.motivo && <DataRow label="Motivo" value={cita.motivo} />}
      </dl>
      {!isActive && (
        <p className="rounded-lg bg-surface-plane px-3 py-2 text-xs text-ink-muted">
          Esta cita ya está cerrada; no admite cambios.
        </p>
      )}
    </Modal>
  )
}
