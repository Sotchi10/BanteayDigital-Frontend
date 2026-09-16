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
import { deleteScan, listScans } from "../../services/scans";
import { markScanHistorySeen } from "../../services/scanHistoryNotifications";
import { useAuth } from "../../state/AuthStore";

const riskFor = (assessment) =>
  assessment === "STRONG_SCAM_INDICATORS"
    ? "High"
    : assessment === "SUSPICIOUS" || assessment === "CAUTION"
      ? "Medium"
      : assessment === "NO_STRONG_WARNING_SIGNS"
        ? "Low"
        : "Unknown";
const toneFor = (risk) =>
  risk === "High" ? "high" : risk === "Medium" ? "medium" : risk === "Low" ? "low" : "neutral";
const typeLabel = (type) =>
  type === "URL" ? "Website link" : type === "IMAGE" ? "Image" : "Text message";
const dateLabel = (date) =>
  new Intl.DateTimeFormat(appI18n.resolvedLanguage, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

export function ScanHistoryPage() {
  const tr = useInterfaceTranslation();
  const { user } = useAuth();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [riskFilterOpen, setRiskFilterOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedScanIds, setSelectedScanIds] = useState(() => new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await listScans();
        if (active) {
          const nextScans = response.scans || [];
          setScans(nextScans);
          markScanHistorySeen(user?.id, nextScans);
        }
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
  }, [user?.id]);

  const visibleScans = scans
    .filter((scan) => {
      if (statusFilter === "ALL") return true;
      return statusFilter === "REPORTED"
        ? scan.reportStatus === "REPORTED"
        : scan.reportStatus !== "REPORTED";
    })
    .filter(
      (scan) => riskFilter === "ALL" || riskFor(scan.assessment) === riskFilter,
    );

  const allVisibleScansSelected =
    visibleScans.length > 0 &&
    visibleScans.every((scan) => selectedScanIds.has(scan.id));

  const toggleScanSelection = (scanId) => {
    setDeleteError("");
    setSelectedScanIds((current) => {
      const next = new Set(current);
      if (next.has(scanId)) next.delete(scanId);
      else next.add(scanId);
      return next;
    });
  };

  const toggleAllVisibleScans = () => {
    setDeleteError("");
    setSelectedScanIds((current) => {
      const next = new Set(current);
      if (allVisibleScansSelected) visibleScans.forEach((scan) => next.delete(scan.id));
      else visibleScans.forEach((scan) => next.add(scan.id));
      return next;
    });
  };

  const confirmDeletion = async () => {
    const ids = [...selectedScanIds];
    if (!ids.length || deleting) return;

    setDeleting(true);
    setDeleteError("");
    const results = await Promise.allSettled(ids.map((id) => deleteScan(id)));
    const deletedIds = ids.filter((_, index) => results[index].status === "fulfilled");
    const failedIds = ids.filter((_, index) => results[index].status === "rejected");

    if (deletedIds.length) {
      setScans((current) => current.filter((scan) => !deletedIds.includes(scan.id)));
    }
    setSelectedScanIds(new Set(failedIds));
    setDeleteConfirmOpen(false);
    if (failedIds.length) {
      setDeleteError(tr("Could not delete selected scans. Please try again."));
    }
    setDeleting(false);
  };

  return (
    <main className="min-w-0 lg:px-6" id="main-content">
      <div className="mb-6">
        <div className="mt-4 flex items-start justify-between gap-2">
          <div
            role="tablist"
            aria-label={tr("Scan status")}
            className="flex min-w-0 flex-1 overflow-x-auto"
          >
            {[
              ["ALL", "All"],
              ["NOT_REPORTED", "Not reported"],
              ["REPORTED", "Reported"],
            ].map(([value, label]) => {
              const selected = statusFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setStatusFilter(value)}
                  className={`feature-tab relative shrink-0 min-h-10 px-3 text-[12px] font-semibold transition-colors sm:px-4 ${selected ? "text-brand-800" : "text-muted hover:text-brand-800"}`}
                >
                  {tr(label)}
                  {selected ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand-800 sm:inset-x-4"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-label={tr(selectionMode ? "Stop selecting scans" : "Select scans")}
              aria-pressed={selectionMode}
              onClick={() => {
                setSelectionMode((active) => !active);
                setSelectedScanIds(new Set());
                setDeleteError("");
              }}
              className={`grid h-10 w-10 place-items-center rounded-lg border transition ${selectionMode ? "border-transparent bg-brand-100 text-brand-800" : "border-line bg-white text-muted hover:border-brand-200 hover:text-brand-800"}`}
            >
              <Icon name="select" size={17} />
            </button>
            <div className="relative">
            <button
              type="button"
              aria-label={tr("Filter scans")}
              aria-expanded={riskFilterOpen}
              onClick={() => setRiskFilterOpen((open) => !open)}
              className={`relative grid h-10 w-10 place-items-center rounded-lg border transition ${riskFilterOpen || riskFilter !== "ALL" ? "border-brand-200 bg-brand-100 text-brand-800" : "border-line bg-white text-muted hover:border-brand-200 hover:text-brand-800"}`}
            >
              <Icon name="filter" size={17} />
              {riskFilter !== "ALL" ? (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-800" />
              ) : null}
            </button>
            {riskFilterOpen ? (
              <div className="absolute left-0 z-20 mt-1 w-40 rounded-lg border border-line bg-white p-1.5 shadow-lg">
                {["ALL", "High", "Medium", "Low", "Unknown"].map((risk) => (
                  <button
                    key={risk}
                    type="button"
                    onClick={() => {
                      setRiskFilter(risk);
                      setRiskFilterOpen(false);
                    }}
                    className={`flex min-h-9 w-full items-center justify-between rounded-md px-2.5 text-left text-sm font-medium ${riskFilter === risk ? "bg-brand-100 text-brand-800" : "text-black hover:bg-surface"}`}
                  >
                    {tr(risk)}
                    {riskFilter === risk ? (
                      <Icon name="check" size={15} />
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
            </div>
          </div>
        </div>
        {selectionMode ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-brand-50 p-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-brand-900">
              <input
                type="checkbox"
                checked={allVisibleScansSelected}
                onChange={toggleAllVisibleScans}
                className="h-4 w-4 accent-[#0c4698]"
              />
              {tr("Select all")}
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">
                {tr("{{count}} selected", { count: selectedScanIds.size })}
              </span>
              <button
                type="button"
                disabled={!selectedScanIds.size}
                onClick={() => setDeleteConfirmOpen(true)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-risk-high px-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="trash" size={16} />
                {tr("Delete selected")}
              </button>
            </div>
          </div>
        ) : null}
        {deleteError ? (
          <p className="mb-0 mt-3 text-sm font-semibold text-risk-high" role="alert">
            {deleteError}
          </p>
        ) : null}
      </div>
      {loading ? (
        <LoadingState message={tr("Loading your scan history…")} />
      ) : null}
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
          message={tr(
            "When you analyze a suspicious message, link, or image, it will appear here.",
          )}
          actionLabel={tr("Analyze something")}
          actionTo="/analysis"
        />
      ) : null}
      {!loading && !error && scans.length > 0 && visibleScans.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="m-0 text-sm text-muted">
            {tr(
              riskFilter !== "ALL" || statusFilter === "ALL"
                ? "No scans match these filters."
                : statusFilter === "REPORTED"
                  ? "No reported scans yet."
                  : "No unreported scans yet.",
            )}
          </p>
        </Card>
      ) : null}
      {!loading && !error && visibleScans.length > 0 ? (
        <Card className="overflow-hidden">
          <ul className="m-0 divide-y divide-line p-0">
            {visibleScans.map((scan) => {
              const risk = riskFor(scan.assessment);
              return (
                <li
                  key={scan.id}
                  className={`grid gap-3 p-4 sm:items-center sm:p-5 ${selectionMode ? "sm:grid-cols-[auto_auto_1fr_auto]" : "sm:grid-cols-[auto_1fr_auto]"}`}
                >
                  {selectionMode ? (
                    <input
                      type="checkbox"
                      aria-label={tr("Select scan")}
                      checked={selectedScanIds.has(scan.id)}
                      onChange={() => toggleScanSelection(scan.id)}
                      className="h-4 w-4 accent-[#0c4698]"
                    />
                  ) : null}
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
                      <Badge tone={toneFor(risk)}>
                        {tr("{{level}} risk", { level: tr(risk) })}
                      </Badge>
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
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/history/${scan.id}`}
                      className="inline-flex min-h-10 items-center justify-center rounded-lg bg-white px-3 text-sm font-medium text-brand-800 hover:bg-brand-100"
                    >
                      {tr("View detail")}
                    </Link>
                    {scan.reportStatus !== "REPORTED" ? (
                      <Link
                        to={`/report?scan=${encodeURIComponent(scan.id)}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-800 px-3 text-sm font-medium text-white hover:bg-brand-700"
                      >
                        {tr("Report")}
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}
      {deleteConfirmOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#071a33]/55 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) setDeleteConfirmOpen(false);
          }}
        >
          <section
            aria-modal="true"
            aria-labelledby="delete-scans-title"
            className="w-full max-w-sm rounded-xl border border-line bg-white p-5 shadow-2xl"
            role="dialog"
          >
            <h2 id="delete-scans-title" className="m-0 text-lg font-bold text-brand-900">
              {tr("Delete selected scans?")}
            </h2>
            <p className="mb-0 mt-2 text-sm leading-6 text-muted">
              {tr("This will permanently delete {{count}} scan(s). This action cannot be undone.", { count: selectedScanIds.size })}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteConfirmOpen(false)}
                className="min-h-10 rounded-lg border border-line bg-white px-4 text-sm font-bold text-brand-800 hover:bg-brand-100 disabled:opacity-60"
              >
                {tr("Cancel")}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeletion}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-risk-high px-4 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
              >
                <Icon name="trash" size={16} />
                {deleting ? tr("Deleting…") : tr("Delete selected")}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
