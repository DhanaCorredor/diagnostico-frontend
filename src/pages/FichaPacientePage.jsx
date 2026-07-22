import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import EstadoBadge from '../components/molecules/EstadoBadge'
import FormularioPaciente from '../components/organisms/FormularioPaciente'
import { formatFechaCorta, formatHora } from '../utils/fecha'
import { indexarPor } from '../utils/datos'
import Avatar from '../components/atoms/Avatar'
import Spinner from '../components/atoms/Spinner'
import Alerta from '../components/atoms/Alerta'
import Tarjeta from '../components/atoms/Tarjeta'
import Boton from '../components/atoms/Boton'

function Dato({ etiqueta, valor }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-2">{etiqueta}</dt>
      <dd className="font-medium">{valor ?? '—'}</dd>
    </div>
  )
}

export default function FichaPacientePage() {
  const { id } = useParams()
  const [paciente, setPaciente] = useState(null)
  const [citas, setCitas] = useState([])
  const [medicos, setMedicos] = useState({})
  const [servicios, setServicios] = useState({})
  const [tab, setTab] = useState('datos')
  const [editando, setEditando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
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
      setMedicos(indexarPor(listaMedicos, 'nombre_completo'))
      setServicios(indexarPor(listaServicios, 'nombre'))
    } catch {
      setError('No se pudo cargar la ficha del paciente.')
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => {
    cargar()
  }, [cargar])

  if (cargando) return <Spinner />
  if (error) return <Alerta>{error}</Alerta>
  if (!paciente) return null

  return (
    <div>
      <Link to="/pacientes" className="mb-4 flex items-center gap-1.5 text-sm text-ink-2 hover:text-brand">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Volver a Pacientes
      </Link>

      <Tarjeta className="mb-6 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar nombre={paciente.nombre_completo} tamano="lg" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{paciente.nombre_completo}</h2>
            <p className="text-sm text-ink-2">
              {paciente.cedula ?? 'Sin cédula'}
              {paciente.edad != null && ` · ${paciente.edad} años`}
            </p>
          </div>
          <Boton variante="secundario" onClick={() => setEditando(true)}>
            Editar
          </Boton>
        </div>
      </Tarjeta>

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
          <Tarjeta className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Identificación
            </h3>
            <dl className="space-y-2 text-sm">
              <Dato etiqueta="Cédula" valor={paciente.cedula} />
              <Dato
                etiqueta="Fecha de nacimiento"
                valor={paciente.fecha_nacimiento && formatFechaCorta(paciente.fecha_nacimiento)}
              />
              <Dato etiqueta="Edad" valor={paciente.edad != null ? `${paciente.edad} años` : null} />
            </dl>
          </Tarjeta>
          <Tarjeta className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Contacto
            </h3>
            <dl className="space-y-2 text-sm">
              <Dato etiqueta="Teléfono" valor={paciente.telefono} />
            </dl>
          </Tarjeta>
        </div>
      )}

      {tab === 'citas' && (
        <Tarjeta>
          {citas.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-muted">
              Este paciente no tiene citas registradas.
            </p>
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
                      {formatFechaCorta(c.starts_at)} · {formatHora(c.starts_at)}
                    </td>
                    <td className="px-5 py-3">{medicos[c.medico_id] ?? 'Médico'}</td>
                    <td className="px-5 py-3 text-ink-2">{servicios[c.servicio_id] ?? 'Servicio'}</td>
                    <td className="px-5 py-3">
                      <EstadoBadge estado={c.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Tarjeta>
      )}

      {editando && (
        <FormularioPaciente
          paciente={paciente}
          onCerrar={() => setEditando(false)}
          onGuardado={() => {
            setEditando(false)
            cargar()
          }}
        />
      )}
    </div>
  )
}
