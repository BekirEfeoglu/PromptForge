import type { PromptCategory, TemplateVariable } from '@/types';
import MarkdownUploader from '@/components/ui/MarkdownUploader';
import SkillSelector from '@/components/builder/SkillSelector';

interface StepDetailsProps {
  variables: TemplateVariable[];
  inputData: Record<string, string>;
  onInputChange: (key: string, value: string) => void;
  contextDoc?: string;
  onContextDocChange?: (doc: string) => void;
  category?: PromptCategory | null;
  selectedSkillIds?: string[];
  onSkillChange?: (skillIds: string[]) => void;
}

export default function StepDetails({
  variables,
  inputData,
  onInputChange,
  contextDoc,
  onContextDocChange,
  category = null,
  selectedSkillIds = [],
  onSkillChange,
}: StepDetailsProps) {
  const variablesWithExamples = variables.filter((variable) => variable.examples?.length);

  const fillEmptyFieldsWithExamples = () => {
    for (const variable of variablesWithExamples) {
      if (!inputData[variable.key]?.trim()) {
        onInputChange(variable.key, variable.examples?.[0] ?? '');
      }
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: '#E5E7EB' }}>
        Detayları doldur
      </h2>
      <p style={{ fontSize: 14, color: '#8B95A7', marginBottom: 24 }}>
        Bu bilgiler prompt şablonuna yerleştirilecek. Gerekli alanları doldurun.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {variablesWithExamples.length > 0 && (
          <div className="detail-example-panel">
            <div>
              <strong>Hazır örnekler</strong>
              <p>Boş alanları tek tıkla doldurabilir veya her alanın altındaki örnekleri ayrı ayrı seçebilirsin.</p>
            </div>
            <button type="button" className="btn-secondary btn-info" onClick={fillEmptyFieldsWithExamples}>
              Boş Alanları Örnekle Doldur
            </button>
          </div>
        )}

        {variables.map((v) => (
          <div key={v.key}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#E5E7EB',
                marginBottom: 6,
              }}
            >
              {v.label}
              {v.required && <span style={{ color: '#EF4444', marginLeft: 4 }}>*</span>}
            </label>
            {v.type === 'textarea' || v.type === 'multiline' ? (
              <textarea
                className="textarea-field"
                placeholder={v.placeholder}
                value={inputData[v.key] || ''}
                onChange={(e) => onInputChange(v.key, e.target.value)}
                rows={4}
              />
            ) : v.type === 'select' && v.options ? (
              <select
                className="input-field"
                value={inputData[v.key] || ''}
                onChange={(e) => onInputChange(v.key, e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="">Seçin...</option>
                {v.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                className="input-field"
                type="text"
                placeholder={v.placeholder}
                value={inputData[v.key] || ''}
                onChange={(e) => onInputChange(v.key, e.target.value)}
              />
            )}
            {v.examples && v.examples.length > 0 && (
              <div className="field-example-row" aria-label={`${v.label} örnekleri`}>
                {v.examples.map((example, index) => (
                  <button
                    key={`${v.key}-example-${index}`}
                    type="button"
                    onClick={() => onInputChange(v.key, example)}
                    title={example}
                  >
                    Örnek {index + 1}: {example.length > 72 ? `${example.slice(0, 72)}...` : example}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {onSkillChange && (
          <SkillSelector
            category={category}
            selectedSkillIds={selectedSkillIds}
            onChange={onSkillChange}
          />
        )}

        {onContextDocChange && (
          <MarkdownUploader
            value={contextDoc || ''}
            onChange={onContextDocChange}
            label="Ek Bağlam Dokümanı (.md)"
            description="Bu prompt için ek bağlam sağlayacak bir .md dosyası yükleyin. Proje dokümanını geçersiz kılar veya tamamlar."
            collapsible
          />
        )}
      </div>
    </div>
  );
}
