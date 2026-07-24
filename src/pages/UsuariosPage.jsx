import { useEffect, useState } from 'react'
import { api } from '../config/api'
import FormularioUsuario from '../components/organisms/FormularioUsuario'
import Badge from '../components/atoms/Badge'
import Boton from '../components/atoms/Boton'
import Tabla from '../components/molecules/Tabla'
import { ROLES } from '../utils/roles'

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [us, es] = await Promise.all([api.get('/usuarios'), api.get('/especialidades')])
      setUsuarios(us)
      setEspecialidades(es)
    } catch {
      setError('No se pudieron load los usuarios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleActive(u) {
    try {
      if (u.activo) await api.del(`/usuarios/${u.id}`)
      else await api.put(`/usuarios/${u.id}`, { activo: true })
      load()
    } catch {
      setError('No se pudo cambiar el estado del usuario.')
    }
  }

  const columns = [
    { header: 'Nombre', className: 'font-medium', render: (u) => u.nombre_completo },
    { header: 'Correo', className: 'text-ink-2', render: (u) => u.email },
    {
      header: 'Rol',
      render: (u) => {
        const b = ROLES[u.rol] ?? { label: u.rol, color: 'neutral' }
        return (
          <Badge color={b.color} size="sm">
            {b.label}
          </Badge>
        )
      },
    },
    {
      header: 'Estado',
      render: (u) =>
        u.activo ? (
          <span className="text-good">● Activo</span>
        ) : (
          <span className="text-ink-muted">○ Inactivo</span>
        ),
    },
    {
      header: '',
      className: 'text-right',
      render: (u) => (
        <div className="flex justify-end gap-3">
          <button onClick={() => setEditing(u)} className="text-brand hover:underline">
            Editar
          </button>
          <button
            onClick={() => toggleActive(u)}
            className={u.activo ? 'text-crit hover:underline' : 'text-good hover:underline'}
          >
            {u.activo ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <Tabla
        title="Usuarios del sistema"
        action={
          <Boton size="sm" onClick={() => setEditing({})}>
            + Nuevo acceso
          </Boton>
        }
        columns={columns}
        rows={usuarios}
        loading={loading}
        error={error}
        empty="No hay usuarios."
      />

      {editing && (
        <FormularioUsuario
          usuario={editing.id ? editing : null}
          especialidades={especialidades}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </>
  )
}
