import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Icon } from "../../components/ui";

const examples = [
  "You won a prize. Pay a small delivery fee to claim it now.",
  "Your bank account is suspended. Click this link and enter your OTP.",
];

export function AnalysisPage() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyse = (event) => {
    event.preventDefault();
    const value = content.trim();
    if (!value) {
      setError("Paste a message or link before running the check.");
      setResult(null);
      return;
    }
    const matches = ["urgent", "prize", "fee", "password", "otp", "suspended", "click", "investment"].filter((word) => value.toLowerCase().includes(word));
    setError("");
    setResult({ risk: matches.length >= 2 ? "High" : matches.length === 1 ? "Medium" : "Low", matches });
  };

  return (
    <main className="min-w-0" id="main-content">
      <div className="mb-5"><p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">Quick safety check</p><h1 className="mb-1 mt-1 text-2xl font-bold text-brand-900">Check a suspicious message or link</h1><p className="m-0 max-w-2xl text-sm text-muted">Look for common scam warning signs before you reply, pay, or share personal information.</p></div>
      <Card className="p-5 sm:p-6">
        <form onSubmit={analyse} noValidate>
          <label htmlFor="analysis-content" className="block text-sm font-bold text-ink">Message, link, or account name</label>
          <p className="mb-3 mt-1 text-sm text-muted">Do not include passwords, OTP codes, or banking credentials.</p>
          <textarea id="analysis-content" value={content} onChange={(event) => { setContent(event.target.value); setError(""); }} rows="7" className="w-full resize-y rounded-xl border border-line bg-white p-4 text-base text-ink outline-none placeholder:text-[#8a97a8] focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa]" placeholder="Paste the suspicious content here…" aria-describedby={error ? "analysis-error" : undefined} />
          {error ? <p id="analysis-error" className="mb-0 mt-2 flex items-center gap-2 text-sm font-semibold text-risk-high"><Icon name="alert" size={16} />{error}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2"><span className="py-2 text-xs font-semibold text-muted">Try an example:</span>{examples.map((example, index) => <button key={example} type="button" onClick={() => { setContent(example); setResult(null); setError(""); }} className="rounded-full border border-line bg-[#f8fafc] px-3 py-2 text-xs font-semibold text-brand-800 hover:bg-brand-100">Example {index + 1}</button>)}</div>
          <button type="submit" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border-0 bg-brand-800 px-5 text-sm font-bold text-white hover:bg-brand-700 sm:w-auto"><Icon name="shield" size={18} />Check for warning signs</button>
        </form>
      </Card>
      {result ? <Card className={`mt-4 border-l-4 p-5 ${result.risk === "High" ? "border-l-risk-high" : result.risk === "Medium" ? "border-l-risk-medium" : "border-l-risk-low"}`}>
        <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-800"><Icon name={result.risk === "Low" ? "check" : "alert"} size={20} /></span><div><p className="m-0 text-xs font-bold uppercase tracking-wide text-muted">Preliminary result</p><h2 className="mb-1 mt-0.5 text-xl font-bold text-brand-900">{result.risk} risk</h2><p className="m-0 text-sm text-muted">{result.matches.length ? `Warning signals found: ${result.matches.join(", ")}.` : "No common warning phrases were found, but stay cautious and verify the sender independently."}</p></div></div>
        <div className="mt-4 flex flex-wrap gap-3 border-t border-line pt-4"><Link to="/report" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-800 px-4 text-sm font-bold text-white"><Icon name="edit" size={17} />Report this scam</Link><Link to="/alerts" className="inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm font-bold text-brand-800 hover:bg-brand-100">Review verified alerts</Link></div>
      </Card> : null}
      <p className="mt-4 text-xs leading-relaxed text-muted">This quick check highlights common warning signs and is not a guarantee. When money or account access is involved, verify through the organisation’s official contact details.</p>
    </main>
  );
}
