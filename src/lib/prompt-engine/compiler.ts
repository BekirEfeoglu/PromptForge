import Handlebars from 'handlebars';
import type { Project, PromptTemplate, OutputFormat, PromptSkill } from '@/types';
import { VIBE_CODING_GUARDRAILS } from '@/data/defaultRules';

interface CompileOptions {
  template: PromptTemplate;
  inputData: Record<string, string>;
  project: Project | null;
  outputFormat: OutputFormat;
  contextDocOverride?: string;
  skills?: PromptSkill[];
}

const OUTPUT_FORMAT_LABELS: Record<OutputFormat, string> = {
  full_code: 'Full Code — Provide complete, runnable code for every file',
  patch_diff: 'Patch/Diff — Show only the changed lines with context',
  file_by_file: 'File by File — Explain each file, then provide code',
  prompt_only: 'Prompt Only — Provide a refined prompt for another AI',
  test_plan: 'Test Plan — Focus on testing strategy and test code',
  debug_report: 'Debug Report — Root cause analysis with evidence',
  ui_design: 'UI Design Prompt — Focus on visual design and components',
};

Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
Handlebars.registerHelper('contains', (str: unknown, sub: unknown) =>
  typeof str === 'string' && typeof sub === 'string' && str.toLowerCase().includes(sub.toLowerCase())
);
Handlebars.registerHelper('join', (arr: unknown, sep: unknown) =>
  Array.isArray(arr) ? arr.join(typeof sep === 'string' ? sep : ', ') : arr
);

function nonEmpty(value: string | undefined | null): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.toLowerCase() !== 'n/a' && trimmed.toLowerCase() !== 'not specified';
}

function cleanText(value: string | undefined | null): string {
  return nonEmpty(value) ? value!.trim() : '';
}

function normalizeList(values: Array<string | undefined | null> | string | undefined | null): string[] {
  const rawItems = Array.isArray(values)
    ? values
    : String(values || '')
        .split(/\r?\n/)
        .flatMap((line) => line.split(','));

  return rawItems
    .map((item) => String(item || '').replace(/^[-*]\s*/, '').trim())
    .filter(nonEmpty);
}

function resultContainsValue(result: string, value: unknown): boolean {
  if (typeof value !== 'string' || !nonEmpty(value)) return false;
  const normalize = (text: string) => text.replace(/\s+/g, ' ').trim().toLowerCase();
  const normalizedResult = normalize(result);
  const normalizedValue = normalize(value);
  const probe = normalizedValue.slice(0, Math.min(80, normalizedValue.length));
  return probe.length >= 8 && normalizedResult.includes(probe);
}

function resultHasHeading(result: string, headings: string[]): boolean {
  const normalized = result.toLowerCase();
  return headings.some((heading) => normalized.includes(heading.toLowerCase()));
}

function formatSkillInstructions(skills: PromptSkill[]): string {
  return skills
    .map((skill) => `- \`${skill.id}\` (${skill.name}): ${skill.promptInstruction}`)
    .join('\n');
}

