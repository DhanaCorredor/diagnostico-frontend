import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { request, setSlowRequestHandler } from './configClient'

const OK = { status: 200, ok: true, text: async () => '{}' }

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  setSlowRequestHandler(null)
})

describe('request — slow connection notice', () => {
  it('warns once the request goes past the threshold', async () => {
    const onSlow = vi.fn()
    setSlowRequestHandler(onSlow)

    let finish
    global.fetch = vi.fn(() => new Promise((resolve) => (finish = resolve)))
    const pending = request('/algo', { method: 'GET', auth: false })

    await vi.advanceTimersByTimeAsync(2400)
    expect(onSlow).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(200)
    expect(onSlow).toHaveBeenCalledWith(true)

    finish(OK)
    await pending
    expect(onSlow).toHaveBeenLastCalledWith(false)
  })

  it('stays quiet when the request is fast', async () => {
    const onSlow = vi.fn()
    setSlowRequestHandler(onSlow)
    global.fetch = vi.fn(async () => OK)

    await request('/algo', { method: 'GET', auth: false })

    expect(onSlow).not.toHaveBeenCalledWith(true)
  })
})
