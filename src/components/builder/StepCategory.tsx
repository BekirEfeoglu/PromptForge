import { CATEGORIES } from '@/types';
import type { PromptCategory } from '@/types';
import { CategoryIcon } from '@/lib/category-icons';
import { cn } from '@/lib/utils';
import { getCategoryBadgeClass } from '@/lib/utils';

interface StepCategoryProps {
  selected: PromptCategory | null;
  onSelect: (category: PromptCategory) => void;
}

export default function StepCategory({ selected, onSelect }: StepCategoryProps) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: '#E5E7EB' }}>
        Ne tür bir prompt oluşturmak istiyorsun?
      </h2>
      <p style={{ fontSize: 14, color: '#8B95A7', marginBottom: 24 }}>
        Prompt kategorisini seç, sorulacak sorular buna göre değişecek.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selected === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className={cn('choice-card animate-fade-in', isSelected && 'is-selected')}
              aria-pressed={isSelected}
            >
              <div className="choice-card-topline">
                <span className="choice-card-icon" aria-hidden="true">
                  <CategoryIcon category={cat.id} size={24} />
                </span>
              </div>
              <span className={`badge ${getCategoryBadgeClass(cat.color)}`}>{cat.label}</span>
              <span className="choice-card-description">{cat.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
