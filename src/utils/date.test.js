import { describe, it, expect } from 'vitest'
import { todayISO, formatTime, formatShortDate, addDays, weekday, longDateFromISO } from './date'

describe('todayISO', () => {
  it('returns today as YYYY-MM-DD', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('formatTime', () => {
  it('extracts HH:MM from a naive date-time', () => {
    expect(formatTime('2026-07-26T09:30:00')).toMatch(/^09.30$/)
  })
})

describe('formatShortDate', () => {
  it('does not shift the day on date-only values (guards the UTC off-by-one bug)', () => {
    expect(formatShortDate('2026-07-26').startsWith('26/')).toBe(true)
  })

  it('also accepts a full date-time', () => {
    expect(formatShortDate('2026-07-26T09:30:00').startsWith('26/')).toBe(true)
  })
})

describe('addDays', () => {
  it('adds days within the same month', () => {
    expect(addDays('2026-07-26', 1)).toBe('2026-07-27')
  })

  it('crosses over to the next month', () => {
    expect(addDays('2026-07-31', 1)).toBe('2026-08-01')
  })

  it('crosses over to the next year', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('subtracts days with negative values', () => {
    expect(addDays('2026-07-26', -1)).toBe('2026-07-25')
  })
})

describe('weekday', () => {
  it('returns the day index (0=Sunday … 6=Saturday)', () => {
    expect(weekday('2000-01-01')).toBe(6)
    expect(weekday('2000-01-02')).toBe(0)
    expect(weekday('2000-01-03')).toBe(1)
  })
})

describe('longDateFromISO', () => {
  it('formats the long date in Spanish', () => {
    const text = longDateFromISO('2000-01-01')
    expect(text).toContain('2000')
    expect(text).toMatch(/enero/i)
  })
})
