import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';

interface TemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#0B1120',
    color: '#E5E7EB',
    fontSize: '13px',
    borderRadius: '8px',
    border: '1px solid #1E293B',
  },
  '&.cm-focused': {
    outline: 'none',
    borderColor: '#8B5CF6',
    boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.15)',
  },
  '.cm-gutters': {
    backgroundColor: '#0B1120',
    borderRight: '1px solid #1E293B',
    color: '#7C879A',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  '.cm-cursor': {
    borderLeftColor: '#8B5CF6',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(139, 92, 246, 0.2) !important',
  },
  '.cm-content': {
    fontFamily: "'JetBrains Mono', monospace",
    padding: '8px 0',
  },
  '.cm-line': {
    padding: '0 8px',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
  '.cm-placeholder': {
    color: '#8B95A7',
  },
});

export default function TemplateEditor({ value, onChange, placeholder, minHeight = '200px' }: TemplateEditorProps) {
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      extensions={[
        markdown(),
        EditorView.lineWrapping,
      ]}
      theme={darkTheme}
      style={{ minHeight }}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: true,
        bracketMatching: true,
        autocompletion: false,
      }}
    />
  );
}
