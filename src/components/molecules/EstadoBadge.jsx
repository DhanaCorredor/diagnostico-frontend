import Badge from '../atoms/Badge'
import { APPOINTMENT_STATES } from '../../utils/citas'

export default function EstadoBadge({ estado }) {
  const { text, color } = APPOINTMENT_STATES[estado] ?? { text: estado, color: 'neutral' }
  return <Badge color={color}>{text}</Badge>
}
