import Campo from './Campo'
import Input from '../atoms/Input'
import Select from '../atoms/Select'

const DURACIONES = [15, 30, 45, 60, 90]

export default function CamposCita({ form, set, medicos, servicios }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Médico">
          <Select value={form.medico_id} onChange={(e) => set('medico_id', e.target.value)} required>
            <option value="">Selecciona…</option>
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre_completo}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo label="Servicio">
          <Select value={form.servicio_id} onChange={(e) => set('servicio_id', e.target.value)} required>
            <option value="">Selecciona…</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </Select>
        </Campo>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Campo label="Fecha">
          <Input type="date" value={form.fecha} onChange={(e) => set('fecha', e.target.value)} required />
        </Campo>
        <Campo label="Hora" hint=":00 · :15 · :30 · :45">
          <Input type="time" step="900" value={form.hora} onChange={(e) => set('hora', e.target.value)} required />
        </Campo>
        <Campo label="Duración">
          <Select value={form.duracion_min} onChange={(e) => set('duracion_min', e.target.value)}>
            {DURACIONES.map((d) => (
              <option key={d} value={d}>
                {d} min
              </option>
            ))}
          </Select>
        </Campo>
      </div>

      <Campo label="Motivo (opcional)">
        <Input value={form.motivo} onChange={(e) => set('motivo', e.target.value)} />
      </Campo>

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
