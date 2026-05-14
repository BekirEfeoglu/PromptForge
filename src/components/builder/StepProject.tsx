import type { Project } from '@/types';
import { useProjectStore } from '@/stores/useProjectStore';
import { FolderKanban, Plus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StepProjectProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function StepProject({ selectedId, onSelect }: StepProjectProps) {
  const { projects, addProject } = useProjectStore();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStack, setNewStack] = useState('');

  const handleQuickAdd = () => {
    if (!newName.trim()) return;
    const p = addProject({
      name: newName.trim(),
      description: '',
      tech_stack: newStack.split(',').map((s) => s.trim()).filter(Boolean),
      core_architecture: '',
      database_schema: '',
      current_state: '',
      rules: [],
      known_bugs: [],
      working_features: [],
      context_doc: '',
    });
    onSelect(p.id);
    setShowQuickAdd(false);
    setNewName('');
    setNewStack('');
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: '#E5E7EB' }}>
        Hangi proje için prompt oluşturuyorsun?
      </h2>
      <p style={{ fontSize: 14, color: '#8B95A7', marginBottom: 24 }}>
        Proje seçersen, proje bilgileri otomatik olarak prompt'a eklenir. İsteğe bağlı.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Skip option */}
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn('choice-row', selectedId === null && 'is-selected')}
          aria-pressed={selectedId === null}
        >
          <span className="choice-row-marker" aria-hidden="true" />
          <span style={{ fontSize: 14, color: '#9CA3AF' }}>Proje seçmeden devam et</span>
        </button>

        {/* Projects list */}
        {projects.map((p: Project) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={cn('choice-row', selectedId === p.id && 'is-selected')}
            aria-pressed={selectedId === p.id}
          >
            <FolderKanban size={20} className="choice-row-icon" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#E5E7EB' }}>{p.name}</div>
              {p.tech_stack.length > 0 && (
                <div style={{ fontSize: 12, color: '#8B95A7', marginTop: 2 }}>
                  {p.tech_stack.join(', ')}
                </div>
              )}
            </div>
          </button>
        ))}

        {/* Quick add */}
        {!showQuickAdd ? (
          <button
            type="button"
            onClick={() => setShowQuickAdd(true)}
            className="btn-ghost"
            style={{ justifyContent: 'center', padding: 14, border: '1px dashed #1E293B', borderRadius: 10 }}
          >
            <Plus size={16} /> Yeni Proje Ekle
          </button>
        ) : (
          <div
            style={{
              padding: 16,
              borderRadius: 10,
              border: '1px solid #1E293B',
              background: '#111827',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <input
              className="input-field"
              placeholder="Proje adı"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <input
              className="input-field"
              placeholder="Tech stack (virgülle ayır: React, TypeScript, Supabase)"
              value={newStack}
              onChange={(e) => setNewStack(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn-primary" onClick={handleQuickAdd} style={{ flex: 1 }}>
                Ekle
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowQuickAdd(false)}>
                İptal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
