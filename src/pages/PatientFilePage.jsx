import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../config/api'
import StatusBadge from '../components/molecules/StatusBadge'
import PatientForm from '../components/organisms/PatientForm'
import { formatShortDate, formatTime } from '../utils/date'
import { indexBy } from '../utils/data'
import Avatar from '../components/atoms/Avatar'
import Spinner from '../components/atoms/Spinner'
import Alert from '../components/atoms/Alert'
import Card from '../components/atoms/Card'
import Button from '../components/atoms/Button'
import ListMessage from '../components/atoms/ListMessage'
import DataRow from '../components/molecules/DataRow'

export default function PatientFilePage() {
  const { id } = useParams()
  const [paciente, setPaciente] = useState(null)
  const [citas, setCitas] = useState([])
  const [medicos, setMedicos] = useState({})
  const [servicios, setServicios] = useState({})
  const [tab, setTab] = useState('datos')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [pac, hist, listaMedicos, listaServicios] = await Promise.all([
        api.get(`/pacientes/${id}`),
        api.get(`/pacientes/${id}/citas`),
        api.get('/medicos'),
        api.get('/servicios'),
      ])
      setPaciente(pac)
      setCitas(hist)
      setMedicos(indexBy(listaMedicos, 'nombre_completo'))
      setServicios(indexBy(listaServicios, 'nombre'))
    } catch {
      setError('No se pudo cargar la ficha del paciente.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <Spinner />
  if (error) return <Alert>{error}</Alert>
  if (!paciente) return null

  return (
    <div>
      <Link to="/pacientes" className="mb-4 flex items-center gap-1.5 text-sm text-ink-2 hover:text-brand">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Volver a Pacientes
      </Link>

      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={paciente.nombre_completo} size="lg" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{paciente.nombre_completo}</h2>
            <p className="text-sm text-ink-2">
              {paciente.cedula ?? 'Sin cédula'}
              {paciente.edad != null && ` · ${paciente.edad} años`}
            </p>
          </div>
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Editar
          </Button>
        </div>
      </Card>

      <div className="mb-4 flex gap-1 border-b border-line text-sm">
        <button
          onClick={() => setTab('datos')}
          className={`-mb-px border-b-2 px-4 py-2 ${
            tab === 'datos'
              ? 'border-brand font-medium text-brand-dark'
              : 'border-transparent text-ink-2 hover:text-ink'
          }`}
        >
          Datos personales
        </button>
        <button
          onClick={() => setTab('citas')}
          className={`-mb-px border-b-2 px-4 py-2 ${
            tab === 'citas'
              ? 'border-brand font-medium text-brand-dark'
              : 'border-transparent text-ink-2 hover:text-ink'
          }`}
        >
          Historial de citas
        </button>
      </div>

      {tab === 'datos' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Identificación
            </h3>
            <dl className="space-y-2 text-sm">
              <DataRow label="Cédula" value={paciente.cedula} />
              <DataRow
                label="Fecha de nacimiento"
                value={paciente.fecha_nacimiento && formatShortDate(paciente.fecha_nacimiento)}
              />
              <DataRow label="Edad" value={paciente.edad != null ? `${paciente.edad} años` : null} />
            </dl>
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Contacto
            </h3>
            <dl className="space-y-2 text-sm">
              <DataRow label="Teléfono" value={paciente.telefono} />
            </dl>
          </Card>
        </div>
      )}

      {tab === 'citas' && (
        <Card>
          {citas.length === 0 ? (
            <ListMessage>Este paciente no tiene citas registradas.</ListMessage>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr className="border-b border-line">
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Médico</th>
                  <th className="px-5 py-3 font-medium">Servicio</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {citas.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-plane">
                    <td className="tnum px-5 py-3">
                      {formatShortDate(c.starts_at)} · {formatTime(c.starts_at)}
                    </td>
                    <td className="px-5 py-3">{medicos[c.medico_id] ?? 'Médico'}</td>
                    <td className="px-5 py-3 text-ink-2">{servicios[c.servicio_id] ?? 'Servicio'}</td>
                    <td className="px-5 py-3">
                      <StatusBadge estado={c.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {editing && (
        <PatientForm
          paciente={paciente}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false)
            load()
          }}
        />
      )}
    </div>
  )
}
