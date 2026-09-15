import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Card, Icon } from "../../components/ui";
import {
  apiErrorMessage,
  listCommunityPosts,
} from "../community/api/communityApi";

const dateLabel = (date) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(date),
  );

export function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [readAlerts, setReadAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listCommunityPosts({ limit: 100 })
      .then((response) => {
        if (active) setAlerts(response.posts || []);
      })
      .catch((requestError) => {
        if (active)
          setError(
            apiErrorMessage(requestError, "Could not load verified alerts."),
          );
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
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">
            Safety updates
          </p>
          <h1 className="mb-1 mt-1 text-2xl font-bold text-brand-900">
            Verified alerts
          </h1>
          <p className="m-0 max-w-xl text-sm text-muted">
            Review recent threats confirmed by moderators and act before sharing
            information or money.
          </p>
        </div>
        <Link
          to="/analysis"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-bold text-brand-800 hover:bg-brand-100"
        >
          <Icon name="shield" size={17} />
          Analyze a similar message
        </Link>
      </div>
      {loading ? (
        <Card className="p-8 text-center text-sm text-muted" role="status">
          Loading verified alerts…
        </Card>
      ) : null}
      {!loading && error ? (
        <Card className="p-5 text-sm text-risk-high" role="alert">
          {error}
        </Card>
      ) : null}
      {!loading && !error ? (
        <div className="grid gap-3">
          {alerts.map((alert) => {
            const isRead = readAlerts.includes(alert.id);
            return (
              <Card
                key={alert.id}
                className={`p-5 transition ${isRead ? "opacity-70" : "border-l-4 border-l-brand-700"}`}
              >
                <article>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge tone="blue">
                      <Icon name="shield" size={13} />
                      Verified alert
                    </Badge>
                    <span className="text-sm text-muted">
                      {dateLabel(alert.publishedAt)}
                    </span>
                  </div>
                  <h2 className="mb-1 mt-3 text-lg font-bold text-brand-900">
                    {alert.title}
                  </h2>
                  <p className="m-0 text-sm leading-relaxed text-muted">
                    {alert.summary || alert.content}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                    <Link
                      to={`/posts/${alert.id}`}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-100 px-3 text-sm font-bold text-brand-800"
                    >
                      <Icon name="eye" size={16} />
                      View alert
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        setReadAlerts((current) =>
                          isRead
                            ? current.filter((item) => item !== alert.id)
                            : [...current, alert.id],
                        )
                      }
                      className="min-h-10 rounded-lg border-0 bg-transparent px-3 text-sm font-semibold text-muted hover:bg-[#f2f5f8] hover:text-brand-800"
                    >
                      {isRead ? "Mark as unread" : "Mark as read"}
                    </button>
                  </div>
                </article>
              </Card>
            );
          })}
        </div>
      ) : null}
      {!loading && !error && alerts.length === 0 ? (
        <Card className="p-8 text-center">
          <Icon name="check" size={28} className="mx-auto text-risk-low" />
          <h2 className="mb-1 mt-3 text-lg">No verified alerts yet</h2>
          <p className="m-0 text-sm text-muted">
            Check back when moderators publish a new safety alert.
          </p>
        </Card>
      ) : null}
    </main>
  );
}
