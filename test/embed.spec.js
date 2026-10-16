import { test, expect } from '@playwright/test';

test('the embed page registers the element and renders into a shadow root', async ({ page }) => {
  await page.goto('/embed/');
  const el = page.locator('ogham-text').first();
  await expect(el).toBeVisible();
  const hasSvg = await el.evaluate((node) => Boolean(node.shadowRoot && node.shadowRoot.querySelector('svg')));
  expect(hasSvg).toBe(true);
});

test('the Ogham global exposes oghamSVG', async ({ page }) => {
  await page.goto('/embed/');
  const type = await page.evaluate(() => typeof (window.Ogham && window.Ogham.oghamSVG));
  expect(type).toBe('function');
});

test('changing an attribute re-renders the element', async ({ page }) => {
  await page.goto('/embed/');
  const el = page.locator('ogham-text').first();
  const before = await el.evaluate((node) => node.shadowRoot.querySelector('svg').getAttribute('viewBox'));
  await el.evaluate((node) => node.setAttribute('orientation', node.getAttribute('orientation') === 'horizontal' ? 'vertical' : 'horizontal'));
  const after = await el.evaluate((node) => node.shadowRoot.querySelector('svg').getAttribute('viewBox'));
  expect(after).not.toBe(before);
});
