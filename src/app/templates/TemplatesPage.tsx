import { useMemo, useState, type KeyboardEvent } from 'react';
import { BookOpen, CheckCircle2, Filter, Layers3, PackagePlus, Plus, Search, Trash2 } from 'lucide-react';
import { CATEGORIES } from '@/types';
import type { PromptCategory, PromptTemplate, TemplateVariable } from '@/types';
import { getCategoryBadgeClass } from '@/lib/utils';
import { buildDynamicVariables, extractCustomVariables } from '@/lib/prompt-engine/variableExtractor';
import { validateTemplateContent } from '@/lib/prompt-engine/templateValidation';
import { CategoryIcon } from '@/lib/category-icons';
import { useTemplateStore } from '@/stores/useTemplateStore';
import { useToastStore } from '@/stores/useToastStore';
import TemplateEditor from '@/components/ui/TemplateEditor';
import PromptViewer from '@/components/ui/PromptViewer';
import { templatePacks, type TemplatePack } from '@/data/templatePacks';

type TemplateKindFilter = 'all' | 'system' | 'custom';

const normalize = (value: string) => value.toLocaleLowerCase('tr-TR').trim();

function templateMatchesQuery(template: PromptTemplate, query: string) {
  if (!query) return true;
  const probe = normalize(`${template.title} ${template.description} ${template.category} ${template.variables.map((item) => item.label).join(' ')}`);
  return probe.includes(query);
}

function packMatchesQuery(pack: TemplatePack, query: string) {
  if (!query) return true;
  const probe = normalize(`${pack.title} ${pack.description} ${pack.sourceNote} ${pack.tags.join(' ')} ${pack.templates.map((item) => item.title).join(' ')}`);
  return probe.includes(query);
}

