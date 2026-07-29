import { useState } from 'react'
import { useForm } from '../../hooks/useForm'
import AppointmentError from '../molecules/AppointmentError'
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
  appointment,
  patientName,
  doctors,
  services,
  canManage,
  onClose,
  onUpdated,
}) {
  const doctorNames = indexBy(doctors, 'nombre_completo')
  const serviceNames = indexBy(services, 'nombre')

  const [editing, setEditing] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const isActive = ACTIVE_STATES.includes(appointment.estado)

  const [form, set] = useForm({
    medico_id: appointment.medico_id,
    servicio_id: appointment.servicio_id,
    date: appointment.starts_at.slice(0, 10),
    time: appointment.starts_at.slice(11, 16),
    duracion_min: durationOf(appointment),
    motivo: appointment.motivo ?? '',
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
        setError({ message: err.message, candidates: err.detail?.candidatos })
      else setError({ message: 'No se pudo completar la acción.' })
      setBusy(false)
    }
  }

  function cancel() {
    run(() => api.post(`/citas/${appointment.id}/cancelar`))
  }
  function markAttendance(estado) {
    run(() => api.post(`/citas/${appointment.id}/asistencia`, { estado }))
  }
  function saveEdit(event) {
    event.preventDefault()
    if (Number(form.time.slice(3, 5)) % 15 !== 0) {
      setError({ message: 'La hora debe empezar en :00, :15, :30 o :45.' })
      return
    }
    run(() =>
      api.put(`/citas/${appointment.id}`, {
        medico_id: form.medico_id,
        servicio_id: form.servicio_id,
        starts_at: `${form.date}T${form.time}:00`,
        duracion_min: Number(form.duracion_min),
        motivo: form.motivo.trim() || null,
        permitir_sobrecupo: form.permitir_sobrecupo,
      }),
    )
  }

  const errorBox = <AppointmentError error={error} />

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
          <AppointmentFields form={form} set={set} doctors={doctors} services={services} />
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
        <p className="text-lg font-semibold">{patientName ?? 'Paciente'}</p>
        <StatusBadge status={appointment.estado} />
      </div>
      <dl className="space-y-2 text-sm">
        <DataRow label="Médico" value={doctorNames[appointment.medico_id]} />
        <DataRow label="Servicio" value={serviceNames[appointment.servicio_id]} />
        <DataRow label="Fecha" value={formatShortDate(appointment.starts_at)} />
        <DataRow
          label="Horario"
          value={`${formatTime(appointment.starts_at)}–${formatTime(appointment.ends_at)}`}
          tnum
        />
        {appointment.motivo && <DataRow label="Motivo" value={appointment.motivo} />}
      </dl>
      {!isActive && (
        <p className="rounded-lg bg-surface-plane px-3 py-2 text-xs text-ink-muted">
          Esta cita ya está cerrada; no admite cambios.
        </p>
      )}
    </Modal>
  )
}
