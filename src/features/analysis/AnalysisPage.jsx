import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge, Card, Icon } from "../../components/ui";
import { createImageScan, createScan } from "../../services/scans";
import { createReportFromScan } from "../../services/reports";
import { notifyScanCreated } from "../../services/scanHistoryNotifications";
import { useAuth } from "../../state/AuthStore";
import { useTranslation } from "react-i18next";

const modes = (t) => [
  {
    id: "TEXT",
    label: t("scan.text"),
    detail: t("scan.textDetail"),
    icon: "message",
  },
  {
    id: "URL",
    label: t("scan.link"),
    detail: t("scan.linkDetail"),
    icon: "link",
  },
  {
    id: "IMAGE",
    label: t("scan.image"),
    detail: t("scan.imageDetail"),
    icon: "image",
  },
];

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const supportedImageTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const riskTone = (risk) =>
  risk === "High"
    ? "high"
    : risk === "Medium"
      ? "medium"
      : risk === "Low"
        ? "low"
        : "neutral";
const caseTone = (risk) =>
  risk === "HIGH" || risk === "CRITICAL"
    ? "high"
    : risk === "MEDIUM"
      ? "medium"
      : "low";
/*const mockCases = [
  { id: "case-otp", title: "Account verification request", riskLevel: "HIGH", similarity: 88, matchReason: "Uses a request for a verification code." },
  { id: "case-prize", title: "Unexpected prize claim", riskLevel: "MEDIUM", similarity: 74, matchReason: "Combines a prize offer with urgency or payment language." },
];

const buildLocalPreview = ({ inputType, value }) => {
  const indicators = ["urgent", "prize", "fee", "password", "otp", "suspended", "click", "investment"]
    .filter((word) => value.toLowerCase().includes(word));
  const risk = indicators.length >= 2 ? "High" : indicators.length === 1 ? "Medium" : "Low";
  const assessment = risk === "High" ? "STRONG_SCAM_INDICATORS" : risk === "Medium" ? "SUSPICIOUS" : "NO_STRONG_WARNING_SIGNS";
  const reasons = indicators.length
    ? indicators.map((word) => `Contains “${word}”, which can be used in scam pressure tactics.`)
    : ["No common pressure phrases were found in this local preview."];
  return {
    id: "local-preview",
    inputType,
    rawInput: value,
    normalizedInput: value,
    assessment,
    risk,
    score: indicators.length * 20,
    findings: indicators.map((word) => ({ code: `LOCAL_${word.toUpperCase()}`, message: word })),
    analysis: {
      summary: indicators.length ? `Local preview found ${indicators.length} warning signal${indicators.length === 1 ? "" : "s"}. Connect the backend to run OCR, retrieval, and AI analysis.` : "This is a local UI preview. Connect the backend for a full scam analysis.",
      reasons,
      recommendedActions: ["Verify unexpected requests using an official contact method."],
    },
    matchedScamCases: indicators.length ? mockCases.slice(0, risk === "High" ? 2 : 1) : [],
  };
};*/

const riskFromAssessment = (assessment) =>
  assessment === "STRONG_SCAM_INDICATORS"
    ? "High"
    : assessment === "SUSPICIOUS" || assessment === "CAUTION"
      ? "Medium"
      : assessment === "NO_STRONG_WARNING_SIGNS"
        ? "Low"
        : "Unknown";

const serializeResult = (scan) => ({
  ...scan,
  risk: riskFromAssessment(scan.assessment),
});

const asPercent = (score) => {
  const numericScore = Number(score);
  if (!Number.isFinite(numericScore)) return null;
  return Math.round(numericScore <= 1 ? numericScore * 100 : numericScore);
};

const localizedValue = (value, khmerValue, language) =>
  language === "km" && typeof khmerValue === "string" && khmerValue.trim()
    ? khmerValue
    : value;

