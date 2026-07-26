import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Table from './Table'

const columns = [{ header: 'Nombre', render: (r) => r.nombre }]
const rows = [
  { id: '1', nombre: 'Ana' },
  { id: '2', nombre: 'Luis' },
]

describe('Table', () => {
  it('renderiza una fila por cada registro', () => {
    render(<Table title="Pacientes" columns={columns} rows={rows} loading={false} error="" empty="Vacío" />)
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Luis')).toBeInTheDocument()
  })

  it('muestra el mensaje de vacío cuando no hay filas', () => {
    render(<Table title="Pacientes" columns={columns} rows={[]} loading={false} error="" empty="Aún no hay pacientes." />)
    expect(screen.getByText('Aún no hay pacientes.')).toBeInTheDocument()
  })

  it('muestra el error cuando la carga falla (tiene prioridad sobre el vacío)', () => {
    render(<Table title="Pacientes" columns={columns} rows={[]} loading={false} error="No se pudieron cargar." empty="Vacío" />)
    expect(screen.getByText('No se pudieron cargar.')).toBeInTheDocument()
  })

  it('mientras carga no muestra ni filas ni el mensaje de vacío', () => {
    render(<Table title="Pacientes" columns={columns} rows={rows} loading={true} error="" empty="Vacío" />)
    expect(screen.queryByText('Ana')).not.toBeInTheDocument()
    expect(screen.queryByText('Vacío')).not.toBeInTheDocument()
  })
})
