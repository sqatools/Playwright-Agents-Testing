import { BasePage } from './BasePage';

export class BookingFlowPage extends BasePage {
  async fillPassengerDummyDetails(): Promise<void> {
    await this.page.locator('#fill-dummy').click();
  }

  async continueToSeats(): Promise<void> {
    await this.page.locator('#pax-continue').click();
  }

  async autoAssignSeats(): Promise<void> {
    await this.page.locator('#auto-seats').click();
  }

  async continueToPayment(): Promise<void> {
    await this.page.locator('#seats-continue').click();
  }

  cardName() {
    return this.page.locator('#card-name');
  }

  cardNumber() {
    return this.page.locator('#card-number');
  }

  cardExpiry() {
    return this.page.locator('#card-expiry');
  }

  cardCvv() {
    return this.page.locator('#card-cvv');
  }

  acceptTerms() {
    return this.page.locator('#accept-terms');
  }

  promoCode() {
    return this.page.locator('#promo-code');
  }

  async applyPromo(code: string): Promise<void> {
    await this.promoCode().fill(code);
    await this.page.locator('#apply-promo').click();
  }

  async pay(): Promise<void> {
    await this.page.locator('#pay-btn').click();
  }
}
