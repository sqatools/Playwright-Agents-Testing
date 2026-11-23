import { BasePage } from './BasePage';

export class DummyBookingLoginPage extends BasePage {
  async open(): Promise<void> {
    await this.navigate('https://sqatools.in/dummy-booking-website/');
  }

  async login(username: string, password: string, remember = false): Promise<void> {
    await this.open();
    await this.page.locator('#login-username').fill(username);
    await this.page.locator('#login-password').fill(password);
    if (remember) {
      await this.page.locator('#remember-me').check();
    }
    await this.page.locator('#login-btn').click();
  }

  async logout(): Promise<void> {
    await this.page.locator('#logout-btn').click();
  }

  togglePassword() {
    return this.page.locator('#toggle-password');
  }

  password() {
    return this.page.locator('#login-password');
  }
}
