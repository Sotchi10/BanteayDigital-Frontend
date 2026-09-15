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
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <main className="min-w-0 lg:px-10" id="main-content">
      <div className="mb-6">
        <p className="m-0 text-xs font-bold uppercase tracking-widest text-brand-700">
          Stay informed
        </p>
        <h1 className="mb-1 mt-1 text-2xl font-bold text-brand-900">
          Community Safety
        </h1>
        <p className="m-0 max-w-2xl text-sm text-muted">
          Practical guidance to help you recognise common online scams and
          protect your information.
        </p>
      </div>
      {loading ? <LoadingState message="Loading safety guidance…" /> : null}
      {!loading && error ? (
        <ErrorState
          title="Could not load guidance"
          message={error.message}
          status={error.status}
          onRetry={() => window.location.reload()}
        />
      ) : null}
      {!loading && !error && knowledge.length === 0 ? (
        <EmptyState
          icon="book"
          title="No safety guidance published yet"
          message="Please check back soon."
        />
      ) : null}
      {!loading && !error && knowledge.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {knowledge.map((topic) => (
            <Card key={topic.id} className="flex min-h-60 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-800">
                  <Icon name={topic.icon || "shield"} size={19} />
                </span>
                <Badge tone="category">{topic.category}</Badge>
              </div>
              <h2 className="mb-1 mt-5 text-lg font-bold text-brand-900">
                {topic.title}
              </h2>
              <p className="m-0 text-sm leading-6 text-muted">
                {topic.shortDescription}
              </p>
              <Link
                to={`/safety/${topic.slug}`}
                className="mt-auto inline-flex min-h-10 items-center gap-2 pt-5 text-sm font-bold text-brand-800 hover:text-brand-700"
              >
                Learn More <Icon name="chevron" size={17} />
              </Link>
            </Card>
          ))}
        </div>
      ) : null}
    </main>
  );
}
