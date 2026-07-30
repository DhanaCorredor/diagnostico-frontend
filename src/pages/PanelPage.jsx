import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from '../config/api'
import { useAuth } from '../auth/useAuth'
import StatusBadge from '../components/molecules/StatusBadge'
import AppointmentDetail from '../components/organisms/AppointmentDetail'
import Spinner from '../components/atoms/Spinner'
import Alert from '../components/atoms/Alert'
import Card from '../components/atoms/Card'
import KpiCard from '../components/molecules/KpiCard'
import ListMessage from '../components/atoms/ListMessage'
import { formatTime, todayISO } from '../utils/date'
import { indexBy } from '../utils/data'
import { APPOINTMENT_STATES } from '../utils/appointments'

export default function PanelPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [services, setServices] = useState([])
  const [patientNames, setPatientNames] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const canManage = user.rol === 'ADMIN' || user.rol === 'RECEPCION'

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [todayAppointments, doctorList, serviceList, patientList] = await Promise.all([
        api.get(`/citas?fecha=${todayISO()}`),
        api.get('/medicos'),
        api.get('/servicios'),
        canManage ? api.get('/pacientes') : Promise.resolve([]),
      ])
      setAppointments(todayAppointments)
      setDoctors(doctorList)
      setServices(serviceList)
      setPatientNames(indexBy(patientList, 'nombre_completo'))
    } catch (err) {
      setError(errorMessage(err, 'No se pudieron cargar los datos del panel.'))
    } finally {
      setLoading(false)
    }
  }, [canManage])

  useEffect(() => {
    load()
  }, [load])

  const doctorNames = indexBy(doctors, 'nombre_completo')
  const serviceNames = indexBy(services, 'nombre')
  const confirmed = appointments.filter((a) => a.estado === 'CONFIRMED').length
  const pending = appointments.filter((a) => a.estado === 'SCHEDULED').length
  const sorted = [...appointments].sort((a, b) => a.starts_at.localeCompare(b.starts_at))

  if (loading) return <Spinner />
  if (error) return <Alert>{error}</Alert>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="Citas hoy" value={appointments.length} />
        <KpiCard title="Confirmadas" value={confirmed} note={`${pending} pendientes de confirmar`} />
        <KpiCard title="Pendientes" value={pending} />
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-semibold">Agenda de hoy</h2>
          <span className="text-xs text-ink-muted">
            {user.rol === 'MEDICO' ? 'Tu agenda' : 'Todos los médicos'}
          </span>
        </div>

        {sorted.length === 0 ? (
          <ListMessage>No hay citas para hoy.</ListMessage>
        ) : (
          <div className="divide-y divide-line">
            {sorted.map((appointment) => (
              <button
                key={appointment.id}
                onClick={() => setSelectedAppointment(appointment)}
                className="flex w-full items-center gap-4 px-5 py-3.5 text-left hover:bg-surface-plane"
              >
                <span className="tnum w-14 text-sm font-medium text-ink-2">
                  {formatTime(appointment.starts_at)}
                </span>
                <span
                  className={`h-9 w-1 rounded-full ${APPOINTMENT_STATES[appointment.estado]?.bar ?? 'bg-ink-muted'}`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {patientNames[appointment.paciente_id] ?? appointment.motivo ?? 'Paciente'}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {doctorNames[appointment.medico_id] ?? 'Médico'} ·{' '}
                    {serviceNames[appointment.servicio_id] ?? 'Servicio'}
                  </p>
                </div>
                <StatusBadge status={appointment.estado} />
              </button>
            ))}
          </div>
        )}
      </Card>

      {selectedAppointment && (
        <AppointmentDetail
          appointment={selectedAppointment}
          patientName={patientNames[selectedAppointment.paciente_id]}
          doctors={doctors}
          services={services}
          canManage={canManage}
          onClose={() => setSelectedAppointment(null)}
          onUpdated={() => {
            setSelectedAppointment(null)
            load()
          }}
        />
      )}
    </div>
  )
}
