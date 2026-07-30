import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Table from './Table'

const columns = [{ header: 'Nombre', render: (row) => row.nombre }]
const rows = [
  { id: '1', nombre: 'Ana' },
  { id: '2', nombre: 'Luis' },
]

describe('Table', () => {
  it('renders one row per record', () => {
    render(
      <Table title="Pacientes" columns={columns} rows={rows} loading={false} error="" empty="Vacío" />,
    )
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Luis')).toBeInTheDocument()
  })

  it('shows the empty message when there are no rows', () => {
    render(
      <Table
        title="Pacientes"
        columns={columns}
        rows={[]}
        loading={false}
        error=""
        empty="Aún no hay pacientes."
      />,
    )
    expect(screen.getByText('Aún no hay pacientes.')).toBeInTheDocument()
  })

  it('shows the error when loading fails (takes precedence over the empty message)', () => {
    render(
      <Table
        title="Pacientes"
        columns={columns}
        rows={[]}
        loading={false}
        error="No se pudieron cargar."
        empty="Vacío"
      />,
    )
    expect(screen.getByText('No se pudieron cargar.')).toBeInTheDocument()
  })

  it('shows neither rows nor the empty message while loading', () => {
    render(
      <Table title="Pacientes" columns={columns} rows={rows} loading={true} error="" empty="Vacío" />,
    )
    expect(screen.queryByText('Ana')).not.toBeInTheDocument()
    expect(screen.queryByText('Vacío')).not.toBeInTheDocument()
  })
})
