import { describe, expect, it } from 'vitest'
import { retryDelayMs } from '../src/lib/retry'

const now = new Date('2026-09-16T02:00:00Z')

describe('retryDelayMs', () => {
  it('honors Retry-After given in seconds', () => {
    expect(retryDelayMs(new Headers({ 'retry-after': '30' }), 0, now)).toBe(30_000)
  })

  it('honors Retry-After given as an HTTP date', () => {
    expect(retryDelayMs(new Headers({ 'retry-after': 'Wed, 16 Sep 2026 02:00:45 GMT' }), 0, now)).toBe(45_000)
  })

  it('treats a Retry-After date in the past as ready now', () => {
    expect(retryDelayMs(new Headers({ 'retry-after': 'Wed, 16 Sep 2026 01:59:00 GMT' }), 0, now)).toBe(0)
  })

  it('waits out a github rate limit reset when there is no Retry-After', () => {
    const reset = String(Math.floor(now.getTime() / 1000) + 60)
    const h = new Headers({ 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': reset })
    expect(retryDelayMs(h, 0, now)).toBe(60_000)
  })

  it('backs off exponentially when the response says nothing', () => {
    expect(retryDelayMs(new Headers(), 0, now)).toBe(1_000)
    expect(retryDelayMs(new Headers(), 1, now)).toBe(2_000)
    expect(retryDelayMs(new Headers(), 2, now)).toBe(4_000)
  })

  it('ignores an unparseable Retry-After rather than waiting forever', () => {
    expect(retryDelayMs(new Headers({ 'retry-after': 'soon' }), 1, now)).toBe(2_000)
  })
})
