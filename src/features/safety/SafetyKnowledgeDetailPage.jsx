import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { Badge, Card, Icon } from "../../components/ui";
import { getSafetyKnowledge } from "../../services/safetyKnowledge";

function GuidanceList({ icon, items, title }) {
  const tr = useInterfaceTranslation();
  return (
    <Card className="p-5">
      <h2 className="m-0 flex items-center gap-2 text-base font-bold text-brand-900">
        <Icon name={icon} size={18} />
        {tr(title)}
      </h2>
      {items?.length ? (
        <ul className="mb-0 mt-3 grid gap-2 pl-5 text-sm leading-6 text-muted">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mb-0 mt-3 text-sm text-muted">{tr("No additional guidance is available.")}</p>
      )}
    </Card>
  );
}

export function SafetyKnowledgeDetailPage() {
  const tr = useInterfaceTranslation();
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.startsWith("km") ? "km" : "en";
  const { slug } = useParams();
  const requestKey = `${slug}:${language}`;
  const [result, setResult] = useState({ key: null, topic: null, error: "" });

  useEffect(() => {
    let active = true;
    getSafetyKnowledge(slug, language)
      .then((response) => {
        if (active) setResult({ key: requestKey, topic: response.knowledge, error: "" });
      })
      .catch((requestError) => {
        if (active)
          setResult({
            key: requestKey,
            topic: null,
            error: requestError.response?.data?.message || "We could not load this safety guidance.",
          });
      });
    return () => {
      active = false;
    };
  }, [language, requestKey, slug]);

  const loading = result.key !== requestKey;
  const topic = loading ? null : result.topic;
  const error = loading ? "" : result.error;

  if (!topic && !error)
    return (
      <main className="min-w-0 px-5 py-5 sm:px-8" id="main-content">
        <Card
          className="grid place-items-center p-10 text-center"
          role="status"
        >
          <span className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-800" />
          <p className="mb-0 mt-4 text-sm text-muted">{tr("Loading safety guidance…")}</p>
        </Card>
      </main>
    );
  if (error)
    return (
      <main className="min-w-0 px-5 py-5 sm:px-8" id="main-content">
        <Card className="p-8 text-center">
          <Icon name="alert" size={25} className="mx-auto text-risk-high" />
          <h1 className="mb-1 mt-3 text-xl font-bold text-brand-900">{tr("Could not load guidance")}</h1>
          <p className="m-0 text-sm text-muted" role="alert">
            {tr(error)}
          </p>
          <Link
            to="/safety"
            className="mt-5 inline-flex min-h-10 items-center rounded-lg bg-brand-800 px-4 text-sm font-bold text-white"
          >{tr("Back to Community Safety")}</Link>
        </Card>
      </main>
    );

  return (
    <main className="min-w-0 lg:px-6" id="main-content">
      <Link
        to="/safety"
        className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-brand-800 hover:text-brand-700"
      >
        <Icon name="chevron" size={16} className="rotate-180" />{tr("All safety topics")}</Link>
      <Card className="border-[#cbdcf0] bg-[#f8fbff] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge tone="category">{topic.category}</Badge>
            <h1 className="mb-1 mt-3 text-2xl font-bold text-brand-900">
              {topic.title}
            </h1>
            <p className="m-0 max-w-2xl text-sm leading-6 text-muted">
              {topic.shortDescription}
            </p>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-brand-800">
            <Icon name={topic.icon || "shield"} size={21} />
          </span>
        </div>
        <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#40546b]">
          {topic.content}
        </div>
      </Card>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <GuidanceList
          icon="alert"
          items={topic.warningSigns}
          title={tr("Warning signs")}
        />
        <GuidanceList
          icon="shield"
          items={topic.preventionTips}
          title={tr("How to stay safe")}
        />
      </div>
      {topic.indicators?.length ? (
        <Card className="mt-4 p-5">
          <h2 className="m-0 text-base font-bold text-brand-900">{tr("Examples and indicators")}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {topic.indicators.map((indicator) => (
              <Badge key={indicator} tone="neutral">
                {indicator}
              </Badge>
            ))}
          </div>
        </Card>
      ) : null}
      {topic.relatedTopics?.length ? (
        <Card className="mt-4 p-5">
          <h2 className="m-0 text-base font-bold text-brand-900">{tr("Related topics")}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {topic.relatedTopics.map((related) => (
              <Link
                key={related.id}
                to={`/safety/${related.slug}`}
                className="inline-flex min-h-9 items-center rounded-lg bg-brand-100 px-3 text-sm font-semibold text-brand-800 hover:bg-[#dceaff]"
              >
                {related.title}
              </Link>
            ))}
          </div>
        </Card>
      ) : null}
    </main>
  );
}
