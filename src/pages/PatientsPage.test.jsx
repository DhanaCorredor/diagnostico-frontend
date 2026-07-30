import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PatientsPage from './PatientsPage'
import { api } from '../config/api'

vi.mock('../config/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
  ApiError: class ApiError extends Error {},
}))

const PATIENT = { id: 'p1', nombre_completo: 'Ana García', cedula: 'V-1', telefono: null, edad: 30 }

function renderPage() {
  return render(
    <MemoryRouter>
      <PatientsPage />
    </MemoryRouter>,
  )
}

async function openDeleteDialog() {
  renderPage()
  fireEvent.click(await screen.findByRole('button', { name: 'Eliminar' }))
}

function confirmButton() {
  return screen.getByRole('button', { name: 'Eliminar definitivamente' })
}

beforeEach(() => {
  vi.clearAllMocks()
  api.get.mockResolvedValue([PATIENT])
})

describe('PatientsPage — erasing a patient', () => {
  it('warns that erasing cannot be undone', async () => {
    await openDeleteDialog()
    expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument()
  })

  it('keeps the confirm button disabled until the name is typed', async () => {
    await openDeleteDialog()
    expect(confirmButton()).toBeDisabled()

    const input = screen.getByLabelText('Escribe el nombre del paciente para confirmar')
    fireEvent.change(input, { target: { value: 'Ana' } })
    expect(confirmButton()).toBeDisabled()

    fireEvent.change(input, { target: { value: 'Ana García' } })
    expect(confirmButton()).toBeEnabled()
  })

  it('accepts the typed name ignoring case and extra spaces', async () => {
    await openDeleteDialog()
    fireEvent.change(screen.getByLabelText('Escribe el nombre del paciente para confirmar'), {
      target: { value: '  ana   garcía ' },
    })
    expect(confirmButton()).toBeEnabled()
  })

  it('does not call the API while the name does not match', async () => {
    await openDeleteDialog()
    fireEvent.click(confirmButton())
    expect(api.del).not.toHaveBeenCalled()
  })

  it('reports how many appointments were kept when the patient is anonymised', async () => {
    api.del.mockResolvedValue({ resultado: 'anonimizado', citas_conservadas: 4 })
    await openDeleteDialog()
    fireEvent.change(screen.getByLabelText('Escribe el nombre del paciente para confirmar'), {
      target: { value: 'Ana García' },
    })
    fireEvent.click(confirmButton())

    await waitFor(() => {
      expect(api.del).toHaveBeenCalledWith('/pacientes/p1')
    })
    expect(
      await screen.findByText(/se conservan 4 citas como registro sin identificar/i),
    ).toBeInTheDocument()
  })

  it('reports a full deletion when the patient had no appointments', async () => {
    api.del.mockResolvedValue({ resultado: 'eliminado', citas_conservadas: 0 })
    await openDeleteDialog()
    fireEvent.change(screen.getByLabelText('Escribe el nombre del paciente para confirmar'), {
      target: { value: 'Ana García' },
    })
    fireEvent.click(confirmButton())

    expect(await screen.findByText(/se eliminó por completo/i)).toBeInTheDocument()
  })
})
