import type { ProjectInsert } from '@/types';

type ProjectMemoryFields = Pick<
  ProjectInsert,
  | 'name'
  | 'description'
  | 'tech_stack'
  | 'core_architecture'
  | 'database_schema'
  | 'current_state'
  | 'working_features'
  | 'known_bugs'
  | 'rules'
>;

export type ExtractedProjectMemory = Partial<ProjectMemoryFields>;

interface HeadingBlock {
  level: number;
  title: string;
  body: string;
}

const TECH_PATTERNS: Array<[RegExp, string]> = [
  [/\bnode(?:\.js)?\s*(?:v?\d+(?:\.\d+)*)?\b/i, 'Node.js'],
  [/\bdiscord\.js(?:\s*v?\d+)?\b/i, 'discord.js'],
  [/\btypescript\b/i, 'TypeScript'],
  [/\bjavascript\b/i, 'JavaScript'],
  [/\breact\b/i, 'React'],
  [/\bvite\b/i, 'Vite'],
  [/\btailwind(?:\s*css)?\b/i, 'Tailwind CSS'],
  [/\bzustand\b/i, 'Zustand'],
  [/\bsupabase\b/i, 'Supabase'],
  [/\bpostgres(?:ql)?\b/i, 'PostgreSQL'],
  [/\bprisma\b/i, 'Prisma'],
  [/\bmongodb\b/i, 'MongoDB'],
  [/\bexpress\b/i, 'Express'],
  [/\bnext(?:\.js)?\b/i, 'Next.js'],
  [/\bvue\b/i, 'Vue'],
  [/\bsvelte\b/i, 'Svelte'],
  [/\bpython\b/i, 'Python'],
  [/\bfastapi\b/i, 'FastAPI'],
  [/\bdjango\b/i, 'Django'],
  [/\bgo(?:lang)?\b/i, 'Go'],
  [/\brust\b/i, 'Rust'],
  [/\bdocker\b/i, 'Docker'],
  [/\bredis\b/i, 'Redis'],
  [/\bsqlite\b/i, 'SQLite'],
];

const GENERIC_TITLES = new Set([
  'readme',
  'readme.md',
  'claude.md',
  'agents.md',
  'development commands',
  'commands',
  'komutlar',
]);

export function extractProjectMemoryFromMarkdown(content: string): ExtractedProjectMemory {
  const normalized = stripFrontmatter(content).replace(/\r\n?/g, '\n');
  const blocks = parseHeadingBlocks(normalized);

  const name = extractProjectName(normalized, blocks);
  const description = firstNonEmpty([
    sectionText(blocks, [/^what is\b/i, /^overview$/i, /^project overview$/i, /^description$/i, /^about$/i, /^proje\b/i, /^açıklama$/i, /^nedir\b/i]),
    firstMeaningfulParagraph(normalized),
  ]);
  const techStack = extractTechStack(normalized, blocks);
  const coreArchitecture = sectionText(blocks, [/architecture/i, /mimari/i, /system design/i, /project structure/i, /codebase structure/i, /dosya yap[ıi]s[ıi]/i]);
  const databaseSchema = sectionText(blocks, [/database schema/i, /data model/i, /^database$/i, /veritaban[ıi]/i, /supabase/i, /schema/i]);
  const currentState = sectionText(blocks, [/current state/i, /^status$/i, /mevcut durum/i, /şu anki durum/i, /roadmap/i]);
  const workingFeatures = sectionList(blocks, [/working features/i, /^features$/i, /implemented/i, /capabilities/i, /çalışan özellikler/i, /özellikler/i]);
  const knownBugs = sectionList(blocks, [/known bugs/i, /known issues/i, /^issues$/i, /^bugs$/i, /limitations/i, /todo/i, /bilinen hata/i, /bilinen sorun/i]);
  const rules = sectionList(blocks, [/rules/i, /guidelines/i, /conventions/i, /constraints/i, /coding standards/i, /instructions/i, /kurallar/i, /talimatlar/i, /kısıtlamalar/i]);

  return withoutEmpty({
    name,
    description,
    tech_stack: techStack,
    core_architecture: coreArchitecture,
    database_schema: databaseSchema,
    current_state: currentState,
    working_features: workingFeatures,
    known_bugs: knownBugs,
    rules,
  });
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '');
}

