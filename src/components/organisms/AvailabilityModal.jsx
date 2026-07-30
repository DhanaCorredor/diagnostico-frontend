import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from '../../config/api'
import { useForm } from '../../hooks/useForm'
import { WEEKDAYS } from '../../utils/weekdays'
import Modal from '../molecules/Modal'
import Field from '../molecules/Field'
import Input from '../atoms/Input'
import Select from '../atoms/Select'
import Button from '../atoms/Button'
import Alert from '../atoms/Alert'
import Spinner from '../atoms/Spinner'
import ListMessage from '../atoms/ListMessage'

function hhmm(value) {
  return value.slice(0, 5)
}

export default function AvailabilityModal({ doctor, onClose, onSaved }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [form, set] = useForm({ dia_semana: '1', hora_inicio: '08:00', hora_fin: '12:00' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setSlots(await api.get(`/disponibilidad?medico_id=${doctor.id}`))
    } catch (err) {
      setError(errorMessage(err, 'No se pudo cargar el horario.'))
    } finally {
      setLoading(false)
    }
  }, [doctor.id])

  useEffect(() => {
    load()
  }, [load])

  async function addSlot(event) {
    event.preventDefault()
    setFormError('')

    if (form.hora_inicio >= form.hora_fin) {
      setFormError('La hora de inicio debe ser anterior a la de fin.')
      return
    }

    setSaving(true)
    try {
      await api.post('/disponibilidad', {
        medico_id: doctor.id,
        dia_semana: Number(form.dia_semana),
        hora_inicio: form.hora_inicio,
        hora_fin: form.hora_fin,
      })
      await load()
      onSaved?.()
    } catch (err) {
      setFormError(errorMessage(err, 'No se pudo añadir la franja.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={`Horario de ${doctor.nombre_completo}`}
      subtitle="Las franjas se repiten cada semana. Solo se pueden agendar citas dentro de ellas."
      onClose={onClose}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      {error && <Alert>{error}</Alert>}

      {loading ? (
        <Spinner className="py-6 text-center" />
      ) : slots.length === 0 ? (
        <ListMessage>Este médico aún no tiene horario definido.</ListMessage>
      ) : (
        <dl role="list" aria-label="Horario semanal" className="space-y-2 text-sm">
          {WEEKDAYS.map((name, day) => {
            const daySlots = slots.filter((slot) => slot.dia_semana === day)
            if (daySlots.length === 0) return null
            return (
              <div key={day} className="flex items-start justify-between gap-4">
                <dt className="text-ink-2">{name}</dt>
                <dd className="tnum text-right font-medium">
                  {daySlots.map((slot) => (
                    <div key={slot.id}>
                      {hhmm(slot.hora_inicio)}–{hhmm(slot.hora_fin)}
                    </div>
                  ))}
                </dd>
              </div>
            )
          })}
        </dl>
      )}

      <form onSubmit={addSlot} className="space-y-3 border-t border-line pt-4">
        <p className="text-sm font-medium">Añadir franja</p>

        {formError && <Alert>{formError}</Alert>}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Día">
            <Select
              value={form.dia_semana}
              onChange={(event) => set('dia_semana', event.target.value)}
            >
              {WEEKDAYS.map((name, day) => (
                <option key={day} value={day}>
                  {name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Desde">
            <Input
              type="time"
              value={form.hora_inicio}
              onChange={(event) => set('hora_inicio', event.target.value)}
              required
            />
          </Field>
          <Field label="Hasta">
            <Input
              type="time"
              value={form.hora_fin}
              onChange={(event) => set('hora_fin', event.target.value)}
              required
            />
          </Field>
        </div>

        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Añadiendo…' : 'Añadir franja'}
        </Button>
      </form>
    </Modal>
  )
}
