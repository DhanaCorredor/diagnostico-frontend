import Field from './Field'
import Input from '../atoms/Input'
import Select from '../atoms/Select'

const DURACIONES = [15, 30, 45, 60, 90]

function serviciosDelMedico(servicios, medico) {
  const especialidadesMedico = medico?.especialidades?.map((e) => e.id) ?? []
  const hayDatosEspecialidad = servicios.some((s) => s.especialidades?.length)
  if (!hayDatosEspecialidad || especialidadesMedico.length === 0) return servicios
  return servicios.filter((s) =>
    (s.especialidades ?? []).some((e) => especialidadesMedico.includes(e.id)),
  )
}

export default function AppointmentFields({ form, set, medicos, servicios }) {
  const medico = medicos.find((m) => m.id === form.medico_id)
  const serviciosFiltrados = serviciosDelMedico(servicios, medico)

  function elegirMedico(medicoId) {
    set('medico_id', medicoId)
    set('servicio_id', '')
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Médico">
          <Select value={form.medico_id} onChange={(e) => elegirMedico(e.target.value)} required>
            <option value="">Selecciona…</option>
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre_completo}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Servicio">
          <Select
            value={form.servicio_id}
            onChange={(e) => set('servicio_id', e.target.value)}
            required
            disabled={!form.medico_id}
          >
            <option value="">
              {form.medico_id ? 'Selecciona…' : 'Elige un médico primero'}
            </option>
            {serviciosFiltrados.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Fecha">
          <Input type="date" value={form.fecha} onChange={(e) => set('fecha', e.target.value)} required />
        </Field>
        <Field label="Hora" hint=":00 · :15 · :30 · :45">
          <Input type="time" step="900" value={form.hora} onChange={(e) => set('hora', e.target.value)} required />
        </Field>
        <Field label="Duración">
          <Select value={form.duracion_min} onChange={(e) => set('duracion_min', e.target.value)}>
            {DURACIONES.map((d) => (
              <option key={d} value={d}>
                {d} min
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Motivo (opcional)">
        <Input value={form.motivo} onChange={(e) => set('motivo', e.target.value)} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input
          type="checkbox"
          checked={form.permitir_sobrecupo}
          onChange={(e) => set('permitir_sobrecupo', e.target.checked)}
          className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
        />
        Forzar cupo extra (sobrecupo)
      </label>
    </>
  )
}
