import { useTemplateStore } from '@/stores/useTemplateStore';
import { CATEGORIES } from '@/types';
import type { PromptCategory } from '@/types';
import { CategoryIcon } from '@/lib/category-icons';
import { getCategoryBadgeClass } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface StepTemplateProps {
  selectedId: string | null;
  onSelect: (templateId: string, category: PromptCategory) => void;
}

export default function StepTemplate({ selectedId, onSelect }: StepTemplateProps) {
  const { getAllTemplates } = useTemplateStore();
  const allTemplates = getAllTemplates();

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: '#E5E7EB' }}>
        Hangi şablonu kullanmak istiyorsun?
      </h2>
      <p style={{ fontSize: 14, color: '#8B95A7', marginBottom: 24 }}>
        Kendi özel şablonlarını veya sistem şablonlarını seçebilirsin.
      </p>

      <div className="template-grid">
        {allTemplates.map((t) => {
          const isSelected = selectedId === t.id;
          const cat = CATEGORIES.find(c => c.id === t.category);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id, t.category)}
              className={cn('choice-card animate-fade-in', isSelected && 'is-selected')}
              aria-pressed={isSelected}
            >
              <div className="choice-card-topline">
                <span className="choice-card-icon" aria-hidden="true">
                  <CategoryIcon category={t.category} size={24} />
                </span>
                {!t.is_system && <span className="choice-card-kicker">CUSTOM</span>}
              </div>
              <span className="choice-card-title">{t.title}</span>
              <span className="choice-card-description">{t.description}</span>
              {cat && <span className={`badge ${getCategoryBadgeClass(cat.color)}`} style={{ fontSize: 11, padding: '2px 6px' }}>{cat.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
