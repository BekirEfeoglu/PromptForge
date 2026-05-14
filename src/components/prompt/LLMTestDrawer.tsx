import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Send, Loader2, StopCircle } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { streamLLM } from '@/lib/llm/client';
import Markdown from 'react-markdown';

interface LLMTestDrawerProps {
  prompt: string;
  open: boolean;
  onClose: () => void;
}

export default function LLMTestDrawer({ prompt, open, onClose }: LLMTestDrawerProps) {
  const { llm, getApiKey, isConfigured } = useSettingsStore();
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [response]);

  const handleTest = useCallback(async () => {
    const isProxyMode = llm.api_mode === 'proxy';
    const apiKey = isProxyMode ? undefined : getApiKey(llm.provider);
    const proxyUrl = isProxyMode ? llm.proxy_url.trim() : undefined;
    if (!isProxyMode && !apiKey) {
      setError('API anahtarı ayarlanmamış. Ayarlar sayfasından ekleyin.');
      return;
    }
    if (isProxyMode && !proxyUrl) {
      setError('Proxy endpoint ayarlanmamış. Ayarlar sayfasından ekleyin.');
      return;
    }

    setResponse('');
    setError('');
    setLoading(true);
    abortRef.current = new AbortController();

    const model = llm.provider === 'openai' ? llm.openai_model : llm.anthropic_model;

    await streamLLM({
      provider: llm.provider,
      apiKey,
      model,
      prompt,
      proxyUrl,
      onChunk: (text) => setResponse((prev) => prev + text),
      onDone: () => setLoading(false),
      onError: (err) => { setError(err); setLoading(false); },
      signal: abortRef.current.signal,
    });
  }, [prompt, llm, getApiKey]);

  const handleStop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const handleClose = () => {
    handleStop();
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 998,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '50%',
          minWidth: 400,
          maxWidth: 700,
          height: '100vh',
          background: '#0B1120',
          borderLeft: '1px solid #1E293B',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #1E293B',
            flexShrink: 0,
          }}
        >
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#E5E7EB' }}>LLM Test</h3>
            <span style={{ fontSize: 12, color: '#8B95A7' }}>
              {llm.api_mode === 'proxy' ? 'Proxy' : llm.provider === 'openai' ? 'OpenAI' : 'Anthropic'} • {llm.provider === 'openai' ? llm.openai_model : llm.anthropic_model}
            </span>
          </div>
          <button className="btn-ghost" onClick={handleClose} style={{ padding: 6 }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef} style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {!isConfigured() && !error && !response && (
            <div
              style={{
                padding: 16,
                borderRadius: 8,
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                fontSize: 13,
                color: '#F59E0B',
              }}
            >
              {llm.api_mode === 'proxy' ? 'Proxy endpoint yapılandırılmamış.' : 'API anahtarı yapılandırılmamış.'} <strong>Ayarlar</strong> sayfasından ekleyin.
            </div>
          )}

          {error && (
            <div
              style={{
                padding: 16,
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                fontSize: 13,
                color: '#EF4444',
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {response && (
            <div className="markdown-preview" style={{ fontSize: 14, lineHeight: 1.7 }}>
              <Markdown>{response}</Markdown>
            </div>
          )}

          {loading && !response && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9CA3AF', fontSize: 14 }}>
              <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              Yanıt bekleniyor...
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #1E293B',
            display: 'flex',
            gap: 8,
            flexShrink: 0,
          }}
        >
          {loading ? (
            <button className="btn-secondary" onClick={handleStop} style={{ flex: 1 }}>
              <StopCircle size={16} /> Durdur
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handleTest}
              disabled={!isConfigured()}
              style={{ flex: 1, opacity: isConfigured() ? 1 : 0.5 }}
            >
              <Send size={16} /> {response ? 'Tekrar Gönder' : 'Promptu Test Et'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
