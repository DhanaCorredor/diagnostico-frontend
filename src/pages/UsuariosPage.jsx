import { useEffect, useState } from 'react'
import { api } from '../api/client'
import FormularioUsuario from '../components/FormularioUsuario'
import Badge from '../components/atoms/Badge'
import Spinner from '../components/atoms/Spinner'

const ROL_BADGE = {
  ADMIN: { texto: 'Administrador', color: 'brand' },
  RECEPCION: { texto: 'Recepción', color: 'aqua' },
  MEDICO: { texto: 'Médico', color: 'warn' },
}

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

  return (
    <div className="rounded-xl border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="font-semibold">Usuarios del sistema</h2>
        <button
          onClick={() => setEditar({})}
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + Nuevo acceso
        </button>
      </div>

      {cargando ? (
        <Spinner className="px-5 py-10 text-center" />
      ) : error ? (
        <p className="px-5 py-10 text-center text-sm text-crit">{error}</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-ink-muted">
            <tr className="border-b border-line">
              <th className="px-5 py-3 font-medium">Nombre</th>
              <th className="px-5 py-3 font-medium">Correo</th>
              <th className="px-5 py-3 font-medium">Rol</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {usuarios.map((u) => {
              const badge = ROL_BADGE[u.rol] ?? { texto: u.rol, color: 'neutral' }
              return (
                <tr key={u.id} className="hover:bg-surface-plane">
                  <td className="px-5 py-3 font-medium">{u.nombre_completo}</td>
                  <td className="px-5 py-3 text-ink-2">{u.email}</td>
                  <td className="px-5 py-3">
                    <Badge color={badge.color} tamano="sm">
                      {badge.texto}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {u.activo ? (
                      <span className="text-good">● Activo</span>
                    ) : (
                      <span className="text-ink-muted">○ Inactivo</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
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
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

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
    </div>
  )
}
