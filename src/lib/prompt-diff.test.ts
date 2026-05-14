import { describe, expect, it } from 'vitest';
import { createPromptDiff } from './prompt-diff';

describe('createPromptDiff', () => {
  it('returns added and removed line counts', () => {
    const diff = createPromptDiff('A\nB\nC', 'A\nB2\nC\nD');

    expect(diff.added).toBe(2);
    expect(diff.removed).toBe(1);
    expect(diff.unchanged).toBe(2);
  });
});
