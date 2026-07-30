import { describe, it, expect } from 'vitest'
import { indexBy } from './data'

describe('indexBy', () => {
  it('turns a list into an id → field map', () => {
    const list = [
      { id: 'a', nombre: 'Cardiología' },
      { id: 'b', nombre: 'Ginecología' },
    ]
    expect(indexBy(list, 'nombre')).toEqual({ a: 'Cardiología', b: 'Ginecología' })
  })

  it('returns an empty object for an empty list', () => {
    expect(indexBy([], 'nombre')).toEqual({})
  })
})
