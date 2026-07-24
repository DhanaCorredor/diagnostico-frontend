const TYPES = {
  error: 'bg-crit/10 text-crit',
  success: 'bg-good/10 text-good',
  info: 'bg-surface-plane text-ink-2',
}

export default function Alerta({ type = 'error', className = '', children }) {
  return (
    <p className={`rounded-lg px-3 py-2 text-sm ${TYPES[type]} ${className}`}>{children}</p>
  )
}
