export default function MensajeLista({ tipo = 'vacio', children }) {
  const color = tipo === 'error' ? 'text-crit' : 'text-ink-muted'
  return <p className={`px-5 py-10 text-center text-sm ${color}`}>{children}</p>
}
