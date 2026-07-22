import Avatar from '../atoms/Avatar'
import Badge from '../atoms/Badge'
import Tarjeta from '../atoms/Tarjeta'

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
    return { horario, dias: etiquetaDias }
  })
}

export default function TarjetaMedico({ medico, disponibilidad }) {
  const franjas = resumirFranjas(disponibilidad)

  return (
    <Tarjeta className="p-5">
      <div className="flex items-center gap-3">
        <Avatar nombre={medico.nombre_completo} />
        <div>
          <p className="font-medium">{medico.nombre_completo}</p>
          <p className="text-xs text-ink-muted">
            {medico.especialidades.length === 1
              ? '1 especialidad'
              : `${medico.especialidades.length} especialidades`}
          </p>
        </div>
      </div>

      {medico.especialidades.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {medico.especialidades.map((e) => (
            <Badge key={e.id} color="brand" tamano="sm">
              {e.nombre}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-line pt-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          Disponibilidad
        </p>
        {franjas.length === 0 ? (
          <p className="text-sm text-ink-muted">Sin disponibilidad definida.</p>
        ) : (
          <div className="space-y-1.5 text-sm">
            {franjas.map((f) => (
              <div key={f.horario} className="flex justify-between">
                <span className="text-ink-2">{f.dias}</span>
                <span className="tnum text-ink-muted">{f.horario}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Tarjeta>
  )
}
