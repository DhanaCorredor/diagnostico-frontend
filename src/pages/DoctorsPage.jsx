import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from '../config/api'
import Avatar from '../components/atoms/Avatar'
import Badge from '../components/atoms/Badge'
import Table from '../components/molecules/Table'
import AvailabilityModal from '../components/organisms/AvailabilityModal'
import { WEEKDAYS_SHORT as WEEKDAYS } from '../utils/weekdays'

function summarizeSlots(slots) {
  const groups = {}
  for (const slot of slots) {
    const schedule = `${slot.hora_inicio.slice(0, 5)}–${slot.hora_fin.slice(0, 5)}`
    ;(groups[schedule] ??= []).push(slot.dia_semana)
  }
  return Object.entries(groups).map(([schedule, days]) => {
    const sorted = [...new Set(days)].sort((a, b) => a - b)
    const consecutive = sorted[sorted.length - 1] - sorted[0] === sorted.length - 1
    const daysLabel =
      sorted.length > 1 && consecutive
        ? `${WEEKDAYS[sorted[0]]}–${WEEKDAYS[sorted[sorted.length - 1]]}`
        : sorted.map((day) => WEEKDAYS[day]).join(', ')
    return `${daysLabel} · ${schedule}`
  })
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [availabilityByDoctor, setAvailabilityByDoctor] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingSchedule, setEditingSchedule] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const doctorList = await api.get('/medicos')
      const slots = await Promise.all(
        doctorList.map((doctor) => api.get(`/disponibilidad?medico_id=${doctor.id}`)),
      )
      const availabilityMap = {}
      doctorList.forEach((doctor, i) => {
        availabilityMap[doctor.id] = slots[i]
      })
      setDoctors(doctorList)
      setAvailabilityByDoctor(availabilityMap)
    } catch (err) {
      setError(errorMessage(err, 'No se pudieron cargar los médicos.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const columns = [
    {
      header: 'Médico',
      className: 'font-medium',
      render: (doctor) => (
        <div className="flex items-center gap-2">
          <Avatar name={doctor.nombre_completo} size="sm" />
          {doctor.nombre_completo}
        </div>
      ),
    },
    {
      header: 'Especialidades',
      render: (doctor) => (
        <div className="flex flex-wrap gap-1">
          {doctor.especialidades.map((specialty) => (
            <Badge key={specialty.id} color="brand" size="sm">
              {specialty.nombre}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: 'Disponibilidad',
      className: 'text-ink-2',
      render: (doctor) => {
        const schedules = summarizeSlots(availabilityByDoctor[doctor.id] ?? [])
        return schedules.length === 0 ? (
          <span className="text-ink-muted">Sin definir</span>
        ) : (
          <div className="space-y-0.5">
            {schedules.map((schedule) => (
              <div key={schedule} className="tnum">
                {schedule}
              </div>
            ))}
          </div>
        )
      },
    },
    {
      header: '',
      className: 'text-right',
      render: (doctor) => (
        <button
          onClick={() => setEditingSchedule(doctor)}
          className="text-brand hover:underline"
        >
          Horario
        </button>
      ),
    },
  ]

  return (
    <>
      <Table
        title="Médicos"
        count={doctors.length}
        columns={columns}
        rows={doctors}
        loading={loading}
        error={error}
        empty="No hay médicos registrados."
      />

      {editingSchedule && (
        <AvailabilityModal
          doctor={editingSchedule}
          onClose={() => setEditingSchedule(null)}
          onSaved={load}
        />
      )}
    </>
  )
}
