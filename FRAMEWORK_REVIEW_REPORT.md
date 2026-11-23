# Playwright Automation Framework Review Report

**Framework:** Playwright with TypeScript  
**Review date:** 2026-11-20  
**Review scope:** `DeepeshY/Playwright-Agents`  
**Overall quality score:** 5.5/10

---

## 1. Executive Summary

The framework is a functional Playwright TypeScript automation project using Page Object Model classes, a custom Playwright fixture, HTML and Allure reporting, and GitHub Actions CI.

### Strengths

- Playwright test discovery succeeds.
- Chromium, Firefox, and WebKit projects are configured.
- Tests run independently through Playwright browser contexts.
- POM classes separate UI interactions from test cases.
- Reusable PageManager and fixture components are present.
- Playwright auto-waiting is used for most interactions.
- Trace, video, and screenshot settings are available.
- HTML and Allure reporters are configured.
- GitHub Actions installs dependencies and browsers.
- The `.gitignore` excludes common generated and authentication directories.

### Areas Requiring Improvement

- CI does not upload the configured Playwright report directory.
- CI forces a worker count of one, despite parallel test configuration.
- The shared fixture automatically logs into SauceDemo.
- Environment URLs and credentials are mostly hardcoded.
- Fixed flight dates may become stale.
- Generated and inactive files remain under a second test directory.
- Artifact collection is enabled for all runs instead of failures only.
- Retry, reporting, dependency caching, and secret handling can be improved.
- API automation is not currently implemented.
- A no-secret and no-real-card-data policy is not explicitly enforced.

### Validation Performed

The following command was executed successfully:

```powershell
npx playwright test test/cart-checkout/cart-checkout.spec.ts test/dummy-booking/authentication.spec.ts --project=chromium
```

**Result:** 8 Chromium tests passed.

The test discovery command also confirmed:

- 57 tests across 5 active spec files
- 19 tests per browser project
- 3 configured browser projects

---

## 2. Framework Architecture Overview

```text
Playwright Test Runner
          |
          v
Custom POM Fixture
  fixture/pomFixture.ts
          |
          v
PageManager
  pages/PageManager.ts
          |
          +-- LoginPage
          +-- InventoryPage
          +-- CartPage
          +-- CheckoutInformationPage
          +-- CheckoutOverviewPage
          +-- CheckoutCompletePage
          +-- DummyBookingLoginPage
          +-- FlightSearchPage
          +-- BookingFlowPage
          |
          v
Test Spec Files
          |
          v
Reports and Artifacts
  - Playwright HTML report
  - Allure results
  - Traces
  - Videos
  - Screenshots
```

---

## 3. Technology and Component Inventory

| Area | Implementation |
|---|---|
| Language | TypeScript |
| Test runner | `@playwright/test` |
| Playwright version | Package specification `^1.65.1` |
| Node types | `@types/node ^26.6.6` |
| Browser projects | Chromium, Firefox, WebKit |
| Architecture | Page Object Model |
| Fixture | Custom POM fixture |
| Reporting | HTML and Allure |
| CI | GitHub Actions |
| Test data | TypeScript modules |
| Active test directory | `test/` |
| Additional test directory | `tests/` |

### Important Files

- [package.json](package.json)
- [playwright.config.ts](playwright.config.ts)
- [.github/workflows/playwright.yml](.github/workflows/playwright.yml)
- [fixture/pomFixture.ts](fixture/pomFixture.ts)
- [pages/PageManager.ts](pages/PageManager.ts)
- [test-data/testData.ts](test-data/testData.ts)
- [test-data/dummyBookingData.ts](test-data/dummyBookingData.ts)

---

## 4. Existing Framework Structure

```text
Playwright-Agents/
  .github/
    workflows/
      playwright.yml
      copilot-setup-steps.yml
  fixture/
    pomFixture.ts
  pages/
    BasePage.ts
    PageManager.ts
    LoginPage.ts
    InventoryPage.ts
    CartPage.ts
    CheckoutInformationPage.ts
    CheckoutOverviewPage.ts
    CheckoutCompletePage.ts
    DummyBookingLoginPage.ts
    FlightSearchPage.ts
    BookingFlowPage.ts
  test/
    cart-checkout/
    dummy-booking/
    seed.spec.ts
  tests/
    example.spec.ts
    seed.spec.ts
  test-data/
    testData.ts
    dummyBookingData.ts
  utils/
    assertions.ts
  playwright.config.ts
  package.json
```

---

## 5. Detailed Code Review Findings

## Issue PFW-001

### Issue Title

CI uploads the wrong Playwright report directory

### Severity

High

### Category

CI/CD and Reporting

### File Location

[.github/workflows/playwright.yml](.github/workflows/playwright.yml)

Relevant lines: the artifact `path` is `playwright-report/`.

[playwright.config.ts](playwright.config.ts) writes the report to `report/playwright-report/`.

### Current Implementation

```yaml
- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

The HTML reporter in the configuration uses:

```ts
['html', { outputFolder: 'report/playwright-report', open: 'never' }]
```

### Problem Identified

The workflow artifact path does not match the configured HTML report output path.

### Impact

- The HTML report may be missing from the GitHub artifact.
- Engineers may investigate failures without the report.
- Allure and test traces are not explicitly published.

### Recommended Solution

```yaml
- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}
  with:
    name: playwright-artifacts
    path: |
      report/playwright-report/
      allure-results/
      test-results/
    retention-days: 30
