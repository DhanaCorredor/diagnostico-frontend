import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, errorMessage } from '../config/api'
import StatusBadge from '../components/molecules/StatusBadge'
import PatientForm from '../components/organisms/PatientForm'
import { formatShortDate, formatTime } from '../utils/date'
import { indexBy } from '../utils/data'
import Avatar from '../components/atoms/Avatar'
import Spinner from '../components/atoms/Spinner'
import Alert from '../components/atoms/Alert'
import Card from '../components/atoms/Card'
import Button from '../components/atoms/Button'
import ListMessage from '../components/atoms/ListMessage'
import DataRow from '../components/molecules/DataRow'

export default function PatientFilePage() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [doctorNames, setDoctorNames] = useState({})
  const [serviceNames, setServiceNames] = useState({})
  const [tab, setTab] = useState('datos')
  const [historyFrom, setHistoryFrom] = useState('')
  const [historyTo, setHistoryTo] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [patientData, history, doctorList, serviceList] = await Promise.all([
        api.get(`/pacientes/${id}`),
        api.get(`/pacientes/${id}/citas`),
        api.get('/medicos'),
        api.get('/servicios'),
      ])
      setPatient(patientData)
      setAppointments(history)
      setDoctorNames(indexBy(doctorList, 'nombre_completo'))
      setServiceNames(indexBy(serviceList, 'nombre'))
    } catch (err) {
      setError(errorMessage(err, 'No se pudo cargar la ficha del paciente.'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <Spinner />
  if (error) return <Alert>{error}</Alert>
  if (!patient) return null

  const visibleAppointments = appointments.filter((appointment) => {
    const day = appointment.starts_at.slice(0, 10)
    if (historyFrom && day < historyFrom) return false
    if (historyTo && day > historyTo) return false
    return true
  })

  return (
    <div>
      <Link
        to="/pacientes"
        className="mb-4 flex items-center gap-1.5 text-sm text-ink-2 hover:text-brand"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Volver a Pacientes
      </Link>

      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={patient.nombre_completo} size="lg" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{patient.nombre_completo}</h2>
            <p className="text-sm text-ink-2">
              {patient.cedula ?? 'Sin cédula'}
              {patient.edad != null && ` · ${patient.edad} años`}
            </p>
          </div>
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Editar
          </Button>
        </div>
      </Card>

      <div className="mb-4 flex gap-1 border-b border-line text-sm">
        <button
          onClick={() => setTab('datos')}
          className={`-mb-px border-b-2 px-4 py-2 ${
            tab === 'datos'
              ? 'border-brand font-medium text-brand-dark'
              : 'border-transparent text-ink-2 hover:text-ink'
          }`}
        >
          Datos personales
        </button>
        <button
          onClick={() => setTab('citas')}
          className={`-mb-px border-b-2 px-4 py-2 ${
            tab === 'citas'
              ? 'border-brand font-medium text-brand-dark'
              : 'border-transparent text-ink-2 hover:text-ink'
          }`}
        >
          Historial de citas
        </button>
      </div>

      {tab === 'datos' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Identificación
            </h3>
            <dl className="space-y-2 text-sm">
              <DataRow label="Cédula" value={patient.cedula} />
              <DataRow
                label="Fecha de nacimiento"
                value={patient.fecha_nacimiento && formatShortDate(patient.fecha_nacimiento)}
              />
              <DataRow label="Edad" value={patient.edad != null ? `${patient.edad} años` : null} />
            </dl>
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Contacto
            </h3>
            <dl className="space-y-2 text-sm">
              <DataRow label="Teléfono" value={patient.telefono} />
            </dl>
          </Card>
        </div>
      )}

      {tab === 'citas' && (
        <Card>
          {appointments.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3 text-sm">
              <label className="flex items-center gap-2">
                <span className="text-ink-2">Desde</span>
                <input
                  type="date"
                  value={historyFrom}
                  onChange={(event) => setHistoryFrom(event.target.value)}
                  className="rounded-lg border border-line px-2 py-1.5 outline-none focus:border-brand"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-ink-2">Hasta</span>
                <input
                  type="date"
                  value={historyTo}
                  onChange={(event) => setHistoryTo(event.target.value)}
                  className="rounded-lg border border-line px-2 py-1.5 outline-none focus:border-brand"
                />
              </label>
              {(historyFrom || historyTo) && (
                <button
                  onClick={() => {
                    setHistoryFrom('')
                    setHistoryTo('')
                  }}
                  className="text-brand hover:underline"
                >
                  Quitar filtro
                </button>
              )}
              <span className="ml-auto text-xs text-ink-muted">
                {visibleAppointments.length} de {appointments.length}
              </span>
            </div>
          )}

          {appointments.length === 0 ? (
            <ListMessage>Este paciente no tiene citas registradas.</ListMessage>
          ) : visibleAppointments.length === 0 ? (
            <ListMessage>No hay citas en ese rango de fechas.</ListMessage>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr className="border-b border-line">
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Médico</th>
                  <th className="px-5 py-3 font-medium">Servicio</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visibleAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-surface-plane">
                    <td className="tnum px-5 py-3">
                      {formatShortDate(appointment.starts_at)} · {formatTime(appointment.starts_at)}
                    </td>
                    <td className="px-5 py-3">{doctorNames[appointment.medico_id] ?? 'Médico'}</td>
                    <td className="px-5 py-3 text-ink-2">
                      {serviceNames[appointment.servicio_id] ?? 'Servicio'}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={appointment.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {editing && (
        <PatientForm
          patient={patient}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false)
            load()
          }}
        />
      )}
    </div>
  )
}
