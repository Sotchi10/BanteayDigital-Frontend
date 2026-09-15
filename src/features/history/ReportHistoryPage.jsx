import appI18n from "../../i18n";
import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { useEffect, useState } from "react";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
} from "../../components/ui";
import { listReports } from "../../services/reports";

const statusTone = (status) =>
  status === "APPROVED" ? "low" : status === "REJECTED" ? "high" : "medium";
const statusLabel = (status) =>
  status ? `${status[0]}${status.slice(1).toLowerCase()}` : "Pending";
const scanType = (scan) =>
  scan?.inputType === "URL"
    ? "Website link"
    : scan?.inputType === "IMAGE"
      ? "Image scan"
      : "Text scan";
const dateLabel = (date) =>
  new Intl.DateTimeFormat(appI18n.resolvedLanguage, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

export function ReportHistoryPage() {
  const tr = useInterfaceTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await listReports();
        if (active) setReports(response.reports || []);
      } catch (requestError) {
        if (active)
          setError({
            message:
              requestError.response?.data?.message ||
              requestError.response?.data?.error ||
              "We could not load your report history. Please try again.",
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

  const visibleReports = reports.filter(
    (report) => statusFilter === "ALL" || report.status === statusFilter,
  );

  return (
    <main className="min-w-0 lg:px-6" id="main-content">
      <div className="mb-6">
        <div
          className="mt-4 flex items-center justify-between border-b border-line"
          role="tablist"
          aria-label={tr("Report history")}
        >
          <span
            role="tab"
            aria-selected="true"
            className="-mb-px inline-flex min-h-10 items-center border-b-2 border-brand-800 px-4 text-sm font-bold text-brand-800"
          >
            {tr("Your reports")}
          </span>
          <div className="relative mb-1">
            <button
              type="button"
              aria-label={tr("Filter reports")}
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((open) => !open)}
              className={`relative grid h-10 w-10 place-items-center rounded-lg border transition ${filterOpen || statusFilter !== "ALL" ? "border-brand-200 bg-brand-100 text-brand-800" : "border-line bg-white text-muted hover:border-brand-200 hover:text-brand-800"}`}
            >
              <Icon name="filter" size={17} />
              {statusFilter !== "ALL" ? (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-800" />
              ) : null}
            </button>
            {filterOpen ? (
              <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-line bg-white p-1.5 shadow-lg">
                {[["ALL", "All reports"], ["APPROVED", "Approved"], ["REJECTED", "Rejected"]].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(value);
                      setFilterOpen(false);
                    }}
                    className={`flex min-h-9 w-full items-center justify-between rounded-md px-2.5 text-left text-sm font-medium ${statusFilter === value ? "bg-brand-100 text-brand-800" : "text-muted hover:bg-surface"}`}
                  >
                    {tr(label)}
                    {statusFilter === value ? <Icon name="check" size={15} /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {loading ? (
        <LoadingState message={tr("Loading your submitted reports…")} />
      ) : null}
      {!loading && error ? (
        <ErrorState
          title={tr("Could not load report history")}
          message={tr(error.message)}
          status={error.status}
          onRetry={() => window.location.reload()}
        />
      ) : null}
      {!loading && !error && reports.length === 0 ? (
        <EmptyState
          icon="edit"
          title={tr("No submitted reports yet")}
          message={tr(
            "Reports you submit after an analysis will appear here for you to track.",
          )}
          actionLabel={tr("Analyze something")}
          actionTo="/analysis"
        />
      ) : null}
      {!loading && !error && reports.length > 0 && visibleReports.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="m-0 text-sm text-muted">
            {tr("No reports match this filter.")}
          </p>
        </Card>
      ) : null}
      {!loading && !error && visibleReports.length > 0 ? (
        <Card className="overflow-hidden">
          <ul className="m-0 divide-y divide-line p-0">
            {visibleReports.map((report) => (
              <li
                key={report.id}
                className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-brand-800">
                  <Icon name="edit" size={18} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm text-black">
                      {report.reason || report.title || tr("Scam report")}
                    </strong>
                    <Badge tone={statusTone(report.status)}>
                      {tr(statusLabel(report.status))}
                    </Badge>
                  </div>
                  <p className="mb-0 mt-1 truncate text-sm text-muted">
                    {tr("Related scan:")} {tr(scanType(report.scan))}
                    {report.scan?.normalizedInput
                      ? ` — ${report.scan.normalizedInput}`
                      : ""}
                  </p>
                  <p className="mb-0 mt-1 text-xs text-muted">
                    {tr("Submitted")} {dateLabel(report.createdAt)}
                  </p>
                </div>
                <span className="text-xs font-semibold text-muted">
                  {report.scan ? tr("Linked to scan") : tr("Scan unavailable")}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </main>
  );
}