```

### Priority

P1

---

## Issue PFW-002

### Issue Title

CI disables parallel execution

### Severity

High

### Category

Parallel Execution

### File Location

[playwright.config.ts](playwright.config.ts)

Relevant setting:

```ts
workers: process.env.CI ? 1 : undefined,
```

### Problem Identified

CI is always configured to use one worker, even though `fullyParallel` is enabled.

### Impact

- Longer CI execution time
- Slow test feedback
- Underutilization of GitHub-hosted runner resources
- Parallel isolation is not exercised in CI

### Recommended Solution

Start conservatively:

```ts
workers: process.env.CI ? 2 : undefined,
```

Increase only after confirming tests remain isolated and external services tolerate concurrent usage.

### Priority

P1

---

## Issue PFW-003

### Issue Title

The POM fixture always logs into SauceDemo

### Severity

Medium

### Category

Fixtures and Test Design

### File Location

[fixture/pomFixture.ts](fixture/pomFixture.ts)

### Current Implementation

```ts
pages: async ({ page }, use) => {
  const pages = new PageManager(page);
  await pages.login.login(credentials.username, credentials.password);
  await use(pages);
}
```

### Problem Identified

Every test that requests `pages` is forced through login, even if it tests another state or functionality.

### Impact

- Login code is coupled to unrelated tests.
- Logged-out behavior cannot be tested cleanly with this fixture.
- Navigation and authentication add execution cost.
- Failure in login prevents all fixture-dependent tests from being meaningful.

### Recommended Solution

Create a simple POM fixture without automatic login:

```ts
type PomFixtures = {
  pages: PageManager;
};

export const test = base.extend<PomFixtures>({
  pages: async ({ page }, use) => {
    await use(new PageManager(page));
  },
});
```

Then use one of these patterns:

```ts
test.beforeEach(async ({ pages }) => {
  await pages.login.login(credentials.username, credentials.password);
});
```

Or add a separate authenticated fixture.

### Priority

P1

---

## Issue PFW-004

### Issue Title

Configuration and test credentials are hardcoded

### Severity

Medium

### Category

Configuration and Security

### File Locations

- [test-data/testData.ts](test-data/testData.ts)
- [test-data/dummyBookingData.ts](test-data/dummyBookingData.ts)
- [pages/DummyBookingLoginPage.ts](pages/DummyBookingLoginPage.ts)
- [pages/LoginPage.ts](pages/LoginPage.ts)
- [playwright.config.ts](playwright.config.ts)

### Current Implementation

```ts
export const credentials = {
  username: 'standard_user',
  password: 'secret_sauce',
};
```

Additional usernames and passwords are present in [dummyBookingData.ts](test-data/dummyBookingData.ts).

The application URLs are also hardcoded in POM methods.

### Problem Identified

Environment, credentials, and test data are not centrally controlled.

### Impact

- Tests cannot easily switch environments.
- Real or sensitive credentials may accidentally replace demo credentials.
- Secret rotation requires source changes.
- URL and data changes require editing multiple files.

### Recommended Solution

Use environment variables for real credentials and a `baseURL` for the environment:

```ts
const sauceUsername = process.env.SAUCE_USERNAME;
const saucePassword = process.env.SAUCE_PASSWORD;

