import { useState } from 'react'
import { api, ApiError } from '../../config/api'
import Modal from '../molecules/Modal'
import Field from '../molecules/Field'
import Input from '../atoms/Input'
import Button from '../atoms/Button'
import Alert from '../atoms/Alert'

export default function PatientForm({ paciente, onClose, onSaved }) {
  const editing = Boolean(paciente)

  const [form, setForm] = useState({
    nombre_completo: paciente?.nombre_completo ?? '',
    edad: paciente?.edad ?? '',
    cedula: paciente?.cedula ?? '',
    telefono: paciente?.telefono ?? '',
    fecha_nacimiento: paciente?.fecha_nacimiento ?? '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
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
      const guardado = editing
        ? await api.put(`/pacientes/${paciente.id}`, body)
        : await api.post('/pacientes', body)
      onSaved(guardado)
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
      <Button type="submit" form="form-paciente" disabled={saving}>
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
      <form id="form-paciente" onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}

        <Field label="Nombre completo">
          <Input
            value={form.nombre_completo}
            onChange={(e) => set('nombre_completo', e.target.value)}
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
              onChange={(e) => set('edad', e.target.value)}
              required
            />
          </Field>
          <Field label="Cédula (opcional)">
            <Input
              value={form.cedula}
              onChange={(e) => set('cedula', e.target.value)}
              placeholder="V-12.345.678"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Teléfono (opcional)">
            <Input
              value={form.telefono}
              onChange={(e) => set('telefono', e.target.value)}
              placeholder="0414-555-1122"
            />
          </Field>
          <Field label="Fecha de nacimiento (opcional)">
            <Input
              type="date"
              value={form.fecha_nacimiento}
              onChange={(e) => set('fecha_nacimiento', e.target.value)}
            />
          </Field>
        </div>
      </form>
    </Modal>
  )
}
