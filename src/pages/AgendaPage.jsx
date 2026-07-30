import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from '../config/api'
import { useAuth } from '../auth/useAuth'
import {
  weekday,
  longDateFromISO,
  formatTime,
  formatShortDate,
  todayISO,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  daysBetween,
} from '../utils/date'
import { indexBy } from '../utils/data'
import AppointmentDetail from '../components/organisms/AppointmentDetail'
import StatusBadge from '../components/molecules/StatusBadge'
import Spinner from '../components/atoms/Spinner'
import Card from '../components/atoms/Card'
import ListMessage from '../components/atoms/ListMessage'
import { APPOINTMENT_STATES } from '../utils/appointments'

const HOURS = Array.from({ length: 11 }, (_, i) => 7 + i)

const MAX_RANGE_DAYS = 60

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

function groupByDay(appointments) {
  const days = {}
  for (const appointment of appointments) {
    const day = appointment.starts_at.slice(0, 10)
    ;(days[day] ??= []).push(appointment)
  }
  return Object.entries(days)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, list]) => [day, list.sort((a, b) => a.starts_at.localeCompare(b.starts_at))])
}

export default function AgendaPage() {
  const { user } = useAuth()
  const [from, setFrom] = useState(todayISO())
  const [to, setTo] = useState(todayISO())
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
  const span = daysBetween(from, to)
  const singleDay = span === 0

  const load = useCallback(async () => {
    const length = daysBetween(from, to)
    if (length < 0) {
      setError('La fecha final no puede ser anterior a la inicial.')
      setLoading(false)
      return
    }
    if (length >= MAX_RANGE_DAYS) {
      setError(`El rango no puede superar los ${MAX_RANGE_DAYS} días.`)
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const doctorParam = doctorFilter === 'todos' ? '' : `&medico_id=${doctorFilter}`
      const [rangeAppointments, doctorList, serviceList, patientList] = await Promise.all([
        api.get(`/citas?desde=${from}&hasta=${to}${doctorParam}`),
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

      setAppointments(rangeAppointments)
      setDoctors(doctorList)
      setServices(serviceList)
      setPatientNames(indexBy(patientList, 'nombre_completo'))
      setAvailabilityByDoctor(availabilityMap)
    } catch (err) {
      setError(errorMessage(err, 'No se pudo cargar la agenda.'))
    } finally {
      setLoading(false)
    }
  }, [from, to, doctorFilter, canManage])

  useEffect(() => {
    load()
  }, [load])

  function selectDay(day) {
    setFrom(day)
    setTo(day)
  }

  function selectWeek() {
    const today = todayISO()
    setFrom(startOfWeek(today))
    setTo(endOfWeek(today))
  }

  function selectMonth() {
    const today = todayISO()
    setFrom(startOfMonth(today))
    setTo(endOfMonth(today))
  }

  function shift(direction) {
    const step = (span + 1) * direction
    setFrom(addDays(from, step))
    setTo(addDays(to, step))
  }

  const weekdayIndex = weekday(from)
  const doctorNames = indexBy(doctors, 'nombre_completo')
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

  const title = singleDay
    ? longDateFromISO(from)
    : `${formatShortDate(from)} – ${formatShortDate(to)}`

  return (
    <Card className="p-5">
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold capitalize">{title}</h2>
          {user.rol !== 'MEDICO' && (
            <select
              value={doctorFilter}
              onChange={(event) => setDoctorFilter(event.target.value)}
              className="rounded-lg border border-line px-3 py-1.5 text-sm outline-none focus:border-brand"
            >
              <option value="todos">Todos los médicos</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.nombre_completo}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-3 text-sm">
          <div className="flex gap-1">
            <button
              onClick={() => selectDay(todayISO())}
              className="rounded-lg border border-line px-3 py-1.5 hover:bg-surface-plane"
            >
              Hoy
            </button>
            <button
              onClick={selectWeek}
              className="rounded-lg border border-line px-3 py-1.5 hover:bg-surface-plane"
            >
              Esta semana
            </button>
            <button
              onClick={selectMonth}
              className="rounded-lg border border-line px-3 py-1.5 hover:bg-surface-plane"
            >
              Este mes
            </button>
          </div>

          <label className="flex items-center gap-2">
            <span className="text-ink-2">Desde</span>
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="rounded-lg border border-line px-2 py-1.5 outline-none focus:border-brand"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-ink-2">Hasta</span>
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="rounded-lg border border-line px-2 py-1.5 outline-none focus:border-brand"
            />
          </label>

          <div className="flex gap-1">
            <button
              onClick={() => shift(-1)}
              aria-label="Periodo anterior"
              className="rounded-lg border border-line px-3 py-1.5 hover:bg-surface-plane"
            >
              ‹
            </button>
            <button
              onClick={() => shift(1)}
              aria-label="Periodo siguiente"
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
      ) : singleDay ? (
        <>
          <div className="hidden md:block">
            {visibleDoctors.length === 0 ? (
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
              Pulsa una cita para ver el detalle. Las celdas grises quedan fuera del horario del
              médico.
            </p>
          </div>

          <div className="md:hidden">
            {appointments.length === 0 ? (
              <ListMessage>No hay citas este día.</ListMessage>
            ) : (
              <DayList
                appointments={appointments}
                patientNames={patientNames}
                doctorNames={doctorNames}
                serviceNames={serviceNames}
                onSelect={setSelectedAppointment}
                showDayHeadings={false}
              />
            )}
          </div>
        </>
      ) : appointments.length === 0 ? (
        <ListMessage>No hay citas en este periodo.</ListMessage>
      ) : (
        <DayList
          appointments={appointments}
          patientNames={patientNames}
          doctorNames={doctorNames}
          serviceNames={serviceNames}
          onSelect={setSelectedAppointment}
          showDayHeadings
        />
      )}

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

function AppointmentRow({ appointment, patientNames, doctorNames, serviceNames, onSelect }) {
  return (
    <button
      onClick={() => onSelect(appointment)}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-plane"
    >
      <span className="tnum w-12 shrink-0 text-sm font-medium text-ink-2">
        {formatTime(appointment.starts_at)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {patientNames[appointment.paciente_id] ?? 'Paciente'}
        </p>
        <p className="truncate text-xs text-ink-muted">
          {doctorNames[appointment.medico_id] ?? 'Médico'} ·{' '}
          {serviceNames[appointment.servicio_id] ?? 'Servicio'}
        </p>
      </div>
      <StatusBadge status={appointment.estado} />
    </button>
  )
}

function DayList({
  appointments,
  patientNames,
  doctorNames,
  serviceNames,
  onSelect,
  showDayHeadings,
}) {
  const days = groupByDay(appointments)

  if (!showDayHeadings) {
    return (
      <div className="divide-y divide-line rounded-lg border border-line">
        {days.flatMap(([, dayAppointments]) => dayAppointments).map((appointment) => (
          <AppointmentRow
            key={appointment.id}
            appointment={appointment}
            patientNames={patientNames}
            doctorNames={doctorNames}
            serviceNames={serviceNames}
            onSelect={onSelect}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {days.map(([day, dayAppointments]) => (
        <div key={day}>
          <h3 className="mb-2 text-sm font-semibold capitalize text-ink-2">
            {longDateFromISO(day)}
          </h3>
          <div className="divide-y divide-line rounded-lg border border-line">
            {dayAppointments.map((appointment) => (
              <AppointmentRow
                key={appointment.id}
                appointment={appointment}
                patientNames={patientNames}
                doctorNames={doctorNames}
                serviceNames={serviceNames}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
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
