const COLORES = {
  brand: 'bg-brand-light text-brand-dark',
  good: 'bg-good/10 text-good',
  warn: 'bg-warn/10 text-[#8a6100]',
  crit: 'bg-crit/10 text-crit',
  muted: 'bg-ink-muted/10 text-ink-2',
  aqua: 'bg-[#eef4e3] text-aqua',
  neutral: 'bg-surface-plane text-ink-2',
}

const TAMANOS = {
  sm: 'px-2 py-0.5',
  md: 'px-2.5 py-1',
}

export default function Badge({ color = 'neutral', tamano = 'md', className = '', children }) {
  return (
    <span className={`rounded-full text-xs font-medium ${COLORES[color]} ${TAMANOS[tamano]} ${className}`}>
      {children}
    </span>
  )
}