export default function TemplatesPage() {
  const { getAllTemplates, addTemplate, importTemplates, deleteTemplate, restoreTemplate } = useTemplateStore();
  const { addToast } = useToastStore();
  const allTemplates = getAllTemplates();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templateQuery, setTemplateQuery] = useState('');
  const [packQuery, setPackQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PromptCategory | 'all'>('all');
  const [kindFilter, setKindFilter] = useState<TemplateKindFilter>('all');
  const selected = allTemplates.find((template) => template.id === selectedId);

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PromptCategory>('feature');
  const [newDesc, setNewDesc] = useState('');
  const [newContent, setNewContent] = useState('');
  const templateValidation = useMemo(
    () => validateTemplateContent(newContent),
    [newContent]
  );

  const normalizedTemplateQuery = normalize(templateQuery);
  const normalizedPackQuery = normalize(packQuery);
  const systemCount = allTemplates.filter((template) => template.is_system).length;
  const customCount = allTemplates.length - systemCount;
  const packTemplateCount = templatePacks.reduce((total, pack) => total + pack.templates.length, 0);

  const visibleTemplates = allTemplates.filter((template) => {
    if (categoryFilter !== 'all' && template.category !== categoryFilter) return false;
    if (kindFilter === 'system' && !template.is_system) return false;
    if (kindFilter === 'custom' && template.is_system) return false;
    return templateMatchesQuery(template, normalizedTemplateQuery);
  });

  const visiblePacks = templatePacks.filter((pack) => {
    if (categoryFilter !== 'all' && pack.category !== categoryFilter) return false;
    return packMatchesQuery(pack, normalizedPackQuery);
  });

  const extractVariables = (content: string): TemplateVariable[] => {
    const variableNames = extractCustomVariables(content, [], true);
    return buildDynamicVariables(variableNames).map((variable) => ({
      ...variable,
      required: true,
    }));
  };

  const getPackImportStatus = (pack: TemplatePack) => {
    const existingKeys = new Set(
      allTemplates.map((template) => `${template.category}:${normalize(template.title)}`)
    );
    const imported = pack.templates.filter((template) =>
      existingKeys.has(`${template.category}:${normalize(template.title)}`)
    ).length;
    return { imported, total: pack.templates.length, isComplete: imported === pack.templates.length };
  };

  const handleCreate = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      addToast('Başlık ve şablon içeriği zorunludur.', 'error');
      return;
    }

    if (!templateValidation.valid) {
      addToast(templateValidation.errors[0] ?? 'Şablon sözdizimi geçersiz.', 'error');
      return;
    }

    const variables = extractVariables(newContent);

    const template = addTemplate({
      title: newTitle.trim(),
      category: newCategory,
      description: newDesc.trim() || 'Özel şablon',
      template_content: newContent,
      variables,
    });

    addToast('Özel şablon başarıyla oluşturuldu.', 'success');
    setShowForm(false);
    setNewTitle('');
    setNewDesc('');
    setNewContent('');
    setSelectedId(template.id);
    setKindFilter('custom');
  };

  const handleImportPack = (packId: string) => {
    const pack = templatePacks.find((item) => item.id === packId);
    if (!pack) return;
    const result = importTemplates(pack.templates);
    addToast(
      result.imported > 0
        ? `${pack.title}: ${result.imported} şablon yüklendi${result.skipped ? `, ${result.skipped} zaten vardı.` : '.'}`
        : `${pack.title} zaten yüklü.`,
      result.imported > 0 ? 'success' : 'info'
    );
  };

  const handleImportVisiblePacks = () => {
    const result = importTemplates(visiblePacks.flatMap((pack) => pack.templates));
    addToast(
      result.imported > 0
        ? `${result.imported} hazır şablon yüklendi${result.skipped ? `, ${result.skipped} zaten vardı.` : '.'}`
        : 'Görünen paketlerde yüklenecek yeni şablon yok.',
      result.imported > 0 ? 'success' : 'info'
    );
  };

  const handleTemplateKeyDown = (event: KeyboardEvent<HTMLDivElement>, templateId: string, isSelected: boolean) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedId(isSelected ? null : templateId);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div className="page-kicker">Prompt operasyon merkezi</div>
          <h1 className="page-title">
            <span className="gradient-text">Şablon Kütüphanesi</span>
          </h1>
          <p className="page-subtitle">
            Araştırılmış hazır paketleri yükle, mevcut şablonları filtrele ve Handlebars sözdizimini güvenle düzenle.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Yeni Şablon
        </button>
      </div>

      <div className="template-metrics" aria-label="Şablon kütüphanesi özeti">
        <div className="glass-card template-metric">
          <Layers3 size={20} />
          <span>Toplam Şablon</span>
          <strong>{allTemplates.length}</strong>
        </div>
        <div className="glass-card template-metric">
          <BookOpen size={20} />
          <span>Sistem</span>
          <strong>{systemCount}</strong>
        </div>
        <div className="glass-card template-metric">
          <PackagePlus size={20} />
          <span>Hazır Paket</span>
          <strong>{templatePacks.length}</strong>
        </div>
        <div className="glass-card template-metric">
          <CheckCircle2 size={20} />
          <span>Eklenebilir</span>
          <strong>{packTemplateCount}</strong>
        </div>
      </div>

      <div className="template-toolbar glass-card">
        <div className="template-search">
          <Search size={16} />
          <input
            value={templateQuery}
            onChange={(event) => setTemplateQuery(event.target.value)}
            placeholder="Şablon ara: güvenlik, RLS, Playwright..."
            aria-label="Şablon ara"
          />
        </div>
        <div className="template-filter-row" aria-label="Kategori filtreleri">
          <button className="skill-filter-button" aria-pressed={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>
            <Filter size={14} /> Tümü
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              className="skill-filter-button"
              aria-pressed={categoryFilter === category.id}
              onClick={() => setCategoryFilter(category.id)}
            >
              <CategoryIcon category={category.id} size={14} /> {category.label}
            </button>
          ))}
        </div>
        <div className="template-kind-tabs" aria-label="Şablon türü">
          {[
            { id: 'all', label: 'Hepsi' },
            { id: 'system', label: 'Sistem' },
            { id: 'custom', label: `Özel (${customCount})` },
          ].map((item) => (
            <button
              key={item.id}
              className={kindFilter === item.id ? 'is-active' : undefined}
              onClick={() => setKindFilter(item.id as TemplateKindFilter)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section style={{ marginBottom: 26 }}>
        <div className="template-section-header">
          <div>
            <h2>Hazır Prompt Paketleri</h2>
            <p>OpenAI, Anthropic, GitHub Copilot ve Cursor dokümanlarındaki güncel prompt pratiklerinden sentezlenen özgün paketler.</p>
          </div>
          <div className="template-pack-actions">
            <div className="template-search template-pack-search">
              <Search size={15} />
              <input
                value={packQuery}
                onChange={(event) => setPackQuery(event.target.value)}
                placeholder="Paket ara"
                aria-label="Paket ara"
              />
            </div>
            <button className="btn-secondary" onClick={handleImportVisiblePacks} disabled={visiblePacks.length === 0}>
              <PackagePlus size={16} /> Görünenleri Yükle
            </button>
          </div>
        </div>

        {visiblePacks.length === 0 ? (
          <div className="glass-card template-empty-state">Bu filtrelerle eşleşen hazır paket yok.</div>
        ) : (
          <div className="template-pack-grid">
            {visiblePacks.map((pack) => {
              const status = getPackImportStatus(pack);
              return (
                <article key={pack.id} className="glass-card template-pack-card">
                  <div className="template-pack-topline">
                    <span className="choice-card-icon" aria-hidden="true">
                      <CategoryIcon category={pack.category} size={22} />
                    </span>
                    <span className={`badge ${status.isComplete ? 'badge-green' : 'badge-purple'}`}>
                      {status.imported}/{status.total} yüklü
                    </span>
                  </div>
                  <h3>{pack.title}</h3>
                  <p>{pack.description}</p>
                  <div className="template-pack-source">{pack.sourceNote}</div>
                  <div className="template-tag-row">
                    {pack.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="template-pack-footer">
                    <span>{pack.templates.length} şablon</span>
                    <button className="btn-secondary" onClick={() => handleImportPack(pack.id)}>
                      {status.isComplete ? 'Tekrar Dene' : 'Yükle'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {showForm && (
        <div className="glass-card animate-fade-in template-create-panel">
          <div className="template-section-header" style={{ marginBottom: 16 }}>
            <div>
              <h2>Yeni Şablon Oluştur</h2>
              <p>Değişkenleri Handlebars formatında yaz: <code>{`{{task_description}}`}</code></p>
            </div>
          </div>
          <div className="template-form-grid">
            <input className="input-field" placeholder="Şablon Adı *" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} />
            <select className="input-field" value={newCategory} onChange={(event) => setNewCategory(event.target.value as PromptCategory)}>
              {CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
            </select>
          </div>
          <input className="input-field" placeholder="Kısa Açıklama" value={newDesc} onChange={(event) => setNewDesc(event.target.value)} style={{ marginTop: 12 }} />
          <div style={{ marginTop: 12 }}>
            <TemplateEditor
              value={newContent}
              onChange={setNewContent}
              placeholder="Act as a senior... \n\n## Task\n{{task_description}}\n\n{{guardrails}}"
              minHeight="220px"
            />
            {newContent.trim() && (
              <div className={templateValidation.valid ? 'template-validation success' : 'template-validation danger'}>
                {templateValidation.valid ? (
                  <div>Sözdizimi geçerli. Bulunan değişken: {templateValidation.variables.length || 0}</div>
                ) : (
                  templateValidation.errors.map((error) => <div key={error}>{error}</div>)
                )}
                {templateValidation.variables.length > 0 && (
                  <div className="template-tag-row" style={{ marginTop: 8 }}>
                    {templateValidation.variables.map((variable) => <span key={variable}>{variable}</span>)}
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={handleCreate}>Oluştur</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>İptal</button>
          </div>
        </div>
      )}

      <div className={`template-library-layout${selected ? ' has-preview' : ''}`}>
        <section className="template-list-column">
          <div className="template-section-header">
            <div>
              <h2>Şablonlar</h2>
              <p>{visibleTemplates.length} sonuç gösteriliyor.</p>
            </div>
          </div>

          {visibleTemplates.length === 0 ? (
            <div className="glass-card template-empty-state">Bu filtreyle eşleşen şablon yok.</div>
          ) : (
            <div className="template-list">
              {visibleTemplates.map((template) => {
                const category = CATEGORIES.find((item) => item.id === template.category);
                const isSelected = template.id === selectedId;
                return (
                  <div
                    key={template.id}
                    className={`glass-card template-list-card${isSelected ? ' is-selected' : ''}`}
                    onClick={() => setSelectedId(isSelected ? null : template.id)}
                    onKeyDown={(event) => handleTemplateKeyDown(event, template.id, isSelected)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                  >
                    {!template.is_system && (
                      <button
                        className="btn-ghost template-delete-button"
                        aria-label="Şablonu sil"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteTemplate(template.id);
                          if (selectedId === template.id) setSelectedId(null);
                          addToast('Şablon silindi.', 'info', {
                            label: 'Geri Al',
                            onClick: () => restoreTemplate(template),
                          });
                        }}
                        title="Şablonu Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    <div className="template-card-header">
                      <span className="choice-card-icon" aria-hidden="true">
                        <CategoryIcon category={template.category} size={22} />
                      </span>
                      <div>
                        <h3>{template.title}</h3>
                        <div className="template-card-badges">
                          {category && <span className={`badge ${getCategoryBadgeClass(category.color)}`}>{category.label}</span>}
                          <span className={template.is_system ? 'badge badge-green' : 'badge badge-blue'}>
                            {template.is_system ? 'Sistem' : 'Özel'}
                          </span>
                          <span className="badge badge-purple">{template.variables.length} değişken</span>
                        </div>
                      </div>
                    </div>
                    <p>{template.description}</p>
                    {template.variables.length > 0 && (
                      <div className="template-variable-row">
                        {template.variables.slice(0, 8).map((variable) => (
                          <span key={variable.key}>
                            {variable.label}{variable.required ? ' *' : ''}
                          </span>
                        ))}
                        {template.variables.length > 8 && <span>+{template.variables.length - 8}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {selected && (
          <aside className="template-preview-panel animate-slide-right">
            <div className="glass-card" style={{ padding: 14, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CategoryIcon category={selected.category} size={22} />
                <div>
                  <h2 style={{ color: '#E5E7EB', fontSize: 15, fontWeight: 800 }}>{selected.title}</h2>
                  <p style={{ color: '#8B95A7', fontSize: 12, marginTop: 2 }}>{selected.description}</p>
                </div>
              </div>
            </div>
            <PromptViewer value={selected.template_content} showCopy={false} />
          </aside>
        )}
      </div>
    </div>
  );
}
