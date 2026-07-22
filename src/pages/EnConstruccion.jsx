// Placeholder temporal para las vistas que aún no hemos construido.
// Se irá sustituyendo por la página real de cada rama (Pacientes, Médicos, …).

export default function EnConstruccion({ titulo }) {
  return (
    <div className="grid min-h-[50vh] place-items-center rounded-xl border border-dashed border-line bg-white">
      <div className="text-center">
        <p className="text-lg font-semibold text-ink-2">{titulo}</p>
        <p className="mt-1 text-sm text-ink-muted">Vista en construcción 🚧</p>
      </div>
    </div>
  )
}
