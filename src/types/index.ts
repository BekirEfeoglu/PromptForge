// ===== Project Types =====
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  tech_stack: string[];
  core_architecture: string;
  database_schema: string;
  current_state: string;
  rules: string[];
  known_bugs: string[];
  working_features: string[];
  context_doc: string;
  created_at: string;
  updated_at: string;
}

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

// ===== Template Types =====
export type PromptCategory =
  | 'feature'
  | 'bugfix'
  | 'uiux'
  | 'supabase'
  | 'discord'
  | 'refactor'
  | 'codereview';

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiline';
  placeholder?: string;
  examples?: string[];
  required: boolean;
  options?: string[];
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: PromptCategory;
  description: string;
  template_content: string;
  variables: TemplateVariable[];
  is_system: boolean;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

// ===== Skill Types =====
export type SkillCategory =
  | PromptCategory
  | 'general'
  | 'architecture'
  | 'testing'
  | 'security'
  | 'devops'
  | 'docs'
  | 'data'
  | 'ai'
  | 'mobile';

export interface PromptSkill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  useWhen: string;
  promptInstruction: string;
  tags?: string[];
  recommendedFor?: PromptCategory[];
}

// ===== Generated Prompt Types =====
export interface GeneratedPrompt {
  id: string;
  user_id: string;
  project_id: string | null;
  template_id: string | null;
  parent_prompt_id: string | null;
  version: number;
  skill_ids: string[];
  title: string;
  category: PromptCategory;
  input_data: Record<string, string>;
  final_prompt: string;
  quality_score: number;
  is_favorite: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  project?: Project;
}

export type GeneratedPromptInsert =
  Omit<GeneratedPrompt, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'project' | 'parent_prompt_id' | 'version' | 'skill_ids'> &
  Partial<Pick<GeneratedPrompt, 'parent_prompt_id' | 'version' | 'skill_ids'>>;

// ===== Prompt Evaluation Types =====
export type PromptEvalStatus = 'passed' | 'failed' | 'error';

export interface PromptEvalScenario {
  id: string;
  prompt_id: string;
  name: string;
  input: string;
  expected: string;
  rubric: string;
  created_at: string;
  updated_at: string;
}

export type PromptEvalScenarioInsert = Omit<PromptEvalScenario, 'id' | 'created_at' | 'updated_at'>;

export interface PromptEvalRun {
  id: string;
  scenario_id: string;
  prompt_id: string;
  provider: string;
  model: string;
  output: string;
  score: number;
  status: PromptEvalStatus;
  notes: string;
  created_at: string;
}

export type PromptEvalRunInsert = Omit<PromptEvalRun, 'id' | 'created_at'>;

// ===== Builder Types =====
export type OutputFormat =
  | 'full_code'
  | 'patch_diff'
  | 'file_by_file'
  | 'prompt_only'
  | 'test_plan'
  | 'debug_report'
  | 'ui_design';

export interface BuilderState {
  step: number;
  category: PromptCategory | null;
  projectId: string | null;
  templateId: string | null;
  editingPromptId: string | null;
  inputData: Record<string, string>;
  outputFormat: OutputFormat;
  generatedPrompt: string;
  qualityScore: number;
  contextDocOverride: string;
  selectedSkillIds: string[];
}

// ===== Category Metadata =====
export interface CategoryInfo {
  id: PromptCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'feature', label: 'Yeni Özellik', description: 'Yeni özellik geliştirme', icon: '✨', color: 'purple' },
  { id: 'bugfix', label: 'Bug Fix', description: 'Hata çözme ve debugging', icon: '🐛', color: 'red' },
  { id: 'uiux', label: 'UI/UX Tasarım', description: 'Arayüz ve kullanıcı deneyimi', icon: '🎨', color: 'blue' },
  { id: 'supabase', label: 'Supabase', description: 'Database, Auth, RLS, Edge Functions', icon: '⚡', color: 'green' },
  { id: 'discord', label: 'Discord Bot', description: 'Bot komutları ve sistemleri', icon: '🤖', color: 'blue' },
  { id: 'refactor', label: 'Refactor', description: 'Güvenli kod düzenleme', icon: '♻️', color: 'yellow' },
  { id: 'codereview', label: 'Code Review', description: 'Kod inceleme ve analiz', icon: '🔍', color: 'purple' },
];

// ===== LLM Settings Types =====
export type LLMProvider = 'openai' | 'anthropic';
export type LLMConnectionMode = 'direct' | 'proxy';

export interface LLMSettings {
  provider: LLMProvider;
  api_mode: LLMConnectionMode;
  proxy_url: string;
  openai_key: string;
  anthropic_key: string;
  openai_model: string;
  anthropic_model: string;
}

export const OUTPUT_FORMATS: { id: OutputFormat; label: string }[] = [
  { id: 'full_code', label: 'Tam Kod' },
  { id: 'patch_diff', label: 'Patch / Diff' },
  { id: 'file_by_file', label: 'Dosya Dosya Açıklama' },
  { id: 'prompt_only', label: 'Sadece Prompt' },
  { id: 'test_plan', label: 'Test Planı' },
  { id: 'debug_report', label: 'Debug Raporu' },
  { id: 'ui_design', label: 'UI Tasarım Promptu' },
];
