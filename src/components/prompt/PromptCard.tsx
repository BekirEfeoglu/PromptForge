import { Clock, Pencil, Star, Trash2 } from 'lucide-react';
import type { GeneratedPrompt } from '@/types';
import { CATEGORIES } from '@/types';
import { CategoryIcon } from '@/lib/category-icons';
import { formatDate, truncateText, getCategoryBadgeClass } from '@/lib/utils';
import CopyButton from './CopyButton';

interface PromptCardProps {
  prompt: GeneratedPrompt;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (prompt: GeneratedPrompt) => void;
  onEdit?: (prompt: GeneratedPrompt) => void;
}

export default function PromptCard({ prompt, onToggleFavorite, onDelete, onClick, onEdit }: PromptCardProps) {
  const category = CATEGORIES.find((c) => c.id === prompt.category);

  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        padding: 20,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
      onClick={() => onClick?.(prompt)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#334155';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1E293B';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#E5E7EB', marginBottom: 6 }}>
            {prompt.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {category && (
              <span className={`badge ${getCategoryBadgeClass(category.color)}`}>
                <CategoryIcon category={category.id} size={13} /> {category.label}
              </span>
            )}
            {prompt.quality_score > 0 && (
              <span
                className="badge"
                style={{
                  background: prompt.quality_score >= 80 ? 'rgba(34,197,94,0.15)' : prompt.quality_score >= 60 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                  color: prompt.quality_score >= 80 ? '#22C55E' : prompt.quality_score >= 60 ? '#F59E0B' : '#EF4444',
                }}
              >
                {prompt.quality_score}/100
              </span>
            )}
            <span className="badge badge-purple">v{prompt.version || 1}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {onEdit && (
            <button
              className="btn-ghost"
              style={{ padding: 6 }}
              onClick={(e) => { e.stopPropagation(); onEdit(prompt); }}
              aria-label="Builder'da düzenle"
              title="Builder'da Düzenle"
            >
              <Pencil size={16} style={{ color: '#8B95A7' }} />
            </button>
          )}
          <button
            className="btn-ghost"
            style={{ padding: 6 }}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(prompt.id); }}
            aria-label={prompt.is_favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            title={prompt.is_favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          >
            <Star
              size={16}
              style={{
                color: prompt.is_favorite ? '#F59E0B' : '#8B95A7',
                fill: prompt.is_favorite ? '#F59E0B' : 'none',
              }}
            />
          </button>
          <div onClick={(e) => e.stopPropagation()}>
            <CopyButton text={prompt.final_prompt} label="" variant="ghost" />
          </div>
          <button
            className="btn-ghost"
            style={{ padding: 6 }}
            onClick={(e) => { e.stopPropagation(); onDelete(prompt.id); }}
            aria-label="Sil"
            title="Sil"
          >
            <Trash2 size={16} style={{ color: '#8B95A7' }} />
          </button>
        </div>
      </div>

      {/* Preview */}
      <p style={{ fontSize: 13, color: '#8B95A7', lineHeight: 1.5, marginBottom: 10 }}>
        {truncateText(prompt.final_prompt, 150)}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#7C879A' }}>
        <Clock size={12} />
        {formatDate(prompt.created_at)}
      </div>
    </div>
  );
}
