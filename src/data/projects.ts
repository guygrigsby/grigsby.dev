import type { Allow } from '../lib/snapshot'

/** What the page shows, in the order it shows it. `key` is the name on the
    page; `repo` is where its description comes from. Adding a line here and
    running `make refresh` is the whole edit. */
export const allowlist: readonly Allow[] = [
  { key: 'lmkit', repo: 'lmkit' },
  { key: 'ago', repo: 'agent-go' },
  { key: 'nevla', repo: 'nevla' },
  { key: 'gyr', repo: 'gyr' },
  { key: 'mlx-stack', repo: 'mlx-stack' },
  { key: 'gputex', repo: 'gputex' },
]
