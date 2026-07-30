import Card from '../atoms/Card'
import Spinner from '../atoms/Spinner'
import ListMessage from '../atoms/ListMessage'

export default function Table({ title, count, action, columns, rows, loading, error, empty }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
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
        <ListMessage type="error">{error}</ListMessage>
      ) : rows.length === 0 ? (
        <ListMessage>{empty}</ListMessage>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr className="border-b border-line">
                {columns.map((column, i) => (
                  <th key={i} className={`px-4 py-3 font-medium sm:px-5 ${column.thClassName ?? ''}`}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-plane">
                  {columns.map((column, i) => (
                    <td key={i} className={`px-4 py-3 sm:px-5 ${column.className ?? ''}`}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
