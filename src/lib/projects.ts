import type { Snapshot } from './snapshot'

export type { Snapshot } from './snapshot'

export type Project = {
  key: string
  title: string
  blurb: string
  url: string
}

/** Resolve the allowlist against the snapshot, in allowlist order.
    A missing or blank entry fails the build rather than rendering a hole:
    the fix is a description on the repo, not an override here. */
export function selectProjects(keys: readonly string[], snapshot: Snapshot): Project[] {
  return keys.map((key) => {
    const entry = snapshot[key]
    if (!entry) throw new Error(`${key}: not in repos.snapshot.json, run \`make refresh\``)
    if (!entry.blurb) throw new Error(`${key}: no github description, set one with \`gh repo edit\``)

    return { key, title: entry.title, blurb: entry.blurb, url: entry.url }
  })
}
