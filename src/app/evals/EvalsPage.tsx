import { useState } from 'react';
import { ClipboardCheck, Play, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePromptStore } from '@/stores/usePromptStore';
import { useToastStore } from '@/stores/useToastStore';
import { scorePromptEvalOutput } from '@/lib/evalScoring';
import { formatDate } from '@/lib/utils';

export default function EvalsPage() {
  const navigate = useNavigate();
  const {
    prompts,
    evalRuns,
    addEvalScenario,
    deleteEvalScenario,
    addEvalRun,
    getEvalScenariosForPrompt,
    getEvalRunsForPrompt,
  } = usePromptStore();
  const { addToast } = useToastStore();
  const [promptId, setPromptId] = useState(prompts[0]?.id ?? '');
  const selectedPrompt = prompts.find((prompt) => prompt.id === promptId) ?? prompts[0];
  const scenarios = selectedPrompt ? getEvalScenariosForPrompt(selectedPrompt.id) : [];
  const promptRuns = selectedPrompt ? getEvalRunsForPrompt(selectedPrompt.id) : [];
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioInput, setScenarioInput] = useState('');
  const [scenarioExpected, setScenarioExpected] = useState('');
  const [scenarioRubric, setScenarioRubric] = useState('');
  const [runScenarioId, setRunScenarioId] = useState('');
  const [manualOutput, setManualOutput] = useState('');

  const activeScenario = scenarios.find((scenario) => scenario.id === runScenarioId) ?? scenarios[0];
  const passRate = promptRuns.length === 0
    ? 0
    : Math.round((promptRuns.filter((run) => run.status === 'passed').length / promptRuns.length) * 100);

  const handleCreateScenario = () => {
    if (!selectedPrompt) return;
    if (!scenarioName.trim() || !scenarioExpected.trim()) {
      addToast('Senaryo adı ve beklenen çıktı zorunludur.', 'error');
      return;
    }

    const scenario = addEvalScenario({
      prompt_id: selectedPrompt.id,
      name: scenarioName.trim(),
      input: scenarioInput.trim(),
      expected: scenarioExpected.trim(),
      rubric: scenarioRubric.trim(),
    });

    setRunScenarioId(scenario.id);
    setScenarioName('');
    setScenarioInput('');
    setScenarioExpected('');
    setScenarioRubric('');
    addToast('Test senaryosu eklendi.', 'success');
  };

  const handleAddRun = () => {
    if (!selectedPrompt || !activeScenario) return;
    const score = scorePromptEvalOutput(activeScenario, manualOutput);

    addEvalRun({
      prompt_id: selectedPrompt.id,
      scenario_id: activeScenario.id,
      provider: 'manual',
      model: 'paste-output',
      output: manualOutput,
      score: score.score,
      status: score.status,
      notes: score.notes,
    });

    setManualOutput('');
    addToast(`Test sonucu kaydedildi: ${score.score}/100`, score.status === 'passed' ? 'success' : 'info');
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div className="page-kicker">Kalite döngüsü</div>
          <h1 className="page-title">
            <span className="gradient-text">Prompt Test Setleri</span>
          </h1>
          <p className="page-subtitle">
            Kaydedilmiş promptlar için test senaryosu oluştur, çıktı yapıştır ve beklenen davranışa göre skorla.
          </p>
        </div>
        <div className="glass-card" style={{ padding: 16, minWidth: 180 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ClipboardCheck size={20} style={{ color: '#22C55E' }} />
            <div>
              <div style={{ fontSize: 12, color: '#8B95A7' }}>Başarı oranı</div>
              <strong style={{ color: '#E5E7EB' }}>{passRate}%</strong>
            </div>
          </div>
        </div>
      </div>

      {prompts.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: '#8B95A7', marginBottom: 16 }}>Test seti oluşturmak için önce bir prompt kaydet.</p>
          <button className="btn-primary" onClick={() => navigate('/builder')}>Prompt Oluştur</button>
        </div>
      ) : (
        <div className="eval-layout">
          <section className="glass-card" style={{ padding: 20 }}>
            <label style={{ display: 'block', marginBottom: 16 }}>
              <span style={{ display: 'block', color: '#E5E7EB', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Prompt</span>
              <select className="input-field" value={selectedPrompt?.id ?? ''} onChange={(event) => setPromptId(event.target.value)}>
                {prompts.map((prompt) => (
                  <option key={prompt.id} value={prompt.id}>{prompt.title} · v{prompt.version || 1}</option>
                ))}
              </select>
            </label>

            <h2 style={{ fontSize: 16, color: '#E5E7EB', fontWeight: 800, marginBottom: 12 }}>Yeni Senaryo</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="input-field" placeholder="Senaryo adı *" value={scenarioName} onChange={(event) => setScenarioName(event.target.value)} />
              <textarea className="textarea-field" placeholder="Girdi / kullanıcı isteği" value={scenarioInput} onChange={(event) => setScenarioInput(event.target.value)} rows={3} />
              <textarea className="textarea-field" placeholder="Beklenen çıktı veya anahtar beklentiler *" value={scenarioExpected} onChange={(event) => setScenarioExpected(event.target.value)} rows={4} />
              <textarea className="textarea-field" placeholder="Rubrik / değerlendirme notu" value={scenarioRubric} onChange={(event) => setScenarioRubric(event.target.value)} rows={3} />
              <button className="btn-primary" onClick={handleCreateScenario}>
                <Plus size={16} /> Senaryo Ekle
              </button>
            </div>
          </section>

          <section className="glass-card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 16, color: '#E5E7EB', fontWeight: 800, marginBottom: 12 }}>Senaryolar</h2>
            {scenarios.length === 0 ? (
              <p style={{ color: '#8B95A7', fontSize: 13 }}>Bu prompt için henüz senaryo yok.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {scenarios.map((scenario) => {
                  const scenarioRuns = evalRuns.filter((run) => run.scenario_id === scenario.id);
                  const latestRun = scenarioRuns[0];
                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      className="choice-row"
                      onClick={() => setRunScenarioId(scenario.id)}
                      style={{ alignItems: 'flex-start' }}
                    >
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ display: 'block', color: '#E5E7EB', fontSize: 13 }}>{scenario.name}</strong>
                        <span style={{ display: 'block', color: '#8B95A7', fontSize: 12, marginTop: 4 }}>
                          {latestRun ? `Son skor: ${latestRun.score}/100` : 'Henüz koşulmadı'}
                        </span>
                      </span>
                      <span
                        className="btn-ghost"
                        aria-label="Senaryoyu sil"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteEvalScenario(scenario.id);
                          addToast('Senaryo silindi.', 'info');
                        }}
                      >
                        <Trash2 size={16} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="glass-card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 16, color: '#E5E7EB', fontWeight: 800, marginBottom: 12 }}>Manuel Test Sonucu</h2>
            {activeScenario ? (
              <>
                <label style={{ display: 'block', marginBottom: 12 }}>
                  <span style={{ display: 'block', color: '#E5E7EB', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Aktif senaryo</span>
                  <select className="input-field" value={activeScenario.id} onChange={(event) => setRunScenarioId(event.target.value)}>
                    {scenarios.map((scenario) => (
                      <option key={scenario.id} value={scenario.id}>{scenario.name}</option>
                    ))}
                  </select>
                </label>
                <textarea
                  className="textarea-field"
                  placeholder="AI çıktısını buraya yapıştır..."
                  value={manualOutput}
                  onChange={(event) => setManualOutput(event.target.value)}
                  rows={8}
                />
                <button className="btn-secondary btn-info" style={{ width: '100%', marginTop: 12 }} onClick={handleAddRun} disabled={!manualOutput.trim()}>
                  <Play size={16} /> Skorla ve Kaydet
                </button>
              </>
            ) : (
              <p style={{ color: '#8B95A7', fontSize: 13 }}>Önce bir senaryo ekle.</p>
            )}
          </section>

          <section className="glass-card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 16, color: '#E5E7EB', fontWeight: 800, marginBottom: 12 }}>Son Koşular</h2>
            {promptRuns.length === 0 ? (
              <p style={{ color: '#8B95A7', fontSize: 13 }}>Henüz test sonucu yok.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {promptRuns.slice(0, 8).map((run) => (
                  <div key={run.id} style={{ border: '1px solid rgba(51,65,85,0.72)', borderRadius: 10, padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <strong style={{ color: run.status === 'passed' ? '#22C55E' : '#F59E0B' }}>{run.score}/100</strong>
                      <span style={{ color: '#8B95A7', fontSize: 12 }}>{formatDate(run.created_at)}</span>
                    </div>
                    <p style={{ color: '#8B95A7', fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>{run.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
