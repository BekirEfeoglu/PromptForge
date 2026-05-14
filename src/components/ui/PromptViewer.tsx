import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import CopyButton from '@/components/prompt/CopyButton';

interface PromptViewerProps {
  value: string;
  showCopy?: boolean;
}

const readOnlyTheme = EditorView.theme({
  '&': {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    color: '#E5E7EB',
    fontSize: '13px',
    borderRadius: '12px',
    border: '1px solid #1E293B',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: '1px solid #1E293B',
    color: '#7C879A',
  },
  '.cm-content': {
    fontFamily: "'JetBrains Mono', monospace",
    padding: '8px 0',
  },
  '.cm-line': {
    padding: '0 12px',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
  '.cm-cursor': {
    display: 'none',
  },
});

export default function PromptViewer({ value, showCopy = true }: PromptViewerProps) {
  if (!value) {
    return (
      <div
        style={{
          padding: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          textAlign: 'center',
          background: 'rgba(17, 24, 39, 0.8)',
          border: '1px solid #1E293B',
          borderRadius: 12,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>✨</div>
        <div style={{ fontSize: 16, color: '#8B95A7', fontWeight: 500 }}>
          Prompt önizlemesi burada görünecek
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(51, 65, 85, 0.72)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid #1E293B',
          background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.08), rgba(56, 189, 248, 0.04))',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>Prompt Önizleme</span>
        {showCopy && <CopyButton text={value} label="Kopyala" variant="ghost" />}
      </div>
      <CodeMirror
        value={value}
        extensions={[
          markdown(),
          EditorView.lineWrapping,
          EditorState.readOnly.of(true),
          EditorView.editable.of(false),
        ]}
        theme={readOnlyTheme}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: false,
          bracketMatching: false,
          autocompletion: false,
        }}
        style={{ minHeight: 360, maxHeight: 'min(68vh, 760px)' }}
      />
    </div>
  );
}
