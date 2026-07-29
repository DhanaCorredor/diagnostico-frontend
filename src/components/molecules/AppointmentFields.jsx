import Field from './Field'
import Input from '../atoms/Input'
import Select from '../atoms/Select'

const DURATIONS = [15, 30, 45, 60, 90]

function servicesForDoctor(services, doctor) {
  const doctorSpecialtyIds = doctor?.especialidades?.map((specialty) => specialty.id) ?? []
  const hasSpecialtyData = services.some((service) => service.especialidades?.length)
  if (!hasSpecialtyData || doctorSpecialtyIds.length === 0) return services
  return services.filter((service) =>
    (service.especialidades ?? []).some((specialty) => doctorSpecialtyIds.includes(specialty.id)),
  )
}

export default function AppointmentFields({ form, set, doctors, services }) {
  const doctor = doctors.find((candidate) => candidate.id === form.medico_id)
  const availableServices = servicesForDoctor(services, doctor)

  function selectDoctor(doctorId) {
    set('medico_id', doctorId)
    set('servicio_id', '')
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Médico">
          <Select
            value={form.medico_id}
            onChange={(event) => selectDoctor(event.target.value)}
            required
          >
            <option value="">Selecciona…</option>
            {doctors.map((option) => (
              <option key={option.id} value={option.id}>
                {option.nombre_completo}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Servicio">
          <Select
            value={form.servicio_id}
            onChange={(event) => set('servicio_id', event.target.value)}
            required
            disabled={!form.medico_id}
          >
            <option value="">{form.medico_id ? 'Selecciona…' : 'Elige un médico primero'}</option>
            {availableServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.nombre}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Fecha">
          <Input
            type="date"
            value={form.date}
            onChange={(event) => set('date', event.target.value)}
            required
          />
        </Field>
        <Field label="Hora" hint=":00 · :15 · :30 · :45">
          <Input
            type="time"
            step="900"
            value={form.time}
            onChange={(event) => set('time', event.target.value)}
            required
          />
        </Field>
        <Field label="Duración">
          <Select
            value={form.duracion_min}
            onChange={(event) => set('duracion_min', event.target.value)}
          >
            {DURATIONS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} min
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Motivo (opcional)">
        <Input value={form.motivo} onChange={(event) => set('motivo', event.target.value)} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input
          type="checkbox"
          checked={form.permitir_sobrecupo}
          onChange={(event) => set('permitir_sobrecupo', event.target.checked)}
          className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
        />
        Forzar cupo extra (sobrecupo)
      </label>
    </>
  )
}
