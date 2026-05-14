import { describe, expect, it } from 'vitest';
import { createBackupFromStorage, parseBackupPayload, writeBackupToStorage } from './schema';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    dump: () => Object.fromEntries(values),
  };
}

describe('backup schema', () => {
  it('creates a validated backup from persisted store values', () => {
    const storage = createMemoryStorage({
      'promptforge-projects': JSON.stringify({
        state: {
          projects: [{
            id: 'project-1',
            user_id: 'local',
            name: 'PromptForge',
            description: '',
            tech_stack: ['React'],
            core_architecture: '',
            database_schema: '',
            current_state: '',
            rules: [],
            known_bugs: [],
            working_features: [],
            context_doc: '',
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: '2026-01-01T00:00:00.000Z',
          }],
        },
      }),
      'promptforge-prompts': JSON.stringify({
        state: {
          prompts: [],
          evalScenarios: [{
            id: 'scenario-1',
            prompt_id: 'prompt-1',
            name: 'Smoke scenario',
            input: 'input',
            expected: 'expected output',
            rubric: '',
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: '2026-01-01T00:00:00.000Z',
          }],
          evalRuns: [],
        },
      }),
      'promptforge-templates': JSON.stringify({ state: { customTemplates: [] } }),
    });

    const backup = createBackupFromStorage(storage);

    expect(backup.version).toBe('2.1');
    expect(backup.projects).toHaveLength(1);
    expect(backup.projects[0]?.name).toBe('PromptForge');
    expect(backup.evalScenarios).toHaveLength(1);
  });

  it('rejects malformed backup payloads', () => {
    expect(() => parseBackupPayload({ projects: 'bad', prompts: [] })).toThrow();
  });

  it('writes normalized backup data to Zustand storage keys', () => {
    const storage = createMemoryStorage();
    const payload = parseBackupPayload({
      version: '2.0',
      exportedAt: '2026-01-01T00:00:00.000Z',
      projects: [],
      prompts: [],
      evalScenarios: [],
      evalRuns: [],
      templates: [],
    });

    writeBackupToStorage(storage, payload);

    expect(storage.dump()).toHaveProperty('promptforge-projects');
    expect(storage.dump()).toHaveProperty('promptforge-prompts');
    expect(storage.dump()).toHaveProperty('promptforge-templates');
    expect(storage.dump()['promptforge-prompts']).toContain('evalScenarios');
  });

  it('defaults legacy prompt records to version 1', () => {
    const payload = parseBackupPayload({
      version: '2.0',
      exportedAt: '2026-01-01T00:00:00.000Z',
      projects: [],
      templates: [],
      prompts: [{
        id: 'prompt-1',
        user_id: 'local',
        project_id: null,
        template_id: null,
        title: 'Legacy prompt',
        category: 'feature',
        input_data: {},
        final_prompt: 'Act as a senior developer.\n## Task\nBuild it.',
        quality_score: 70,
        is_favorite: false,
        notes: '',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      }],
    });

    expect(payload.prompts[0]?.version).toBe(1);
    expect(payload.prompts[0]?.parent_prompt_id).toBeNull();
    expect(payload.prompts[0]?.skill_ids).toEqual([]);
  });
});
