import { cloneElement, useId } from 'react'
import Label from '../atoms/Label'

export default function Field({ label, hint, children }) {
  const id = useId()
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children, { id })}
      {hint && <p className="mt-1 text-[11px] text-ink-muted">{hint}</p>}
    </div>
  )
}
