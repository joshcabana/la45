import { test, expect } from '@playwright/test'

test('home → queue loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Enter LA45' })).toBeVisible()
  await page.getByRole('link', { name: 'Enter LA45' }).click()
  await expect(page.getByText('Get ready')).toBeVisible()
})

