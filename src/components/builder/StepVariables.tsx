import type { TemplateVariable } from '@/types';

interface StepVariablesProps {
  dynamicVars: TemplateVariable[];
  inputData: Record<string, string>;
  onInputChange: (key: string, value: string) => void;
}

export default function StepVariables({ dynamicVars, inputData, onInputChange }: StepVariablesProps) {
  if (dynamicVars.length === 0) {
    return (
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: '#E5E7EB' }}>
          Özel Değişkenler
        </h2>
        <div
          style={{
            padding: 24,
            borderRadius: 10,
            border: '1px solid #1E293B',
            background: '#111827',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 14, color: '#8B95A7' }}>
            Bu şablonda özel değişken bulunamadı. Bir sonraki adıma geçebilirsin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: '#E5E7EB' }}>
        Özel Değişkenler
      </h2>
      <p style={{ fontSize: 14, color: '#8B95A7', marginBottom: 24 }}>
        Şablonda tespit edilen özel değişkenler için değer girin.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {dynamicVars.map((v) => (
          <div key={v.key}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#E5E7EB',
                marginBottom: 6,
              }}
            >
              {v.label}
              <code style={{ fontSize: 11, color: '#8B5CF6', background: 'rgba(139,92,246,0.1)', padding: '1px 6px', borderRadius: 4 }}>
                {`{{${v.key}}}`}
              </code>
            </label>
            {v.type === 'textarea' ? (
              <textarea
                className="textarea-field"
                placeholder={v.placeholder}
                value={inputData[v.key] || ''}
                onChange={(e) => onInputChange(v.key, e.target.value)}
                rows={3}
              />
            ) : (
              <input
                className="input-field"
                type="text"
                placeholder={v.placeholder}
                value={inputData[v.key] || ''}
                onChange={(e) => onInputChange(v.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
