import Tarjeta from '../atoms/Tarjeta'
import Spinner from '../atoms/Spinner'
import MensajeLista from '../atoms/MensajeLista'

export default function Tabla({ title, count, action, columns, rows, loading, error, empty }) {
  return (
    <Tarjeta>
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="font-semibold">
          {title}
          {count != null && (
            <span className="ml-1 text-sm font-normal text-ink-muted">({count})</span>
          )}
        </h2>
        {action}
      </div>

      {loading ? (
        <Spinner className="px-5 py-10 text-center" />
      ) : error ? (
        <MensajeLista type="error">{error}</MensajeLista>
      ) : rows.length === 0 ? (
        <MensajeLista>{empty}</MensajeLista>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-ink-muted">
            <tr className="border-b border-line">
              {columns.map((c, i) => (
                <th key={i} className={`px-5 py-3 font-medium ${c.thClassName ?? ''}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((fila) => (
              <tr key={fila.id} className="hover:bg-surface-plane">
                {columns.map((c, i) => (
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
