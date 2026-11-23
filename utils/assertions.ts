import { expect, Locator, Page } from '@playwright/test';

export async function expectTitle(page: Page, title: string): Promise<void> {
  await expect(page.locator('[data-test="title"]')).toHaveText(title);
}

export async function expectText(locator: Locator, text: string): Promise<void> {
  await expect(locator).toHaveText(text);
}
