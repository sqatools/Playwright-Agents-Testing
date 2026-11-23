import { BasePage } from './BasePage';

export type ProductSlug =
  | 'sauce-labs-backpack'
  | 'sauce-labs-bike-light'
  | 'sauce-labs-onesie';

export class InventoryPage extends BasePage {
  async addProduct(product: ProductSlug): Promise<void> {
    await this.page.locator(`[data-test="add-to-cart-${product}"]`).click();
  }

  async removeProduct(product: ProductSlug): Promise<void> {
    await this.page.locator(`[data-test="remove-${product}"]`).click();
  }

  removeButton(product: ProductSlug) {
    return this.page.locator(`[data-test="remove-${product}"]`);
  }

  addButton(product: ProductSlug) {
    return this.page.locator(`[data-test="add-to-cart-${product}"]`);
  }

  async openCart(): Promise<void> {
    await this.page.locator('[data-test="shopping-cart-link"]').click();
  }
}
