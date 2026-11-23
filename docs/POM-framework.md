# Page Object Model framework

## Structure

- `pages/` - Base page, page objects, and PageManager
- `fixture/` - Playwright custom fixtures
- `test/` - Automated test specifications
- `test-data/` - Reusable credentials and test data
- `utils/` - Shared assertions and helpers
- `report/` - HTML Playwright reports
- `docs/` - Framework documentation

## Usage

Run the cart suite:

```powershell
npm run test:cart
```

Run all tests in Chromium:

```powershell
npm run test:chromium
```

Open the last HTML report:

```powershell
npm run report
```

Tests use the custom `pages` fixture. `PageManager` creates and exposes the Login, Inventory,
Cart, Checkout Information, Checkout Overview, and Checkout Complete page objects. Shared behavior
belongs in `BasePage`; reusable test values belong in `test-data/`.
