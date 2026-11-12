import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Panel from '@/ui/Panel';
import { useStore } from '@/state/useStore';
import { useT } from '@/i18n';
import { loadBlogPost } from '@/services/content';

export default function BlogPostPage() {
  const t = useT();
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const setFlight = useStore((s) => s.setFlight);
  const setActive = useStore((s) => s.setActivePlanet);
  const [Content, setContent] = useState<React.ComponentType | null>(null);
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActive('blog');
    if (useStore.getState().flight !== 'FLYING_IN') {
      setFlight('VIEWING');
    }
    let alive = true;
    loadBlogPost(slug)
      .then(({ default: C, frontmatter: fm }) => {
        if (!alive) return;
        setContent(() => C);
        setFrontmatter(fm);
      })
      .catch((e) => {
        if (alive) setError(String(e));
      });
    return () => {
      alive = false;
    };
  }, [slug, setFlight, setActive]);

  const onReturn = () => {
    navigate('/blog');
  };

  return (
    <Panel
      title={(frontmatter?.title as string) ?? slug}
      sub={(frontmatter?.date as string) ?? ''}
      onReturn={onReturn}
      returnLabel={t.return}
    >
      {error && <p>{t.blog.coming}</p>}
      {!error && Content && <Content />}
    </Panel>
  );
}
