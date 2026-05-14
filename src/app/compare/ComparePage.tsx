import { useState } from 'react';
import { GitCompareArrows, Save } from 'lucide-react';
import { useProjectStore } from '@/stores/useProjectStore';
import { usePromptStore } from '@/stores/usePromptStore';
import { useTemplateStore } from '@/stores/useTemplateStore';
import { useToastStore } from '@/stores/useToastStore';
import { compilePrompt } from '@/lib/prompt-engine/compiler';
import { checkPromptQuality } from '@/lib/prompt-engine/qualityChecker';
import PromptViewer from '@/components/ui/PromptViewer';
import type { OutputFormat } from '@/types';

export default function ComparePage() {
  const { projects, getProject } = useProjectStore();
  const { getAllTemplates } = useTemplateStore();
  const { addPrompt } = usePromptStore();
  const { addToast } = useToastStore();
  const templates = getAllTemplates();
  const [projectId, setProjectId] = useState<string>('none');
  const [templateAId, setTemplateAId] = useState(templates[0]?.id ?? '');
  const [templateBId, setTemplateBId] = useState(templates[1]?.id ?? templates[0]?.id ?? '');
  const [task, setTask] = useState('Arayüzü iyileştir ve responsive davranışı güçlendir.');
  const [constraints, setConstraints] = useState('Mevcut çalışan özellikleri bozma. Gereksiz mimari değişiklik yapma.');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('full_code');

  const project = projectId === 'none' ? null : getProject(projectId) ?? null;
  const templateA = templates.find((template) => template.id === templateAId) ?? templates[0];
  const templateB = templates.find((template) => template.id === templateBId) ?? templates[1] ?? templates[0];
  const inputData = {
    task_description: task,
    constraints,
    additional_context: 'A/B karşılaştırma ekranından üretildi.',
  };
  const promptA = templateA ? compilePrompt({ template: templateA, inputData, project, outputFormat }) : '';
  const promptB = templateB ? compilePrompt({ template: templateB, inputData, project, outputFormat }) : '';
  const resultA = promptA ? { prompt: promptA, quality: checkPromptQuality(promptA) } : null;
  const resultB = promptB ? { prompt: promptB, quality: checkPromptQuality(promptB) } : null;
  const winner = !resultA || !resultB
    ? 'Karşılaştırma yok'
    : resultA.quality.totalScore === resultB.quality.totalScore
      ? 'Berabere'
      : resultA.quality.totalScore > resultB.quality.totalScore ? 'A daha güçlü' : 'B daha güçlü';

  const handleSave = (side: 'A' | 'B') => {
    const selectedTemplate = side === 'A' ? templateA : templateB;
    const selectedResult = side === 'A' ? resultA : resultB;
    if (!selectedTemplate || !selectedResult) return;

    addPrompt({
      project_id: project?.id ?? null,
      template_id: selectedTemplate.id,
      title: `A/B ${side}: ${task.slice(0, 64) || 'Prompt'}`,
      category: selectedTemplate.category,
      input_data: inputData,
      final_prompt: selectedResult.prompt,
      quality_score: selectedResult.quality.totalScore,
      is_favorite: false,
      notes: `A/B karşılaştırma sonucu: ${winner}`,
    });

    addToast(`A/B ${side} promptu geçmişe kaydedildi.`, 'success');
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div className="page-kicker">Prompt deneyleri</div>
          <h1 className="page-title">
            <span className="gradient-text">A/B Prompt Karşılaştırma</span>
          </h1>
          <p className="page-subtitle">
            Aynı görev için iki şablonu yan yana üret, kalite skorlarını karşılaştır ve güçlü olanı kaydet.
          </p>
        </div>
        <div className="glass-card" style={{ padding: 16, minWidth: 180 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <GitCompareArrows size={20} style={{ color: '#A78BFA' }} />
            <div>
              <div style={{ fontSize: 12, color: '#8B95A7' }}>Sonuç</div>
              <strong style={{ color: '#E5E7EB' }}>{winner}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="compare-controls">
          <label>
            <span>Proje</span>
            <select className="input-field" value={projectId} onChange={(event) => setProjectId(event.target.value)}>
              <option value="none">Proje seçme</option>
              {projects.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Şablon A</span>
            <select className="input-field" value={templateAId} onChange={(event) => setTemplateAId(event.target.value)}>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>{template.title}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Şablon B</span>
            <select className="input-field" value={templateBId} onChange={(event) => setTemplateBId(event.target.value)}>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>{template.title}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Çıktı formatı</span>
            <select className="input-field" value={outputFormat} onChange={(event) => setOutputFormat(event.target.value as OutputFormat)}>
              <option value="full_code">Tam Kod</option>
              <option value="patch_diff">Patch / Diff</option>
              <option value="test_plan">Test Planı</option>
              <option value="ui_design">UI Tasarım Promptu</option>
            </select>
          </label>
        </div>
        <label style={{ display: 'block', marginTop: 14 }}>
          <span style={{ display: 'block', color: '#E5E7EB', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Görev</span>
          <textarea className="textarea-field" value={task} onChange={(event) => setTask(event.target.value)} rows={3} />
        </label>
        <label style={{ display: 'block', marginTop: 14 }}>
          <span style={{ display: 'block', color: '#E5E7EB', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Kısıtlamalar</span>
          <textarea className="textarea-field" value={constraints} onChange={(event) => setConstraints(event.target.value)} rows={3} />
        </label>
      </div>

      <div className="compare-grid">
        {[
          { side: 'A' as const, template: templateA, result: resultA },
          { side: 'B' as const, template: templateB, result: resultB },
        ].map(({ side, template, result }) => (
          <section key={side} className="glass-card" style={{ padding: 16, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: '#8B95A7' }}>Prompt {side}</div>
                <h2 style={{ fontSize: 16, color: '#E5E7EB', fontWeight: 800 }}>{template?.title ?? 'Şablon yok'}</h2>
              </div>
              <div className="badge badge-purple">{result?.quality.totalScore ?? 0}/100</div>
            </div>
            <PromptViewer value={result?.prompt ?? ''} showCopy={false} />
            <button className="btn-secondary" style={{ width: '100%', marginTop: 12 }} onClick={() => handleSave(side)}>
              <Save size={16} /> Prompt {side} Kaydet
            </button>
          </section>
        ))}
      </div>
    </div>
  );
}
