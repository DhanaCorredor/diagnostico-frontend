import { useEffect, useState } from 'react'
import { api } from '../api/client'
import Avatar from '../components/atoms/Avatar'
import Badge from '../components/atoms/Badge'
import Tabla from '../components/molecules/Tabla'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function resumirFranjas(franjas) {
  const grupos = {}
  for (const f of franjas) {
    const horario = `${f.hora_inicio.slice(0, 5)}–${f.hora_fin.slice(0, 5)}`
    ;(grupos[horario] ??= []).push(f.dia_semana)
  }
  return Object.entries(grupos).map(([horario, dias]) => {
    const ordenados = [...new Set(dias)].sort((a, b) => a - b)
    const consecutivos = ordenados[ordenados.length - 1] - ordenados[0] === ordenados.length - 1
    const etiquetaDias =
      ordenados.length > 1 && consecutivos
        ? `${DIAS[ordenados[0]]}–${DIAS[ordenados[ordenados.length - 1]]}`
        : ordenados.map((d) => DIAS[d]).join(', ')
    return `${etiquetaDias} · ${horario}`
  })
}

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

  const columnas = [
    {
      header: 'Médico',
      className: 'font-medium',
      render: (m) => (
        <div className="flex items-center gap-2">
          <Avatar nombre={m.nombre_completo} tamano="sm" />
          {m.nombre_completo}
        </div>
      ),
    },
    {
      header: 'Especialidades',
      render: (m) => (
        <div className="flex flex-wrap gap-1">
          {m.especialidades.map((e) => (
            <Badge key={e.id} color="brand" tamano="sm">
              {e.nombre}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: 'Disponibilidad',
      className: 'text-ink-2',
      render: (m) => {
        const franjas = resumirFranjas(dispPorMedico[m.id] ?? [])
        return franjas.length === 0 ? (
          <span className="text-ink-muted">Sin definir</span>
        ) : (
          <div className="space-y-0.5">
            {franjas.map((f) => (
              <div key={f} className="tnum">
                {f}
              </div>
            ))}
          </div>
        )
      },
    },
  ]

  return (
    <Tabla
      titulo="Médicos"
      contador={medicos.length}
      columnas={columnas}
      filas={medicos}
      cargando={cargando}
      error={error}
      vacio="No hay médicos registrados."
    />
  )
}
