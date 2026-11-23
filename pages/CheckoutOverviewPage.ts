import { BasePage } from './BasePage';

export class CheckoutOverviewPage extends BasePage {
  get items() {
    return this.page.locator('.cart_item');
  }

  itemTitle(index: number) {
    return this.page.locator(`[data-test="item-${index}-title-link"]`);
  }

  async finish(): Promise<void> {
    await this.page.locator('[data-test="finish"]').click();
  }
}
