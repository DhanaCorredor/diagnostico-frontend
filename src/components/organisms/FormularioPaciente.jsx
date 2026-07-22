import { useState } from 'react'
import { api, ApiError } from '../../api/client'
import Modal from '../molecules/Modal'
import Campo from '../molecules/Campo'
import Input from '../atoms/Input'
import Boton from '../atoms/Boton'
import Alerta from '../atoms/Alerta'

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
      <Boton variante="secundario" type="button" onClick={onCerrar}>
        Cancelar
      </Boton>
      <Boton type="submit" form="form-paciente" disabled={guardando}>
        {guardando ? 'Guardando…' : 'Guardar'}
      </Boton>
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
        {error && <Alerta>{error}</Alerta>}

        <Campo label="Nombre completo">
          <Input
            value={form.nombre_completo}
            onChange={(e) => set('nombre_completo', e.target.value)}
            required
            autoFocus
          />
        </Campo>

        <div className="grid grid-cols-2 gap-3">
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
          <Campo label="Cédula (opcional)">
            <Input
              value={form.cedula}
              onChange={(e) => set('cedula', e.target.value)}
              placeholder="V-12.345.678"
            />
          </Campo>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Campo label="Teléfono (opcional)">
            <Input
              value={form.telefono}
              onChange={(e) => set('telefono', e.target.value)}
              placeholder="0414-555-1122"
            />
          </Campo>
          <Campo label="Fecha de nacimiento (opcional)">
            <Input
              type="date"
              value={form.fecha_nacimiento}
              onChange={(e) => set('fecha_nacimiento', e.target.value)}
            />
          </Campo>
        </div>
      </form>
    </Modal>
  )
}
