import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, ProjectInsert } from '@/types';
import { generateId } from '@/lib/utils';

interface ProjectStore {
  projects: Project[];
  addProject: (data: ProjectInsert) => Project;
  updateProject: (id: string, data: Partial<ProjectInsert>) => void;
  deleteProject: (id: string) => void;
  restoreProject: (project: Project) => void;
  getProject: (id: string) => Project | undefined;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],

      addProject: (data) => {
        const newProject: Project = {
          ...data,
          id: generateId(),
          user_id: 'local',
          tech_stack: data.tech_stack || [],
          core_architecture: data.core_architecture || '',
          database_schema: data.database_schema || '',
          rules: data.rules || [],
          known_bugs: data.known_bugs || [],
          working_features: data.working_features || [],
          context_doc: data.context_doc || '',
          description: data.description || '',
          current_state: data.current_state || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((state) => ({ projects: [newProject, ...state.projects] }));
        return newProject;
      },

      updateProject: (id, data) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
      },

      restoreProject: (project) => {
        set((state) => {
          if (state.projects.some((p) => p.id === project.id)) return state;
          return { projects: [project, ...state.projects] };
        });
      },

      getProject: (id) => {
        return get().projects.find((p) => p.id === id);
      },
    }),
    { name: 'promptforge-projects' }
  )
);
