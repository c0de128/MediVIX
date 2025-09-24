import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate to main pages', async ({ page }) => {
    await page.goto('/')

    // Check homepage loads
    await expect(page).toHaveTitle(/MediVIX/)
    await expect(page.locator('h1')).toContainText('Welcome to MediVIX')

    // Navigate to Patients page
    await page.click('text=View Patients')
    await expect(page).toHaveURL('/patients')
    await expect(page.locator('h1')).toContainText('Patients')

    // Navigate to Appointments page
    await page.click('a[href="/appointments"]')
    await expect(page).toHaveURL('/appointments')
    await expect(page.locator('h1')).toContainText('Appointments')

    // Navigate to Diagnosis page
    await page.click('a[href="/diagnosis"]')
    await expect(page).toHaveURL('/diagnosis')
    await expect(page.locator('h1')).toContainText('AI Diagnosis')

    // Navigate to Templates page
    await page.click('a[href="/templates"]')
    await expect(page).toHaveURL('/templates')
    await expect(page.locator('h1')).toContainText('Visit Templates')
  })

  test('should display navigation menu on all pages', async ({ page }) => {
    const pages = ['/', '/patients', '/appointments', '/diagnosis', '/templates']

    for (const url of pages) {
      await page.goto(url)

      // Check navigation links are visible
      await expect(page.locator('nav')).toBeVisible()
      await expect(page.locator('a[href="/patients"]')).toBeVisible()
      await expect(page.locator('a[href="/appointments"]')).toBeVisible()
      await expect(page.locator('a[href="/diagnosis"]')).toBeVisible()
      await expect(page.locator('a[href="/templates"]')).toBeVisible()
    }
  })
})