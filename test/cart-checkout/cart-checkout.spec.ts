import { test, expect } from '../../fixture/pomFixture';
import { expectTitle } from '../../utils/assertions';
import { customer } from '../../test-data/testData';

test.describe('Cart and Checkout', () => {
  test('Cart badge and product controls update when products are added and removed', async ({ page, pages }) => {
    await expectTitle(page, 'Products');
    await expect(pages.inventory.cartBadge()).toHaveCount(0);

    await pages.inventory.addProduct('sauce-labs-backpack');
    await expect(pages.inventory.removeButton('sauce-labs-backpack')).toBeVisible();
    await expect(pages.inventory.cartBadge()).toHaveText('1');
    await pages.inventory.addProduct('sauce-labs-bike-light');
    await expect(pages.inventory.removeButton('sauce-labs-bike-light')).toBeVisible();
    await expect(pages.inventory.cartBadge()).toHaveText('2');

    await pages.inventory.removeProduct('sauce-labs-backpack');
    await expect(pages.inventory.addButton('sauce-labs-backpack')).toBeVisible();
    await expect(pages.inventory.cartBadge()).toHaveText('1');

    await pages.inventory.openCart();
    await expect(pages.cart.items).toHaveCount(1);
    await expect(pages.cart.itemTitle(0)).toHaveText('Sauce Labs Bike Light');
    await expect(pages.cart.quantity()).toHaveText('1');
    await expect(pages.cart.cartBadge()).toHaveText('1');

    await pages.cart.removeProduct('sauce-labs-bike-light');
    await expect(pages.cart.items).toHaveCount(0);
    await expect(pages.cart.cartBadge()).toHaveCount(0);
  });

  test('Cancel checkout returns to the cart without losing cart contents', async ({ page, pages }) => {
    await pages.inventory.addProduct('sauce-labs-backpack');
    await pages.inventory.openCart();
    await pages.cart.checkout();
    await expectTitle(page, 'Checkout: Your Information');

    await pages.checkoutInformation.cancel();
    await expectTitle(page, 'Your Cart');
    await expect(pages.cart.cartBadge()).toHaveText('1');
    await expect(pages.cart.items.filter({ hasText: 'Sauce Labs Backpack' })).toBeVisible();
  });

  test('Cart contents persist when navigating between products and cart', async ({ page, pages }) => {
    await expectTitle(page, 'Products');
    await pages.inventory.addProduct('sauce-labs-onesie');
    await expect(pages.inventory.cartBadge()).toHaveText('1');

    await pages.inventory.openCart();
    await expect(pages.cart.items).toHaveCount(1);
    await expect(pages.cart.itemTitle(2)).toHaveText('Sauce Labs Onesie');
    await expect(pages.cart.quantity()).toHaveText('1');
    await expect(pages.cart.itemPrice()).toHaveText('$7.99');

    await pages.cart.continueShopping();
    await expectTitle(page, 'Products');
    await expect(pages.inventory.cartBadge()).toHaveText('1');
    await pages.inventory.openCart();
    await expect(pages.cart.itemTitle(2)).toHaveText('Sauce Labs Onesie');
    await expect(pages.cart.cartBadge()).toHaveText('1');
  });

  test('Checkout requires first name, last name, and postal code', async ({ page, pages }) => {
    await pages.inventory.addProduct('sauce-labs-backpack');
    await pages.inventory.openCart();
    await pages.cart.checkout();
    await expectTitle(page, 'Checkout: Your Information');
    await expect(pages.checkoutInformation.firstName()).toBeVisible();
    await expect(pages.checkoutInformation.lastName()).toBeVisible();
    await expect(pages.checkoutInformation.postalCode()).toBeVisible();

    await pages.checkoutInformation.continue();
    await expectTitle(page, 'Checkout: Your Information');
    await expect(pages.checkoutInformation.error()).toHaveText('Error: First Name is required');

    await pages.checkoutInformation.firstName().fill('Test');
    await pages.checkoutInformation.continue();
    await expectTitle(page, 'Checkout: Your Information');
    await expect(pages.checkoutInformation.error()).toHaveText('Error: Last Name is required');

    await pages.checkoutInformation.lastName().fill('Customer');
    await pages.checkoutInformation.continue();
    await expectTitle(page, 'Checkout: Your Information');
    await expect(pages.checkoutInformation.error()).toHaveText('Error: Postal Code is required');

    await pages.checkoutInformation.postalCode().fill('10001');
    await pages.checkoutInformation.continue();
    await expectTitle(page, 'Checkout: Overview');
    await expect(pages.checkoutOverview.itemTitle(4)).toHaveText('Sauce Labs Backpack');
  });

  test('Valid checkout displays the correct summary and completes the order', async ({ page, pages }) => {
    await pages.inventory.addProduct('sauce-labs-backpack');
    await pages.inventory.addProduct('sauce-labs-bike-light');
    await expect(pages.inventory.cartBadge()).toHaveText('2');
    await pages.inventory.openCart();
    await pages.cart.checkout();
    await expectTitle(page, 'Checkout: Your Information');

    await pages.checkoutInformation.enterCustomer(
      customer.firstName,
      customer.lastName,
      customer.postalCode,
    );
    await pages.checkoutInformation.continue();
    await expectTitle(page, 'Checkout: Overview');

    await expect(pages.checkoutOverview.items).toHaveCount(2);
    await expect(
      pages.checkoutOverview.items.filter({ hasText: 'Sauce Labs Backpack' }).locator('.cart_quantity'),
    ).toHaveText('1');
    await expect(
      pages.checkoutOverview.items.filter({ hasText: 'Sauce Labs Bike Light' }).locator('.cart_quantity'),
    ).toHaveText('1');
    await expect(page.getByText('SauceCard #31337', { exact: true })).toBeVisible();
    await expect(page.getByText('Free Pony Express Delivery!', { exact: true })).toBeVisible();
    await expect(page.getByText('Item total: $39.98', { exact: true })).toBeVisible();
    await expect(page.getByText('Tax: $3.20', { exact: true })).toBeVisible();
    await expect(page.getByText('Total: $43.18', { exact: true })).toBeVisible();

    await pages.checkoutOverview.finish();
    await expectTitle(page, 'Checkout: Complete!');
    await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
    await expect(
      page.getByText('Your order has been dispatched, and will arrive just as fast as the pony can get there!'),
    ).toBeVisible();
    await expect(pages.checkoutComplete.cartBadge()).toHaveCount(0);
  });
});
