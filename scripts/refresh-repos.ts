/** Refresh src/data/repos.snapshot.json from GitHub.
    Run by CI on push, on repository_dispatch from a project repo, and weekly
    as a backstop. A failure here leaves the old snapshot in place: the site
    still deploys, it just deploys yesterday's descriptions. */
import { writeFile } from 'node:fs/promises'
import { allowlist } from '../src/data/projects.ts'
import { retryDelayMs } from '../src/lib/retry.ts'
import { toSnapshot, type ApiRepo } from '../src/lib/snapshot.ts'

const OWNER = 'guygrigsby'
const UA = 'grigsby.dev-refresh (+https://grigsby.dev)'
const ATTEMPTS = 4
const SPACING_MS = 120

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function getRepo(repo: string): Promise<ApiRepo> {
  const headers: Record<string, string> = { 'user-agent': UA, accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${repo}`, { headers })
    if (res.ok) return (await res.json()) as ApiRepo

    // 404 on a public repo means it was renamed, deleted, or made private.
    // Retrying will not change that; say so now.
    if (res.status === 404) throw new Error(`${repo}: github says 404, is it renamed or private?`)
    if (res.status < 429 && res.status !== 403) throw new Error(`${repo}: github returned ${res.status}`)

    const wait = retryDelayMs(res.headers, attempt)
    console.warn(`${repo}: ${res.status}, waiting ${Math.round(wait / 1000)}s`)
    await sleep(wait)
  }

  throw new Error(`${repo}: still throttled after ${ATTEMPTS} attempts`)
}

const repos: ApiRepo[] = []
for (const { repo } of allowlist) {
  repos.push(await getRepo(repo))
  await sleep(SPACING_MS)
}

const snapshot = toSnapshot(allowlist, repos)
await writeFile('src/data/repos.snapshot.json', `${JSON.stringify(snapshot, null, 2)}\n`)

const thin = Object.entries(snapshot).filter(([, e]) => !e.blurb)
for (const [key] of thin) console.warn(`${key}: no github description, the build will refuse it`)

console.log(`wrote ${Object.keys(snapshot).length} projects`)
