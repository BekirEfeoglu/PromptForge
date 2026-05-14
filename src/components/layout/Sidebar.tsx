import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BookTemplate,
  Clock,
  ClipboardCheck,
  FolderKanban,
  GitCompareArrows,
  LayoutDashboard,
  Menu,
  Settings,
  Star,
  Wand2,
  X,
  Zap,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projeler' },
  { to: '/builder', icon: Wand2, label: 'Prompt Builder' },
  { to: '/compare', icon: GitCompareArrows, label: 'A/B Karşılaştır' },
  { to: '/evals', icon: ClipboardCheck, label: 'Test Setleri' },
  { to: '/templates', icon: BookTemplate, label: 'Şablonlar' },
  { to: '/history', icon: Clock, label: 'Geçmiş' },
  { to: '/favorites', icon: Star, label: 'Favoriler' },
  { to: '/settings', icon: Settings, label: 'Ayarlar' },
];

export default function Sidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="app-logo-mark" aria-hidden="true">
            <Zap size={18} />
          </div>
          <div>
            <span className="gradient-text" style={{ fontSize: 18, fontWeight: 800 }}>
              PromptForge
            </span>
            <div style={{ fontSize: 11, color: '#8B95A7', marginTop: 1 }}>Vibe Coding Engine</div>
          </div>
        </div>
        <button
          type="button"
          className="app-mobile-menu-button"
          aria-controls="primary-navigation"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav
        id="primary-navigation"
        className={`app-sidebar-nav${isMobileMenuOpen ? ' is-open' : ''}`}
        aria-label="Ana navigasyon"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`app-nav-link${isActive ? ' active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon size={18} style={{ color: isActive ? '#8B5CF6' : 'inherit', flexShrink: 0 }} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="app-sidebar-footer">v1.0.0 - MVP</div>
    </aside>
  );
}
