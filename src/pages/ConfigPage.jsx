import { useEffect, useState } from 'react'
import { api, ApiError } from '../api/client'
import { claseInput } from '../components/Campo'

const CATEGORIAS = [
  { valor: 'CONSULTA', etiqueta: 'Consulta' },
  { valor: 'ECOGRAFIA', etiqueta: 'Ecografía' },
  { valor: 'ESTUDIO_CARDIACO', etiqueta: 'Estudio cardíaco' },
  { valor: 'OTRO', etiqueta: 'Otro' },
]
const CAT_LABEL = Object.fromEntries(CATEGORIAS.map((c) => [c.valor, c.etiqueta]))

export default function ConfigPage() {
  const [especialidades, setEspecialidades] = useState([])
  const [servicios, setServicios] = useState([])
  const [error, setError] = useState('')

  const [nuevaEsp, setNuevaEsp] = useState('')
  const [nuevoServ, setNuevoServ] = useState({ nombre: '', categoria: 'CONSULTA' })

  async function cargar() {
    setError('')
    try {
      const [es, ss] = await Promise.all([api.get('/especialidades'), api.get('/servicios')])
      setEspecialidades(es)
      setServicios(ss)
    } catch {
      setError('No se pudieron cargar los catálogos.')
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function crearEspecialidad(e) {
    e.preventDefault()
    if (!nuevaEsp.trim()) return
    try {
      await api.post('/especialidades', { nombre: nuevaEsp.trim() })
      setNuevaEsp('')
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la especialidad.')
    }
  }

  async function crearServicio(e) {
    e.preventDefault()
    if (!nuevoServ.nombre.trim()) return
    try {
      await api.post('/servicios', {
        nombre: nuevoServ.nombre.trim(),
        categoria: nuevoServ.categoria,
      })
      setNuevoServ({ nombre: '', categoria: 'CONSULTA' })
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el servicio.')
    }
  }

  async function desactivarServicio(id) {
    try {
      await api.put(`/servicios/${id}`, { activo: false })
      cargar()
    } catch {
      setError('No se pudo desactivar el servicio.')
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="rounded-lg bg-crit/10 px-4 py-3 text-sm text-crit">{error}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-5">
          <h3 className="mb-1 font-semibold">Especialidades</h3>
          <p className="mb-3 text-xs text-ink-muted">Áreas médicas del centro.</p>

          <div className="mb-4 flex flex-wrap gap-1.5">
            {especialidades.map((e) => (
              <span key={e.id} className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs text-brand-dark">
                {e.nombre}
              </span>
            ))}
            {especialidades.length === 0 && (
              <span className="text-sm text-ink-muted">Aún no hay especialidades.</span>
            )}
          </div>

          <form onSubmit={crearEspecialidad} className="flex gap-2">
            <input
              value={nuevaEsp}
              onChange={(e) => setNuevaEsp(e.target.value)}
              placeholder="Nueva especialidad…"
              className={claseInput}
            />
            <button className="shrink-0 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
              Añadir
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-line bg-white p-5">
          <h3 className="mb-1 font-semibold">Servicios y estudios</h3>
          <p className="mb-3 text-xs text-ink-muted">
            La duración de cada cita la elige recepción al agendar.
          </p>

          <div className="mb-4 max-h-56 space-y-2 overflow-y-auto text-sm">
            {servicios.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg bg-surface-plane px-3 py-2"
              >
                <span>
                  {s.nombre}
                  <span className="ml-2 text-xs text-ink-muted">{CAT_LABEL[s.categoria] ?? s.categoria}</span>
                </span>
                <button
                  onClick={() => desactivarServicio(s.id)}
                  className="text-xs text-crit hover:underline"
                >
                  Desactivar
                </button>
              </div>
            ))}
            {servicios.length === 0 && (
              <span className="text-ink-muted">Aún no hay servicios activos.</span>
            )}
          </div>

          <form onSubmit={crearServicio} className="flex gap-2">
            <input
              value={nuevoServ.nombre}
              onChange={(e) => setNuevoServ((s) => ({ ...s, nombre: e.target.value }))}
              placeholder="Nuevo servicio…"
              className={claseInput}
            />
            <select
              value={nuevoServ.categoria}
              onChange={(e) => setNuevoServ((s) => ({ ...s, categoria: e.target.value }))}
              className="shrink-0 rounded-lg border border-line px-2 py-2 text-sm outline-none focus:border-brand"
            >
              {CATEGORIAS.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.etiqueta}
                </option>
              ))}
            </select>
            <button className="shrink-0 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
              Añadir
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-white p-5">
        <h3 className="mb-3 font-semibold">Seguridad</h3>
        <div className="space-y-2 text-sm">
          {[
            'Contraseñas cifradas (bcrypt)',
            'Acceso por rol (JWT)',
            'Bajas lógicas (sin borrado físico)',
          ].map((t) => (
            <div key={t} className="flex items-center justify-between">
              <span className="text-ink-2">{t}</span>
              <span className="rounded-full bg-good/10 px-2 py-0.5 text-xs text-good">Activo</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
