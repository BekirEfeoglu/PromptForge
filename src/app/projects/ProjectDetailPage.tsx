import { useParams, useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, ArrowLeft, CheckCircle2, Save, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useToastStore } from '@/stores/useToastStore';
import type { Project } from '@/types';
import MarkdownUploader from '@/components/ui/MarkdownUploader';
import { extractProjectMemoryFromMarkdown } from '@/lib/project-memory/markdownExtractor';
import { computeProjectHealth } from '@/lib/project-health';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject } = useProjectStore();
  const project = getProject(id || '');

  if (!project) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <p style={{ color: '#8B95A7', fontSize: 16 }}>Proje bulunamadı.</p>
        <button className="btn-primary" onClick={() => navigate('/projects')} style={{ marginTop: 16 }}>
          Projelere Dön
        </button>
      </div>
    );
  }

  return <ProjectDetailForm key={project.id} project={project} />;
}

function ProjectDetailForm({ project }: { project: Project }) {
  const navigate = useNavigate();
  const { updateProject } = useProjectStore();
  const { addToast } = useToastStore();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [techStack, setTechStack] = useState(project.tech_stack.join(', '));
  const [coreArchitecture, setCoreArchitecture] = useState(project.core_architecture || '');
  const [databaseSchema, setDatabaseSchema] = useState(project.database_schema || '');
  const [currentState, setCurrentState] = useState(project.current_state);
  const [rules, setRules] = useState(project.rules.join('\n'));
  const [knownBugs, setKnownBugs] = useState(project.known_bugs.join('\n'));
  const [workingFeatures, setWorkingFeatures] = useState(project.working_features.join('\n'));
  const [contextDoc, setContextDoc] = useState(project.context_doc || '');
  const [saved, setSaved] = useState(false);
  const draftProject: Project = {
    ...project,
    name,
    description,
    tech_stack: techStack.split(',').map((s) => s.trim()).filter(Boolean),
    core_architecture: coreArchitecture,
    database_schema: databaseSchema,
    current_state: currentState,
    rules: rules.split('\n').map((s) => s.trim()).filter(Boolean),
    known_bugs: knownBugs.split('\n').map((s) => s.trim()).filter(Boolean),
    working_features: workingFeatures.split('\n').map((s) => s.trim()).filter(Boolean),
    context_doc: contextDoc,
  };
  const health = computeProjectHealth(draftProject);

  const handleContextDocChange = (content: string) => {
    setContextDoc(content);
    if (!content.trim()) return;

    const extracted = extractProjectMemoryFromMarkdown(content);
    let updatedFieldCount = 0;

    const applyText = (value: string | undefined, setter: (next: string) => void) => {
      if (!value?.trim()) return;
      setter(value.trim());
      updatedFieldCount += 1;
    };

    const applyList = (value: string[] | undefined, setter: (next: string) => void, separator = '\n') => {
      if (!value?.length) return;
      setter(value.join(separator));
      updatedFieldCount += 1;
    };

    applyText(extracted.name, setName);
    applyText(extracted.description, setDescription);
    applyList(extracted.tech_stack, setTechStack, ', ');
    applyText(extracted.core_architecture, setCoreArchitecture);
    applyText(extracted.database_schema, setDatabaseSchema);
    applyText(extracted.current_state, setCurrentState);
    applyList(extracted.working_features, setWorkingFeatures);
    applyList(extracted.known_bugs, setKnownBugs);
    applyList(extracted.rules, setRules);

    addToast(
      updatedFieldCount > 0
        ? `.md dosyasından ${updatedFieldCount} alan dolduruldu.`
        : '.md yüklendi, otomatik doldurulacak alan bulunamadı.',
      updatedFieldCount > 0 ? 'success' : 'info'
    );
  };

  const handleSave = () => {
    updateProject(project.id, {
      name: name.trim(),
      description: description.trim(),
      tech_stack: techStack.split(',').map((s) => s.trim()).filter(Boolean),
      core_architecture: coreArchitecture.trim(),
      database_schema: databaseSchema.trim(),
      current_state: currentState.trim(),
      rules: rules.split('\n').map((s) => s.trim()).filter(Boolean),
      known_bugs: knownBugs.split('\n').map((s) => s.trim()).filter(Boolean),
      working_features: workingFeatures.split('\n').map((s) => s.trim()).filter(Boolean),
      context_doc: contextDoc,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields = [
    { label: 'Proje Adı', value: name, onChange: setName, type: 'input' as const, placeholder: 'Proje adı' },
    { label: 'Açıklama', value: description, onChange: setDescription, type: 'textarea' as const, placeholder: 'Proje hakkında kısa açıklama...' },
    { label: 'Tech Stack', value: techStack, onChange: setTechStack, type: 'input' as const, placeholder: 'React, TypeScript, Supabase (virgülle ayır)' },
    { label: 'Core Architecture (Mimari Mantık)', value: coreArchitecture, onChange: setCoreArchitecture, type: 'textarea' as const, placeholder: 'Bu proje event-driven çalışır, state yönetimi Zustand iledir vb.' },
    { label: 'Database Schema', value: databaseSchema, onChange: setDatabaseSchema, type: 'textarea' as const, placeholder: 'users(id, name), profiles(id, user_id, bio)' },
    { label: 'Mevcut Durum', value: currentState, onChange: setCurrentState, type: 'textarea' as const, placeholder: 'Projenin şu anki durumu...' },
    { label: 'Çalışan Özellikler', value: workingFeatures, onChange: setWorkingFeatures, type: 'textarea' as const, placeholder: 'Her satıra bir özellik:\nAuth sistemi\nProfil sayfası\nDashboard' },
    { label: 'Bilinen Hatalar', value: knownBugs, onChange: setKnownBugs, type: 'textarea' as const, placeholder: 'Her satıra bir hata:\nLogin sonrası redirect sorunu\nMobilde sidebar kapanmıyor' },
    { label: 'Kurallar', value: rules, onChange: setRules, type: 'textarea' as const, placeholder: 'Her satıra bir kural:\nÇalışan sistemi bozma\nservice_role_key client tarafında kullanılmaz\nTypeScript strict uyumlu olmalı' },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button className="btn-ghost" onClick={() => navigate('/projects')} style={{ padding: 8 }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>
            <span className="gradient-text">Project Memory</span>
          </h1>
          <p style={{ fontSize: 13, color: '#8B95A7', marginTop: 2 }}>
            Bu bilgiler prompt oluşturulurken otomatik kullanılır.
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/builder')} style={{ marginRight: 8 }}>
          <Wand2 size={16} /> Prompt Oluştur
        </button>
        <button
          className="btn-primary"
          onClick={handleSave}
          style={{
            background: saved ? 'linear-gradient(135deg, #22C55E, #16A34A)' : undefined,
          }}
        >
          <Save size={16} /> {saved ? 'Kaydedildi!' : 'Kaydet'}
        </button>
      </div>

      <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="app-logo-mark" style={{ width: 40, height: 40 }}>
              <Activity size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#E5E7EB' }}>Proje Hafıza Sağlığı</h2>
              <p style={{ fontSize: 13, color: '#8B95A7', marginTop: 3 }}>
                Prompt kalitesi için proje bilgisinin ne kadar dolu olduğunu gösterir.
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: health.status === 'good' ? '#22C55E' : health.status === 'warning' ? '#F59E0B' : '#EF4444' }}>
              {health.score}
            </div>
            <div style={{ fontSize: 11, color: '#8B95A7' }}>/100</div>
          </div>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: 'rgba(30,41,59,0.8)', overflow: 'hidden', marginBottom: 14 }}>
          <div
            style={{
              width: `${health.score}%`,
              height: '100%',
              borderRadius: 999,
              background: health.status === 'good'
                ? 'linear-gradient(90deg, #22C55E, #5EEAD4)'
                : health.status === 'warning'
                  ? 'linear-gradient(90deg, #F59E0B, #FACC15)'
                  : 'linear-gradient(90deg, #EF4444, #F97316)',
            }}
          />
        </div>
        <div className="project-health-grid">
          {health.checks.map((item) => (
            <div key={item.id} style={{ border: '1px solid rgba(51,65,85,0.72)', borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                {item.status === 'good' ? (
                  <CheckCircle2 size={15} style={{ color: '#22C55E' }} />
                ) : (
                  <AlertTriangle size={15} style={{ color: item.status === 'warning' ? '#F59E0B' : '#EF4444' }} />
                )}
                <strong style={{ color: '#E5E7EB', fontSize: 13 }}>{item.label}</strong>
                <span style={{ marginLeft: 'auto', color: '#8B95A7', fontSize: 12 }}>{item.score}/{item.maxScore}</span>
              </div>
              <p style={{ color: '#8B95A7', fontSize: 12, lineHeight: 1.45 }}>{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {fields.map((f) => (
          <div key={f.label} className="glass-card" style={{ padding: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#E5E7EB', marginBottom: 8 }}>
              {f.label}
            </label>
            {f.type === 'textarea' ? (
              <textarea
                className="textarea-field"
                placeholder={f.placeholder}
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                rows={4}
              />
            ) : (
              <input
                className="input-field"
                placeholder={f.placeholder}
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
              />
            )}
          </div>
        ))}

        {/* Context Document Upload */}
        <div className="glass-card" style={{ padding: 20 }}>
          <MarkdownUploader
            value={contextDoc}
            onChange={handleContextDocChange}
            label="Proje Yapı Dokümanı (.md)"
            description="CLAUDE.md, README.md veya proje yapısını anlatan bir doküman yükleyin. İçerik bağlam olarak saklanır; proje adı, açıklama, tech stack, mimari, şema, durum, özellikler, hatalar ve kurallar otomatik doldurulur."
          />
        </div>
      </div>
    </div>
  );
}
