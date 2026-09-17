import { expect, test } from '@playwright/test'
import { allowlist } from '../../src/data/projects'

test('renders every allowlisted project with a working link', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto('/')
  await expect(page).toHaveTitle('Guy Grigsby')

  for (const { key } of allowlist) {
    const entry = page.locator('.projects li', { has: page.getByRole('link', { name: key, exact: true }) })
    await expect(entry).toHaveCount(1)
    await expect(entry.locator('p')).not.toBeEmpty()
    await expect(entry.getByRole('link', { name: key, exact: true })).toHaveAttribute(
      'href',
      /^https:\/\/github\.com\/guygrigsby\//,
    )
  }

  expect(errors).toEqual([])
})

test('every link points somewhere', async ({ page }) => {
  await page.goto('/')
  const hrefs = await page.locator('a[href]').evaluateAll((els) => els.map((e) => e.getAttribute('href')))
  expect(hrefs.length).toBeGreaterThan(5)
  for (const href of hrefs) expect(href).toMatch(/^(https:\/\/|mailto:|\/)/)
})

test('no horizontal scroll at phone width', async ({ page }) => {
  await page.goto('/')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})

test('404 page renders and links home', async ({ page }) => {
  await page.goto('/404.html')
  await expect(page.getByRole('link', { name: /back to the front page/i })).toHaveAttribute('href', '/')
})

test('each link carries a real icon, not an empty box', async ({ page }) => {
  await page.goto('/')
  const marks = page.locator('.links a svg.mark')
  await expect(marks).toHaveCount(5)

  for (const mark of await marks.all()) {
    await expect(mark).toHaveAttribute('viewBox', /^[\d.]+ [\d.]+ [\d.]+ [\d.]+$/)
    await expect(mark.locator('path')).toHaveAttribute('d', /^M/)
    const box = await mark.boundingBox()
    expect(box?.width ?? 0).toBeGreaterThan(8)
  }
})

test('icon-only links still say what they are', async ({ page }) => {
  await page.goto('/')
  for (const name of ['github', 'linkedin', 'x']) {
    await expect(page.locator('.links').getByRole('link', { name, exact: true })).toHaveCount(1)
  }
})

test('the address is never in the served html', async ({ request }) => {
  const html = await (await request.get('/')).text()
  expect(html).not.toContain('@grigsby.dev')
  // The script's own 'mailto:' literal is fine; what must not appear is an
  // address attached to it, which is all a harvester regexes for.
  expect(html).not.toMatch(/mailto:[^'"\s]*@/)
})

test('javascript assembles a working mailto', async ({ page }) => {
  await page.goto('/')
  const email = page.locator('.links a.email')
  await expect(email).toHaveAttribute('href', 'mailto:hi@grigsby.dev')
  await expect(email).toHaveAccessibleName('email')
})
