import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  get items() {
    return this.page.locator('.cart_item');
  }

  itemTitle(index: number) {
    return this.page.locator(`[data-test="item-${index}-title-link"]`);
  }

  itemPrice() {
    return this.page.locator('[data-test="inventory-item-price"]');
  }

  quantity() {
    return this.page.locator('.cart_quantity');
  }

  async continueShopping(): Promise<void> {
    await this.page.locator('[data-test="continue-shopping"]').click();
  }

  async checkout(): Promise<void> {
    await this.page.locator('[data-test="checkout"]').click();
  }

  async removeProduct(product: string): Promise<void> {
    await this.page.locator(`[data-test="remove-${product}"]`).click();
  }
}
