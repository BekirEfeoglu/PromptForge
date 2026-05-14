import type { PromptTemplate, TemplateVariable } from '@/types';
import { generateId } from '@/lib/utils';

// ===== Variable Definitions =====
const commonVars: TemplateVariable[] = [
  {
    key: 'task_description',
    label: 'Ne yapmak istiyorsun?',
    type: 'textarea',
    placeholder: 'Kısa ve net olarak açıkla...',
    examples: [
      'Şablon Kütüphanesi ekranına arama, kategori filtresi ve hazır paket yükleme deneyimi ekle.',
      'Mobil görünümde taşan butonları ve okunmayan açıklama metinlerini düzelt.',
      'Kaydedilen promptlar için sürüm karşılaştırma ve geri yükleme akışı ekle.',
    ],
    required: true,
  },
  {
    key: 'constraints',
    label: 'Kısıtlamalar / Yapılmaması gerekenler',
    type: 'textarea',
    placeholder: 'Ör: Auth sistemine dokunma, mevcut API yapısını değiştirme...',
    examples: [
      'Mevcut çalışan özellikleri bozma. Gereksiz mimari değişiklik yapma.',
      'Türkçe UI metinlerini koru. TypeScript strict hatası bırakma.',
      'Sadece ilgili dosyalara dokun, unrelated refactor yapma.',
    ],
    required: false,
  },
];

