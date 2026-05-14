import type { PromptEvalScenario, PromptEvalStatus } from '@/types';

export interface EvalScoreResult {
  score: number;
  status: PromptEvalStatus;
  notes: string;
}

function tokenize(value: string): string[] {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

export function scorePromptEvalOutput(scenario: Pick<PromptEvalScenario, 'expected' | 'rubric'>, output: string): EvalScoreResult {
  const expectedTokens = Array.from(new Set(tokenize(scenario.expected)));
  const outputTokens = new Set(tokenize(output));

  if (!output.trim()) {
    return { score: 0, status: 'failed', notes: 'Çıktı boş olduğu için test başarısız.' };
  }

  if (expectedTokens.length === 0) {
    const score = output.trim().length >= 120 ? 70 : 45;
    return {
      score,
      status: score >= 60 ? 'passed' : 'failed',
      notes: 'Beklenen çıktı boş olduğu için skor çıktı uzunluğu üzerinden hesaplandı.',
    };
  }

  const matched = expectedTokens.filter((token) => outputTokens.has(token)).length;
  const overlapScore = Math.round((matched / expectedTokens.length) * 100);
  const rubricBonus = scenario.rubric.trim() && output.trim().length > 240 ? 5 : 0;
  const score = Math.min(100, overlapScore + rubricBonus);

  return {
    score,
    status: score >= 60 ? 'passed' : 'failed',
    notes: `${matched}/${expectedTokens.length} beklenen anahtar ifade çıktı içinde bulundu.`,
  };
}
