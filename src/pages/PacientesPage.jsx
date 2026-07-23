import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import FormularioPaciente from '../components/organisms/FormularioPaciente'
import Boton from '../components/atoms/Boton'
import BarraBusqueda from '../components/molecules/BarraBusqueda'
import Tabla from '../components/molecules/Tabla'

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

  const columnas = [
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
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre o cédula…"
        className="max-w-sm"
      />

      <Tabla
        titulo="Pacientes"
        contador={filtrados.length}
        accion={
          <Boton tamano="sm" onClick={() => setCreando(true)}>
            + Nuevo paciente
          </Boton>
        }
        columnas={columnas}
        filas={filtrados}
        cargando={cargando}
        error={error}
        vacio={termino ? 'Sin resultados para la búsqueda.' : 'Aún no hay pacientes.'}
      />

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
