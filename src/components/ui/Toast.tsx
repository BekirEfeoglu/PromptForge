import { useToastStore } from '@/stores/useToastStore';
import type { Toast } from '@/stores/useToastStore';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    const t = setTimeout(() => setIsShowing(true), 10);
    return () => clearTimeout(t);
  }, []);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle2 size={18} color="#22C55E" />;
      case 'error': return <XCircle size={18} color="#EF4444" />;
      default: return <Info size={18} color="#38BDF8" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success': return 'rgba(34, 197, 94, 0.2)';
      case 'error': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(56, 189, 248, 0.2)';
    }
  };

  return (
    <div
      style={{
        background: '#111827',
        border: `1px solid ${getBorderColor()}`,
        borderRadius: 8,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minWidth: 280,
        pointerEvents: 'auto',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        transform: isShowing ? 'translateX(0)' : 'translateX(120%)',
        opacity: isShowing ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
    >
      {getIcon()}
      <span style={{ fontSize: 14, color: '#E5E7EB', flex: 1 }}>{toast.message}</span>
      {toast.actionLabel && toast.onAction && (
        <button
          onClick={() => {
            toast.onAction?.();
            onRemove();
          }}
          style={{
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38BDF8',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 700,
            padding: '5px 8px',
            borderRadius: 6,
            whiteSpace: 'nowrap',
          }}
        >
          {toast.actionLabel}
        </button>
      )}
      <button
        onClick={onRemove}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#9CA3AF',
          cursor: 'pointer',
          display: 'flex',
          padding: 4,
          borderRadius: 4,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <X size={14} />
      </button>
    </div>
  );
}
