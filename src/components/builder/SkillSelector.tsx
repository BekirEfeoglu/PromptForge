import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Search, Sparkles, X } from 'lucide-react';
import {
  defaultSkills,
  isSkillRecommendedForCategory,
  SKILL_CATEGORY_LABELS,
  SKILL_CATEGORY_ORDER,
} from '@/data/defaultSkills';
import type { PromptCategory, PromptSkill, SkillCategory } from '@/types';

interface SkillSelectorProps {
  category: PromptCategory | null;
  selectedSkillIds: string[];
  onChange: (skillIds: string[]) => void;
}

type SkillFilter = 'recommended' | 'selected' | 'all' | `category:${SkillCategory}`;

function getSearchText(skill: PromptSkill): string {
  return [
    skill.id,
    skill.name,
    skill.description,
    skill.useWhen,
    skill.category,
    SKILL_CATEGORY_LABELS[skill.category],
    ...(skill.tags ?? []),
  ]
    .join(' ')
    .toLocaleLowerCase('tr-TR');
}

export default function SkillSelector({ category, selectedSkillIds, onChange }: SkillSelectorProps) {
  const [activeFilter, setActiveFilter] = useState<SkillFilter>('recommended');
  const [query, setQuery] = useState('');
  const selectedIds = useMemo(() => new Set(selectedSkillIds), [selectedSkillIds]);
  const selectedSkills = useMemo(
    () => defaultSkills.filter((skill) => selectedIds.has(skill.id)),
    [selectedIds]
  );

  const categoryCounts = useMemo(() => {
    return defaultSkills.reduce<Record<SkillCategory, number>>((acc, skill) => {
      acc[skill.category] = (acc[skill.category] ?? 0) + 1;
      return acc;
    }, {} as Record<SkillCategory, number>);
  }, []);

  const recommendedCount = useMemo(
    () => defaultSkills.filter((skill) => isSkillRecommendedForCategory(skill, category)).length,
    [category]
  );

  const visibleSkills = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR');

    return [...defaultSkills]
      .sort((a, b) => {
        const aRecommended = isSkillRecommendedForCategory(a, category);
        const bRecommended = isSkillRecommendedForCategory(b, category);
        if (aRecommended !== bRecommended) return aRecommended ? -1 : 1;
        return a.name.localeCompare(b.name, 'tr');
      })
      .filter((skill) => {
        const matchesFilter =
          activeFilter === 'all' ||
          (activeFilter === 'recommended' && isSkillRecommendedForCategory(skill, category)) ||
          (activeFilter === 'selected' && selectedIds.has(skill.id)) ||
          (activeFilter.startsWith('category:') && skill.category === activeFilter.replace('category:', ''));

        if (!matchesFilter) return false;
        if (!normalizedQuery) return true;
        return getSearchText(skill).includes(normalizedQuery);
      });
  }, [activeFilter, category, query, selectedIds]);

  const toggleSkill = (skillId: string) => {
    if (selectedIds.has(skillId)) {
      onChange(selectedSkillIds.filter((id) => id !== skillId));
      return;
    }
    onChange([...selectedSkillIds, skillId]);
  };

  const clearSearch = () => setQuery('');

  return (
    <section className="skill-selector" aria-labelledby="skill-selector-title">
      <div className="skill-selector-header">
        <div>
          <h3 id="skill-selector-title">Skill kullanımı</h3>
          <p>
            Prompt üretirken AI ajanına kullanmasını istediğin çalışma stillerini seç.
            {selectedSkillIds.length > 0 && ` ${selectedSkillIds.length} skill seçildi.`}
          </p>
        </div>
        {selectedSkillIds.length > 0 && (
          <button type="button" className="btn-ghost skill-clear-button" onClick={() => onChange([])}>
            Temizle
          </button>
        )}
      </div>

      <div className="skill-tools">
        <label className="skill-search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Skill ara</span>
          <input
            data-testid="skill-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Skill ara: test, güvenlik, React, Docker..."
          />
          {query && (
            <button type="button" onClick={clearSearch} aria-label="Aramayı temizle">
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </label>

        <div className="skill-filter-row" aria-label="Skill filtreleri">
          <button
            type="button"
            data-testid="skill-filter-recommended"
            className="skill-filter-button"
            aria-pressed={activeFilter === 'recommended'}
            onClick={() => setActiveFilter('recommended')}
          >
            Önerilen <span>{recommendedCount}</span>
          </button>
          <button
            type="button"
            data-testid="skill-filter-selected"
            className="skill-filter-button"
            aria-pressed={activeFilter === 'selected'}
            onClick={() => setActiveFilter('selected')}
          >
            Seçilen <span>{selectedSkillIds.length}</span>
          </button>
          <button
            type="button"
            data-testid="skill-filter-all"
            className="skill-filter-button"
            aria-pressed={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          >
            Tümü <span>{defaultSkills.length}</span>
          </button>
          {SKILL_CATEGORY_ORDER.filter((skillCategory) => categoryCounts[skillCategory] > 0).map((skillCategory) => (
            <button
              key={skillCategory}
              type="button"
              data-testid={`skill-filter-${skillCategory}`}
              className="skill-filter-button"
              aria-pressed={activeFilter === `category:${skillCategory}`}
              onClick={() => setActiveFilter(`category:${skillCategory}`)}
            >
              {SKILL_CATEGORY_LABELS[skillCategory]} <span>{categoryCounts[skillCategory]}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedSkills.length > 0 && (
        <div className="selected-skill-strip" aria-label="Seçilen skill listesi">
          {selectedSkills.map((skill) => (
            <button
              key={skill.id}
              type="button"
              onClick={() => toggleSkill(skill.id)}
              className="selected-skill-chip"
              aria-label={`${skill.name} seçimini kaldır`}
            >
              {skill.name}
              <X size={12} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      <div className="skill-result-summary">
        {visibleSkills.length} skill gösteriliyor
        {query && `, arama: "${query}"`}
      </div>

      {visibleSkills.length > 0 ? (
        <div className="skill-grid">
          {visibleSkills.map((skill) => {
            const isSelected = selectedIds.has(skill.id);
            const isRecommended = isSkillRecommendedForCategory(skill, category);
            const Icon = isSelected ? CheckCircle2 : Circle;

            return (
              <button
                key={skill.id}
                type="button"
                data-testid={`skill-${skill.id}`}
                aria-pressed={isSelected}
                className="skill-card"
                onClick={() => toggleSkill(skill.id)}
                style={{
                  borderColor: isSelected ? 'rgba(139, 92, 246, 0.9)' : 'rgba(51, 65, 85, 0.78)',
                  background: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'rgba(15, 23, 42, 0.72)',
                  boxShadow: isSelected ? '0 14px 32px rgba(139, 92, 246, 0.13)' : 'none',
                }}
              >
                <span className="skill-card-topline">
                  <span className="skill-card-title">
                    <Icon size={17} aria-hidden="true" />
                    {skill.name}
                  </span>
                  {isRecommended && (
                    <span className="skill-recommended">
                      <Sparkles size={12} aria-hidden="true" />
                      Önerilen
                    </span>
                  )}
                </span>
                <span className="skill-category-pill">{SKILL_CATEGORY_LABELS[skill.category]}</span>
                <span className="skill-card-description">{skill.description}</span>
                <span className="skill-card-when">Ne zaman: {skill.useWhen}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="skill-empty-state">
          Bu filtre ve aramayla eşleşen skill yok.
        </div>
      )}
    </section>
  );
}