function parseHeadingBlocks(content: string): HeadingBlock[] {
  const lines = content.split('\n');
  const headings = lines
    .map((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (!match) return null;
      return {
        level: match[1]!.length,
        title: cleanInlineMarkdown(match[2]!),
        line: index,
      };
    })
    .filter(Boolean) as Array<{ level: number; title: string; line: number }>;

  return headings.map((heading, index) => {
    const next = headings.slice(index + 1).find((candidate) => candidate.level <= heading.level);
    const endLine = next?.line ?? lines.length;
    return {
      level: heading.level,
      title: heading.title,
      body: lines.slice(heading.line + 1, endLine).join('\n').trim(),
    };
  });
}

function extractProjectName(content: string, blocks: HeadingBlock[]): string {
  const explicit = content.match(/(?:project|proje)\s*(?:name|ad[ıi])\s*[:-]\s*(.+)/i)?.[1];
  if (explicit) return cleanInlineMarkdown(explicit);

  const whatIs = blocks
    .map((block) => block.title.match(/^what is\s+(.+)/i)?.[1] ?? block.title.match(/^(.+)\s+nedir\??$/i)?.[1])
    .find(Boolean);
  if (whatIs) return cleanInlineMarkdown(whatIs);

  const h1 = blocks.find((block) => block.level === 1 && !GENERIC_TITLES.has(block.title.toLowerCase()));
  return h1 ? cleanInlineMarkdown(h1.title) : '';
}

function sectionText(blocks: HeadingBlock[], patterns: RegExp[]): string {
  const block = findSection(blocks, patterns);
  if (!block) return '';
  return cleanBlock(block.body);
}

function sectionList(blocks: HeadingBlock[], patterns: RegExp[]): string[] {
  const block = findSection(blocks, patterns);
  if (!block) return [];
  const listItems = extractListItems(block.body);
  if (listItems.length > 0) return listItems;
  return cleanBlock(block.body)
    .split('\n')
    .map(cleanInlineMarkdown)
    .filter((line) => line.length > 0 && line.length <= 180)
    .slice(0, 20);
}

function findSection(blocks: HeadingBlock[], patterns: RegExp[]): HeadingBlock | undefined {
  return blocks.find((block) => patterns.some((pattern) => pattern.test(block.title)));
}

function extractTechStack(content: string, blocks: HeadingBlock[]): string[] {
  const techSection = sectionList(blocks, [/tech stack/i, /technology/i, /dependencies/i, /stack/i, /teknoloji/i, /bağımlılıklar/i]);
  const sectionTech = techSection.flatMap((item) => splitTechLine(item));
  const fromText = TECH_PATTERNS
    .filter(([pattern]) => pattern.test(content))
    .map(([, label]) => label)
    .filter((label) => !sectionTech.some((item) => item.toLowerCase().includes(label.toLowerCase())));

  return unique([
    ...sectionTech,
    ...fromText,
  ]).slice(0, 20);
}

function splitTechLine(value: string): string[] {
  return cleanInlineMarkdown(value)
    .split(/[,|/•]+|\s{2,}/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && item.length <= 40);
}

function extractListItems(body: string): string[] {
  return body
    .split('\n')
    .map((line) => line.match(/^\s*(?:[-*+]|\d+[.)])\s+(?:\[[ x]\]\s*)?(.+)$/i)?.[1] ?? '')
    .map(cleanInlineMarkdown)
    .filter((line) => line.length > 0)
    .slice(0, 30);
}

function firstMeaningfulParagraph(content: string): string {
  const withoutCode = content.replace(/```[\s\S]*?```/g, '');
  return withoutCode
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => !paragraph.startsWith('#') && !paragraph.startsWith('-') && paragraph.length >= 40)
    .filter((paragraph) => !/provides guidance to (claude|codex)/i.test(paragraph))
    .map((paragraph) => cleanBlock(paragraph).slice(0, 700))
    .find(Boolean) ?? '';
}

function cleanBlock(value: string): string {
  return value
    .replace(/```[a-z0-9_-]*\n?/gi, '')
    .replace(/```/g, '')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

function cleanInlineMarkdown(value: string): string {
  return value
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[:-\s]+|[:-\s]+$/g, '')
    .trim();
}

function firstNonEmpty(values: string[]): string {
  return values.find((value) => value.trim().length > 0)?.trim() ?? '';
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function withoutEmpty(values: ExtractedProjectMemory): ExtractedProjectMemory {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => Array.isArray(value) ? value.length > 0 : Boolean(value))
  ) as ExtractedProjectMemory;
}
