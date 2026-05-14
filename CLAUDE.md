# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is PromptForge

PromptForge is a Turkish-language prompt builder for AI-assisted ("vibe") coding. Users define projects (with tech stack, architecture, rules, known bugs), pick a category and template, fill in variables, and the app compiles a structured prompt with a quality score. All data is persisted locally via Zustand + localStorage; Supabase integration exists but is optional (only active when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars are set).

## Commands

- `npm run dev` — start Vite dev server (defaults to port 5173, falls back to 5174 if busy)
- `npm run build` — type-check with `tsc -b` then Vite build
- `npm run lint` — ESLint across the project
- `npm run preview` — serve the production build locally

There is no test suite configured.

## Architecture

**Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, Zustand 5, react-router-dom 7, Handlebars, CodeMirror (`@uiw/react-codemirror`).

**Path alias:** `@` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`). `tsconfig.app.json` sets `ignoreDeprecations: "6.0"` because TS 7.0 deprecates `baseUrl`.

**Routing** (`src/App.tsx`): All routes are nested under `AppLayout`. Pages live in `src/app/<feature>/`. The builder wizard is the core flow.

**State management** — four Zustand stores, all using `persist` middleware with localStorage:
- `useProjectStore` (`promptforge-projects`) — CRUD for projects
- `useTemplateStore` (`promptforge-templates`) — merges built-in `defaultTemplates` with user-created custom templates
- `usePromptStore` (`promptforge-prompts`) — generated prompts + the 6-step builder wizard state (`BuilderState`)
- `useSettingsStore` (`promptforge-settings`) — LLM API keys (base64 obfuscated), provider/model selection

### Prompt engine (`src/lib/prompt-engine/`)

This is the heart of the app — three files that work together. Understand all three before touching any of them.

- **`compiler.ts`** — Handlebars compilation pipeline. Pulls values from the selected `Project` (or from `inputData` if no project is selected) into a context object, runs Handlebars, then post-processes:
  1. Strips remaining `{{var}}` placeholders to empty string (not "N/A").
  2. `cleanupEmptySections()` removes empty headings, empty code fences, and orphan "Label:" inline lines.
  3. **Appends project meta sections that the template didn't include**: `## Project Description`, `## Core Architecture`, `## Database Schema`, `## Known Bugs / Issues`, `## Project-Specific Rules` — each gated by a `has_*` boolean. Inserted before `## Important Vibe Coding Rules` if present, else appended at the end. This means templates only need `{{task_description}}` / `{{constraints}}` — project metadata flows in automatically.
  4. Context doc (project's `context_doc` or builder override) is appended as a fenced code block at the very end.
  5. Auto-injects boolean flags (`typescript`, `react`, `supabase`) derived from `tech_stack` for `{{#if}}` conditionals.
  6. Custom Handlebars helpers: `eq`, `contains`, `join`.
  - **`working_features` is joined with `, `** (kept inline-friendly); `known_bugs` and `project_rules` are joined with `\n- ` for their own multiline sections.

- **`qualityChecker.ts`** — Scores 0-100 based on **actual content**, not keyword presence. Helpers `sectionHasContent()` and `inlineFieldHasContent()` reject `"N/A"`, `"Not specified"`, and effectively empty bodies. When updating: don't add a check that passes just because a heading exists — the body must contain real content.

- **`variableExtractor.ts`** — Extracts `{{custom_var}}` references from a template. Takes a `hasProject` boolean (passed from `BuilderPage`):
  - When no project is selected, project-backed variables (`tech_stack`, `project_name`, `core_architecture`, etc.) are surfaced to Step 4 ("Değişkenler") so the user can fill them manually.
  - When a project is selected, those names are filtered out (the project supplies them).
  - Handlebars helper invocations like `{{eq foo bar}}` are filtered via `isPlainVarName()`. Compiler-injected vars (`guardrails`, `has_*`, etc.) are also excluded.

### LLM client (`src/lib/llm/client.ts`)

Streaming fetch-based client for OpenAI and Anthropic. No SDK dependency — pure REST with SSE parsing. Supports abort via `AbortController`. Anthropic requests use the `anthropic-dangerous-direct-browser-access` header.

### UI components

- `src/components/ui/TemplateEditor.tsx` — CodeMirror editor for template authoring (markdown + mustache highlighting)
- `src/components/ui/PromptViewer.tsx` — Read-only CodeMirror viewer for generated prompts
- `src/components/ui/MarkdownUploader.tsx` — Reusable `.md`/`.txt`/`.markdown` upload, used both on the Project Detail page (persistent `context_doc`) and inside `StepDetails` (per-prompt override via `contextDocOverride`)
- `src/components/prompt/LLMTestDrawer.tsx` — Slide-in drawer for testing prompts against the configured LLM, with streaming response display

### Data layer (`src/data/`)

- `defaultTemplates.ts` — built-in system templates per category. Each template's `variables` array drives Step 3 inputs; anything else referenced as `{{x}}` in `template_content` gets surfaced via `variableExtractor`.
- `defaultRules.ts` — `VIBE_CODING_GUARDRAILS` (injected as `{{guardrails}}` into every compiled prompt) and `DEFAULT_PROJECT_RULES`.

**Types** (`src/types/index.ts`): All domain types, category/output-format enums, `LLMSettings`, and the `CATEGORIES`/`OUTPUT_FORMATS` constants. UI labels are in Turkish.

## Builder Wizard Steps

The wizard has 6 steps (indexes 0-5): **Şablon → Proje → Detaylar → Değişkenler → Çıktı Formatı → Sonuç**.

- Step 3 ("Detaylar") renders inputs defined in the template's `variables` array, plus an optional `.md` context-doc uploader.
- Step 4 ("Değişkenler") renders dynamic inputs for any `{{var}}` in the template content that wasn't already covered — including project-backed system variables when no project is selected.
- Step 5 shows the compiled prompt in a `PromptViewer` alongside the `QualityScore` panel.

## Key Conventions

- UI text and labels are in **Turkish** — maintain this when adding features or modifying user-facing strings.
- Templates use Handlebars syntax: `{{variable}}` for values, `{{#if flag}}...{{/if}}` for conditionals.
- Don't reintroduce `"N/A"` placeholder fallbacks in the compiler — empty/missing values are intentionally rendered as nothing and the cleanup pass removes the surrounding heading.
- Project metadata (description, architecture, schema, bugs, rules) flows into the compiled prompt **even if the template doesn't reference it** via the appendix pass in `compiler.ts`. When adding new project fields, extend both the `context` object and the appendix block.
- The `cn()` helper (`src/lib/utils.ts`) wraps `clsx` + `tailwind-merge` for conditional class composition.
- Date formatting uses Turkish locale (`tr-TR`).
- IDs are generated with `crypto.randomUUID()`.
- API keys are stored with base64 obfuscation in localStorage (not encryption — client-side only).
