import { test, expect } from '@playwright/test';
import { DummyBookingLoginPage } from '../../pages/DummyBookingLoginPage';
import { FlightSearchPage } from '../../pages/FlightSearchPage';
import { BookingFlowPage } from '../../pages/BookingFlowPage';
import { dummyBookingData } from '../../test-data/dummyBookingData';

test.describe('Dummy Booking End-to-End', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await new DummyBookingLoginPage(page).login(
      dummyBookingData.validUser.username,
      dummyBookingData.validUser.password,
    );
  });

  test('successful card payment confirms a one-way booking', async ({ page }) => {
    // 1. Search and select the lowest flight.
    const search = new FlightSearchPage(page);
    await search.search('DEL', 'BOM', '2026-12-01');
    await search.selectFirstFlight();

    // 2. Enter passenger details and reach payment.
    const booking = new BookingFlowPage(page);
    await expect(page.getByRole('heading', { name: 'Traveller details' })).toBeVisible();
    await booking.fillPassengerDummyDetails();
    await booking.continueToSeats();
    await booking.autoAssignSeats();
    await booking.continueToPayment();

    await expect(page.getByRole('heading', { name: 'Review and pay' })).toBeVisible();
    await expect(page.locator('#pm-card')).toBeChecked();

    // 3. Apply a promo and complete card payment.
    await booking.applyPromo('SQA100');
    await expect(page.getByText(/Promo applied: ₹100 off/)).toBeVisible();
    await expect(page.getByTestId('fare-summary-payment').getByTestId('total-price')).toHaveText('₹3,896');

    await booking.cardName().fill(dummyBookingData.successCard.name);
    await booking.cardNumber().fill(dummyBookingData.successCard.number);
    await booking.cardExpiry().fill(dummyBookingData.successCard.expiry);
    await booking.cardCvv().fill(dummyBookingData.successCard.cvv);
    await booking.acceptTerms().check();
    await booking.pay();

    // 4. Verify final confirmation.
    await expect(page.getByText('Booking confirmed!', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Booking ID SQA-/)).toBeVisible();
    await expect(page.getByText(/Amount paid: ₹3,896 · Card ending 1111/)).toBeVisible();
  });

  test('declined card keeps the user on payment', async ({ page }) => {
    const search = new FlightSearchPage(page);
    await search.search('DEL', 'BOM', '2026-12-01');
    await search.selectFirstFlight();

    const booking = new BookingFlowPage(page);
    await booking.fillPassengerDummyDetails();
    await booking.continueToSeats();
    await booking.autoAssignSeats();
    await booking.continueToPayment();

    await booking.cardName().fill(dummyBookingData.declinedCard.name);
    await booking.cardNumber().fill(dummyBookingData.declinedCard.number);
    await booking.cardExpiry().fill(dummyBookingData.declinedCard.expiry);
    await booking.cardCvv().fill(dummyBookingData.declinedCard.cvv);
    await booking.acceptTerms().check();
    await booking.pay();

    await expect(page.getByText('Processing payment…')).toBeVisible();
    await expect(page.getByText('Booking confirmed!', { exact: true })).toHaveCount(0, { timeout: 10000 });
  });

  test('terms and required card fields block payment', async ({ page }) => {
    const search = new FlightSearchPage(page);
    await search.search('DEL', 'BOM', '2026-12-01');
    await search.selectFirstFlight();

    const booking = new BookingFlowPage(page);
    await booking.fillPassengerDummyDetails();
    await booking.continueToSeats();
    await booking.autoAssignSeats();
    await booking.continueToPayment();

    await booking.pay();
    await expect(booking.cardName()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Review and pay' })).toBeVisible();
  });

  test('UPI success completes a booking', async ({ page }) => {
    const search = new FlightSearchPage(page);
    await search.search('DEL', 'BOM', '2026-12-01');
    await search.selectFirstFlight();

    const booking = new BookingFlowPage(page);
    await booking.fillPassengerDummyDetails();
    await booking.continueToSeats();
    await booking.autoAssignSeats();
    await booking.continueToPayment();

    await page.locator('#pm-upi').check();
    await expect(page.locator('#upi-id')).toBeVisible();
    await page.locator('#upi-id').fill('success@upi');
    await booking.acceptTerms().check();
    await booking.pay();

    await expect(page.getByText('Booking confirmed!', { exact: true })).toBeVisible({ timeout: 10000 });
  });
});
