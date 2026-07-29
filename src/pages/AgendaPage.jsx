import { useCallback, useEffect, useState } from 'react'
import { api } from '../config/api'
import { useAuth } from '../auth/useAuth'
import { weekday, longDateFromISO, formatTime, todayISO, addDays } from '../utils/date'
import { indexBy } from '../utils/data'
import AppointmentDetail from '../components/organisms/AppointmentDetail'
import Spinner from '../components/atoms/Spinner'
import Card from '../components/atoms/Card'
import ListMessage from '../components/atoms/ListMessage'
import { APPOINTMENT_STATES } from '../utils/appointments'

const HOURS = Array.from({ length: 11 }, (_, i) => 7 + i)

function isHourAvailable(slots, weekdayIndex, hour) {
  return slots.some((slot) => {
    if (slot.dia_semana !== weekdayIndex) return false
    const start = Number(slot.hora_inicio.slice(0, 2)) * 60 + Number(slot.hora_inicio.slice(3, 5))
    const end = Number(slot.hora_fin.slice(0, 2)) * 60 + Number(slot.hora_fin.slice(3, 5))
    return (hour + 1) * 60 > start && hour * 60 < end
  })
}

function shortName(name = '') {
  const parts = name.split(' ').filter(Boolean)
  if (parts.length < 2) return name
  return `${parts[0][0]}. ${parts[parts.length - 1]}`
}

export default function AgendaPage() {
  const { user } = useAuth()
  const [date, setDate] = useState(todayISO())
  const [doctorFilter, setDoctorFilter] = useState('todos')
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [services, setServices] = useState([])
  const [patientNames, setPatientNames] = useState({})
  const [availabilityByDoctor, setAvailabilityByDoctor] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const canManage = user.rol === 'ADMIN' || user.rol === 'RECEPCION'

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [dayAppointments, doctorList, serviceList, patientList] = await Promise.all([
        api.get(`/citas?fecha=${date}`),
        api.get('/medicos'),
        api.get('/servicios'),
        canManage ? api.get('/pacientes') : Promise.resolve([]),
      ])
      const slots = await Promise.all(
        doctorList.map((doctor) => api.get(`/disponibilidad?medico_id=${doctor.id}`)),
      )
      const availabilityMap = {}
      doctorList.forEach((doctor, i) => {
        availabilityMap[doctor.id] = slots[i]
      })

      setAppointments(dayAppointments)
      setDoctors(doctorList)
      setServices(serviceList)
      setPatientNames(indexBy(patientList, 'nombre_completo'))
      setAvailabilityByDoctor(availabilityMap)
    } catch {
      setError('No se pudo cargar la agenda.')
    } finally {
      setLoading(false)
    }
  }, [date, canManage])

  useEffect(() => {
    load()
  }, [load])

  const weekdayIndex = weekday(date)
  const serviceNames = indexBy(services, 'nombre')
  const visibleDoctors =
    user.rol === 'MEDICO'
      ? doctors.filter((doctor) => doctor.id === user.id)
      : doctorFilter === 'todos'
        ? doctors
        : doctors.filter((doctor) => doctor.id === doctorFilter)

  function appointmentsAt(doctorId, hour) {
    return appointments.filter(
      (a) => a.medico_id === doctorId && new Date(a.starts_at).getHours() === hour,
    )
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold capitalize">{longDateFromISO(date)}</h2>
        <div className="flex items-center gap-2 text-sm">
          {user.rol !== 'MEDICO' && (
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="rounded-lg border border-line px-3 py-1.5 outline-none focus:border-brand"
            >
              <option value="todos">Todos los médicos</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.nombre_completo}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-1">
            <button
              onClick={() => setDate(addDays(date, -1))}
              className="rounded-lg border border-line px-3 py-1.5 hover:bg-surface-plane"
            >
              ‹
            </button>
            <button
              onClick={() => setDate(todayISO())}
              className="rounded-lg border border-line px-3 py-1.5 hover:bg-surface-plane"
            >
              Hoy
            </button>
            <button
              onClick={() => setDate(addDays(date, 1))}
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
      ) : visibleDoctors.length === 0 ? (
        <ListMessage>No hay médicos que mostrar.</ListMessage>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <div
            className="grid gap-px bg-line text-sm"
            style={{ gridTemplateColumns: `160px repeat(${HOURS.length}, minmax(96px, 1fr))` }}
          >
            <div className="sticky left-0 z-10 bg-surface-plane px-3 py-2 text-left text-[11px] font-semibold">
              Médico
            </div>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="bg-surface-plane py-2 text-center text-[11px] font-semibold"
              >
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}

            {visibleDoctors.map((doctor) => (
              <DoctorRow
                key={doctor.id}
                doctor={doctor}
                weekdayIndex={weekdayIndex}
                slots={availabilityByDoctor[doctor.id] ?? []}
                appointmentsAt={appointmentsAt}
                serviceNames={serviceNames}
                patientNames={patientNames}
                onSelect={setSelectedAppointment}
              />
            ))}
          </div>
        </div>
      )}

      <p className="mt-2 text-[11px] text-ink-muted">
        Pulsa una cita para ver el detalle. Las celdas grises quedan fuera del horario del médico.
      </p>

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
    </Card>
  )
}

function DoctorRow({
  doctor,
  weekdayIndex,
  slots,
  appointmentsAt,
  serviceNames,
  patientNames,
  onSelect,
}) {
  return (
    <>
      <div className="sticky left-0 z-10 bg-white px-3 py-2 shadow-[1px_0_0_var(--color-line)]">
        <p className="text-xs font-medium">{doctor.nombre_completo}</p>
        <p className="text-[10px] text-ink-muted">{doctor.especialidades[0]?.nombre ?? 'General'}</p>
      </div>
      {HOURS.map((hour) => {
        const available = isHourAvailable(slots, weekdayIndex, hour)
        const hourAppointments = appointmentsAt(doctor.id, hour)
        return (
          <div
            key={hour}
            className={`min-h-[46px] space-y-1 p-1 ${available ? 'bg-white' : 'bg-surface-plane'}`}
          >
            {hourAppointments.map((appointment) => (
              <button
                key={appointment.id}
                onClick={() => onSelect(appointment)}
                title={`${formatTime(appointment.starts_at)} · ${serviceNames[appointment.servicio_id] ?? ''}`}
                className={`block w-full rounded px-1.5 py-1 text-left text-[11px] leading-tight hover:brightness-95 ${
                  APPOINTMENT_STATES[appointment.estado]?.chip ?? 'bg-brand-light text-brand-dark'
                }`}
              >
                <span className="tnum font-medium">{formatTime(appointment.starts_at)}</span>{' '}
                {patientNames[appointment.paciente_id]
                  ? shortName(patientNames[appointment.paciente_id])
                  : ''}
                <span className="block text-[10px] opacity-80">
                  {serviceNames[appointment.servicio_id] ?? ''}
                </span>
              </button>
            ))}
          </div>
        )
      })}
    </>
  )
}
