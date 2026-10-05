const { test, expect } = require('@playwright/test');

async function waitForStudio(page) {
  await page.goto('/');
  await expect(page.locator('#studio-tools')).toBeVisible();
  await expect(page.locator('#template-library')).toBeVisible();
  await expect(page.locator('#batch-studio')).toBeVisible();
}

test('loads complete QR Studio production workspace', async ({ page }) => {
  await waitForStudio(page);
  await expect(page).toHaveTitle(/QR Code Generator/i);
  await expect(page.locator('[data-type="whatsapp"]')).toBeVisible();
  await expect(page.locator('[data-template="business"]')).toBeVisible();
  await expect(page.locator('#share-qr-btn')).toBeVisible();
  const health = await page.evaluate(() => window.QRStudioHealth && window.QRStudioHealth.check());
  expect(health).toBeTruthy();
  expect(health.contentTypes).toBe(true);
  expect(health.generator).toBe(true);
});

test('generates and verifies a URL QR code', async ({ page }) => {
  await waitForStudio(page);
  await page.locator('#content-url').fill('https://example.com');
  await page.locator('#generate-btn').click();
  await expect(page.locator('#export-png')).toBeEnabled();
  await expect(page.locator('#qr-container canvas, #qr-container svg').first()).toBeVisible();
  await expect(page.locator('#readiness-score strong')).not.toHaveText('—');
});

test('template workflow populates editable content', async ({ page }) => {
  await waitForStudio(page);
  await page.locator('[data-template="wifi"]').click();
  await expect(page.locator('[data-type="wifi"]')).toHaveClass(/active/);
  await expect(page.locator('#content-wifi-ssid')).toHaveValue('Guest WiFi');
  await expect(page.locator('#frame-style')).toHaveValue('wifi');
});

test('local project save creates restorable history', async ({ page }) => {
  await waitForStudio(page);
  await page.locator('#content-url').fill('https://example.com/project');
  await page.locator('#label-text').fill('Production Test');
  await page.locator('#studio-save').click();
  await expect(page.locator('#studio-history')).toContainText('Production Test');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('qr-studio-history-v1') || '[]'));
  expect(stored.length).toBeGreaterThan(0);
});

test('imports a versioned QR Studio design JSON', async ({ page }) => {
  await waitForStudio(page);
  const design = {
    schema: 'qr-studio-design',
    version: 1,
    name: 'Imported QA',
    contentType: 'url',
    fields: {
      'content-url': 'https://example.com/imported',
      'label-text': 'Imported label',
      'fg-color': '#111827',
      'fg-color-text': '#111827',
      'bg-color': '#ffffff',
      'bg-color-text': '#ffffff'
    },
    savedAt: new Date().toISOString()
  };
  await page.locator('#studio-import-file').setInputFiles({
    name: 'design.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(design))
  });
  await expect(page.locator('#content-url')).toHaveValue('https://example.com/imported');
  await expect(page.locator('#label-text')).toHaveValue('Imported label');
});

test('exports a framed PNG', async ({ page }) => {
  await waitForStudio(page);
  await page.locator('#content-url').fill('https://example.com/frame');
  await page.locator('#generate-btn').click();
  await expect(page.locator('#qr-container canvas')).toBeVisible();
  await page.locator('#frame-style').selectOption('website');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#export-framed-png').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('qr-code-framed.png');
});

test('batch generation creates a ZIP download', async ({ page }) => {
  await waitForStudio(page);
  await page.locator('#batch-csv').fill('name,type,data\nSite,url,https://example.com\nHello,text,Hello world');
  const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
  await page.locator('#batch-generate').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('qr-studio-batch.zip');
  await expect(page.locator('#batch-status')).toContainText('Batch complete');
});

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`responsive layout has no page-level horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await waitForStudio(page);
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 2);
  });
}
