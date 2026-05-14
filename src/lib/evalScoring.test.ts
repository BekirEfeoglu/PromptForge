import { describe, expect, it } from 'vitest';
import { scorePromptEvalOutput } from './evalScoring';

describe('scorePromptEvalOutput', () => {
  it('passes outputs that cover expected keywords', () => {
    const result = scorePromptEvalOutput(
      { expected: 'responsive erişilebilirlik test build', rubric: 'Ana beklentileri karşılamalı' },
      'Responsive arayüz güncellendi, erişilebilirlik kontrolleri yapıldı, test ve build çalıştırıldı.'
    );

    expect(result.status).toBe('passed');
    expect(result.score).toBeGreaterThanOrEqual(60);
  });

  it('fails empty output', () => {
    const result = scorePromptEvalOutput({ expected: 'test', rubric: '' }, '');

    expect(result.status).toBe('failed');
    expect(result.score).toBe(0);
  });
});
