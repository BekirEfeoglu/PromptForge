import type { TemplateVariable } from '@/types';

/**
 * Compiler tarafından otomatik enjekte edilen değişkenler — UI'da kullanıcıya sorulmazlar.
 */
const COMPILER_INJECTED = new Set([
  'guardrails',
  'output_format',
  'has_project',
  'has_description',
  'has_architecture',
  'has_database',
  'has_working_features',
  'has_known_bugs',
  'has_rules',
  'has_context_doc',
  'context_doc',
  'project',
  'typescript',
  'react',
  'supabase',
]);

/**
 * Proje seçildiğinde otomatik doldurulan alanlar.
 * Proje YOKSA kullanıcıya UI'da sorulmalı.
 */
const PROJECT_BACKED = new Set([
  'project_name',
  'project_description',
  'tech_stack',
  'core_architecture',
  'database_schema',
  'current_state',
  'working_features',
  'known_bugs',
  'project_rules',
]);

/**
 * Tek kelime, geçerli bir değişken adı mı? Helper invocation'ları (örn: "eq foo bar"),
 * `else`, `this.xxx`, `@key` gibi kalıpları ele.
 */
function isPlainVarName(name: string): boolean {
  if (!name) return false;
  if (name === 'else') return false;
  if (name.startsWith('this') || name.startsWith('@')) return false;
  // Helper invocation: birden fazla token içerir
  if (/\s/.test(name)) return false;
  // Path expression (a.b veya a/b) — bunlar custom var değil
  if (/[./]/.test(name)) return false;
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

/**
 * Şablondan custom değişken adlarını çıkarır.
 * @param templateContent  Şablon içeriği
 * @param definedVariables Şablonda tanımlı değişkenler (bunları zaten Step 2 soruyor)
 * @param hasProject       Proje seçili mi? Seçili değilse project-backed alanları da custom say.
 */
export function extractCustomVariables(
  templateContent: string,
  definedVariables: TemplateVariable[],
  hasProject: boolean = false
): string[] {
  const regex = /\{\{(?!#|\/|!|else\b|>)\s*([^}]+?)\s*\}\}/g;
  const allVars = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(templateContent)) !== null) {
    const raw = (match[1] || '').trim();
    if (!isPlainVarName(raw)) continue;
    if (COMPILER_INJECTED.has(raw)) continue;
    // Proje seçiliyse project-backed alanları sorma
    if (hasProject && PROJECT_BACKED.has(raw)) continue;
    allVars.add(raw);
  }

  const definedKeys = new Set(definedVariables.map((v) => v.key));
  return Array.from(allVars).filter((v) => !definedKeys.has(v));
}

const LABELS: Record<string, string> = {
  project_name: 'Proje Adı',
  project_description: 'Proje Açıklaması',
  tech_stack: 'Tech Stack',
  core_architecture: 'Core Architecture',
  database_schema: 'Database Schema',
  current_state: 'Mevcut Durum',
  working_features: 'Çalışan Özellikler',
  known_bugs: 'Bilinen Hatalar',
  project_rules: 'Proje Kuralları',
};

const PLACEHOLDERS: Record<string, string> = {
  project_name: 'Ör: PromptForge',
  project_description: 'Projenin ne yaptığını kısaca açıkla...',
  tech_stack: 'Ör: React, TypeScript, Supabase',
  core_architecture: 'Ör: Zustand state, event-driven, REST API...',
  database_schema: 'Ör: users(id, name), posts(id, user_id, body)...',
  current_state: 'Projenin şu anki durumu...',
  working_features: 'Her satıra bir özellik:\nAuth\nProfil sayfası',
  known_bugs: 'Her satıra bir hata:\nLogin redirect sorunu',
  project_rules: 'Her satıra bir kural:\nÇalışan sistemi bozma',
};

const TEXTAREA_KEYS = new Set([
  'project_description',
  'core_architecture',
  'database_schema',
  'current_state',
  'working_features',
  'known_bugs',
  'project_rules',
]);

export function buildDynamicVariables(varNames: string[]): TemplateVariable[] {
  return varNames.map((name) => ({
    key: name,
    label: LABELS[name] || name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    type:
      TEXTAREA_KEYS.has(name) ||
      name.includes('description') ||
      name.includes('code') ||
      name.includes('detail') ||
      name.includes('schema')
        ? 'textarea'
        : 'text',
    placeholder: PLACEHOLDERS[name] || `${name} değerini girin...`,
    required: false,
  }));
}
