import { describe, it, expect } from 'vitest'
import { todayISO, formatTime, formatShortDate, addDays, weekday, longDateFromISO } from './date'

describe('todayISO', () => {
  it('devuelve la fecha de hoy en formato YYYY-MM-DD', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('formatTime', () => {
  it('extrae la hora HH:MM de una fecha-hora naive', () => {
    expect(formatTime('2026-07-26T09:30:00')).toMatch(/^09.30$/)
  })
})

describe('formatShortDate', () => {
  it('no adelanta el día en fechas date-only (evita el bug de UTC / off-by-one)', () => {
    expect(formatShortDate('2026-07-26').startsWith('26/')).toBe(true)
  })

  it('también acepta una fecha-hora completa', () => {
    expect(formatShortDate('2026-07-26T09:30:00').startsWith('26/')).toBe(true)
  })
})

describe('addDays', () => {
  it('suma días dentro del mismo mes', () => {
    expect(addDays('2026-07-26', 1)).toBe('2026-07-27')
  })

  it('cruza el cambio de mes', () => {
    expect(addDays('2026-07-31', 1)).toBe('2026-08-01')
  })

  it('cruza el cambio de año', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('resta días con valores negativos', () => {
    expect(addDays('2026-07-26', -1)).toBe('2026-07-25')
  })
})

describe('weekday', () => {
  it('devuelve el índice de día (0=domingo … 6=sábado)', () => {
    expect(weekday('2000-01-01')).toBe(6)
    expect(weekday('2000-01-02')).toBe(0)
    expect(weekday('2000-01-03')).toBe(1)
  })
})

describe('longDateFromISO', () => {
  it('formatea la fecha larga en español', () => {
    const texto = longDateFromISO('2000-01-01')
    expect(texto).toContain('2000')
    expect(texto).toMatch(/enero/i)
  })
})
