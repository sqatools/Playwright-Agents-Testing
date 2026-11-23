import { test, expect } from '@playwright/test';
import { DummyBookingLoginPage } from '../../pages/DummyBookingLoginPage';
import { FlightSearchPage } from '../../pages/FlightSearchPage';
import { dummyBookingData } from '../../test-data/dummyBookingData';

test.describe('Dummy Booking Flight Search', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await new DummyBookingLoginPage(page).login(
      dummyBookingData.validUser.username,
      dummyBookingData.validUser.password,
    );
  });

  test('valid one-way route returns sorted flight results', async ({ page }) => {
    // 1. Search a valid domestic route.
    const search = new FlightSearchPage(page);
    await search.search('DEL', 'BOM', '2026-12-01');

    // 2. Verify results and sorting.
    await expect(page.getByText(/flights found/)).toBeVisible();
    await expect(search.flightCards()).not.toHaveCount(0);
    await search.sort().selectOption({ label: 'Lowest price' });
    await expect(search.flightCards().first()).toBeVisible();
  });

  test('same origin and destination is rejected', async ({ page }) => {
    const search = new FlightSearchPage(page);
    await search.origin().selectOption('DEL');
    await search.destination().selectOption('DEL');
    await search.departDate().fill('2026-12-01');
    await page.locator('#search-btn').click({ force: true });

    await expect(page.locator('#search-error')).toContainText(/same|origin|destination/i);
  });

  test('missing route values prevent search', async ({ page }) => {
    await page.locator('#search-btn').click({ force: true });
    await expect(page.locator('#search-error')).toBeVisible();
    await expect(page.locator('#search-error')).toContainText(/origin|destination|date/i);
  });

  test('swap cities reverses the route', async ({ page }) => {
    const search = new FlightSearchPage(page);
    await search.origin().selectOption('DEL');
    await search.destination().selectOption('BOM');
    await search.swapCities().click();

    await expect(search.origin()).toHaveValue('BOM');
    await expect(search.destination()).toHaveValue('DEL');
  });

  test('round trip requires a return date after departure', async ({ page }) => {
    await page.locator('#trip-round').check();
    await page.locator('#from-city').selectOption('BOM');
    await page.locator('#to-city').selectOption('BLR');
    await page.locator('#depart-date').fill('2026-12-10');
    await page.locator('#return-date').fill('2026-12-09');
    await page.locator('#search-btn').click({ force: true });

    await expect(page.locator('#search-error')).toContainText(/return/i);
  });

  test('non-stop filter and maximum traveller selections remain usable', async ({ page }) => {
    await page.locator('#nonstop-only').check({ force: true });
    await page.locator('#cabin-class').selectOption({ label: 'Business' });
    await page.locator('#adults').selectOption('9');
    await page.locator('#children').selectOption('8');
    await page.locator('#infants').selectOption('4');

    await expect(page.locator('#adults')).toHaveValue('9');
    await expect(page.locator('#children')).toHaveValue('8');
    await expect(page.locator('#infants')).toHaveValue('4');
  });
});
