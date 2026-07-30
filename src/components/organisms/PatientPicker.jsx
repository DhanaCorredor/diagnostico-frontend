import { useEffect, useState } from 'react'
import { api } from '../../config/api'
import { searchPatients } from '../../utils/patients'
import { formatShortDate } from '../../utils/date'
import Field from '../molecules/Field'
import Input from '../atoms/Input'
import Avatar from '../atoms/Avatar'

function LastVisit({ patientId }) {
  const [lastVisit, setLastVisit] = useState(undefined)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const history = await api.get(`/pacientes/${patientId}/citas`)
        if (!cancelled) setLastVisit(history[0]?.starts_at ?? null)
      } catch {
        if (!cancelled) setLastVisit(null)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [patientId])

  if (lastVisit === undefined) return null

  return (
    <p className="text-xs text-ink-muted">
      {lastVisit ? `Última cita: ${formatShortDate(lastVisit)}` : 'Sin citas anteriores'}
    </p>
  )
}

export default function PatientPicker({ patients, selected, onSelect, onClear }) {
  const [term, setTerm] = useState('')

  if (selected) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-plane p-3">
        <Avatar name={selected.nombre_completo} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{selected.nombre_completo}</p>
          <p className="truncate text-xs text-ink-2">
            {selected.cedula ?? 'Sin cédula'}
            {selected.edad != null && ` · ${selected.edad} años`}
            {selected.telefono && ` · ${selected.telefono}`}
          </p>
          <LastVisit patientId={selected.id} />
        </div>
        <button
          type="button"
          onClick={() => {
            setTerm('')
            onClear()
          }}
          className="shrink-0 text-sm text-brand hover:underline"
        >
          Cambiar
        </button>
      </div>
    )
  }

  const matches = searchPatients(patients, term)
  const searching = term.trim().length >= 2

  return (
    <div className="space-y-2">
      <Field label="Buscar paciente" hint="Por nombre, cédula o teléfono.">
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Empieza a escribir…"
          autoFocus
        />
      </Field>

      {searching &&
        (matches.length === 0 ? (
          <p className="px-1 text-sm text-ink-muted">
            Ningún paciente coincide. Si es nuevo, cambia arriba a «Paciente nuevo».
          </p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line">
            {matches.map((patient) => (
              <li key={patient.id}>
                <button
                  type="button"
                  onClick={() => onSelect(patient)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-surface-plane"
                >
                  <span className="min-w-0 truncate text-sm">{patient.nombre_completo}</span>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {patient.cedula ?? patient.telefono ?? '—'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ))}
    </div>
  )
}
