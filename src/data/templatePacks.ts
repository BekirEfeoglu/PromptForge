import type { PromptCategory, PromptTemplate, TemplateVariable } from '@/types';

export type TemplatePackTemplate = Omit<PromptTemplate, 'id' | 'is_system' | 'created_at' | 'updated_at'>;

export interface TemplatePack {
  id: string;
  title: string;
  description: string;
  category: PromptCategory;
  sourceNote: string;
  tags: string[];
  templates: TemplatePackTemplate[];
}

const taskVars: TemplateVariable[] = [
  {
    key: 'task_description',
    label: 'Görev',
    type: 'textarea',
    placeholder: 'Ne yapılacak?',
    examples: [
      'Mevcut akışı bozmadan yeni filtreli şablon katalog deneyimi ekle.',
      'Runtime hatasını kök nedenle bul, minimal patch uygula ve testlerle doğrula.',
      'Mobil ve desktop görünümde taşma olmadan kullanılacak bir ayar paneli tasarla.',
    ],
    required: true,
  },
  {
    key: 'constraints',
    label: 'Kısıtlamalar',
    type: 'textarea',
    placeholder: 'Dokunulmaması gereken alanlar...',
    examples: [
      'Mevcut çalışan özellikleri bozma; gereksiz mimari değişiklik yapma.',
      'Türkçe UI metinlerini koru ve TypeScript hatası bırakma.',
    ],
    required: false,
  },
];

const contextVars: TemplateVariable[] = [
  ...taskVars,
  {
    key: 'acceptance_criteria',
    label: 'Kabul kriterleri',
    type: 'textarea',
    placeholder: 'Bitti sayılması için beklenenler...',
    examples: [
      'Kullanıcı filtreleyebilir, hazır paketi yükleyebilir, preview panelinde şablon içeriğini görebilir.',
      'Lint, build ve ilgili e2e testleri yeşil olmalı.',
    ],
    required: false,
  },
  {
    key: 'target_files',
    label: 'Hedef dosyalar',
    type: 'textarea',
    placeholder: 'src/... veya bilinmiyorsa boş bırak',
    examples: ['src/app/templates/TemplatesPage.tsx\nsrc/data/templatePacks.ts\nsrc/index.css'],
    required: false,
  },
];

