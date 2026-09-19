import { useEffect, useState } from "react";
import { Badge, Card, Icon } from "../../components/ui";
import appI18n from "../../i18n";
import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { listAlerts } from "./api/alertsApi";

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

  return (
    <main className="min-w-0 lg:px-6" id="main-content">
      <header className="mb-6 overflow-hidden rounded-2xl bg-brand-900 px-5 py-6 text-white shadow-sm sm:px-7">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15">
            <Icon name="bell" size={24} />
          </span>
          <div>
            <h1 className="m-0 text-2xl font-black tracking-tight">{tr("Alerts")}</h1>
            <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              {tr("Official announcements and time-sensitive updates from Banteay Digital.")}
            </p>
          </div>
        </div>
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
        <div className="grid gap-4">
          {alerts.map((alert, index) => (
            <Card
              key={alert.id}
              className={`overflow-hidden p-0 ${index === 0 ? "border-brand-300 shadow-[0_8px_28px_rgb(1_36_117/0.08)]" : ""}`}
            >
              <article className="relative px-5 py-5 sm:px-6">
                {index === 0 ? <span className="absolute inset-y-0 left-0 w-1 bg-brand-700" /> : null}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge tone="blue">
                    <Icon name="bell" size={13} />
                    {tr("Official alert")}
                  </Badge>
                  <time className="community-meta" dateTime={alert.publishedAt}>
                    {dateLabel(alert.publishedAt)}
                  </time>
                </div>
                <h2 className="community-post-title mb-0 mt-4 wrap-break-word text-brand-900">
                  {alert.title}
                </h2>
                <p className="community-body mb-0 mt-3 whitespace-pre-wrap wrap-break-word text-ink">
                  {alert.content}
                </p>
              </article>
            </Card>
          ))}
        </div>
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
