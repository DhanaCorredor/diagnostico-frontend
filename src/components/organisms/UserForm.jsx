import { useState } from 'react'
import { useForm } from '../../hooks/useForm'
import { api, ApiError } from '../../config/api'
import Modal from '../molecules/Modal'
import Field from '../molecules/Field'
import Input from '../atoms/Input'
import Select from '../atoms/Select'
import Button from '../atoms/Button'
import Alert from '../atoms/Alert'

const ROLES = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'RECEPCION', label: 'Recepción' },
  { value: 'MEDICO', label: 'Médico' },
]

export default function UserForm({ user, specialties, onClose, onSaved }) {
  const editing = Boolean(user)

  const [form, set, setForm] = useForm({
    nombre_completo: user?.nombre_completo ?? '',
    email: user?.email ?? '',
    rol: user?.rol ?? 'RECEPCION',
    password: '',
    matricula: user?.matricula ?? '',
    especialidades: user?.especialidades?.map((specialty) => specialty.id) ?? [],
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isDoctor = form.rol === 'MEDICO'

  function toggleSpecialty(id) {
    setForm((current) => ({
      ...current,
      especialidades: current.especialidades.includes(id)
        ? current.especialidades.filter((specialtyId) => specialtyId !== id)
        : [...current.especialidades, id],
    }))
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)

    const body = {
      nombre_completo: form.nombre_completo.trim(),
      email: form.email.trim(),
    }
    if (!editing) body.rol = form.rol
    if (isDoctor) {
      body.matricula = form.matricula.trim() || null
      body.especialidades = form.especialidades
    }
    if (!editing || form.password) body.password = form.password

    try {
      if (editing) await api.put(`/usuarios/${user.id}`, body)
      else await api.post('/usuarios', body)
      onSaved()
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('No se pudo guardar el usuario.')
      setSaving(false)
    }
  }

  const footer = (
    <>
      <Button variant="secondary" type="button" onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" form="user-form" disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar'}
      </Button>
    </>
  )

  return (
    <Modal
      title={editing ? 'Editar usuario' : 'Nuevo acceso'}
      subtitle="Personal interno que inicia sesión en el sistema."
      onClose={onClose}
      footer={footer}
    >
      <form id="user-form" onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}

        <Field label="Nombre completo">
          <Input
            value={form.nombre_completo}
            onChange={(event) => set('nombre_completo', event.target.value)}
            required
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Correo">
            <Input
              type="email"
              value={form.email}
              onChange={(event) => set('email', event.target.value)}
              required
            />
          </Field>
          <Field
            label="Rol"
            hint={editing ? 'El rol no se cambia tras crear el usuario.' : undefined}
          >
            <Select
              value={form.rol}
              onChange={(event) => set('rol', event.target.value)}
              disabled={editing}
            >
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label={editing ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
          hint="Mínimo 8 caracteres."
        >
          <Input
            type="password"
            value={form.password}
            onChange={(event) => set('password', event.target.value)}
            required={!editing}
            minLength={8}
          />
        </Field>

        {isDoctor && (
          <>
            <Field label="Matrícula (opcional)">
              <Input
                value={form.matricula}
                onChange={(event) => set('matricula', event.target.value)}
                placeholder="MPPS 45.221"
              />
            </Field>
            <div>
              <label className="mb-1 block text-sm font-medium">Especialidades</label>
              <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-lg border border-line p-2">
                {specialties.map((specialty) => {
                  const selected = form.especialidades.includes(specialty.id)
                  return (
                    <button
                      type="button"
                      key={specialty.id}
                      onClick={() => toggleSpecialty(specialty.id)}
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        selected
                          ? 'bg-brand text-white'
                          : 'bg-surface-plane text-ink-2 hover:bg-brand-light'
                      }`}
                    >
                      {specialty.nombre}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </form>
    </Modal>
  )
}
