import { expect, test, type Page } from '@playwright/test'

const expectNoRuntimeErrors = (page: Page) => {
  const runtimeErrors: string[] = []

  page.on('pageerror', (error) => {
    runtimeErrors.push(error.message)
  })

  page.on('console', (message) => {
    if (message.type() === 'error') {
      runtimeErrors.push(message.text())
    }
  })

  return runtimeErrors
}

const goToBuilderResult = async (page: Page) => {
  await page.goto('/builder')

  await page.getByRole('button', { name: /Bug Fix/i }).click()
  await page.getByRole('button', { name: /İleri/i }).click()

  const textareas = page.locator('textarea')
  await textareas.nth(0).fill('Smoke login fix: submit sonrası redirect hatasını düzelt.')
  await textareas.nth(2).fill('Login form submit sonrası kullanıcı dashboard yerine boş ekranda kalıyor.')
  await textareas.nth(3).fill('React Router yönlendirmesi ve auth state güncellemesi kontrol edilmeli.')
  await textareas.nth(4).fill('Mevcut çalışan auth akışı bozulmamalı.')

  await page.getByTestId('skill-systematic-debugging').click()
  await page.getByRole('button', { name: /İleri/i }).click()
  await page.getByRole('button', { name: /İleri/i }).click()
  await page.getByRole('button', { name: /Prompt Oluştur/i }).click()

  await expect(page.getByText('Prompt Önizleme')).toBeVisible()
  await expect(page.getByText('Suggested Skills')).toBeVisible()
}

test('ana sayfalar runtime hatası vermeden açılır', async ({ page }) => {
  const runtimeErrors = expectNoRuntimeErrors(page)
  const routes = [
    { path: '/', text: 'Dashboard' },
    { path: '/projects', text: 'Projeler' },
    { path: '/builder', text: 'Prompt Builder' },
    { path: '/compare', text: 'A/B Prompt Karşılaştırma' },
    { path: '/evals', text: 'Prompt Test Setleri' },
    { path: '/templates', text: 'Şablon Kütüphanesi' },
    { path: '/history', text: 'Prompt Geçmişi' },
    { path: '/favorites', text: 'Favoriler' },
    { path: '/settings', text: 'Ayarlar' },
  ]

  for (const route of routes) {
    await page.goto(route.path)
    await expect(page.getByRole('heading', { name: route.text })).toBeVisible()
    const navigation = page.getByRole('navigation', { name: 'Ana navigasyon' })
    if (!(await navigation.isVisible())) {
      await page.getByRole('button', { name: 'Menüyü aç' }).click()
    }
    await expect(navigation).toBeVisible()
  }

  expect(runtimeErrors).toEqual([])
})

test('proje oluşturma, detay kaydetme ve ayarlar yedekleme akışı çalışır', async ({ page }) => {
  const runtimeErrors = expectNoRuntimeErrors(page)

  await page.goto('/projects')
  await page.getByRole('button', { name: /Yeni Proje/i }).click()
  await page.getByPlaceholder('Proje adı *').fill('Smoke Test Projesi')
  await page.getByPlaceholder('Açıklama').fill('Smoke test açıklaması')
  await page.getByPlaceholder(/Tech stack/i).fill('React, TypeScript, Supabase')
  await page.getByRole('button', { name: /^Oluştur$/i }).click()

  await expect(page.getByText('Project Memory')).toBeVisible()
  await expect(page.locator('input.input-field').first()).toHaveValue('Smoke Test Projesi')

  await page.locator('textarea.textarea-field').nth(1).fill('Zustand store + prompt engine akışı')
  await page.getByRole('button', { name: /Kaydet/i }).click()
  await expect(page.getByRole('button', { name: /Kaydedildi/i })).toBeVisible()
  await expect(page.getByText('Proje Hafıza Sağlığı')).toBeVisible()

  await page.goto('/settings')
  await page.getByRole('button', { name: /Proxy Endpoint/i }).click()
  await page.getByPlaceholder('https://api.example.com/llm/stream').fill('https://example.com/llm')
  await page.getByRole('button', { name: /Direkt API/i }).click()
  await page.getByPlaceholder('sk-...').fill('sk-smoke-test-key')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Verileri İndir/i }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toContain('promptforge-backup')

  await page.locator('input[type="file"]').setInputFiles({
    name: 'bozuk-yedek.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{bozuk-json'),
  })
  await expect(page.getByText(/geçersiz|bozuk/i)).toBeVisible()

  expect(runtimeErrors).toEqual([])
})

