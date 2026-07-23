import Tarjeta from '../atoms/Tarjeta'
import Spinner from '../atoms/Spinner'
import MensajeLista from '../atoms/MensajeLista'

export default function Tabla({ titulo, contador, accion, columnas, filas, cargando, error, vacio }) {
  return (
    <Tarjeta>
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="font-semibold">
          {titulo}
          {contador != null && (
            <span className="ml-1 text-sm font-normal text-ink-muted">({contador})</span>
          )}
        </h2>
        {accion}
      </div>

      {cargando ? (
        <Spinner className="px-5 py-10 text-center" />
      ) : error ? (
        <MensajeLista tipo="error">{error}</MensajeLista>
      ) : filas.length === 0 ? (
        <MensajeLista>{vacio}</MensajeLista>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-ink-muted">
            <tr className="border-b border-line">
              {columnas.map((c, i) => (
                <th key={i} className={`px-5 py-3 font-medium ${c.thClassName ?? ''}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filas.map((fila) => (
              <tr key={fila.id} className="hover:bg-surface-plane">
                {columnas.map((c, i) => (
                  <td key={i} className={`px-5 py-3 ${c.className ?? ''}`}>{c.render(fila)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Tarjeta>
  )
}
