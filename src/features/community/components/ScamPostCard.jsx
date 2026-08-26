import { useEffect, useRef, useState } from "react";
import { Avatar, Badge, Card, Icon, IconButton } from "../../../components/ui";

export const RiskBadge = ({ level }) => (
  <Badge tone={level.toLowerCase()}>{level} risk</Badge>
);

export const CategoryBadge = ({ category }) => (
  <Badge tone="category">{category}</Badge>
);

function ImagePlaceholder({ src, alt }) {
  return (
    <img
      className="mt-3 h-80 w-full rounded-lg border border-[#e1e6ed] bg-[#f5f8fc] object-cover"
      src={src || "/evidence-placeholder.svg"}
      alt={alt}
      onError={({ currentTarget }) => {
        currentTarget.onerror = null;
        currentTarget.src = "/evidence-placeholder.svg";
      }}
    />
  );
}

function ExpandableDescription({ children }) {
  const descriptionRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const element = descriptionRef.current;
    if (!element) return undefined;

    const updateOverflow = () => {
      setHasOverflow(element.scrollHeight > element.clientHeight);
    };

    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(element);

    return () => observer.disconnect();
  }, [children]);

  return (
    <div>
      <p
        ref={descriptionRef}
        className={`mb-1 text-[15px] leading-relaxed text-[#44536a] ${expanded ? "" : "line-clamp-2"}`}
      >
        {children}
      </p>
      {hasOverflow && (
        <button
          className="border-0 bg-transparent p-0 text-[13px] font-semibold text-brand-700 hover:text-brand-900"
          type="button"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}

function PostActions({ post }) {
  return (
    <div className="flex min-h-15 items-center border-t border-[#e5eaf1]">
      <button className="flex flex-1 items-center justify-center gap-1 border-0 bg-transparent text-[11px] font-semibold text-[#61718a]">
        <Icon name="heart" />
        {post.helpful} <span className="max-[800px]:hidden">Helpful</span>
      </button>
      <button className="flex flex-1 items-center justify-center gap-1 border-0 bg-transparent text-[11px] font-semibold text-[#61718a]">
        <Icon name="message" />
        {post.comments} <span className="max-[800px]:hidden">Comments</span>
      </button>
      <button className="flex flex-1 items-center justify-center gap-1 border-0 bg-transparent text-[11px] font-semibold text-[#61718a]">
        <Icon name="share" />
        {post.shares} <span className="max-[800px]:hidden">Share</span>
      </button>
      <IconButton label="Save alert" icon="bookmark" />
    </div>
  );
}

export function ScamPostCard({ post }) {
  return (
    <Card className="p-4 pb-0">
      <div className="mb-2 flex items-center gap-2">
        <Avatar name={post.author} tone="indigo" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <strong className="text-[15px]">{post.author}</strong>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#2670c9]">
              <Icon name="shield" size={12} />
              Verified by BanteayDigital
            </span>
          </div>
          <p className="m-0 text-[12px] text-[#8490a2]">{post.time} · Public</p>
        </div>
        <IconButton label="More options" icon="more" />
      </div>
      <RiskBadge level={post.risk} />
      <div className="mt-2">
        <h2 className="m-0 text-[15px] font-bold">{post.title}</h2>
        <ExpandableDescription>{post.description}</ExpandableDescription>
        <ImagePlaceholder src={post.image} alt={post.title} />

        <div className="flex gap-5 my-5">
          <CategoryBadge category={post.category} />
        </div>
      </div>
      <PostActions post={post} />
    </Card>
  );
}