export function compilePrompt(options: CompileOptions): string {
  const { template, inputData, project, outputFormat, contextDocOverride, skills = [] } = options;

  const context: Record<string, unknown> = { ...inputData };

  if (project) {
    const workingFeatures = normalizeList(project.working_features);
    const knownBugs = normalizeList(project.known_bugs);
    const projectRules = normalizeList(project.rules);

    context.project_name = cleanText(project.name);
    context.project_description = cleanText(project.description);
    context.tech_stack = normalizeList(project.tech_stack).join(', ');
    context.core_architecture = cleanText(project.core_architecture);
    context.database_schema = cleanText(project.database_schema);
    context.current_state = cleanText(project.current_state);
    context.working_features = workingFeatures.join(', ');
    context.known_bugs = knownBugs.join('\n- ');
    context.project_rules = projectRules.join('\n- ');

    context.has_project = true;
    context.has_description = !!context.project_description;
    context.has_architecture = !!context.core_architecture;
    context.has_database = !!context.database_schema;
    context.has_working_features = workingFeatures.length > 0;
    context.has_known_bugs = knownBugs.length > 0;
    context.has_rules = projectRules.length > 0;
    context.project = project;
  } else {
    const workingFeatures = normalizeList(inputData['working_features']);
    const knownBugs = normalizeList(inputData['known_bugs']);
    const projectRules = normalizeList(inputData['project_rules']);

    context.project_name = cleanText(inputData['project_name']);
    context.project_description = cleanText(inputData['project_description']);
    context.tech_stack = normalizeList(inputData['tech_stack']).join(', ');
    context.core_architecture = cleanText(inputData['core_architecture']);
    context.database_schema = cleanText(inputData['database_schema']);
    context.current_state = cleanText(inputData['current_state']);
    context.working_features = workingFeatures.join(', ');
    context.known_bugs = knownBugs.join('\n- ');
    context.project_rules = projectRules.join('\n- ');

    context.has_project = false;
    context.has_description = !!context.project_description;
    context.has_architecture = !!context.core_architecture;
    context.has_database = !!context.database_schema;
    context.has_working_features = workingFeatures.length > 0;
    context.has_known_bugs = knownBugs.length > 0;
    context.has_rules = projectRules.length > 0;
  }

  const contextDoc = cleanText(contextDocOverride) || cleanText(project?.context_doc);
  context.context_doc = contextDoc;
  context.has_context_doc = !!contextDoc;

  context.guardrails = VIBE_CODING_GUARDRAILS;
  context.output_format = OUTPUT_FORMAT_LABELS[outputFormat];
  context.skills = skills;
  context.skill_names = skills.map((skill) => skill.name).join(', ');
  context.skill_instructions = formatSkillInstructions(skills);
  context.has_skills = skills.length > 0;

  const tsStr = typeof context.tech_stack === 'string' ? context.tech_stack.toLowerCase() : '';
  context.typescript = tsStr.includes('typescript');
  context.react = tsStr.includes('react');
  context.supabase = tsStr.includes('supabase');

  const templateSource = template.template_content;

  const compiled = Handlebars.compile(templateSource, { noEscape: true, strict: false });
  let result: string;

  try {
    result = compiled(context);
  } catch {
    result = templateSource;
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'string') {
        result = result.replaceAll(`{{${key}}}`, value);
      }
    }
  }

  result = result.replace(/\{\{[#/!>]?\s*[^}]*\}\}/g, '');

  result = cleanupEmptySections(result);

  // Append project meta sections that templates may omit
  const appendices: string[] = [];

  if (context.has_description && !resultHasHeading(result, ['project description', 'proje açıklaması']) && !resultContainsValue(result, context.project_description)) {
    appendices.push(`## Project Description\n${context.project_description}`);
  }

  if (context.has_architecture && !resultHasHeading(result, ['core architecture', 'mimari']) && !resultContainsValue(result, context.core_architecture)) {
    appendices.push(`## Core Architecture\n${context.core_architecture}`);
  }

  if (context.has_database && !resultHasHeading(result, ['database schema', 'veritabanı şeması', 'veritabanı']) && !resultContainsValue(result, context.database_schema)) {
    appendices.push(`## Database Schema\n\`\`\`\n${context.database_schema}\n\`\`\``);
  }

  if (context.has_known_bugs && !resultHasHeading(result, ['known bugs', 'known issues', 'bilinen hatalar', 'bilinen sorunlar']) && !resultContainsValue(result, context.known_bugs)) {
    appendices.push(`## Known Bugs / Issues\n- ${context.known_bugs}`);
  }

  if (context.has_rules && !resultHasHeading(result, ['project-specific rules', 'project rules', 'proje kuralları', 'kurallar']) && !resultContainsValue(result, context.project_rules)) {
    appendices.push(`## Project-Specific Rules\n- ${context.project_rules}`);
  }

  if (context.has_skills && !resultHasHeading(result, ['suggested skills', 'skill kullanımı', 'önerilen skill']) && !resultContainsValue(result, context.skill_instructions)) {
    appendices.push(
      `## Suggested Skills\nIf these skills are available in the coding agent runtime, use them before implementation. If not, follow the same workflow inline.\n${context.skill_instructions}`
    );
  }

  if (appendices.length > 0) {
    // Insert before guardrails if possible, else append
    const guardrailIdx = result.indexOf('## Important Vibe Coding Rules');
    if (guardrailIdx > -1) {
      result = result.slice(0, guardrailIdx) + appendices.join('\n\n') + '\n\n' + result.slice(guardrailIdx);
    } else {
      result += '\n\n' + appendices.join('\n\n');
    }
  }

  if (contextDoc && !result.includes(contextDoc.slice(0, 50))) {
    result += `\n\n## Project Structure & Context Document\n\`\`\`\n${contextDoc}\n\`\`\``;
  }

  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim();
}

/**
 * Removes empty markdown sections like:
 *   ## Some Heading
 *   (empty)
 *   ## Next Heading
 * Also collapses lines that are pure punctuation residue (e.g. empty code fences).
 */
function cleanupEmptySections(text: string): string {
  let out = text;

  // Empty code fences: ```\n\n```  or  ```lang\n```
  out = out.replace(/```[a-zA-Z]*\s*\n\s*```/g, '');

  // Lines like "Label:" with no value after — drop them.
  out = out.replace(/^[ \t]*[\p{L}][\p{L}\p{N} _/&()-]{0,40}:[ \t]*$/gmu, '');

  // List items with empty value: "- Label: " — drop them
  out = out.replace(/^[ \t]*[-*][ \t]+[\p{L}][\p{L}\p{N} _/&()-]{0,40}:[ \t]*$/gmu, '');

  // Run repeatedly because removals can chain.
  for (let i = 0; i < 3; i++) {
    const before = out;
    // Headings followed only by whitespace then another heading/EOF — drop the empty heading
    out = out.replace(/^(#{1,6}[^\n]*)\n+(?=#{1,6}\s)/gm, '');
    out = out.replace(/^(#{1,6}[^\n]*)\n+$/gm, '');
    // Collapse runs of blank lines (must run inside the loop too)
    out = out.replace(/\n{3,}/g, '\n\n');
    if (out === before) break;
  }

  // Drop list items that are just dashes/bullets with nothing after them
  out = out.replace(/^[\t ]*[-*][\t ]*$/gm, '');

  // Final collapse
  out = out.replace(/\n{3,}/g, '\n\n');

  return out;
}
