import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Card, Icon } from "../../components/ui";

const examples = [
  "You won a prize. Pay a small delivery fee to claim it now.",
  "Your bank account is suspended. Click this link and enter your OTP.",
];

const mockCases = [
  { id: "case-prize", title: "Fake prize claim on Telegram", scamType: "Phishing", riskLevel: "HIGH", similarity: 92, matchReason: "Uses a prize claim and fee request pattern found in verified cases." },
  { id: "case-bank", title: "Fake account security message", scamType: "Impersonation", riskLevel: "HIGH", similarity: 86, matchReason: "Matches urgent account-verification language used in reported scams." },
  { id: "case-payment", title: "Unexpected delivery payment request", scamType: "Phishing", riskLevel: "MEDIUM", similarity: 74, matchReason: "Contains a payment request that should be verified independently." },
];

const riskTone = (risk) => risk === "High" ? "high" : risk === "Medium" ? "medium" : "low";
const caseTone = (risk) => risk === "HIGH" || risk === "CRITICAL" ? "high" : risk === "MEDIUM" ? "medium" : "low";

function normalizeUrl(value) {
  const input = value.trim();
  if (!input) return { error: "Paste a website URL before running the check." };
  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const url = new URL(candidate);
    if (!url.hostname || !["http:", "https:"].includes(url.protocol)) throw new Error("Invalid URL");
    return { value: url.toString() };
  } catch { return { error: "Enter a valid http or https website address." }; }
}

