import { useState } from 'react'
import { api, ApiError } from '../api/client'
import Modal from './Modal'
import Campo from './Campo'
import Input from './atoms/Input'
import Select from './atoms/Select'
import Boton from './atoms/Boton'

const ROLES = [
  { valor: 'ADMIN', etiqueta: 'Administrador' },
  { valor: 'RECEPCION', etiqueta: 'Recepción' },
  { valor: 'MEDICO', etiqueta: 'Médico' },
]

export default function FormularioUsuario({ usuario, especialidades, onCerrar, onGuardado }) {
  const editando = Boolean(usuario)

  const [form, setForm] = useState({
    nombre_completo: usuario?.nombre_completo ?? '',
    email: usuario?.email ?? '',
    rol: usuario?.rol ?? 'RECEPCION',
    password: '',
    matricula: usuario?.matricula ?? '',
    especialidades: usuario?.especialidades?.map((e) => e.id) ?? [],
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const esMedico = form.rol === 'MEDICO'

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
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
    setGuardando(true)

    const cuerpo = {
      nombre_completo: form.nombre_completo.trim(),
      email: form.email.trim(),
      rol: form.rol,
    }
    if (esMedico) {
      cuerpo.matricula = form.matricula.trim() || null
      cuerpo.especialidades = form.especialidades
    }
    if (!editando || form.password) cuerpo.password = form.password

    try {
      if (editando) await api.put(`/usuarios/${usuario.id}`, cuerpo)
      else await api.post('/usuarios', cuerpo)
      onGuardado()
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('No se pudo guardar el usuario.')
      setGuardando(false)
    }
  }

  const footer = (
    <>
      <Boton variante="secundario" type="button" onClick={onCerrar}>
        Cancelar
      </Boton>
      <Boton type="submit" form="form-usuario" disabled={guardando}>
        {guardando ? 'Guardando…' : 'Guardar'}
      </Boton>
    </>
  )

  return (
    <Modal
      titulo={editando ? 'Editar usuario' : 'Nuevo acceso'}
      subtitulo="Personal interno que inicia sesión en el sistema."
      onClose={onCerrar}
      footer={footer}
    >
      <form id="form-usuario" onSubmit={onSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-crit/10 px-3 py-2 text-sm text-crit">{error}</p>}

        <Campo label="Nombre completo">
          <Input
            value={form.nombre_completo}
            onChange={(e) => set('nombre_completo', e.target.value)}
            required
            autoFocus
          />
        </Campo>

        <div className="grid grid-cols-2 gap-3">
          <Campo label="Correo">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required
            />
          </Campo>
          <Campo label="Rol">
            <Select value={form.rol} onChange={(e) => set('rol', e.target.value)}>
              {ROLES.map((r) => (
                <option key={r.valor} value={r.valor}>
                  {r.etiqueta}
                </option>
              ))}
            </Select>
          </Campo>
        </div>

        <Campo
          label={editando ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
          hint="Mínimo 8 caracteres."
        >
          <Input
            type="password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            required={!editando}
            minLength={8}
          />
        </Campo>

        {esMedico && (
          <>
            <Campo label="Matrícula (opcional)">
              <Input
                value={form.matricula}
                onChange={(e) => set('matricula', e.target.value)}
                placeholder="MPPS 45.221"
              />
            </Campo>
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
