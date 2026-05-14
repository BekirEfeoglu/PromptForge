# PromptForge

Modern, Türkçe arayüzlü ve local-first çalışan AI prompt builder.

PromptForge; vibe coding süreçleri için proje hafızası, hazır şablon paketleri, skill seçimi, kalite skoru, prompt versiyonlama, A/B karşılaştırma ve test setleri sunar. Amaç, AI kodlama ajanlarına daha tutarlı, bağlamlı ve doğrulanabilir promptlar üretmektir.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/State-Zustand-8B5CF6)

## Öne Çıkanlar

- **Project Memory:** Proje adı, açıklama, tech stack, mimari, veritabanı şeması, kurallar, bilinen hatalar ve çalışan özellikler promptlara otomatik eklenir.
- **Markdown içe aktarma:** `README.md`, `CLAUDE.md`, `AGENTS.md` gibi dosyalardan proje hafızası alanları otomatik doldurulur.
- **Şablon Kütüphanesi:** Sistem şablonları, özel şablonlar, arama/filtreleme ve hazır prompt paketleri.
- **Hazır örnekler:** Şablon alanları tek tıkla örnek verilerle doldurulabilir.
- **Skill kullanımı:** Prompt üretirken test, güvenlik, UI/UX, refactor, devops ve benzeri çalışma stilleri seçilebilir.
- **Kalite skoru:** Üretilen prompt gerçek içerik üzerinden 0-100 arası puanlanır.
- **Prompt versiyonlama:** Kaydedilen promptlar sürüm zinciriyle izlenir, eski sürümden yeni sürüm oluşturulabilir.
- **A/B karşılaştırma:** Aynı görev iki şablonla üretilir, kalite skorları yan yana kıyaslanır.
- **Prompt test setleri:** Senaryo, beklenen çıktı ve manuel test sonuçlarıyla prompt kalitesi takip edilir.
- **LLM test drawer:** OpenAI veya Anthropic ile promptu doğrudan test etme akışı.
- **Local-first veri modeli:** Tüm veriler varsayılan olarak tarayıcı `localStorage` içinde tutulur.
- **Opsiyonel Supabase:** Env değişkenleri varsa Supabase client hazırdır; yoksa uygulama local çalışmaya devam eder.

## Ekranlar

- **Dashboard:** Özet metrikler ve hızlı erişim.
- **Projeler:** Project Memory oluşturma ve `.md` dokümanından alan doldurma.
- **Prompt Builder:** 6 adımlı prompt üretim akışı.
- **Şablonlar:** Sistem/özel şablonlar, hazır paketler, Handlebars editörü.
- **Geçmiş:** Prompt kayıtları, favoriler, versiyon farkları.
- **A/B Karşılaştırma:** İki şablonun aynı görevde kıyaslanması.
- **Test Setleri:** Prompt eval senaryoları ve manuel skor kayıtları.
- **Ayarlar:** LLM provider, model, API/proxy modu ve yedekleme.

## Teknoloji

| Katman | Kullanılanlar |
| --- | --- |
| Frontend | React 19, Vite 8, TypeScript 6 |
| Stil | Tailwind CSS 4, custom CSS utility layer |
| State | Zustand persist middleware |
| Prompt engine | Handlebars, custom helpers, cleanup pipeline |
| Editor | CodeMirror via `@uiw/react-codemirror` |
| LLM | OpenAI / Anthropic REST streaming, opsiyonel proxy |
| Test | Vitest, Playwright, ESLint |
| Backend | Supabase client opsiyonel |

## Kurulum

```bash
git clone https://github.com/BekirEfeoglu/PromptForge.git
cd PromptForge
npm install
npm run dev
```

Varsayılan geliştirme adresi:

```txt
http://localhost:5173
```

## Komutlar

```bash
npm run dev       # Vite geliştirme sunucusu
npm run build     # TypeScript build + Vite production build
npm run lint      # ESLint kontrolü
npm run test      # Vitest unit/contract testleri
npm run test:e2e  # Playwright desktop + mobile e2e testleri
npm run preview   # Production build preview
```

## Ortam Değişkenleri

Supabase entegrasyonu opsiyoneldir. Bu değerler yoksa uygulama local-first çalışır.

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

LLM API anahtarları uygulama içindeki Ayarlar ekranından girilir. Direkt API modu tarayıcıdan OpenAI/Anthropic çağrısı yapar. Daha güvenli kullanım için proxy modu önerilir.

