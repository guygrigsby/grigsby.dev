import { describe, expect, it } from 'vitest'
import { selectProjects } from '../src/lib/projects'
import type { Snapshot } from '../src/lib/projects'

const snapshot: Snapshot = {
  ago: { title: 'ago', blurb: 'Semantic edit protocol for Go.', url: 'https://github.com/guygrigsby/agent-go' },
  gyr: { title: 'gyr', blurb: 'Agent daemon for local oversight.', url: 'https://github.com/guygrigsby/gyr' },
  lmkit: { title: 'lmkit', blurb: 'Train language models on one machine.', url: 'https://github.com/guygrigsby/lmkit' },
}

describe('selectProjects', () => {
  it('returns projects in allowlist order, not snapshot order', () => {
    const got = selectProjects(['lmkit', 'ago', 'gyr'], snapshot)
    expect(got.map((p) => p.title)).toEqual(['lmkit', 'ago', 'gyr'])
  })

  it('carries the blurb and url from the snapshot', () => {
    const [ago] = selectProjects(['ago'], snapshot)
    expect(ago).toEqual({
      key: 'ago',
      title: 'ago',
      blurb: 'Semantic edit protocol for Go.',
      url: 'https://github.com/guygrigsby/agent-go',
    })
  })

  it('names the missing key when the snapshot has no entry', () => {
    expect(() => selectProjects(['nope'], snapshot)).toThrowError(/nope/)
  })

  it('refuses an entry with no blurb so the page never ships a bare name', () => {
    const thin: Snapshot = { gputex: { title: 'gputex', blurb: '', url: 'https://github.com/guygrigsby/gputex' } }
    expect(() => selectProjects(['gputex'], thin)).toThrowError(/gputex/)
  })
})
