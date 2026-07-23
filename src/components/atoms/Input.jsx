import { controlBase } from './estilos'

export default function Input({ className = '', ...props }) {
  return <input className={`${controlBase} ${className}`} {...props} />
}
