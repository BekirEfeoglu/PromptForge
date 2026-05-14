import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { AlertTriangle, Download, Eye, EyeOff, ShieldCheck, Upload } from 'lucide-react';
import type { LLMProvider } from '@/types';
import { createBackupFromStorage, parseBackupPayload, writeBackupToStorage } from '@/lib/backup/schema';
import type { BackupPayload } from '@/lib/backup/schema';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useToastStore } from '@/stores/useToastStore';

const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

export default function SettingsPage() {
  const { addToast } = useToastStore();
  const {
    llm,
    setProvider,
    setConnectionMode,
    setProxyUrl,
    setApiKey,
    setModel,
    getApiKey,
  } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [pendingImport, setPendingImport] = useState<BackupPayload | null>(null);

  const openaiModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  const anthropicModels = ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'];
  const isProxyMode = llm.api_mode === 'proxy';

  const handleExport = () => {
    const data = createBackupFromStorage(localStorage);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptforge-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Veriler başarıyla dışa aktarıldı.', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      addToast('Sadece .json yedek dosyası yüklenebilir.', 'error');
      return;
    }

    if (file.size > MAX_BACKUP_BYTES) {
      addToast('Yedek dosyası 2 MB sınırını aşıyor.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const payload = parseBackupPayload(JSON.parse(String(event.target?.result || '{}')));
        setPendingImport(payload);
        addToast('Yedek doğrulandı. İçeri aktarmak için onaylayın.', 'success');
      } catch {
        addToast('Yedek dosyası geçersiz veya bozuk.', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    writeBackupToStorage(localStorage, pendingImport);
    addToast('Veriler başarıyla içe aktarıldı. Sayfa yenileniyor...', 'success');
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>
          <span className="gradient-text">Ayarlar</span>
        </h1>
        <p style={{ fontSize: 14, color: '#8B95A7', marginTop: 4 }}>
          Uygulama ayarları, yedekleme ve yapılandırma.
        </p>
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#E5E7EB', marginBottom: 12 }}>Supabase Bağlantısı</h3>
        <div style={noticeStyle('warning')}>
          Supabase henüz yapılandırılmadı. Veriler localStorage'da saklanıyor.
          <br />
          <span style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4, display: 'block' }}>
            <code>.env</code> dosyasına <code>VITE_SUPABASE_URL</code> ve <code>VITE_SUPABASE_ANON_KEY</code> ekleyin.
          </span>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#E5E7EB', marginBottom: 16 }}>LLM API Yapılandırması</h3>
        <p style={{ fontSize: 13, color: '#8B95A7', marginBottom: 16 }}>
          Promptları test etmek için doğrudan tarayıcıdan API çağırabilir veya kendi proxy endpoint'inizi kullanabilirsiniz.
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Bağlantı Modu</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setConnectionMode('direct')}
              aria-pressed={!isProxyMode}
              style={segmentedButtonStyle(!isProxyMode)}
            >
              Direkt API
            </button>
            <button
              type="button"
              onClick={() => setConnectionMode('proxy')}
              aria-pressed={isProxyMode}
              style={segmentedButtonStyle(isProxyMode)}
            >
              Proxy Endpoint
            </button>
          </div>
        </div>

        {isProxyMode ? (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle} htmlFor="proxy-endpoint">Proxy Endpoint</label>
            <input
              id="proxy-endpoint"
              className="input-field"
              type="url"
              placeholder="https://api.example.com/llm/stream"
              value={llm.proxy_url}
              onChange={(e) => setProxyUrl(e.target.value)}
            />
            <div style={{ ...noticeStyle('success'), marginTop: 10 }}>
              <ShieldCheck size={16} style={{ flexShrink: 0 }} />
              API anahtarları tarayıcıdan provider'a gönderilmez. Proxy endpoint'iniz `{`{ provider, model, prompt, stream }`}` JSON gövdesini kabul etmelidir.
            </div>
          </div>
        ) : (
          <div style={{ ...noticeStyle('warning'), marginBottom: 16 }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            Direkt modda API anahtarları tarayıcı localStorage'ında base64 ile saklanır. Bu güvenli şifreleme değildir; hassas kullanımda proxy modunu tercih edin.
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Sağlayıcı</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['openai', 'anthropic'] as LLMProvider[]).map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => setProvider(provider)}
                aria-pressed={llm.provider === provider}
                style={segmentedButtonStyle(llm.provider === provider)}
              >
                {provider === 'openai' ? 'OpenAI' : 'Anthropic'}
              </button>
            ))}
          </div>
        </div>

        {!isProxyMode && (
          <>
            <ApiKeyInput
              id="openai-api-key"
              label="OpenAI API Anahtarı"
              placeholder="sk-..."
              visible={showOpenAIKey}
              value={getApiKey('openai')}
              onToggleVisible={() => setShowOpenAIKey(!showOpenAIKey)}
              onChange={(value) => setApiKey('openai', value)}
            />

            <ApiKeyInput
              id="anthropic-api-key"
              label="Anthropic API Anahtarı"
              placeholder="sk-ant-..."
              visible={showAnthropicKey}
              value={getApiKey('anthropic')}
              onToggleVisible={() => setShowAnthropicKey(!showAnthropicKey)}
              onChange={(value) => setApiKey('anthropic', value)}
            />
          </>
        )}

        <ModelSelect
          id="openai-model"
          label="OpenAI Model"
          value={llm.openai_model}
          options={openaiModels}
          onChange={(value) => setModel('openai', value)}
        />

        <ModelSelect
          id="anthropic-model"
          label="Anthropic Model"
          value={llm.anthropic_model}
          options={anthropicModels}
          onChange={(value) => setModel('anthropic', value)}
        />
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#E5E7EB', marginBottom: 12 }}>Yedekleme (Export/Import)</h3>
        <p style={{ fontSize: 13, color: '#8B95A7', marginBottom: 16 }}>
          Projeleri, özel şablonları ve prompt geçmişini JSON dosyası olarak indirip geri yükleyebilirsiniz. API anahtarları yedeğe eklenmez.
        </p>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={handleExport}>
            <Download size={16} /> Verileri İndir
          </button>
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> Yedeği Yükle
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            style={{ display: 'none' }}
          />
        </div>

        {pendingImport && (
          <div style={{ ...noticeStyle('success'), marginBottom: 24, flexDirection: 'column' }}>
            <div style={{ fontWeight: 700 }}>İçe aktarım önizlemesi</div>
            <div style={{ color: '#9CA3AF' }}>
              {pendingImport.projects.length} proje, {pendingImport.templates.length} özel şablon, {pendingImport.prompts.length} prompt yüklenecek.
              Mevcut yerel veriler bu yedekle değiştirilecek.
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn-primary" onClick={confirmImport}>Onayla ve Yükle</button>
              <button className="btn-secondary" onClick={() => setPendingImport(null)}>İptal</button>
            </div>
          </div>
        )}

        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#E5E7EB', marginBottom: 12, paddingTop: 16, borderTop: '1px solid #1E293B' }}>Sıfırlama</h3>
        <p style={{ fontSize: 13, color: '#8B95A7', marginBottom: 12 }}>
          Tarayıcıdaki tüm verileri kalıcı olarak siler. Bu işlem geri alınamaz.
        </p>
        <button
          className="btn-secondary"
          style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          onClick={() => {
            if (window.confirm('Tüm veriler silinecek. Emin misiniz?')) {
              localStorage.removeItem('promptforge-projects');
              localStorage.removeItem('promptforge-prompts');
              localStorage.removeItem('promptforge-templates');
              window.location.reload();
            }
          }}
        >
          Tüm Verileri Temizle
        </button>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#E5E7EB', marginBottom: 8 }}>Hakkında</h3>
        <p style={{ fontSize: 13, color: '#8B95A7', lineHeight: 1.7 }}>
          <strong style={{ color: '#E5E7EB' }}>PromptForge</strong> — Vibe coding yaparken kısa istekleri
          profesyonel yazılım geliştirme prompt'larına dönüştüren kişisel araç.
        </p>
        <div style={{ marginTop: 12, fontSize: 12, color: '#7C879A' }}>
          v2.0.0 • Handlebars • CodeMirror • LLM Test
        </div>
      </div>
    </div>
  );
}

