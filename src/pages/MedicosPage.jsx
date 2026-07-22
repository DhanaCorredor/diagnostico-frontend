import { useEffect, useState } from 'react'
import { api } from '../api/client'
import TarjetaMedico from '../components/TarjetaMedico'
import Spinner from '../components/atoms/Spinner'

export default function MedicosPage() {
  const [medicos, setMedicos] = useState([])
  const [dispPorMedico, setDispPorMedico] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargar() {
      setCargando(true)
      setError('')
      try {
        const lista = await api.get('/medicos')
        const franjas = await Promise.all(
          lista.map((m) => api.get(`/disponibilidad?medico_id=${m.id}`)),
        )
        const mapa = {}
        lista.forEach((m, i) => {
          mapa[m.id] = franjas[i]
        })
        setMedicos(lista)
        setDispPorMedico(mapa)
      } catch {
        setError('No se pudieron cargar los médicos.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  if (cargando) return <Spinner />
  if (error) return <p className="rounded-lg bg-crit/10 px-4 py-3 text-crit">{error}</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">
          Médicos <span className="ml-1 text-sm font-normal text-ink-muted">({medicos.length})</span>
        </h2>
        <p className="text-xs text-ink-muted">
          Especialidades y horario de atención de cada médico.
        </p>
      </div>

      {medicos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-white px-5 py-10 text-center text-sm text-ink-muted">
          No hay médicos registrados.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {medicos.map((m) => (
            <TarjetaMedico key={m.id} medico={m} disponibilidad={dispPorMedico[m.id] ?? []} />
          ))}
        </div>
      )}
    </div>
  )
}
