import { BasePage } from './BasePage';

export class CheckoutInformationPage extends BasePage {
  async enterCustomer(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.page.locator('[data-test="firstName"]').fill(firstName);
    await this.page.locator('[data-test="lastName"]').fill(lastName);
    await this.page.locator('[data-test="postalCode"]').fill(postalCode);
  }

  async continue(): Promise<void> {
    await this.page.locator('[data-test="continue"]').click();
  }

  async cancel(): Promise<void> {
    await this.page.locator('[data-test="cancel"]').click();
  }

  firstName() {
    return this.page.locator('[data-test="firstName"]');
  }

  lastName() {
    return this.page.locator('[data-test="lastName"]');
  }

  postalCode() {
    return this.page.locator('[data-test="postalCode"]');
  }

  error() {
    return this.page.locator('[data-test="error"]');
  }
}
