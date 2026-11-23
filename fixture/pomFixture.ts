import { test as base, expect } from '@playwright/test';
import { PageManager } from '../pages/PageManager';
import { credentials } from '../test-data/testData';

type PomFixtures = {
  pages: PageManager;
};

export const test = base.extend<PomFixtures>({
  pages: async ({ page }, use) => {
    const pages = new PageManager(page);
    await pages.login.login(credentials.username, credentials.password);
    await use(pages);
  },
});

export { expect };
