import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AppointmentFields from './AppointmentFields'

const doctors = [
  {
    id: 'm1',
    nombre_completo: 'Dra. Gine',
    especialidades: [{ id: 'gine', nombre: 'Ginecología' }],
  },
]
const servicesWithSpecialty = [
  {
    id: 's1',
    nombre: 'Ecografía ginecológica',
    especialidades: [{ id: 'gine', nombre: 'Ginecología' }],
  },
  {
    id: 's2',
    nombre: 'Ecocardiograma',
    especialidades: [{ id: 'cardio', nombre: 'Cardiología' }],
  },
]

function baseForm(overrides = {}) {
  return {
    medico_id: '',
    servicio_id: '',
    date: '2026-07-26',
    time: '09:00',
    duracion_min: 30,
    motivo: '',
    permitir_sobrecupo: false,
    ...overrides,
  }
}

describe('AppointmentFields — service filtering by specialty', () => {
  it('offers only the services matching the selected doctor specialty', () => {
    render(
      <AppointmentFields
        form={baseForm({ medico_id: 'm1' })}
        set={vi.fn()}
        doctors={doctors}
        services={servicesWithSpecialty}
      />,
    )
    expect(screen.getByRole('option', { name: 'Ecografía ginecológica' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Ecocardiograma' })).not.toBeInTheDocument()
  })

  it('shows every service when they carry no specialty (older backend)', () => {
    const servicesWithoutSpecialty = [
      { id: 's1', nombre: 'Ecografía ginecológica' },
      { id: 's2', nombre: 'Ecocardiograma' },
    ]
    render(
      <AppointmentFields
        form={baseForm({ medico_id: 'm1' })}
        set={vi.fn()}
        doctors={doctors}
        services={servicesWithoutSpecialty}
      />,
    )
    expect(screen.getByRole('option', { name: 'Ecografía ginecológica' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Ecocardiograma' })).toBeInTheDocument()
  })

  it('resets the chosen service when the doctor changes (avoids booking a mismatched one)', () => {
    const set = vi.fn()
    render(
      <AppointmentFields
        form={baseForm()}
        set={set}
        doctors={doctors}
        services={servicesWithSpecialty}
      />,
    )
    const doctorSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(doctorSelect, { target: { value: 'm1' } })
    expect(set).toHaveBeenCalledWith('medico_id', 'm1')
    expect(set).toHaveBeenCalledWith('servicio_id', '')
  })
})

describe('AppointmentFields — accessibility', () => {
  it('links every label with its field (label ↔ input)', () => {
    render(
      <AppointmentFields
        form={baseForm({ medico_id: 'm1' })}
        set={vi.fn()}
        doctors={doctors}
        services={servicesWithSpecialty}
      />,
    )
    expect(screen.getByLabelText('Médico')).toBeInTheDocument()
    expect(screen.getByLabelText('Servicio')).toBeInTheDocument()
  })
})
