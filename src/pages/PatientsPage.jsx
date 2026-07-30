import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errorMessage } from '../config/api'
import PatientForm from '../components/organisms/PatientForm'
import Button from '../components/atoms/Button'
import Alert from '../components/atoms/Alert'
import Input from '../components/atoms/Input'
import Modal from '../components/molecules/Modal'
import Field from '../components/molecules/Field'
import SearchBar from '../components/molecules/SearchBar'
import Table from '../components/molecules/Table'

function normalize(value) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

function describeErasure(name, result) {
  if (result?.resultado === 'anonimizado') {
    const kept = result.citas_conservadas
    return `Se borraron los datos personales de ${name}. Se conservan ${kept} ${
      kept === 1 ? 'cita' : 'citas'
    } como registro sin identificar.`
  }
  if (result?.resultado === 'eliminado') {
    return `${name} se eliminó por completo. No quedaba ninguna cita asociada.`
  }
  return `${name} se eliminó de la lista.`
}

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [confirmName, setConfirmName] = useState('')
  const [busy, setBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [notice, setNotice] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setPatients(await api.get('/pacientes'))
    } catch (err) {
      setError(errorMessage(err, 'No se pudieron cargar los pacientes.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openDeleteDialog(patient) {
    setNotice('')
    setDeleteError('')
    setConfirmName('')
    setDeleting(patient)
  }

  function closeDeleteDialog() {
    setDeleting(null)
    setConfirmName('')
    setDeleteError('')
  }

  async function erasePatient() {
    setBusy(true)
    setDeleteError('')
    const name = deleting.nombre_completo
    try {
      const result = await api.del(`/pacientes/${deleting.id}`)
      closeDeleteDialog()
      setNotice(describeErasure(name, result))
      load()
    } catch (err) {
      setDeleteError(errorMessage(err, 'No se pudo eliminar el paciente.'))
    } finally {
      setBusy(false)
    }
  }

  const confirmed = deleting != null && normalize(confirmName) === normalize(deleting.nombre_completo)

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
    {
      header: 'Teléfono',
      className: 'tnum text-ink-2',
      render: (patient) => patient.telefono ?? '—',
    },
    { header: 'Edad', className: 'tnum text-ink-2', render: (patient) => patient.edad ?? '—' },
    {
      header: '',
      className: 'text-right',
      render: (patient) => (
        <div className="flex justify-end gap-3">
          <Link to={`/pacientes/${patient.id}`} className="text-brand hover:underline">
            Ver ficha
          </Link>
          <button onClick={() => openDeleteDialog(patient)} className="text-crit hover:underline">
            Eliminar
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {notice && <Alert type="success">{notice}</Alert>}

      <SearchBar
        value={search}
        onChange={(event) => setSearch(event.target.value)}
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
          title="Eliminar paciente definitivamente"
          subtitle="Esta acción no se puede deshacer."
          onClose={closeDeleteDialog}
          footer={
            <>
              <Button variant="secondary" onClick={closeDeleteDialog} disabled={busy}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={erasePatient} disabled={busy || !confirmed}>
                {busy ? 'Eliminando…' : 'Eliminar definitivamente'}
              </Button>
            </>
          }
        >
          {deleteError && <Alert>{deleteError}</Alert>}

          <p className="text-sm text-ink-2">
            Vas a borrar los datos personales de{' '}
            <span className="font-medium text-ink">{deleting.nombre_completo}</span>. No se pueden
            recuperar.
          </p>

          <ul className="list-inside list-disc space-y-1 text-sm text-ink-2">
            <li>Si no tiene citas, el paciente se elimina por completo.</li>
            <li>
              Si tiene citas, se borran nombre, cédula, teléfono y fecha de nacimiento, y las citas
              se conservan como registro sin identificar.
            </li>
          </ul>

          <Field label="Escribe el nombre del paciente para confirmar">
            <Input
              value={confirmName}
              onChange={(event) => setConfirmName(event.target.value)}
              placeholder={deleting.nombre_completo}
              autoFocus
            />
          </Field>
        </Modal>
      )}
    </div>
  )
}
