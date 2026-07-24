import { initials } from '../../utils/text'

const SIZES = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-11 w-11',
  lg: 'h-16 w-16 text-xl',
}

export default function Avatar({ name, size = 'md' }) {
  return (
    <div
      className={`grid place-items-center rounded-full bg-brand-light font-semibold text-brand-dark ${SIZES[size]}`}
    >
      {initials(name)}
    </div>
  )
}
