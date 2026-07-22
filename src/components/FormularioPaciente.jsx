import { useState } from 'react'
import { api, ApiError } from '../api/client'
import Modal from './Modal'
import Campo, { claseInput } from './Campo'

export default function FormularioPaciente({ paciente, onCerrar, onGuardado }) {
  const editando = Boolean(paciente)

  const [form, setForm] = useState({
    nombre_completo: paciente?.nombre_completo ?? '',
    edad: paciente?.edad ?? '',
    cedula: paciente?.cedula ?? '',
    telefono: paciente?.telefono ?? '',
    fecha_nacimiento: paciente?.fecha_nacimiento ?? '',
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)

    const cuerpo = {
      nombre_completo: form.nombre_completo.trim(),
      edad: Number(form.edad),
      cedula: form.cedula.trim() || null,
      telefono: form.telefono.trim() || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
    }

    try {
      const guardado = editando
        ? await api.put(`/pacientes/${paciente.id}`, cuerpo)
        : await api.post('/pacientes', cuerpo)
      onGuardado(guardado)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('No se pudo guardar el paciente.')
      setGuardando(false)
    }
  }

  const footer = (
    <>
      <button
        type="button"
        onClick={onCerrar}
        className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-surface-plane"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="form-paciente"
        disabled={guardando}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {guardando ? 'Guardando…' : 'Guardar'}
      </button>
    </>
  )

  return (
    <Modal
      titulo={editando ? 'Editar paciente' : 'Nuevo paciente'}
      subtitulo="Nombre y edad son obligatorios. La cédula es opcional."
      onClose={onCerrar}
      footer={footer}
    >
      <form id="form-paciente" onSubmit={onSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-crit/10 px-3 py-2 text-sm text-crit">{error}</p>}

        <Campo label="Nombre completo">
          <input
            value={form.nombre_completo}
            onChange={(e) => set('nombre_completo', e.target.value)}
            required
            autoFocus
            className={claseInput}
          />
        </Campo>

        <div className="grid grid-cols-2 gap-3">
          <Campo label="Edad">
            <input
              type="number"
              min="0"
              max="120"
              value={form.edad}
              onChange={(e) => set('edad', e.target.value)}
              required
              className={claseInput}
            />
          </Campo>
          <Campo label="Cédula (opcional)">
            <input
              value={form.cedula}
              onChange={(e) => set('cedula', e.target.value)}
              placeholder="V-12.345.678"
              className={claseInput}
            />
          </Campo>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Campo label="Teléfono (opcional)">
            <input
              value={form.telefono}
              onChange={(e) => set('telefono', e.target.value)}
              placeholder="0414-555-1122"
              className={claseInput}
            />
          </Campo>
          <Campo label="Fecha de nacimiento (opcional)">
            <input
              type="date"
              value={form.fecha_nacimiento}
              onChange={(e) => set('fecha_nacimiento', e.target.value)}
              className={claseInput}
            />
          </Campo>
        </div>
      </form>
    </Modal>
  )
}
