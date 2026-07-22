export const claseInput =
  'w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20'

export default function Campo({ label, hint, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-ink-muted">{hint}</p>}
    </div>
  )
}
