import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { listSafetyKnowledge } from "../../services/safetyKnowledge";

function Panel({ title, children }) {
  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <h2 className="community-section-title m-0 border-b border-line pb-4">
        {title}
      </h2>
      <div className="pt-4">{children}</div>
    </section>
  );
}

export function RightSidebar() {
  const tr = useInterfaceTranslation();
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.startsWith("km") ? "km" : "en";
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    let active = true;
    listSafetyKnowledge(language)
      .then((response) => {
        if (active) setTopics(response.knowledge || []);
      })
      .catch(() => {
        if (active) setTopics([]);
      });
    return () => {
      active = false;
    };
  }, [language]);

  return (
    <aside
      className="hidden self-start xl:sticky xl:top-[88px] xl:flex xl:w-[288px] xl:flex-col xl:gap-5"
      aria-label={tr("Community information")}
    >
      <Panel title={tr("Popular topics")}>
        {topics.length ? (
          <div className="flex flex-wrap gap-2.5">
            {topics.slice(0, 6).map((topic) => (
              <Link
                key={topic.id}
                to={`/safety/${encodeURIComponent(topic.slug)}`}
                className="text-[10px] rounded-full border px-2.5 py-1 text-brand-800 border-brand-700 hover:text-brand-800"
              >
                {topic.title}
              </Link>
            ))}
          </div>
        ) : (
          <Link
            to="/safety"
            className="community-body font-medium text-brand-800"
          >
            {tr("Browse safety topics")}
          </Link>
        )}
      </Panel>
      <Panel title={tr("Community guidelines")}>
        <ul className="community-body m-0 grid list-disc gap-3 pl-4 text-muted">
          <li>{tr("Share verified information and useful safety advice.")}</li>
          <li>{tr("Respect others and protect personal information.")}</li>
          <li>{tr("Report suspicious content to keep the community safe.")}</li>
        </ul>
      </Panel>
    </aside>
  );
}
