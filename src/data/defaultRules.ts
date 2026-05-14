/**
 * Vibe Coding Guardrails — Otomatik olarak her prompt'a eklenen kurallar.
 */
export const VIBE_CODING_GUARDRAILS = `## Important Vibe Coding Rules
1. First, explain what you will do in simple terms before writing code.
2. Do NOT break existing working features.
3. If you need a major architectural change, explain WHY before doing it.
4. Provide complete, runnable code — no pseudo-code or placeholders.
5. If any information is missing, clearly state your assumption.
6. Work file by file. Show the full path of each file you change.
7. Do NOT leave TypeScript errors. Use strict-safe typing.
8. Include test/build/verification steps at the end.
9. If any operation has security risks, warn about it explicitly.
10. Do NOT add unnecessary features or over-engineer.`;

/**
 * Default project rules that are added when a new project is created.
 */
export const DEFAULT_PROJECT_RULES = [
  'Çalışan özellikleri bozma',
  'TypeScript strict uyumlu kod yaz',
  'Gereksiz refactor yapma',
  'Eksik dosya varsa varsayım yapmadan belirt',
  'Tam ve çalıştırılabilir kod ver',
];