const relatedScamMatches = (result, language, t) => {
  const aiMatches = Array.isArray(result?.aiMatches) ? result.aiMatches : [];
  const retrievedMatches = Array.isArray(result?.aiRetrieval?.matches)
    ? result.aiRetrieval.matches
    : [];
  const storedMatches = Array.isArray(result?.matchedScamCases)
    ? result.matchedScamCases
    : [];
  const matches = aiMatches.length
    ? aiMatches
    : retrievedMatches.length
      ? retrievedMatches
      : storedMatches;

  return matches.map((match, index) => {
    const payload = match.payload || {};
    return {
      id: payload.caseId ?? match.caseId ?? match.id ?? index,
      title: localizedValue(
        payload.title ?? match.title ?? t("scanExtra.relatedCase"),
        payload.titleKm ??
          payload.title_km ??
          payload.khmerTitle ??
          payload.translations?.km?.title ??
          match.titleKm ??
          match.title_km ??
          match.khmerTitle ??
          match.translations?.km?.title,
        language,
      ),
      scamType: localizedValue(
        payload.scamType ?? match.scamType,
        payload.scamTypeKm ??
          payload.scam_type_km ??
          payload.khmerScamType ??
          payload.translations?.km?.scamType ??
          match.scamTypeKm ??
          match.scam_type_km ??
          match.khmerScamType ??
          match.translations?.km?.scamType,
        language,
      ),
      riskLevel: payload.riskLevel ?? match.riskLevel,
      confidence: asPercent(match.score ?? match.similarity),
      description:
        match.matchReason ?? match.description ?? payload.description,
      source: payload.source ?? match.source,
      relation: match.relation,
    };
  });
};

const errorMessage = (requestError, t) => {
  if (requestError.response?.status === 401) return t("scan.loginRequired");
  return (
    requestError.response?.data?.message ||
    requestError.response?.data?.error ||
    t("scan.failed")
  );
};

function normalizeUrl(value, t) {
  const input = value.trim();
  if (!input) return { error: t("scan.urlRequired") };
  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const url = new URL(candidate);
    if (!url.hostname || !["http:", "https:"].includes(url.protocol))
      throw new Error("Invalid URL");
    return { value: url.toString() };
  } catch {
    return { error: t("scan.invalidUrl") };
  }
}

