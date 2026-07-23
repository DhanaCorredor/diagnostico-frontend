export default function Dato({ etiqueta, valor, tnum = false }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-2">{etiqueta}</dt>
      <dd className={`font-medium ${tnum ? 'tnum' : ''}`}>{valor ?? '—'}</dd>
    </div>
  )
}
