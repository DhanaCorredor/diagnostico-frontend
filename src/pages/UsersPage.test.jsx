import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import UsersPage from './UsersPage'
import { api, ApiError } from '../config/api'

vi.mock('../config/api', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, api: { get: vi.fn(), put: vi.fn(), del: vi.fn() } }
})

vi.mock('../auth/useAuth', () => ({
  useAuth: () => ({ user: { id: 'me', rol: 'ADMIN', nombre_completo: 'Admin' } }),
}))

const ADMIN = { id: 'me', nombre_completo: 'Admin', email: 'admin@x.com', rol: 'ADMIN', activo: true }
const DOCTOR = {
  id: 'u2',
  nombre_completo: 'Dra. Gine',
  email: 'gine@x.com',
  rol: 'MEDICO',
  activo: true,
}

function rowOf(name) {
  return within(screen.getByText(name).closest('tr'))
}

async function renderPage() {
  render(<UsersPage />)
  await screen.findByText('Dra. Gine')
}

beforeEach(() => {
  vi.clearAllMocks()
  api.get.mockImplementation((path) => Promise.resolve(path === '/usuarios' ? [ADMIN, DOCTOR] : []))
})

describe('UsersPage — deactivating', () => {
  it('deactivates with a reversible update, never with delete', async () => {
    api.put.mockResolvedValue({})
    await renderPage()

    fireEvent.click(rowOf('Dra. Gine').getByRole('button', { name: 'Dar de baja' }))

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/usuarios/u2', { activo: false })
    })
    expect(api.del).not.toHaveBeenCalled()
  })
})

describe('UsersPage — erasing', () => {
  it('does not offer to remove your own account', async () => {
    await renderPage()
    expect(rowOf('Admin').queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument()
    expect(rowOf('Dra. Gine').getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
  })

  it('keeps the confirmation disabled until the name is typed', async () => {
    await renderPage()
    fireEvent.click(rowOf('Dra. Gine').getByRole('button', { name: 'Eliminar' }))

    const confirm = screen.getByRole('button', { name: 'Eliminar acceso' })
    expect(confirm).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Escribe el nombre completo para confirmar'), {
      target: { value: 'Dra. Gine' },
    })
    expect(confirm).toBeEnabled()
  })

  it('reports how many appointments were kept', async () => {
    api.del.mockResolvedValue({ resultado: 'anonimizado', citas_conservadas: 12 })
    await renderPage()
    fireEvent.click(rowOf('Dra. Gine').getByRole('button', { name: 'Eliminar' }))
    fireEvent.change(screen.getByLabelText('Escribe el nombre completo para confirmar'), {
      target: { value: 'Dra. Gine' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar acceso' }))

    await waitFor(() => expect(api.del).toHaveBeenCalledWith('/usuarios/u2'))
    expect(await screen.findByText(/se conservan 12 citas en el historial/i)).toBeInTheDocument()
  })

  it('shows the reason the backend gives when the doctor still has appointments', async () => {
    api.del.mockRejectedValue(
      new ApiError(409, 'Ese médico tiene 3 cita(s) agendadas por delante.'),
    )
    await renderPage()
    fireEvent.click(rowOf('Dra. Gine').getByRole('button', { name: 'Eliminar' }))
    fireEvent.change(screen.getByLabelText('Escribe el nombre completo para confirmar'), {
      target: { value: 'Dra. Gine' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar acceso' }))

    expect(await screen.findByText(/3 cita\(s\) agendadas por delante/i)).toBeInTheDocument()
  })
})
