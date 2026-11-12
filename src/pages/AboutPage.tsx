import { useEffect } from 'react';
import Panel from '@/ui/Panel';
import Reveal from '@/ui/Reveal';
import { useStore } from '@/state/useStore';
import { useT } from '@/i18n';
import './content.css';

export default function AboutPage() {
  const t = useT();
  const setFlight = useStore((s) => s.setFlight);
  const setActive = useStore((s) => s.setActivePlanet);

  useEffect(() => {
    setActive('about');
    if (useStore.getState().flight !== 'FLYING_IN') {
      setFlight('VIEWING');
    }
  }, [setActive, setFlight]);

  // V3/3A：URL 统一交给 FlightRouterSync（RETURN → FLYING_OUT → navigate('/')），
  // 页面不再 setTimeout 双写导航，避免与路由同步器竞态。
  const onReturn = () => {
    useStore.getState().dispatch({ type: 'RETURN' });
  };

  return (
    <Panel
      title={t.about.heading}
      sub={t.about.intro}
      onReturn={onReturn}
      returnLabel={t.return}
    >
      <Reveal>
        <section className="content-section">
          <div className="identity-card">
            <span className="identity-card__avatar" aria-hidden="true">{t.about.bio.name.trim()[0] ?? 'J'}</span>
            <h3 className="identity-card__name">{t.about.bio.name}</h3>
            <p className="identity-card__role">{t.about.bio.role}</p>
            <p className="identity-card__edu">{t.about.bio.education}</p>
          </div>
        </section>
      </Reveal>

      <Reveal delay={90}>
        <section className="content-section">
          <h2>{t.about.sections.focus}</h2>
          <p className="content-section__lead">{t.about.sections.focusBody}</p>
          <div className="tag-grid">
            {t.about.focusTags.map((tag) => (
              <span key={tag} className="tag-chip tag-chip--purple">{tag}</span>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={180}>
        <section className="content-section">
          <h2>{t.about.sections.stack}</h2>
          <p className="content-section__lead">{t.about.sections.stackBody}</p>
          <div className="tag-grid">
            {t.about.tags.map((tag) => (
              <span key={tag} className="tag-chip">{tag}</span>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={270}>
        <section className="content-section">
          <h2>{t.about.experience.heading}</h2>
          <div className="timeline">
            {t.about.experience.items.map((job) => (
              <div className="timeline__item" key={job.company}>
                <div className="timeline__head">
                  <h3 className="timeline__company">{job.company}</h3>
                  <span className="timeline__period">{job.period}</span>
                </div>
                <p className="timeline__role">{job.role}</p>
                <ul className="timeline__points">
                  {job.points.map((p, k) => (
                    <li key={k}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={360}>
        <section className="content-section">
          <h2>{t.about.skills.heading}</h2>
          <div className="skills-grid">
            {t.about.skills.groups.map((g) => (
              <div className="skill-card" key={g.title}>
                <h3 className="skill-card__title">{g.title}</h3>
                <ul className="skill-card__points">
                  {g.points.map((p, k) => (
                    <li key={k}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </Reveal>
    </Panel>
  );
}
