import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BuilderState,
  GeneratedPrompt,
  GeneratedPromptInsert,
  OutputFormat,
  PromptCategory,
  PromptEvalRun,
  PromptEvalRunInsert,
  PromptEvalScenario,
  PromptEvalScenarioInsert,
} from '@/types';
import { generateId } from '@/lib/utils';

interface PromptStore {
  // Generated prompts
  prompts: GeneratedPrompt[];
  evalScenarios: PromptEvalScenario[];
  evalRuns: PromptEvalRun[];
  addPrompt: (data: GeneratedPromptInsert) => GeneratedPrompt;
  createVersionFromPrompt: (sourceId: string, overrides?: Partial<GeneratedPromptInsert>) => GeneratedPrompt | null;
  deletePrompt: (id: string) => void;
  restorePrompt: (prompt: GeneratedPrompt) => void;
  toggleFavorite: (id: string) => void;
  getPromptsByProject: (projectId: string) => GeneratedPrompt[];
  getPromptsByCategory: (category: PromptCategory) => GeneratedPrompt[];
  getFavorites: () => GeneratedPrompt[];
  getPromptThread: (promptId: string) => GeneratedPrompt[];
  addEvalScenario: (data: PromptEvalScenarioInsert) => PromptEvalScenario;
  updateEvalScenario: (id: string, data: Partial<PromptEvalScenarioInsert>) => void;
  deleteEvalScenario: (id: string) => void;
  getEvalScenariosForPrompt: (promptId: string) => PromptEvalScenario[];
  addEvalRun: (data: PromptEvalRunInsert) => PromptEvalRun;
  getEvalRunsForPrompt: (promptId: string) => PromptEvalRun[];

  // Builder state
  builder: BuilderState;
  setBuilderStep: (step: number) => void;
  setBuilderCategory: (category: PromptCategory | null) => void;
  setBuilderProject: (projectId: string | null) => void;
  setBuilderTemplate: (templateId: string | null) => void;
  setBuilderInput: (key: string, value: string) => void;
  setBuilderInputData: (data: Record<string, string>) => void;
  setBuilderOutputFormat: (format: OutputFormat) => void;
  setBuilderContextDoc: (doc: string) => void;
  setBuilderSkills: (skillIds: string[]) => void;
  setGeneratedPrompt: (prompt: string, score: number) => void;
  resetBuilder: () => void;
  loadPromptIntoBuilder: (prompt: GeneratedPrompt) => void;
}

const initialBuilder: BuilderState = {
  step: 0,
  category: null,
  projectId: null,
  templateId: null,
  editingPromptId: null,
  inputData: {},
  outputFormat: 'full_code',
  generatedPrompt: '',
  qualityScore: 0,
  contextDocOverride: '',
  selectedSkillIds: [],
};

function normalizePrompt(prompt: GeneratedPrompt): GeneratedPrompt {
  return {
    ...prompt,
    parent_prompt_id: prompt.parent_prompt_id ?? null,
    version: Number.isFinite(prompt.version) && prompt.version > 0 ? prompt.version : 1,
    skill_ids: Array.isArray(prompt.skill_ids) ? prompt.skill_ids.filter((id) => typeof id === 'string') : [],
  };
}

function normalizeEvalScenario(scenario: PromptEvalScenario): PromptEvalScenario {
  return {
    ...scenario,
    prompt_id: scenario.prompt_id ?? '',
    name: scenario.name ?? 'Test Senaryosu',
    input: scenario.input ?? '',
    expected: scenario.expected ?? '',
    rubric: scenario.rubric ?? '',
    created_at: scenario.created_at ?? new Date().toISOString(),
    updated_at: scenario.updated_at ?? new Date().toISOString(),
  };
}

