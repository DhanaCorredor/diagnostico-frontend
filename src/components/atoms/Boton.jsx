const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'border border-line hover:bg-surface-plane',
  danger: 'border border-crit/40 text-crit hover:bg-crit/5',
  success: 'border border-good/40 text-good hover:bg-good/5',
}

const SIZES = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2',
}

export default function Boton({ variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button
      className={`rounded-lg text-sm font-semibold transition disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  )
}
