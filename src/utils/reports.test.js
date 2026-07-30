import { describe, it, expect } from 'vitest'
import { countBy, ranking, noShowRate, formatPercent } from './reports'

const appointment = (estado, medico_id = 'm1') => ({ estado, medico_id })

describe('countBy', () => {
  it('counts the items by the given key', () => {
    const items = [appointment('COMPLETED'), appointment('NO_SHOW'), appointment('COMPLETED')]
    expect(countBy(items, (a) => a.estado)).toEqual({ COMPLETED: 2, NO_SHOW: 1 })
  })

  it('returns an empty object for an empty list', () => {
    expect(countBy([], (a) => a.estado)).toEqual({})
  })
})

describe('ranking', () => {
  it('sorts by count, highest first', () => {
    const result = ranking({ m1: 2, m2: 5 }, { m1: 'Dra. Uno', m2: 'Dr. Dos' })
    expect(result.map((row) => row.name)).toEqual(['Dr. Dos', 'Dra. Uno'])
  })

  it('breaks ties by name so the order is stable', () => {
    const result = ranking({ m1: 3, m2: 3 }, { m1: 'Zulema', m2: 'Ana' })
    expect(result.map((row) => row.name)).toEqual(['Ana', 'Zulema'])
  })

  it('falls back when the name is unknown', () => {
    expect(ranking({ x: 1 }, {})[0].name).toBe('Sin asignar')
  })
})

describe('noShowRate', () => {
  it('divides the misses by the appointments that were closed', () => {
    const appointments = [
      appointment('COMPLETED'),
      appointment('COMPLETED'),
      appointment('COMPLETED'),
      appointment('NO_SHOW'),
    ]
    expect(noShowRate(appointments)).toBe(0.25)
  })

  it('ignores the ones still open or cancelled', () => {
    const appointments = [
      appointment('COMPLETED'),
      appointment('NO_SHOW'),
      appointment('SCHEDULED'),
      appointment('CONFIRMED'),
      appointment('CANCELLED'),
    ]
    expect(noShowRate(appointments)).toBe(0.5)
  })

  it('is unknown when nothing has closed yet', () => {
    expect(noShowRate([appointment('SCHEDULED')])).toBeNull()
    expect(noShowRate([])).toBeNull()
  })
})

describe('formatPercent', () => {
  it('rounds to whole percent', () => {
    expect(formatPercent(0.256)).toBe('26 %')
  })

  it('shows a dash when there is nothing to measure', () => {
    expect(formatPercent(null)).toBe('—')
  })
})
