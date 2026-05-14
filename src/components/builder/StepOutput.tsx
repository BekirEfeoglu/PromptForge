import { OUTPUT_FORMATS } from '@/types';
import type { OutputFormat } from '@/types';
import { cn } from '@/lib/utils';

interface StepOutputProps {
  selected: OutputFormat;
  onSelect: (format: OutputFormat) => void;
}

export default function StepOutput({ selected, onSelect }: StepOutputProps) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: '#E5E7EB' }}>
        Çıktı formatını seç
      </h2>
      <p style={{ fontSize: 14, color: '#8B95A7', marginBottom: 24 }}>
        AI'dan nasıl bir çıktı istiyorsun?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {OUTPUT_FORMATS.map((fmt) => (
          <button
            key={fmt.id}
            type="button"
            onClick={() => onSelect(fmt.id)}
            className={cn('choice-row', selected === fmt.id && 'is-selected')}
            aria-pressed={selected === fmt.id}
          >
            <span className="choice-row-radio" aria-hidden="true" />
            <span>{fmt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
