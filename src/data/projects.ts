import type { Allow } from '../lib/snapshot'

/** What the page shows, in the order it shows it. `key` is the name on the
    page; `repo` is where its description comes from. Adding a line here and
    running `make refresh` is the whole edit.

    `pending` carries a blurb for a repo that is not public yet. Refresh fails
    once the repo is public with its own description, so the override cannot
    outlive its reason. */
export const allowlist: readonly Allow[] = [
  { key: 'autophage', repo: 'autophage' },
  {
    key: 'rudy',
    repo: 'rudy',
    pending:
      'Coding agent harness in Go. One binary: the model loop, tools, sessions, permissions and plugins, in a terminal, headless or as a server.',
  },
  { key: 'jess', repo: 'jess' },
  { key: 'ago', repo: 'agent-go' },
]
