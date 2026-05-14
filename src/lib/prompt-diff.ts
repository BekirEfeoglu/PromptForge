export type PromptDiffType = 'added' | 'removed' | 'unchanged';

export interface PromptDiffLine {
  type: PromptDiffType;
  text: string;
}

export interface PromptDiffResult {
  lines: PromptDiffLine[];
  added: number;
  removed: number;
  unchanged: number;
}

export function createPromptDiff(before: string, after: string, maxComparableLines = 320): PromptDiffResult {
  const beforeLines = before.split(/\r?\n/).slice(0, maxComparableLines);
  const afterLines = after.split(/\r?\n/).slice(0, maxComparableLines);
  const dp: number[][] = Array.from({ length: beforeLines.length + 1 }, () =>
    Array(afterLines.length + 1).fill(0)
  );

  for (let i = beforeLines.length - 1; i >= 0; i -= 1) {
    for (let j = afterLines.length - 1; j >= 0; j -= 1) {
      const currentRow = dp[i];
      if (!currentRow) continue;
      currentRow[j] = (beforeLines[i] ?? '') === (afterLines[j] ?? '')
        ? (dp[i + 1]?.[j + 1] ?? 0) + 1
        : Math.max(dp[i + 1]?.[j] ?? 0, currentRow[j + 1] ?? 0);
    }
  }

  const lines: PromptDiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < beforeLines.length && j < afterLines.length) {
    if (beforeLines[i] === afterLines[j]) {
      lines.push({ type: 'unchanged', text: beforeLines[i] ?? '' });
      i += 1;
      j += 1;
    } else if ((dp[i + 1]?.[j] ?? 0) >= (dp[i]?.[j + 1] ?? 0)) {
      lines.push({ type: 'removed', text: beforeLines[i] ?? '' });
      i += 1;
    } else {
      lines.push({ type: 'added', text: afterLines[j] ?? '' });
      j += 1;
    }
  }

  while (i < beforeLines.length) {
    lines.push({ type: 'removed', text: beforeLines[i] ?? '' });
    i += 1;
  }

  while (j < afterLines.length) {
    lines.push({ type: 'added', text: afterLines[j] ?? '' });
    j += 1;
  }

  const added = lines.filter((line) => line.type === 'added').length;
  const removed = lines.filter((line) => line.type === 'removed').length;
  const unchanged = lines.filter((line) => line.type === 'unchanged').length;

  return { lines, added, removed, unchanged };
}
