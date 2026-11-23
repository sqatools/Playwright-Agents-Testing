# Sauce Demo Cart and Checkout Test Plan

## Application Overview

Validate Sauce Demo cart and checkout behavior using the existing tests/seed.spec.ts login setup. Each scenario starts from a fresh browser context with the seed test logging in as standard_user, an empty cart, and the Products page. Cover product additions/removals, cart badge and contents, required checkout information, cancellation, order summary, and order completion.

## Test Scenarios

### 1. Cart and Checkout

**Seed:** `tests/seed.spec.ts`

#### 1.1. Cart badge and product controls update when products are added and removed

**File:** `tests/cart-checkout/add-remove-products-and-verify-cart-badge.spec.ts`

**Steps:**
  1. Start a fresh run using tests/seed.spec.ts and verify the Products page opens with no cart badge.
    - expect: The Products page is displayed.
    - expect: The cart is empty and its badge is not shown.
  2. Add Sauce Labs Backpack and Sauce Labs Bike Light from the product list.
    - expect: Each product button changes from Add to cart to Remove.
    - expect: The cart badge displays 2 items.
  3. Remove the Backpack using its product-list Remove button.
    - expect: The Backpack button changes back to Add to cart.
    - expect: The cart badge decreases to 1 item.
  4. Open the cart.
    - expect: Only Sauce Labs Bike Light is listed with quantity 1.
    - expect: The cart badge displays 1 item.
  5. Remove Sauce Labs Bike Light from the cart.
    - expect: The cart has no product rows.
    - expect: The cart badge is no longer shown.

#### 1.2. Cart contents persist when navigating between products and cart

**File:** `tests/cart-checkout/cart-persists-when-continuing-shopping.spec.ts`

**Steps:**
  1. Start a fresh run using tests/seed.spec.ts and add Sauce Labs Onesie.
    - expect: The cart badge displays 1 item.
  2. Open the cart and verify Sauce Labs Onesie is present with quantity 1.
    - expect: The cart contains the selected item and its price.
  3. Select Continue Shopping, then reopen the cart from the Products page.
    - expect: The Products page is shown after continuing shopping.
    - expect: The cart badge remains 1 and the Onesie remains in the cart.

#### 1.3. Checkout requires first name, last name, and postal code

**File:** `tests/cart-checkout/checkout-information-required-fields.spec.ts`

**Steps:**
  1. Start a fresh run using tests/seed.spec.ts, add one product, open the cart, and select Checkout.
    - expect: The Checkout: Your Information form is displayed with First Name, Last Name, and Zip/Postal Code fields.
  2. Leave all fields empty and select Continue.
    - expect: Checkout remains on the information page.
    - expect: An error indicates that First Name is required.
  3. Enter a first name only and select Continue.
    - expect: Checkout remains on the information page.
    - expect: An error indicates that Last Name is required.
  4. Enter a last name while leaving Zip/Postal Code empty, then select Continue.
    - expect: Checkout remains on the information page.
    - expect: An error indicates that Zip/Postal Code is required.
  5. Enter a postal code and select Continue.
    - expect: The form advances to Checkout: Overview.
    - expect: The selected cart item is still present.

#### 1.4. Cancel checkout returns to the cart without losing cart contents

**File:** `tests/cart-checkout/cancel-checkout-preserves-cart.spec.ts`

**Steps:**
  1. Start a fresh run using tests/seed.spec.ts, add Sauce Labs Backpack, open the cart, and select Checkout.
    - expect: The Checkout: Your Information page opens.
  2. Select Cancel.
    - expect: The Your Cart page is displayed.
    - expect: The cart still contains Sauce Labs Backpack and the badge displays 1 item.

#### 1.5. Valid checkout displays the correct summary and completes the order

**File:** `tests/cart-checkout/complete-order-and-verify-summary.spec.ts`

**Steps:**
  1. Start a fresh run using tests/seed.spec.ts, add Sauce Labs Backpack and Sauce Labs Bike Light, open the cart, and select Checkout.
    - expect: The cart badge displays 2 items.
  2. Enter first name Test, last name Customer, and postal code 10001, then select Continue.
    - expect: The Checkout: Overview page is displayed.
    - expect: Both selected products appear with quantity 1 each.
    - expect: Payment Information shows SauceCard #31337.
    - expect: Shipping Information shows Free Pony Express Delivery!.
    - expect: Item total is $39.98, tax is $3.20, and total is $43.18.
  3. Select Finish.
    - expect: The Checkout: Complete! page is displayed.
    - expect: The page shows Thank you for your order! and the order-dispatch confirmation.
    - expect: The cart is empty and its badge is no longer shown.
