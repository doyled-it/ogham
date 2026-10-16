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

test('switching to the monumental tradition shrinks the vowels to notches', async ({ page }) => {
  await page.goto('/');
  await page.fill('#text-input', 'meitheal');
  // four vowels in meitheal: e(4) i(5) e(4) a(1) = 14 vowel strokes, drawn as
  // full bars (x1 = -12) in the manuscript default.
  await expect(page.locator('#drawing svg line[x1="-12"]')).toHaveCount(14);
  await page.check('#tr-monumental');
  await expect(page.locator('#drawing svg line[x1="-12"]')).toHaveCount(0);
  await expect(page.locator('#drawing svg line[x1="-4"]')).toHaveCount(14);
});

test('the forfeda reference shows all six letters', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#forfeda .tile')).toHaveCount(6);
});
