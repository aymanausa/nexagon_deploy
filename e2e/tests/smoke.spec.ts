import { test, expect } from '@playwright/test';

// Skeleton E2E. Real journeys land once auth + tenancy are built (they're in the "wait" bucket
// per testing-and-branching-strategy.md). This file documents the pattern and keeps the suite green.
//
// CONVENTION: tag each E2E with its story id so the traceability report counts it, e.g.
//   test('[NEX-NN-NN] user can log in', async ({ page }) => { ... });
// Do NOT tag a real story id on a skipped test — that would falsely mark it covered.

test.describe('Nexagon E2E (skeleton)', () => {
  // Example of the login journey to flesh out when auth is real (NEX-NN-NN). Kept skipped for now.
  test.skip('example — login journey (fill in when auth lands)', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@ews.sa');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });
});
