import { describe, expect, it } from 'vitest';
import type { Project, PromptSkill, PromptTemplate } from '@/types';
import { compilePrompt } from './compiler';

const template: PromptTemplate = {
  id: 'template-1',
  title: 'Test Template',
  category: 'feature',
  description: 'Test',
  template_content: `You are a senior developer.

## Task
{{task_description}}

Related Files:
{{related_files}}

{{guardrails}}

## Required Output Format
{{output_format}}`,
  variables: [],
  is_system: true,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

const project: Project = {
  id: 'project-1',
  user_id: 'local',
  name: 'PromptForge',
  description: 'Prompt builder',
  tech_stack: ['React', 'TypeScript'],
  core_architecture: 'Zustand stores plus prompt engine',
  database_schema: 'projects(id, name)',
  current_state: 'MVP works',
  rules: ['Do not break existing flows'],
  known_bugs: ['History filter is basic'],
  working_features: ['Builder', 'Templates'],
  context_doc: 'src/lib/prompt-engine/ compiler details',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

const skill: PromptSkill = {
  id: 'systematic-debugging',
  name: 'Systematic Debugging',
  category: 'bugfix',
  description: 'Debugging workflow',
  useWhen: 'When fixing runtime bugs',
  promptInstruction: 'Reproduce the bug, isolate the root cause, fix it, and verify the failing path.',
};

describe('compilePrompt', () => {
  it('injects project metadata that the template omits', () => {
    const prompt = compilePrompt({
      template,
      project,
      outputFormat: 'full_code',
      inputData: { task_description: 'Improve the builder flow' },
    });

    expect(prompt).toContain('## Project Description');
    expect(prompt).toContain('Prompt builder');
    expect(prompt).toContain('## Core Architecture');
    expect(prompt).toContain('## Known Bugs / Issues');
    expect(prompt).toContain('## Project-Specific Rules');
    expect(prompt).toContain('## Project Structure & Context Document');
  });

  it('cleans empty placeholders and empty inline labels', () => {
    const prompt = compilePrompt({
      template,
      project: null,
      outputFormat: 'patch_diff',
      inputData: {
        task_description: 'Fix empty placeholder cleanup',
        tech_stack: 'React, TypeScript',
      },
    });

    expect(prompt).not.toContain('{{related_files}}');
    expect(prompt).not.toMatch(/^Related Files:\s*$/m);
  });

  it('injects selected skill instructions when the template omits them', () => {
    const prompt = compilePrompt({
      template,
      project: null,
      outputFormat: 'debug_report',
      inputData: { task_description: 'Fix a login crash' },
      skills: [skill],
    });

    expect(prompt).toContain('## Suggested Skills');
    expect(prompt).toContain('`systematic-debugging`');
    expect(prompt).toContain('Reproduce the bug');
  });
});
