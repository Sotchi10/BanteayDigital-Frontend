import { Link } from "react-router-dom";
import { Badge, Card, Icon } from "../../components/ui";
import { posts, statistics } from "../../data/mockCommunity";

const principles = [
  { icon: "shield", title: "Evidence first", text: "Share screenshots, links, or message details that moderators can check." },
  { icon: "users", title: "Protect people", text: "Remove private information and focus on the warning signs others should know." },
  { icon: "check", title: "Verified clearly", text: "Moderator-reviewed reports are labelled so you can judge information quickly." },
];

export function CommunityPage() {
  const verifiedPosts = posts.filter((post) => post.verified);
  return (
    <main className="min-w-0" id="main-content">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">Community safety hub</p><h1 className="mb-1 mt-1 text-2xl font-bold text-brand-900">Safer decisions, shared together</h1><p className="m-0 max-w-xl text-sm text-muted">Learn how reports become trusted warnings and help neighbours recognise scams sooner.</p></div><Link to="/report" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 text-sm font-bold text-white"><Icon name="plus" size={17} />Share a report</Link></div>
      <div className="grid gap-3 sm:grid-cols-3">{principles.map((item) => <Card key={item.title} className="p-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-brand-800"><Icon name={item.icon} size={19} /></span><h2 className="mb-1 mt-3 text-base font-bold text-brand-900">{item.title}</h2><p className="m-0 text-sm leading-relaxed text-muted">{item.text}</p></Card>)}</div>
      <Card className="mt-4 p-5 sm:p-6">
        <div className="mb-4 flex items-end justify-between gap-4"><div><p className="m-0 text-xs font-bold uppercase tracking-wide text-brand-700">Recently reviewed</p><h2 className="mb-0 mt-1 text-xl font-bold text-brand-900">Verified community warnings</h2></div><Link to="/" className="shrink-0 text-sm font-bold text-brand-800 hover:text-brand-700">View full feed</Link></div>
        <div className="divide-y divide-line">{verifiedPosts.map((post) => <article key={post.id} className="grid gap-2 py-4 first:pt-0 last:pb-0"><div className="flex flex-wrap items-center gap-2"><Badge tone={post.risk.toLowerCase()}><Icon name="alert" size={13} />{post.risk} risk</Badge><Badge tone="category">{post.category}</Badge></div><h3 className="m-0 text-base font-bold text-ink">{post.title}</h3><p className="m-0 line-clamp-2 text-sm leading-relaxed text-muted">{post.description}</p><span className="text-xs font-semibold text-brand-700">Verified by BanteayDigital · {post.time}</span></article>)}</div>
      </Card>
      <div className="mt-4 grid grid-cols-2 gap-3">{statistics.slice(0, 2).map((item) => <Card key={item.label} className="p-4"><strong className="block text-2xl text-brand-900">{item.value}</strong><span className="text-sm text-muted">{item.label} this month</span></Card>)}</div>
    </main>
  );
}
