import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Card, Icon } from "../../components/ui";

const examples = [
  "You won a prize. Pay a small delivery fee to claim it now.",
  "Your bank account is suspended. Click this link and enter your OTP.",
];

const modes = [
  { id: "TEXT", label: "Text", detail: "Message or email", icon: "message" },
  { id: "URL", label: "Link", detail: "Website address", icon: "link" },
  { id: "IMAGE", label: "Image", detail: "Screenshot or photo", icon: "image" },
];

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const supportedImageTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const riskTone = (risk) =>
  risk === "High" ? "high" : risk === "Medium" ? "medium" : "low";
const caseTone = (risk) =>
  risk === "HIGH" || risk === "CRITICAL"
    ? "high"
    : risk === "MEDIUM"
      ? "medium"
      : "low";
const mockCases = [
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
};

function normalizeUrl(value) {
  const input = value.trim();
  if (!input) return { error: "Paste a website URL before running the check." };
  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const url = new URL(candidate);
    if (!url.hostname || !["http:", "https:"].includes(url.protocol))
      throw new Error("Invalid URL");
    return { value: url.toString() };
  } catch {
    return { error: "Enter a valid http or https website address." };
  }
}

function ProgressTracker({ hasResult }) {
  const steps = ["Scan", "Review", "Report"];
  const currentStep = hasResult ? 1 : 0;
  return (
    <ol
      className="mb-6 flex w-full items-center"
      aria-label="Scan progress"
    >
      {steps.map((label, index) => (
        <li
          key={label}
          className="flex min-w-0 flex-1 items-center last:flex-none"
        >
          <div className="flex items-center gap-2">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-extrabold transition-colors ${index < currentStep ? "border-brand-800 bg-brand-800 text-white" : index === currentStep ? "border-brand-800 bg-brand-100 text-brand-800" : "border-line bg-white text-muted"}`}
            >
              {index < currentStep ? (
                <Icon name="check" size={16} />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={`hidden text-xs font-bold sm:inline ${index <= currentStep ? "text-brand-900" : "text-muted"}`}
            >
              {label}
            </span>
          </div>
          {index < steps.length - 1 ? (
            <span
              className={`mx-2 h-px min-w-3 flex-1 sm:mx-4 ${index < currentStep ? "bg-brand-800" : "bg-line"}`}
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
      className={`group flex min-h-24 flex-col items-start rounded-xl border p-3.5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-2 ${active ? "border-brand-800 bg-brand-800 text-white shadow-md shadow-brand-800/20" : "border-line bg-white text-ink hover:-translate-y-0.5 hover:border-brand-700 hover:bg-brand-100 hover:shadow-sm"}`}
    >
      <span
        className={`mb-2 grid h-8 w-8 place-items-center rounded-lg transition-colors ${active ? "bg-white/15 text-white" : "bg-brand-100 text-brand-800 group-hover:bg-white"}`}
      >
        <Icon name={mode.icon} size={17} />
      </span>
      <span className="text-sm font-bold">{mode.label}</span>
      <span
        className={`mt-0.5 text-[11px] font-medium ${active ? "text-white/75" : "text-muted"}`}
      >
        {mode.detail}
      </span>
    </button>
  );
}

function ScanningOverlay() {
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
          Scanning for warning signs
        </h2>
        <p className="m-0 max-w-xs text-sm leading-6 text-muted">
          Checking patterns, similar scam cases, and evidence.
        </p>
      </div>
    </div>
  );
}

export function AnalysisPage() {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState("TEXT");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
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
      setError("Choose a PNG, JPG, JPEG, or WEBP image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      clearImage();
      setError("Image must not exceed 10 MB.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const analyse = (event) => {
    event.preventDefault();
    let value = content.trim();
    if (inputType === "IMAGE") {
      if (!image) {
        setError("Choose an image before running the check.");
        return;
      }
      value = `Image selected: ${image.name}`;
    } else {
      if (inputType === "URL") {
        const normalized = normalizeUrl(value);
        if (normalized.error) {
          setError(normalized.error);
          return;
        }
        value = normalized.value;
        setContent(value);
      } else if (!value) {
        setError("Paste suspicious text before running the check.");
        return;
      }
    }
    setIsSubmitting(true);
    setError("");
    setResult(null);
    window.setTimeout(() => {
      setResult(buildLocalPreview({ inputType, value }));
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <main
      className="px-10"
      id="main-content"
    >
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
              <h2 className="m-0 flex items-center gap-2 text-lg font-bold text-brand-900">
                <Icon name="search" size={19} /> What would you like to check?
              </h2>
              <p className="mb-0 mt-1 text-sm text-muted">
                Select the format that best matches what you received.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8fbff] px-2.5 py-1.5 text-xs font-semibold text-muted">
              <Icon name="lock" size={13} /> Private by default
            </span>
          </div>
          <div
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            role="radiogroup"
            aria-label="Scan type"
          >
            {modes.map((mode) => (
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
                  <Icon name="message" size={16} /> Suspicious message
                </span>
                <textarea
                  value={content}
                  onChange={(event) => {
                    setContent(event.target.value);
                    setError("");
                  }}
                  rows="7"
                  className="w-full resize-y rounded-xl border border-line bg-white p-4 text-base text-ink shadow-sm outline-none transition placeholder:text-[#8a97a8] hover:border-brand-700 focus:border-brand-700 focus:ring-4 focus:ring-[#d9ebfa]"
                  placeholder="Paste the suspicious message here…"
                  aria-describedby={error ? "analysis-error" : "scan-help"}
                />
                <span id="scan-help" className="mt-2 block text-xs text-muted">
                  Avoid including passwords, OTP codes, banking details, or
                  other secrets.
                </span>
              </label>
            ) : null}
            {inputType === "URL" ? (
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
                  <Icon name="link" size={16} /> Website address
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
                    placeholder="https://suspicious-site.example"
                    inputMode="url"
                    aria-describedby={error ? "analysis-error" : "scan-help"}
                  />
                </div>
                <span id="scan-help" className="mt-2 block text-xs text-muted">
                  We will check the address structure and known warning signals.
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
                  Upload a screenshot or image
                </span>
                <span className="mt-1 text-xs text-muted">
                  PNG, JPG, JPEG, or WEBP · up to 10 MB
                </span>
                {previewUrl ? (
                  <span className="mt-4 block overflow-hidden rounded-xl border border-line bg-white p-1 shadow-sm">
                    <img
                      src={previewUrl}
                      alt="Selected image preview"
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
              {error}
            </p>
          ) : null}
          {inputType === "TEXT" ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-bold uppercase tracking-wide text-muted">
                Try an example
              </span>
              {examples.map((example, index) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setContent(example);
                    setError("");
                  }}
                  className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-brand-800 transition hover:-translate-y-px hover:border-brand-700 hover:bg-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-700"
                >
                  Example {index + 1}
                </button>
              ))}
            </div>
          ) : null}
          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="mb-0 flex items-center gap-2 text-xs leading-5 text-muted">
              <Icon name="shield" size={15} /> This check offers safety signals,
              not proof of a scam.
            </p>
            <button
              disabled={isSubmitting}
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-800 px-6 text-sm font-bold text-white shadow-md shadow-brand-800/20 transition duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#d9ebfa] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="shield" size={18} /> Analyze scam
            </button>
          </div>
        </form>
      </Card>
      {result ? (
        <Card
          className={`mt-6 overflow-hidden border-l-4 shadow-lg ${result.risk === "High" ? "border-l-risk-high" : result.risk === "Medium" ? "border-l-risk-medium" : "border-l-risk-low"}`}
        >
          <div className="mx-auto max-w-4xl p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
                  Scan result
                </p>
                <h2 className="mb-0 mt-1 text-2xl font-extrabold text-brand-900">
                  {result.risk} risk
                </h2>
              </div>
              <Badge tone={riskTone(result.risk)} className="px-3 py-1.5">
                {result.assessment.replaceAll("_", " ")}
              </Badge>
            </div>
            <p className="mb-0 mt-4 max-w-3xl text-base leading-7 text-[#40546b]">
              {result.analysis.summary}
            </p>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <section className="rounded-xl border border-line bg-[#fbfcfe] p-4">
                <h3 className="m-0 flex items-center gap-2 text-sm font-bold text-ink">
                  <Icon name="alert" size={16} /> Detected indicators
                </h3>
                <ul className="mb-0 mt-3 grid gap-2 pl-5 text-sm leading-6 text-muted">
                  {result.analysis.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </section>
              <section className="rounded-xl border border-brand-100 bg-brand-100/40 p-4">
                <h3 className="m-0 flex items-center gap-2 text-sm font-bold text-brand-900">
                  <Icon name="shield" size={16} /> Recommended action
                </h3>
                <p className="mb-0 mt-3 text-sm leading-6 text-muted">
                  {result.analysis.recommendedActions[0] ||
                    "Verify the sender through an official contact method."}
                </p>
              </section>
            </div>
            {result.matchedScamCases.length ? (
              <section className="mt-6 border-t border-line pt-5">
                <div className="flex items-center gap-2">
                  <Icon name="search" size={17} className="text-brand-800" />
                  <h3 className="m-0 text-lg font-bold text-brand-900">
                    Similar scam cases
                  </h3>
                </div>
                <div className="mt-3 grid gap-3">
                  {result.matchedScamCases.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-line bg-white p-4 transition hover:border-brand-700 hover:shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <strong className="text-sm text-brand-900">
                          {item.title}
                        </strong>
                        <Badge tone={caseTone(item.riskLevel)}>
                          {item.similarity}% similar
                        </Badge>
                      </div>
                      <p className="mb-0 mt-2 text-sm leading-6 text-muted">
                        {item.matchReason}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
          <section className="flex flex-col gap-3 border-t border-line bg-[#fbfcfe] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <p className="m-0 text-sm font-bold text-brand-900">
                Did you encounter this scam?
              </p>
              <p className="mb-0 mt-1 text-xs text-muted">
                Your report can help protect the community.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  navigate("/report", { state: { analysis: result } })
                }
                className="min-h-11 rounded-lg bg-brand-800 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
              >
                Report this scam
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
                New scan
              </button>
              <Link
                to="/alerts"
                className="inline-flex min-h-11 items-center justify-center px-2 text-sm font-semibold text-brand-800 hover:underline"
              >
                View alerts
              </Link>
            </div>
          </section>
        </Card>
      ) : null}
    </main>
  );
}
