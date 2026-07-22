import { iniciales } from '../../utils/texto'

const TAMANOS = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-11 w-11',
  lg: 'h-16 w-16 text-xl',
}

export default function Avatar({ nombre, tamano = 'md' }) {
  return (
    <div
      className={`grid place-items-center rounded-full bg-brand-light font-semibold text-brand-dark ${TAMANOS[tamano]}`}
    >
      {iniciales(nombre)}
    </div>
  )
}
