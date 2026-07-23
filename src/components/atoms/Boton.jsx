const VARIANTES = {
  primario: 'bg-brand text-white hover:bg-brand-dark',
  secundario: 'border border-line hover:bg-surface-plane',
  peligro: 'border border-crit/40 text-crit hover:bg-crit/5',
  exito: 'border border-good/40 text-good hover:bg-good/5',
}

const TAMANOS = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2',
}

export default function Boton({ variante = 'primario', tamano = 'md', className = '', ...props }) {
  return (
    <button
      className={`rounded-lg text-sm font-semibold transition disabled:opacity-60 ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
      {...props}
    />
  )
}
