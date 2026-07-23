import Badge from '../atoms/Badge'
import { ESTADOS_CITA } from '../../utils/citas'

export default function EstadoBadge({ estado }) {
  const { texto, color } = ESTADOS_CITA[estado] ?? { texto: estado, color: 'neutral' }
  return <Badge color={color}>{texto}</Badge>
}
