import { useMemo, useState } from "react";
import { Card, Icon } from "../../../components/ui";
import { posts } from "../../../data/mockCommunity";
import { PostComposer } from "./PostComposer";
import { ScamPostCard } from "./ScamPostCard";

const filters = [
  { value: "all", label: "All Reports" },
  { value: "verified", label: "Verified" },
  { value: "high-risk", label: "High Risk" },
  { value: "under-review", label: "Under Review" },
  { value: "most-recent", label: "Most Recent" },
];

export function CommunityFeed() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const visiblePosts = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = posts.filter((post) => {
      const matchesSearch = !search || [post.author, post.category, post.title, post.description, post.evidence?.link].some((value) => value?.toLowerCase().includes(search));
      const matchesFilter = filter === "all" || filter === "most-recent" || (filter === "verified" && post.verified) || (filter === "high-risk" && post.risk === "High") || (filter === "under-review" && !post.verified);
      return matchesSearch && matchesFilter;
    });
    return [...filtered].sort((a, b) => posts.indexOf(a) - posts.indexOf(b));
  }, [filter, query]);

  return (
    <main className="flex min-w-0 flex-col gap-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:px-10 scrollbar-color:#b8c8d9_transparent] lg:[scrollbar-width:thin]" id="main-content">
      <PostComposer value={query} onChange={setQuery} />

      <section aria-labelledby="community-feed-heading">
        <div className="mb-4 flex flex-col gap-2 px-0.5 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="community-feed-heading" className="m-0 text-lg font-bold text-brand-900">Latest scam reports</h2>
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-[#52647a]"><span>Filter</span><select className="min-h-11 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink outline-none transition hover:border-[#b8c8d9] focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa]" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter community reports">{filters.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        </div>
        <div className="grid gap-4">
          {visiblePosts.map((post) => <ScamPostCard key={post.id} post={post} />)}
          {visiblePosts.length === 0 ? <Card className="p-8 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#f2f4f7] text-muted"><Icon name="search" /></span><h3 className="mb-1 mt-3 text-base">No matching reports</h3><p className="m-0 text-sm text-muted">Try another keyword or clear the selected filter.</p><button type="button" onClick={() => { setQuery(""); setFilter("all"); }} className="mt-4 min-h-11 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-brand-800 hover:bg-brand-100">Clear filters</button></Card> : null}
        </div>
      </section>
    </main>
  );
}
