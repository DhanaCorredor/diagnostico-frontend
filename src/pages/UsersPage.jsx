import { useEffect, useState } from 'react'
import { api, errorMessage } from '../config/api'
import UserForm from '../components/organisms/UserForm'
import Badge from '../components/atoms/Badge'
import Button from '../components/atoms/Button'
import Alert from '../components/atoms/Alert'
import Table from '../components/molecules/Table'
import { ROLES } from '../utils/roles'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [actionError, setActionError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [userList, specialtyList] = await Promise.all([
        api.get('/usuarios'),
        api.get('/especialidades'),
      ])
      setUsers(userList)
      setSpecialties(specialtyList)
    } catch (err) {
      setError(errorMessage(err, 'No se pudieron cargar los usuarios.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleActive(user) {
    setActionError('')
    try {
      if (user.activo) await api.del(`/usuarios/${user.id}`)
      else await api.put(`/usuarios/${user.id}`, { activo: true })
      load()
    } catch (err) {
      setActionError(errorMessage(err, 'No se pudo cambiar el estado del usuario.'))
    }
  }

  const columns = [
    { header: 'Nombre', className: 'font-medium', render: (user) => user.nombre_completo },
    { header: 'Correo', className: 'text-ink-2', render: (user) => user.email },
    {
      header: 'Rol',
      render: (user) => {
        const role = ROLES[user.rol] ?? { label: user.rol, color: 'neutral' }
        return (
          <Badge color={role.color} size="sm">
            {role.label}
          </Badge>
        )
      },
    },
    {
      header: 'Estado',
      render: (user) =>
        user.activo ? (
          <span className="text-good">● Activo</span>
        ) : (
          <span className="text-ink-muted">○ Inactivo</span>
        ),
    },
    {
      header: '',
      className: 'text-right',
      render: (user) => (
        <div className="flex justify-end gap-3">
          <button onClick={() => setEditing(user)} className="text-brand hover:underline">
            Editar
          </button>
          <button
            onClick={() => toggleActive(user)}
            className={user.activo ? 'text-crit hover:underline' : 'text-good hover:underline'}
          >
            {user.activo ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {actionError && <Alert>{actionError}</Alert>}
      <Table
        title="Usuarios del sistema"
        action={
          <Button size="sm" onClick={() => setEditing({})}>
            + Nuevo acceso
          </Button>
        }
        columns={columns}
        rows={users}
        loading={loading}
        error={error}
        empty="No hay usuarios."
      />

      {editing && (
        <UserForm
          user={editing.id ? editing : null}
          specialties={specialties}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </div>
  )
}
