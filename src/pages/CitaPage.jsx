import { useEffect, useState } from 'react'
import { useForm } from '../hooks/useForm'
import ErrorCita from '../components/molecules/ErrorCita'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../config/api'
import { todayISO } from '../utils/date'
import Field from '../components/molecules/Field'
import Input from '../components/atoms/Input'
import Button from '../components/atoms/Button'
import Card from '../components/atoms/Card'
import AppointmentFields from '../components/molecules/AppointmentFields'

export default function CitaPage() {
  const navigate = useNavigate()
  const [medicos, setMedicos] = useState([])
  const [servicios, setServicios] = useState([])

  const [form, set] = useForm({
    nombre_completo: '',
    edad: '',
    medico_id: '',
    servicio_id: '',
    fecha: todayISO(),
    hora: '09:00',
    duracion_min: 30,
    motivo: '',
    permitir_sobrecupo: false,
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [ms, ss] = await Promise.all([api.get('/medicos'), api.get('/servicios')])
        setMedicos(ms)
        setServicios(ss)
      } catch {
        setError({ mensaje: 'No se pudieron cargar los médicos y servicios.' })
      }
    }
    load()
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)

    const minutos = Number(form.hora.slice(3, 5))
    if (minutos % 15 !== 0) {
      setError({ mensaje: 'La hora debe empezar en :00, :15, :30 o :45.' })
      return
    }

    setSaving(true)
    const body = {
      nombre_completo: form.nombre_completo.trim(),
      edad: Number(form.edad),
      medico_id: form.medico_id,
      servicio_id: form.servicio_id,
      starts_at: `${form.fecha}T${form.hora}:00`,
      duracion_min: Number(form.duracion_min),
      motivo: form.motivo.trim() || null,
      permitir_sobrecupo: form.permitir_sobrecupo,
    }

    try {
      await api.post('/citas', body)
      navigate('/agenda')
    } catch (err) {
      if (err instanceof ApiError) {
        const candidatos = err.detail?.candidatos
        setError({ mensaje: err.message, candidatos })
      } else {
        setError({ mensaje: 'No se pudo agendar la cita.' })
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
          <ErrorCita error={error} />

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="Paciente (nombre completo)">
                <Input
                  value={form.nombre_completo}
                  onChange={(e) => set('nombre_completo', e.target.value)}
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
                onChange={(e) => set('edad', e.target.value)}
                required
              />
            </Field>
          </div>

          <AppointmentFields form={form} set={set} medicos={medicos} servicios={servicios} />

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
