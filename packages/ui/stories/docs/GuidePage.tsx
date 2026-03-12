import type { ReactNode } from "react";

interface GuidePageSection {
  title: string;
  children: ReactNode;
}

interface GuidePageProps {
  title: string;
  summary: string;
  sections: GuidePageSection[];
}

function GuidePage({ title, summary, sections }: GuidePageProps) {
  return (
    <article className="guide-page">
      <header className="guide-page__header">
        <h1 className="guide-page__title">{title}</h1>
        <p className="guide-page__summary">{summary}</p>
      </header>

      <div className="guide-page__grid">
        {sections.map((section) => (
          <section key={section.title} className="guide-page__section">
            <h2>{section.title}</h2>
            {section.children}
          </section>
        ))}
      </div>
    </article>
  );
}

export { GuidePage };
