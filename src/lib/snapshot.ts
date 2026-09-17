/** One project as the page renders it. Every field comes from GitHub, so the
    page cannot describe a repo differently than the repo describes itself. */
export type Entry = {
  title: string
  blurb: string
  url: string
}

/** Keyed by allowlist key (the name the page shows), not by repo name. */
export type Snapshot = Record<string, Entry>

/** An allowlist row: what the page calls it, and which repo it reads. */
export type Allow = {
  key: string
  repo: string
}

export type ApiRepo = {
  name: string
  description: string | null
  html_url: string
  private: boolean
}

/** Build a snapshot from GitHub's repo payloads. Anything the allowlist asks
    for that GitHub will not serve publicly is an error: a project silently
    vanishing from the page is worse than a failed refresh. */
export function toSnapshot(allow: readonly Allow[], repos: readonly ApiRepo[]): Snapshot {
  const byName = new Map(repos.map((r) => [r.name, r]))
  const snapshot: Snapshot = {}

  for (const key of [...allow].sort((a, b) => a.key.localeCompare(b.key))) {
    const repo = byName.get(key.repo)
    if (!repo) throw new Error(`${key.key}: github returned no repo named ${key.repo}`)
    if (repo.private) throw new Error(`${key.key}: ${key.repo} is private, so it cannot be on a public page`)

    snapshot[key.key] = {
      title: key.key,
      blurb: blurb(key.key, repo.description),
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
  const prefix = new RegExp(`^${key}\\s*[:\u2014-]\\s*`, 'i')
  const stripped = text.replace(prefix, '')
  return stripped === text ? text : stripped.charAt(0).toUpperCase() + stripped.slice(1)
}
