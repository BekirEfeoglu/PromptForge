import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PromptTemplate } from '@/types';
import { generateId } from '@/lib/utils';
import { defaultTemplates } from '@/data/defaultTemplates';

interface TemplateStore {
  customTemplates: PromptTemplate[];
  addTemplate: (template: Omit<PromptTemplate, 'id' | 'is_system' | 'created_at' | 'updated_at'>) => PromptTemplate;
  importTemplates: (templates: Array<Omit<PromptTemplate, 'id' | 'is_system' | 'created_at' | 'updated_at'>>) => { imported: number; skipped: number };
  updateTemplate: (id: string, template: Partial<PromptTemplate>) => void;
  deleteTemplate: (id: string) => void;
  restoreTemplate: (template: PromptTemplate) => void;
  getAllTemplates: () => PromptTemplate[];
  getTemplate: (id: string) => PromptTemplate | undefined;
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      customTemplates: [],

      addTemplate: (data) => {
        const newTemplate: PromptTemplate = {
          ...data,
          id: generateId(),
          is_system: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((state) => ({ customTemplates: [newTemplate, ...state.customTemplates] }));
        return newTemplate;
      },

      importTemplates: (templates) => {
        const existingKeys = new Set(
          get().getAllTemplates().map((template) => `${template.category}:${template.title.trim().toLowerCase()}`)
        );
        const now = new Date().toISOString();
        const importedTemplates: PromptTemplate[] = [];

        for (const template of templates) {
          const key = `${template.category}:${template.title.trim().toLowerCase()}`;
          if (existingKeys.has(key)) continue;
          existingKeys.add(key);
          importedTemplates.push({
            ...template,
            id: generateId(),
            is_system: false,
            created_at: now,
            updated_at: now,
          });
        }

        if (importedTemplates.length > 0) {
          set((state) => ({ customTemplates: [...importedTemplates, ...state.customTemplates] }));
        }

        return { imported: importedTemplates.length, skipped: templates.length - importedTemplates.length };
      },

      updateTemplate: (id, data) => {
        set((state) => ({
          customTemplates: state.customTemplates.map((t) =>
            t.id === id ? { ...t, ...data, updated_at: new Date().toISOString() } : t
          ),
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          customTemplates: state.customTemplates.filter((t) => t.id !== id),
        }));
      },

      restoreTemplate: (template) => {
        if (template.is_system) return;
        set((state) => {
          if (state.customTemplates.some((t) => t.id === template.id)) return state;
          return { customTemplates: [template, ...state.customTemplates] };
        });
      },

      getAllTemplates: () => {
        // Return system templates followed by custom templates
        return [...defaultTemplates, ...get().customTemplates];
      },

      getTemplate: (id) => {
        return get().getAllTemplates().find((t) => t.id === id);
      },
    }),
    { name: 'promptforge-templates' }
  )
);
