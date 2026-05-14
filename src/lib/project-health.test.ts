import { describe, expect, it } from 'vitest';
import { computeProjectHealth } from './project-health';
import type { Project } from '@/types';

const baseProject: Project = {
  id: 'project-1',
  user_id: 'local',
  name: 'PromptForge',
  description: 'Türkçe prompt builder uygulaması.',
  tech_stack: ['React', 'TypeScript'],
  core_architecture: 'Zustand store ve Handlebars compiler ile local-first mimari.',
  database_schema: '',
  current_state: 'Builder akışı çalışıyor ve prompt geçmişi tutuluyor.',
  rules: ['Çalışan sistemi bozma'],
  known_bugs: [],
  working_features: ['Prompt üretimi'],
  context_doc: '',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

describe('computeProjectHealth', () => {
  it('scores complete project memory higher than sparse memory', () => {
    const sparse = computeProjectHealth({ ...baseProject, description: '', tech_stack: [], core_architecture: '', current_state: '', rules: [], working_features: [] });
    const complete = computeProjectHealth({
      ...baseProject,
      database_schema: 'projects(id, name)',
      known_bugs: ['Mobil menü kapanma sorunu'],
      context_doc: '# README\n\nBu doküman proje yapısını ve komutlarını açıklar.',
    });

    expect(complete.score).toBeGreaterThan(sparse.score);
    expect(complete.status).toBe('good');
  });
});
