import { useEffect, useState } from 'react'
import { setSlowRequestHandler } from '../../config/configClient'

export default function ConnectionNotice() {
  const [waking, setWaking] = useState(false)

  useEffect(() => {
    setSlowRequestHandler(setWaking)
    return () => setSlowRequestHandler(null)
  }, [])

  if (!waking) return null

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-brand px-4 py-2 text-center text-sm text-white shadow-lg"
    >
      <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      Conectando con el servidor… la primera conexión del día puede tardar unos segundos.
    </div>
  )
}
