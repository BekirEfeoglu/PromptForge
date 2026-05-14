import { describe, expect, it } from 'vitest';
import { validateTemplateContent } from './templateValidation';

describe('template validation', () => {
  it('accepts valid Handlebars templates and reports dynamic variables', () => {
    const result = validateTemplateContent('## Task\n{{task_description}}\n{{#if typescript}}Use TS{{/if}}');

    expect(result.valid).toBe(true);
    expect(result.variables).toContain('task_description');
    expect(result.variables).not.toContain('typescript');
  });

  it('rejects malformed Handlebars blocks before save', () => {
    const result = validateTemplateContent('{{#if typescript}}Use TS');

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
