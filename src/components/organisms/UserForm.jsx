import { useState } from 'react'
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

export default function UserForm({ usuario, especialidades, onClose, onSaved }) {
  const editing = Boolean(usuario)

  const [form, setForm] = useState({
    nombre_completo: usuario?.nombre_completo ?? '',
    email: usuario?.email ?? '',
    rol: usuario?.rol ?? 'RECEPCION',
    password: '',
    matricula: usuario?.matricula ?? '',
    especialidades: usuario?.especialidades?.map((e) => e.id) ?? [],
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const esMedico = form.rol === 'MEDICO'

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleEspecialidad(id) {
    setForm((f) => ({
      ...f,
      especialidades: f.especialidades.includes(id)
        ? f.especialidades.filter((x) => x !== id)
        : [...f.especialidades, id],
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const body = {
      nombre_completo: form.nombre_completo.trim(),
      email: form.email.trim(),
      rol: form.rol,
    }
    if (esMedico) {
      body.matricula = form.matricula.trim() || null
      body.especialidades = form.especialidades
    }
    if (!editing || form.password) body.password = form.password

    try {
      if (editing) await api.put(`/usuarios/${usuario.id}`, body)
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
      <Button type="submit" form="form-usuario" disabled={saving}>
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
      <form id="form-usuario" onSubmit={onSubmit} className="space-y-4">
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
          <Field label="Correo">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required
            />
          </Field>
          <Field label="Rol">
            <Select value={form.rol} onChange={(e) => set('rol', e.target.value)}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
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
            onChange={(e) => set('password', e.target.value)}
            required={!editing}
            minLength={8}
          />
        </Field>

        {esMedico && (
          <>
            <Field label="Matrícula (opcional)">
              <Input
                value={form.matricula}
                onChange={(e) => set('matricula', e.target.value)}
                placeholder="MPPS 45.221"
              />
            </Field>
            <div>
              <label className="mb-1 block text-sm font-medium">Especialidades</label>
              <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-lg border border-line p-2">
                {especialidades.map((e) => {
                  const activa = form.especialidades.includes(e.id)
                  return (
                    <button
                      type="button"
                      key={e.id}
                      onClick={() => toggleEspecialidad(e.id)}
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        activa
                          ? 'bg-brand text-white'
                          : 'bg-surface-plane text-ink-2 hover:bg-brand-light'
                      }`}
                    >
                      {e.nombre}
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
