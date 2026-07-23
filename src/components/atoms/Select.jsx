import { controlBase } from './estilos'

export default function Select({ className = '', children, ...props }) {
  return (
    <select className={`${controlBase} ${className}`} {...props}>
      {children}
    </select>
  )
}
