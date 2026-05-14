import { describe, expect, it } from 'vitest';
import { checkPromptQuality } from './qualityChecker';

describe('checkPromptQuality', () => {
  it('recognizes Turkish headings with real content', () => {
    const result = checkPromptQuality(`Kıdemli yazılım geliştirici olarak davran.

## Görev
Dashboard filtrelerini düzelt.

Teknoloji Stack: React, TypeScript
Proje Adı: PromptForge

## Kısıtlamalar
Çalışan sistemi bozma.

## Çıktı Formatı
Dosya dosya patch ver ve build çalıştır.
`);

    expect(result.totalScore).toBeGreaterThanOrEqual(80);
    expect(result.checks.find((check) => check.name === 'Görev Tanımı')?.passed).toBe(true);
  });

  it('does not count empty headings as filled content', () => {
    const result = checkPromptQuality(`Act as a senior developer.

## Task

## Required Output Format
Patch
`);

    expect(result.checks.find((check) => check.name === 'Görev Tanımı')?.passed).toBe(false);
  });

  it('recognizes specialized English roles and filled project context sections', () => {
    const result = checkPromptQuality(`Act as a senior UI/UX developer specializing in modern web interfaces.

## Project Context
Project name: PromptForge
Tech stack: TypeScript, React, Vite, Tailwind CSS, Zustand, Supabase

## Design Task
Improve the generated prompt result screen.

## Project Description
PromptForge is a Turkish-language prompt builder for AI-assisted coding.

## Core Architecture
React routes, Zustand stores and prompt engine modules.

## Required Output Format
Files to change, patch, build and test verification steps.

## Constraints
Do not break existing working features.
`);

    expect(result.checks.find((check) => check.name === 'Rol Tanımı')?.passed).toBe(true);
    expect(result.checks.find((check) => check.name === 'Proje Bağlamı')?.score).toBe(10);
    expect(result.missingItems.some((item) => item.includes('Proje bağlamı'))).toBe(false);
  });
});
