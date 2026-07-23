import { useEffect, useState } from 'react'
import { api } from '../api/client'
import FormularioUsuario from '../components/organisms/FormularioUsuario'
import Badge from '../components/atoms/Badge'
import Boton from '../components/atoms/Boton'
import Tabla from '../components/molecules/Tabla'
import { ROLES } from '../utils/roles'

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [editar, setEditar] = useState(null)

  async function cargar() {
    setCargando(true)
    setError('')
    try {
      const [us, es] = await Promise.all([api.get('/usuarios'), api.get('/especialidades')])
      setUsuarios(us)
      setEspecialidades(es)
    } catch {
      setError('No se pudieron cargar los usuarios.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function alternarActivo(u) {
    try {
      if (u.activo) await api.del(`/usuarios/${u.id}`)
      else await api.put(`/usuarios/${u.id}`, { activo: true })
      cargar()
    } catch {
      setError('No se pudo cambiar el estado del usuario.')
    }
  }

  const columnas = [
    { header: 'Nombre', className: 'font-medium', render: (u) => u.nombre_completo },
    { header: 'Correo', className: 'text-ink-2', render: (u) => u.email },
    {
      header: 'Rol',
      render: (u) => {
        const b = ROLES[u.rol] ?? { etiqueta: u.rol, color: 'neutral' }
        return (
          <Badge color={b.color} tamano="sm">
            {b.etiqueta}
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
          <button onClick={() => setEditar(u)} className="text-brand hover:underline">
            Editar
          </button>
          <button
            onClick={() => alternarActivo(u)}
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
        titulo="Usuarios del sistema"
        accion={
          <Boton tamano="sm" onClick={() => setEditar({})}>
            + Nuevo acceso
          </Boton>
        }
        columnas={columnas}
        filas={usuarios}
        cargando={cargando}
        error={error}
        vacio="No hay usuarios."
      />

      {editar && (
        <FormularioUsuario
          usuario={editar.id ? editar : null}
          especialidades={especialidades}
          onCerrar={() => setEditar(null)}
          onGuardado={() => {
            setEditar(null)
            cargar()
          }}
        />
      )}
    </>
  )
}
