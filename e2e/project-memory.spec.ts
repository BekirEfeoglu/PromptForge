import { expect, test } from '@playwright/test';

const project = {
  id: 'project-md-import',
  user_id: 'local',
  name: 'Eski Proje',
  description: '',
  tech_stack: [],
  core_architecture: '',
  database_schema: '',
  current_state: '',
  rules: [],
  known_bugs: [],
  working_features: [],
  context_doc: '',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

test('project memory upload fills fields from markdown', async ({ page }) => {
  await page.addInitScript((seedProject) => {
    localStorage.setItem('promptforge-projects', JSON.stringify({
      state: { projects: [seedProject] },
      version: 0,
    }));
  }, project);

  await page.goto(`/projects/${project.id}`);

  await page.locator('input[type="file"]').setInputFiles({
    name: 'PROJECT.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from(`# OdoBot

## Description
Discord sunucuları için komut, moderasyon ve özel ses odası yönetimi yapan bot.

## Tech Stack
- Node.js 22+
- discord.js v14
- SQLite

## Core Architecture
Event-driven voiceStateUpdate ve slash command handler yapısı.

## Database Schema
voice_rooms(id, owner_id, channel_id)

## Current State
Bot aktif ve komutlar deploy edilmiş durumda.

## Working Features
- Özel ses odası
- Moderasyon komutları

## Known Bugs
- Eski oda kayıtları yeni oda açmayı engelleyebilir

## Rules
- Operatör cevapları gizli kalmalı
- Çalışan komut semantiğini bozma
`),
  });

  await expect(page.getByText(/\.md dosyasından/i)).toBeVisible();
  await expect(page.getByPlaceholder('Proje adı')).toHaveValue('OdoBot');
  await expect(page.getByPlaceholder('Proje hakkında kısa açıklama...')).toHaveValue(/Discord sunucuları/);
  await expect(page.getByPlaceholder(/React, TypeScript, Supabase/)).toHaveValue(/Node\.js 22\+, discord\.js v14, SQLite/);
  await expect(page.getByPlaceholder(/event-driven/)).toHaveValue(/voiceStateUpdate/);
  await expect(page.getByPlaceholder(/Her satıra bir hata/)).toHaveValue(/Eski oda kayıtları/);
  await expect(page.getByPlaceholder(/Her satıra bir kural/)).toHaveValue(/Operatör cevapları/);
});
