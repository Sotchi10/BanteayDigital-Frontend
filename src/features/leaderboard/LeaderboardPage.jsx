import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { useEffect, useMemo, useState } from "react";
import { Avatar, Badge, Card, Icon } from "../../components/ui";
import { apiErrorMessage, listCommunityPosts } from "../community/api/communityApi";

export function LeaderboardPage() {
  const tr = useInterfaceTranslation();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listCommunityPosts({ limit: 100 }).then((response) => { if (active) { setPosts(response.posts || []); setTotal(response.meta?.total || 0); } }).catch((requestError) => { if (active) setError(apiErrorMessage(requestError, "Could not load community activity.")); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const contributors = useMemo(() => Object.values(posts.reduce((result, post) => { const author = post.author; if (!author) return result; const entry = result[author.id] || { ...author, count: 0 }; entry.count += 1; result[author.id] = entry; return result; }, {})).sort((a, b) => b.count - a.count), [posts]);
  const interactions = posts.reduce((sum, post) => ({ likes: sum.likes + (post.interaction?.likeCount || 0), comments: sum.comments + (post.interaction?.commentCount || 0), shares: sum.shares + (post.interaction?.shareCount || 0) }), { likes: 0, comments: 0, shares: 0 });
  const statistics = [{ label: "Published alerts", value: total, icon: "alert" }, { label: "Helpful actions", value: interactions.likes, icon: "heart" }, { label: "Comments", value: interactions.comments, icon: "message" }, { label: "Shares", value: interactions.shares, icon: "share" }];

  return <main className="min-w-0" id="main-content"><div className="mb-5"><p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">{tr("Community recognition")}</p><h1 className="mb-1 mt-1 text-2xl font-bold text-brand-900">{tr("Published safety alerts")}</h1><p className="m-0 max-w-2xl text-sm text-muted">{tr("See the real activity around published community safety alerts.")}</p></div>
    {loading ? <Card className="p-8 text-center text-sm text-muted" role="status">{tr("Loading community activity…")}</Card> : null}
    {!loading && error ? <Card className="p-5 text-sm text-risk-high" role="alert">{tr(error)}</Card> : null}
    {!loading && !error ? <><div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{statistics.map((item) => <Card key={item.label} className="p-4"><span className="mb-2 grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-brand-800"><Icon name={item.icon} size={17} /></span><strong className="block text-xl text-brand-900">{item.value}</strong><span className="text-xs text-muted">{tr(item.label)}</span></Card>)}</div><Card className="overflow-hidden"><div className="border-b border-line bg-[#f8fbff] px-5 py-4"><h2 className="m-0 text-lg font-bold text-brand-900">{tr("Alert publishers")}</h2><p className="m-0 mt-1 text-sm text-muted">{tr("Ranked by published safety alerts currently available from the community API.")}</p></div>{contributors.length ? <ol className="m-0 list-none divide-y divide-line p-0">{contributors.map((person, index) => <li key={person.id} className="flex items-center gap-3 px-4 py-4 sm:px-5"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${index === 0 ? "bg-[#fff3cf] text-[#966800]" : "bg-[#f2f5f8] text-muted"}`}>{index + 1}</span><Avatar name={person.name || "Community member"} tone="indigo" /><div className="min-w-0 flex-1"><strong className="block truncate text-base">{person.name || tr("Community member")}</strong><span className="text-xs text-muted">{tr("Safety alert publisher")}</span></div>{index === 0 ? <Badge tone="blue"><Icon name="trophy" size={13} />{tr("Most alerts")}</Badge> : null}<div className="text-right"><strong className="block text-lg text-brand-900">{person.count}</strong><span className="text-xs text-muted">{tr("published")}</span></div></li>)}</ol> : <div className="p-8 text-center text-sm text-muted">{tr("No published alert contributors yet.")}</div>}</Card><div className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-white p-4 text-sm text-muted"><Icon name="shield" size={19} className="mt-0.5 shrink-0 text-brand-800" /><p className="m-0"><strong className="block text-ink">{tr("Community activity")}</strong>{tr("Counts reflect published alerts and their visible interactions.")}</p></div></> : null}
  </main>;
}
