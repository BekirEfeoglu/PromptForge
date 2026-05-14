import { z } from 'zod';

const categorySchema = z.enum(['feature', 'bugfix', 'uiux', 'supabase', 'discord', 'refactor', 'codereview']);

const stringArraySchema = z.array(z.string()).catch([]);

const projectSchema = z.object({
  id: z.string().min(1),
  user_id: z.string().catch('local'),
  name: z.string().min(1),
  description: z.string().catch(''),
  tech_stack: stringArraySchema,
  core_architecture: z.string().catch(''),
  database_schema: z.string().catch(''),
  current_state: z.string().catch(''),
  rules: stringArraySchema,
  known_bugs: stringArraySchema,
  working_features: stringArraySchema,
  context_doc: z.string().catch(''),
  created_at: z.string().catch(() => new Date().toISOString()),
  updated_at: z.string().catch(() => new Date().toISOString()),
});

const templateVariableSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'textarea', 'select', 'multiline']).catch('text'),
  placeholder: z.string().optional(),
  examples: stringArraySchema.optional(),
  required: z.boolean().catch(false),
  options: stringArraySchema.optional(),
});

const promptTemplateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: categorySchema,
  description: z.string().catch('Özel şablon'),
  template_content: z.string().min(1),
  variables: z.array(templateVariableSchema).catch([]),
  is_system: z.boolean().catch(false),
  user_id: z.string().optional(),
  created_at: z.string().catch(() => new Date().toISOString()),
  updated_at: z.string().catch(() => new Date().toISOString()),
});

const generatedPromptSchema = z.object({
  id: z.string().min(1),
  user_id: z.string().catch('local'),
  project_id: z.string().nullable().catch(null),
  template_id: z.string().nullable().catch(null),
  parent_prompt_id: z.string().nullable().catch(null),
  version: z.number().int().min(1).catch(1),
  skill_ids: stringArraySchema,
  title: z.string().catch('Prompt'),
  category: categorySchema,
  input_data: z.record(z.string(), z.string()).catch({}),
  final_prompt: z.string().min(1),
  quality_score: z.number().min(0).max(100).catch(0),
  is_favorite: z.boolean().catch(false),
  notes: z.string().catch(''),
  created_at: z.string().catch(() => new Date().toISOString()),
  updated_at: z.string().catch(() => new Date().toISOString()),
});

const promptEvalScenarioSchema = z.object({
  id: z.string().min(1),
  prompt_id: z.string().min(1),
  name: z.string().catch('Test Senaryosu'),
  input: z.string().catch(''),
  expected: z.string().catch(''),
  rubric: z.string().catch(''),
  created_at: z.string().catch(() => new Date().toISOString()),
  updated_at: z.string().catch(() => new Date().toISOString()),
});

const promptEvalRunSchema = z.object({
  id: z.string().min(1),
  scenario_id: z.string().min(1),
  prompt_id: z.string().min(1),
  provider: z.string().catch('manual'),
  model: z.string().catch('manual'),
  output: z.string().catch(''),
  score: z.number().min(0).max(100).catch(0),
  status: z.enum(['passed', 'failed', 'error']).catch('failed'),
  notes: z.string().catch(''),
  created_at: z.string().catch(() => new Date().toISOString()),
});

export const backupPayloadSchema = z.object({
  version: z.string().catch('2.1'),
  exportedAt: z.string().catch(() => new Date().toISOString()),
  projects: z.array(projectSchema),
  prompts: z.array(generatedPromptSchema),
  evalScenarios: z.array(promptEvalScenarioSchema).catch([]),
  evalRuns: z.array(promptEvalRunSchema).catch([]),
  templates: z.array(promptTemplateSchema).catch([]),
});

export type BackupPayload = z.infer<typeof backupPayloadSchema>;

const STORAGE_KEYS = {
  projects: 'promptforge-projects',
  prompts: 'promptforge-prompts',
  templates: 'promptforge-templates',
} as const;

function readPersistedArray<T>(
  storage: Pick<Storage, 'getItem'>,
  key: string,
  stateKey: string,
  itemSchema: z.ZodType<T>
): T[] {
  const raw = storage.getItem(key);
  if (!raw) return [];

  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object') return [];

  const state = (parsed as { state?: Record<string, unknown> }).state;
  const value = state?.[stateKey];
  const result = z.array(itemSchema).safeParse(value);
  return result.success ? result.data : [];
}

export function createBackupFromStorage(storage: Pick<Storage, 'getItem'>): BackupPayload {
  return {
    version: '2.1',
    exportedAt: new Date().toISOString(),
    projects: readPersistedArray(storage, STORAGE_KEYS.projects, 'projects', projectSchema),
    prompts: readPersistedArray(storage, STORAGE_KEYS.prompts, 'prompts', generatedPromptSchema),
    evalScenarios: readPersistedArray(storage, STORAGE_KEYS.prompts, 'evalScenarios', promptEvalScenarioSchema),
    evalRuns: readPersistedArray(storage, STORAGE_KEYS.prompts, 'evalRuns', promptEvalRunSchema),
    templates: readPersistedArray(storage, STORAGE_KEYS.templates, 'customTemplates', promptTemplateSchema),
  };
}

export function parseBackupPayload(data: unknown): BackupPayload {
  return backupPayloadSchema.parse(data);
}

export function writeBackupToStorage(storage: Pick<Storage, 'setItem'>, payload: BackupPayload) {
  storage.setItem(STORAGE_KEYS.projects, JSON.stringify({ state: { projects: payload.projects }, version: 0 }));
  storage.setItem(
    STORAGE_KEYS.prompts,
    JSON.stringify({
      state: {
        prompts: payload.prompts,
        evalScenarios: payload.evalScenarios,
        evalRuns: payload.evalRuns,
      },
      version: 0,
    })
  );
  storage.setItem(STORAGE_KEYS.templates, JSON.stringify({ state: { customTemplates: payload.templates }, version: 0 }));
}
