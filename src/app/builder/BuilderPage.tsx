import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Wand2, Save, Star, FlaskConical } from 'lucide-react';
import { usePromptStore } from '@/stores/usePromptStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useTemplateStore } from '@/stores/useTemplateStore';
import { useToastStore } from '@/stores/useToastStore';
import { compilePrompt } from '@/lib/prompt-engine/compiler';
import { checkPromptQuality } from '@/lib/prompt-engine/qualityChecker';
import { extractCustomVariables, buildDynamicVariables } from '@/lib/prompt-engine/variableExtractor';
import { getDefaultSkillsByIds } from '@/data/defaultSkills';
import StepTemplate from '@/components/builder/StepTemplate';
import StepProject from '@/components/builder/StepProject';
import StepDetails from '@/components/builder/StepDetails';
import StepVariables from '@/components/builder/StepVariables';
import StepOutput from '@/components/builder/StepOutput';
import PromptViewer from '@/components/ui/PromptViewer';
import QualityScore from '@/components/prompt/QualityScore';
import type { QualityAction } from '@/components/prompt/QualityScore';
import CopyButton from '@/components/prompt/CopyButton';
import LLMTestDrawer from '@/components/prompt/LLMTestDrawer';
import { CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

const STEPS = ['Şablon', 'Proje', 'Detaylar', 'Değişkenler', 'Çıktı Formatı', 'Sonuç'];

export default function BuilderPage() {
  const navigate = useNavigate();
  const {
    builder,
    setBuilderStep,
    setBuilderCategory,
    setBuilderTemplate,
    setBuilderProject,
    setBuilderInput,
    setBuilderOutputFormat,
    setBuilderContextDoc,
    setBuilderSkills,
    setGeneratedPrompt,
    addPrompt,
    resetBuilder,
    toggleFavorite,
    prompts,
  } = usePromptStore();
  const { getProject } = useProjectStore();
  const { getAllTemplates } = useTemplateStore();
  const { addToast } = useToastStore();
  const [showLLMDrawer, setShowLLMDrawer] = useState(false);
  const allTemplates = getAllTemplates();

  const selectedTemplate = useMemo(
    () => allTemplates.find((t) => t.id === builder.templateId) || allTemplates.find((t) => t.category === builder.category),
    [allTemplates, builder.templateId, builder.category]
  );

  const project = builder.projectId ? getProject(builder.projectId) : null;
  const selectedSkills = useMemo(
    () => getDefaultSkillsByIds(builder.selectedSkillIds),
    [builder.selectedSkillIds]
  );

  const dynamicVars = useMemo(() => {
    if (!selectedTemplate) return [];
    const customVarNames = extractCustomVariables(
      selectedTemplate.template_content,
      selectedTemplate.variables,
      !!project
    );
    return buildDynamicVariables(customVarNames);
  }, [selectedTemplate, project]);

  const qualityResult = useMemo(
    () => (builder.generatedPrompt ? checkPromptQuality(builder.generatedPrompt) : null),
    [builder.generatedPrompt]
  );
  const selectedCategory = CATEGORIES.find((category) => category.id === builder.category);
  const stepProgress = Math.round(((builder.step + 1) / STEPS.length) * 100);

  const handleGenerate = () => {
    if (!selectedTemplate) return;
    const prompt = compilePrompt({
      template: selectedTemplate,
      inputData: builder.inputData,
      project: project ?? null,
      outputFormat: builder.outputFormat,
      contextDocOverride: builder.contextDocOverride || undefined,
      skills: selectedSkills,
    });
    const quality = checkPromptQuality(prompt);
    setGeneratedPrompt(prompt, quality.totalScore);
    setBuilderStep(5);
    addToast('Prompt başarıyla oluşturuldu.', 'success');
  };

  const requiredDetailVarsComplete = () => {
    if (!selectedTemplate) return false;
    const requiredVars = selectedTemplate.variables.filter((variable) => variable.required);
    if (requiredVars.length === 0) return true;
    return requiredVars.every((variable) => builder.inputData[variable.key]?.trim());
  };

  const handleSave = () => {
    if (!builder.generatedPrompt) return;
    const sourcePrompt = builder.editingPromptId
      ? prompts.find((prompt) => prompt.id === builder.editingPromptId)
      : null;
    const nextVersion = sourcePrompt ? (sourcePrompt.version || 1) + 1 : 1;
    const saved = addPrompt({
      project_id: builder.projectId,
      template_id: selectedTemplate?.id ?? null,
      title: builder.inputData['task_description']?.slice(0, 80) || 'Prompt',
      category: builder.category!,
      input_data: builder.inputData,
      final_prompt: builder.generatedPrompt,
      quality_score: builder.qualityScore,
      is_favorite: false,
      notes: '',
      skill_ids: builder.selectedSkillIds,
      parent_prompt_id: sourcePrompt ? sourcePrompt.parent_prompt_id ?? sourcePrompt.id : null,
      version: nextVersion,
    });
    addToast(nextVersion > 1 ? `Prompt v${nextVersion} olarak kaydedildi.` : 'Prompt geçmişe kaydedildi.', 'success');
    return saved;
  };

  const handleSaveAndFav = () => {
    const saved = handleSave();
    if (saved) {
      toggleFavorite(saved.id);
      addToast('Prompt favorilere eklendi.', 'success');
    }
  };

  const handleNewPrompt = () => {
    resetBuilder();
  };

  const canNext = () => {
    switch (builder.step) {
      case 0: return !!builder.templateId || !!builder.category;
      case 1: return true; // project is optional
      case 2: return requiredDetailVarsComplete();
      case 3: return true; // dynamic variables are optional
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (builder.step === 4) {
      handleGenerate();
    } else {
      setBuilderStep(builder.step + 1);
    }
  };

  const handleQualityAction = (action: QualityAction) => {
    const targetStepByAction: Record<QualityAction, number> = {
      template: 0,
      project: 1,
      details: 2,
      variables: 3,
      output: 4,
      context: 2,
    };
    setBuilderStep(targetStepByAction[action]);
  };

  return (
    <div className="animate-fade-in">
      <div className="builder-hero">
        <div>
          <div className="page-kicker">Prompt üretim akışı</div>
          <h1 className="page-title">
            <span className="gradient-text">Prompt Builder</span>
          </h1>
          <p className="page-subtitle">
            Şablon, proje bağlamı, skill seçimi ve çıktı formatını tek akışta düzenle.
          </p>
        </div>
        <div className="builder-hero-panel" aria-label="Akış özeti">
          <div className="builder-hero-stat">
            <span>Adım</span>
            <strong>{builder.step + 1}/{STEPS.length}</strong>
          </div>
          <div className="builder-hero-stat">
            <span>Kategori</span>
            <strong>{selectedCategory?.label ?? 'Seçilmedi'}</strong>
          </div>
          <div className="builder-hero-stat">
            <span>Skill</span>
            <strong>{builder.selectedSkillIds.length}</strong>
          </div>
        </div>
      </div>

      <div className="builder-progress" aria-hidden="true">
        <div style={{ width: `${stepProgress}%` }} />
      </div>

      <ol className="builder-stepper" aria-label="Prompt oluşturma adımları">
        {STEPS.map((label, i) => (
          <li key={label} className="builder-step-item">
            <button
              type="button"
              onClick={() => i <= builder.step && setBuilderStep(i)}
              disabled={i > builder.step}
              aria-current={i === builder.step ? 'step' : undefined}
              className={cn(
                'builder-step-button',
                i < builder.step && 'is-complete',
                i === builder.step && 'is-active'
              )}
            >
              <span className="builder-step-index">{i < builder.step ? '✓' : i + 1}</span>
              <span className="builder-step-label">{label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <span className={cn('builder-step-line', i < builder.step && 'is-complete')} />
            )}
          </li>
        ))}
      </ol>

      {builder.step === 5 ? (
        <>
          <div className="builder-result-grid">
            <div className="builder-preview-column">
              <PromptViewer value={builder.generatedPrompt} />
              <div className="builder-actions">
                <CopyButton text={builder.generatedPrompt} label="Prompt'u Kopyala" />
                <button className="btn-secondary" onClick={handleSave}>
                  <Save size={16} /> Kaydet
                </button>
                <button className="btn-secondary" onClick={handleSaveAndFav}>
                  <Star size={16} /> Kaydet + Favori
                </button>
                <button className="btn-secondary btn-info" onClick={() => setShowLLMDrawer(true)}>
                  <FlaskConical size={16} /> Test Et
                </button>
                <button className="btn-ghost" onClick={handleNewPrompt}>
                  Yeni Prompt
                </button>
              </div>
            </div>

            {qualityResult && <QualityScore result={qualityResult} onAction={handleQualityAction} />}
          </div>

          <LLMTestDrawer
            prompt={builder.generatedPrompt}
            open={showLLMDrawer}
            onClose={() => setShowLLMDrawer(false)}
          />
        </>
      ) : (
        <div className="builder-workspace">
          {builder.step === 0 && (
            <StepTemplate
              selectedId={builder.templateId || (selectedTemplate?.id ?? null)}
              onSelect={(tId, cat) => { 
                setBuilderTemplate(tId); 
                setBuilderCategory(cat); 
                setBuilderStep(1); 
              }}
            />
          )}
          {builder.step === 1 && (
            <StepProject
              selectedId={builder.projectId}
              onSelect={(id) => setBuilderProject(id)}
            />
          )}
          {builder.step === 2 && selectedTemplate && (
            <StepDetails
              variables={selectedTemplate.variables}
              inputData={builder.inputData}
              onInputChange={(k, v) => setBuilderInput(k, v)}
              contextDoc={builder.contextDocOverride}
              onContextDocChange={setBuilderContextDoc}
              category={builder.category}
              selectedSkillIds={builder.selectedSkillIds}
              onSkillChange={setBuilderSkills}
            />
          )}
          {builder.step === 3 && (
            <StepVariables
              dynamicVars={dynamicVars}
              inputData={builder.inputData}
              onInputChange={(k, v) => setBuilderInput(k, v)}
            />
          )}
          {builder.step === 4 && (
            <StepOutput
              selected={builder.outputFormat}
              onSelect={(fmt) => setBuilderOutputFormat(fmt)}
            />
          )}

          <div className="builder-navigation">
            <button
              className="btn-secondary"
              onClick={() => builder.step === 0 ? navigate('/') : setBuilderStep(builder.step - 1)}
            >
              <ArrowLeft size={16} /> {builder.step === 0 ? 'Dashboard' : 'Geri'}
            </button>

            {builder.step > 0 && (
              <button
                className="btn-primary"
                onClick={handleNext}
                disabled={!canNext()}
              >
                {builder.step === 4 ? (
                  <><Wand2 size={16} /> Prompt Oluştur</>
                ) : (
                  <><span>İleri</span> <ArrowRight size={16} /></>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
