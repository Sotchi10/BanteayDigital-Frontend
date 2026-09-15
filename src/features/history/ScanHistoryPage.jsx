import appI18n from "../../i18n";
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
import { listScans } from "../../services/scans";

const riskFor = (assessment) =>
  assessment === "STRONG_SCAM_INDICATORS"
    ? "High"
    : assessment === "SUSPICIOUS" || assessment === "CAUTION"
      ? "Medium"
      : "Low";
const toneFor = (risk) =>
  risk === "High" ? "high" : risk === "Medium" ? "medium" : "low";
const typeLabel = (type) =>
  type === "URL" ? "Website link" : type === "IMAGE" ? "Image" : "Text message";
const dateLabel = (date) =>
  new Intl.DateTimeFormat(appI18n.resolvedLanguage, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

export function ScanHistoryPage() {
  const tr = useInterfaceTranslation();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await listScans();
        if (active) setScans(response.scans || []);
      } catch (requestError) {
        if (active)
          setError({
            message:
              requestError.response?.data?.message ||
              requestError.response?.data?.error ||
              "We could not load your scan history. Please try again.",
            status: requestError.response?.status,
          });
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-w-0 lg:px-10" id="main-content">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">{tr("Your activity")}</p>
          <h1 className="mb-1 mt-1 text-2xl font-bold text-brand-900">{tr("Scan history")}</h1>
          <p className="m-0 text-sm text-muted">{tr("Review your previous scam analyses.")}</p>
        </div>
        <Link
          to="/reports/history"
          className="inline-flex min-h-10 items-center rounded-lg border border-line bg-white px-3 text-sm font-bold text-brand-800 hover:bg-brand-100"
        >{tr("View reports")}</Link>
      </div>
      {loading ? <LoadingState message={tr("Loading your scan history…")} /> : null}
      {!loading && error ? (
        <ErrorState
          title={tr("Could not load scan history")}
          message={tr(error.message)}
          status={error.status}
          onRetry={() => window.location.reload()}
        />
      ) : null}
      {!loading && !error && scans.length === 0 ? (
        <EmptyState
          icon="clock"
          title={tr("No scans yet")}
          message={tr("When you analyze a suspicious message, link, or image, it will appear here.")}
          actionLabel={tr("Analyze something")}
          actionTo="/analysis"
        />
      ) : null}
      {!loading && !error && scans.length > 0 ? (
        <Card className="overflow-hidden">
          <ul className="m-0 divide-y divide-line p-0">
            {scans.map((scan) => {
              const risk = riskFor(scan.assessment);
              return (
                <li
                  key={scan.id}
                  className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-5"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-brand-800">
                    <Icon
                      name={
                        scan.inputType === "URL"
                          ? "link"
                          : scan.inputType === "IMAGE"
                            ? "image"
                            : "message"
                      }
                      size={18}
                    />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm text-brand-900">
                        {tr(typeLabel(scan.inputType))}
                      </strong>
                      <Badge tone={toneFor(risk)}>{tr("{{level}} risk", { level: tr(risk) })}</Badge>
                      {scan.reportStatus === "REPORTED" ? (
                        <Badge tone="neutral">{tr("Reported")}</Badge>
                      ) : null}
                    </div>
                    <p className="mb-0 mt-1 truncate text-sm text-muted">
                      {scan.normalizedInput || scan.rawInput}
                    </p>
                    <p className="mb-0 mt-1 text-xs text-muted">
                      {dateLabel(scan.createdAt)}
                    </p>
                  </div>
                  <Link
                    to={`/history/${scan.id}`}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line bg-white px-3 text-sm font-bold text-brand-800 hover:bg-brand-100"
                  >{tr("View detail")}</Link>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}
    </main>
  );
}