function normalizeEvalRun(run: PromptEvalRun): PromptEvalRun {
  const score = Number.isFinite(run.score) ? Math.max(0, Math.min(100, run.score)) : 0;
  const status = run.status === 'passed' || run.status === 'failed' || run.status === 'error'
    ? run.status
    : score >= 60 ? 'passed' : 'failed';

  return {
    ...run,
    scenario_id: run.scenario_id ?? '',
    prompt_id: run.prompt_id ?? '',
    provider: run.provider ?? 'manual',
    model: run.model ?? 'manual',
    output: run.output ?? '',
    score,
    status,
    notes: run.notes ?? '',
    created_at: run.created_at ?? new Date().toISOString(),
  };
}

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      prompts: [],
      evalScenarios: [],
      evalRuns: [],
      builder: { ...initialBuilder },

      addPrompt: (data) => {
        const newPrompt: GeneratedPrompt = {
          ...data,
          id: generateId(),
          user_id: 'local',
          parent_prompt_id: data.parent_prompt_id ?? null,
          version: data.version ?? 1,
          skill_ids: data.skill_ids ?? [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((state) => ({ prompts: [newPrompt, ...state.prompts] }));
        return newPrompt;
      },

      createVersionFromPrompt: (sourceId, overrides = {}) => {
        const sourcePrompt = get().prompts.find((prompt) => prompt.id === sourceId);
        if (!sourcePrompt) return null;

        const rootId = sourcePrompt.parent_prompt_id ?? sourcePrompt.id;
        const thread = get().getPromptThread(sourcePrompt.id);
        const nextVersion = Math.max(0, ...thread.map((prompt) => prompt.version || 1)) + 1;
        const now = new Date().toISOString();
        const safeOverrides = { ...overrides };
        delete safeOverrides.parent_prompt_id;
        delete safeOverrides.version;

        const newPrompt: GeneratedPrompt = {
          ...sourcePrompt,
          ...safeOverrides,
          id: generateId(),
          user_id: 'local',
          parent_prompt_id: rootId,
          version: nextVersion,
          skill_ids: safeOverrides.skill_ids ?? sourcePrompt.skill_ids ?? [],
          is_favorite: safeOverrides.is_favorite ?? false,
          notes: safeOverrides.notes ?? sourcePrompt.notes ?? '',
          created_at: now,
          updated_at: now,
        };

        set((state) => ({ prompts: [newPrompt, ...state.prompts] }));
        return newPrompt;
      },

      deletePrompt: (id) => {
        set((state) => ({
          prompts: state.prompts.filter((p) => p.id !== id),
          evalScenarios: state.evalScenarios.filter((scenario) => scenario.prompt_id !== id),
          evalRuns: state.evalRuns.filter((run) => run.prompt_id !== id),
        }));
      },

      restorePrompt: (prompt) => {
        set((state) => {
          if (state.prompts.some((p) => p.id === prompt.id)) return state;
          return { prompts: [normalizePrompt(prompt), ...state.prompts] };
        });
      },

      toggleFavorite: (id) => {
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id ? { ...p, is_favorite: !p.is_favorite } : p
          ),
        }));
      },

      getPromptsByProject: (projectId) => {
        return get().prompts.filter((p) => p.project_id === projectId);
      },

      getPromptsByCategory: (category) => {
        return get().prompts.filter((p) => p.category === category);
      },

      getFavorites: () => {
        return get().prompts.filter((p) => p.is_favorite);
      },

      getPromptThread: (promptId) => {
        const target = get().prompts.find((prompt) => prompt.id === promptId);
        if (!target) return [];
        const rootId = target.parent_prompt_id ?? target.id;
        return get().prompts
          .filter((prompt) => prompt.id === rootId || prompt.parent_prompt_id === rootId)
          .sort((a, b) => (a.version || 1) - (b.version || 1) || a.created_at.localeCompare(b.created_at));
      },

      addEvalScenario: (data) => {
        const now = new Date().toISOString();
        const scenario: PromptEvalScenario = {
          ...data,
          id: generateId(),
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ evalScenarios: [scenario, ...state.evalScenarios] }));
        return scenario;
      },

      updateEvalScenario: (id, data) => {
        set((state) => ({
          evalScenarios: state.evalScenarios.map((scenario) =>
            scenario.id === id
              ? { ...scenario, ...data, updated_at: new Date().toISOString() }
              : scenario
          ),
        }));
      },

      deleteEvalScenario: (id) => {
        set((state) => ({
          evalScenarios: state.evalScenarios.filter((scenario) => scenario.id !== id),
          evalRuns: state.evalRuns.filter((run) => run.scenario_id !== id),
        }));
      },

      getEvalScenariosForPrompt: (promptId) => {
        return get().evalScenarios.filter((scenario) => scenario.prompt_id === promptId);
      },

      addEvalRun: (data) => {
        const run: PromptEvalRun = {
          ...data,
          id: generateId(),
          created_at: new Date().toISOString(),
        };
        set((state) => ({ evalRuns: [run, ...state.evalRuns] }));
        return run;
      },

      getEvalRunsForPrompt: (promptId) => {
        return get().evalRuns.filter((run) => run.prompt_id === promptId);
      },

      // Builder actions
      setBuilderStep: (step) => set((state) => ({ builder: { ...state.builder, step } })),
      setBuilderCategory: (category) => set((state) => ({ builder: { ...state.builder, category } })),
      setBuilderProject: (projectId) => set((state) => ({ builder: { ...state.builder, projectId } })),
      setBuilderTemplate: (templateId) => set((state) => ({ builder: { ...state.builder, templateId } })),
      setBuilderInput: (key, value) =>
        set((state) => ({
          builder: { ...state.builder, inputData: { ...state.builder.inputData, [key]: value } },
        })),
      setBuilderInputData: (data) =>
        set((state) => ({ builder: { ...state.builder, inputData: data } })),
      setBuilderOutputFormat: (format) =>
        set((state) => ({ builder: { ...state.builder, outputFormat: format } })),
      setBuilderContextDoc: (doc) =>
        set((state) => ({ builder: { ...state.builder, contextDocOverride: doc } })),
      setBuilderSkills: (skillIds) =>
        set((state) => ({ builder: { ...state.builder, selectedSkillIds: skillIds } })),
      setGeneratedPrompt: (prompt, score) =>
        set((state) => ({
          builder: { ...state.builder, generatedPrompt: prompt, qualityScore: score },
        })),
      resetBuilder: () => set({ builder: { ...initialBuilder } }),
      loadPromptIntoBuilder: (prompt: GeneratedPrompt) => {
        set({
          builder: {
            step: 5,
            category: prompt.category,
            projectId: prompt.project_id,
            templateId: prompt.template_id,
            editingPromptId: prompt.id,
            inputData: prompt.input_data,
            outputFormat: 'full_code',
            generatedPrompt: prompt.final_prompt,
            qualityScore: prompt.quality_score,
            contextDocOverride: '',
            selectedSkillIds: prompt.skill_ids ?? [],
          }
        });
      },
    }),
    {
      name: 'promptforge-prompts',
      partialize: (state) => ({
        prompts: state.prompts,
        evalScenarios: state.evalScenarios,
        evalRuns: state.evalRuns,
      }),
      merge: (persisted, current) => {
        const rawPrompts = (persisted as Partial<PromptStore> | undefined)?.prompts;
        const rawEvalScenarios = (persisted as Partial<PromptStore> | undefined)?.evalScenarios;
        const rawEvalRuns = (persisted as Partial<PromptStore> | undefined)?.evalRuns;
        const persistedPrompts = Array.isArray(rawPrompts) ? rawPrompts : [];
        const persistedEvalScenarios = Array.isArray(rawEvalScenarios) ? rawEvalScenarios : [];
        const persistedEvalRuns = Array.isArray(rawEvalRuns) ? rawEvalRuns : [];
        return {
          ...current,
          prompts: persistedPrompts.map((prompt) => normalizePrompt(prompt)),
          evalScenarios: persistedEvalScenarios.map((scenario) => normalizeEvalScenario(scenario)),
          evalRuns: persistedEvalRuns.map((run) => normalizeEvalRun(run)),
        };
      },
    }
  )
);
