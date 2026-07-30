import { describe, it, expect } from 'vitest'
import {
  todayISO,
  formatTime,
  formatShortDate,
  addDays,
  weekday,
  longDateFromISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  daysBetween,
} from './date'

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

describe('startOfWeek and endOfWeek', () => {
  it('treats Monday as the first day of the week', () => {
    expect(startOfWeek('2026-07-29')).toBe('2026-07-27')
    expect(endOfWeek('2026-07-29')).toBe('2026-08-02')
  })

  it('keeps Monday itself as the start', () => {
    expect(startOfWeek('2026-07-27')).toBe('2026-07-27')
  })

  it('puts Sunday at the end of the week that just finished', () => {
    expect(startOfWeek('2026-08-02')).toBe('2026-07-27')
    expect(endOfWeek('2026-08-02')).toBe('2026-08-02')
  })
})

describe('startOfMonth and endOfMonth', () => {
  it('covers a 31-day month', () => {
    expect(startOfMonth('2026-07-15')).toBe('2026-07-01')
    expect(endOfMonth('2026-07-15')).toBe('2026-07-31')
  })

  it('covers a 30-day month', () => {
    expect(endOfMonth('2026-04-10')).toBe('2026-04-30')
  })

  it('handles February in a leap year', () => {
    expect(endOfMonth('2028-02-05')).toBe('2028-02-29')
  })

  it('handles February in a common year', () => {
    expect(endOfMonth('2026-02-05')).toBe('2026-02-28')
  })
})

describe('daysBetween', () => {
  it('counts the days from one date to another', () => {
    expect(daysBetween('2026-07-01', '2026-07-31')).toBe(30)
  })

  it('is zero for the same day', () => {
    expect(daysBetween('2026-07-01', '2026-07-01')).toBe(0)
  })

  it('goes negative when the range is backwards', () => {
    expect(daysBetween('2026-07-31', '2026-07-01')).toBe(-30)
  })
})

describe('longDateFromISO', () => {
  it('formats the long date in Spanish', () => {
    const text = longDateFromISO('2000-01-01')
    expect(text).toContain('2000')
    expect(text).toMatch(/enero/i)
  })
})