export function AnalysisPage() {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState("TEXT");
  const [content, setContent] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyse = (event) => {
    event.preventDefault();
    let value = content.trim();
    if (inputType === "URL") {
      const normalized = normalizeUrl(value);
      if (normalized.error) { setError(normalized.error); setResult(null); return; }
      value = normalized.value;
      setContent(value);
    } else if (!value) { setError("Paste suspicious text before running the check."); setResult(null); return; }

    // Keep the existing frontend-only analysis rule unchanged. The structure
    // below mirrors the backend scan response until API integration is ready.
    const matches = ["urgent", "prize", "fee", "password", "otp", "suspended", "click", "investment"].filter((word) => value.toLowerCase().includes(word));
    const risk = matches.length >= 2 ? "High" : matches.length === 1 ? "Medium" : "Low";
    const assessment = risk === "High" ? "STRONG_SCAM_INDICATORS" : risk === "Medium" ? "SUSPICIOUS" : "NO_STRONG_WARNING_SIGNS";
    setError("");
    setResult({
      inputType, normalizedInput: value, risk, assessment, matches,
      analysis: {
        summary: matches.length ? `Warning signals found: ${matches.join(", ")}.` : "No common warning phrases were detected. Stay cautious and verify the sender independently.",
        reasons: matches.length ? matches.map((word) => `Uses “${word}”, a phrase often found in pressure tactics.`) : ["No common pressure phrases were detected."],
        recommendedActions: [risk === "Low" ? "Verify unexpected requests through an official channel." : "Stop contact, do not pay or share private information, and verify independently."],
      },
      findings: matches.map((word, index) => ({ code: `UI_INDICATOR_${index + 1}`, message: `Uses “${word}”, a phrase often found in pressure tactics.`, severity: risk === "High" ? "SUSPICIOUS" : "CAUTION" })),
      matchedScamCases: mockCases.slice(0, risk === "Low" ? 1 : 3),
      aiRetrieval: { status: "MOCK_AVAILABLE", matches: mockCases.slice(0, risk === "Low" ? 1 : 3).map((item) => ({ caseId: item.id, title: item.title, scamType: item.scamType, riskLevel: item.riskLevel, score: item.similarity / 100 })) },
    });
  };

  return <main className="min-w-0" id="main-content">
    <div className="mb-5"><p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">Start with a safety check</p><h1 className="mb-1 mt-1 text-2xl font-bold text-brand-900">Analyze a suspicious message or link</h1><p className="m-0 max-w-2xl text-sm text-muted">Review warning signs and related cases before deciding whether to report an encounter.</p></div>
    <div className="mb-5 flex items-center gap-2 text-xs font-bold text-muted"><span className="text-brand-800">1 Analyze</span><Icon name="chevron" size={14} /><span className={result ? "text-brand-800" : ""}>2 Review result</span><Icon name="chevron" size={14} /><span className={result ? "text-brand-800" : ""}>3 Report if needed</span></div>
    <Card className="p-5 sm:p-6"><form onSubmit={analyse} noValidate><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><label htmlFor="analysis-type" className="text-sm font-bold text-ink">Content to analyze</label><p className="mb-0 mt-1 text-sm text-muted">Do not include passwords, OTP codes, or banking credentials.</p></div><select id="analysis-type" value={inputType} onChange={(event) => { setInputType(event.target.value); setContent(""); setResult(null); setError(""); }} className="min-h-11 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-brand-700"><option value="TEXT">Suspicious text</option><option value="URL">Website URL</option></select></div>
      {inputType === "TEXT" ? <textarea value={content} onChange={(event) => { setContent(event.target.value); setError(""); }} rows="7" className="w-full resize-y rounded-xl border border-line bg-white p-4 text-base text-ink outline-none placeholder:text-[#8a97a8] focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa]" placeholder="Paste the suspicious message here…" aria-describedby={error ? "analysis-error" : undefined} /> : <input value={content} onChange={(event) => { setContent(event.target.value); setError(""); }} className="min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base text-ink outline-none placeholder:text-[#8a97a8] focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa]" placeholder="https://suspicious-site.example" inputMode="url" aria-describedby={error ? "analysis-error" : undefined} />}
      {error ? <p id="analysis-error" className="mb-0 mt-2 flex items-center gap-2 text-sm font-semibold text-risk-high"><Icon name="alert" size={16} />{error}</p> : null}
      {inputType === "TEXT" ? <div className="mt-3 flex flex-wrap gap-2"><span className="py-2 text-xs font-semibold text-muted">Try an example:</span>{examples.map((example, index) => <button key={example} type="button" onClick={() => { setContent(example); setResult(null); setError(""); }} className="rounded-full border border-line bg-[#f8fafc] px-3 py-2 text-xs font-semibold text-brand-800 hover:bg-brand-100">Example {index + 1}</button>)}</div> : null}
      <button type="submit" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border-0 bg-brand-800 px-5 text-sm font-bold text-white hover:bg-brand-700 sm:w-auto"><Icon name="shield" size={18} />Analyze scam</button></form></Card>
    {result ? <Card className={`mt-4 overflow-hidden border-l-4 ${result.risk === "High" ? "border-l-risk-high" : result.risk === "Medium" ? "border-l-risk-medium" : "border-l-risk-low"}`}><div className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="m-0 text-xs font-bold uppercase tracking-wide text-muted">Step 2 · Analysis result</p><h2 className="mb-0 mt-1 text-2xl font-bold text-brand-900">{result.risk} risk</h2></div><Badge tone={riskTone(result.risk)}>{result.assessment.replaceAll("_", " ")}</Badge></div><p className="mb-0 mt-3 text-base leading-7 text-[#40546b]">{result.analysis.summary}</p><section className="mt-5 border-t border-line pt-5"><h3 className="m-0 text-sm text-ink">Detected indicators</h3><ul className="mb-0 mt-2 grid gap-2 pl-5 text-sm leading-6 text-muted">{result.analysis.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></section><section className="mt-5 rounded-xl bg-[#f8fbff] p-4"><h3 className="m-0 text-sm text-brand-900">Recommended action</h3><p className="mb-0 mt-1 text-sm leading-6 text-muted">{result.analysis.recommendedActions[0]}</p></section><section className="mt-6 border-t border-line pt-5"><div className="flex flex-wrap items-end justify-between gap-2"><div><p className="m-0 text-xs font-bold uppercase tracking-wide text-brand-700">Retrieved references</p><h3 className="mb-0 mt-1 text-lg text-brand-900">Similar scam cases</h3></div><span className="text-xs text-muted">For comparison, not confirmation</span></div><div className="mt-3 grid gap-3">{result.matchedScamCases.map((item) => <article key={item.id} className="rounded-xl border border-line bg-[#fbfcfe] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><strong className="text-sm text-brand-900">{item.title}</strong><Badge tone={caseTone(item.riskLevel)}>{item.similarity}% similar</Badge></div><p className="mb-0 mt-2 text-sm leading-6 text-muted">{item.matchReason}</p><span className="mt-2 inline-block rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-800">{item.scamType}</span></article>)}</div></section></div><section className="border-t border-line bg-[#fbfcfe] p-5 sm:px-6"><p className="m-0 text-xs font-bold uppercase tracking-wide text-brand-700">Step 3 · Your experience</p><h2 className="mb-1 mt-1 text-xl font-bold text-brand-900">Did you encounter this scam?</h2><p className="m-0 max-w-xl text-sm leading-6 text-muted">Your report can help warn other people. Your analyzed content and assessment will be included, so you will not need to enter them again.</p><div className="mt-4 flex flex-col gap-2 sm:flex-row"><button type="button" onClick={() => navigate("/report", { state: { analysis: result } })} className="min-h-11 rounded-lg bg-brand-800 px-5 text-sm font-bold text-white hover:bg-brand-700">Report this scam</button><button type="button" onClick={() => { setResult(null); setContent(""); }} className="min-h-11 rounded-lg border border-line bg-white px-5 text-sm font-bold text-brand-800 hover:bg-brand-100">Not now</button><Link to="/alerts" className="inline-flex min-h-11 items-center justify-center px-3 text-sm font-semibold text-brand-800 hover:underline">Review verified alerts</Link></div></section></Card> : null}
    <p className="mt-4 text-xs leading-relaxed text-muted">This quick check uses local mock analysis and retrieval data shaped like the existing scan response. It does not submit data to the backend.</p>
  </main>;
}
