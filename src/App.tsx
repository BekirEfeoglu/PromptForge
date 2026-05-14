import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';

const DashboardPage = lazy(() => import('@/app/dashboard/DashboardPage'));
const ProjectsPage = lazy(() => import('@/app/projects/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('@/app/projects/ProjectDetailPage'));
const BuilderPage = lazy(() => import('@/app/builder/BuilderPage'));
const HistoryPage = lazy(() => import('@/app/history/HistoryPage'));
const TemplatesPage = lazy(() => import('@/app/templates/TemplatesPage'));
const ComparePage = lazy(() => import('@/app/compare/ComparePage'));
const EvalsPage = lazy(() => import('@/app/evals/EvalsPage'));
const SettingsPage = lazy(() => import('@/app/settings/SettingsPage'));

function PageFallback() {
  return (
    <div style={{ padding: 32, color: '#9CA3AF', fontSize: 14 }}>
      Yükleniyor...
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/builder" element={<BuilderPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/evals" element={<EvalsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/favorites" element={<HistoryPage favoritesOnly />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
