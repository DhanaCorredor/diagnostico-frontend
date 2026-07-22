export default function Tarjeta({ className = '', children, ...props }) {
  return (
    <div className={`rounded-xl border border-line bg-white ${className}`} {...props}>
      {children}
    </div>
  )
}