if (!sauceUsername || !saucePassword) {
  throw new Error('SAUCE_USERNAME and SAUCE_PASSWORD are required');
}
```

```ts
use: {
  baseURL: process.env.BASE_URL,
}
```

Store real credentials in CI secrets and local environment variables. Keep public demo credentials limited to public demo sites.

### Priority

P1

---

## Issue PFW-005

### Issue Title

Flight-search tests use fixed future dates

### Severity

Medium

### Category

Test Data Management

### File Locations

- [test/dummy-booking/flight-search.spec.ts](test/dummy-booking/flight-search.spec.ts)
- [test/dummy-booking/end-to-end.spec.ts](test/dummy-booking/end-to-end.spec.ts)

### Current Implementation

The tests use values such as `2026-12-01`, `2026-12-10`, and `2026-12-09`.

### Problem Identified

The dates are not tied to the current date and will become stale.

### Impact

- Tests may eventually search past dates.
- Date-dependent validation may change.
- Availability-dependent bookings may become unstable.

### Recommended Solution

Generate stable future dates at runtime:

```ts
function futureDate(daysFromNow: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

const departureDate = futureDate(30);
const returnDate = futureDate(37);
```

Keep date values in test-data helpers rather than hardcoding them in every spec.

### Priority

P2

---

## Issue PFW-006

### Issue Title

Two test directories create a discovery ambiguity

### Severity

Medium

### Category

Project Structure

### File Locations

- [playwright.config.ts](playwright.config.ts)
- [test/](test/)
- [tests/](tests/)

### Current Implementation

```ts
testDir: './test',
```

Files exist in both `test/` and `tests/`, but Playwright discovery only lists files under `test/`.

### Problem Identified

There are duplicated concepts and potentially inactive example files.

### Impact

- Engineers may edit a file that CI never executes.
- The framework's test inventory is difficult to understand.
- Seed/example files can be mistaken for real coverage.

### Recommended Solution

Choose one directory and migrate or remove obsolete files. The conventional and clearest structure is:

```text
tests/
  cart-checkout/
  dummy-booking/
```

Alternatively, keep `test/` and remove `tests/example.spec.ts` and the duplicate seed file.

### Priority

P2

---

## Issue PFW-007

### Issue Title

Artifacts are collected for every successful run

### Severity

Medium

### Category

Performance and Security

### File Location

[playwright.config.ts](playwright.config.ts)

### Current Implementation

```ts
trace: 'on',
video: 'on',
screenshot: 'on',
```

### Problem Identified

Playwright records successful and failed tests and writes substantial artifacts.

### Impact

- Increased runtime and storage usage
- Longer CI artifact uploads
- Potential exposure of entered form values and sensitive text
- Large reports for small suites

### Recommended Solution

```ts
use: {
  trace: 'retain-on-failure',
  video: 'retain-on-failure',
  screenshot: 'only-on-failure',
}
```

Use a failure-only configuration by default and temporarily increase collection for targeted debugging.

### Priority

P2

---

## Issue PFW-008

### Issue Title

CI retries may conceal unstable tests

### Severity

Medium

### Category

Stability and CI/CD

### File Location

[playwright.config.ts](playwright.config.ts)

### Current Implementation

```ts
retries: process.env.CI ? 2 : 0,
```

### Problem Identified

Every CI failure is retried twice.

### Impact

- Flakes can become passively accepted.
- Retry history slows CI feedback.
- Engineers may treat a later successful retry as a clean test.
- Root causes receive less immediate attention.

### Recommended Solution

Begin with one retry:

```ts
retries: process.env.CI ? 1 : 0,
```

Track repeated first-attempt failures, stabilize the first failure, and avoid increasing retries as a substitute for debugging.

### Priority

P2

---

## Issue PFW-009

### Issue Title

Forced clicks weaken invalid-action tests

### Severity

Medium

### Category

Wait and Synchronization

### File Location

[test/dummy-booking/flight-search.spec.ts](test/dummy-booking/flight-search.spec.ts)

### Current Implementation

Multiple invalid-search tests use:

```ts
await page.locator('#search-btn').click({ force: true });
```

### Problem Identified

The tests bypass normal Playwright actionability validation.

### Impact

- It may hide whether a normal user could click the control.
- It can mask layout or disabled-state defects.
- It can reduce the validity of negative validation tests.

### Recommended Solution

Use normal Playwright clicks unless the test is intentionally verifying behavior with an overlay or invalid layout state:

```ts
await page.locator('#search-btn').click();
```

Investigate each forced click and replace it only if the application behavior requires it.

### Priority

P2

---

## Issue PFW-010

### Issue Title

Tests use positional item-title indices

### Severity

Medium

### Category

Locator Strategy and Test Resilience

### File Locations

- [pages/CartPage.ts](pages/CartPage.ts)
- [pages/CheckoutOverviewPage.ts](pages/CheckoutOverviewPage.ts)
- [test/cart-checkout/cart-checkout.spec.ts](test/cart-checkout/cart-checkout.spec.ts)

### Current Implementation

```ts
itemTitle(index: number) {
  return this.page.locator(`[data-test="item-${index}-title-link"]`);
}
```

The tests call indices such as `0`, `2`, and `4`.

### Problem Identified

The methods appear to encode implementation-specific test IDs rather than querying items by visible product name.

### Impact

- Positional/index-based locators may break if application item IDs change.
- Product assertions become less readable.
- Cart and overview logic duplicate selector strategy.

### Recommended Solution

Prefer semantic locators and product filtering:

```ts
itemByName(name: string) {
  return this.items.filter({ hasText: name });
}

itemTitle(name: string) {
  return this.itemByName(name).locator('[data-test="inventory-item-name"]');
}
```

Use role and text locators where supported.

### Priority

P2

---

## Issue PFW-011

### Issue Title

Locator strategy mixes semantic and implementation-specific selectors

### Severity

Medium

### Category

Locator Strategy

### Examples

- Playwright role, text, placeholder, and label locators are used.
- Several tests use ID selectors such as `#login-username`.
- Several POM methods use data-test and CSS selectors.

### Problem Identified

The framework does not consistently follow the preferred semantic locator hierarchy.

### Impact

- Maintainability varies by page.
- ID and CSS locators can be more coupled to implementation.
- Selector quality depends on which engineer wrote the test.

### Recommended Solution

Follow this priority:

1. `getByRole()`
2. `getByLabel()`
3. `getByPlaceholder()`
4. `getByText()`
5. `getByTestId()`
6. CSS selectors
7. XPath only when justified

Replace stable application IDs with semantic locators where possible.

### Priority

P2

---

## Issue PFW-012

### Issue Title

API automation is not implemented

### Severity

Medium

### Category

API Automation

### Current Implementation

No reusable API client or API request test area is present.

### Impact

- UI tests perform setup that could be faster with API support.
- Authentication and data setup cannot be reused efficiently.
- API contract coverage is absent.

### Recommended Solution

Start with a small API client only if this framework has API contracts in scope:

```ts
import { APIRequestContext, APIResponse } from '@playwright/test';

export class BookingApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async healthCheck(): Promise<APIResponse> {
    return this.request.get('/health');
  }
}
```

Do not introduce API automation for an out-of-scope application.

### Priority

P3

---

## Issue PFW-013

### Issue Title

The report scripts and CI artifact names are inconsistent

### Severity

Low

### Category

Reporting and Usability

### File Location

[package.json](package.json)

### Problem Identified

The Allure scripts and HTML report script point to valid output paths, but CI publishes a different directory name.

### Impact

- Engineers need to know multiple report locations.
- CI artifact discovery can be confusing.
- Report instructions may become stale.

### Recommended Solution

Add clear scripts:

```json
{
  "scripts": {
    "report:html": "playwright show-report report/playwright-report",
    "report:allure:generate": "allure generate allure-results --clean -o allure-report",
    "report:allure:open": "allure open allure-report"
  }
}
```

Document report locations in the main README.

### Priority

P3

---

## Issue PFW-014

### Issue Title

CI does not publish Allure HTML

### Severity

Low

### Category

CI/CD and Reporting

### Problem Identified

The workflow runs Allure Playwright and produces raw Allure results, but it does not generate or publish the Allure HTML report.

### Impact

- Raw Allure result files require local conversion.
- CI users cannot view Allure directly.
- HTML report publication is inconsistent.

### Recommended Solution

Install Java when generating Allure in CI or publish raw results and generate the report in a dedicated reporting job.

```yaml
- name: Generate Allure report
  if: ${{ !cancelled() }}
  run: npm run allure:generate
```

Upload `allure-report/` alongside `report/playwright-report/`.

### Priority

P3

---

## Issue PFW-015

### Issue Title

CI lacks dependency caching and browser cache policy documentation

### Severity

Low

### Category

CI/CD Performance

### File Location

[.github/workflows/playwright.yml](.github/workflows/playwright.yml)

### Problem Identified

Browser binaries and dependencies are installed every run, and no npm cache configuration is used beyond setup-node defaults.

### Impact

- CI installation time may be higher.
- Browser setup may dominate short suites.
- CI behavior is less optimized.

### Recommended Solution

Use setup-node npm caching:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: lts/*
    cache: npm
```

Retain browser installation because Playwright browser binaries are runner-specific and need restoration or installation on a fresh runner.

### Priority

P3

---

## Issue PFW-016

### Issue Title

No explicit code quality checks exist

### Severity

Medium

### Category

Code Quality

### Problem Identified

The package scripts do not include linting, formatting, type checking, or test coverage commands.

### Impact

- Invalid TypeScript may reach CI.
- Style rules vary between contributors.
- Import and formatting problems are not automatically detected.

### Recommended Solution

Add scripts and CI steps for:

- `tsc --noEmit`
- ESLint
- Prettier or an existing formatter
- Optional test coverage report

Example package scripts:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format:check": "prettier --check ."
  }
}
```

### Priority

P2

---

# 6. Architecture Assessment

## Project Structure

The structure is understandable and sufficiently separated for a small framework.

Potential improvements:

- Consolidate duplicate test directories.
- Separate fixtures and test data into more explicit feature areas.
- Remove generated/example files from active source control.
- Define a stable naming convention for specs and POM classes.

## Page Object Model

### Strengths

- POM classes keep repeated UI interactions out of test cases.
- `PageManager` centralizes page creation.
- `BasePage` provides navigation and shared page behavior.
- Business actions such as `checkout()`, `logout()`, and `pay()` are reusable.

### Risks

- POM classes mix locators and actions in some cases.
- Positional item-title methods are fragile.
- PageManager creates every page for every test.
- Some test files bypass POMs and use raw locators.

## Fixtures and Hooks

### Strengths

- A custom fixture composes `PageManager`.
- Playwright context lifecycle is handled by the runner.

### Risks

- Automatic login is too broad.
- No teardown cleanup is explicitly implemented.
- No environment or API setup fixtures exist.

## Test Case Design

### Strengths

- Tests are mostly independent.
- Each test uses a fresh browser context.
- Assertions describe user-visible state.
- Cart and dummy-booking suites cover positive and negative flows.

### Risks

- Fixed dates may become stale.
- External applications introduce availability or network risk.
- Some tests contain substantial flow setup.

## Locator Strategy

### Preferred ordering

1. `getByRole()`
2. `getByLabel()`
3. `getByPlaceholder()`
4. `getByText()`
5. `getByTestId()`
6. CSS
7. XPath only when justified

The project already uses a mix of semantic and implementation locators. Dummy-booking locators are heavily ID-based.

## Wait and Synchronization

No fixed sleeps or `waitForTimeout()` calls were found in the inspected framework.

Risk remains if Playwright's normal auto-waiting is replaced with forced actions or fixed application timing.

## Test Data Management

Test data is readable and separated into TypeScript modules.

Confirmed improvements:

- Dynamic dates
- Environment-specific configuration
- Unique parallel booking data where required
- Data cleanup when using mutable environments

## API Automation

No API automation implementation was inspected.

This is a confirmed gap only if API coverage is in scope.

## Configuration Management

Configuration is mostly centralized for Playwright settings, but environment URLs and credentials are not.

## Parallel Execution

Tests are independent enough to be eligible for parallel execution. CI explicitly disables it, and external mutable state is not clearly managed.

## CI/CD

GitHub Actions provides dependency installation, browser installation, test execution, and artifact upload.

The artifact path is mismatched with the HTML report output. Allure artifact publishing and npm cache configuration can be improved.

## Code Quality

Code is generally readable. Missing items include:

- TypeScript check script
- Linting
- Formatting check
- Shared environment validation
- Shared date helper
- Shared fixture conventions

---

# 7. Security Assessment

## Confirmed Findings

- Public demo credentials are committed.
- Test-only card numbers are present.
- No real production credentials were found in inspected files.
- `.gitignore` excludes generated reports and Playwright auth directories.

## Potential Risks

- Traces, videos, and screenshots may record entered values.
- Environment variables are not yet defined or documented.
- CI does not show a secret-management strategy.
- Demo card values should remain clearly test-only.

## Security Recommendations

- Never add production credentials to test data files.
- Use CI secrets for real credentials.
- Mask credentials in logs.
- Failure-only artifacts should be the default.
- Add redaction to trace and report configuration where supported.
- Add a review rule preventing real payment or identity data in test files.

---

# 8. Performance and Stability Assessment

## Stability Strengths

- No fixed waits were found.
- Playwright auto-waiting is used.
- Browser contexts isolate test state.
- Assertions use Playwright's retrying expectations.

## Stability Risks

- Fixed dates
- External demo-site availability
- Availability-dependent booking assertions
- Forced interactions
- Parallel disabled in CI

## Performance Opportunities

- Enable safe CI parallelization.
- Failure-only artifacts.
- API-assisted setup where appropriate.
- npm cache in GitHub Actions.
- Shared authenticated storage state only for stable public demo flows.
- Dynamic test data and cleanup.

---

# 9. Framework Quality Scorecard

| Category | Score | Evidence |
|---|---:|---|
| Framework Architecture | 6/10 | POM/PageManager structure exists, but fixture and environment design are basic |
| Project Structure | 6/10 | Clear folders, but duplicate test directories and inactive examples |
| POM Implementation | 7/10 | Reusable page classes and actions; some locators and indexes are fragile |
| Fixtures and Hooks | 6/10 | Custom fixture exists but forces one authentication flow |
| Test Design | 7/10 | Independent Chromium cases passed; fixed dates and external dependencies remain |
| Locator Strategy | 6/10 | Good semantic examples exist, but IDs and implementation selectors are common |
| Wait Strategy | 7/10 | Auto-waiting and retrying assertions; a few forced clicks |
| Test Data Management | 5/10 | Separated into modules, but hardcoded, including fixed dates |
| API Automation | 3/10 | No API client or API test coverage |
| Configuration Management | 4/10 | No centralized environment or baseURL strategy |
| Logging and Reporting | 6/10 | HTML and Allure configured; CI artifact path is incorrect |
| Parallel Execution | 5/10 | Parallel settings exist but CI sets only one worker |
| CI/CD Integration | 4/10 | Workflow runs tests, but report upload and caching need fixes |
| Code Quality | 6/10 | Readable code, but no lint/typecheck/format scripts |
| Security | 6/10 | No real secrets found; demo credentials and broad artifacts remain |
| Scalability | 5/10 | Small suite is understandable, but environment and fixture design are limited |

**Overall score: 5.5/10**

The score is based on inspected source and executed Chromium tests, not assumptions about unavailable API or production environments.

---

# 10. Priority Summary

| Priority | Issue |
|---|---|
| P1 | PFW-001: Correct CI HTML report artifact path |
| P1 | PFW-002: Enable CI workers |
| P1 | PFW-003: Remove automatic login from the general fixture |
| P1 | PFW-004: Centralize environment and credentials |
| P2 | PFW-005: Generate dynamic future dates |
| P2 | PFW-006: Consolidate test directories |
| P2 | PFW-007: Use failure-only artifacts |
| P2 | PFW-008: Reduce and monitor retries |
| P2 | PFW-009: Remove unnecessary forced clicks |
| P2 | PFW-010: Replace positional item-title locators |
| P2 | PFW-011: Standardize semantic locator strategy |
| P2 | PFW-016: Add lint/typecheck/format checks |
| P3 | PFW-012: Add API automation if in scope |
| P3 | PFW-013: Standardize report scripts |
| P3 | PFW-014: Publish or generate Allure report |
| P3 | PFW-015: Improve CI caching |

---

# 11. Standards for the New Framework

The following standards are mandatory for the new framework. They apply to all UI tests, API tests, fixtures, POM classes, utilities, test data, configuration, CI, and reporting.

## 11.1 Technology and Dependency Standards

- Use TypeScript for the framework and tests.
- Keep Playwright and TypeScript dependencies synchronized and versioned through `package-lock.json`.
- Use a supported LTS Node.js release in local development and CI.
- Prefer official Playwright packages and maintained integrations.
- Do not add a framework dependency unless it has a clear maintenance and reporting benefit.
- Run dependency audits and review Playwright/Node upgrades before adopting them.
- Use exact or clearly managed dependency versions. Avoid unreviewed floating major upgrades.
- Add scripts for test, smoke, regression, typecheck, lint, formatting, reports, and browsers.

Example package scripts:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:smoke": "playwright test --grep @smoke",
    "test:chromium": "playwright test --project=chromium",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "report:html": "playwright show-report report/playwright-report"
  }
}
```

## 11.2 Repository Structure Standard

Use one active test directory and avoid duplicate or generated test locations.

```text
tests/
  fixtures/
  pages/
  specs/
    ui/
    api/
  test-data/
  utils/
  api/
playwright.config.ts
tsconfig.json
.env.example
.gitignore
package.json
package-lock.json
README.md
.github/workflows/
```

Rules:

- Keep framework code out of spec files except test orchestration and assertions.
- Keep POM classes in `tests/pages/` or `pages/`.
- Keep fixtures in `tests/fixtures/`.
- Keep reusable test data in `tests/test-data/`.
- Keep API clients in `tests/api/`.
- Keep low-level generic helpers in `tests/utils/`.
- Do not commit generated reports, traces, videos, screenshots, browser auth state, or dependencies.
- Do not keep training, scratch, or generated example specs in the active test suite.
- Use one naming convention across files and folders.

## 11.3 Naming Standards

- Use descriptive kebab-case spec file names: `cart-checkout.spec.ts`.
- Use descriptive POM class names ending in `Page`, such as `CheckoutInformationPage`.
- Use descriptive fixture names, such as `authenticatedPages` and `apiContext`.
- Use full behavior names for tests:

```ts
test('valid checkout completes an order and shows the confirmation', async () => {});
```

- Avoid names containing TODOs, employee names, or implementation artifacts.
- Use `@smoke`, `@regression`, or feature tags consistently for suite selection.
- Prefix environment variables with the application or framework name where appropriate.
- Export constants and types using stable domain names.

## 11.4 Page Object Model Standards

- A POM represents one application page or one reusable application component.
- POMs expose actions and stable locators, not assertions across multiple unrelated application areas.
- POM methods should perform one user-visible operation or a small cohesive workflow.
- Assertions should remain in tests unless they are explicitly shared business validations.
- Do not place test steps or test data from the spec into a POM.
- Do not inherit unrelated page behavior.
- Keep POMs small, focused, and composable.
- Reuse `BasePage` only for genuinely shared behavior such as navigation.
- Use `PageManager` to compose POMs, not to contain test logic.
- Keep locators private or encapsulated unless a test needs direct visible-state verification.
- Export meaningful TypeScript types for action parameters and test data.

Example:

```ts
export class CartPage {
  constructor(private readonly page: Page) {}

  async removeProduct(productName: string): Promise<void> {
    await this.itemByName(productName).getByRole('button', { name: 'Remove' }).click();
  }

  itemByName(productName: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: productName });
  }
}
```

## 11.5 Test Design Standards

Every test must be:

- Independent
- Atomic
- Determinable
- Repeatable
- Parallel-safe
- Meaningful
- Easy to diagnose
- Automatically cleaned up

Required practices:

- One test should verify one primary behavior.
- Do not depend on test execution order.
- Do not rely on state left by another test.
- Create required data before the test when possible.
- Clean mutable data after the test.
- Use Playwright browser contexts rather than shared browser state.
- Avoid suites that intentionally share mutable application accounts.
- Use setup APIs for faster data creation when available.
- Keep UI login as setup only when UI login is the behavior under test.
- Add `test.step()` for meaningful workflow stages.
- Add tags to support smoke, regression, accessibility, or feature selection.
- Keep tests readable from top to bottom.
- Do not use comments to explain what self-explanatory Playwright code already shows.

Example:

```ts
test('valid checkout completes an order', async ({ authenticatedPages }) => {
  await test.step('Add a product', async () => {
    await authenticatedPages.inventory.addProduct('sauce-labs-backpack');
  });

  await test.step('Complete checkout', async () => {
    await authenticatedPages.cart.checkout();
  });

  await test.step('Verify confirmation', async () => {
    await expect(authenticatedPages.checkoutComplete.heading()).toBeVisible();
  });
});
```

## 11.6 Fixture Standards

- Use Playwright fixtures for browser context setup and dependency injection.
- Fixtures should perform one clear setup responsibility.
- Fixtures must expose only the dependencies a test needs.
- Do not put an application login into a general POM fixture unless the suite requires it.
- Provide separate fixtures for:
  - Logged-out pages
  - Authenticated pages
  - API clients
  - Test data
  - Cleanup resources
- Release resources in fixture teardown.
- Avoid global mutable state.
- Make fixture setup deterministic and log meaningful setup failures.
- Use fixture teardown for cleanup even when setup succeeds partially.

Example:

```ts
type Fixtures = {
  pages: PageManager;
  authenticatedPages: PageManager;
};

export const test = base.extend<Fixtures>({
  pages: async ({ page }, use) => {
    await use(new PageManager(page));
  },

  authenticatedPages: async ({ page }, use) => {
    const pages = new PageManager(page);
    await pages.login.login(
      process.env.SAUCE_USERNAME!,
      process.env.SAUCE_PASSWORD!,
    );
    await use(pages);
  },
});
```

## 11.7 Locator Standards

Use locators in this preferred order:

1. `getByRole()`
2. `getByLabel()`
3. `getByPlaceholder()`
4. `getByText()` for meaningful visible text
5. `getByTestId()` for stable test hooks
6. CSS selectors only when no semantic option is available
7. XPath only with documented justification

Mandatory rules:

- Prefer visible, accessible, user-recognizable elements.
- Avoid locators tied to layout positions or generated CSS frameworks.
- Avoid arbitrary XPath.
- Do not chain locators merely to shorten code if the result becomes fragile.
- Scope actions to the correct component or list item.
- Do not use positional indices unless the application behavior is explicitly positional.
- Do not use duplicate product-name or component-name locators across POMs.
- Use stable test IDs provided by the application where no robust semantic locator exists.
- Add test IDs to application code only as deliberate maintainability hooks.
- Never use fixed `waitForTimeout()` calls.
- Never use `force: true` to bypass normal actionability except for a documented application defect under test.
- Every `.first()`, `.last()`, `.nth()`, and forced action should trigger code review scrutiny.

Example:

```ts
await page.getByRole('button', { name: 'Login' }).click();
await page.getByRole('heading', { name: 'Products' }).waitFor();
```

## 11.8 Assertion Standards

- Use Playwright `expect` for UI assertions.
- Assert user-visible outcomes rather than internal implementation state.
- Use retrying assertions for asynchronous UI behavior.
- Avoid manual polling, sleeps, or immediate text reads.
- Put assertions immediately after the action that should produce the state.
- Assert only meaningful behavior needed by the test.
- Include enough context in custom assertion failures.
- Use `toBeVisible`, `toBeHidden`, `toHaveText`, `toHaveValue`, `toHaveURL`, and `toHaveCount` appropriately.
- Do not assert that a failure did not happen without a meaningful timeout or condition.
- Avoid assertions such as broad non-empty text where exact behavior is known.

## 11.9 Wait and Synchronization Standards

- Rely on Playwright locator auto-waiting before interactions.
- Rely on retrying Playwright assertions for asynchronous state.
- Use explicit waits only for meaningful application conditions.
- Wait for navigation through URL or page-state assertions.
- Wait for network responses only when the response is a required behavior or setup dependency.
- Prefer response promises over arbitrary delays.
- Do not call `page.waitForLoadState('networkidle')` as a default synchronization strategy.
- Do not use sleeps to compensate for race conditions.
- Investigate timing failures instead of increasing global timeouts by default.
- Use suite-level timeouts only for genuinely slow workflows.

## 11.10 Test Data Standards

- Separate static test data from test implementation.
- Use TypeScript types for test-data structures.
- Generate unique parallel-safe data at runtime for mutable entities.
- Generate future dates relative to the current date.
- Use timezone-independent date generation where practical.
- Provide factory functions for account, order, and booking data.
- Use API setup where data creation is faster and more stable.
- Clean mutable data after tests.
- Reuse read-only public demo data safely.
- Do not share mutable data across parallel tests.
- Do not commit production data or real identity/payment information.
- Mask or classify sensitive test values.
- Do not include real card numbers, real account information, or real personal information.

Example:

```ts
export function futureDate(daysFromNow: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}
```

## 11.11 Environment and Configuration Standards

- Centralize environment selection in `playwright.config.ts`.
- Define `baseURL` by environment.
- Support at least local, QA, and CI values.
- Validate required environment variables during configuration loading.
- Use `.env.example` to document variable names without values.
- Ignore all real `.env` files in Git.
- Never commit credentials or secrets.
- Pass secrets through local environment variables or CI secret stores.
- Do not store secret values in test data modules.
- Keep browser, viewport, timeout, trace, video, and reporter settings centralized.
- Keep environment configuration independent of page objects.
- Fail fast when required environment configuration is missing.

Example:

```ts
const required = ['BASE_URL', 'SAUCE_USERNAME', 'SAUCE_PASSWORD'] as const;

for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL,
  },
});
```

## 11.12 Authentication Standards

- Test login through the UI when authentication behavior is the subject.
- Use API-assisted or storage-state authentication for unrelated UI setup.
- Store authentication state only for non-sensitive demo/test users.
- Do not commit browser storage state or session cookies.
- Do not reuse long-lived production sessions.
- Invalidate test sessions after tests or suites when required.
- Separate public and protected route fixtures.
- Keep credentials outside POM constructors.
- Review storage-state setup for token and cookie leakage.

## 11.13 API Testing Standards

Add API automation only for in-scope application contracts.

- Create reusable API client classes or request fixtures.
- Centralize base URLs and authentication.
- Do not duplicate raw request setup in spec files.
- Assert status, headers, response shape, and business values as required.
- Use typed request and response models where practical.
- Validate error responses and negative scenarios.
- Use API setup to create data and UI setup to test UI behavior.
- Clean API-created data.
- Avoid depending on API state left by another test.
- Do not reproduce secrets or tokens in reports or logs.
- Use an API health check in CI only when it does not hide application defects.

## 11.14 Reporting and Logging Standards

- Configure one HTML reporter and one debugging-oriented reporter.
- Use Allure or another maintained result format only when it adds value.
- Do not store both raw and generated reports unnecessarily.
- Include test name, suite, project/browser, trace, screenshot, and video links.
- Add `test.info().annotations` for ticket or feature metadata only when useful.
- Capture failure-only traces, videos, and screenshots by default.
- Do not log passwords, tokens, cookies, authorization headers, or personal data.
- Mask sensitive values in the report configuration and test diagnostics.
- Publish artifacts even when tests fail.
- Keep artifact paths centralized and match the workflow configuration.
- Retain CI artifacts for an agreed period.
- Ensure reports are accessible to the engineering team.

Recommended default:

```ts
use: {
  trace: 'retain-on-failure',
  video: 'retain-on-failure',
  screenshot: 'only-on-failure',
}
```

## 11.15 Parallel Execution Standards

- Enable `fullyParallel: true` for independent spec suites.
- Start CI with a limited worker count and increase gradually.
- Ensure each test has an isolated browser context.
- Generate unique test data for parallel runs.
- Avoid shared application accounts for mutable operations unless the application supports isolation.
- Do not share `page`, `browser`, or mutable module-level variables between tests.
- Protect external shared resources with workers or serialized test groups.
- Use serial mode only for a documented shared-resource dependency.
- Do not use serial mode to hide test-order defects.
- Measure execution time before adding sharding.

## 11.16 CI/CD Standards

- Run `npm ci` instead of installing ad hoc dependencies.
- Cache npm dependencies using setup-node or an equivalent mechanism.
- Install Playwright dependencies and browsers for the target platform.
- Pin Node and action versions.
- Run tests for pull requests and protected branches.
- Fail the build on actual test failure.
- Upload HTML, Allure, trace, screenshot, and video artifacts on failure and cancellation.
- Upload reports using the exact output directories defined in the configuration.
- Use limited retries for CI, but investigate first-attempt failures.
- Start with a controlled worker count and expand gradually.
- Add smoke execution as a fast gate where beneficial.
- Schedule broad cross-browser suites separately from fast pull-request suites.
- Add code quality checks before browser execution.
- Expose clear artifact names and retention periods.
- Do not use CI retries to mask unstable tests.

Example report upload:

```yaml
- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}
  with:
    name: playwright-artifacts
    path: |
      report/playwright-report/
      allure-results/
      allure-report/
      test-results/
    retention-days: 30
```

## 11.17 Browser and Device Standards

- Define required Chromium, Firefox, and WebKit projects.
- Do not add mobile projects unless the product supports mobile behavior.
- Use Playwright devices for standard desktop and mobile configurations.
- Keep project names consistent across local and CI runs.
- Run smoke tests across required browsers.
- Add mobile or responsive validation for explicitly supported breakpoints.
- Test viewport and responsive behavior only against product requirements.
- Do not assert visual pixel-perfect behavior unless visual testing is in scope.
- Include accessibility checks when the product has an accessibility mandate.

## 11.18 Accessibility Standards

- Use semantic role and label locators.
- Verify keyboard navigation for critical workflows.
- Verify visible focus states where required.
- Use accessible names for buttons and form controls.
- Do not use low-level locators to bypass accessibility defects.
- Integrate a maintained accessibility rule set only after baseline configuration is agreed.
- Track accessibility violations separately from functional failures.

## 11.19 Security Standards

- Never commit credentials, API keys, session tokens, personal data, or production cards.
- Use CI secret stores for secrets.
- Add local environment-variable validation.
- Mask secret values in logs and diagnostic output.
- Treat traces and videos as potentially sensitive artifacts.
- Limit artifact collection to failures by default.
- Review reports for accidental sensitive data before sharing.
- Restrict access to CI artifacts containing traces or screenshots.
- Do not run real production payment or destructive actions.
- Use synthetic accounts and test payment instruments only.
- Define cleanup for test accounts and test resources.

## 11.20 Code Quality Standards

- Run strict TypeScript checks.
- Use ESLint with Playwright-specific rules where available.
- Use Prettier or an agreed formatter.
- Run typecheck, lint, and formatting as CI gates.
- Avoid `any` unless a verified external boundary requires it.
- Prefer explicit types for exported functions and fixture data.
- Avoid duplicate utility functions.
- Keep functions small and single-purpose.
- Do not create abstraction before a real repeated need is demonstrated.
- Keep POM methods independent and composable.
- Use meaningful error messages for fixture and environment failures.
- Remove unused imports and dead code.

Mandatory CI quality commands:

```text
npm ci
npm run typecheck
npm run lint
npm run format:check
npx playwright test
```

## 11.21 Stability and Flake Management Standards

- Investigate first-attempt failures.
- One retry is a reasonable starting CI policy.
- Do not hide instability with broad retries.
- Re-run only the reproducible failing test when debugging.
- Store trace and video artifacts for failed tests.
- Track repeat failures by suite, browser, and test name.
- Quarantine a test only with an issue owner and removal deadline.
- Do not use `test.fixme()` or `test.skip()` without documenting the reason.
- Remove workarounds once the root defect or framework issue is fixed.
- Re-evaluate retries after a suite reaches stability.

## 11.22 Test Documentation Standards

Maintain a README covering:

- Prerequisites
- Node.js and npm versions
- Dependency installation
- Browser installation
- Environment setup
- Required environment variables
- Local test commands
- Browser project selection
- Report generation and viewing
- Artifact locations
- CI behavior
- Debugging commands
- Data and cleanup conventions
- Secret handling

Every major POM or fixture should have a short purpose description.

Do not document generated credentials or secrets.

## 11.23 Pull Request Standards

Every framework or test pull request must:

- Run in local development.
- Pass typecheck and lint.
- Pass formatting validation.
- Add focused tests for behavior changes.
- Use one directory for test discovery.
- Include relevant fixtures or POM updates.
- Add or update test data factories.
- Add or update README documentation.
- Avoid unrelated formatting changes.
- Include a link to the related defect or requirement.
- Explain flaky or external-service dependencies.

Code review should verify:

- Test independence
- Semantic locators
- Actionability
- Meaningful assertions
- Environment isolation
- Sensitive-data handling
- Cleanup behavior
- Parallel safety
- Artifact behavior

## 11.24 Framework Governance Standards

- Maintain a quarterly Playwright and browser upgrade process.
- Review CI duration and flake rate monthly.
- Review dependencies and Node support during upgrades.
- Audit reports and artifacts for sensitive data.
- Maintain owners for suites and shared fixtures.
- Remove obsolete specs and POM methods.
- Add test tags and suite ownership gradually.
- Use feature flags only for product behavior explicitly requiring them.
- Record framework decisions in an architecture decision record or README section.

## 11.25 Final Framework Acceptance Checklist

A new framework is ready for enterprise use only when all required items are demonstrated:

- [ ] One test directory is used for discovery.
- [ ] The framework uses TypeScript and a locked dependency graph.
- [ ] Chromium, Firefox, and WebKit projects are clearly defined.
- [ ] POM and fixture responsibilities are documented.
- [ ] Tests are independent and parallel-safe.
- [ ] Locators follow the semantic locator hierarchy.
- [ ] No fixed sleeps or hidden actionability bypasses exist.
- [ ] Dynamic test data and cleanup are implemented.
- [ ] Environment variables are centralized and validated.
- [ ] Secrets are excluded from source and reports.
- [ ] Trace, video, and screenshot settings are failure-oriented.
- [ ] HTML and Allure or equivalent reporting is available.
- [ ] CI report paths match configuration output paths.
- [ ] CI publishes artifacts on success, failure, and cancellation as agreed.
- [ ] CI worker count is controlled and tested.
- [ ] Retry policy is limited and tracked.
- [ ] Typecheck, lint, format, and test commands pass.
- [ ] API automation is included only where in scope.
- [ ] README documents setup, execution, reports, and secrets.

---

# 12. Recommended Architecture Improvements

## Recommended Target Structure

```text
tests/
  fixtures/
  pages/
  specs/
  test-data/
  utils/
  api/
playwright.config.ts
.env.example
package.json
```

## Recommended Configuration

```ts
use: {
  baseURL: process.env.BASE_URL,
  trace: 'retain-on-failure',
  video: 'retain-on-failure',
  screenshot: 'only-on-failure',
},

workers: process.env.CI ? 2 : undefined,
retries: process.env.CI ? 1 : 0,
```

## Recommended Fixture

```ts
export const test = base.extend<PomFixtures>({
  pages: async ({ page }, use) => {
    await use(new PageManager(page));
  },

  authenticatedPages: async ({ page }, use) => {
    const pages = new PageManager(page);
    await pages.login.login(
      process.env.SAUCE_USERNAME!,
      process.env.SAUCE_PASSWORD!,
    );
    await use(pages);
  },
});
```

## Recommended Dynamic Date Helper

```ts
export function futureDate(daysFromNow: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}
```

---

# 13. Prioritized Implementation Roadmap

## Phase 1: Critical Fixes

**Estimated complexity:** Low  
**Priority:** P0/P1  
**Dependencies:** None

1. Correct the CI HTML report artifact path.
2. Upload Allure results and test traces.
3. Remove the forced CI worker count or set a conservative value.
4. Add a clear CI working directory if the repository grows.
5. Remove automatic login from the general POM fixture.
6. Add environment variable validation for credentials.

**Expected benefits:**

- CI artifacts become useful.
- Parallel CI feedback becomes faster.
- Authentication-specific behavior becomes easier to test.

## Phase 2: Code Quality Improvements

**Estimated complexity:** Low to Medium  
**Priority:** P1/P2  
**Dependencies:** Phase 1

1. Consolidate `test/` and `tests/`.
2. Remove obsolete examples.
3. Introduce dynamic dates.
4. Replace forced interactions.
5. Replace positional item-title locators.
6. Standardize semantic locator usage.
7. Add TypeScript, lint, and formatting checks.

**Expected benefits:**

- Fewer stale tests
- Better readability
- More stable locators
- Automated source validation

## Phase 3: Architecture Improvements

**Estimated complexity:** Medium  
**Priority:** P2  
**Dependencies:** Code quality phase

1. Add centralized environment configuration.
2. Add separate logged-in and logged-out fixtures.
3. Add test data factories.
4. Add a shared booking date helper.
5. Define suite naming and tagging conventions.
6. Add API automation only if API coverage is required.

**Expected benefits:**

- Environment switching becomes reliable.
- Test setup becomes reusable.
- Suite scalability improves.

## Phase 4: Performance Optimization

**Estimated complexity:** Low to Medium  
**Priority:** P2/P3  
**Dependencies:** Stable tests

1. Failure-only traces, videos, and screenshots.
2. Safe parallel worker sizing.
3. npm cache in setup-node.
4. Reduce retries after flake remediation.
5. API-assisted setup for mutable flows.
6. Reuse only validated authentication state.

**Expected benefits:**

- Faster CI
- Lower artifact cost
- Lower storage risk
- More reliable first-run failures

## Phase 5: Enterprise-Level Enhancements

**Estimated complexity:** Medium to High  
**Priority:** P3  
**Dependencies:** Stable architecture and CI

1. CI secret validation and secret masking.
2. Scheduled cross-browser runs.
3. Smoke, regression, and feature tags.
4. Flake tracking and quarantine policy.
5. Test-data cleanup and API setup.
6. Browser, package, and Playwright dependency update automation.
7. Report publishing with history and trend support.

**Expected benefits:**

- Enterprise-grade observability
- Faster triage
- Controlled dependency upgrades
- More stable long-running suites

---

# 14. Recommended Issue Fix Order

1. PFW-003: Separate authenticated and unauthenticated fixtures.
2. PFW-004: Add environment/credential configuration.
3. PFW-001: Fix CI HTML report output and artifact paths.
4. PFW-002: Enable CI workers cautiously.
5. PFW-006: Consolidate test directories.
6. PFW-007: Switch to failure-only artifacts.
7. PFW-005: Replace fixed dates.
8. PFW-009: Remove unnecessary forced clicks.
9. PFW-010: Replace positional item locators.
10. PFW-011: Standardize locator hierarchy.
11. PFW-008: Reduce retries after stabilizing failures.
12. PFW-016: Add lint, typecheck, and format checks.
13. PFW-013/PFW-014: Standardize reporting.
14. PFW-015: Improve CI caching.
15. PFW-012: Add API automation if required.

---

# 15. Completion Criteria

The framework review improvements should be considered complete when:

- All active specs are discovered from one directory.
- CI executes with more than one worker safely.
- HTML, Allure, trace, and failure artifacts are available.
- Credentials use environment variables or CI secrets.
- Fixed dates are generated dynamically.
- The general POM fixture does not perform automatic login.
- Failure-only artifacts are configured by default.
- Forced clicks are removed or justified.
- Semantic locators are consistently preferred.
- TypeScript, lint, and formatting checks pass.
- Repeated failures are investigated rather than hidden by retries.
