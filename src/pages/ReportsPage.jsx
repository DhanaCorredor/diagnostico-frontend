import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from '../config/api'
import { todayISO, startOfMonth, endOfMonth, formatShortDate, daysBetween } from '../utils/date'
import { indexBy } from '../utils/data'
import { countBy, ranking, noShowRate, formatPercent } from '../utils/reports'
import { APPOINTMENT_STATES } from '../utils/appointments'
import DateRangePicker from '../components/molecules/DateRangePicker'
import KpiCard from '../components/molecules/KpiCard'
import Card from '../components/atoms/Card'
import Alert from '../components/atoms/Alert'
import Spinner from '../components/atoms/Spinner'
import ListMessage from '../components/atoms/ListMessage'
import Badge from '../components/atoms/Badge'

const MAX_RANGE_DAYS = 60

const STATUS_ORDER = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED']

function Breakdown({ title, rows, total, empty }) {
  return (
    <Card className="p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-ink-muted">{empty}</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {rows.map((row) => (
            <li key={row.id}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate">{row.name}</span>
                <span className="tnum shrink-0 font-medium">{row.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-plane">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${total > 0 ? (row.count / total) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default function ReportsPage() {
  const today = todayISO()
  const [from, setFrom] = useState(startOfMonth(today))
  const [to, setTo] = useState(endOfMonth(today))
  const [appointments, setAppointments] = useState([])
  const [doctorNames, setDoctorNames] = useState({})
  const [serviceNames, setServiceNames] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
      const [rangeAppointments, doctorList, serviceList] = await Promise.all([
        api.get(`/citas?desde=${from}&hasta=${to}&incluir_canceladas=true`),
        api.get('/medicos'),
        api.get('/servicios'),
      ])
      setAppointments(rangeAppointments)
      setDoctorNames(indexBy(doctorList, 'nombre_completo'))
      setServiceNames(indexBy(serviceList, 'nombre'))
    } catch (err) {
      setError(errorMessage(err, 'No se pudo cargar el informe.'))
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    load()
  }, [load])

  function changeRange(nextFrom, nextTo) {
    setFrom(nextFrom)
    setTo(nextTo)
  }

  const byStatus = countBy(appointments, (appointment) => appointment.estado)
  const byDoctor = ranking(
    countBy(appointments, (appointment) => appointment.medico_id),
    doctorNames,
    'Médico',
  )
  const byService = ranking(
    countBy(appointments, (appointment) => appointment.servicio_id),
    serviceNames,
    'Servicio',
  )
  const completed = byStatus.COMPLETED ?? 0
  const cancelled = byStatus.CANCELLED ?? 0

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold">
            Del {formatShortDate(from)} al {formatShortDate(to)}
          </h2>
          <span className="text-xs text-ink-muted">Incluye las citas canceladas</span>
        </div>
        <DateRangePicker from={from} to={to} onChange={changeRange} />
      </Card>

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <Spinner className="py-10 text-center" />
      ) : error ? null : appointments.length === 0 ? (
        <ListMessage>No hay citas en este periodo.</ListMessage>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Citas" value={appointments.length} />
            <KpiCard title="Atendidas" value={completed} />
            <KpiCard title="Canceladas" value={cancelled} />
            <KpiCard
              title="Ausencias"
              value={formatPercent(noShowRate(appointments))}
              note="sobre las citas ya cerradas"
            />
          </div>

          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Por estado
            </h3>
            <div className="flex flex-wrap gap-4">
              {STATUS_ORDER.filter((status) => byStatus[status]).map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <Badge color={APPOINTMENT_STATES[status]?.color ?? 'neutral'} size="sm">
                    {APPOINTMENT_STATES[status]?.text ?? status}
                  </Badge>
                  <span className="tnum text-sm font-medium">{byStatus[status]}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Breakdown
              title="Por médico"
              rows={byDoctor}
              total={appointments.length}
              empty="Sin datos."
            />
            <Breakdown
              title="Por servicio"
              rows={byService}
              total={appointments.length}
              empty="Sin datos."
            />
          </div>
        </>
      )}
    </div>
  )
}