// ===== Templates =====
export const defaultTemplates: PromptTemplate[] = [
  // 1. Feature Template
  {
    id: generateId(),
    title: 'Yeni Özellik Geliştirme',
    category: 'feature',
    description: 'Yeni özellik eklemek için profesyonel prompt şablonu.',
    template_content: `You are a senior full-stack software engineer and architecture assistant.

I am developing this project with vibe coding. I design the logic, user flows, and features, but I need you to write the complete code safely.

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}
Current working features: {{working_features}}

## Current State
{{current_state}}

## Task
{{task_description}}

## Additional Context
{{additional_context}}

## Constraints
- Do not break existing working features.
- Do not make unnecessary architectural changes.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Short implementation summary
2. Files to create/change (with full paths)
3. Full code or patch for each file
4. Database changes if needed
5. Test/build verification steps
6. Risks and notes
7. Final checklist`,
    variables: [
      ...commonVars,
      {
        key: 'additional_context',
        label: 'Ek bağlam bilgisi',
        type: 'textarea',
        placeholder: 'Varsa ekstra açıklama, kullanıcı akışı, vb.',
        examples: [
          'Kullanıcı önce proje seçiyor, sonra şablon seçip promptu kalite skoru ile kaydediyor.',
          'Veri localStorage üzerinde tutuluyor; Supabase sadece env varsa aktif.',
        ],
        required: false,
      },
    ],
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 2. Bug Fix Template
  {
    id: generateId(),
    title: 'Bug Fix / Hata Çözme',
    category: 'bugfix',
    description: 'Hataları kök nedenden çözmeye yönelik prompt şablonu.',
    template_content: `Act as a senior debugging engineer.

I am using vibe coding and I need you to diagnose and fix this issue without breaking existing working features.

## Project Stack
{{tech_stack}}

## Current Problem
{{task_description}}

## Error Message
\`\`\`
{{error_message}}
\`\`\`

## Expected Behavior
{{expected_behavior}}

## Actual Behavior
{{actual_behavior}}

## Related Files
{{related_files}}

## Constraints
- First identify the root cause with evidence.
- Do NOT rewrite unrelated code.
- Do NOT remove existing functionality.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Root cause analysis
2. Evidence (what in the code proves this)
3. Fixed files (full path)
4. Complete corrected code / patch
5. Verification steps (how to test the fix)
6. Prevention notes (how to avoid this in the future)`,
    variables: [
      ...commonVars,
      {
        key: 'error_message',
        label: 'Hata mesajı',
        type: 'textarea',
        placeholder: 'Console veya terminal hata çıktısını yapıştır...',
        examples: ['TypeError: Cannot read properties of undefined (reading "map")'],
        required: true,
      },
      {
        key: 'expected_behavior',
        label: 'Beklenen davranış',
        type: 'textarea',
        placeholder: 'Doğru çalışsaydı ne olacaktı?',
        examples: ['Kullanıcı kayıt sonrası dashboard sayfasına yönlenmeli ve session state güncellenmeli.'],
        required: true,
      },
      {
        key: 'actual_behavior',
        label: 'Gerçekleşen davranış',
        type: 'textarea',
        placeholder: 'Şu an ne oluyor?',
        examples: ['Submit sonrası beyaz ekran oluşuyor ve console’da TypeError görünüyor.'],
        required: true,
      },
      {
        key: 'related_files',
        label: 'İlgili dosyalar',
        type: 'textarea',
        placeholder: 'Ör: src/components/Auth.tsx, src/lib/supabase.ts',
        examples: ['src/app/auth/LoginPage.tsx\nsrc/stores/useAuthStore.ts\nsrc/lib/supabase/client.ts'],
        required: false,
      },
    ],
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 3. UI/UX Template
  {
    id: generateId(),
    title: 'UI/UX Tasarım',
    category: 'uiux',
    description: 'Modern, animasyonlu ve mobil uyumlu arayüz tasarımı için.',
    template_content: `Act as a senior UI/UX developer specializing in modern web interfaces.

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}

## Design Task
{{task_description}}

## Design Requirements
- Style: {{design_style}}
- Responsive: Must work on mobile, tablet, and desktop
- Animations: {{animation_requirements}}
- Color scheme: {{color_scheme}}

## Component Details
{{component_details}}

## Constraints
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Component structure overview
2. Full component code with styling
3. Animation/transition details
4. Responsive breakpoint handling
5. Accessibility considerations
6. Screenshot description of expected result`,
    variables: [
      ...commonVars,
      {
        key: 'design_style',
        label: 'Tasarım stili',
        type: 'text',
        placeholder: 'Ör: Glassmorphism, Minimal, Dark SaaS, Material...',
        examples: ['Yoğun ama düzenli dark SaaS; net hiyerarşi, az dekorasyon, güçlü focus state.'],
        required: false,
      },
      {
        key: 'animation_requirements',
        label: 'Animasyon gereksinimleri',
        type: 'textarea',
        placeholder: 'Ör: Hover efektleri, sayfa geçişleri, loading skeleton...',
        examples: ['Sadece hafif hover/active geçişleri kullan; reduced-motion desteğini koru.'],
        required: false,
      },
      {
        key: 'color_scheme',
        label: 'Renk şeması',
        type: 'text',
        placeholder: 'Ör: Dark mode, mor vurgu tonları...',
        examples: ['Dark zemin, mor/sky accent, yüksek kontrastlı muted text.'],
        required: false,
      },
      {
        key: 'component_details',
        label: 'Bileşen detayları',
        type: 'textarea',
        placeholder: 'Hangi bileşenler olacak, layout nasıl olacak?',
        examples: ['Üstte filtre toolbarı, altında responsive kart grid, sağda seçili öğe preview paneli.'],
        required: false,
      },
    ],
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 4. Supabase Template
  {
    id: generateId(),
    title: 'Supabase / Database',
    category: 'supabase',
    description: 'Database, Auth, RLS, Storage ve Edge Functions için.',
    template_content: `Act as a senior Supabase + TypeScript engineer.

## Project Context
Frontend: {{tech_stack}}
Backend: Supabase
Auth: {{auth_type}}
Current tables: {{current_tables}}

## Task
{{task_description}}

## Requirements
- Provide SQL migration.
- Add proper RLS policies and explain each one.
- Never expose service_role_key on the client.
- Use typed Supabase client examples.
- Use explicit select fields (no select *).
- Include loading, error, and empty states in frontend code.

## Constraints
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Database design (table diagram or description)
2. SQL migration script
3. RLS policies with explanations
4. TypeScript type definitions
5. Frontend integration code
6. Test checklist`,
    variables: [
      ...commonVars,
      {
        key: 'auth_type',
        label: 'Auth tipi',
        type: 'text',
        placeholder: 'Ör: Email/Password, Google OAuth, Magic Link...',
        examples: ['Email/password + Google OAuth, kullanıcı profili public.profiles tablosunda.'],
        required: false,
      },
      {
        key: 'current_tables',
        label: 'Mevcut tablolar',
        type: 'textarea',
        placeholder: 'Ör: profiles, projects, posts...',
        examples: ['profiles(id, user_id, display_name)\nprojects(id, owner_id, name)\nprompts(id, project_id, final_prompt)'],
        required: false,
      },
    ],
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 5. Discord Bot Template
  {
    id: generateId(),
    title: 'Discord Bot Komutu',
    category: 'discord',
    description: 'Discord.js v14 bot geliştirmeleri için.',
    template_content: `Act as a senior Discord bot developer using discord.js v14 and TypeScript.

I am building a Discord bot with vibe coding. I will describe the feature, and you will produce complete, safe, production-ready code.

## Bot Context
Bot type: {{bot_type}}
Database: {{database}}
Current command structure: {{command_structure}}

## Feature Request
{{task_description}}

## Specific Requirements
- Command type: {{command_type}}
- Embed required: {{embed_required}}
- Buttons/Select menus: {{interactions}}
- Cooldown needed: {{cooldown}}
- Database operations: {{db_operations}}

## Constraints
- Use discord.js v14
- Use TypeScript
- Use slash commands
- Use EmbedBuilder for responses
- Validate all user inputs
- Keep commands modular
- Do not break existing commands
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Feature summary
2. Files to create/change
3. Full code for each file
4. Database schema if needed
5. Slash command registration notes
6. Test checklist`,
    variables: [
      ...commonVars,
      { key: 'bot_type', label: 'Bot tipi', type: 'text', placeholder: 'Ör: Moderasyon, Economy, RPG, Müzik...', examples: ['Moderasyon + özel ses odası yönetimi'], required: false },
      { key: 'database', label: 'Veritabanı', type: 'text', placeholder: 'Ör: SQLite, MongoDB, Supabase, PostgreSQL...', examples: ['SQLite + Prisma veya Sequelize modelleri'], required: false },
      { key: 'command_structure', label: 'Mevcut komut yapısı', type: 'textarea', placeholder: 'Ör: commands/ klasöründe her komut ayrı dosya...', examples: ['src/commands içinde kategori klasörleri var; her komut execute() export ediyor.'], required: false },
      { key: 'command_type', label: 'Komut tipi', type: 'text', placeholder: 'Ör: Slash command, Context menu...', examples: ['Slash command + ephemeral admin response'], required: false },
      { key: 'embed_required', label: 'Embed gerekiyor mu?', type: 'text', placeholder: 'Evet / Hayır', examples: ['Evet, EmbedBuilder ile durum ve next-action alanları olacak.'], required: false },
      { key: 'interactions', label: 'Button/Select menu var mı?', type: 'text', placeholder: 'Ör: Evet, onay butonu ve iptal butonu', examples: ['Onay/iptal butonu ve durum filtresi select menu.'], required: false },
      { key: 'cooldown', label: 'Cooldown süresi', type: 'text', placeholder: 'Ör: 10 saniye, yok...', examples: ['10 saniye kullanıcı bazlı cooldown.'], required: false },
      { key: 'db_operations', label: 'Database işlemleri', type: 'textarea', placeholder: 'Ör: Kullanıcı bakiyesi güncelleme, log kaydetme...', examples: ['ModerationAction kaydı oluştur, guild_id + user_id ile listele.'], required: false },
    ],
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 6. Refactor Template
  {
    id: generateId(),
    title: 'Refactor / Düzenleme',
    category: 'refactor',
    description: 'Çalışan sistemi bozmadan güvenli düzenleme yapmak için.',
    template_content: `Act as a senior software architect specializing in safe refactoring.

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}
Current working features: {{working_features}}

## Refactoring Goal
{{task_description}}

## Target Files
{{target_files}}

## Reason for Refactoring
{{refactor_reason}}

## Critical Rules
- Do NOT break any existing working feature.
- Before making large changes, explain the reasoning.
- Produce small, safe patches.
- Show file dependencies clearly.
- Use TypeScript strict mode.
{{constraints}}

{{guardrails}}

## Required Output Format ({{output_format}})
1. Refactoring plan (what changes and why)
2. Risk assessment
3. File dependency graph
4. Refactored code for each file
5. Before/After comparison for critical sections
6. Test/verification steps
7. Rollback plan if something breaks`,
    variables: [
      ...commonVars,
      { key: 'target_files', label: 'Hedef dosyalar', type: 'textarea', placeholder: 'Düzenlenecek dosyaları listele...', examples: ['src/lib/prompt-engine/compiler.ts\nsrc/stores/usePromptStore.ts'], required: true },
      { key: 'refactor_reason', label: 'Düzenleme nedeni', type: 'textarea', placeholder: 'Neden refactor gerekiyor?', examples: ['Aynı veri normalizasyonu üç yerde tekrar ediyor; davranışı değiştirmeden tek helper’a taşınmalı.'], required: true },
    ],
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 7. Code Review Template
  {
    id: generateId(),
    title: 'Kod İnceleme',
    category: 'codereview',
    description: 'Yapay zekâya mevcut kodu inceletmek için.',
    template_content: `Act as a senior code reviewer and security auditor.

## Project Context
Project name: {{project_name}}
Tech stack: {{tech_stack}}

## Review Task
{{task_description}}

## Code to Review
\`\`\`
{{code_snippet}}
\`\`\`

## Review Focus Areas
{{focus_areas}}

## Constraints
{{constraints}}

{{guardrails}}

## Required Output Format
Provide your review in this exact structure:

### 1. Critical Bugs
Issues that will cause runtime errors or incorrect behavior.

### 2. Security Vulnerabilities
XSS, injection, auth bypass, exposed secrets, etc.

### 3. TypeScript Issues
Type errors, any usage, missing generics, unsafe casts.

### 4. UI/UX Issues
Accessibility, responsive design, missing states (loading/error/empty).

### 5. Performance Issues
Unnecessary re-renders, missing memoization, N+1 queries.

### 6. Code Quality
Naming, structure, DRY violations, readability.

### 7. Priority Action Items
Ordered list of what to fix first.

### 8. Safe Patch
Provide corrected code for the highest priority issues.`,
    variables: [
      ...commonVars,
      { key: 'code_snippet', label: 'İncelenecek kod', type: 'textarea', placeholder: 'Kodu buraya yapıştır...', examples: ['function save(data: any) { localStorage.setItem("x", JSON.stringify(data)); }'], required: true },
      { key: 'focus_areas', label: 'Odak alanları', type: 'textarea', placeholder: 'Ör: Güvenlik, performans, TypeScript hataları...', examples: ['TypeScript strict, güvenlik, kullanıcıya görünen regresyonlar ve eksik testler.'], required: false },
    ],
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
