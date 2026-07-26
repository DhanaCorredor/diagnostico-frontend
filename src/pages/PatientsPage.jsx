import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../config/api'
import PatientForm from '../components/organisms/PatientForm'
import Button from '../components/atoms/Button'
import Modal from '../components/molecules/Modal'
import SearchBar from '../components/molecules/SearchBar'
import Table from '../components/molecules/Table'

export default function PatientsPage() {
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

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

  async function eliminar() {
    setBusy(true)
    try {
      await api.del(`/pacientes/${deleting.id}`)
      setDeleting(null)
      load()
    } catch {
      setError('No se pudo eliminar el paciente.')
      setDeleting(null)
    } finally {
      setBusy(false)
    }
  }

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
        <div className="flex justify-end gap-3">
          <Link to={`/pacientes/${p.id}`} className="text-brand hover:underline">
            Ver ficha
          </Link>
          <button onClick={() => setDeleting(p)} className="text-crit hover:underline">
            Eliminar
          </button>
        </div>
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

      {deleting && (
        <Modal
          title="Eliminar paciente"
          subtitle="El paciente se dará de baja (baja lógica, recuperable)."
          onClose={() => setDeleting(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleting(null)} disabled={busy}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={eliminar} disabled={busy}>
                {busy ? 'Eliminando…' : 'Eliminar'}
              </Button>
            </>
          }
        >
          <p className="text-sm text-ink-2">
            ¿Seguro que quieres eliminar a{' '}
            <span className="font-medium text-ink">{deleting.nombre_completo}</span>?
          </p>
        </Modal>
      )}
    </div>
  )
}
