import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../config/api'
import PatientForm from '../components/organisms/PatientForm'
import Button from '../components/atoms/Button'
import SearchBar from '../components/molecules/SearchBar'
import Table from '../components/molecules/Table'

export default function PatientsPage() {
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
      setError('No se pudieron cargar los pacientes.')
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
      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre o cédula…"
        className="max-w-sm"
      />

      <Table
        title="Pacientes"
        count={filtered.length}
        action={
          <Button size="sm" onClick={() => setCreating(true)}>
            + Nuevo paciente
          </Button>
        }
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        empty={term ? 'Sin resultados para la búsqueda.' : 'Aún no hay pacientes.'}
      />

      {creating && (
        <PatientForm
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
