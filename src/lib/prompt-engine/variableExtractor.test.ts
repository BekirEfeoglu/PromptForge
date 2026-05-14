import { describe, expect, it } from 'vitest';
import { buildDynamicVariables, extractCustomVariables } from './variableExtractor';

describe('extractCustomVariables', () => {
  it('filters helpers and compiler-injected variables', () => {
    const vars = extractCustomVariables(
      '{{task_description}}\n{{#if typescript}}TS{{/if}}\n{{eq foo bar}}\n{{custom_note}}\n{{guardrails}}',
      [{ key: 'task_description', label: 'Task', type: 'textarea', required: true }],
      true
    );

    expect(vars).toEqual(['custom_note']);
  });

  it('exposes project-backed variables only when no project is selected', () => {
    const content = '{{project_name}}\n{{tech_stack}}\n{{project_rules}}\n{{custom_note}}';

    expect(extractCustomVariables(content, [], false)).toEqual([
      'project_name',
      'tech_stack',
      'project_rules',
      'custom_note',
    ]);
    expect(extractCustomVariables(content, [], true)).toEqual(['custom_note']);
  });
});

describe('buildDynamicVariables', () => {
  it('uses textarea for multiline project fields', () => {
    const [variable] = buildDynamicVariables(['project_rules']);

    expect(variable?.type).toBe('textarea');
    expect(variable?.label).toBe('Proje Kuralları');
  });
});
