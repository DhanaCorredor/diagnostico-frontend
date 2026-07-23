const TIPOS = {
  error: 'bg-crit/10 text-crit',
  exito: 'bg-good/10 text-good',
  info: 'bg-surface-plane text-ink-2',
}

export default function Alerta({ tipo = 'error', className = '', children }) {
  return (
    <p className={`rounded-lg px-3 py-2 text-sm ${TIPOS[tipo]} ${className}`}>{children}</p>
  )
}
