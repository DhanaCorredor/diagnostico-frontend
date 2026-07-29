import Badge from '../atoms/Badge'
import { APPOINTMENT_STATES } from '../../utils/citas'

export default function StatusBadge({ status }) {
  const { text, color } = APPOINTMENT_STATES[status] ?? { text: status, color: 'neutral' }
  return <Badge color={color}>{text}</Badge>
}
