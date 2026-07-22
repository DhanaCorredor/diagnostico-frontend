import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import FormularioPaciente from '../components/FormularioPaciente'
import Spinner from '../components/atoms/Spinner'

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [creando, setCreando] = useState(false)

  async function cargar() {
    setCargando(true)
    setError('')
    try {
      setPacientes(await api.get('/pacientes'))
    } catch {
      setError('No se pudieron cargar los pacientes.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const termino = busqueda.trim().toLowerCase()
  const filtrados = termino
    ? pacientes.filter(
        (p) =>
          p.nombre_completo.toLowerCase().includes(termino) ||
          (p.cedula ?? '').toLowerCase().includes(termino),
      )
    : pacientes

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <svg
          className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4-4" />
        </svg>
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o cédula…"
          className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand"
        />
      </div>

      <div className="rounded-xl border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-semibold">
            Pacientes <span className="ml-1 text-sm font-normal text-ink-muted">({filtrados.length})</span>
          </h2>
          <button
            onClick={() => setCreando(true)}
            className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            + Nuevo paciente
          </button>
        </div>

        {cargando ? (
          <Spinner className="px-5 py-10 text-center" />
        ) : error ? (
          <p className="px-5 py-10 text-center text-sm text-crit">{error}</p>
        ) : filtrados.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-muted">
            {termino ? 'Sin resultados para la búsqueda.' : 'Aún no hay pacientes.'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr className="border-b border-line">
                <th className="px-5 py-3 font-medium">Paciente</th>
                <th className="px-5 py-3 font-medium">Cédula</th>
                <th className="px-5 py-3 font-medium">Teléfono</th>
                <th className="px-5 py-3 font-medium">Edad</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtrados.map((p) => (
                <tr key={p.id} className="hover:bg-surface-plane">
                  <td className="px-5 py-3 font-medium">{p.nombre_completo}</td>
                  <td className="tnum px-5 py-3 text-ink-2">
                    {p.cedula ?? <span className="italic text-ink-muted">Sin cédula</span>}
                  </td>
                  <td className="tnum px-5 py-3 text-ink-2">{p.telefono ?? '—'}</td>
                  <td className="tnum px-5 py-3 text-ink-2">{p.edad ?? '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <Link to={`/pacientes/${p.id}`} className="text-brand hover:underline">
                      Ver ficha
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {creando && (
        <FormularioPaciente
          onCerrar={() => setCreando(false)}
          onGuardado={() => {
            setCreando(false)
            cargar()
          }}
        />
      )}
    </div>
  )
}
