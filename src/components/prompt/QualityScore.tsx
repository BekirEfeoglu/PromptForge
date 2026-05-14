import type { QualityResult } from '@/lib/prompt-engine/qualityChecker';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export type QualityAction = 'template' | 'project' | 'details' | 'variables' | 'output' | 'context';

interface QualityScoreProps {
  result: QualityResult;
  onAction?: (action: QualityAction) => void;
}

const ACTION_LABELS: Record<QualityAction, string> = {
  template: 'Şablona Git',
  project: 'Projeye Git',
  details: 'Detayları Doldur',
  variables: 'Değişkenlere Git',
  output: 'Çıktı Formatı',
  context: 'Bağlam Ekle',
};

function actionForCheck(checkName: string): QualityAction | null {
  if (checkName.includes('Rol')) return 'template';
  if (checkName.includes('Görev')) return 'details';
  if (checkName.includes('Teknoloji')) return 'variables';
  if (checkName.includes('Proje')) return 'project';
  if (checkName.includes('Kısıt')) return 'details';
  if (checkName.includes('Çıktı')) return 'output';
  if (checkName.includes('Test')) return 'details';
  if (checkName.includes('Dosya')) return 'output';
  if (checkName.includes('Güvenlik')) return 'details';
  if (checkName.includes('Bağlam')) return 'context';
  return null;
}

export default function QualityScore({ result, onAction }: QualityScoreProps) {
  const { totalScore, checks, missingItems } = result;
  const actions = Array.from(new Set(
    checks
      .filter((check) => !check.passed)
      .map((check) => actionForCheck(check.name))
      .filter(Boolean)
  )) as QualityAction[];

  const getScoreColor = () => {
    if (totalScore >= 80) return '#22C55E';
    if (totalScore >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = () => {
    if (totalScore >= 90) return 'Mükemmel';
    if (totalScore >= 80) return 'Çok İyi';
    if (totalScore >= 60) return 'İyi';
    if (totalScore >= 40) return 'Orta';
    return 'Zayıf';
  };

  const color = getScoreColor();
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (totalScore / 100) * circumference;

  return (
    <div className="glass-card quality-card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#E5E7EB' }}>
        Prompt Kalite Skoru
      </h3>

      {/* Circular Score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 24 }}>
        <div style={{ position: 'relative', width: 100, height: 100 }}>
          <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1E293B" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color }}>{totalScore}</div>
            <div style={{ fontSize: 10, color: '#8B95A7' }}>/100</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color, marginBottom: 4 }}>{getScoreLabel()}</div>
          <div style={{ fontSize: 13, color: '#9CA3AF' }}>
            {checks.filter((c) => c.passed).length}/{checks.length} kriter karşılandı
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {checks.map((check) => (
          <div
            key={check.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 0',
              fontSize: 13,
            }}
          >
            {check.passed ? (
              <CheckCircle2 size={16} style={{ color: '#22C55E', flexShrink: 0 }} />
            ) : (
              <XCircle size={16} style={{ color: '#EF4444', flexShrink: 0 }} />
            )}
            <span style={{ color: check.passed ? '#9CA3AF' : '#E5E7EB' }}>{check.name}</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#8B95A7' }}>
              {check.score}/{check.maxScore}
            </span>
          </div>
        ))}
      </div>

      {/* Missing Items */}
      {missingItems.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 8,
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B', marginBottom: 6 }}>
            Eksik Alanlar:
          </div>
          {missingItems.map((item, i) => (
            <div key={i} style={{ fontSize: 12, color: '#9CA3AF', paddingLeft: 8, marginBottom: 2 }}>
              • {item}
            </div>
          ))}
          {onAction && actions.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              {actions.map((action) => (
                <button
                  key={action}
                  className="btn-secondary"
                  onClick={() => onAction(action)}
                  style={{ padding: '6px 10px', fontSize: 12 }}
                >
                  {ACTION_LABELS[action]} <ArrowRight size={13} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
