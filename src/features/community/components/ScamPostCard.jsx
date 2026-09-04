import { useEffect, useRef, useState } from "react";
import { Avatar, Badge, Card, Icon } from "../../../components/ui";

export const RiskBadge = ({ level, aiAssessed = false }) => <Badge tone={aiAssessed ? "ai" : level.toLowerCase()}><Icon name="alert" size={13} />{aiAssessed ? `AI assessment · ${level} risk` : `${level} risk`}</Badge>;
export const CategoryBadge = ({ category }) => <Badge tone="category">{category}</Badge>;

function EvidenceImage({ src, alt }) {
  return <img className="mt-4 h-[280px] w-full rounded-xl border border-line bg-[#f5f8fc] object-cover sm:h-[340px]" src={src || "/evidence-placeholder.svg"} alt={alt} loading="lazy" onError={({ currentTarget }) => { currentTarget.onerror = null; currentTarget.src = "/evidence-placeholder.svg"; }} />;
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
  const [helpful, setHelpful] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post.comments);
  const [shareStatus, setShareStatus] = useState("");

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: post.title, text: post.description, url: window.location.href });
      else await navigator.clipboard.writeText(window.location.href);
      setShareStatus(navigator.share ? "Shared" : "Link copied");
    } catch {
      setShareStatus("");
    }
  };

  return <><div className="grid grid-cols-4 border-t border-line"><button className={`flex min-h-12 items-center justify-center gap-1.5 border-0 bg-transparent px-1 text-xs font-semibold transition hover:bg-[#f8fafc] ${helpful ? "text-risk-high" : "text-muted hover:text-brand-800"}`} type="button" aria-pressed={helpful} onClick={() => setHelpful((value) => !value)}><Icon name="heart" size={17} /><span>{post.helpful + (helpful ? 1 : 0)}</span><span className="hidden sm:inline">Helpful</span></button><button className="flex min-h-12 items-center justify-center gap-1.5 border-0 bg-transparent px-1 text-xs font-semibold text-muted hover:bg-[#f8fafc] hover:text-brand-800" type="button" aria-expanded={commenting} onClick={() => setCommenting((value) => !value)}><Icon name="message" size={17} /><span>{comments}</span><span className="hidden sm:inline">Comment</span></button><button className="flex min-h-12 items-center justify-center gap-1.5 border-0 bg-transparent px-1 text-xs font-semibold text-muted hover:bg-[#f8fafc] hover:text-brand-800" type="button" onClick={share}><Icon name="share" size={17} /><span>{post.shares}</span><span className="hidden sm:inline">{shareStatus || "Share"}</span></button><button className={`flex min-h-12 items-center justify-center gap-1.5 border-0 bg-transparent px-1 text-xs font-semibold hover:bg-[#f8fafc] ${saved ? "text-brand-800" : "text-muted hover:text-brand-800"}`} type="button" aria-pressed={saved} onClick={() => setSaved((value) => !value)}><Icon name="bookmark" size={17} /><span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span></button></div>{commenting ? <form className="flex gap-2 border-t border-line bg-[#f8fafc] p-3" onSubmit={(event) => { event.preventDefault(); if (!comment.trim()) return; setComments((value) => value + 1); setComment(""); setCommenting(false); }}><label className="sr-only" htmlFor={`comment-${post.id}`}>Add a helpful comment</label><input id={`comment-${post.id}`} value={comment} onChange={(event) => setComment(event.target.value)} autoFocus className="min-h-11 min-w-0 flex-1 rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-brand-700" placeholder="Add a helpful comment…" /><button type="submit" className="min-h-11 rounded-lg bg-brand-800 px-4 text-sm font-bold text-white">Post</button></form> : null}</>;
}

export function ScamPostCard({ post }) {
  return (
    <Card className="overflow-hidden">
      <article aria-labelledby={`report-title-${post.id}`}>
        <div className="p-4 sm:p-5">
          <header className="flex items-center gap-3">
            <Avatar name={post.author} tone="indigo" />
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-1.5"><strong className="truncate text-[15px]">{post.author}</strong>{post.verified ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700"><Icon name="shield" size={13} />Verified</span> : null}</div><p className="m-0 text-xs text-muted">{post.time} · Community report</p></div>
          </header>
          <div className="mt-4 flex flex-wrap gap-2"><CategoryBadge category={post.category} /><RiskBadge level={post.risk} aiAssessed={post.aiAssessed} /></div>
          <h2 id={`report-title-${post.id}`} className="mb-0 mt-4 text-lg font-bold leading-snug tracking-[-0.01em] text-brand-900">{post.title}</h2>
          <ExpandableDescription>{post.description}</ExpandableDescription>
          <EvidenceImage src={post.image} alt={`Evidence submitted for report: ${post.title}`} />
          <div className={`mt-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${post.verified ? "border-[#b9e4d7] bg-[#eaf8f3] text-[#116c59]" : "border-[#dce4ed] bg-[#f2f4f7] text-[#52647a]"}`}>
            <Icon name={post.verified ? "check" : "clock"} size={18} className="mt-0.5 shrink-0" />
            <div><strong className="block">{post.verified ? "Verified by moderator" : "Community report · Not yet verified"}</strong><span className="text-xs">{post.verified ? "Evidence reviewed by the BanteayDigital moderation team." : "Review pending. Use caution while details are checked."}</span></div>
          </div>
        </div>
        <PostActions post={post} />
      </article>
    </Card>
  );
}
