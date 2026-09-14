import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Card, Icon } from "../../components/ui";
import { listSafetyKnowledge } from "../../services/safetyKnowledge";

export function SafetyKnowledgePage() {
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listSafetyKnowledge().then((response) => { if (active) setKnowledge(response.knowledge || []); }).catch((requestError) => { if (active) setError(requestError.response?.data?.message || "We could not load Community Safety guidance."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <main className="min-w-0 px-5 py-5 sm:px-8" id="main-content"><div className="mb-6"><p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">Stay informed</p><h1 className="mb-1 mt-1 text-2xl font-bold text-brand-900">Community Safety</h1><p className="m-0 max-w-2xl text-sm text-muted">Practical guidance to help you recognise common online scams and protect your information.</p></div>
    {loading ? <Card className="grid place-items-center p-10 text-center" role="status"><span className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-800" /><p className="mb-0 mt-4 text-sm text-muted">Loading safety guidance…</p></Card> : null}
    {!loading && error ? <Card className="p-6 text-center"><Icon name="alert" size={25} className="mx-auto text-risk-high" /><h2 className="mb-1 mt-3 text-lg font-bold text-brand-900">Could not load guidance</h2><p className="m-0 text-sm text-muted" role="alert">{error}</p></Card> : null}
    {!loading && !error && knowledge.length === 0 ? <Card className="p-10 text-center"><Icon name="book" size={28} className="mx-auto text-brand-800" /><h2 className="mb-1 mt-3 text-lg font-bold text-brand-900">No safety guidance published yet</h2><p className="m-0 text-sm text-muted">Please check back soon.</p></Card> : null}
    {!loading && !error && knowledge.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{knowledge.map((topic) => <Card key={topic.id} className="flex min-h-60 flex-col p-5"><div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-800"><Icon name={topic.icon || "shield"} size={19} /></span><Badge tone="category">{topic.category}</Badge></div><h2 className="mb-1 mt-5 text-lg font-bold text-brand-900">{topic.title}</h2><p className="m-0 text-sm leading-6 text-muted">{topic.shortDescription}</p><Link to={`/safety/${topic.slug}`} className="mt-auto inline-flex min-h-10 items-center gap-2 pt-5 text-sm font-bold text-brand-800 hover:text-brand-700">Learn More <Icon name="chevron" size={17} /></Link></Card>)}</div> : null}
  </main>;
}