test('özel şablon oluşturma ve sözdizimi doğrulama çalışır', async ({ page }) => {
  const runtimeErrors = expectNoRuntimeErrors(page)

  await page.goto('/templates')
  await page.getByRole('button', { name: /^Yükle$/i }).first().click()
  await expect(page.getByText(/şablon yüklendi|zaten yüklü/i)).toBeVisible()

  await page.getByRole('button', { name: /Yeni Şablon/i }).click()
  await page.getByPlaceholder('Şablon Adı *').fill('Smoke Custom Template')
  await page.getByPlaceholder('Kısa Açıklama').fill('Smoke template açıklaması')

  const editor = page.locator('.cm-content').first()
  await editor.click()
  await page.keyboard.insertText('Act as a senior engineer.\n\n## Task\n{{task_description}}\n\n{{guardrails}}')

  await expect(page.getByText(/Sözdizimi geçerli/i)).toBeVisible()
  await expect(page.getByText('task_description', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: /^Oluştur$/i }).click()
  await expect(page.getByText('Özel şablon başarıyla oluşturuldu.')).toBeVisible()
  await expect(page.locator('h3', { hasText: 'Smoke Custom Template' }).first()).toBeVisible()

  expect(runtimeErrors).toEqual([])
})

test('prompt kaydetme, favoriye alma, geçmiş ve LLM test paneli çalışır', async ({ page }) => {
  const runtimeErrors = expectNoRuntimeErrors(page)

  await goToBuilderResult(page)

  await page.getByRole('button', { name: /Kaydet \+ Favori/i }).click()
  await page.getByRole('button', { name: /Test Et/i }).click()

  await expect(page.getByText('LLM Test')).toBeVisible()
  await expect(page.getByText(/API anahtarı yapılandırılmamış|Proxy endpoint yapılandırılmamış/i)).toBeVisible()

  await page.goto('/history')
  await expect(page.getByText(/Smoke login fix/i)).toBeVisible()
  await page.getByText(/Smoke login fix/i).first().click()
  await expect(page.getByText('Sürüm zinciri')).toBeVisible()
  await page.getByRole('button', { name: /Bu Sürümü Geri Yükle/i }).click()
  await expect(page.getByText(/v2 olarak yeni sürüm oluşturuldu/i)).toBeVisible()

  await page.goto('/favorites')
  await expect(page.getByText(/Smoke login fix/i)).toBeVisible()

  await page.goto('/evals')
  await expect(page.getByRole('heading', { name: 'Prompt Test Setleri' })).toBeVisible()
  await page.getByPlaceholder('Senaryo adı *').fill('Smoke kalite senaryosu')
  await page.getByPlaceholder('Beklenen çıktı veya anahtar beklentiler *').fill('root cause test build doğrulama')
  await page.getByRole('button', { name: /Senaryo Ekle/i }).click()
  await page.getByPlaceholder('AI çıktısını buraya yapıştır...').fill('Root cause açıklandı, test ve build doğrulama adımları eklendi.')
  await page.getByRole('button', { name: /Skorla ve Kaydet/i }).click()
  await expect(page.getByText(/Test sonucu kaydedildi/i)).toBeVisible()

  await page.goto('/compare')
  await expect(page.getByRole('heading', { name: 'A/B Prompt Karşılaştırma' })).toBeVisible()
  await expect(page.getByText(/A daha güçlü|B daha güçlü|Berabere/)).toBeVisible()
  await page.getByRole('button', { name: /Prompt A Kaydet/i }).click()
  await expect(page.getByText(/A\/B A promptu geçmişe kaydedildi/i)).toBeVisible()

  await page.goto('/')
  await expect(page.getByText('Toplam Prompt')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Favoriler' })).toBeVisible()

  expect(runtimeErrors).toEqual([])
})
