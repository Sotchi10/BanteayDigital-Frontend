import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
} from "../../components/ui";
import { listSafetyKnowledge } from "../../services/safetyKnowledge";

export function SafetyKnowledgePage() {
  const tr = useInterfaceTranslation();
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    listSafetyKnowledge()
      .then((response) => {
        if (active) setKnowledge(response.knowledge || []);
      })
      .catch((requestError) => {
        if (active)
          setError({
            message:
              requestError.response?.data?.message ||
              "We could not load Community Safety guidance.",
            status: requestError.response?.status,
          });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleKnowledge = normalizedQuery
    ? knowledge.filter((topic) =>
        [
          topic.title,
          topic.category,
          topic.shortDescription,
          topic.content,
          ...(topic.warningSigns || []),
          ...(topic.preventionTips || []),
          ...(topic.indicators || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalizedQuery),
      )
    : knowledge;

  return (
    <main className="min-w-0 lg:px-6" id="main-content">
      <div className="mb-6">
        <div className="relative mt-4 max-w-xl">
          <label className="sr-only" htmlFor="safety-knowledge-search">
            {tr("Search safety knowledge")}
          </label>
          <Icon
            name="search"
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            id="safety-knowledge-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tr("Search safety topics, scams, or advice")}
            className="min-h-11 w-full rounded-lg border border-line bg-white py-2 pl-10 pr-3 text-sm text-ink outline-none placeholder:text-muted placeholder:text-sm focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>
      {loading ? (
        <LoadingState message={tr("Loading safety guidance…")} />
      ) : null}
      {!loading && error ? (
        <ErrorState
          title={tr("Could not load guidance")}
          message={tr(error.message)}
          status={error.status}
          onRetry={() => window.location.reload()}
        />
      ) : null}
      {!loading && !error && knowledge.length === 0 ? (
        <EmptyState
          icon="book"
          title={tr("No safety guidance published yet")}
          message={tr("Please check back soon.")}
        />
      ) : null}
      {!loading &&
      !error &&
      knowledge.length &&
      visibleKnowledge.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="m-0 text-sm text-muted">
            {tr("No safety guidance matches your search.")}
          </p>
        </Card>
      ) : null}
      {!loading && !error && visibleKnowledge.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleKnowledge.map((topic) => (
            <Card key={topic.id} className="flex min-h-60 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-800">
                  <Icon name={topic.icon || "shield"} size={19} />
                </span>
                <Badge tone="category">{topic.category}</Badge>
              </div>
              <h2 className="mb-1 mt-5 text-xm font-bold text-brand-900">
                {topic.title}
              </h2>
              <p className="m-0 text-sm leading-6 text-muted">
                {topic.shortDescription}
              </p>
              <Link
                to={`/safety/${topic.slug}`}
                className="mt-auto inline-flex min-h-10 items-center gap-2 pt-5 text-sm font-bold text-brand-800 hover:text-brand-700"
              >
                {tr("Learn More")} <Icon name="chevron" size={17} />
              </Link>
            </Card>
          ))}
        </div>
      ) : null}
    </main>
  );
}
