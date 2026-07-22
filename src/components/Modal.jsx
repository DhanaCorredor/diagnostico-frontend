export default function Modal({ titulo, subtitulo, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold">{titulo}</h3>
            {subtitulo && <p className="text-xs text-ink-muted">{subtitulo}</p>}
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="space-y-4 p-6">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 border-t border-line px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  )
}
