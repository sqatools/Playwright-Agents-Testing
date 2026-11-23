import { test, expect } from '@playwright/test';

test.describe('Test setup', () => {
  test('seed', async ({ page }) => {
    await page.goto('https://sqatools.in/dummy-booking-website/');
    await expect(page).toHaveURL(/dummy-booking-website/);
  });
});
