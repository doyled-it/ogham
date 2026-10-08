import { test, expect } from '@playwright/test';

test('typing meitheal renders an ogham svg', async ({ page }) => {
  await page.goto('/');
  await page.fill('#text-input', 'meitheal');
  const svg = page.locator('#drawing svg');
  await expect(svg).toBeVisible();
  // eight letters: 21 stroke lines + 1 stem line (the feather is a polyline)
  await expect(svg.locator('line')).toHaveCount(22);
  await expect(svg).toHaveAttribute('role', 'img');
  await expect(page.locator('#breakdown .tile')).toHaveCount(8);
});

test('the drawing matches a stored reference', async ({ page }) => {
  await page.goto('/');
  await page.fill('#text-input', 'meitheal');
  await expect(page.locator('#drawing')).toHaveScreenshot('meitheal.png', { maxDiffPixelRatio: 0.03 });
});
