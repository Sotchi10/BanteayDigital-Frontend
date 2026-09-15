import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Badge, Icon } from "../../../components/ui";
import { CommentSection } from "./CommentSection";
import { CategoryBadge, RiskBadge } from "./ScamPostCard";

const publishedDate = (value, locale) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
};

export function PostDiscussionModal({
  currentUser,
  onClose,
  onCommentCountChange,
  post,
}) {
  const { i18n, t } = useTranslation();
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShowImage(true));
    return () => cancelAnimationFrame(frame);
  }, [post.id]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
    };
  }, []);

  const authorName = post.author?.username || post.author?.name || t("community.safetyTeam");
  const imageSource = post.imageUrl || post.image;
  return (
    <div
      className="fixed inset-0 z-60 grid place-items-center overscroll-contain bg-[#071a33]/55 p-0 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        aria-labelledby="discussion-title"
        aria-modal="true"
        className="flex h-[100dvh] w-full max-w-2xl flex-col overflow-hidden rounded-none border-0 bg-white shadow-2xl sm:h-[min(760px,calc(100dvh-2.5rem))] sm:rounded-2xl sm:border sm:border-line"
        role="dialog"
      >
        <article className="max-h-[46%] shrink-0 overflow-y-auto border-b border-line bg-white">
          <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar imageUrl={post.author?.avatarUrl} name={authorName} tone="indigo" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <strong className="truncate text-sm text-ink">
                    {authorName}
                  </strong>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2670c9]">
                    <Icon name="shield" size={12} />
                    {t("community.verified")}
                  </span>
                </div>
                <p className="mb-0 mt-0.5 text-[11px] text-muted">
                  {t("community.published", { date: publishedDate(post.publishedAt, i18n.language) })}
                </p>
              </div>
            </div>
            <button
              aria-label={t("community.closeDiscussion")}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted hover:bg-brand-100 hover:text-brand-800 text-lg font-bold"
              onClick={onClose}
              type="button"
            >
              ×
            </button>
          </header>
          <div className="space-y-3 p-4 sm:p-5">
            <p className="m-0 text-xs font-bold uppercase tracking-widest text-brand-700">
              {t("community.verifiedSafetyAlert")}
            </p>
            <div className="flex flex-wrap gap-2">
              <RiskBadge level={post.risk} />
              <CategoryBadge category={post.category} />
            </div>
            <h1 id="discussion-title" className="m-0 text-lg font-bold leading-7 text-brand-900 sm:text-xl">
              {post.title}
            </h1>
            <p className="m-0 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-[#40546b]">
              {post.content}
            </p>
            {showImage && imageSource ? (
              <figure className="m-0 overflow-hidden rounded-xl border border-line bg-[#f5f8fc]">
                <img
                  alt={post.title}
                  className="aspect-video max-h-64 w-full object-cover"
                  decoding="async"
                  loading="lazy"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.parentElement?.classList.add("hidden");
                  }}
                  src={imageSource}
                />
                <figcaption className="border-t border-line bg-white px-3 py-2 text-xs font-medium text-muted">
                  {t("community.attachedEvidence")}
                </figcaption>
              </figure>
            ) : null}
            <div className="border-t border-line pt-3">
              <Badge tone="blue">{t("community.communitySafetyAlert")}</Badge>
            </div>
          </div>
        </article>
        <aside
          className="flex min-h-0 flex-1 flex-col bg-[#fbfcfe]"
          aria-label={t("community.comments")}
        >
          <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-widest text-brand-700">
                {t("community.discussion")}
              </p>
              <h2 className="m-0 mt-0.5 text-base font-bold text-brand-900">
                {t("community.comments")}
              </h2>
            </div>
            <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-800">
              {post.interaction.commentCount}
            </span>
          </div>
          <CommentSection
            className="flex min-h-0 flex-1 flex-col border-0 bg-transparent px-4 py-4 sm:px-5"
            compact
            currentUser={currentUser}
            minimalComposer
            onCountChange={onCommentCountChange}
            pinnedComposer
            postId={post.id}
          />
        </aside>
      </section>
    </div>
  );
}
