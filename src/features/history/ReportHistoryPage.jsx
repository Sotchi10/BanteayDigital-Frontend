import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Card, EmptyState, ErrorState, Icon, LoadingState } from "../../components/ui";
import { listReports } from "../../services/reports";

const statusTone = (status) => status === "APPROVED" ? "low" : status === "REJECTED" ? "high" : "medium";
const statusLabel = (status) => status ? `${status[0]}${status.slice(1).toLowerCase()}` : "Pending";
const scanType = (scan) => scan?.inputType === "URL" ? "Website link" : scan?.inputType === "IMAGE" ? "Image scan" : "Text scan";
const dateLabel = (date) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));

export function ReportHistoryPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await listReports();
        if (active) setReports(response.reports || []);
      } catch (requestError) {
        if (active) setError({ message: requestError.response?.data?.message || requestError.response?.data?.error || "We could not load your report history. Please try again.", status: requestError.response?.status });
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  return <main className="min-w-0 px-5 py-5 sm:px-8" id="main-content"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">Your activity</p><h1 className="mb-1 mt-1 text-2xl font-bold text-brand-900">Report history</h1><p className="m-0 text-sm text-muted">Track reports you have submitted for review.</p></div><Link to="/history" className="inline-flex min-h-10 items-center rounded-lg border border-line bg-white px-3 text-sm font-bold text-brand-800 hover:bg-brand-100">View scans</Link></div>
    {loading ? <LoadingState message="Loading your submitted reports…" /> : null}
    {!loading && error ? <ErrorState title="Could not load report history" message={error.message} status={error.status} onRetry={() => window.location.reload()} /> : null}
    {!loading && !error && reports.length === 0 ? <EmptyState icon="edit" title="No submitted reports yet" message="Reports you submit after an analysis will appear here for you to track." actionLabel="Analyze something" actionTo="/analysis" /> : null}
    {!loading && !error && reports.length > 0 ? <Card className="overflow-hidden"><ul className="m-0 divide-y divide-line p-0">{reports.map((report) => <li key={report.id} className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-5"><span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-brand-800"><Icon name="edit" size={18} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-brand-900">{report.reason || report.title || "Scam report"}</strong><Badge tone={statusTone(report.status)}>{statusLabel(report.status)}</Badge></div><p className="mb-0 mt-1 truncate text-sm text-muted">Related scan: {scanType(report.scan)}{report.scan?.normalizedInput ? ` — ${report.scan.normalizedInput}` : ""}</p><p className="mb-0 mt-1 text-xs text-muted">Submitted {dateLabel(report.createdAt)}</p></div><span className="text-xs font-semibold text-muted">{report.scan ? "Linked to scan" : "Scan unavailable"}</span></li>)}</ul></Card> : null}
  </main>;
}
