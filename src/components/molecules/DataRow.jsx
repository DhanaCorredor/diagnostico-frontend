export default function DataRow({ label, value, tnum = false }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-2">{label}</dt>
      <dd className={`font-medium ${tnum ? 'tnum' : ''}`}>{value ?? '—'}</dd>
    </div>
  )
}
