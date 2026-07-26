import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AppointmentFields from './AppointmentFields'

const medicos = [
  { id: 'm1', nombre_completo: 'Dra. Gine', especialidades: [{ id: 'gine', nombre: 'Ginecología' }] },
]
const serviciosConEsp = [
  { id: 's1', nombre: 'Ecografía ginecológica', especialidades: [{ id: 'gine', nombre: 'Ginecología' }] },
  { id: 's2', nombre: 'Ecocardiograma', especialidades: [{ id: 'cardio', nombre: 'Cardiología' }] },
]

function baseForm(overrides = {}) {
  return {
    medico_id: '',
    servicio_id: '',
    fecha: '2026-07-26',
    hora: '09:00',
    duracion_min: 30,
    motivo: '',
    permitir_sobrecupo: false,
    ...overrides,
  }
}

describe('AppointmentFields — filtro de servicios por especialidad', () => {
  it('solo ofrece los servicios de la especialidad del médico elegido', () => {
    render(
      <AppointmentFields
        form={baseForm({ medico_id: 'm1' })}
        set={vi.fn()}
        medicos={medicos}
        servicios={serviciosConEsp}
      />,
    )
    expect(screen.getByRole('option', { name: 'Ecografía ginecológica' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Ecocardiograma' })).not.toBeInTheDocument()
  })

  it('si los servicios no traen especialidades (backend antiguo), muestra todos', () => {
    const serviciosSinEsp = [
      { id: 's1', nombre: 'Ecografía ginecológica' },
      { id: 's2', nombre: 'Ecocardiograma' },
    ]
    render(
      <AppointmentFields
        form={baseForm({ medico_id: 'm1' })}
        set={vi.fn()}
        medicos={medicos}
        servicios={serviciosSinEsp}
      />,
    )
    expect(screen.getByRole('option', { name: 'Ecografía ginecológica' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Ecocardiograma' })).toBeInTheDocument()
  })

  it('al cambiar de médico resetea el servicio elegido (evita agendar uno que no corresponde)', () => {
    const set = vi.fn()
    render(
      <AppointmentFields form={baseForm()} set={set} medicos={medicos} servicios={serviciosConEsp} />,
    )
    const selectMedico = screen.getAllByRole('combobox')[0]
    fireEvent.change(selectMedico, { target: { value: 'm1' } })
    expect(set).toHaveBeenCalledWith('medico_id', 'm1')
    expect(set).toHaveBeenCalledWith('servicio_id', '')
  })
})

describe('AppointmentFields — accesibilidad', () => {
  it('asocia cada etiqueta con su campo (label ↔ input)', () => {
    render(
      <AppointmentFields
        form={baseForm({ medico_id: 'm1' })}
        set={vi.fn()}
        medicos={medicos}
        servicios={serviciosConEsp}
      />,
    )
    expect(screen.getByLabelText('Médico')).toBeInTheDocument()
    expect(screen.getByLabelText('Servicio')).toBeInTheDocument()
  })
})
