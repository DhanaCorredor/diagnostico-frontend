import Card from '../atoms/Card'

export default function KpiCard({ title, value, note }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-ink-2">{title}</p>
      <p className="tnum mt-2 text-3xl font-semibold">{value}</p>
      {note && <p className="mt-1 text-xs text-ink-muted">{note}</p>}
    </Card>
  )
}
