import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { listCommunityPosts } from "../../features/community/api/communityApi";
import { listSafetyKnowledge } from "../../services/safetyKnowledge";
import { Icon } from "../ui";

function Panel({ title, children }) {
  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <h2 className="text-[18px] community-section-title m-0 border-b border-line pb-4">{title}</h2>
      <div className="pt-4">{children}</div>
    </section>
  );
}

export function RightSidebar() {
  const tr = useInterfaceTranslation();
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    let active = true;
    listCommunityPosts({ limit: 20 })
      .then((response) => { if (active) setPosts(response.posts || []); })
      .catch(() => { if (active) setPosts([]); });
    listSafetyKnowledge()
      .then((response) => { if (active) setTopics(response.knowledge || []); })
      .catch(() => { if (active) setTopics([]); });
    return () => { active = false; };
  }, []);

  const trending = useMemo(() => [...posts]
    .sort((a, b) => ((b.interaction?.commentCount || 0) + (b.interaction?.likeCount || 0)) - ((a.interaction?.commentCount || 0) + (a.interaction?.likeCount || 0)))
    .slice(0, 3), [posts]);

  return (
    <aside className="hidden self-start xl:sticky xl:top-[88px] xl:flex xl:w-[288px] xl:flex-col xl:gap-5" aria-label={tr("Community information")}>
      <Panel title={tr("Community guidelines")}>
        <ul className="community-body m-0 grid list-disc gap-3 pl-4 text-muted">
          <li>{tr("Share verified information and useful safety advice.")}</li>
          <li>{tr("Respect others and protect personal information.")}</li>
          <li>{tr("Report suspicious content to keep the community safe.")}</li>
        </ul>
      </Panel>

      <Panel title={tr("Popular topics")}>
        {topics.length ? <div className="flex flex-wrap gap-2.5">{topics.slice(0, 6).map((topic) => (
          <Link key={topic.id} to={`/safety/${encodeURIComponent(topic.slug)}`} className="community-body rounded-full border border-line px-2.5 py-1 text-muted hover:border-brand-700 hover:text-brand-800">{topic.title}</Link>
        ))}</div> : <Link to="/safety" className="community-body font-medium text-brand-800">{tr("Browse safety topics")}</Link>}
      </Panel>

      <Panel title={tr("Trending discussions")}>
        {trending.length ? <div className="grid divide-y divide-line">{trending.map((post) => (
          <Link key={post.id} to={`/posts/${encodeURIComponent(post.id)}`} className="group py-3 first:pt-0 last:pb-0">
            <span className="community-post-title line-clamp-2 group-hover:text-brand-800">{post.title}</span>
            <span className="community-meta mt-1 block">{post.interaction?.commentCount || 0} {tr("comments")}</span>
          </Link>
        ))}</div> : <p className="community-body m-0 text-muted">{tr("Discussions will appear as posts are published.")}</p>}
      </Panel>

      <Panel title={tr("Helpful resources")}>
        <nav className="grid gap-2" aria-label={tr("Helpful resources")}>
          {[
            { to: "/safety", icon: "book", label: "Community Safety" },
            { to: "/analysis", icon: "shield", label: "Analyze Scam" },
            { to: "/leaderboard", icon: "trophy", label: "Leaderboard" },
          ].map((item) => <Link key={item.to} to={item.to} className="community-body flex min-h-9 items-center gap-2 font-medium text-muted hover:text-brand-800"><Icon name={item.icon} size={16} />{tr(item.label)}</Link>)}
        </nav>
      </Panel>
    </aside>
  );
}
