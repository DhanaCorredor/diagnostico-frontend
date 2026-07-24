import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../config/api'
import FormularioPaciente from '../components/organisms/FormularioPaciente'
import Boton from '../components/atoms/Boton'
import BarraBusqueda from '../components/molecules/BarraBusqueda'
import Tabla from '../components/molecules/Tabla'

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      setPacientes(await api.get('/pacientes'))
    } catch {
      setError('No se pudieron load los pacientes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const term = search.trim().toLowerCase()
  const filtered = term
    ? pacientes.filter(
        (p) =>
          p.nombre_completo.toLowerCase().includes(term) ||
          (p.cedula ?? '').toLowerCase().includes(term),
      )
    : pacientes

  const columns = [
    { header: 'Paciente', className: 'font-medium', render: (p) => p.nombre_completo },
    {
      header: 'Cédula',
      className: 'tnum text-ink-2',
      render: (p) => p.cedula ?? <span className="italic text-ink-muted">Sin cédula</span>,
    },
    { header: 'Teléfono', className: 'tnum text-ink-2', render: (p) => p.telefono ?? '—' },
    { header: 'Edad', className: 'tnum text-ink-2', render: (p) => p.edad ?? '—' },
    {
      header: '',
      className: 'text-right',
      render: (p) => (
        <Link to={`/pacientes/${p.id}`} className="text-brand hover:underline">
          Ver ficha
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <BarraBusqueda
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre o cédula…"
        className="max-w-sm"
      />

      <Tabla
        title="Pacientes"
        count={filtered.length}
        action={
          <Boton size="sm" onClick={() => setCreating(true)}>
            + Nuevo paciente
          </Boton>
        }
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        empty={term ? 'Sin resultados para la búsqueda.' : 'Aún no hay pacientes.'}
      />

      {creating && (
        <FormularioPaciente
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            load()
          }}
        />
      )}
    </div>
  )
}
