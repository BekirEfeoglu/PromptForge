import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function CopyButton({ text, label = 'Kopyala', variant = 'primary' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToastStore();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      addToast('Panoya kopyalandı!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const className = variant === 'primary'
    ? 'btn-primary'
    : variant === 'secondary'
      ? 'btn-secondary'
      : 'btn-ghost';

  return (
    <button
      className={className}
      onClick={handleCopy}
      aria-label={label.trim() ? label : 'Kopyala'}
      style={{
        background: copied
          ? 'linear-gradient(135deg, #22C55E, #16A34A)'
          : undefined,
      }}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? 'Kopyalandı!' : label}
    </button>
  );
}
