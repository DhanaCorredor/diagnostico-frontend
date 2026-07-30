export default function Card({ className = '', children, ...props }) {
  return (
    <div className={`rounded-xl border border-line bg-surface ${className}`} {...props}>
      {children}
    </div>
  )
}
