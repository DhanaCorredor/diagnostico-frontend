import { describe, it, expect } from 'vitest'
import { initials } from './text'

describe('initials', () => {
  it('toma la inicial de las dos primeras palabras', () => {
    expect(initials('Ana García')).toBe('AG')
  })

  it('ignora palabras a partir de la tercera', () => {
    expect(initials('María Fernanda López')).toBe('MF')
  })

  it('funciona con un solo nombre', () => {
    expect(initials('Juan')).toBe('J')
  })

  it('descarta los espacios de más', () => {
    expect(initials('  Ana   García ')).toBe('AG')
  })

  it('con cadena vacía devuelve cadena vacía', () => {
    expect(initials('')).toBe('')
  })
})
