export default function ErrorCita({ error }) {
  if (!error) return null
  return (
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
}
