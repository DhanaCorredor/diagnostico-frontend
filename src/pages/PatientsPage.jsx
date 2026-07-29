import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../config/api'
import PatientForm from '../components/organisms/PatientForm'
import Button from '../components/atoms/Button'
import Alert from '../components/atoms/Alert'
import Modal from '../components/molecules/Modal'
import SearchBar from '../components/molecules/SearchBar'
import Table from '../components/molecules/Table'

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setPatients(await api.get('/pacientes'))
    } catch {
      setError('No se pudieron cargar los pacientes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function closeDeleteDialog() {
    setDeleting(null)
    setDeleteError('')
  }

  async function deletePatient() {
    setBusy(true)
    setDeleteError('')
    try {
      await api.del(`/pacientes/${deleting.id}`)
      closeDeleteDialog()
      load()
    } catch {
      setDeleteError('No se pudo eliminar el paciente.')
    } finally {
      setBusy(false)
    }
  }

  const term = search.trim().toLowerCase()
  const filtered = term
    ? patients.filter(
        (patient) =>
          patient.nombre_completo.toLowerCase().includes(term) ||
          (patient.cedula ?? '').toLowerCase().includes(term),
      )
    : patients

  const columns = [
    { header: 'Paciente', className: 'font-medium', render: (patient) => patient.nombre_completo },
    {
      header: 'Cédula',
      className: 'tnum text-ink-2',
      render: (patient) =>
        patient.cedula ?? <span className="italic text-ink-muted">Sin cédula</span>,
    },
    { header: 'Teléfono', className: 'tnum text-ink-2', render: (patient) => patient.telefono ?? '—' },
    { header: 'Edad', className: 'tnum text-ink-2', render: (patient) => patient.edad ?? '—' },
    {
      header: '',
      className: 'text-right',
      render: (patient) => (
        <div className="flex justify-end gap-3">
          <Link to={`/pacientes/${patient.id}`} className="text-brand hover:underline">
            Ver ficha
          </Link>
          <button onClick={() => setDeleting(patient)} className="text-crit hover:underline">
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
          onClose={closeDeleteDialog}
          footer={
            <>
              <Button variant="secondary" onClick={closeDeleteDialog} disabled={busy}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={deletePatient} disabled={busy}>
                {busy ? 'Eliminando…' : 'Eliminar'}
              </Button>
            </>
          }
        >
          {deleteError && <Alert>{deleteError}</Alert>}
          <p className="text-sm text-ink-2">
            ¿Seguro que quieres eliminar a{' '}
            <span className="font-medium text-ink">{deleting.nombre_completo}</span>?
          </p>
        </Modal>
      )}
    </div>
  )
}
