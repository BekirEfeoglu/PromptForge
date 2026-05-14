import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, GitCompareArrows, RotateCcw, Star } from 'lucide-react';
import { usePromptStore } from '@/stores/usePromptStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useToastStore } from '@/stores/useToastStore';
import { CATEGORIES } from '@/types';
import type { PromptCategory } from '@/types';
import PromptCard from '@/components/prompt/PromptCard';
import PromptPreview from '@/components/prompt/PromptPreview';
import { createPromptDiff } from '@/lib/prompt-diff';

interface HistoryPageProps {
  favoritesOnly?: boolean;
}

export default function HistoryPage({ favoritesOnly = false }: HistoryPageProps) {
  const navigate = useNavigate();
  const {
    prompts,
    toggleFavorite,
    deletePrompt,
    restorePrompt,
    getFavorites,
    getPromptThread,
    createVersionFromPrompt,
  } = usePromptStore();
  const { projects } = useProjectStore();
  const { addToast } = useToastStore();
  const [categoryFilter, setCategoryFilter] = useState<PromptCategory | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const baseList = favoritesOnly ? getFavorites() : prompts;

  const filtered = baseList.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (projectFilter !== 'all' && p.project_id !== projectFilter) return false;
    return true;
  });

  const previewPrompt = filtered.find((p) => p.id === selectedPrompt);
  const promptThread = previewPrompt ? getPromptThread(previewPrompt.id) : [];
  const olderVersions = previewPrompt
    ? promptThread.filter((prompt) => (prompt.version || 1) < (previewPrompt.version || 1))
    : [];
  const previousPrompt = olderVersions[olderVersions.length - 1] ?? null;
  const versionDiff = previousPrompt && previewPrompt
    ? createPromptDiff(previousPrompt.final_prompt, previewPrompt.final_prompt)
    : null;

  const handleCreateVersion = () => {
    if (!previewPrompt) return;
    const restored = createVersionFromPrompt(previewPrompt.id, {
      title: `${previewPrompt.title} · geri dönüş`,
      notes: `v${previewPrompt.version || 1} sürümünden oluşturuldu.`,
    });
    if (!restored) return;
    setSelectedPrompt(restored.id);
    addToast(`v${restored.version} olarak yeni sürüm oluşturuldu.`, 'success');
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>
          <span className="gradient-text">{favoritesOnly ? 'Favoriler' : 'Prompt Geçmişi'}</span>
        </h1>
        <p style={{ fontSize: 14, color: '#8B95A7', marginTop: 4 }}>
          {favoritesOnly ? 'Favori olarak işaretlediğin promptlar.' : 'Oluşturduğun tüm promptlar.'}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <label className="sr-only" htmlFor="history-category-filter">
          Kategori filtresi
        </label>
        <select
          id="history-category-filter"
          aria-label="Kategori filtresi"
          className="input-field"
          style={{ width: 'auto', minWidth: 160, cursor: 'pointer' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as PromptCategory | 'all')}
        >
          <option value="all">Tüm Kategoriler</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="history-project-filter">
          Proje filtresi
        </label>
        <select
          id="history-project-filter"
          aria-label="Proje filtresi"
          className="input-field"
          style={{ width: 'auto', minWidth: 160, cursor: 'pointer' }}
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
        >
          <option value="all">Tüm Projeler</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <span style={{ fontSize: 13, color: '#8B95A7', alignSelf: 'center' }}>
          {filtered.length} prompt
        </span>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', marginBottom: 16, opacity: 0.35 }} aria-hidden="true">
            {favoritesOnly ? <Star size={44} /> : <ClipboardList size={44} />}
          </div>
          <p style={{ color: '#8B95A7', fontSize: 15 }}>
            {favoritesOnly ? 'Henüz favori prompt yok.' : 'Henüz prompt oluşturulmadı.'}
          </p>
        </div>
      ) : (
        <div className={`history-layout${selectedPrompt ? ' has-preview' : ''}`}>
          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                onToggleFavorite={toggleFavorite}
                onDelete={(id) => {
                  const deletedPrompt = prompts.find((prompt) => prompt.id === id);
                  deletePrompt(id);
                  if (selectedPrompt === id) setSelectedPrompt(null);
                  if (deletedPrompt) {
                    addToast('Prompt silindi.', 'info', {
                      label: 'Geri Al',
                      onClick: () => restorePrompt(deletedPrompt),
                    });
                  }
                }}
                onClick={(prompt) => setSelectedPrompt(prompt.id === selectedPrompt ? null : prompt.id)}
                onEdit={(prompt) => {
                  usePromptStore.getState().loadPromptIntoBuilder(prompt);
                  usePromptStore.getState().setBuilderStep(2); // Go directly to details step
                  navigate('/builder');
                }}
              />
            ))}
          </div>

          {/* Preview Panel */}
          {selectedPrompt && previewPrompt && (
            <div className="animate-slide-right" style={{ position: 'sticky', top: 32 }}>
              <div className="glass-card" style={{ padding: 16, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8B95A7', fontSize: 12 }}>
                      <GitCompareArrows size={14} /> Sürüm zinciri
                    </div>
                    <h2 style={{ color: '#E5E7EB', fontSize: 15, fontWeight: 800, marginTop: 3 }}>
                      v{previewPrompt.version || 1} seçili
                    </h2>
                  </div>
                  <button className="btn-secondary" onClick={handleCreateVersion}>
                    <RotateCcw size={16} /> Bu Sürümü Geri Yükle
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {promptThread.map((prompt) => (
                    <button
                      key={prompt.id}
                      className={prompt.id === previewPrompt.id ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '6px 12px', minHeight: 36 }}
                      onClick={() => setSelectedPrompt(prompt.id)}
                    >
                      v{prompt.version || 1}
                    </button>
                  ))}
                </div>

                {versionDiff ? (
                  <div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      <span className="badge badge-green">+{versionDiff.added}</span>
                      <span className="badge badge-red">-{versionDiff.removed}</span>
                      <span className="badge badge-purple">{versionDiff.unchanged} aynı</span>
                    </div>
                    <div className="prompt-diff-box" aria-label="Sürüm farkı">
                      {versionDiff.lines.slice(0, 80).map((line, index) => (
                        <div key={`${line.type}-${index}`} className={`prompt-diff-line ${line.type}`}>
                          <span>{line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}</span>
                          <code>{line.text || ' '}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#8B95A7', fontSize: 13 }}>Bu prompt için karşılaştırılacak önceki sürüm yok.</p>
                )}
              </div>
              <PromptPreview prompt={previewPrompt.final_prompt} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
