/**
 * Prompt Quality Checker — Üretilen prompt'un kalitesini 0-100 arası puanlar.
 * Sadece anahtar kelime varlığına değil, gerçek içeriğin doldurulup doldurulmadığına bakar.
 */

export interface QualityCheck {
  name: string;
  description: string;
  maxScore: number;
  passed: boolean;
  score: number;
}

export interface QualityResult {
  totalScore: number;
  maxPossible: number;
  checks: QualityCheck[];
  missingItems: string[];
}

/**
 * Bir bölüm başlığı (## X) altındaki içeriğin gerçekten doldurulup doldurulmadığını kontrol eder.
 * "Not specified", "N/A", boş veya placeholder içerikler dolu sayılmaz.
 */
function sectionHasContent(prompt: string, headingPatterns: RegExp[]): boolean {
  for (const pattern of headingPatterns) {
    const match = prompt.match(pattern);
    if (!match) continue;
    const startIdx = match.index! + match[0].length;
    // Next heading veya EOF'a kadar olan kısmı al
    const rest = prompt.slice(startIdx);
    const nextHeadingIdx = rest.search(/\n#{1,6}\s/);
    const body = (nextHeadingIdx === -1 ? rest : rest.slice(0, nextHeadingIdx)).trim();

    if (!body) continue;
    const normalized = body.toLowerCase();
    if (normalized === 'n/a' || normalized === 'not specified' || normalized === '-') continue;
    // En az 3 karakter anlamlı içerik
    if (body.replace(/[`\s\-*]/g, '').length >= 3) return true;
  }
  return false;
}

function inlineFieldHasContent(prompt: string, label: RegExp): boolean {
  const match = prompt.match(label);
  if (!match) return false;
  // match[0] başında \n olabilir; içeriği match'in BİTTİĞİ noktadan satır sonuna kadar al.
  const valueStart = match.index! + match[0].length;
  const nextNl = prompt.indexOf('\n', valueStart);
  const valuePart = prompt.slice(valueStart, nextNl === -1 ? undefined : nextNl).trim();
  if (!valuePart) return false;
  const normalized = valuePart.toLowerCase();
  if (normalized === 'n/a' || normalized === 'not specified' || normalized === '-') return false;
  return valuePart.length >= 2;
}

export function checkPromptQuality(prompt: string): QualityResult {
  const checks: QualityCheck[] = [];
  const missingItems: string[] = [];

  // 1. Rol tanımı (15 pts)
  const hasRole =
    /\b(act as|you are)\s+(an?\s+)?(?:(senior|lead|principal|expert)\s+)?(?:[\w+/#.-]+\s+){0,6}(engineer|developer|architect|debugger|reviewer|designer|auditor|specialist|assistant)\b/i.test(prompt) ||
    /\b(kıdemli|uzman|deneyimli|lider|baş)\s+([\wçğıöşüİı]+\s+){0,3}(geliştirici|mühendis|mimar|debugger|inceleyici|tasarımcı|denetçi|auditor)\b/i.test(prompt) ||
    /\b(gibi|olarak)\s+davran\b/i.test(prompt);
  checks.push({ name: 'Rol Tanımı', description: 'Prompt bir uzman rolü tanımlıyor mu?', maxScore: 15, passed: hasRole, score: hasRole ? 15 : 0 });
  if (!hasRole) missingItems.push('Rol tanımı eksik (Ör: "Act as a senior developer")');

  // 2. Görev tanımı — gerçekten doldurulmuş mu? (20 pts)
  const taskFilled = sectionHasContent(prompt, [
    /##\s*Task\b[^\n]*\n/i,
    /##\s*Review Task\b[^\n]*\n/i,
    /##\s*Feature Request\b[^\n]*\n/i,
    /##\s*Current Problem\b[^\n]*\n/i,
    /##\s*Design Task\b[^\n]*\n/i,
    /##\s*Refactoring Goal\b[^\n]*\n/i,
    /##\s*(Görev|İstek|Talep|Mevcut Problem|Problem|Tasarım Görevi|Refactor Hedefi|İnceleme Görevi|Kod İnceleme)\b[^\n]*\n/i,
  ]);
  checks.push({ name: 'Görev Tanımı', description: 'Ne yapılacağı net olarak yazılmış mı?', maxScore: 20, passed: taskFilled, score: taskFilled ? 20 : 0 });
  if (!taskFilled) missingItems.push('Görev (Task) alanı boş veya doldurulmamış');

  // 3. Tech stack — gerçekten belirtilmiş mi? (15 pts)
  const techStackFilled = inlineFieldHasContent(prompt, /(?:^|\n)(?:tech\s*stack|frontend|teknoloji(?:\s+stack)?|teknolojiler|yığın)\s*:/i) ||
    sectionHasContent(prompt, [/##\s*(Project Stack|Teknoloji Stack|Teknolojiler)\b[^\n]*\n/i]);
  checks.push({ name: 'Teknoloji Stack', description: 'Tech stack gerçekten belirtilmiş mi?', maxScore: 15, passed: techStackFilled, score: techStackFilled ? 15 : 0 });
  if (!techStackFilled) missingItems.push('Teknoloji stack belirtilmemiş (proje seç veya alanı doldur)');

  // 4. Proje bağlamı — proje adı veya açıklaması var mı? (10 pts)
  const projectNameFilled = inlineFieldHasContent(prompt, /(?:^|\n)(?:project\s*name|proje\s*adı)\s*:/i);
  const projectContextFilled = sectionHasContent(prompt, [/##\s*(Project Context|Proje Bağlamı|Proje Bilgisi)\b[^\n]*\n/i]);
  const descFilled = sectionHasContent(prompt, [/##\s*(Project Description|Proje Açıklaması|Açıklama)\b[^\n]*\n/i]);
  const currentStateFilled = sectionHasContent(prompt, [/##\s*(Current State|Mevcut Durum)\b[^\n]*\n/i]);
  const architectureFilled = sectionHasContent(prompt, [/##\s*(Core Architecture|Architecture|Mimari|Mimari Mantık)\b[^\n]*\n/i]);
  const databaseFilled = sectionHasContent(prompt, [/##\s*(Database Schema|Veritabanı Şeması|Veritabanı)\b[^\n]*\n/i]);
  const contextSignals = [projectNameFilled, projectContextFilled, descFilled, currentStateFilled, architectureFilled, databaseFilled]
    .filter(Boolean).length;
  const contextScore = projectContextFilled ? 10 : Math.min(10, contextSignals * 4);
  checks.push({ name: 'Proje Bağlamı', description: 'Proje adı/açıklaması/mevcut durum belirtilmiş mi?', maxScore: 10, passed: contextScore > 0, score: contextScore });
  if (contextScore === 0) missingItems.push('Proje bağlamı eksik (proje seç veya bağlamı doldur)');

  // 5. Kısıtlamalar (10 pts) — başlık varlığı yeterli (her şablonda standart kurallar var)
  const hasConstraints = /##\s*(constraints|critical rules|specific requirements|kısıtlamalar|kritik kurallar|özel gereksinimler|gereksinimler|kurallar)\b/i.test(prompt) ||
    /\b(do not|don'?t)\s+(break|expose|leave|rewrite|remove)/i.test(prompt) ||
    /\b(bozma|değiştirme|silme|dokunma|ifşa etme)\b/i.test(prompt);
  checks.push({ name: 'Kısıtlamalar', description: 'Ne yapılmaması gerektiği belirtilmiş mi?', maxScore: 10, passed: hasConstraints, score: hasConstraints ? 10 : 0 });
  if (!hasConstraints) missingItems.push('Kısıtlamalar / yapılmaması gerekenler eksik');

  // 6. Çıktı formatı (10 pts)
  const hasOutputFormat = /##\s*((required\s+)?output\s+format|çıktı formatı|beklenen çıktı)/i.test(prompt);
  checks.push({ name: 'Çıktı Formatı', description: 'Beklenen çıktı formatı var mı?', maxScore: 10, passed: hasOutputFormat, score: hasOutputFormat ? 10 : 0 });
  if (!hasOutputFormat) missingItems.push('Çıktı formatı belirtilmemiş');

  // 7. Test/doğrulama (5 pts)
  const hasTestSteps = /\b(test|verif|verification|doğrula|kontrol|build|run|çalıştır|derle)\b/i.test(prompt);
  checks.push({ name: 'Test Adımları', description: 'Test veya doğrulama adımları istenmiş mi?', maxScore: 5, passed: hasTestSteps, score: hasTestSteps ? 5 : 0 });
  if (!hasTestSteps) missingItems.push('Test/doğrulama adımları istenmemiş');

  // 8. Dosya bazlı çalışma (5 pts)
  const hasFileBased = /\b(file by file|full path|files? to (create|change|modify)|file\b.*\bpath|dosya dosya|tam yol|dosya yolu|dosyalar|patch)\b/i.test(prompt);
  checks.push({ name: 'Dosya Bazlı', description: 'Dosya bazlı çıktı istenmiş mi?', maxScore: 5, passed: hasFileBased, score: hasFileBased ? 5 : 0 });
  if (!hasFileBased) missingItems.push('Dosya bazlı çalışma belirtilmemiş');

  // 9. Çalışan kodu bozmama (5 pts)
  const hasSafety = /\b(do not break|don'?t break|without breaking|bozma|çalışan sistemi bozma|mevcut sistemi bozma)\b/i.test(prompt);
  checks.push({ name: 'Güvenlik Kuralı', description: 'Çalışan kodu bozmama kuralı var mı?', maxScore: 5, passed: hasSafety, score: hasSafety ? 5 : 0 });
  if (!hasSafety) missingItems.push('Çalışan sistemi bozmama kuralı eksik');

  // 10. Bağlam dokümanı (5 pts) — opsiyonel bonus
  const hasContextDoc = /##\s*(Project Structure\s*&\s*Context Document|Bağlam Dokümanı|Proje Yapısı)/i.test(prompt);
  checks.push({ name: 'Bağlam Dokümanı', description: '.md bağlam dokümanı yüklenmiş mi? (opsiyonel)', maxScore: 5, passed: hasContextDoc, score: hasContextDoc ? 5 : 0 });
  if (!hasContextDoc) missingItems.push('Bağlam dokümanı (.md) yüklenmemiş — opsiyonel');

  const totalScore = checks.reduce((sum, c) => sum + c.score, 0);
  const maxPossible = checks.reduce((sum, c) => sum + c.maxScore, 0);

  return { totalScore, maxPossible, checks, missingItems };
}
