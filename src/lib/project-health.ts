import type { Project } from '@/types';

export type ProjectHealthStatus = 'good' | 'warning' | 'missing';

export interface ProjectHealthCheck {
  id: string;
  label: string;
  detail: string;
  status: ProjectHealthStatus;
  score: number;
  maxScore: number;
}

export interface ProjectHealthResult {
  score: number;
  maxScore: number;
  status: ProjectHealthStatus;
  checks: ProjectHealthCheck[];
}

function hasText(value: string | undefined | null, minLength = 3): boolean {
  return !!value && value.trim().replace(/[-*#`\s]/g, '').length >= minLength;
}

function hasList(values: string[] | undefined | null, minCount = 1): boolean {
  return Array.isArray(values) && values.filter((value) => hasText(value)).length >= minCount;
}

function check(
  id: string,
  label: string,
  detail: string,
  maxScore: number,
  passed: boolean,
  warning = false
): ProjectHealthCheck {
  return {
    id,
    label,
    detail,
    maxScore,
    score: passed ? maxScore : warning ? Math.round(maxScore * 0.45) : 0,
    status: passed ? 'good' : warning ? 'warning' : 'missing',
  };
}

export function computeProjectHealth(project: Project): ProjectHealthResult {
  const checks: ProjectHealthCheck[] = [
    check('name', 'Proje adı', 'Promptlarda net proje kimliği sağlar.', 8, hasText(project.name)),
    check('description', 'Açıklama', 'AI modeline ürün amacı ve kapsamını verir.', 12, hasText(project.description, 12)),
    check('tech_stack', 'Tech stack', 'Framework, dil ve servis kararlarını netleştirir.', 14, hasList(project.tech_stack)),
    check('architecture', 'Mimari mantık', 'Değişikliklerde sistem sınırlarını korur.', 14, hasText(project.core_architecture, 16)),
    check('database', 'Database şeması', 'Veri modeli olan projelerde migration ve RLS kalitesini artırır.', 10, hasText(project.database_schema, 8), true),
    check('state', 'Mevcut durum', 'AI modelinin eski ve yeni davranışı ayırmasını sağlar.', 10, hasText(project.current_state, 10)),
    check('features', 'Çalışan özellikler', 'Regresyon riskini azaltır.', 10, hasList(project.working_features)),
    check('bugs', 'Bilinen hatalar', 'Fix ve refactor isteklerinde mevcut riskleri görünür kılar.', 8, hasList(project.known_bugs), true),
    check('rules', 'Proje kuralları', 'Kod üretiminde kırmızı çizgileri sabitler.', 8, hasList(project.rules)),
    check('context_doc', 'Bağlam dokümanı', '.md dokümanı kod yapısı ve komutları prompta taşır.', 6, hasText(project.context_doc, 40), true),
  ];

  const score = checks.reduce((sum, item) => sum + item.score, 0);
  const maxScore = checks.reduce((sum, item) => sum + item.maxScore, 0);
  const percent = Math.round((score / maxScore) * 100);
  const status: ProjectHealthStatus = percent >= 80 ? 'good' : percent >= 55 ? 'warning' : 'missing';

  return { score: percent, maxScore: 100, status, checks };
}
