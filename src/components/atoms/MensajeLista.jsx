export default function MensajeLista({ type = 'empty', children }) {
  const color = type === 'error' ? 'text-crit' : 'text-ink-muted'
  return <p className={`px-5 py-10 text-center text-sm ${color}`}>{children}</p>
}
