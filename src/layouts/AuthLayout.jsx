export default function AuthLayout({ children }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-brand-light to-surface-plane px-4">
      {children}
    </div>
  )
}
