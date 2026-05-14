import Markdown from 'react-markdown';
import CopyButton from './CopyButton';

interface PromptPreviewProps {
  prompt: string;
  showCopy?: boolean;
}

export default function PromptPreview({ prompt, showCopy = true }: PromptPreviewProps) {
  if (!prompt) {
    return (
      <div
        className="glass-card"
        style={{
          padding: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>✨</div>
        <div style={{ fontSize: 16, color: '#8B95A7', fontWeight: 500 }}>
          Prompt önizlemesi burada görünecek
        </div>
        <div style={{ fontSize: 13, color: '#7C879A', marginTop: 6 }}>
          Wizard adımlarını tamamlayarak prompt üretin
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid #1E293B',
          background: 'rgba(139, 92, 246, 0.05)',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>Prompt Önizleme</span>
        {showCopy && <CopyButton text={prompt} label="Kopyala" variant="ghost" />}
      </div>

      {/* Content */}
      <div className="markdown-preview" style={{ padding: 20, maxHeight: 600, overflowY: 'auto' }}>
        <Markdown>{prompt}</Markdown>
      </div>
    </div>
  );
}
