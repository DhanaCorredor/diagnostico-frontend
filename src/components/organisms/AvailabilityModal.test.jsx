import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import AvailabilityModal from './AvailabilityModal'
import { api, ApiError } from '../../config/api'

vi.mock('../../config/api', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, api: { get: vi.fn(), post: vi.fn() } }
})

const DOCTOR = { id: 'm1', nombre_completo: 'Dra. Gine' }

const SLOTS = [
  { id: 's1', dia_semana: 1, hora_inicio: '08:00:00', hora_fin: '12:00:00' },
  { id: 's2', dia_semana: 3, hora_inicio: '14:00:00', hora_fin: '18:00:00' },
]

function renderModal() {
  return render(<AvailabilityModal doctor={DOCTOR} onClose={vi.fn()} onSaved={vi.fn()} />)
}

function setTime(label, value) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

beforeEach(() => {
  vi.clearAllMocks()
  api.get.mockResolvedValue(SLOTS)
})

describe('AvailabilityModal', () => {
  it('lists the existing slots grouped by weekday', async () => {
    renderModal()
    const schedule = within(await screen.findByRole('list', { name: 'Horario semanal' }))

    expect(schedule.getByText('Lunes')).toBeInTheDocument()
    expect(schedule.getByText('08:00–12:00')).toBeInTheDocument()
    expect(schedule.getByText('Miércoles')).toBeInTheDocument()
    expect(schedule.getByText('14:00–18:00')).toBeInTheDocument()
    expect(schedule.queryByText('Martes')).not.toBeInTheDocument()
  })

  it('says so when the doctor has no schedule yet', async () => {
    api.get.mockResolvedValue([])
    renderModal()
    expect(await screen.findByText('Este médico aún no tiene horario definido.')).toBeInTheDocument()
  })

  it('does not call the API when the start is not before the end', async () => {
    renderModal()
    await screen.findByRole('list', { name: 'Horario semanal' })

    setTime('Desde', '14:00')
    setTime('Hasta', '09:00')
    fireEvent.click(screen.getByRole('button', { name: 'Añadir franja' }))

    expect(api.post).not.toHaveBeenCalled()
    expect(screen.getByText('La hora de inicio debe ser anterior a la de fin.')).toBeInTheDocument()
  })

  it('sends the slot with the weekday as a number', async () => {
    api.post.mockResolvedValue({})
    renderModal()
    await screen.findByRole('list', { name: 'Horario semanal' })

    fireEvent.change(screen.getByLabelText('Día'), { target: { value: '5' } })
    setTime('Desde', '09:00')
    setTime('Hasta', '13:30')
    fireEvent.click(screen.getByRole('button', { name: 'Añadir franja' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/disponibilidad', {
        medico_id: 'm1',
        dia_semana: 5,
        hora_inicio: '09:00',
        hora_fin: '13:30',
      })
    })
  })

  it('shows the reason the backend gives when the slot crosses another', async () => {
    api.post.mockRejectedValue(
      new ApiError(409, 'El médico ya tiene una franja que se cruza con esa ese día'),
    )
    renderModal()
    await screen.findByRole('list', { name: 'Horario semanal' })

    setTime('Desde', '10:00')
    setTime('Hasta', '14:00')
    fireEvent.click(screen.getByRole('button', { name: 'Añadir franja' }))

    expect(await screen.findByText(/ya tiene una franja que se cruza/i)).toBeInTheDocument()
  })
})
