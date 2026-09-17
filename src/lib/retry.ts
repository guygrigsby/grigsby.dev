/** How long to wait before retrying a throttled or failed request.

    Order of authority: whatever the server told us (Retry-After, in either the
    seconds or the HTTP-date form), then GitHub's rate-limit reset, then plain
    exponential backoff. Guessing shorter than the server asked is how you get
    blocked. */
export function retryDelayMs(headers: Headers, attempt: number, now: Date = new Date()): number {
  const after = headers.get('retry-after')
  if (after) {
    const seconds = Number(after)
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)

    const at = Date.parse(after)
    if (Number.isFinite(at)) return Math.max(0, at - now.getTime())
  }

  if (headers.get('x-ratelimit-remaining') === '0') {
    const reset = Number(headers.get('x-ratelimit-reset'))
    if (Number.isFinite(reset)) return Math.max(0, reset * 1000 - now.getTime())
  }

  return 1000 * 2 ** attempt
}
