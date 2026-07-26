import { useState } from 'react'

export function useForm(initial) {
  const [form, setForm] = useState(initial)
  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }
  return [form, set, setForm]
}
