import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { hoyISO } from '../utils/fecha'
import Campo from '../components/molecules/Campo'
import Input from '../components/atoms/Input'
import Boton from '../components/atoms/Boton'
import Tarjeta from '../components/atoms/Tarjeta'
import CamposCita from '../components/molecules/CamposCita'

export default function NuevaCitaPage() {
  const navigate = useNavigate()
  const [medicos, setMedicos] = useState([])
  const [servicios, setServicios] = useState([])

  const [form, setForm] = useState({
    nombre_completo: '',
    edad: '',
    medico_id: '',
    servicio_id: '',
    fecha: hoyISO(),
    hora: '09:00',
    duracion_min: 30,
    motivo: '',
    permitir_sobrecupo: false,
  })
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  useEffect(() => {
    async function cargar() {
      try {
        const [ms, ss] = await Promise.all([api.get('/medicos'), api.get('/servicios')])
        setMedicos(ms)
        setServicios(ss)
      } catch {
        setError({ mensaje: 'No se pudieron cargar médicos y servicios.' })
      }
    }
    cargar()
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)

    const minutos = Number(form.hora.slice(3, 5))
    if (minutos % 15 !== 0) {
      setError({ mensaje: 'La hora debe empezar en :00, :15, :30 o :45.' })
      return
    }

    setGuardando(true)
    const cuerpo = {
      nombre_completo: form.nombre_completo.trim(),
      edad: Number(form.edad),
      medico_id: form.medico_id,
      servicio_id: form.servicio_id,
      starts_at: `${form.fecha}T${form.hora}:00`,
      duracion_min: Number(form.duracion_min),
      motivo: form.motivo.trim() || null,
      permitir_sobrecupo: form.permitir_sobrecupo,
    }

    try {
      await api.post('/citas', cuerpo)
      navigate('/agenda')
    } catch (err) {
      if (err instanceof ApiError) {
        const candidatos = err.detail?.candidatos
        setError({ mensaje: err.message, candidatos })
      } else {
        setError({ mensaje: 'No se pudo agendar la cita.' })
      }
      setGuardando(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Tarjeta>
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold">Nueva cita</h2>
          <p className="text-xs text-ink-muted">
            Si el paciente no existe, se crea automáticamente al guardar.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-lg border border-crit/30 bg-crit/5 p-3 text-sm">
              <p className="font-medium text-crit">{error.mensaje}</p>
              {error.candidatos && (
                <ul className="mt-1 list-inside list-disc text-ink-2">
                  {error.candidatos.map((c) => (
                    <li key={c.id}>
                      {c.nombre_completo} · {c.edad} años
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Campo label="Paciente (nombre completo)">
                <Input
                  value={form.nombre_completo}
                  onChange={(e) => set('nombre_completo', e.target.value)}
                  required
                  autoFocus
                />
              </Campo>
            </div>
            <Campo label="Edad">
              <Input
                type="number"
                min="0"
                max="120"
                value={form.edad}
                onChange={(e) => set('edad', e.target.value)}
                required
              />
            </Campo>
          </div>

          <CamposCita form={form} set={set} medicos={medicos} servicios={servicios} />

          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <Boton variante="secundario" type="button" onClick={() => navigate(-1)}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar cita'}
            </Boton>
          </div>
        </form>
      </Tarjeta>
    </div>
  )
}
