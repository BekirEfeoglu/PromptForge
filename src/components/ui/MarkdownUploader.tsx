import { useRef, useState } from 'react';
import { FileText, Upload, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';

interface MarkdownUploaderProps {
  value: string;
  onChange: (content: string) => void;
  label?: string;
  description?: string;
  collapsible?: boolean;
}

const MAX_CONTEXT_DOC_BYTES = 2 * 1024 * 1024;

export default function MarkdownUploader({
  value,
  onChange,
  label = 'Proje Yapı Dokümanı (.md)',
  description = 'Projenizin dosya yapısını, mimarisini veya CLAUDE.md benzeri bir doküman yükleyin. İçerik otomatik olarak prompt\'a eklenir.',
  collapsible = false,
}: MarkdownUploaderProps) {
  const { addToast } = useToastStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [collapsed, setCollapsed] = useState(collapsible && !value);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.md') && !fileName.endsWith('.txt') && !fileName.endsWith('.markdown')) {
      addToast('Sadece .md, .txt veya .markdown dosyası yüklenebilir.', 'error');
      return;
    }

    if (file.size > MAX_CONTEXT_DOC_BYTES) {
      addToast('Bağlam dokümanı 2 MB sınırını aşıyor.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onChange(content);
        setFileName(file.name);
        setCollapsed(false);
        addToast('Bağlam dokümanı yüklendi.', 'success');
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClear = () => {
    onChange('');
    setFileName(null);
  };

  const header = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: collapsible ? 'pointer' : 'default',
      }}
      onClick={() => collapsible && setCollapsed(!collapsed)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FileText size={16} style={{ color: '#8B5CF6' }} />
        <label style={{ fontSize: 13, fontWeight: 600, color: '#E5E7EB', cursor: collapsible ? 'pointer' : 'default' }}>
          {label}
        </label>
        {value && (
          <span className="badge badge-green" style={{ fontSize: 11 }}>
            {fileName || 'Yüklendi'}
          </span>
        )}
      </div>
      {collapsible && (
        collapsed ? <ChevronDown size={16} style={{ color: '#8B95A7' }} /> : <ChevronUp size={16} style={{ color: '#8B95A7' }} />
      )}
    </div>
  );

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 10,
        border: value ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid #1E293B',
        background: value ? 'rgba(139, 92, 246, 0.03)' : '#111827',
      }}
    >
      {header}

      {!collapsed && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 12, color: '#8B95A7', marginBottom: 12 }}>{description}</p>

          <div style={{ display: 'flex', gap: 8, marginBottom: value ? 12 : 0 }}>
            <button
              className="btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              style={{ fontSize: 13, padding: '8px 14px' }}
            >
              <Upload size={14} /> .md Dosya Yükle
            </button>
            {value && (
              <button
                className="btn-ghost"
                onClick={handleClear}
                style={{ fontSize: 13, padding: '8px 14px', color: '#EF4444' }}
              >
                <X size={14} /> Temizle
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".md,.txt,.markdown"
              style={{ display: 'none' }}
            />
          </div>

          {value && (
            <div
              style={{
                background: '#0B1120',
                border: '1px solid #1E293B',
                borderRadius: 8,
                padding: 12,
                maxHeight: 200,
                overflowY: 'auto',
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#9CA3AF',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {value.length > 2000 ? value.slice(0, 2000) + '\n\n... (toplam ' + value.length + ' karakter)' : value}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