function ApiKeyInput({
  id,
  label,
  placeholder,
  visible,
  value,
  onToggleVisible,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  visible: boolean;
  value: string;
  onToggleVisible: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle} htmlFor={id}>{label}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          id={id}
          className="input-field"
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          className="btn-ghost"
          onClick={onToggleVisible}
          aria-label={visible ? `${label} gizle` : `${label} göster`}
          style={{ padding: 8 }}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function ModelSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle} htmlFor={id}>{label}</label>
      <select
        id={id}
        className="input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ cursor: 'pointer' }}
      >
        {options.map((model) => <option key={model} value={model}>{model}</option>)}
      </select>
    </div>
  );
}

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#E5E7EB',
  display: 'block',
  marginBottom: 8,
} satisfies CSSProperties;

function segmentedButtonStyle(active: boolean): CSSProperties {
  return {
    flex: 1,
    padding: '10px 16px',
    borderRadius: 8,
    border: active ? '2px solid #8B5CF6' : '1px solid #1E293B',
    background: active ? 'rgba(139, 92, 246, 0.08)' : '#111827',
    color: active ? '#E5E7EB' : '#8B95A7',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    transition: 'all 0.15s ease',
  };
}

function noticeStyle(type: 'warning' | 'success'): CSSProperties {
  const color = type === 'warning' ? '#F59E0B' : '#22C55E';
  const rgb = type === 'warning' ? '245, 158, 11' : '34, 197, 94';
  return {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    background: `rgba(${rgb}, 0.08)`,
    border: `1px solid rgba(${rgb}, 0.2)`,
    fontSize: 13,
    color,
    lineHeight: 1.5,
  };
}
