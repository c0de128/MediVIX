import { test, expect } from '@playwright/test'

test.describe('Patient Management', () => {
  test('should display patients list', async ({ page }) => {
    await page.goto('/patients')

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Patients')

    // Check for patient list or empty state
    const patientList = page.locator('[data-testid="patient-list"]')
    const emptyState = page.locator('text=No patients found')

    // Either show patients or empty state
    const hasPatients = await patientList.isVisible().catch(() => false)
    const isEmpty = await emptyState.isVisible().catch(() => false)

    expect(hasPatients || isEmpty).toBeTruthy()
  })

  test('should open add patient form', async ({ page }) => {
    await page.goto('/patients')

    // Click add patient button
    await page.click('button:has-text("Add Patient")')

    // Check form elements are visible
    await expect(page.locator('input[name="first_name"]')).toBeVisible()
    await expect(page.locator('input[name="last_name"]')).toBeVisible()
    await expect(page.locator('input[name="date_of_birth"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="phone"]')).toBeVisible()
  })

  test('should validate patient form', async ({ page }) => {
    await page.goto('/patients')
    await page.click('button:has-text("Add Patient")')

    // Try to submit empty form
    await page.click('button:has-text("Save")')

    // Check for validation errors
    await expect(page.locator('text=First name is required')).toBeVisible()
    await expect(page.locator('text=Last name is required')).toBeVisible()
    await expect(page.locator('text=Date of birth is required')).toBeVisible()
  })

  test('should search for patients', async ({ page }) => {
    await page.goto('/patients')

    // Type in search box
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('John')

    // Wait for search to complete (debounce)
    await page.waitForTimeout(500)

    // Check that search was performed (URL should update or results should change)
    const url = page.url()
    expect(url).toContain('search') // Or check for filtered results
  })
})