## LLM Proxy Modu

Proxy modu, tarayıcıda gizli API anahtarı saklamadan LLM çağrısı yapmayı sağlar. Endpoint şu JSON gövdesini kabul etmelidir:

```json
{
  "provider": "openai",
  "model": "gpt-5",
  "prompt": "..."
}
```

Basit Express örneği:

```ts
import express from 'express';

const app = express();
app.use(express.json({ limit: '1mb' }));

app.post('/llm/stream', async (req, res) => {
  const { provider, model, prompt } = req.body;
  if (provider !== 'openai') {
    return res.status(400).json({ error: 'Unsupported provider' });
  }

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

## Veri Modeli

Uygulama varsayılan olarak localStorage üzerinde çalışır:

| Key | İçerik |
| --- | --- |
| `promptforge-projects` | Project Memory kayıtları |
| `promptforge-templates` | Kullanıcıya ait özel şablonlar |
| `promptforge-prompts` | Prompt geçmişi, versiyonlar, eval senaryoları |
| `promptforge-settings` | LLM provider/model ayarları ve obfuscate edilmiş API key değerleri |

Yedekleme ekranı proje, prompt, eval ve özel şablon verilerini dışa aktarır. API anahtarları yedek dosyasına eklenmez.

## Prompt Engine

Prompt üretimi `src/lib/prompt-engine/` altında üç ana parçadan oluşur:

- `compiler.ts`: Handlebars derleme, proje metadata ekleri, skill instruction ekleri ve boş bölüm temizliği.
- `qualityChecker.ts`: Başlık varlığına değil, gerçek dolu içeriğe göre kalite skoru üretir.
- `variableExtractor.ts`: Şablondaki dinamik değişkenleri bulur; proje seçiliyse proje-backed alanları kullanıcıya tekrar sormaz.

Compiler, eksik alanlar için `"N/A"` üretmez. Boş değerler temizlenir ve çevresindeki gereksiz markdown bölümleri kaldırılır.

## Şablon Sistemi

Şablonlar Handlebars sözdizimi kullanır:

```md
## Task
{{task_description}}

{{#if typescript}}
Use strict-safe TypeScript.
{{/if}}
```

Desteklenen yardımcılar:

- `eq`
- `contains`
- `join`

Hazır paketler `src/data/templatePacks.ts` içinde tutulur. Sistem şablonları `src/data/defaultTemplates.ts` içindedir.

## Test Kapsamı

Mevcut testler şunları kapsar:

- Prompt compiler metadata ekleme ve cleanup davranışı
- Dynamic variable extraction
- Prompt quality checker
- Template syntax validation
- Backup import/export schema
- Project Memory markdown extraction
- Prompt diff, eval scoring ve project health helpers
- Template pack Handlebars geçerliliği
- Playwright ile builder, project memory, şablon, history, favori, A/B ve eval smoke akışları

Çalıştırmak için:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

## Güvenlik Notları

- Ayarlar ekranında girilen API anahtarları localStorage içinde base64 ile saklanır. Bu **şifreleme değildir**.
- Production kullanımda LLM için proxy endpoint tercih edilmelidir.
- Supabase `service_role_key` hiçbir şekilde client tarafında kullanılmamalıdır.
- `.env` ve `.env.*` dosyaları `.gitignore` ile dışarıda bırakılmıştır.

## Proje Yapısı

```txt
src/
  app/                 Route bazlı sayfalar
  components/          Layout, builder, prompt ve ui bileşenleri
  data/                Sistem şablonları, hazır paketler, default kurallar
  lib/
    backup/            Import/export schema
    llm/               OpenAI/Anthropic streaming client
    project-memory/    Markdown alan çıkarımı
    prompt-engine/     Compiler, quality checker, variable extractor
  stores/              Zustand persist store'ları
  types/               Domain tipleri ve enum benzeri sabitler
```

## Yol Haritası

- Paylaşılabilir şablon paketi import/export
- Prompt kalite skorunda kategori bazlı ağırlıklar
- LLM destekli otomatik eval koşuları
- Supabase ile çok cihazlı senkronizasyon
- Şablon versiyon geçmişi

## Lisans

Bu repo için henüz lisans dosyası eklenmedi. Public kullanım veya katkı kabulü planlanıyorsa bir lisans seçilmelidir.
