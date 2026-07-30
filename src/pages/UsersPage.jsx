import { useEffect, useState } from 'react'
import { api, errorMessage } from '../config/api'
import { useAuth } from '../auth/useAuth'
import UserForm from '../components/organisms/UserForm'
import EraseDialog from '../components/organisms/EraseDialog'
import Badge from '../components/atoms/Badge'
import Button from '../components/atoms/Button'
import Alert from '../components/atoms/Alert'
import Table from '../components/molecules/Table'
import { ROLES } from '../utils/roles'

function describeErasure(name, result) {
  if (result?.resultado === 'anonimizado') {
    const kept = result.citas_conservadas
    return `Se borraron los datos de ${name}. Se conservan ${kept} ${
      kept === 1 ? 'cita' : 'citas'
    } en el historial.`
  }
  if (result?.resultado === 'eliminado') {
    return `${name} se eliminó por completo. No tenía ninguna cita asociada.`
  }
  return `${name} se eliminó del sistema.`
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

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
    setNotice('')
    try {
      await api.put(`/usuarios/${user.id}`, { activo: !user.activo })
      load()
    } catch (err) {
      setActionError(errorMessage(err, 'No se pudo cambiar el estado del usuario.'))
    }
  }

  function openDeleteDialog(user) {
    setNotice('')
    setActionError('')
    setDeleteError('')
    setDeleting(user)
  }

  function closeDeleteDialog() {
    setDeleting(null)
    setDeleteError('')
  }

  async function eraseUser() {
    setBusy(true)
    setDeleteError('')
    const name = deleting.nombre_completo
    try {
      const result = await api.del(`/usuarios/${deleting.id}`)
      closeDeleteDialog()
      setNotice(describeErasure(name, result))
      load()
    } catch (err) {
      setDeleteError(errorMessage(err, 'No se pudo eliminar el usuario.'))
    } finally {
      setBusy(false)
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
          {user.id !== currentUser.id && (
            <>
              <button
                onClick={() => toggleActive(user)}
                className={user.activo ? 'text-ink-2 hover:underline' : 'text-good hover:underline'}
              >
                {user.activo ? 'Dar de baja' : 'Reactivar'}
              </button>
              <button onClick={() => openDeleteDialog(user)} className="text-crit hover:underline">
                Eliminar
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {notice && <Alert type="success">{notice}</Alert>}
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

      {deleting && (
        <EraseDialog
          title="Eliminar acceso definitivamente"
          name={deleting.nombre_completo}
          outcomes={[
            'Pierde el acceso al sistema: se borran su correo y su contraseña.',
            'Si no tiene ninguna cita, el registro se elimina por completo.',
            'Si tiene citas pasadas, se conservan para que el historial siga sabiendo quién atendió.',
            'Su horario y sus especialidades se eliminan en todos los casos.',
          ]}
          busy={busy}
          error={deleteError}
          onConfirm={eraseUser}
          onClose={closeDeleteDialog}
          confirmLabel="Eliminar acceso"
        />
      )}
    </div>
  )
}
