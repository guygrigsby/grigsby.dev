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
  for (const href of hrefs) expect(href).toMatch(/^(https:\/\/|\/)/)
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
