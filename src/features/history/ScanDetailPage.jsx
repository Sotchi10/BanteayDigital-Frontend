import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Card, Icon } from "../../components/ui";
import { getScan } from "../../services/scans";

const riskFor = (assessment) => assessment === "STRONG_SCAM_INDICATORS" ? "High" : assessment === "SUSPICIOUS" || assessment === "CAUTION" ? "Medium" : "Low";
const toneFor = (risk) => risk === "High" ? "high" : risk === "Medium" ? "medium" : "low";
const typeLabel = (type) => type === "URL" ? "Website link" : type === "IMAGE" ? "Image" : "Text message";
const dateLabel = (date) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));

export function ScanDetailPage() {
  const { scanId } = useParams();
  const [scan, setScan] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await getScan(scanId);
        if (active) setScan(response.scan);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || requestError.response?.data?.error || "We could not load this scan.");
      }
    };
    load();
    return () => { active = false; };
  }, [scanId]);

  if (!scan && !error) return <main className="min-w-0 px-5 py-5 sm:px-8" id="main-content"><Card className="grid place-items-center p-10 text-center" role="status" aria-live="polite"><span className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-800" /><p className="mb-0 mt-4 text-sm text-muted">Loading scan details…</p></Card></main>;
  if (error) return <main className="min-w-0 px-5 py-5 sm:px-8" id="main-content"><Card className="p-8 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#fff0f1] text-risk-high"><Icon name="alert" size={23} /></span><h1 className="mb-1 mt-4 text-xl font-bold text-brand-900">Could not load scan</h1><p className="mb-0 text-sm text-muted" role="alert">{error}</p><Link to="/history" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-brand-800 px-5 text-sm font-bold text-white">Back to history</Link></Card></main>;

  const risk = riskFor(scan.assessment);
  const findings = Array.isArray(scan.findings) ? scan.findings : [];
  const reasons = scan.analysis?.reasons || [];
  const actions = scan.analysis?.recommendedActions || scan.recommendations || [];
  return <main className="min-w-0 px-5 py-5 sm:px-8" id="main-content"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">Your scan</p><h1 className="mb-1 mt-1 text-2xl font-bold text-brand-900">Scan details</h1><p className="m-0 text-sm text-muted">{typeLabel(scan.inputType)} · {dateLabel(scan.createdAt)}</p></div><Link to="/history" className="inline-flex min-h-10 items-center rounded-lg border border-line bg-white px-3 text-sm font-bold text-brand-800 hover:bg-brand-100">Back to history</Link></div>
    <Card className="border-[#cbdcf0] bg-[#f8fbff] p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="m-0 text-base font-bold text-brand-900">Assessment</h2><Badge tone={toneFor(risk)}>{risk} risk</Badge></div><p className="mb-0 mt-3 break-words rounded-lg bg-white p-3 font-mono text-xs leading-5 text-[#40546b]">{scan.normalizedInput || scan.rawInput}</p><p className="mb-0 mt-3 text-sm leading-6 text-muted">{scan.analysis?.summary || scan.analysisSummary || "No additional analysis summary is available."}</p></Card>
    <div className="mt-4 grid gap-4 lg:grid-cols-2"><Card className="p-5"><h2 className="m-0 flex items-center gap-2 text-base font-bold text-brand-900"><Icon name="alert" size={18} />Detected indicators</h2>{findings.length || reasons.length ? <ul className="mb-0 mt-3 grid gap-2 pl-5 text-sm leading-6 text-muted">{(reasons.length ? reasons : findings.map((finding) => finding.message || finding.code)).map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p className="mb-0 mt-3 text-sm text-muted">No specific indicators were recorded.</p>}</Card><Card className="p-5"><h2 className="m-0 flex items-center gap-2 text-base font-bold text-brand-900"><Icon name="shield" size={18} />Recommended actions</h2>{actions.length ? <ul className="mb-0 mt-3 grid gap-2 pl-5 text-sm leading-6 text-muted">{actions.map((action, index) => <li key={`${action}-${index}`}>{action}</li>)}</ul> : <p className="mb-0 mt-3 text-sm text-muted">No additional recommendations were recorded.</p>}</Card></div>
  </main>;
}
