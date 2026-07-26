import { describe, it, expect } from 'vitest'
import { indexBy } from './data'

describe('indexBy', () => {
  it('convierte una lista en un mapa id → campo', () => {
    const lista = [
      { id: 'a', nombre: 'Cardiología' },
      { id: 'b', nombre: 'Ginecología' },
    ]
    expect(indexBy(lista, 'nombre')).toEqual({ a: 'Cardiología', b: 'Ginecología' })
  })

  it('con lista vacía devuelve un objeto vacío', () => {
    expect(indexBy([], 'nombre')).toEqual({})
  })
})
