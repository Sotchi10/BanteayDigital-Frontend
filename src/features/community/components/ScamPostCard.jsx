import { useEffect, useRef, useState } from "react";
import { Avatar, Badge, Card, Icon, IconButton } from "../../../components/ui";

export const RiskBadge = ({ level, aiAssessed = false }) => <Badge tone={aiAssessed ? "ai" : level.toLowerCase()}><Icon name="alert" size={13} />{aiAssessed ? `AI assessment · ${level} risk` : `${level} risk`}</Badge>;
export const CategoryBadge = ({ category }) => <Badge tone="category">{category}</Badge>;

function EvidenceImage({ src, alt }) {
  return <img className="mt-4 aspect-video max-h-[360px] w-full rounded-xl border border-line bg-[#f5f8fc] object-cover" src={src || "/evidence-placeholder.svg"} alt={alt} loading="lazy" onError={({ currentTarget }) => { currentTarget.onerror = null; currentTarget.src = "/evidence-placeholder.svg"; }} />;
}

function ExpandableDescription({ children }) {
  const descriptionRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  useEffect(() => {
    const element = descriptionRef.current;
    if (!element) return undefined;
    const updateOverflow = () => setHasOverflow(element.scrollHeight > element.clientHeight);
    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(element);
    return () => observer.disconnect();
  }, [children]);
  return <div><p ref={descriptionRef} className={`mb-1 mt-2 text-[15px] leading-7 text-[#40546b] ${expanded ? "" : "line-clamp-2"}`}>{children}</p>{hasOverflow ? <button className="min-h-11 border-0 bg-transparent p-0 text-sm font-semibold text-brand-800 hover:text-brand-700" type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>{expanded ? "Show less" : "Read full warning"}</button> : null}</div>;
}

function PostActions({ post }) {
  const actions = [{ icon: "heart", label: "Helpful", count: post.helpful }, { icon: "message", label: "Comment", count: post.comments }, { icon: "share", label: "Share", count: post.shares }];
  return <div className="grid grid-cols-4 border-t border-line">{actions.map((action) => <button key={action.label} className="flex min-h-12 items-center justify-center gap-1.5 border-0 bg-transparent px-1 text-xs font-semibold text-muted transition hover:bg-[#f8fafc] hover:text-brand-800" type="button" aria-label={`${action.label}, ${action.count}`}><Icon name={action.icon} size={17} /><span>{action.count}</span><span className="hidden sm:inline">{action.label}</span></button>)}<button className="flex min-h-12 items-center justify-center gap-1.5 border-0 bg-transparent px-1 text-xs font-semibold text-muted transition hover:bg-[#f8fafc] hover:text-brand-800" type="button" aria-label="Save report"><Icon name="bookmark" size={17} /><span className="hidden sm:inline">Save</span></button></div>;
}

export function ScamPostCard({ post }) {
  return (
    <Card className="overflow-hidden">
      <article aria-labelledby={`report-title-${post.id}`}>
        <div className="p-4 sm:p-5">
          <header className="flex items-center gap-3">
            <Avatar name={post.author} tone="indigo" />
            <div className="min-w-0 flex-1"><strong className="block truncate text-sm">{post.author}</strong><p className="m-0 text-xs text-muted">{post.time} · Community report</p></div>
            <IconButton label="More report options" icon="more" />
          </header>
          <div className="mt-4 flex flex-wrap gap-2"><CategoryBadge category={post.category} /><RiskBadge level={post.risk} aiAssessed={post.aiAssessed} /></div>
          <h2 id={`report-title-${post.id}`} className="mb-0 mt-4 text-lg font-bold leading-snug tracking-[-0.01em] text-brand-900">{post.title}</h2>
          <ExpandableDescription>{post.description}</ExpandableDescription>
          <EvidenceImage src={post.image} alt={`Evidence submitted for report: ${post.title}`} />
          <div className={`mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm ${post.verified ? "border-[#b9e4d7] bg-[#eaf8f3] text-[#116c59]" : "border-[#dce4ed] bg-[#f2f4f7] text-[#52647a]"}`}>
            <Icon name={post.verified ? "check" : "clock"} size={18} className="mt-0.5 shrink-0" />
            <div><strong className="block">{post.verified ? "Verified by moderator" : "Community report · Not yet verified"}</strong><span className="text-xs">{post.verified ? "Evidence reviewed by the BanteayDigital moderation team." : "Review pending. Use caution while details are checked."}</span></div>
          </div>
        </div>
        <PostActions post={post} />
      </article>
    </Card>
  );
}
