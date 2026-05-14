import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, Trash2, Edit3 } from 'lucide-react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useToastStore } from '@/stores/useToastStore';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, addProject, deleteProject, restoreProject } = useProjectStore();
  const { addToast } = useToastStore();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStack, setNewStack] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    const p = addProject({
      name: newName.trim(),
      description: newDesc.trim(),
      tech_stack: newStack.split(',').map((s) => s.trim()).filter(Boolean),
      core_architecture: '',
      database_schema: '',
      current_state: '',
      rules: [],
      known_bugs: [],
      working_features: [],
      context_doc: '',
    });
    setNewName('');
    setNewDesc('');
    setNewStack('');
    setShowForm(false);
    navigate(`/projects/${p.id}`);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>
            <span className="gradient-text">Projeler</span>
          </h1>
          <p style={{ fontSize: 14, color: '#8B95A7', marginTop: 4 }}>
            Projelerini yönet, her proje için hafıza ve kurallar tanımla.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Yeni Proje
        </button>
      </div>

      {/* Quick Create Form */}
      {showForm && (
        <div className="glass-card animate-fade-in" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#E5E7EB' }}>Yeni Proje Oluştur</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input className="input-field" placeholder="Proje adı *" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
            <input className="input-field" placeholder="Açıklama" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            <input className="input-field" placeholder="Tech stack (virgülle ayır)" value={newStack} onChange={(e) => setNewStack(e.target.value)} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={handleCreate}>Oluştur</button>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>İptal</button>
            </div>
          </div>
        </div>
      )}

      {/* Project Grid */}
      {projects.length === 0 ? (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
          <FolderKanban size={48} style={{ color: '#334155', margin: '0 auto 16px' }} />
          <p style={{ color: '#8B95A7', fontSize: 15, marginBottom: 16 }}>Henüz proje oluşturulmadı.</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> İlk Projeyi Oluştur
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {projects.map((p) => (
            <div
              key={p.id}
              className="glass-card"
              style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s ease' }}
              onClick={() => navigate(`/projects/${p.id}`)}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1E293B'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderKanban size={18} style={{ color: '#8B5CF6' }} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#E5E7EB' }}>{p.name}</h3>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-ghost" style={{ padding: 6 }} onClick={(e) => { e.stopPropagation(); navigate(`/projects/${p.id}`); }}>
                    <Edit3 size={14} />
                  </button>
                  <button
                    className="btn-ghost"
                    style={{ padding: 6 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(p.id);
                      addToast('Proje silindi.', 'info', {
                        label: 'Geri Al',
                        onClick: () => restoreProject(p),
                      });
                    }}
                  >
                    <Trash2 size={14} style={{ color: '#EF4444' }} />
                  </button>
                </div>
              </div>
              {p.description && <p style={{ fontSize: 13, color: '#8B95A7', marginBottom: 10 }}>{p.description}</p>}
              {p.tech_stack.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {p.tech_stack.map((t) => (
                    <span key={t} className="badge badge-blue">{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
