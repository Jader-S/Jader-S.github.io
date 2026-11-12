import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Panel from '@/ui/Panel';
import Reveal from '@/ui/Reveal';
import { useStore } from '@/state/useStore';
import { useT } from '@/i18n';
import { getBlogIndex, type BlogPostMeta } from '@/services/content';
import './content.css';

export default function BlogPage() {
  const t = useT();
  const setFlight = useStore((s) => s.setFlight);
  const setActive = useStore((s) => s.setActivePlanet);
  const [posts, setPosts] = useState<BlogPostMeta[] | null>(null);

  useEffect(() => {
    setActive('blog');
    if (useStore.getState().flight !== 'FLYING_IN') {
      setFlight('VIEWING');
    }
    let alive = true;
    getBlogIndex()
      .then((list) => {
        if (alive) setPosts(list.sort((a, b) => b.date.localeCompare(a.date)));
      })
      .catch(() => {
        if (alive) setPosts([]);
      });
    return () => {
      alive = false;
    };
  }, [setActive, setFlight]);

  // V3/3A：URL 统一交给 FlightRouterSync，页面不再双写导航。
  const onReturn = () => {
    useStore.getState().dispatch({ type: 'RETURN' });
  };

  return (
    <Panel
      title={t.blog.heading}
      sub={t.blog.sub}
      onReturn={onReturn}
      returnLabel={t.return}
    >
      {posts === null && <p>{t.loading}</p>}

      {posts && posts.length === 0 && (
        <div className="blog-empty">{t.blog.empty}</div>
      )}

      {posts && posts.length > 0 && (
        <>
          <p className="content-section__lead">{t.blog.postCount(posts.length)}</p>
          <div className="blog-list">
            {posts.map((post, i) => (
              <Reveal key={post.slug} delay={i * 90}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="blog-card"
                  aria-label={`${t.blog.readMore}: ${post.title}`}
                >
                  <span className="blog-card__meta">
                    <span className="blog-card__date">{post.date}</span>
                    <span>LOG / {String(i + 1).padStart(2, '0')}</span>
                  </span>
                  <h3 className="blog-card__title">{post.title}</h3>
                  <p className="blog-card__excerpt">{post.excerpt}</p>
                  <span className="blog-card__foot">
                    <span className="blog-card__tags">
                      {post.tags.map((tag) => (
                        <span key={tag} className="blog-card__tag">{tag}</span>
                      ))}
                    </span>
                    <span className="blog-card__more">{t.blog.readMore} →</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </>
      )}
    </Panel>
  );
}
