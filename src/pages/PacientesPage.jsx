import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import FormularioPaciente from '../components/organisms/FormularioPaciente'
import Spinner from '../components/atoms/Spinner'
import Tarjeta from '../components/atoms/Tarjeta'
import Boton from '../components/atoms/Boton'
import BarraBusqueda from '../components/molecules/BarraBusqueda'

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
      <BarraBusqueda
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre o cédula…"
        className="max-w-sm"
      />

      <Tarjeta>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-semibold">
            Pacientes <span className="ml-1 text-sm font-normal text-ink-muted">({filtrados.length})</span>
          </h2>
          <Boton tamano="sm" onClick={() => setCreando(true)}>
            + Nuevo paciente
          </Boton>
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
      </Tarjeta>

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
