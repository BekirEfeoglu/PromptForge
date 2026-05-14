import type { LLMProvider } from '@/types';

interface LLMRequestOptions {
  provider: LLMProvider;
  apiKey?: string;
  model: string;
  prompt: string;
  proxyUrl?: string;
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
  signal?: AbortSignal;
}

async function streamOpenAI(options: LLMRequestOptions) {
  const { apiKey, model, prompt, onChunk, onDone, onError, signal } = options;
  if (!apiKey) {
    onError('OpenAI API anahtarı eksik.');
    return;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const err = await response.text();
    onError(`OpenAI API Hatası (${response.status}): ${err}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) { onError('Stream okunamadı.'); return; }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') { onDone(); return; }
      try {
        const json = JSON.parse(data);
        const content = json.choices?.[0]?.delta?.content;
        if (content) onChunk(content);
      } catch { /* skip malformed JSON lines */ }
    }
  }
  onDone();
}

async function streamAnthropic(options: LLMRequestOptions) {
  const { apiKey, model, prompt, onChunk, onDone, onError, signal } = options;
  if (!apiKey) {
    onError('Anthropic API anahtarı eksik.');
    return;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const err = await response.text();
    onError(`Anthropic API Hatası (${response.status}): ${err}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) { onError('Stream okunamadı.'); return; }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      try {
        const json = JSON.parse(trimmed.slice(6));
        if (json.type === 'content_block_delta' && json.delta?.text) {
          onChunk(json.delta.text);
        }
        if (json.type === 'message_stop') { onDone(); return; }
      } catch { /* skip malformed JSON lines */ }
    }
  }
  onDone();
}

function extractProxyChunk(data: unknown): string {
  if (typeof data === 'string') return data;
  if (!data || typeof data !== 'object') return '';
  const record = data as Record<string, unknown>;
  const candidates = [
    record.text,
    record.content,
    record.delta,
    record.chunk,
    (record.delta as Record<string, unknown> | undefined)?.text,
    (record.choices as Array<{ delta?: { content?: string } }> | undefined)?.[0]?.delta?.content,
  ];
  return candidates.find((value): value is string => typeof value === 'string') || '';
}

async function streamProxy(options: LLMRequestOptions) {
  const { provider, model, prompt, proxyUrl, onChunk, onDone, onError, signal } = options;
  if (!proxyUrl) {
    onError('Proxy endpoint eksik.');
    return;
  }

  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, model, prompt, stream: true }),
    signal,
  });

  if (!response.ok) {
    const err = await response.text();
    onError(`Proxy Hatası (${response.status}): ${err}`);
    return;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!response.body) {
    onError('Proxy stream okunamadı.');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    if (!contentType.includes('text/event-stream')) {
      onChunk(chunk);
      continue;
    }

    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') {
        onDone();
        return;
      }
      try {
        const text = extractProxyChunk(JSON.parse(data));
        if (text) onChunk(text);
      } catch {
        if (data) onChunk(data);
      }
    }
  }
  onDone();
}

export async function streamLLM(options: LLMRequestOptions) {
  try {
    if (options.proxyUrl) {
      await streamProxy(options);
      return;
    }
    if (options.provider === 'openai') {
      await streamOpenAI(options);
    } else {
      await streamAnthropic(options);
    }
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') return;
    options.onError(err instanceof Error ? err.message : 'Bilinmeyen hata oluştu.');
  }
}
