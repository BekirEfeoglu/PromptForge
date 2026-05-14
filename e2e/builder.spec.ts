import { expect, test } from '@playwright/test';

test('builder creates a bugfix prompt from the wizard', async ({ page }) => {
  await page.goto('/builder');

  await page.getByRole('button', { name: /Bug Fix/i }).click();
  await page.getByRole('button', { name: /İleri/i }).click();

  await expect(page.getByText('Hazır örnekler')).toBeVisible();
  await page.getByRole('button', { name: /Boş Alanları Örnekle Doldur/i }).click();

  const details = page.locator('textarea.textarea-field');
  await expect(details.nth(0)).not.toHaveValue('');
  await details.nth(0).fill('Login formunda submit sonrası TypeError hatasını düzelt.');
  await details.nth(2).fill('TypeError: Cannot read properties of undefined');
  await details.nth(3).fill('Kullanıcı giriş yaptıktan sonra dashboard açılmalı.');
  await details.nth(4).fill('Submit sonrası beyaz ekran oluşuyor.');

  await expect(page.getByTestId('skill-filter-security')).toBeVisible();
  await page.getByTestId('skill-filter-security').click();
  await expect(page.getByTestId('skill-security-scan')).toBeVisible();
  await page.getByTestId('skill-search').fill('secrets');
  await expect(page.getByTestId('skill-secrets-handling')).toBeVisible();
  await page.getByTestId('skill-search').fill('');
  await page.getByTestId('skill-filter-recommended').click();
  await page.getByTestId('skill-systematic-debugging').click();
  await expect(page.getByTestId('skill-systematic-debugging')).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: /İleri/i }).click();

  const dynamicInputs = page.locator('input.input-field:visible, textarea.textarea-field:visible');
  const dynamicCount = await dynamicInputs.count();
  for (let index = 0; index < dynamicCount; index += 1) {
    const value = await dynamicInputs.nth(index).inputValue();
    if (!value) await dynamicInputs.nth(index).fill('React, TypeScript, Vite');
  }

  await page.getByRole('button', { name: /İleri/i }).click();
  await page.getByRole('button', { name: /Prompt Oluştur/i }).click();

  await expect(page.getByText('Prompt Kalite Skoru')).toBeVisible();
  await expect(page.getByText(/Login formunda submit sonrası/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kaydet', exact: true })).toBeVisible();
});
