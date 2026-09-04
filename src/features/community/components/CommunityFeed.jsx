import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Icon } from "../../../components/ui";
import { posts } from "../../../data/mockCommunity";
import { PostComposer } from "./PostComposer";
import { ScamPostCard } from "./ScamPostCard";

const filters = ["All", "Verified", "High risk", "Under review"];

export function CommunityFeed() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("latest");

  const visiblePosts = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = posts.filter((post) => {
      const matchesSearch = !search || [post.author, post.category, post.title, post.description, post.evidence?.link].some((value) => value?.toLowerCase().includes(search));
      const matchesFilter = filter === "All" || (filter === "Verified" && post.verified) || (filter === "High risk" && post.risk === "High") || (filter === "Under review" && !post.verified);
      return matchesSearch && matchesFilter;
    });
    return [...filtered].sort((a, b) => sort === "helpful" ? b.helpful - a.helpful : posts.indexOf(a) - posts.indexOf(b));
  }, [filter, query, sort]);

  return (
    <main className="flex min-w-0 flex-col gap-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-2 lg:[scrollbar-color:#b8c8d9_transparent] lg:[scrollbar-width:thin]" id="main-content">
      <Card className="border-[#cbdcf0] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-800 sm:grid"><Icon name="shield" size={20} /></span>
          <div className="min-w-0 flex-1"><h1 className="m-0 text-base font-bold text-brand-900 sm:text-lg">Not sure if something is a scam?</h1><p className="m-0 mt-0.5 text-sm text-muted">Check a screenshot, suspicious message, or link before you trust it.</p></div>
          <Link to="/analysis" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 text-sm font-bold text-white transition hover:bg-brand-700"><Icon name="upload" size={17} />Analyse a scam</Link>
        </div>
      </Card>

      <PostComposer value={query} onChange={setQuery} />

      <section aria-labelledby="community-feed-heading">
        <div className="mb-3 flex flex-col gap-2 px-0.5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-brand-800">Community warnings</p><h2 id="community-feed-heading" className="m-0 mt-0.5 text-lg font-bold text-brand-900">Latest scam reports</h2></div>
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-muted"><span>Sort by</span><select className="min-h-11 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink outline-none hover:border-[#b8c8d9] focus:border-brand-700" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort community reports"><option value="latest">Latest</option><option value="helpful">Most helpful</option></select></label>
        </div>
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter community reports">
          {filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className={`min-h-9 shrink-0 rounded-full border px-3.5 text-sm font-semibold transition ${filter === item ? "border-brand-800 bg-brand-800 text-white" : "border-line bg-white text-[#52647a] hover:border-[#9ebad5] hover:text-brand-800"}`}>{item}</button>)}
        </div>
        <div className="grid gap-4">
          {visiblePosts.map((post) => <ScamPostCard key={post.id} post={post} />)}
          {visiblePosts.length === 0 ? <Card className="p-8 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#f2f4f7] text-muted"><Icon name="search" /></span><h3 className="mb-1 mt-3 text-base">No matching reports</h3><p className="m-0 text-sm text-muted">Try another keyword or clear the selected filter.</p><button type="button" onClick={() => { setQuery(""); setFilter("All"); }} className="mt-4 min-h-11 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-brand-800 hover:bg-brand-100">Clear filters</button></Card> : null}
        </div>
      </section>
    </main>
  );
}
