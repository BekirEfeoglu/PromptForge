import type { PromptCategory, PromptSkill, SkillCategory } from '@/types';

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  general: 'Genel',
  architecture: 'Mimari',
  feature: 'Özellik',
  bugfix: 'Bug Fix',
  uiux: 'UI/UX',
  supabase: 'Supabase',
  discord: 'Discord',
  refactor: 'Refactor',
  codereview: 'Code Review',
  testing: 'Test',
  security: 'Güvenlik',
  devops: 'DevOps',
  docs: 'Dokümantasyon',
  data: 'Veri',
  ai: 'AI / Agent',
  mobile: 'Mobil',
};

export const SKILL_CATEGORY_ORDER: SkillCategory[] = [
  'general',
  'architecture',
  'feature',
  'bugfix',
  'uiux',
  'testing',
  'security',
  'supabase',
  'data',
  'discord',
  'refactor',
  'devops',
  'docs',
  'ai',
  'mobile',
  'codereview',
];

export const defaultSkills: PromptSkill[] = [
  {
    id: 'using-superpowers',
    name: 'Using Superpowers',
    category: 'general',
    description: 'Agent iş akışını plan, uygulama, doğrulama ve kapanış disiplinine bağlar.',
    useWhen: 'Belirsiz veya çok adımlı geliştirme işlerinde.',
    tags: ['workflow', 'plan', 'verify'],
    promptInstruction:
      'Use a disciplined agent workflow: identify the right workflow skill, make a short plan, execute in small safe steps, verify before completion, and report only the useful outcome.',
  },
  {
    id: 'codebase-onboarding',
    name: 'Codebase Onboarding',
    category: 'architecture',
    description: 'Koda dokunmadan önce repo mimarisini ve sahiplik sınırlarını çıkarır.',
    useWhen: 'Yeni repo, büyük modül veya bilinmeyen mimari üzerinde çalışırken.',
    tags: ['repo', 'architecture', 'context'],
    promptInstruction:
      'Before editing, map the relevant files, data flow, state ownership, commands, and existing conventions. Use that map to keep the implementation scoped.',
  },
  {
    id: 'context7-docs',
    name: 'Context7 / Current Docs',
    category: 'docs',
    description: 'Kütüphane API’leri için güncel dokümantasyon kontrolünü zorunlu kılar.',
    useWhen: 'Framework, SDK, paket sürümü veya yeni API kullanımı gerektiğinde.',
    recommendedFor: ['feature', 'bugfix', 'supabase', 'discord', 'refactor'],
    tags: ['docs', 'api', 'versions'],
    promptInstruction:
      'Verify current library APIs from primary documentation before coding, especially for recently changed packages, framework versions, SDK methods, and configuration syntax.',
  },
  {
    id: 'architecture-review',
    name: 'Architecture Review',
    category: 'architecture',
    description: 'Modül sınırlarını, veri akışını ve bağımlılık yönünü kontrol eder.',
    useWhen: 'Yeni özellik birden fazla store, route, servis veya modüle dokunuyorsa.',
    tags: ['architecture', 'module', 'boundaries'],
    promptInstruction:
      'Review the architecture before coding: identify module boundaries, data ownership, dependency direction, extension points, and the smallest change that fits the existing system.',
  },
  {
    id: 'impact-analysis',
    name: 'Impact Analysis',
    category: 'architecture',
    description: 'Değişikliğin etkilediği akışları ve regresyon risklerini listeler.',
    useWhen: 'Paylaşılan yardımcı, store, type, compiler veya router değiştiğinde.',
    recommendedFor: ['refactor', 'bugfix', 'codereview'],
    tags: ['risk', 'regression', 'blast-radius'],
    promptInstruction:
      'Before implementation, list the impacted files, user flows, persisted data, tests, and likely regressions. Use that list to scope verification.',
  },
  {
    id: 'migration-planning',
    name: 'Migration Planning',
    category: 'architecture',
    description: 'Geriye uyumlu schema, localStorage veya API geçiş planı kurar.',
    useWhen: 'Persisted veri, database, backup formatı veya API contract değişiyorsa.',
    recommendedFor: ['supabase', 'refactor', 'feature'],
    tags: ['migration', 'compatibility', 'data'],
    promptInstruction:
      'Plan migrations for backward compatibility: default legacy fields, avoid destructive changes, document migration behavior, and verify old data still loads.',
  },
  {
    id: 'test-driven-development',
    name: 'Test-Driven Development',
    category: 'feature',
    description: 'Yeni davranışı önce test beklentisiyle netleştirir.',
    useWhen: 'Davranış riski yüksek yeni özellik veya refactor öncesinde.',
    tags: ['tdd', 'tests', 'feature'],
    promptInstruction:
      'Start with focused tests or test cases that describe the intended behavior, implement only what is needed to pass them, then run the relevant verification commands.',
  },
  {
    id: 'react-best-practices',
    name: 'React Best Practices',
    category: 'feature',
    description: 'React state, render ve bileşen sınırlarını sade tutar.',
    useWhen: 'Yeni React bileşeni, state akışı veya performans hassas UI değişikliğinde.',
    recommendedFor: ['uiux', 'refactor'],
    tags: ['react', 'state', 'components'],
    promptInstruction:
      'Use idiomatic React: keep state ownership clear, memoize only where useful, avoid unnecessary effects, preserve accessibility, and keep components focused.',
  },
  {
    id: 'api-integration',
    name: 'API Integration',
    category: 'feature',
    description: 'Dış API entegrasyonlarında hata, retry, timeout ve schema güvenliği ekler.',
    useWhen: 'REST/SSE/webhook, ödeme, LLM, Discord veya üçüncü parti servis entegrasyonunda.',
    recommendedFor: ['discord', 'supabase'],
    tags: ['api', 'retry', 'schema'],
    promptInstruction:
      'Design API integration defensively: validate inputs and responses, handle timeout/retry/rate limits, avoid leaking secrets, and make failure states visible to users.',
  },
  {
    id: 'product-requirements',
    name: 'Product Requirements',
    category: 'feature',
    description: 'Özelliği kullanıcı amacı, kabul kriteri ve edge case ile netleştirir.',
    useWhen: 'İstek geniş veya kullanıcı akışı net değilse.',
    tags: ['prd', 'acceptance', 'scope'],
    promptInstruction:
      'Clarify the feature into user goals, acceptance criteria, out-of-scope items, edge cases, and a minimal implementation plan before coding.',
  },
  {
    id: 'form-workflow',
    name: 'Form Workflow',
    category: 'feature',
    description: 'Form validasyonu, boş durum, hata mesajı ve kaydetme akışını güçlendirir.',
    useWhen: 'Form, wizard, settings veya veri giriş ekranı geliştirirken.',
    recommendedFor: ['uiux'],
    tags: ['forms', 'validation', 'wizard'],
    promptInstruction:
      'Implement forms as complete workflows: labels, validation, disabled states, error messages, persistence behavior, reset behavior, and keyboard-friendly controls.',
  },
  {
    id: 'systematic-debugging',
    name: 'Systematic Debugging',
    category: 'bugfix',
    description: 'Hata çözümünde kanıt, tekrar üretim ve kök neden sırası kurar.',
    useWhen: 'Runtime hatası, bozuk akış veya belirsiz regresyon olduğunda.',
    tags: ['debug', 'root-cause', 'repro'],
    promptInstruction:
      'Use a systematic debugging workflow: reproduce the issue, gather evidence, isolate the root cause, make the smallest durable fix, and verify the exact failing path.',
  },
  {
    id: 'regression-hunt',
    name: 'Regression Hunt',
    category: 'bugfix',
    description: 'Önceden çalışan davranışı bozan değişikliği izole eder.',
    useWhen: 'Yeni değişiklik sonrası eski akış kırıldıysa.',
    tags: ['regression', 'history', 'diff'],
    promptInstruction:
      'Find the regression by comparing expected behavior with current behavior, identifying the smallest changed surface, and adding a focused guard against recurrence.',
  },
  {
    id: 'log-analysis',
    name: 'Log Analysis',
    category: 'bugfix',
    description: 'Terminal, browser console ve runtime loglarından sinyal çıkarır.',
    useWhen: 'Hata mesajı, stack trace, CI logu veya browser console çıktısı varsa.',
    tags: ['logs', 'stack-trace', 'runtime'],
    promptInstruction:
      'Use logs as evidence: quote the relevant error, map it to the failing code path, avoid guessing from symptoms alone, and verify the log disappears after the fix.',
  },
  {
    id: 'frontend-design',
    name: 'Frontend Design',
    category: 'uiux',
    description: 'Modern, tutarlı ve responsive arayüz kararları üretir.',
    useWhen: 'Ekran, komponent, layout veya görsel kalite işi olduğunda.',
    tags: ['ui', 'visual', 'responsive'],
    promptInstruction:
      'Treat this as a production UI task: preserve existing design language, ensure responsive behavior, check spacing and hierarchy, and validate the rendered interface.',
  },
  {
    id: 'shadcn-ui',
    name: 'shadcn/ui Patterns',
    category: 'uiux',
    description: 'Komponent tutarlılığı, erişilebilirlik ve tasarım sistemi uyumu sağlar.',
    useWhen: 'shadcn, Radix, Tailwind veya component library tabanlı UI işlerinde.',
    tags: ['components', 'design-system', 'tailwind'],
    promptInstruction:
      'Follow shadcn/ui-style component discipline: use accessible primitives, keep variants consistent, avoid ad-hoc styling drift, and preserve reusable component boundaries.',
  },
  {
    id: 'accessibility-audit',
    name: 'Accessibility Audit',
    category: 'uiux',
    description: 'Klavye erişimi, etiketler, kontrast ve focus davranışını kontrol eder.',
    useWhen: 'Yeni UI kontrolü, form, modal, navigasyon veya yoğun dashboard ekranlarında.',
    recommendedFor: ['codereview'],
    tags: ['a11y', 'keyboard', 'contrast'],
    promptInstruction:
      'Check accessibility basics: semantic controls, labels, keyboard flow, focus-visible states, color contrast, readable text, and non-visual state announcements where relevant.',
  },
  {
    id: 'responsive-layout',
    name: 'Responsive Layout',
    category: 'uiux',
    description: 'Mobil, tablet ve desktop kırılımlarında taşma/örtüşme riskini azaltır.',
    useWhen: 'Dashboard, wizard, tablo, kart grid veya sidebar içeren ekranlarda.',
    recommendedFor: ['feature'],
    tags: ['mobile', 'tablet', 'layout'],
    promptInstruction:
      'Design responsive behavior explicitly: define stable dimensions, wrapping, grid changes, scroll behavior, and verify no text or controls overlap on mobile and desktop.',
  },
  {
    id: 'design-system-audit',
    name: 'Design System Audit',
    category: 'uiux',
    description: 'Renk, radius, spacing, button ve kart kullanımındaki tutarsızlıkları yakalar.',
    useWhen: 'UI yüzeyi büyüdüğünde veya farklı ekranlar dağınık görünüyorsa.',
    tags: ['design-system', 'consistency', 'tokens'],
    promptInstruction:
      'Audit the UI for consistency: spacing scale, typography hierarchy, button patterns, card usage, colors, empty states, and repeated component opportunities.',
  },
  {
    id: 'playwright-browser-qa',
    name: 'Playwright Browser QA',
    category: 'testing',
    description: 'Kritik kullanıcı akışını gerçek tarayıcı etkileşimiyle doğrular.',
    useWhen: 'Form, wizard, modal, route, responsive ekran veya görsel regresyon kontrolünde.',
    recommendedFor: ['uiux', 'feature', 'bugfix'],
    tags: ['playwright', 'browser', 'e2e'],
    promptInstruction:
      'Validate the changed user flow with Playwright or the available browser tool: load the page, perform the interaction, check console health, and assert the expected visible state.',
  },
  {
    id: 'frontend-testing-debugging',
    name: 'Frontend Testing Debugging',
    category: 'testing',
    description: 'Tarayıcıda gerçek akışı, konsolu ve responsive görünümü kontrol eder.',
    useWhen: 'UI değişikliği sonrası görsel veya etkileşim doğrulaması gerektiğinde.',
    recommendedFor: ['uiux', 'bugfix'],
    tags: ['browser', 'console', 'qa'],
    promptInstruction:
      'After the code change, run the app, inspect the target flow in a browser, check console errors, verify the interaction, and capture evidence for desktop and mobile when practical.',
  },
  {
    id: 'unit-test-strategy',
    name: 'Unit Test Strategy',
    category: 'testing',
    description: 'Küçük davranışları hızlı ve deterministik testlerle korur.',
    useWhen: 'Helper, compiler, parser, store veya pure logic değiştiğinde.',
    recommendedFor: ['feature', 'bugfix', 'refactor'],
    tags: ['unit', 'vitest', 'logic'],
    promptInstruction:
      'Add focused unit tests for pure behavior and edge cases. Avoid brittle implementation assertions; verify the exported behavior that users or callers depend on.',
  },
  {
    id: 'contract-testing',
    name: 'Contract Testing',
    category: 'testing',
    description: 'API, schema, backup ve persisted veri contract’larını pinler.',
    useWhen: 'Veri formatı, request/response, import/export veya localStorage şeması değiştiğinde.',
    recommendedFor: ['supabase', 'feature', 'refactor'],
    tags: ['contract', 'schema', 'compatibility'],
    promptInstruction:
      'Protect contracts with tests: valid payloads, legacy payloads, malformed payloads, defaults, and compatibility between producer and consumer.',
  },
  {
    id: 'security-scan',
    name: 'Security Scan',
    category: 'security',
    description: 'Gizli anahtar, tarayıcı güvenliği ve yetki risklerini kontrol eder.',
    useWhen: 'Auth, API anahtarı, dış servis, dosya yükleme veya veri erişimi değiştiğinde.',
    recommendedFor: ['supabase', 'discord', 'codereview'],
    tags: ['security', 'secrets', 'authorization'],
    promptInstruction:
      'Check for security risks: secret exposure, unsafe client-side trust, injection, broken authorization, insecure storage, and risky dependency or network behavior.',
  },
  {
    id: 'auth-authorization-review',
    name: 'Auth / Authorization Review',
    category: 'security',
    description: 'Kimlik doğrulama, rol kontrolü ve yetki bypass riskini inceler.',
    useWhen: 'Login, session, admin panel, Discord permission veya RLS değiştiğinde.',
    recommendedFor: ['supabase', 'discord'],
    tags: ['auth', 'roles', 'rls'],
    promptInstruction:
      'Review authentication and authorization paths: who can perform the action, where trust is enforced, how failures behave, and whether client checks are backed by server-side rules.',
  },
  {
    id: 'secrets-handling',
    name: 'Secrets Handling',
    category: 'security',
    description: 'API anahtarı ve env kullanımının client/server sınırını kontrol eder.',
    useWhen: 'LLM, Supabase, webhook, CI secret veya proxy ayarı eklendiğinde.',
    recommendedFor: ['feature', 'supabase'],
    tags: ['env', 'api-key', 'proxy'],
    promptInstruction:
      'Handle secrets carefully: keep private keys out of client bundles, document required env vars, avoid logging sensitive values, and explain unavoidable client-side risks.',
  },
  {
    id: 'supabase-postgres-best-practices',
    name: 'Supabase Postgres Best Practices',
    category: 'supabase',
    description: 'RLS, migration ve sorgu güvenliği için kontrol listesi sağlar.',
    useWhen: 'Supabase tablo, auth, RLS, Edge Function veya veri modeli işlerinde.',
    tags: ['supabase', 'postgres', 'rls'],
    promptInstruction:
      'Plan database changes carefully: prefer migrations, validate RLS and indexes, keep secrets server-side, and include rollback or compatibility notes when relevant.',
  },
  {
    id: 'rls-audit',
    name: 'RLS Audit',
    category: 'supabase',
    description: 'Supabase row-level security policy kapsamını ve boşluklarını kontrol eder.',
    useWhen: 'Kullanıcı verisi, ekip verisi veya tenant ayrımı olan tablolarda.',
    tags: ['rls', 'tenant', 'policy'],
    promptInstruction:
      'Audit RLS policies for each table and operation: select, insert, update, delete, ownership checks, service role assumptions, and anonymous access behavior.',
  },
  {
    id: 'edge-function-hardening',
    name: 'Edge Function Hardening',
    category: 'supabase',
    description: 'Supabase Edge Function giriş, hata ve secret kullanımını güçlendirir.',
    useWhen: 'Edge Function, webhook veya server-side Supabase endpoint yazarken.',
    tags: ['edge-functions', 'webhook', 'server'],
    promptInstruction:
      'Harden edge functions: validate method and body, authenticate callers, use server-side secrets only, handle CORS intentionally, and return safe error messages.',
  },
  {
    id: 'database-performance',
    name: 'Database Performance',
    category: 'data',
    description: 'Index, sorgu planı, pagination ve veri erişim maliyetini gözden geçirir.',
    useWhen: 'Listeleme, filtreleme, raporlama veya yoğun okuma/yazma akışlarında.',
    recommendedFor: ['supabase'],
    tags: ['indexes', 'pagination', 'queries'],
    promptInstruction:
      'Review data access for performance: check indexes, query shape, pagination, RLS impact, N+1 patterns, payload size, and migration safety.',
  },
  {
    id: 'data-modeling',
    name: 'Data Modeling',
    category: 'data',
    description: 'Entity, ilişki, enum ve lifecycle alanlarını tutarlı tasarlar.',
    useWhen: 'Yeni tablo, store modeli, domain type veya JSON schema eklerken.',
    recommendedFor: ['feature', 'supabase'],
    tags: ['schema', 'types', 'entities'],
    promptInstruction:
      'Model data explicitly: required fields, nullable fields, lifecycle timestamps, ownership, relationships, validation, migration defaults, and UI consumption patterns.',
  },
  {
    id: 'data-migration',
    name: 'Data Migration',
    category: 'data',
    description: 'Eski kayıtları bozmadan yeni alan ve format geçişi yapar.',
    useWhen: 'localStorage, backup, database veya imported dosya formatı değiştiğinde.',
    recommendedFor: ['supabase', 'refactor'],
    tags: ['migration', 'legacy', 'defaults'],
    promptInstruction:
      'Implement data migrations defensively: normalize legacy records, preserve unknown fields where appropriate, validate malformed input, and add tests for old and new data.',
  },
  {
    id: 'nodejs-backend-patterns',
    name: 'Node.js Backend Patterns',
    category: 'discord',
    description: 'Discord bot ve Node servislerinde güvenli runtime akışı kurar.',
    useWhen: 'Komut, event handler, queue, rate limit veya process yönetimi değiştiğinde.',
    tags: ['node', 'runtime', 'discord'],
    promptInstruction:
      'Use production Node.js patterns: centralize shared behavior, handle async errors, respect rate limits, avoid duplicate listeners, and verify runtime startup paths.',
  },
  {
    id: 'discord-command-ux',
    name: 'Discord Command UX',
    category: 'discord',
    description: 'Slash command yanıtlarını net, private ve aksiyon odaklı hale getirir.',
    useWhen: 'Discord komutu, embed, button, select menu veya modal değiştiğinde.',
    tags: ['discord', 'commands', 'embed'],
    promptInstruction:
      'Design Discord interactions for clarity: ephemeral where appropriate, clear next actions, consistent embeds, permission feedback, and no ambiguous operator controls.',
  },
  {
    id: 'bot-runtime-hardening',
    name: 'Bot Runtime Hardening',
    category: 'discord',
    description: 'Duplicate listener, command register, lock ve startup sorunlarını azaltır.',
    useWhen: 'Bot açılışı, event wiring, command deploy veya process lifecycle değiştiğinde.',
    tags: ['startup', 'events', 'locks'],
    promptInstruction:
      'Harden bot runtime behavior: prevent duplicate wiring, validate command registration, handle graceful shutdown, avoid stale locks, and include a startup probe when possible.',
  },
  {
    id: 'refactor',
    name: 'Refactor',
    category: 'refactor',
    description: 'Davranışı koruyarak küçük ve güvenli kod düzenleme yapar.',
    useWhen: 'Kod sadeleştirme, modül ayırma veya tekrar azaltma gerektiğinde.',
    tags: ['refactor', 'cleanup', 'behavior'],
    promptInstruction:
      'Refactor surgically: preserve behavior, keep the diff scoped, avoid broad rewrites, and run targeted checks proving existing flows still work.',
  },
  {
    id: 'performance-optimization',
    name: 'Performance Optimization',
    category: 'refactor',
    description: 'Gereksiz render, büyük bundle, yavaş sorgu ve pahalı işlemleri hedefler.',
    useWhen: 'Yavaş ekran, büyük liste, ağır state, pahalı hesaplama veya bundle büyümesinde.',
    recommendedFor: ['uiux', 'feature'],
    tags: ['performance', 'bundle', 'render'],
    promptInstruction:
      'Optimize only measured or plausible hotspots: reduce unnecessary renders, split heavy work, keep bundles lean, cache carefully, and verify behavior did not change.',
  },
  {
    id: 'dead-code-cleanup',
    name: 'Dead Code Cleanup',
    category: 'refactor',
    description: 'Kullanılmayan kodu güvenli kanıtla temizler.',
    useWhen: 'Eski komponent, route, helper veya config kalıntıları olduğunda.',
    tags: ['cleanup', 'unused', 'maintenance'],
    promptInstruction:
      'Remove dead code only with evidence: search references, check exports/imports, preserve public contracts, and run build/lint after cleanup.',
  },
  {
    id: 'github-actions-docs',
    name: 'GitHub Actions / CI',
    category: 'devops',
    description: 'CI workflow, lint/test/build kapıları ve artifact akışlarını düzenler.',
    useWhen: 'GitHub Actions, release, test pipeline veya otomasyon dosyaları değiştiğinde.',
    tags: ['ci', 'github-actions', 'pipeline'],
    promptInstruction:
      'For CI changes, keep workflows minimal and deterministic, pin permissions, cache safely, run the same verification locally when possible, and document required secrets.',
  },
  {
    id: 'docker-devops',
    name: 'Docker / DevOps',
    category: 'devops',
    description: 'Container, environment ve deploy ayarlarını güvenli hale getirir.',
    useWhen: 'Dockerfile, compose, env, production build veya deploy yapılandırmasında.',
    tags: ['docker', 'deploy', 'environment'],
    promptInstruction:
      'Use practical DevOps hygiene: small images, explicit env vars, non-root where possible, health checks, clear build/run commands, and no secrets baked into artifacts.',
  },
  {
    id: 'observability',
    name: 'Observability',
    category: 'devops',
    description: 'Log, metric, error boundary ve izlenebilirlik sinyallerini planlar.',
    useWhen: 'Production hata takibi, background job, API veya kritik runtime akışı değiştiğinde.',
    tags: ['logs', 'metrics', 'monitoring'],
    promptInstruction:
      'Add practical observability: meaningful logs, error boundaries or handlers, correlation where useful, safe redaction, and clear signals for success and failure states.',
  },
  {
    id: 'release-checklist',
    name: 'Release Checklist',
    category: 'devops',
    description: 'Yayın öncesi build, test, migration, env ve rollback kontrolü yapar.',
    useWhen: 'Özellik teslimi, deploy hazırlığı veya sürüm notu gerektiğinde.',
    tags: ['release', 'deploy', 'rollback'],
    promptInstruction:
      'Before release, check build, tests, migrations, environment variables, compatibility, user-facing changes, rollback notes, and known residual risk.',
  },
  {
    id: 'documentation-writer',
    name: 'Documentation Writer',
    category: 'docs',
    description: 'README, AGENTS, kullanım notu ve teknik kararları kısa, uygulanabilir yazar.',
    useWhen: 'Yeni özellik, kurulum, komut, mimari veya handoff dokümanı gerektiğinde.',
    tags: ['readme', 'handoff', 'docs'],
    promptInstruction:
      'Write concise documentation for the actual repo state: commands, setup, feature behavior, assumptions, limitations, and verification steps without marketing filler.',
  },
  {
    id: 'changelog-generator',
    name: 'Changelog Generator',
    category: 'docs',
    description: 'Kullanıcıya dönük değişiklikleri kısa ve anlaşılır özetler.',
    useWhen: 'Birden fazla görünür değişiklik veya release notu gerektiğinde.',
    tags: ['changelog', 'release-notes', 'summary'],
    promptInstruction:
      'Generate a user-facing changelog grouped by meaningful outcomes, not file names. Include breaking changes, migrations, and verification notes when relevant.',
  },
  {
    id: 'api-docs',
    name: 'API Docs',
    category: 'docs',
    description: 'Endpoint, payload, hata ve örnek kullanım dokümantasyonu oluşturur.',
    useWhen: 'REST endpoint, webhook, SDK helper veya integration contract eklerken.',
    recommendedFor: ['feature', 'supabase'],
    tags: ['api', 'contract', 'examples'],
    promptInstruction:
      'Document API contracts with endpoint purpose, auth, request/response shape, errors, examples, and compatibility notes.',
  },
  {
    id: 'prompt-engineering',
    name: 'Prompt Engineering',
    category: 'ai',
    description: 'LLM promptlarını rol, bağlam, çıktı ve kalite kriterleriyle güçlendirir.',
    useWhen: 'Prompt template, system instruction, guardrail veya LLM akışı değiştiğinde.',
    recommendedFor: ['feature', 'codereview'],
    tags: ['prompt', 'llm', 'templates'],
    promptInstruction:
      'Improve prompts with clear role, task, context, constraints, examples when useful, output format, verification criteria, and no vague filler.',
  },
  {
    id: 'llm-evaluation',
    name: 'LLM Evaluation',
    category: 'ai',
    description: 'LLM çıktısını senaryo, skor ve regresyon vakalarıyla değerlendirir.',
    useWhen: 'Prompt kalitesi, model seçimi veya otomatik kalite ölçümü değiştiğinde.',
    tags: ['evals', 'quality', 'llm'],
    promptInstruction:
      'Evaluate LLM behavior with representative cases, expected qualities, failure modes, scoring criteria, and regression checks for important outputs.',
  },
  {
    id: 'mcp-integration',
    name: 'MCP Integration',
    category: 'ai',
    description: 'MCP tool/schema entegrasyonlarında güvenli çağrı ve fallback akışı kurar.',
    useWhen: 'MCP server, connector, tool call veya agent entegrasyonu gerektiğinde.',
    tags: ['mcp', 'tools', 'agents'],
    promptInstruction:
      'Design MCP integrations around typed tool schemas, clear permissions, error handling, fallback paths, and minimal data exposure.',
  },
  {
    id: 'mobile-responsive',
    name: 'Mobile Responsive QA',
    category: 'mobile',
    description: 'Mobil viewport’ta touch hedefleri, scroll ve metin taşmasını kontrol eder.',
    useWhen: 'Mobilde kullanılan her ekran, wizard, kart grid veya toolbar değiştiğinde.',
    recommendedFor: ['uiux', 'feature'],
    tags: ['mobile', 'responsive', 'touch'],
    promptInstruction:
      'Validate mobile UX: touch target size, readable text, no horizontal overflow, stable toolbars, sensible scrolling, and no hidden primary actions.',
  },
  {
    id: 'pwa-offline',
    name: 'PWA / Offline',
    category: 'mobile',
    description: 'Offline, cache, install ve network fallback davranışlarını planlar.',
    useWhen: 'PWA, offline cache, service worker veya mobil web app gereksinimi varsa.',
    tags: ['pwa', 'offline', 'cache'],
    promptInstruction:
      'Plan PWA behavior carefully: cache strategy, update behavior, offline fallback, install metadata, and clear handling of stale data.',
  },
  {
    id: 'code-review',
    name: 'Code Review',
    category: 'codereview',
    description: 'Bulguları risk, dosya ve doğrulama açığına göre sıralar.',
    useWhen: 'PR, diff veya mevcut kod yüzeyi inceleneceğinde.',
    tags: ['review', 'bugs', 'risk'],
    promptInstruction:
      'Review like a senior engineer: lead with concrete bugs and regressions, cite files and lines, separate assumptions from findings, and mention missing tests.',
  },
  {
    id: 'dependency-audit',
    name: 'Dependency Audit',
    category: 'codereview',
    description: 'Paket, sürüm, bundle ve güvenlik etkisini gözden geçirir.',
    useWhen: 'Yeni dependency eklendiğinde veya major version yükseltildiğinde.',
    recommendedFor: ['codereview', 'refactor'],
    tags: ['dependencies', 'audit', 'bundle'],
    promptInstruction:
      'Audit dependencies for necessity, maintenance, security, bundle impact, license risk, and whether a standard-library or existing-project alternative is enough.',
  },
];

export function getDefaultSkillsByIds(ids: string[]): PromptSkill[] {
  const selectedIds = new Set(ids);
  return defaultSkills.filter((skill) => selectedIds.has(skill.id));
}

export function isSkillRecommendedForCategory(skill: PromptSkill, category: PromptCategory | null): boolean {
  return (
    skill.category === 'general' ||
    (!!category && skill.category === category) ||
    (!!category && Boolean(skill.recommendedFor?.includes(category)))
  );
}
