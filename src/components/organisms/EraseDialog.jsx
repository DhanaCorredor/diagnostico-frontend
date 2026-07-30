import { useState } from 'react'
import { normalize } from '../../utils/text'
import Modal from '../molecules/Modal'
import Field from '../molecules/Field'
import Input from '../atoms/Input'
import Button from '../atoms/Button'
import Alert from '../atoms/Alert'

export default function EraseDialog({
  title,
  name,
  outcomes,
  busy,
  error,
  onConfirm,
  onClose,
  confirmLabel = 'Eliminar definitivamente',
}) {
  const [typed, setTyped] = useState('')
  const confirmed = normalize(typed) === normalize(name)

  return (
    <Modal
      title={title}
      subtitle="Esta acción no se puede deshacer."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy || !confirmed}>
            {busy ? 'Eliminando…' : confirmLabel}
          </Button>
        </>
      }
    >
      {error && <Alert>{error}</Alert>}

      <p className="text-sm text-ink-2">
        Vas a borrar los datos de <span className="font-medium text-ink">{name}</span>. No se
        pueden recuperar.
      </p>

      <ul className="list-inside list-disc space-y-1 text-sm text-ink-2">
        {outcomes.map((outcome) => (
          <li key={outcome}>{outcome}</li>
        ))}
      </ul>

      <Field label="Escribe el nombre completo para confirmar">
        <Input
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          placeholder={name}
          autoFocus
        />
      </Field>
    </Modal>
  )
}
