import { useState } from 'react'
import { useForm } from '../../hooks/useForm'
import { api, ApiError } from '../../config/api'
import Modal from '../molecules/Modal'
import Field from '../molecules/Field'
import Input from '../atoms/Input'
import Button from '../atoms/Button'
import Alert from '../atoms/Alert'

export default function PatientForm({ patient, onClose, onSaved }) {
  const editing = Boolean(patient)

  const [form, set] = useForm({
    nombre_completo: patient?.nombre_completo ?? '',
    edad: patient?.edad ?? '',
    cedula: patient?.cedula ?? '',
    telefono: patient?.telefono ?? '',
    fecha_nacimiento: patient?.fecha_nacimiento ?? '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)

    const body = {
      nombre_completo: form.nombre_completo.trim(),
      edad: Number(form.edad),
      cedula: form.cedula.trim() || null,
      telefono: form.telefono.trim() || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
    }

    try {
      const saved = editing
        ? await api.put(`/pacientes/${patient.id}`, body)
        : await api.post('/pacientes', body)
      onSaved(saved)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('No se pudo guardar el paciente.')
      setSaving(false)
    }
  }

  const footer = (
    <>
      <Button variant="secondary" type="button" onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" form="patient-form" disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar'}
      </Button>
    </>
  )

  return (
    <Modal
      title={editing ? 'Editar paciente' : 'Nuevo paciente'}
      subtitle="Nombre y edad son obligatorios. La cédula es opcional."
      onClose={onClose}
      footer={footer}
    >
      <form id="patient-form" onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}

        <Field label="Nombre completo">
          <Input
            value={form.nombre_completo}
            onChange={(event) => set('nombre_completo', event.target.value)}
            required
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
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
          <Field label="Cédula (opcional)">
            <Input
              value={form.cedula}
              onChange={(event) => set('cedula', event.target.value)}
              placeholder="V-12.345.678"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Teléfono (opcional)">
            <Input
              value={form.telefono}
              onChange={(event) => set('telefono', event.target.value)}
              placeholder="0414-555-1122"
            />
          </Field>
          <Field label="Fecha de nacimiento (opcional)">
            <Input
              type="date"
              value={form.fecha_nacimiento}
              onChange={(event) => set('fecha_nacimiento', event.target.value)}
            />
          </Field>
        </div>
      </form>
    </Modal>
  )
}
