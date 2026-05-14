import { describe, expect, it } from 'vitest';
import { validateTemplateContent } from '@/lib/prompt-engine/templateValidation';
import { templatePacks } from './templatePacks';

describe('templatePacks', () => {
  it('contains researched ready-to-import template packs with valid Handlebars', () => {
    const keys = new Set<string>();
    const templates = templatePacks.flatMap((pack) => pack.templates.map((template) => ({ pack, template })));

    expect(templatePacks.length).toBeGreaterThanOrEqual(8);
    expect(templates.length).toBeGreaterThanOrEqual(16);

    for (const { pack, template } of templates) {
      const key = `${template.category}:${template.title.toLocaleLowerCase('tr-TR')}`;
      expect(keys.has(key)).toBe(false);
      keys.add(key);
      expect(pack.sourceNote.trim().length).toBeGreaterThan(12);
      expect(pack.tags.length).toBeGreaterThan(0);
      expect(template.variables.some((variable) => variable.examples?.length)).toBe(true);
      expect(validateTemplateContent(template.template_content, template.variables).valid).toBe(true);
    }
  });
});
