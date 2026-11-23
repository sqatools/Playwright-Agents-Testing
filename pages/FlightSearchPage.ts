import { BasePage } from './BasePage';

export class FlightSearchPage extends BasePage {
  origin() {
    return this.page.locator('#from-city');
  }

  destination() {
    return this.page.locator('#to-city');
  }

  departDate() {
    return this.page.locator('#depart-date');
  }

  returnDate() {
    return this.page.locator('#return-date');
  }

  async search(origin: string, destination: string, departDate: string): Promise<void> {
    await this.origin().selectOption(origin);
    await this.destination().selectOption(destination);
    await this.departDate().fill(departDate);
    await this.page.locator('#search-btn').click();
  }

  swapCities() {
    return this.page.locator('#swap-cities');
  }

  nonstop() {
    return this.page.locator('#nonstop-only');
  }

  sort() {
    return this.page.locator('#sort-by');
  }

  async selectFirstFlight(): Promise<void> {
    await this.page.getByRole('button', { name: 'Select' }).first().click();
  }

  flightCards() {
    return this.page.getByRole('button', { name: 'Select' });
  }
}
