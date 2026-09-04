import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Icon } from "../../components/ui";

const initialForm = { category: "", title: "", description: "", contact: "" };

export function ReportPage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  if (submitted) return (
    <main className="min-w-0" id="main-content">
      <Card className="p-6 text-center sm:p-10"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eaf8f3] text-risk-low"><Icon name="check" size={28} /></span><p className="mb-1 mt-4 text-xs font-bold uppercase tracking-[0.1em] text-risk-low">Report prepared</p><h1 className="m-0 text-2xl font-bold text-brand-900">Thank you for looking out for the community</h1><p className="mx-auto mb-0 mt-2 max-w-lg text-sm leading-relaxed text-muted">Your report details are ready for moderation. No sensitive information is shown publicly until a moderator reviews the evidence.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={() => { setForm(initialForm); setSubmitted(false); }} className="min-h-11 rounded-lg border border-line bg-white px-4 text-sm font-bold text-brand-800 hover:bg-brand-100">Create another report</button><Link to="/" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-800 px-4 text-sm font-bold text-white">Return to community feed</Link></div></Card>
    </main>
  );

  return (
    <main className="min-w-0" id="main-content">
      <div className="mb-5"><p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">Community report</p><h1 className="mb-1 mt-1 text-2xl font-bold text-brand-900">Report suspicious activity</h1><p className="m-0 max-w-2xl text-sm text-muted">Share what happened so moderators can verify it and warn others.</p></div>
      <Card className="overflow-hidden">
        <div className="border-b border-line bg-[#f8fbff] px-5 py-4"><div className="flex items-center gap-3 text-sm"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand-800 font-bold text-white">1</span><strong>Scam details</strong><span className="h-px flex-1 bg-line" /><span className="grid h-7 w-7 place-items-center rounded-full border border-line bg-white font-bold text-muted">2</span><span className="text-muted">Moderator review</span></div></div>
        <form className="grid gap-5 p-5 sm:p-6" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
          <label className="grid gap-1.5 text-sm font-bold text-ink">Scam type<select required value={form.category} onChange={update("category")} className="min-h-12 rounded-lg border border-line bg-white px-3 text-base font-normal outline-none focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa]"><option value="" disabled>Select the closest category</option><option>Phishing</option><option>Online shop scam</option><option>Investment scam</option><option>SMS scam</option><option>Other</option></select></label>
          <label className="grid gap-1.5 text-sm font-bold text-ink">Short title<input required maxLength="80" value={form.title} onChange={update("title")} className="min-h-12 rounded-lg border border-line px-3 text-base font-normal outline-none placeholder:text-[#8a97a8] focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa]" placeholder="Example: Fake delivery fee request" /><span className="text-right text-xs font-normal text-muted">{form.title.length}/80</span></label>
          <label className="grid gap-1.5 text-sm font-bold text-ink">What happened?<textarea required rows="6" value={form.description} onChange={update("description")} className="resize-y rounded-lg border border-line p-3 text-base font-normal outline-none placeholder:text-[#8a97a8] focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa]" placeholder="Describe the message, request, account, and any payment details. Do not include passwords or OTP codes." /></label>
          <label className="grid gap-1.5 text-sm font-bold text-ink">Suspicious link or account <span className="font-normal text-muted">(optional)</span><input value={form.contact} onChange={update("contact")} className="min-h-12 rounded-lg border border-line px-3 text-base font-normal outline-none placeholder:text-[#8a97a8] focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa]" placeholder="Website, phone number, or account name" /></label>
          <div className="flex items-start gap-3 rounded-xl border border-[#cbdcf0] bg-brand-100 p-4 text-sm text-[#40546b]"><Icon name="shield" size={19} className="mt-0.5 shrink-0 text-brand-800" /><p className="m-0"><strong className="block text-brand-900">Your privacy comes first</strong>Remove names, banking details, passwords, and verification codes before submitting.</p></div>
          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between"><Link to="/" className="inline-flex min-h-11 items-center justify-center px-3 text-sm font-bold text-muted hover:text-brand-800">Cancel</Link><button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border-0 bg-brand-800 px-5 text-sm font-bold text-white hover:bg-brand-700"><Icon name="edit" size={17} />Submit for review</button></div>
        </form>
      </Card>
    </main>
  );
}
