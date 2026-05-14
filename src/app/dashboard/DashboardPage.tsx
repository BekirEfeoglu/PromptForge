import { useNavigate } from 'react-router-dom';
import { Clock, FolderKanban, Star, TrendingUp, Wand2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { usePromptStore } from '@/stores/usePromptStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useToastStore } from '@/stores/useToastStore';
import { CATEGORIES } from '@/types';
import type { GeneratedPrompt } from '@/types';
import { CategoryIcon } from '@/lib/category-icons';
import PromptCard from '@/components/prompt/PromptCard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { prompts, toggleFavorite, deletePrompt, restorePrompt, getFavorites } = usePromptStore();
  const { projects } = useProjectStore();
  const { addToast } = useToastStore();

  const recentPrompts = prompts.slice(0, 5);
  const favorites = getFavorites().slice(0, 3);
  const totalPrompts = prompts.length;
  const categoryStats = CATEGORIES.map((cat) => ({
    ...cat,
    count: prompts.filter((p) => p.category === cat.id).length,
  }));

  const handleDeletePrompt = (id: string) => {
    const deletedPrompt = prompts.find((prompt) => prompt.id === id);
    deletePrompt(id);
    if (!deletedPrompt) return;
    addToast('Prompt silindi.', 'info', {
      label: 'Geri Al',
      onClick: () => restorePrompt(deletedPrompt),
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div className="page-kicker">Genel durum</div>
          <h1 className="page-title">
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="page-subtitle">
            Projelerini, prompt geçmişini ve hızlı aksiyonları tek çalışma ekranında yönet.
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/builder')}>
          <Wand2 size={18} />
          Yeni Prompt
        </button>
      </div>

      <div className="dashboard-stats">
        {[
          { label: 'Toplam Prompt', value: totalPrompts, icon: TrendingUp, color: '#8B5CF6' },
          { label: 'Projeler', value: projects.length, icon: FolderKanban, color: '#38BDF8' },
          { label: 'Favoriler', value: favorites.length, icon: Star, color: '#F59E0B' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card stat-card">
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: `${stat.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <stat.icon size={20} style={{ color: stat.color }} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#E5E7EB' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#8B95A7' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {totalPrompts > 0 && (
        <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#E5E7EB' }}>
            Kategori Dağılımı
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categoryStats
              .filter((category) => category.count > 0)
              .map((category) => (
                  <div
                    key={category.id}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      background: 'rgba(30, 41, 59, 0.72)',
                      fontSize: 13,
                      color: '#9CA3AF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <CategoryIcon category={category.id} size={14} />
                    <span>{category.label}</span>
                    <span style={{ fontWeight: 800, color: '#E5E7EB' }}>{category.count}</span>
                  </div>
              ))}
          </div>
        </div>
      )}

      <div className="dashboard-columns">
        <PromptListSection
          title="Son Promptlar"
          icon={<Clock size={18} style={{ color: '#8B5CF6' }} />}
          emptyText="Henüz prompt oluşturulmadı."
          prompts={recentPrompts}
          showAll={prompts.length > 5}
          onShowAll={() => navigate('/history')}
          onToggleFavorite={toggleFavorite}
          onDelete={handleDeletePrompt}
        />

        <PromptListSection
          title="Favoriler"
          icon={<Star size={18} style={{ color: '#F59E0B' }} />}
          emptyText="Favori prompt yok. Yıldız ikonuyla ekleyebilirsin."
          prompts={favorites}
          showAll={favorites.length > 3}
          onShowAll={() => navigate('/favorites')}
          onToggleFavorite={toggleFavorite}
          onDelete={handleDeletePrompt}
        />
      </div>
    </div>
  );
}

function PromptListSection({
  title,
  icon,
  emptyText,
  prompts,
  showAll,
  onShowAll,
  onToggleFavorite,
  onDelete,
}: {
  title: string;
  icon: ReactNode;
  emptyText: string;
  prompts: GeneratedPrompt[];
  showAll: boolean;
  onShowAll: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}
          {title}
        </h2>
        {showAll && (
          <button className="btn-ghost" style={{ fontSize: 13 }} onClick={onShowAll}>
            Tümünü gör
          </button>
        )}
      </div>
      {prompts.length === 0 ? (
        <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ color: '#8B95A7', fontSize: 14 }}>{emptyText}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
