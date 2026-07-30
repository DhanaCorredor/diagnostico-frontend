import { describe, it, expect } from 'vitest'
import { initials } from './text'

describe('initials', () => {
  it('takes the initial of the first two words', () => {
    expect(initials('Ana García')).toBe('AG')
  })

  it('ignores words from the third one on', () => {
    expect(initials('María Fernanda López')).toBe('MF')
  })

  it('works with a single name', () => {
    expect(initials('Juan')).toBe('J')
  })

  it('discards extra whitespace', () => {
    expect(initials('  Ana   García ')).toBe('AG')
  })

  it('returns an empty string for an empty string', () => {
    expect(initials('')).toBe('')
  })
})
