import { useEffect, useState } from 'react'
import { useForm } from '../hooks/useForm'
import AppointmentError from '../components/molecules/AppointmentError'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../config/api'
import { todayISO } from '../utils/date'
import Field from '../components/molecules/Field'
import Input from '../components/atoms/Input'
import Button from '../components/atoms/Button'
import Card from '../components/atoms/Card'
import AppointmentFields from '../components/molecules/AppointmentFields'

export default function NewAppointmentPage() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [services, setServices] = useState([])

  const [form, set] = useForm({
    nombre_completo: '',
    edad: '',
    medico_id: '',
    servicio_id: '',
    date: todayISO(),
    time: '09:00',
    duracion_min: 30,
    motivo: '',
    permitir_sobrecupo: false,
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [doctorList, serviceList] = await Promise.all([
          api.get('/medicos'),
          api.get('/servicios'),
        ])
        setDoctors(doctorList)
        setServices(serviceList)
      } catch {
        setError({ message: 'No se pudieron cargar los médicos y servicios.' })
      }
    }
    load()
  }, [])

  async function onSubmit(event) {
    event.preventDefault()
    setError(null)

    const minutes = Number(form.time.slice(3, 5))
    if (minutes % 15 !== 0) {
      setError({ message: 'La hora debe empezar en :00, :15, :30 o :45.' })
      return
    }

    setSaving(true)
    const body = {
      nombre_completo: form.nombre_completo.trim(),
      edad: Number(form.edad),
      medico_id: form.medico_id,
      servicio_id: form.servicio_id,
      starts_at: `${form.date}T${form.time}:00`,
      duracion_min: Number(form.duracion_min),
      motivo: form.motivo.trim() || null,
      permitir_sobrecupo: form.permitir_sobrecupo,
    }

    try {
      await api.post('/citas', body)
      navigate('/agenda')
    } catch (err) {
      if (err instanceof ApiError) {
        setError({ message: err.message, candidates: err.detail?.candidatos })
      } else {
        setError({ message: 'No se pudo agendar la cita.' })
      }
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold">Nueva cita</h2>
          <p className="text-xs text-ink-muted">
            Si el paciente no existe, se crea automáticamente al guardar.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-6">
          <AppointmentError error={error} />

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="Paciente (nombre completo)">
                <Input
                  value={form.nombre_completo}
                  onChange={(event) => set('nombre_completo', event.target.value)}
                  required
                  autoFocus
                />
              </Field>
            </div>
            <Field label="Edad">
              <Input
                type="number"
                min="0"
                max="120"
                value={form.edad}
                onChange={(event) => set('edad', event.target.value)}
                required
              />
            </Field>
          </div>

          <AppointmentFields form={form} set={set} doctors={doctors} services={services} />

          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cita'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
