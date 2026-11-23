# Playwright Agents

## Integrate Allure reports

Use the following steps to add Allure reporting to a Playwright framework:

1. Install the Allure Playwright adapter and command-line tool:

   ```sh
   npm install --save-dev allure-playwright allure-commandline
   ```

   The Allure command-line tool requires Java 8 or later.

2. Add the Allure reporter to `playwright.config.ts`. Keep any existing
   reporters you want to use alongside it:

   ```ts
   reporter: [
     ['list'],
     ['allure-playwright', { outputFolder: 'allure-results' }],
     ['html', { outputFolder: 'report/playwright-report', open: 'never' }],
   ],
   ```

   Playwright writes the raw Allure result files to `allure-results/` whenever
   tests run.

3. Add scripts to `package.json` to generate and open the HTML report:

   ```json
   {
     "scripts": {
       "allure:generate": "allure generate allure-results --clean -o allure-report",
       "allure:open": "allure open allure-report"
     }
   }
   ```

4. Install project dependencies and run the Playwright tests:

   ```sh
   npm install
   npm test
   ```

5. Generate the Allure HTML report from the test results:

   ```sh
   npm run allure:generate
   ```

6. Open the generated report:

   ```sh
   npm run allure:open
   ```

The generated Allure report is in `allure-report/`. To view the Playwright HTML
report instead, run `npm run report`.
