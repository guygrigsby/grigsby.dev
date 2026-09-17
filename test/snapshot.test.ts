import { describe, expect, it } from 'vitest'
import { toSnapshot } from '../src/lib/snapshot'

const api = [
  { name: 'gyr', description: '  Agent daemon for local oversight.  ', html_url: 'https://github.com/guygrigsby/gyr', private: false },
  { name: 'agent-go', description: 'ago: a semantic edit protocol for Go.', html_url: 'https://github.com/guygrigsby/agent-go', private: false },
]

describe('toSnapshot', () => {
  it('keys entries by allowlist key, not repo name', () => {
    const got = toSnapshot([{ key: 'ago', repo: 'agent-go' }], api)
    expect(Object.keys(got)).toEqual(['ago'])
    expect(got.ago.url).toBe('https://github.com/guygrigsby/agent-go')
  })

  it('trims descriptions and titles the entry with its key', () => {
    const got = toSnapshot([{ key: 'gyr', repo: 'gyr' }], api)
    expect(got.gyr).toEqual({
      title: 'gyr',
      blurb: 'Agent daemon for local oversight.',
      url: 'https://github.com/guygrigsby/gyr',
    })
  })

  it('emits keys in sorted order so the file diffs cleanly', () => {
    const got = toSnapshot([{ key: 'gyr', repo: 'gyr' }, { key: 'ago', repo: 'agent-go' }], api)
    expect(Object.keys(got)).toEqual(['ago', 'gyr'])
  })

  it('rejects a repo that went private rather than silently dropping it', () => {
    const gone = [{ name: 'gyr', description: 'x', html_url: 'u', private: true }]
    expect(() => toSnapshot([{ key: 'gyr', repo: 'gyr' }], gone)).toThrowError(/gyr/)
  })

  it('rejects a repo the api never returned', () => {
    expect(() => toSnapshot([{ key: 'nope', repo: 'nope' }], api)).toThrowError(/nope/)
  })
})

describe('toSnapshot blurbs', () => {
  it('strips a leading "key:" from the description, since the page already shows the name', () => {
    const repos = [{ name: 'agent-go', description: 'ago: a semantic edit protocol for Go.', html_url: 'u', private: false }]
    expect(toSnapshot([{ key: 'ago', repo: 'agent-go' }], repos).ago.blurb).toBe('A semantic edit protocol for Go.')
  })

  it('leaves a description alone when the prefix is not the project name', () => {
    const repos = [{ name: 'gyr', description: 'note: an agent daemon.', html_url: 'u', private: false }]
    expect(toSnapshot([{ key: 'gyr', repo: 'gyr' }], repos).gyr.blurb).toBe('note: an agent daemon.')
  })
})
