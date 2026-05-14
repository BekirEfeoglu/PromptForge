import Handlebars from 'handlebars';
import type { TemplateVariable } from '@/types';
import { extractCustomVariables } from './variableExtractor';

export interface TemplateValidationResult {
  valid: boolean;
  errors: string[];
  variables: string[];
}

const TEMPLATE_ERROR_MESSAGES = [
  { pattern: /Parse error/i, message: 'Handlebars sözdizimi hatalı.' },
  { pattern: /Expecting/i, message: 'Bir blok veya değişken ifadesi eksik kapatılmış olabilir.' },
  { pattern: /doesnt match|doesn't match/i, message: 'Açılan ve kapanan blok adları eşleşmiyor.' },
];

function toUserMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const mapped = TEMPLATE_ERROR_MESSAGES.find(({ pattern }) => pattern.test(raw));
  return mapped?.message ?? raw;
}

export function validateTemplateContent(
  content: string,
  existingVariables: TemplateVariable[] = [],
  hasProject = true
): TemplateValidationResult {
  const errors: string[] = [];

  if (!content.trim()) {
    errors.push('Şablon içeriği zorunludur.');
  }

  try {
    Handlebars.precompile(content);
  } catch (error) {
    errors.push(toUserMessage(error));
  }

  const variables = extractCustomVariables(content, existingVariables, hasProject);

  return {
    valid: errors.length === 0,
    errors,
    variables,
  };
}
