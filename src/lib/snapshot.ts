/** One project as the page renders it. Every field comes from GitHub, so the
    page cannot describe a repo differently than the repo describes itself.
    The one exception is a `pending` repo, below. */
export type Entry = {
  title: string
  blurb: string
  url: string
}

/** Keyed by allowlist key (the name the page shows), not by repo name. */
export type Snapshot = Record<string, Entry>

/** An allowlist row: what the page calls it, and which repo it reads.

    `pending` is for a repo that is going public but has not yet. GitHub will
    not serve a description for it, so the blurb lives here instead, and the
    refresh fails the moment the repo goes public with a description of its
    own. The override cannot outlive the reason for it. */
export type Allow = {
  key: string
  repo: string
  pending?: string
}

export type ApiRepo = {
  name: string
  description: string | null
  html_url: string
  private: boolean
}

const OWNER = 'guygrigsby'

/** Build a snapshot from GitHub's repo payloads. Anything the allowlist asks
    for that GitHub will not serve publicly is an error: a project silently
    vanishing from the page is worse than a failed refresh. */
export function toSnapshot(allow: readonly Allow[], repos: readonly ApiRepo[]): Snapshot {
  const byName = new Map(repos.map((r) => [r.name, r]))
  const snapshot: Snapshot = {}

  for (const row of [...allow].sort((a, b) => a.key.localeCompare(b.key))) {
    const repo = byName.get(row.repo)

    if (row.pending !== undefined) {
      if (repo && !repo.private && (repo.description ?? '').trim()) {
        throw new Error(`${row.key}: ${row.repo} is public with a description now, drop its pending blurb`)
      }

      snapshot[row.key] = {
        title: row.key,
        blurb: row.pending,
        url: repo?.html_url ?? `https://github.com/${OWNER}/${row.repo}`,
      }
      continue
    }

    if (!repo) throw new Error(`${row.key}: github returned no repo named ${row.repo}`)
    if (repo.private) throw new Error(`${row.key}: ${row.repo} is private, mark it pending or take it off the page`)

    snapshot[row.key] = {
      title: row.key,
      blurb: blurb(row.key, repo.description),
      url: repo.html_url,
    }
  }

  return snapshot
}

/** GitHub descriptions are written to be read next to the repo name, so they
    often lead with it ("ago: a semantic edit protocol"). The page prints the
    name already, so drop the echo and recapitalize what is left. */
function blurb(key: string, description: string | null): string {
  const text = (description ?? '').trim()
  const prefix = new RegExp(`^${key}\\s*[:—-]\\s*`, 'i')
  const stripped = text.replace(prefix, '')
  return stripped === text ? text : stripped.charAt(0).toUpperCase() + stripped.slice(1)
}
