import { useState } from 'react'
import { api, ApiError } from '../../api/client'
import { formatFechaCorta, formatHora } from '../../utils/fecha'
import { indexarPor } from '../../utils/datos'
import EstadoBadge from '../molecules/EstadoBadge'
import Modal from '../molecules/Modal'
import Boton from '../atoms/Boton'
import CamposCita from '../molecules/CamposCita'

const ESTADOS_ACTIVOS = ['SCHEDULED', 'CONFIRMED']

function duracionDe(cita) {
  return Math.round((new Date(cita.ends_at) - new Date(cita.starts_at)) / 60000)
}

export default function DetalleCita({
  cita,
  nombrePaciente,
  medicos,
  servicios,
  puedeGestionar,
  onCerrar,
  onActualizada,
}) {
  const medicosMap = indexarPor(medicos, 'nombre_completo')
  const serviciosMap = indexarPor(servicios, 'nombre')

  const [editando, setEditando] = useState(false)
  const [error, setError] = useState(null)
  const [ocupado, setOcupado] = useState(false)

  const activa = ESTADOS_ACTIVOS.includes(cita.estado)

  const [form, setForm] = useState({
    medico_id: cita.medico_id,
    servicio_id: cita.servicio_id,
    fecha: cita.starts_at.slice(0, 10),
    hora: cita.starts_at.slice(11, 16),
    duracion_min: duracionDe(cita),
    motivo: cita.motivo ?? '',
    permitir_sobrecupo: false,
  })
  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function ejecutar(accion) {
    setError(null)
    setOcupado(true)
    try {
      await accion()
      onActualizada()
    } catch (err) {
      if (err instanceof ApiError) setError({ mensaje: err.message, candidatos: err.detail?.candidatos })
      else setError({ mensaje: 'No se pudo completar la acción.' })
      setOcupado(false)
    }
  }

  function cancelar() {
    ejecutar(() => api.post(`/citas/${cita.id}/cancelar`))
  }
  function marcarAsistencia(estado) {
    ejecutar(() => api.post(`/citas/${cita.id}/asistencia`, { estado }))
  }
  function guardarEdicion(e) {
    e.preventDefault()
    if (Number(form.hora.slice(3, 5)) % 15 !== 0) {
      setError({ mensaje: 'La hora debe empezar en :00, :15, :30 o :45.' })
      return
    }
    ejecutar(() =>
      api.put(`/citas/${cita.id}`, {
        medico_id: form.medico_id,
        servicio_id: form.servicio_id,
        starts_at: `${form.fecha}T${form.hora}:00`,
        duracion_min: Number(form.duracion_min),
        motivo: form.motivo.trim() || null,
        permitir_sobrecupo: form.permitir_sobrecupo,
      }),
    )
  }

  const cajaError = error && (
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
  )

  if (editando) {
    const footer = (
      <>
        <Boton variante="secundario" type="button" onClick={() => setEditando(false)}>
          Volver
        </Boton>
        <Boton type="submit" form="form-editar-cita" disabled={ocupado}>
          {ocupado ? 'Guardando…' : 'Guardar cambios'}
        </Boton>
      </>
    )
    return (
      <Modal titulo="Editar cita" subtitulo="Se revalidan disponibilidad y solapamientos." onClose={onCerrar} footer={footer}>
        <form id="form-editar-cita" onSubmit={guardarEdicion} className="space-y-4">
          {cajaError}
          <CamposCita form={form} set={set} medicos={medicos} servicios={servicios} />
        </form>
      </Modal>
    )
  }

  const footer = puedeGestionar && activa && (
    <>
      <Boton variante="secundario" tamano="sm" onClick={() => marcarAsistencia('NO_SHOW')} disabled={ocupado}>
        No asistió
      </Boton>
      <Boton variante="exito" tamano="sm" onClick={() => marcarAsistencia('COMPLETED')} disabled={ocupado}>
        Atendida
      </Boton>
      <Boton variante="peligro" tamano="sm" onClick={cancelar} disabled={ocupado}>
        Cancelar cita
      </Boton>
      <Boton
        tamano="sm"
        onClick={() => {
          setError(null)
          setEditando(true)
        }}
        disabled={ocupado}
      >
        Editar
      </Boton>
    </>
  )

  return (
    <Modal titulo="Detalle de la cita" onClose={onCerrar} footer={footer || undefined}>
      {cajaError}
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">{nombrePaciente ?? 'Paciente'}</p>
        <EstadoBadge estado={cita.estado} />
      </div>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-2">Médico</dt>
          <dd className="font-medium">{medicosMap[cita.medico_id] ?? '—'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-2">Servicio</dt>
          <dd className="font-medium">{serviciosMap[cita.servicio_id] ?? '—'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-2">Fecha</dt>
          <dd className="font-medium">{formatFechaCorta(cita.starts_at)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-2">Horario</dt>
          <dd className="tnum font-medium">
            {formatHora(cita.starts_at)}–{formatHora(cita.ends_at)}
          </dd>
        </div>
        {cita.motivo && (
          <div className="flex justify-between">
            <dt className="text-ink-2">Motivo</dt>
            <dd className="font-medium">{cita.motivo}</dd>
          </div>
        )}
      </dl>
      {!activa && (
        <p className="rounded-lg bg-surface-plane px-3 py-2 text-xs text-ink-muted">
          Esta cita ya está cerrada; no admite cambios.
        </p>
      )}
    </Modal>
  )
}
