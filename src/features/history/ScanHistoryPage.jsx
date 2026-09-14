import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Card, Icon } from "../../components/ui";
import { listScans } from "../../services/scans";

const riskFor = (assessment) => assessment === "STRONG_SCAM_INDICATORS" ? "High" : assessment === "SUSPICIOUS" || assessment === "CAUTION" ? "Medium" : "Low";
const toneFor = (risk) => risk === "High" ? "high" : risk === "Medium" ? "medium" : "low";
const typeLabel = (type) => type === "URL" ? "Website link" : type === "IMAGE" ? "Image" : "Text message";
const dateLabel = (date) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));

function LoadingState() {
  return <Card className="grid place-items-center p-10 text-center" role="status" aria-live="polite"><span className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-800" /><p className="mb-0 mt-4 text-sm text-muted">Loading your scan history…</p></Card>;
}

function EmptyState() {
  return <Card className="p-10 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-100 text-brand-800"><Icon name="clock" size={26} /></span><h2 className="mb-1 mt-4 text-xl font-bold text-brand-900">No scans yet</h2><p className="mx-auto mb-0 max-w-md text-sm leading-6 text-muted">When you analyze a suspicious message, link, or image, it will appear here.</p><Link to="/analysis" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-brand-800 px-5 text-sm font-bold text-white hover:bg-brand-700">Analyze something</Link></Card>;
}

export function ScanHistoryPage() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await listScans();
        if (active) setScans(response.scans || []);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || requestError.response?.data?.error || "We could not load your scan history. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  return <main className="min-w-0 px-5 py-5 sm:px-8" id="main-content"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">Your activity</p><h1 className="mb-1 mt-1 text-2xl font-bold text-brand-900">Scan history</h1><p className="m-0 text-sm text-muted">Review your previous scam analyses.</p></div><Link to="/reports/history" className="inline-flex min-h-10 items-center rounded-lg border border-line bg-white px-3 text-sm font-bold text-brand-800 hover:bg-brand-100">View reports</Link></div>
    {loading ? <LoadingState /> : null}
    {!loading && error ? <Card className="p-6 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#fff0f1] text-risk-high"><Icon name="alert" size={23} /></span><h2 className="mb-1 mt-4 text-lg font-bold text-brand-900">Could not load scan history</h2><p className="mb-0 text-sm text-muted" role="alert">{error}</p><button type="button" onClick={() => window.location.reload()} className="mt-5 min-h-11 rounded-lg bg-brand-800 px-5 text-sm font-bold text-white hover:bg-brand-700">Try again</button></Card> : null}
    {!loading && !error && scans.length === 0 ? <EmptyState /> : null}
    {!loading && !error && scans.length > 0 ? <Card className="overflow-hidden"><ul className="m-0 divide-y divide-line p-0">{scans.map((scan) => { const risk = riskFor(scan.assessment); return <li key={scan.id} className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-5"><span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-brand-800"><Icon name={scan.inputType === "URL" ? "link" : scan.inputType === "IMAGE" ? "image" : "message"} size={18} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-brand-900">{typeLabel(scan.inputType)}</strong><Badge tone={toneFor(risk)}>{risk} risk</Badge>{scan.reportStatus === "REPORTED" ? <Badge tone="neutral">Reported</Badge> : null}</div><p className="mb-0 mt-1 truncate text-sm text-muted">{scan.normalizedInput || scan.rawInput}</p><p className="mb-0 mt-1 text-xs text-muted">{dateLabel(scan.createdAt)}</p></div><Link to={`/history/${scan.id}`} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line bg-white px-3 text-sm font-bold text-brand-800 hover:bg-brand-100">View detail</Link></li>; })}</ul></Card> : null}
  </main>;
}
