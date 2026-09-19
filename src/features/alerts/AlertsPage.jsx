import { useEffect, useState } from "react";
import { Badge, Card, Icon } from "../../components/ui";
import appI18n from "../../i18n";
import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { listAlerts } from "./api/alertsApi";
import { readAlertIds as getReadAlertIds, saveAlertIds } from "./alertReadState";

const dateLabel = (date) =>
  new Intl.DateTimeFormat(appI18n.resolvedLanguage, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

export function AlertsPage() {
  const tr = useInterfaceTranslation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [readAlertIds, setReadAlertIds] = useState(() => getReadAlertIds());
  const [expandedAlertIds, setExpandedAlertIds] = useState(() => new Set());

  useEffect(() => {
    let active = true;
    listAlerts()
      .then((response) => {
        if (active) setAlerts(response.alerts || []);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message || tr("Could not load alerts."),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tr]);

  const unreadCount = alerts.filter((alert) => !readAlertIds.has(alert.id)).length;
  const visibleAlerts = alerts.filter((alert) => (
    filter === "all" || (filter === "read" ? readAlertIds.has(alert.id) : !readAlertIds.has(alert.id))
  ));

  const toggleRead = (alertId) => {
    setReadAlertIds((current) => {
      const next = new Set(current);
      if (next.has(alertId)) next.delete(alertId);
      else next.add(alertId);
      saveAlertIds(next);
      return next;
    });
  };

  const toggleExpanded = (alertId) => {
    setExpandedAlertIds((current) => {
      const next = new Set(current);
      if (next.has(alertId)) next.delete(alertId);
      else next.add(alertId);
      return next;
    });
  };

  return (
    <main className="flex min-w-0 flex-col gap-4 lg:px-6" id="main-content">
      <header className="rounded-xl border border-line bg-white p-5 sm:p-6">
        <p className="mb-1 mt-0 text-xs font-bold uppercase tracking-wider text-brand-700">{tr("From Banteay Digital")}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="m-0 text-2xl font-bold text-brand-900">{tr("Notifications")}</h1>
          {unreadCount ? <Badge tone="blue">{tr("{{count}} unread", { count: unreadCount })}</Badge> : null}
        </div>
        <p className="mb-0 mt-2 text-sm leading-6 text-muted">
          {tr("Official announcements and time-sensitive updates from Banteay Digital.")}
        </p>
      </header>

      {loading ? (
        <Card className="p-8 text-center text-sm text-muted" role="status">
          {tr("Loading alerts…")}
        </Card>
      ) : null}

      {!loading && error ? (
        <Card className="p-5 text-sm text-risk-high" role="alert">
          {error}
        </Card>
      ) : null}

      {!loading && !error && alerts.length ? (
        <>
          <div className="flex flex-wrap gap-2" aria-label={tr("Filter notifications")}>
            {[
              ["all", "All"],
              ["unread", "Unread"],
              ["read", "Read"],
            ].map(([value, label]) => (
              <button
                aria-pressed={filter === value}
                className={`min-h-10 rounded-lg border px-3 text-sm font-semibold transition ${filter === value ? "border-brand-700 bg-brand-700 text-white" : "border-line bg-white text-brand-800 hover:bg-brand-100"}`}
                key={value}
                onClick={() => setFilter(value)}
                type="button"
              >
                {tr(label)}
              </button>
            ))}
          </div>
          <div className="grid gap-2">
            {visibleAlerts.map((alert) => {
              const isRead = readAlertIds.has(alert.id);
              const isExpanded = expandedAlertIds.has(alert.id);
              const hasLongContent = alert.content.length > 180;
              return (
                <Card
                  key={alert.id}
                  className={`p-0 transition-shadow hover:shadow-[0_5px_18px_rgb(16_42_67/0.08)] ${isRead ? "" : "border-brand-300"}`}
                >
                  <article className="flex gap-3 p-4 sm:px-5">
                    <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${isRead ? "bg-slate-100 text-muted" : "bg-brand-100 text-brand-800"}`}>
                      <Icon name="bell" size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="m-0 text-sm font-bold text-brand-900">{tr("Banteay Digital")}</p>
                            {!isRead ? <span className="h-2 w-2 shrink-0 rounded-full bg-brand-700" aria-label={tr("Unread")} /> : null}
                          </div>
                          <h2 className={`m-0 mt-0.5 text-sm text-ink ${isRead ? "font-semibold" : "font-bold"}`}>
                            {alert.title}
                          </h2>
                        </div>
                        <time className="shrink-0 text-xs text-muted" dateTime={alert.publishedAt}>
                          {dateLabel(alert.publishedAt)}
                        </time>
                      </div>
                      <p className={`mb-0 mt-1.5 whitespace-pre-wrap wrap-break-word text-sm leading-5 text-muted ${isExpanded ? "" : "line-clamp-2"}`}>
                        {alert.content}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        {hasLongContent ? (
                          <button
                            className="text-sm font-semibold text-brand-800 hover:text-brand-700"
                            onClick={() => toggleExpanded(alert.id)}
                            type="button"
                            aria-expanded={isExpanded}
                          >
                            {tr(isExpanded ? "Show less" : "Read more")}
                          </button>
                        ) : null}
                        <button
                          aria-pressed={isRead}
                          className="text-sm font-semibold text-muted hover:text-brand-800"
                          onClick={() => toggleRead(alert.id)}
                          type="button"
                        >
                          {tr(isRead ? "Mark as unread" : "Mark as read")}
                        </button>
                      </div>
                    </div>
                  </article>
                </Card>
              );
            })}
          </div>
        {visibleAlerts.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted">{tr("No notifications match this filter.")}</Card>
        ) : null}
        </>
      ) : null}

      {!loading && !error && alerts.length === 0 ? (
        <Card className="p-10 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-brand-800">
            <Icon name="bell" size={25} />
          </span>
          <h2 className="mb-1 mt-4 text-lg">{tr("No alerts right now")}</h2>
          <p className="m-0 text-sm text-muted">
            {tr("New messages from Banteay Digital will appear here.")}
          </p>
        </Card>
      ) : null}
    </main>
  );
}