function ProgressTracker({ hasResult }) {
  const { t } = useTranslation();
  const steps = [
    t("scan.stepScan"),
    t("scan.stepReview"),
    t("scan.stepReport"),
  ];
  const currentStep = hasResult ? 1 : 0;
  return (
    <ol
      className="mb-5 flex w-full items-center"
      aria-label={t("scan.progress")}
    >
      {steps.map((label, index) => (
        <li
          key={label}
          className="flex min-w-0 flex-1 items-center last:flex-none"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span
              className={`grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-full border text-xs sm:text-xs font-extrabold transition-colors ${index < currentStep ? "border-brand-800 bg-brand-800 text-white" : index === currentStep ? "border-brand-800 bg-brand-100 text-brand-800 ring-2 ring-brand-700/20" : "border-line bg-white text-muted"}`}
            >
              {index < currentStep ? (
                <Icon name="check" size={14} />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={`text-xs sm:text-xs font-bold truncate ${index <= currentStep ? "text-brand-900" : "text-muted"}`}
            >
              {label}
            </span>
          </div>
          {index < steps.length - 1 ? (
            <span
              className={`mx-1.5 sm:mx-4 h-px min-w-2 sm:min-w-3 flex-1 ${index < currentStep ? "bg-brand-800" : "bg-line"}`}
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function ScanModeCard({ mode, active, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className={`group flex min-h-20 sm:min-h-24 flex-col items-center sm:items-start rounded-xl border p-2.5 sm:p-4 text-center sm:text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-2 ${active ? "border-brand-800 bg-brand-800 text-white shadow-md shadow-brand-800/20" : "border-line bg-white text-ink hover:-translate-y-0.5 hover:border-brand-700 hover:bg-brand-100 hover:shadow-sm"}`}
    >
      <span
        className={`mb-1.5 sm:mb-2 grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg transition-colors ${active ? "bg-white/15 text-white" : "bg-brand-100 text-brand-800 group-hover:bg-white"}`}
      >
        <Icon name={mode.icon} size={16} />
      </span>
      <span className="text-xs sm:text-sm font-bold truncate w-full">
        {mode.label}
      </span>
      <span
        className={`mt-0.5 text-xs sm:text-xs font-medium truncate w-full ${active ? "text-white/75" : "text-muted"}`}
      >
        {mode.detail}
      </span>
    </button>
  );
}

function ScanningOverlay() {
  const { t } = useTranslation();
  return (
    <div
      className="absolute inset-0 z-10 grid place-items-center rounded-[var(--radius-card)] bg-white/90 p-6 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <div className="relative mx-auto grid h-20 w-20 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-brand-100 opacity-70" />
          <span className="absolute inset-1 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-800" />
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-800 text-white shadow-lg">
            <Icon name="shield" size={21} />
          </span>
        </div>
        <h2 className="mb-1 mt-5 text-lg font-bold text-brand-900">
          {t("scan.scanning")}
        </h2>
        <p className="m-0 max-w-xs text-sm leading-6 text-muted">
          {t("scan.scanningDetail")}
        </p>
      </div>
    </div>
  );
}

function RelatedScamResults({ result }) {
  const tr = useInterfaceTranslation();
  const { t, i18n } = useTranslation();
  const matches = relatedScamMatches(result, i18n.resolvedLanguage, t);
  const retrievalStatus = result?.aiRetrieval?.status;

  if (retrievalStatus === "UNAVAILABLE") {
    return (
      <section
        className="rounded-xl border border-line bg-[#fbfcfe] p-4"
        aria-live="polite"
      >
        <h3 className="m-0 flex items-center gap-2 text-sm font-bold text-brand-900">
          <Icon name="search" size={16} /> {t("scanExtra.relatedResults")}
        </h3>
        <p className="mb-0 mt-2 text-sm leading-6 text-muted">
          {t("scanExtra.relatedUnavailable")}
        </p>
      </section>
    );
  }

  if (!matches.length) {
    return (
      <section
        className="mt-3 rounded-xl border border-line bg-[#fbfcfe] p-4"
        aria-live="polite"
      >
        <h3 className="m-0 flex items-center gap-2 text-sm font-bold text-brand-900">
          <Icon name="search" size={16} /> {t("scanExtra.relatedResults")}
        </h3>
        <p className="mb-0 mt-2 text-sm leading-6 text-muted">
          {t("scanExtra.relatedNone")}
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="related-scam-results-title">
      <div className="mt-3 flex items-center gap-2">
        <Icon name="search" size={17} className="text-brand-800" />
        <h3
          id="related-scam-results-title"
          className="m-0 text-lg font-bold text-brand-900"
        >
          {t("scanExtra.relatedResults")}
        </h3>
      </div>
      <div className="mt-3 grid gap-3">
        {matches.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-line bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <strong className="block text-sm text-brand-900">
                  {tr(item.title)}
                </strong>
                {item.scamType ? (
                  <span className="mt-1 block text-xs font-semibold text-muted">
                    {item.scamType}
                  </span>
                ) : null}
              </div>
              {item.confidence !== null ? (
                <Badge tone={caseTone(item.riskLevel)}>
                  {t("scanExtra.match", { percent: item.confidence })}
                </Badge>
              ) : null}
            </div>
            {item.description ? (
              <p className="mb-0 mt-2 text-sm leading-6 text-muted">
                {tr(item.description)}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold">
              {item.relation ? (
                <span className="text-muted">
                  {t(`scanExtra.relation.${item.relation}`, {
                    defaultValue: item.relation.replaceAll("_", " "),
                  })}
                </span>
              ) : null}
              {typeof item.source === "string" &&
              /^https?:\/\//i.test(item.source) ? (
                <a
                  className="text-brand-800 hover:underline"
                  href={item.source}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("scanExtra.viewSource")}
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ScanResultDialog({ result, onClose, onNewScan, onReport }) {
  const tr = useInterfaceTranslation();
  const { t } = useTranslation();
  const riskLabel = t(`scanExtra.riskLabels.${result.risk}`);
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#071a33]/55 p-4"
      role="presentation"
    >
      <section
        aria-labelledby="scan-result-title"
        aria-modal="true"
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        role="dialog"
      >
        <div className="border-b border-line p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
                {t("scanExtra.result")}
              </p>
              <h2
                id="scan-result-title"
                className="mb-0 mt-1 text-2xl font-extrabold text-brand-900"
              >
                {t("scanExtra.riskLevel", { risk: riskLabel })}
              </h2>
            </div>
            <button
              aria-label={t("scanExtra.close")}
              className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-brand-100 hover:text-brand-800"
              onClick={onClose}
              type="button"
            >
              ×
            </button>
          </div>
          <Badge tone={riskTone(result.risk)} className="mt-4 px-3 py-1.5">
            {t(`scanExtra.assessment.${result.assessment}`, {
              defaultValue: result.assessment.replaceAll("_", " "),
            })}
          </Badge>
          <p className="mb-0 mt-4 text-base leading-7 text-[#40546b]">
            {result.analysis.summary}
          </p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <section className="rounded-xl border border-line bg-[#fbfcfe] p-4">
            <h3 className="m-0 flex items-center gap-2 text-sm font-bold text-ink">
              <Icon name="alert" size={16} />
              {t("scanExtra.indicators")}
            </h3>
            <ul className="mb-0 mt-3 grid gap-2 pl-5 text-sm leading-6 text-muted">
              {result.analysis.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-brand-100 bg-brand-100/40 p-4">
            <h3 className="m-0 flex items-center gap-2 text-sm font-bold text-brand-900">
              <Icon name="shield" size={16} />
              {t("scanExtra.recommendedAction")}
            </h3>
            <p className="mb-0 mt-3 text-sm leading-6 text-muted">
              {result.analysis.recommendedActions[0] ||
                t("scanExtra.defaultRecommendation")}
            </p>
          </section>
        </div>
        <div className="border-t border-line p-5 sm:p-6">
          <RelatedScamResults result={result} />
        </div>
        <div className="flex flex-col gap-2 border-t border-line bg-[#fbfcfe] p-5 sm:flex-row sm:justify-end sm:p-6">
          <button
            className="min-h-11 rounded-lg border border-line bg-white px-5 text-sm font-bold text-brand-800"
            onClick={onNewScan}
            type="button"
          >
            {t("scanExtra.newScan")}
          </button>
          <button
            className="min-h-11 rounded-lg bg-brand-800 px-5 text-sm font-bold text-white"
            onClick={onReport}
            type="button"
          >
            {tr("Report this scam")}
          </button>
        </div>
      </section>
    </div>
  );
}

// Kept as an exported, reusable reporting dialog for entry points that need
// inline reporting rather than the dedicated report page.
export function ReportDialog({ scanId, onClose, onSuccess }) {
  const tr = useInterfaceTranslation();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [evidence, setEvidence] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (!reason || details.trim().length < 10) {
      setError("Choose a reason and provide at least 10 characters of detail.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createReportFromScan(scanId, {
        title: reason,
        reason,
        details: details.trim(),
        evidence: evidence.trim() || undefined,
      });
      onSuccess();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We could not submit your report. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-[#071a33]/55 p-4"
      role="presentation"
    >
      <section
        aria-labelledby="report-title"
        aria-modal="true"
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl"
        role="dialog"
      >
        <form onSubmit={submit}>
          <div className="border-b border-line p-5 sm:p-6">
            <h2
              id="report-title"
              className="m-0 text-xl font-bold text-brand-900"
            >
              {tr("Report this scam")}
            </h2>
            <p className="mb-0 mt-1 text-sm text-muted">
              {tr(
                "Your report is private and will be reviewed before anything is shared.",
              )}
            </p>
          </div>
          <div className="grid gap-4 p-5 sm:p-6">
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              {tr("Report reason")}
              <select
                required
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="min-h-11 rounded-lg border border-line bg-white px-3 font-normal"
              >
                <option value="">{tr("Select a reason")}</option>
                <option value="Scam attempt">{tr("Scam attempt")}</option>
                <option value="Phishing or impersonation">
                  {tr("Phishing or impersonation")}
                </option>
                <option value="Payment fraud">{tr("Payment fraud")}</option>
                <option value="Other suspicious activity">
                  {tr("Other suspicious activity")}
                </option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              {tr("Description and details")}
              <textarea
                required
                rows="4"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                className="resize-y rounded-lg border border-line p-3 font-normal"
                placeholder={tr(
                  "Describe what happened without passwords, OTPs, or banking details.",
                )}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              {tr("Optional evidence")}
              <label className="text-xs font-normal text-muted">
                {tr(
                  "Add a safe reference or link (do not include sensitive information).",
                )}
              </label>
              <input
                value={evidence}
                onChange={(event) => setEvidence(event.target.value)}
                className="min-h-11 rounded-lg border border-line px-3 font-normal"
                placeholder={tr("https://example.com or reference details")}
              />
            </label>
            {error ? (
              <p
                className="m-0 text-sm font-semibold text-risk-high"
                role="alert"
              >
                {tr(error)}
              </p>
            ) : null}
          </div>
          <div className="flex justify-end gap-3 border-t border-line bg-[#fbfcfe] p-5 sm:p-6">
            <button
              disabled={submitting}
              className="min-h-11 px-4 text-sm font-bold text-muted"
              onClick={onClose}
              type="button"
            >
              {tr("Cancel")}
            </button>
            <button
              disabled={submitting}
              className="min-h-11 rounded-lg bg-brand-800 px-5 text-sm font-bold text-white disabled:opacity-60"
              type="submit"
            >
              {submitting ? tr("Submitting…") : tr("Submit report")}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function AccountRequiredDialog({ onClose, onCreateAccount, onSignIn }) {
  const tr = useInterfaceTranslation();
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end bg-[#071a33]/55 p-4 sm:items-center sm:justify-center"
      role="presentation"
    >
      <section
        aria-labelledby="account-required-title"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
        role="dialog"
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-100 text-brand-800">
          <Icon name="users" size={21} />
        </span>
        <h2
          id="account-required-title"
          className="mb-1 mt-4 text-xl font-bold text-brand-900"
        >
          {tr("Create an account to submit a report")}
        </h2>
        <p className="m-0 text-sm leading-6 text-muted">
          {tr(
            "Reports are shared with the community, so an account is required. Your scan result will be ready when you return.",
          )}
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            className="min-h-11 rounded-lg border border-line bg-white px-4 text-sm font-bold text-brand-800 hover:bg-brand-100"
            onClick={onSignIn}
            type="button"
          >
            {tr("Sign In")}
          </button>
          <button
            className="min-h-11 rounded-lg bg-brand-800 px-4 text-sm font-bold text-white hover:bg-brand-700"
            onClick={onCreateAccount}
            type="button"
          >
            {tr("Create Account")}
          </button>
        </div>
        <button
          className="mt-4 w-full text-sm font-semibold text-muted hover:text-brand-800"
          onClick={onClose}
          type="button"
        >
          {tr("Not now")}
        </button>
      </section>
    </div>
  );
}

export function AnalysisPage() {
  const tr = useInterfaceTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const scanModes = modes(t);
  const [inputType, setInputType] = useState("TEXT");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(
    () => location.state?.reportResult || null,
  );
  const [showAccountRequired, setShowAccountRequired] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(null);
    setPreviewUrl(null);
  };

  const selectType = (type) => {
    setInputType(type);
    setContent("");
    clearImage();
    setResult(null);
    setError("");
  };

  const chooseImage = (file) => {
    if (!file) return;
    if (!supportedImageTypes.has(file.type)) {
      clearImage();
      setError(t("scan.invalidImage"));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      clearImage();
      setError(t("scan.imageTooLarge"));
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const analyse = async (event) => {
    event.preventDefault();
    let value = content.trim();
    if (inputType === "IMAGE") {
      if (!image) {
        setError(t("scan.imageRequired"));
        return;
      }
      value = `Image selected: ${image.name}`;
    } else {
      if (inputType === "URL") {
        const normalized = normalizeUrl(value, t);
        if (normalized.error) {
          setError(normalized.error);
          return;
        }
        value = normalized.value;
        setContent(value);
      } else if (!value) {
        setError(t("scan.textRequired"));
        return;
      }
    }
    setIsSubmitting(true);
    setError("");
    setResult(null);
    try {
      const response =
        inputType === "IMAGE"
          ? await createImageScan(image)
          : await createScan({ inputType, value });
      setResult(serializeResult(response.scan));
      if (isAuthenticated) notifyScanCreated();
    } catch (requestError) {
      setError(errorMessage(requestError, t));
    } finally {
      setIsSubmitting(false);
    }
  };

  const startReport = () => {
    if (isAuthenticated) {
      navigate(`/report?scan=${encodeURIComponent(result.id)}`);
      return;
    }
    setShowAccountRequired(true);
  };

  const continueWithAccount = (path) => {
    navigate(path, {
      state: {
        from: "/analysis",
        returnState: { reportResult: result },
      },
    });
  };

  return (
    <main className="lg:px-6" id="main-content">
      <ProgressTracker hasResult={Boolean(result)} />
      <Card className="relative overflow-hidden p-4 sm:p-6">
        {isSubmitting ? <ScanningOverlay /> : null}
        <form
          className="mx-auto max-w-3xl"
          onSubmit={analyse}
          noValidate
          aria-busy={isSubmitting}
        >
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-5">
            <div>
              <h2 className="m-0 flex items-center gap-2 text-lg font-bold text-black">
                <Icon name="search" size={19} /> {t("scan.heading")}
              </h2>
              <p className="mb-0 mt-1 text-sm text-muted">{t("scan.intro")}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8fbff] px-2.5 py-1.5 text-xs font-semibold text-muted">
              <Icon name="lock" size={13} /> {t("scan.private")}
            </span>
          </div>
          <div
            className="grid grid-cols-3 gap-2 sm:gap-3"
            role="radiogroup"
            aria-label={t("scan.type")}
          >
            {scanModes.map((mode) => (
              <ScanModeCard
                key={mode.id}
                mode={mode}
                active={inputType === mode.id}
                onSelect={() => selectType(mode.id)}
              />
            ))}
          </div>
          <div className="mt-6">
            {inputType === "TEXT" ? (
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
                  <Icon name="message" size={16} /> {t("scan.message")}
                </span>
                <textarea
                  value={content}
                  onChange={(event) => {
                    setContent(event.target.value);
                    setError("");
                  }}
                  rows="7"
                  className="w-full resize-y rounded-xl border border-line bg-white p-4 text-sm placeholder:text-sm text-ink shadow-sm outline-none transition placeholder:text-[#8a97a8] hover:border-brand-700 focus:border-brand-700 focus:ring-4 focus:ring-[#d9ebfa]"
                  placeholder={t("scan.messagePlaceholder")}
                  aria-describedby={error ? "analysis-error" : "scan-help"}
                />
                <span id="scan-help" className="mt-2 block text-xs text-muted">
                  {t("scan.messageHelp")}
                </span>
              </label>
            ) : null}
            {inputType === "URL" ? (
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
                  <Icon name="link" size={16} /> {t("scan.website")}
                </span>
                <div className="relative">
                  <Icon
                    name="globe"
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    value={content}
                    onChange={(event) => {
                      setContent(event.target.value);
                      setError("");
                    }}
                    className="min-h-12 w-full rounded-xl border border-line bg-white py-3 pl-11 pr-4 text-base text-ink shadow-sm outline-none transition placeholder:text-[#8a97a8] hover:border-brand-700 focus:border-brand-700 focus:ring-4 focus:ring-[#d9ebfa]"
                    placeholder={t("scan.urlPlaceholder")}
                    inputMode="url"
                    aria-describedby={error ? "analysis-error" : "scan-help"}
                  />
                </div>
                <span id="scan-help" className="mt-2 block text-xs text-muted">
                  {t("scan.urlHelp")}
                </span>
              </label>
            ) : null}
            {inputType === "IMAGE" ? (
              <label
                className={`group flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition-all duration-200 ${previewUrl ? "border-brand-700 bg-brand-100/40" : "border-line bg-[#f8fbff] hover:border-brand-700 hover:bg-brand-100/60"}`}
              >
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => chooseImage(event.target.files?.[0])}
                />
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-brand-800 shadow-sm transition-transform duration-200 group-hover:scale-105">
                  <Icon name="upload" size={23} />
                </span>
                <span className="mt-3 text-sm font-bold text-brand-900">
                  {t("scan.upload")}
                </span>
                <span className="mt-1 text-xs text-muted">
                  {tr("PNG, JPG, JPEG, or WEBP · up to 10 MB")}
                </span>
                {previewUrl ? (
                  <span className="mt-4 block overflow-hidden rounded-xl border border-line bg-white p-1 shadow-sm">
                    <img
                      src={previewUrl}
                      alt={t("scan.imagePreview")}
                      className="max-h-52 max-w-full rounded-lg object-contain"
                    />
                  </span>
                ) : null}
                {image ? (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 shadow-sm">
                    <Icon name="check" size={14} /> {image.name}
                  </span>
                ) : null}
              </label>
            ) : null}
          </div>
          {error ? (
            <p
              id="analysis-error"
              className="mt-4 flex items-start gap-2 rounded-xl border border-[#f3c9cf] bg-[#fff6f7] p-3 text-sm font-semibold text-risk-high"
            >
              <Icon name="alert" size={17} className="mt-0.5 shrink-0" />
              {tr(error)}
            </p>
          ) : null}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="mb-0 flex items-center gap-2 text-xs leading-5 text-muted">
              <Icon name="shield" size={15} /> {t("scan.safetyNote")}
            </p>
            <button
              disabled={isSubmitting}
              type="submit"
              className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-brand-800 px-6 text-sm font-bold text-white shadow-md shadow-brand-800/20 transition duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#d9ebfa] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="shield" size={18} /> {t("scan.analyze")}
            </button>
          </div>
        </form>
      </Card>
      {result ? (
        <>
          <Card
            className={`mt-6 overflow-hidden border-l-4 shadow-lg ${result.risk === "High" ? "border-l-risk-high" : result.risk === "Medium" ? "border-l-risk-medium" : result.risk === "Low" ? "border-l-risk-low" : "border-l-slate-400"}`}
          >
            <div className="mx-auto max-w-4xl p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
                    {t("scanExtra.result")}
                  </p>
                  <h2 className="mb-0 mt-1 text-2xl font-extrabold text-brand-900">
                    {t("scanExtra.riskLevel", {
                      risk: t(`scanExtra.riskLabels.${result.risk}`),
                    })}
                  </h2>
                </div>
                <Badge tone={riskTone(result.risk)} className="px-3 py-1.5">
                  {t(`scanExtra.assessment.${result.assessment}`, {
                    defaultValue: result.assessment.replaceAll("_", " "),
                  })}
                </Badge>
              </div>
              <p className="mb-0 mt-4 max-w-3xl text-base leading-7 text-[#40546b]">
                {result.analysis.summary}
              </p>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <section className="rounded-xl border border-line bg-[#fbfcfe] p-4">
                  <h3 className="m-0 flex items-center gap-2 text-sm font-bold text-ink">
                    <Icon name="alert" size={16} /> {t("scanExtra.indicators")}
                  </h3>
                  <ul className="mb-0 mt-3 grid gap-2 pl-5 text-sm leading-6 text-muted">
                    {result.analysis.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </section>
                <section className="rounded-xl border border-brand-100 bg-brand-100/40 p-4">
                  <h3 className="m-0 flex items-center gap-2 text-sm font-bold text-brand-900">
                    <Icon name="shield" size={16} />{" "}
                    {t("scanExtra.recommendedAction")}
                  </h3>
                  <p className="mb-0 mt-3 text-sm leading-6 text-muted">
                    {result.analysis.recommendedActions[0] ||
                      tr(
                        "Verify the sender through an official contact method.",
                      )}
                  </p>
                </section>
              </div>
              <RelatedScamResults result={result} />
            </div>
            <section className="flex flex-col gap-3 border-t border-line bg-[#fbfcfe] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <p className="m-0 text-sm font-bold text-brand-900">
                  {tr("Did you encounter this scam?")}
                </p>
                <p className="mb-0 mt-1 text-xs text-muted">
                  {tr("Your report can help protect the community.")}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={startReport}
                  className="min-h-11 rounded-lg bg-brand-800 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
                >
                  {t("scanExtra.submitReport")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setContent("");
                    clearImage();
                  }}
                  className="min-h-11 rounded-lg border border-line bg-white px-5 text-sm font-bold text-brand-800 transition hover:border-brand-700 hover:bg-brand-100"
                >
                  {t("scanExtra.done")}
                </button>
              </div>
            </section>
          </Card>
          {showAccountRequired ? (
            <AccountRequiredDialog
              onClose={() => setShowAccountRequired(false)}
              onSignIn={() => continueWithAccount("/login")}
              onCreateAccount={() => continueWithAccount("/signup")}
            />
          ) : null}
        </>
      ) : null}
    </main>
  );
}
