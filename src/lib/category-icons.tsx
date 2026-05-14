import {
  Bot,
  Bug,
  Database,
  FileText,
  Palette,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import type { PromptCategory } from '@/types';

interface CategoryIconProps {
  category: PromptCategory | undefined;
  size?: number;
  className?: string;
}

export function CategoryIcon({ category, size = 24, className }: CategoryIconProps) {
  const iconProps = { size, className, 'aria-hidden': true };

  switch (category) {
    case 'feature':
      return <Sparkles {...iconProps} />;
    case 'bugfix':
      return <Bug {...iconProps} />;
    case 'uiux':
      return <Palette {...iconProps} />;
    case 'supabase':
      return <Database {...iconProps} />;
    case 'discord':
      return <Bot {...iconProps} />;
    case 'refactor':
      return <RefreshCw {...iconProps} />;
    case 'codereview':
      return <Search {...iconProps} />;
    default:
      return <FileText {...iconProps} />;
  }
}
