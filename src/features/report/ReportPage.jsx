import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Badge, Card, Icon } from "../../components/ui";
import { createReportFromScan } from "../../services/reports";

const toneFor = (risk) =>
  risk === "High" ? "high" : risk === "Medium" ? "medium" : "low";

function AnalysisRequired() {
  const tr = useInterfaceTranslation();
  return (
    <main className="min-w-0" id="main-content">
      <Card className="mx-auto max-w-2xl p-7 text-center sm:p-9">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-brand-800">
          <Icon name="shield" size={26} />
        </span>
        <p className="mb-0 mt-4 text-xs font-bold uppercase tracking-wide text-brand-700">{tr("Analysis required")}</p>
        <h1 className="mb-2 mt-1 text-2xl font-bold text-brand-900">{tr("Analyze the content before reporting")}</h1>
        <p className="m-0 text-sm leading-6 text-muted">{tr("Reports are linked to an analysis result so the suspicious text or URL and its assessment can carry over accurately.")}</p>
        <Link
          to="/analysis"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-800 px-5 text-sm font-bold text-white hover:bg-brand-700"
        >
          <Icon name="shield" size={17} />{tr("Analyze scam")}</Link>
      </Card>
    </main>
  );
}

function SubmissionDialog() {
  const tr = useInterfaceTranslation();
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#071a33]/55 p-4"
      role="presentation"
    >
      <section
        className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 text-center shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-title"
        aria-live="polite"
      >
        <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-800" />
        <h2
          id="submission-title"
          className="mb-1 mt-4 text-xl font-bold text-brand-900"
        >{tr("Report is being submitted")}</h2>
        <p className="m-0 text-sm leading-6 text-muted">{tr("Please wait while we submit your report for review.")}</p>
      </section>
    </div>
  );
}

export function ReportPage() {
  const tr = useInterfaceTranslation();
  const { state } = useLocation();
  const navigate = useNavigate();
  const analysis = state?.analysis;
  const [context, setContext] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!analysis?.id || !analysis?.analysis || !analysis?.normalizedInput)
    return <AnalysisRequired />;
  if (submitted)
    return (
      <main className="min-w-0 lg:px-10" id="main-content">
        <Card className="mx-auto max-w-2xl p-7 text-center sm:p-9">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eaf8f3] text-risk-low">
            <Icon name="check" size={28} />
          </span>
          <p className="mb-0 mt-4 text-xs font-bold uppercase tracking-wide text-risk-low">{tr("Report submitted")}</p>
          <h1 className="mb-2 mt-1 text-2xl font-bold text-brand-900">{tr("Thank you for looking out for the community")}</h1>
          <p className="mx-auto mb-0 mt-2 max-w-lg text-sm leading-relaxed text-muted">{tr("Your report has been submitted and saved for review.")}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/analysis"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-800 px-4 text-sm font-bold text-white"
            >{tr("Analyze another item")}</Link>
            <Link
              to="/"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-white px-4 text-sm font-bold text-brand-800"
            >{tr("Return to community feed")}</Link>
          </div>
        </Card>
      </main>
    );

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const details = context.trim();
    if (!details)
      return setError(
        "Please describe what happened before submitting your report.",
      );
    if (details.length < 10)
      return setError("Please provide at least 10 characters of detail.");
    if (!confirmed)
      return setError(
        "Please confirm that this report is honest and privacy-safe.",
      );

    setSubmitting(true);
    setError("");
    try {
      await createReportFromScan(analysis.id, { details });
      setSubmitted(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.error ||
          "We could not submit your report. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-w-0 px-0 sm:px-4 lg:px-10" id="main-content">
      <div className="mb-5">
        <p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">{tr("Step 3 · Report your encounter")}</p>
        <h1 className="mb-1 mt-1 text-2xl font-bold text-brand-900">{tr("Add context to your report")}</h1>
        <p className="m-0 max-w-2xl text-sm text-muted">{tr("The analyzed content and safety assessment have already been carried over. Tell us only what happened.")}</p>
      </div>
      <Card className="mb-4 border-[#cbdcf0] bg-[#f8fbff] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-wide text-brand-700">{tr("From your analysis")}</p>
            <h2 className="mb-0 mt-1 text-base font-bold text-brand-900">
              {analysis.inputType === "URL" ? tr("Suspicious website URL") : tr("Suspicious text")}
            </h2>
          </div>
          <Badge tone={toneFor(analysis.risk)}>{tr("{{level}} risk", { level: tr(analysis.risk) })}</Badge>
        </div>
        <p className="mb-0 mt-3 break-words rounded-lg bg-white p-3 font-mono text-xs leading-5 text-[#40546b]">
          {analysis.normalizedInput}
        </p>
        <p className="mb-0 mt-3 text-sm leading-6 text-muted">
          <strong className="text-[#40546b]">{tr("Assessment:")}</strong>{" "}
          {analysis.analysis.summary}
        </p>
      </Card>
      <Card className="overflow-hidden">
        <form className="grid gap-5 p-5 sm:p-6" onSubmit={submit} noValidate>
          <label className="grid gap-1.5 text-sm font-bold text-ink">{tr("What happened?")}<textarea
              disabled={submitting}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "report-error" : undefined}
              rows="6"
              value={context}
              onChange={(event) => {
                setContext(event.target.value);
                setError("");
              }}
              className="resize-y rounded-lg border border-line p-3 text-base font-normal outline-none placeholder:text-[#8a97a8] focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa]"
              placeholder={tr("For example: I received this message after an order, and the sender asked me to pay a fee.")}
            />
          </label>
          <p className="-mt-3 mb-0 text-xs leading-5 text-muted">{tr("Do not include passwords, OTP codes, banking details, or other private information.")}</p>
          <div className="rounded-xl border border-line bg-[#fbfcfe] p-4">
            <h2 className="m-0 text-sm font-bold text-brand-900">{tr("Included with this report")}</h2>
            <ul className="mb-0 mt-2 grid gap-1 pl-5 text-sm leading-6 text-muted">
              <li>{tr("Analyzed text or URL")}</li>
              <li>{tr("{{level}} assessment and detected indicators", { level: tr(analysis.risk) })}</li>
              <li>
                {tr("Similar scam case references: {{count}}", { count: analysis.matchedScamCases?.length || 0 })}
              </li>
            </ul>
          </div>
          <label className="flex items-start gap-3 text-sm leading-6 text-muted">
            <input
              disabled={submitting}
              type="checkbox"
              checked={confirmed}
              onChange={(event) => {
                setConfirmed(event.target.checked);
                setError("");
              }}
              className="mt-1 h-4 w-4 accent-[#0c4698]"
            />
            <span>{tr("I confirm this report is honest and does not expose private information.")}</span>
          </label>
          {error ? (
            <p
              id="report-error"
              className="-mt-2 mb-0 text-sm font-semibold text-risk-high"
              role="alert"
            >
              {tr(error)}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              disabled={submitting}
              type="button"
              onClick={() => navigate("/analysis")}
              className="inline-flex min-h-11 items-center justify-center px-3 text-sm font-bold text-muted hover:text-brand-800"
            >{tr("Back to analysis")}</button>
            <button
              disabled={submitting}
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border-0 bg-brand-800 px-5 text-sm font-bold text-white hover:bg-brand-700"
            >
              <Icon name={submitting ? "clock" : "edit"} size={17} />
              {submitting ? tr("Submitting…") : tr("Submit for review")}
            </button>
          </div>
        </form>
      </Card>
      {submitting ? <SubmissionDialog /> : null}
    </main>
  );
}
