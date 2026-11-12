/**
 * Top-level App. Sets up routes + global HUD layer.
 * The 3D scene is mounted only inside the GalaxyRoute; the rest of the app
 * uses the same router — content & routes stay consistent in 2D fallback.
 */
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from '@/state/useStore';
import { useT } from '@/i18n';
import { detectWebGL2 } from '@/utils/device';
import { useEffect } from 'react';
import HUDLayer from '@/ui/HUDLayer';
import LoadingHUD from '@/ui/LoadingHUD';
import ErrorBoundary from '@/ui/ErrorBoundary';
import FallbackRoute from '@/ui/FallbackRoute';

const GalaxyRoute = lazy(() => import('@/three/GalaxyRoute'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'));
const DemosPage = lazy(() => import('@/pages/DemosPage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));

export default function App() {
  const t = useT();
  const webglBroken = useStore((s) => s.webglBroken);
  const setWebglBroken = useStore((s) => s.setWebglBroken);
  const location = useLocation();

  // Probe WebGL once at boot.
  useEffect(() => {
    if (!detectWebGL2()) {
      setWebglBroken(true);
    }
  }, [setWebglBroken]);

  // Scroll restore on route change (within iframe-less SPA this is a no-op
  // for / route since the body is overflow:hidden).
  useEffect(() => {
    if (location.pathname === '/') {
      document.title = `${t.brand} · ${t.nav.home}`;
    }
  }, [location.pathname, t]);

  const showGalaxy = !webglBroken;

  return (
    <ErrorBoundary scope="canvas">
      {showGalaxy ? (
        <Suspense fallback={<LoadingHUD label={t.loading} />}>
          <GalaxyRoute />
        </Suspense>
      ) : (
        <FallbackRoute />
      )}
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/demos" element={<DemosPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <HUDLayer />
    </ErrorBoundary>
  );
}