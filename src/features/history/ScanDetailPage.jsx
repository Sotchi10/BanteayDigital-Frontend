import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Icon } from "../../components/ui";
import { getScan } from "../../services/scans";

const riskFor = (assessment) =>
  assessment === "STRONG_SCAM_INDICATORS"
    ? "High"
    : assessment === "SUSPICIOUS" || assessment === "CAUTION"
      ? "Medium"
      : assessment === "NO_STRONG_WARNING_SIGNS"
        ? "Low"
        : "Unknown";
export function ScanDetailPage() {
  const tr = useInterfaceTranslation();
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
        if (active)
          setError(
            requestError.response?.data?.message ||
              requestError.response?.data?.error ||
              "We could not load this scan.",
          );
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [scanId]);

  if (!scan && !error)
    return (
      <main className="min-w-0 px-5 py-5 sm:px-8" id="main-content">
        <Card
          className="grid place-items-center p-10 text-center"
          role="status"
          aria-live="polite"
        >
          <span className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-800" />
          <p className="mb-0 mt-4 text-sm text-muted">
            {tr("Loading scan details…")}
          </p>
        </Card>
      </main>
    );
  if (error)
    return (
      <main className="min-w-0 px-5 py-5 sm:px-8" id="main-content">
        <Card className="p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#fff0f1] text-risk-high">
            <Icon name="alert" size={23} />
          </span>
          <h1 className="mb-1 mt-4 text-xl font-bold text-brand-900">
            {tr("Could not load scan")}
          </h1>
          <p className="mb-0 text-sm text-muted" role="alert">
            {tr(error)}
          </p>
          <Link
            to="/history"
            className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-brand-800 px-5 text-sm font-bold text-white"
          >
            {tr("Back to history")}
          </Link>
        </Card>
      </main>
    );

  const risk = riskFor(scan.assessment);
  const findings = Array.isArray(scan.findings) ? scan.findings : [];
  const reasons = scan.analysis?.reasons || [];
  const actions =
    scan.analysis?.recommendedActions || scan.recommendations || [];
  const indicators = reasons.length
    ? reasons
    : findings.map((finding) => finding.message || finding.code);
  const summary =
    scan.analysis?.summary ||
    scan.analysisSummary ||
    tr("No additional analysis summary is available.");
  return (
    <main className="mx-auto min-w-0 max-w-5xl lg:px-6" id="main-content">
      <div className="mb-5">
        <Link
          to="/history"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-1 text-sm font-bold text-brand-800 hover:text-brand-700"
        >
          <Icon name="chevron" size={16} className="rotate-180" />
          {tr("Back to history")}
        </Link>
        
      </div>
      <Card className="overflow-hidden border-[#cbdcf0] bg-[#f8fbff]">
        <div className="p-5 sm:p-6">
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">
              {tr("Assessment")}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className={`grid h-11 w-11 place-items-center rounded-full ${risk === "High" ? "bg-[#fff0f1] text-risk-high" : risk === "Medium" ? "bg-[#fff7e6] text-risk-medium" : risk === "Low" ? "bg-[#eaf8f3] text-risk-low" : "bg-[#f2f4f7] text-muted"}`}>
                <Icon name={risk === "Low" ? "shield" : "alert"} size={21} />
              </span>
              <div>
                <h2 className="m-0 text-xl font-bold text-brand-900">
                  {tr("{{level}} risk", { level: tr(risk) })}
                </h2>
                <p className="mb-0 mt-0.5 text-sm text-muted">
                  {summary}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="m-0 flex items-center gap-2 text-base font-bold text-brand-900">
            <Icon name="alert" size={18} />
            {tr("Detected indicators")}
          </h2>
          <p className="mb-0 mt-1 text-sm text-muted">
            {tr("Signals found during this scan")}
          </p>
          {indicators.length ? (
            <ol className="mb-0 mt-4 grid gap-3 p-0">
              {indicators.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-6 text-muted">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#fff0f1] text-xs font-bold text-risk-high">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mb-0 mt-4 rounded-lg bg-surface p-3 text-sm leading-6 text-muted">
              {tr("No specific indicators were recorded.")}
            </p>
          )}
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="m-0 flex items-center gap-2 text-base font-bold text-brand-900">
            <Icon name="shield" size={18} />
            {tr("Recommended actions")}
          </h2>
          <p className="mb-0 mt-1 text-sm text-muted">
            {tr("Steps you can take now")}
          </p>
          {actions.length ? (
            <ol className="mb-0 mt-4 grid gap-3 p-0">
              {actions.map((action, index) => (
                <li key={`${action}-${index}`} className="flex gap-3 text-sm leading-6 text-muted">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                    {index + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mb-0 mt-4 rounded-lg bg-surface p-3 text-sm leading-6 text-muted">
              {tr("No additional recommendations were recorded.")}
            </p>
          )}
        </Card>
      </div>
      <Card className="mt-4 overflow-hidden">
        <div className="border-b border-line bg-[#fbfcfe] px-5 py-4 sm:px-6">
          <h2 className="m-0 text-base font-bold text-brand-900">
            {tr("Scanned content")}
          </h2>
          <p className="mb-0 mt-1 text-sm text-muted">
            {tr("The content that was analyzed")}
          </p>
        </div>
        <p className="m-0 max-h-72 overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-6 text-[#40546b] sm:p-6">
          {scan.normalizedInput || scan.rawInput}
        </p>
      </Card>
      {scan.reportStatus !== "REPORTED" ? (
        <div className="mt-5 flex justify-end">
          <Link
            to="/report"
            state={{ scanId: scan.id }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 text-sm font-bold text-white hover:bg-brand-700"
          >
            <Icon name="edit" size={17} />
            {tr("Report this scan")}
          </Link>
        </div>
      ) : null}
    </main>
  );
}
