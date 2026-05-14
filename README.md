# PromptForge

Türkçe arayüzlü, yerel çalışan AI prompt builder. Proje hafızası, şablonlar, Handlebars değişkenleri, kalite skoru ve LLM test drawer üzerinden vibe coding promptları üretir.

## Komutlar

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run preview
```

## Veri Modeli

Veriler Zustand persist ile tarayıcı localStorage içinde tutulur:

- `promptforge-projects`: proje hafızası
- `promptforge-templates`: özel şablonlar
- `promptforge-prompts`: üretilen prompt geçmişi
- `promptforge-settings`: LLM ayarları

Yedekleme ekranı projeleri, promptları ve özel şablonları dışa aktarır. API anahtarları yedek dosyasına eklenmez.

## LLM Test Modları

- Direkt API: OpenAI veya Anthropic çağrısı tarayıcıdan yapılır. API anahtarları localStorage içinde base64 ile saklanır; bu şifreleme değildir.
- Proxy Endpoint: Tarayıcı API anahtarı saklamaz. Endpoint `{ provider, model, prompt, stream }` JSON gövdesini kabul etmelidir.

### Proxy Endpoint Örneği

```ts
import express from 'express';

const app = express();
app.use(express.json({ limit: '1mb' }));

app.post('/llm/stream', async (req, res) => {
  const { provider, model, prompt } = req.body;
  if (provider !== 'openai') return res.status(400).json({ error: 'Unsupported provider' });

  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  res.status(upstream.status);
  res.setHeader('content-type', upstream.headers.get('content-type') ?? 'text/event-stream');
  if (!upstream.body) return res.end();
  for await (const chunk of upstream.body) res.write(chunk);
  res.end();
});
```

## Test Kapsamı

İlk test paketi prompt üretiminin kritik çekirdeğini kapsar:

- `compiler`: metadata ekleme ve boş placeholder temizliği
- `variableExtractor`: helper ve proje-backed değişken ayrımı
- `qualityChecker`: Türkçe başlıklar ve gerçek içerik kontrolü
- `backup/schema`: import/export payload doğrulaması
- `templateValidation`: özel şablon sözdizimi kontrolü
- `e2e/builder.spec.ts`: builder wizard smoke testi (`npm run test:e2e`)