export const templatePacks: TemplatePack[] = [
  {
    id: 'agentic-coding-pack',
    title: 'Agentic Coding Paketi',
    description: 'Kod tabanı inceleme, planlama ve güvenli uygulama akışları için.',
    category: 'feature',
    sourceNote: 'OpenAI prompt versioning/evals, Cursor rules ve GitHub custom instructions pratiklerinden sentezlendi.',
    tags: ['agent', 'plan', 'audit', 'workflow'],
    templates: [
      {
        title: 'Kod Tabanı İncele ve Uygulama Planı',
        category: 'feature',
        description: 'Önce repo yapısını okuyup sonra küçük, doğrulanabilir uygulama planı çıkarmak için.',
        template_content: `Act as a senior full-stack engineer and codebase investigator.

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}
Architecture: {{core_architecture}}
Current state: {{current_state}}

<task>
{{task_description}}
</task>

<acceptance_criteria>
{{acceptance_criteria}}
</acceptance_criteria>

<known_constraints>
{{constraints}}
</known_constraints>

## Required Workflow
1. Read the relevant files before proposing edits.
2. Identify the smallest safe implementation path.
3. Preserve existing behavior unless the task explicitly changes it.
4. Work file by file and explain why each file changes.
5. Add or update focused tests for changed behavior.

{{guardrails}}

## Required Output Format ({{output_format}})
1. Repo findings
2. Implementation plan
3. Files to change
4. Full patch/code
5. Verification commands
6. Risks and rollback notes`,
        variables: contextVars,
      },
      {
        title: 'Güvenli Uygulama Promptu',
        category: 'feature',
        description: 'Onaylanmış planı doğrudan uygulamak, test etmek ve sonucu özetlemek için.',
        template_content: `You are a senior implementation engineer. Execute the approved scope safely.

## Scope
{{task_description}}

## Project Context
- Project: {{project_name}}
- Stack: {{tech_stack}}
- Current working features: {{working_features}}

## Target Files
{{target_files}}

## Acceptance Criteria
{{acceptance_criteria}}

## Guardrails
- Do not rewrite unrelated modules.
- Do not introduce placeholder code.
- Keep public contracts compatible unless explicitly requested.
- Run lint, typecheck/build, and the most relevant tests.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Short implementation summary
2. Changed files
3. Complete code or patch
4. Verification evidence
5. Remaining risks`,
        variables: contextVars,
      },
    ],
  },
  {
    id: 'frontend-saas-pack',
    title: 'Modern Frontend Paketi',
    description: 'Dashboard, form, responsive layout ve erişilebilirlik işleri için.',
    category: 'uiux',
    sourceNote: 'Üretim UI kontrol listeleri, erişilebilirlik ve responsive QA pratiklerinden sentezlendi.',
    tags: ['ui', 'responsive', 'a11y', 'react'],
    templates: [
      {
        title: 'Üretim Kalitesinde Arayüz İyileştirme',
        category: 'uiux',
        description: 'Var olan ekranı bozmadan hiyerarşi, responsive yapı ve erişilebilirlik iyileştirir.',
        template_content: `Act as a senior UI/UX developer specializing in production SaaS interfaces.

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}
Current UI issue: {{current_ui_issue}}

## Design Task
{{task_description}}

## Target Screens
{{target_screens}}

## UX Quality Rules
- Design the actual working screen, not a marketing page.
- Keep controls predictable, dense, and scan-friendly for repeated use.
- Define mobile, tablet, and desktop behavior explicitly.
- Preserve semantic buttons, labels, focus-visible states, and keyboard flow.
- Avoid nested cards and decorative clutter.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Component structure overview
2. Full patch/code
3. Responsive breakpoints
4. Accessibility notes
5. Browser QA checklist`,
        variables: [
          ...taskVars,
          { key: 'current_ui_issue', label: 'Mevcut UI sorunu', type: 'textarea', placeholder: 'Neyi iyileştirmek istiyorsun?', required: false },
          { key: 'target_screens', label: 'Hedef ekranlar', type: 'textarea', placeholder: 'Dashboard, builder, ayarlar...', required: false },
        ],
      },
      {
        title: 'Erişilebilirlik ve Responsive Audit',
        category: 'uiux',
        description: 'Kırılgan mobil layout, label, focus ve kontrast problemlerini bulup düzeltir.',
        template_content: `Act as a senior accessibility and responsive layout auditor.

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}

## Audit Target
{{task_description}}

## Screens / Components
{{target_screens}}

## Audit Checklist
- Semantic labels and accessible names
- Keyboard navigation and focus-visible state
- Color contrast and readable muted text
- Mobile wrapping and stable control dimensions
- Empty, loading, error, and long-content states
- No overlapping text or controls

## Constraints
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Findings ordered by severity
2. Exact files/lines
3. Safe UI patch
4. Desktop and mobile verification steps`,
        variables: [
          ...taskVars,
          { key: 'target_screens', label: 'Hedef ekranlar', type: 'textarea', placeholder: 'İncelenecek ekran veya component listesi...', required: true },
        ],
      },
    ],
  },
  {
    id: 'structured-output-pack',
    title: 'Structured Output Paketi',
    description: 'JSON schema, parser güvenliği ve prompt eval akışları için.',
    category: 'feature',
    sourceNote: 'OpenAI Structured Outputs ve prompt eval/versioning önerilerinden sentezlendi.',
    tags: ['json', 'schema', 'eval', 'parser'],
    templates: [
      {
        title: 'JSON Schema Çıktı Promptu',
        category: 'feature',
        description: 'Model çıktısını parse edilebilir, tip güvenli JSON formatına zorlar.',
        template_content: `Act as a senior AI application engineer designing reliable structured outputs.

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}

## Task
{{task_description}}

## Output Schema
\`\`\`json
{{json_schema}}
\`\`\`

## Invalid Input Behavior
{{invalid_input_behavior}}

## Rules
- Output valid JSON only when requested.
- Do not include markdown fences around final JSON unless explicitly asked.
- Include empty arrays or nulls for unavailable optional fields.
- Keep enum values exactly as declared in the schema.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Prompt design
2. Schema notes
3. Parser/validation code
4. Edge cases
5. Test cases`,
        variables: [
          ...taskVars,
          { key: 'json_schema', label: 'JSON schema', type: 'textarea', placeholder: '{ "type": "object", ... }', required: true },
          { key: 'invalid_input_behavior', label: 'Geçersiz girdi davranışı', type: 'textarea', placeholder: 'Uyumsuz input gelirse ne dönmeli?', required: false },
        ],
      },
      {
        title: 'Prompt Eval Senaryosu',
        category: 'codereview',
        description: 'Prompt değişiklikleri için ölçülebilir test senaryoları ve başarı metriği üretir.',
        template_content: `Act as a senior prompt evaluation engineer.

## Prompt Under Test
{{task_description}}

## Expected Behavior
{{expected_behavior}}

## Risk Areas
{{risk_notes}}

## Eval Design Rules
- Test user-visible behavior, not implementation details.
- Include positive, negative, malformed, and edge-case inputs.
- Define pass/fail criteria for each case.
- Keep the test set small enough to run repeatedly.

{{guardrails}}

## Required Output Format ({{output_format}})
1. Eval objective
2. Test case table
3. Scoring rubric
4. Failure diagnosis guide
5. Iteration recommendations`,
        variables: [
          ...taskVars,
          { key: 'expected_behavior', label: 'Beklenen davranış', type: 'textarea', placeholder: 'Prompt neyi doğru üretmeli?', required: true },
          { key: 'risk_notes', label: 'Risk notları', type: 'textarea', placeholder: 'Hallucination, format drift, eksik alan...', required: false },
        ],
      },
    ],
  },
  {
    id: 'supabase-safe-pack',
    title: 'Supabase Güvenli Geliştirme',
    description: 'RLS, migration, edge function ve client güvenliği için.',
    category: 'supabase',
    sourceNote: 'Supabase/Postgres güvenlik ve migration pratiklerine göre hazırlandı.',
    tags: ['supabase', 'rls', 'sql', 'auth'],
    templates: [
      {
        title: 'Supabase RLS + Migration Paketi',
        category: 'supabase',
        description: 'Tablo, policy ve TypeScript entegrasyonunu birlikte üretir.',
        template_content: `Act as a senior Supabase/Postgres security engineer.

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}
Database schema: {{database_schema}}

## Task
{{task_description}}

## Data Requirements
{{data_requirements}}

## Auth / Role Model
{{auth_model}}

## Constraints
- Never expose service_role_key on the client.
- Explain each RLS policy and the user it protects.
- Prefer explicit select columns.
- Make migrations idempotent where practical.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Schema plan
2. SQL migration
3. RLS policies
4. TypeScript integration
5. Verification SQL/checklist`,
        variables: [
          ...taskVars,
          { key: 'data_requirements', label: 'Veri gereksinimleri', type: 'textarea', placeholder: 'Tablo/kolon/ilişki ihtiyacı...', required: true },
          { key: 'auth_model', label: 'Auth / rol modeli', type: 'textarea', placeholder: 'owner, admin, public read...', required: false },
        ],
      },
      {
        title: 'Supabase Edge Function Güvenlik İncelemesi',
        category: 'supabase',
        description: 'Edge function, secret, CORS, rate limit ve payload doğrulamasını denetler.',
        template_content: `Act as a senior Supabase Edge Functions security reviewer.

## Function Goal
{{task_description}}

## Current Function Code / Design
\`\`\`
{{function_context}}
\`\`\`

## Threat Model
{{threat_model}}

## Review Rules
- Validate request method, auth, and payload.
- Keep secrets server-side only.
- Add clear error responses without leaking internals.
- Include local and deployed verification steps.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Security findings
2. Fixed function code
3. Environment variable notes
4. CORS/rate-limit guidance
5. Test checklist`,
        variables: [
          ...taskVars,
          { key: 'function_context', label: 'Function kodu / tasarımı', type: 'textarea', placeholder: 'Deno function veya özet...', required: true },
          { key: 'threat_model', label: 'Tehdit modeli', type: 'textarea', placeholder: 'Kim neyi kötüye kullanabilir?', required: false },
        ],
      },
    ],
  },
  {
    id: 'backend-api-pack',
    title: 'Backend API Paketi',
    description: 'Node.js servis, API kontratı, validasyon ve hata yönetimi için.',
    category: 'feature',
    sourceNote: 'API contract, typed validation ve production error-handling desenlerinden sentezlendi.',
    tags: ['api', 'node', 'contract', 'validation'],
    templates: [
      {
        title: 'API Endpoint Geliştirme',
        category: 'feature',
        description: 'Yeni endpoint için kontrat, validation, handler ve test üretir.',
        template_content: `Act as a senior backend TypeScript engineer.

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}
Architecture: {{core_architecture}}

## Endpoint Task
{{task_description}}

## API Contract
- Method: {{http_method}}
- Path: {{route_path}}
- Request body: {{request_body}}
- Response body: {{response_body}}
- Auth rule: {{auth_rule}}

## Constraints
- Validate all external input.
- Return typed, predictable errors.
- Do not leak internal stack traces.
- Add tests for success, auth failure, validation failure, and not-found paths.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Contract summary
2. Files changed
3. Full endpoint code
4. Tests
5. Verification commands`,
        variables: [
          ...taskVars,
          { key: 'http_method', label: 'HTTP method', type: 'text', placeholder: 'GET / POST / PATCH / DELETE', required: true },
          { key: 'route_path', label: 'Route path', type: 'text', placeholder: '/api/projects/:id', required: true },
          { key: 'request_body', label: 'Request body', type: 'textarea', placeholder: 'Beklenen payload...', required: false },
          { key: 'response_body', label: 'Response body', type: 'textarea', placeholder: 'Dönen veri...', required: false },
          { key: 'auth_rule', label: 'Auth kuralı', type: 'text', placeholder: 'Public / logged-in / admin', required: false },
        ],
      },
    ],
  },
  {
    id: 'security-review-pack',
    title: 'Güvenlik İnceleme Paketi',
    description: 'Secret, auth, injection, permission ve client/server sınırı için.',
    category: 'codereview',
    sourceNote: 'Kod inceleme, threat model ve secure coding kontrol listelerinden sentezlendi.',
    tags: ['security', 'threat-model', 'secrets'],
    templates: [
      {
        title: 'Threat Model + Güvenli Patch',
        category: 'codereview',
        description: 'Özelliği tehdit modeliyle inceler ve güvenli patch önerir.',
        template_content: `Act as a senior application security engineer.

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}

## Feature / Code to Review
{{task_description}}

## Sensitive Assets
{{sensitive_assets}}

## Trust Boundaries
{{trust_boundaries}}

## Review Focus
- Authentication and authorization bypass
- Client/server secret leakage
- Injection and unsafe parsing
- Overbroad permissions
- Missing audit logs for sensitive actions
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Threat model
2. Findings by severity
3. Safe patch
4. Test cases
5. Residual risk`,
        variables: [
          ...taskVars,
          { key: 'sensitive_assets', label: 'Hassas varlıklar', type: 'textarea', placeholder: 'API keys, user data, admin actions...', required: false },
          { key: 'trust_boundaries', label: 'Trust boundaries', type: 'textarea', placeholder: 'Client/server, webhook, DB...', required: false },
        ],
      },
      {
        title: 'Secret Handling ve Env Audit',
        category: 'bugfix',
        description: 'Client bundle, env kullanımı ve loglarda secret sızıntısı riskini kontrol eder.',
        template_content: `Act as a senior security-focused TypeScript reviewer.

## Audit Task
{{task_description}}

## Env / Secret Context
{{secret_context}}

## Rules
- Identify every secret-like value and where it flows.
- Client-side keys must be public-safe only.
- Do not print secrets in logs, errors, or test snapshots.
- Provide exact file-level fixes and verification searches.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Secret inventory
2. Exposure risks
3. Patch
4. Verification grep/search commands
5. Rotation notes if needed`,
        variables: [
          ...taskVars,
          { key: 'secret_context', label: 'Secret/env bağlamı', type: 'textarea', placeholder: '.env değişkenleri ve kullanım yerleri...', required: false },
        ],
      },
    ],
  },
  {
    id: 'testing-qa-pack',
    title: 'Test ve QA Paketi',
    description: 'Unit, contract, Playwright ve regresyon kapsamı tasarlamak için.',
    category: 'codereview',
    sourceNote: 'Prompt eval, browser QA ve contract testing pratiklerinden sentezlendi.',
    tags: ['test', 'qa', 'playwright', 'contract'],
    templates: [
      {
        title: 'Regresyon Test Planı',
        category: 'codereview',
        description: 'Değişiklik sonrası test kapsamı, risk matrisi ve e2e akışı çıkarır.',
        template_content: `Act as a senior QA automation engineer.

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}
Current working features: {{working_features}}

## Change Under Test
{{task_description}}

## Critical User Flows
{{critical_flows}}

## Risks
{{risk_notes}}

## Constraints
- Avoid brittle implementation assertions.
- Verify user-visible behavior.
- Separate unit, contract, and e2e coverage.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Risk-based test matrix
2. Unit tests
3. Contract tests
4. Playwright e2e tests
5. Manual QA checklist`,
        variables: [
          ...taskVars,
          { key: 'critical_flows', label: 'Kritik akışlar', type: 'textarea', placeholder: 'Login, prompt üretimi, kaydetme...', required: true },
          { key: 'risk_notes', label: 'Risk notları', type: 'textarea', placeholder: 'Kırılma ihtimali olan alanlar...', required: false },
        ],
      },
      {
        title: 'Playwright Browser QA',
        category: 'uiux',
        description: 'Frontend değişikliklerini masaüstü ve mobilde gerçek tarayıcıyla doğrulatır.',
        template_content: `Act as a frontend testing engineer using Playwright.

## Target Flow
{{task_description}}

## Pages / Routes
{{target_routes}}

## Assertions
{{assertions}}

## QA Rules
- Check console and page errors.
- Verify desktop and mobile viewports.
- Assert visible state, not internal implementation.
- Capture failure evidence when behavior differs.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Playwright test plan
2. Test code
3. Console/runtime checks
4. Screenshot or trace notes
5. Fix recommendations if failures appear`,
        variables: [
          ...taskVars,
          { key: 'target_routes', label: 'Route listesi', type: 'textarea', placeholder: '/builder, /templates...', required: true },
          { key: 'assertions', label: 'Beklenen görünür durumlar', type: 'textarea', placeholder: 'Buton görünür, toast çıkar...', required: true },
        ],
      },
    ],
  },
  {
    id: 'performance-pack',
    title: 'Performans Paketi',
    description: 'React render, bundle, query ve runtime darboğazlarını iyileştirmek için.',
    category: 'refactor',
    sourceNote: 'Frontend performance ve database query tuning pratiklerinden sentezlendi.',
    tags: ['performance', 'react', 'bundle', 'database'],
    templates: [
      {
        title: 'React Performans İncelemesi',
        category: 'refactor',
        description: 'Gereksiz render, ağır liste, bundle ve memoization risklerini bulur.',
        template_content: `Act as a senior React performance engineer.

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}

## Performance Problem
{{task_description}}

## Target Components
{{target_files}}

## Investigation Rules
- Measure or infer the bottleneck before changing code.
- Avoid premature memoization.
- Keep behavior and accessibility unchanged.
- Check bundle and lazy-loading opportunities.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Bottleneck hypothesis
2. Evidence
3. Safe optimization patch
4. Before/after verification
5. Remaining risks`,
        variables: contextVars,
      },
      {
        title: 'Database Query Performans Audit',
        category: 'supabase',
        description: 'N+1, geniş select, eksik index ve RLS maliyeti gibi problemleri inceler.',
        template_content: `Act as a senior Postgres performance engineer.

## Query / Feature
{{task_description}}

## Current Schema
{{database_schema}}

## Current Query Code
\`\`\`
{{query_code}}
\`\`\`

## Rules
- Prefer explicit columns over select *.
- Identify N+1 and overfetching.
- Suggest indexes with rationale.
- Include explain/analyze verification where possible.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Query risk analysis
2. Optimized query/code
3. Index or schema suggestions
4. Verification SQL
5. Regression tests`,
        variables: [
          ...taskVars,
          { key: 'query_code', label: 'Query kodu', type: 'textarea', placeholder: 'Supabase/Postgres query...', required: true },
        ],
      },
    ],
  },
  {
    id: 'product-prd-pack',
    title: 'Ürün ve PRD Paketi',
    description: 'Fikirden kabul kriterlerine, task breakdown ve scope kontrolüne geçmek için.',
    category: 'feature',
    sourceNote: 'Ürün gereksinimi, acceptance criteria ve implementation planning pratiklerinden sentezlendi.',
    tags: ['prd', 'product', 'scope', 'planning'],
    templates: [
      {
        title: 'PRD’den Uygulama Planına',
        category: 'feature',
        description: 'Ürün fikrini teknik task listesine ve kabul kriterlerine dönüştürür.',
        template_content: `Act as a senior product-minded engineering architect.

## Product Idea
{{task_description}}

## User Problem
{{user_problem}}

## Target Users
{{target_users}}

## Non-goals
{{constraints}}

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}
Current state: {{current_state}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Problem statement
2. User stories
3. Acceptance criteria
4. Technical breakdown
5. Milestones
6. Risks and open questions`,
        variables: [
          ...taskVars,
          { key: 'user_problem', label: 'Kullanıcı problemi', type: 'textarea', placeholder: 'Kullanıcı neyi çözmek istiyor?', required: true },
          { key: 'target_users', label: 'Hedef kullanıcılar', type: 'textarea', placeholder: 'Kim kullanacak?', required: false },
        ],
      },
    ],
  },
  {
    id: 'discord-bot-pack',
    title: 'Discord Bot Paketi',
    description: 'Slash komut, event ve moderation akışları için güvenli promptlar.',
    category: 'discord',
    sourceNote: 'Discord.js v14 komut/event workflow ve operasyonel doğrulama pratiklerinden sentezlendi.',
    tags: ['discord', 'slash-command', 'events', 'moderation'],
    templates: [
      {
        title: 'Discord Slash Komut Paketi',
        category: 'discord',
        description: 'Yeni slash command, embed, buton ve izin kontrolü isteyen işler için.',
        template_content: `Act as a senior Discord.js v14 TypeScript engineer.

## Bot Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}
Command structure: {{command_structure}}

## Task
{{task_description}}

## Command Details
- Command name: {{command_name}}
- Permission rule: {{permission_rule}}
- Interactions: {{interactions}}
- Persisted data: {{data_model}}

## Constraints
- Do not break the slash command contract.
- State interaction reply privacy explicitly.
- Use EmbedBuilder and include empty/error states.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. File list
2. Command code
3. Handler or model changes
4. Deploy/registration notes
5. Test checklist`,
        variables: [
          ...taskVars,
          { key: 'command_structure', label: 'Komut yapısı', type: 'textarea', placeholder: 'src/commands/...', required: false },
          { key: 'command_name', label: 'Komut adı', type: 'text', placeholder: '/profil', required: true },
          { key: 'permission_rule', label: 'Yetki kuralı', type: 'text', placeholder: 'Admin only / herkes', required: false },
          { key: 'interactions', label: 'Etkileşimler', type: 'textarea', placeholder: 'Buton, select menu, modal...', required: false },
          { key: 'data_model', label: 'Veri modeli', type: 'textarea', placeholder: 'SQLite/Mongo/Supabase tabloları...', required: false },
        ],
      },
      {
        title: 'Discord Event Debug Paketi',
        category: 'bugfix',
        description: 'voiceStateUpdate, interactionCreate ve messageCreate gibi event sorunlarını kökten çözmek için.',
        template_content: `Act as a senior event-driven debugging engineer for Discord.js v14.

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}
Architecture: {{core_architecture}}

## Bug
{{task_description}}

## Event Flow
{{event_flow}}

## Log / Error Output
\`\`\`
{{error_message}}
\`\`\`

## Expected Behavior
{{expected_behavior}}

## Constraints
- Clarify event handler ownership.
- Search for duplicate listeners or double registration.
- Do not change existing command semantics.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Root cause
2. Evidence
3. Minimal patch
4. Runtime verification
5. Regression checklist`,
        variables: [
          ...taskVars,
          { key: 'event_flow', label: 'Event akışı', type: 'textarea', placeholder: 'Hangi event hangi handlera gidiyor?', required: false },
          { key: 'error_message', label: 'Hata mesajı', type: 'textarea', placeholder: 'Log/stack trace', required: false },
          { key: 'expected_behavior', label: 'Beklenen davranış', type: 'textarea', placeholder: 'Ne olmalıydı?', required: true },
        ],
      },
    ],
  },
  {
    id: 'documentation-pack',
    title: 'Dokümantasyon Paketi',
    description: 'README, AGENTS.md, changelog ve onboarding dokümanları için.',
    category: 'codereview',
    sourceNote: 'GitHub/Cursor reusable instruction dosyaları ve repo onboarding pratiklerinden sentezlendi.',
    tags: ['docs', 'agents', 'readme', 'onboarding'],
    templates: [
      {
        title: 'AGENTS.md / Custom Instructions Güncelle',
        category: 'codereview',
        description: 'Kod ajanı talimatlarını kısa, uygulanabilir ve scoped hale getirir.',
        template_content: `Act as a senior developer experience engineer.

## Existing Instructions
\`\`\`md
{{existing_instructions}}
\`\`\`

## Update Goal
{{task_description}}

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}

## Instruction Quality Rules
- Keep rules focused, actionable, and non-conflicting.
- Prefer concrete commands, paths, and examples.
- Separate project conventions from personal preferences.
- Remove stale or duplicated instructions.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Problems in current instructions
2. Revised AGENTS.md/custom instructions
3. Rationale for changes
4. Maintenance checklist`,
        variables: [
          ...taskVars,
          { key: 'existing_instructions', label: 'Mevcut talimatlar', type: 'textarea', placeholder: 'AGENTS.md veya custom instructions...', required: true },
        ],
      },
      {
        title: 'README ve Onboarding Dokümanı',
        category: 'codereview',
        description: 'Yeni geliştirici için kurulum, komutlar, mimari ve sık hataları netleştirir.',
        template_content: `Act as a senior technical writer for developer onboarding.

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}
Architecture: {{core_architecture}}
Current state: {{current_state}}

## Documentation Goal
{{task_description}}

## Required Sections
- What this project does
- Setup and environment variables
- Development commands
- Architecture overview
- Common workflows
- Troubleshooting
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. README structure
2. Full markdown content
3. Missing information questions
4. Maintenance notes`,
        variables: taskVars,
      },
    ],
  },
];
