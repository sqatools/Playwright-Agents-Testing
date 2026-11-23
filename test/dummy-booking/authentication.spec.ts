import { test, expect } from '@playwright/test';
import { DummyBookingLoginPage } from '../../pages/DummyBookingLoginPage';
import { dummyBookingData } from '../../test-data/dummyBookingData';

test.describe('Dummy Booking Authentication', () => {
  test('valid user login reveals the flight search flow', async ({ page }) => {
    // 1. Open the dummy booking website and enter valid credentials.
    await page.goto('https://sqatools.in/dummy-booking-website/');
    await expect(page).toHaveTitle(/Dummy Flight Booking Website/);
    await expect(page.locator('#login-username')).toBeVisible();
    await expect(page.locator('#logout-btn')).toBeHidden();

    await page.locator('#login-username').fill(dummyBookingData.validUser.username);
    await page.locator('#login-password').fill(dummyBookingData.validUser.password);
    await page.locator('#login-btn').click();

    // 2. Verify the signed-in state and search form.
    await expect(page.getByText('Signed in as Test User')).toBeVisible();
    await expect(page.locator('#logout-btn')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Search flights' })).toBeVisible();
  });

  test('locked and invalid users cannot sign in', async ({ page }) => {
    const login = new DummyBookingLoginPage(page);

    await login.login(dummyBookingData.lockedUser.username, dummyBookingData.lockedUser.password);
    await expect(page.locator('#login-error')).toBeVisible();
    await expect(page.locator('#from-city')).toBeHidden();

    await page.locator('#login-username').fill('unknown-user');
    await page.locator('#login-password').fill('Wrong@123');
    await page.locator('#login-btn').click();
    await expect(page.locator('#login-error')).toBeVisible();
  });

  test('password toggle and logout behave correctly', async ({ page }) => {
    const login = new DummyBookingLoginPage(page);
    await login.open();
    await page.locator('#login-username').fill(dummyBookingData.validUser.username);
    await page.locator('#login-password').fill(dummyBookingData.validUser.password);

    await login.togglePassword().click();
    await expect(login.password()).toHaveAttribute('type', 'text');
    await expect(login.togglePassword()).toHaveText('Hide');

    await login.togglePassword().click();
    await expect(login.password()).toHaveAttribute('type', 'password');
    await page.locator('#login-btn').click();
    await login.logout();

    await expect(page.locator('#login-username')).toBeVisible();
    await expect(page.locator('#from-city')).toBeHidden();
  });
});
