import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Badge, Card, Icon, IconButton } from "../../../components/ui";
import { apiErrorMessage } from "../api/communityApi";

export function RiskBadge({ level }) {
  const { t } = useTranslation();
  if (!level) return null;
  const normalizedLevel = `${level}`.charAt(0).toUpperCase() + `${level}`.slice(1).toLowerCase();
  return <Badge tone={normalizedLevel === "Critical" ? "high" : normalizedLevel.toLowerCase()}>{t("community.risk", { level: t(`community.riskLevels.${normalizedLevel}`, { defaultValue: normalizedLevel }) })}</Badge>;
}
export function CategoryBadge({ category }) {
  const { t } = useTranslation();
  const categoryKey = `${category || ""}`.trim().toUpperCase().replaceAll(" ", "_");
  return category ? <Badge tone="category">{t(`community.categories.${categoryKey}`, { defaultValue: category })}</Badge> : null;
}

function postTimestamp(value, locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return formatter.format(days, "day");
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

function ImageEvidence({ src, alt }) {
  if (!src) return null;
  return (
    <img
      alt={alt}
      className="mt-3 h-80 w-full rounded-lg border border-[#e1e6ed] bg-[#f5f8fc] object-cover"
      onError={({ currentTarget }) => {
        currentTarget.onerror = null;
        currentTarget.classList.add("hidden");
      }}
      loading="lazy"
      referrerPolicy="no-referrer"
      src={src}
    />
  );
}

function ExpandableDescription({ children }) {
  const { t } = useTranslation();
  const descriptionRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const element = descriptionRef.current;
    if (!element) return undefined;
    const updateOverflow = () =>
      setHasOverflow(element.scrollHeight > element.clientHeight);
    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(element);
    return () => observer.disconnect();
  }, [children]);

  return (
    <div>
      <p
        ref={descriptionRef}
        className={`mb-1 whitespace-pre-wrap wrap-break-word text-[15px] leading-relaxed text-[#44536a] ${expanded ? "" : "line-clamp-3"}`}
      >
        {children}
      </p>
      {hasOverflow ? (
        <button
          className="border-0 bg-transparent p-0 text-[13px] font-semibold text-brand-700 hover:text-brand-900"
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          {expanded ? t("community.seeLess") : t("community.seeMore")}
        </button>
      ) : null}
    </div>
  );
}

function copyText(value) {
  if (navigator.clipboard && window.isSecureContext)
    return navigator.clipboard.writeText(value);
  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(input);
  return copied ? Promise.resolve() : Promise.reject(new Error("Copy failed"));
}

function PostActions({
  onShare,
  onOpenComments,
  onToggleLike,
  post,
}) {
  const { t } = useTranslation();
  const [likePending, setLikePending] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePending, setSharePending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const toggleLike = async () => {
    if (likePending) return;
    setLikePending(true);
    setError("");
    try {
      await onToggleLike();
    } catch (requestError) {
      setError(apiErrorMessage(requestError, t("community.like")));
    } finally {
      setLikePending(false);
    }
  };

  const shareUrl = `${window.location.origin}/posts/${encodeURIComponent(post.id)}`;

  const shareNative = async () => {
    setSharePending(true);
    setError("");
    setNotice("");
    try {
      await navigator.share({
        title: post.title,
        text: t("community.verifiedSafetyAlert"),
        url: shareUrl,
      });
      await onShare("NATIVE");
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setError(
          apiErrorMessage(requestError, t("community.share")),
        );
      }
    } finally {
      setSharePending(false);
    }
  };

  const openShareOptions = () => {
    if (typeof navigator.share === "function") {
      shareNative();
      return;
    }
    setShareOpen((value) => !value);
  };

  const shareToTelegram = async () => {
    setShareOpen(false);
    setSharePending(true);
    setError("");
    setNotice("");
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(t("community.verifiedSafetyAlert"))}`;
    window.open(telegramUrl, "_blank", "noopener,noreferrer");
    try {
      await onShare("TELEGRAM");
    } catch (requestError) {
      setError(
        apiErrorMessage(
          requestError,
          t("community.share"),
        ),
      );
    } finally {
      setSharePending(false);
    }
  };

  const copyLink = async () => {
    setShareOpen(false);
    setSharePending(true);
    setError("");
    setNotice("");
    try {
      await copyText(shareUrl);
      await onShare("COPY_LINK");
      setNotice(t("community.postLinkCopied"));
    } catch (requestError) {
      setError(apiErrorMessage(requestError, t("community.copyPostLink")));
    } finally {
      setSharePending(false);
    }
  };

  return (
    <>
      <div className="grid min-h-10 grid-cols-3 border-t border-line">
        <button
          aria-label={`${t("community.like")}: ${post.interaction.likeCount}`}
          aria-pressed={post.interaction.likedByMe}
          title={t("community.like")}
          className={`flex min-w-0 items-center justify-center gap-1.5 border-0 bg-transparent px-2 text-xs font-semibold ${post.interaction.likedByMe ? "text-red-600 [&_svg]:fill-current" : "text-[#61718a]"}`}
          disabled={likePending}
          onClick={toggleLike}
          type="button"
        >
          <Icon name="heart" size={15} />
          <span className="text-xs">{post.interaction.likeCount}</span>
        </button>
        <button
          aria-label={`${t("community.comment")}: ${post.interaction.commentCount}`}
          title={t("community.comment")}
          className="flex min-w-0 items-center justify-center gap-1.5 border-x border-line bg-transparent px-2 text-xs font-semibold text-[#61718a] hover:text-brand-700"
          onClick={onOpenComments}
          type="button"
        >
          <Icon name="message" size={15} />
          <span className="text-xs">{post.interaction.commentCount}</span>
        </button>
        <div className="relative flex min-w-0">
          <button
            aria-label={t("community.share")}
            aria-expanded={shareOpen}
            className="flex w-full items-center justify-center gap-1.5 border-0 bg-transparent px-2 text-xs font-semibold text-[#61718a] hover:text-brand-700"
            disabled={sharePending}
            onClick={openShareOptions}
            title={t("community.share")}
            type="button"
          >
            <Icon name="share" size={15} />
          </button>
          {shareOpen ? (
            <div className="absolute bottom-full right-2 z-10 mb-2 min-w-40 rounded-lg border border-line bg-white p-1.5 shadow-lg">
              <button
                className="w-full rounded-md border-0 bg-transparent px-3 py-2 text-left text-[12px] font-semibold text-[#3f4e66] hover:bg-brand-100 hover:text-brand-800"
                onClick={shareToTelegram}
                type="button"
              >
                {t("community.shareToTelegram")}
              </button>
              <button
                className="w-full rounded-md border-0 bg-transparent px-3 py-2 text-left text-[12px] font-semibold text-[#3f4e66] hover:bg-brand-100 hover:text-brand-800"
                onClick={copyLink}
                type="button"
              >
                {t("community.copyPostLink")}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {error ? (
        <p className="m-0 border-t border-red-100 bg-red-50 px-3 py-2 text-[11px] text-red-700">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="m-0 border-t border-green-100 bg-green-50 px-3 py-2 text-[11px] text-green-700">
          {notice}
        </p>
      ) : null}
    </>
  );
}

export function ScamPostCard({
  onOpenComments,
  onShare,
  onToggleLike,
  post,
}) {
  const { i18n, t } = useTranslation();
  const authorName = post.author?.username || post.author?.name || t("community.safetyTeam");

  return (
    <Card className="flex w-full flex-col overflow-hidden p-0">
      <article className="flex flex-col p-4 sm:p-5">
        <header className="flex min-h-11 items-start gap-3">
          <Avatar imageUrl={post.author?.avatarUrl} name={authorName} tone="indigo" />
          <div className="min-w-0 flex-1">
            <div className="flex min-h-5 flex-wrap items-center gap-x-2 gap-y-0.5">
              <strong className="text-sm font-bold text-ink">
                {authorName}
              </strong>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2670c9]">
                <Icon name="shield" size={12} />
                {t("community.verifiedBy")}
              </span>
            </div>
            <p className="m-0 text-[12px] text-[#8490a2]">
              {postTimestamp(post.publishedAt, i18n.language)} · {t("community.public")}
            </p>
          </div>
          <IconButton label={t("community.moreOptions")} icon="more" />
        </header>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <RiskBadge level={post.risk} />
          <CategoryBadge category={post.category} />
        </div>
        <section className="mt-3 flex flex-col">
          <h2 className="m-0 text-[17px] font-bold leading-6 text-ink">
            {post.title}
          </h2>
          <ExpandableDescription>{post.content}</ExpandableDescription>
          <ImageEvidence alt={post.title} src={post.imageUrl || post.image} />
        </section>
      </article>
      <PostActions
        onShare={onShare}
        onOpenComments={onOpenComments}
        onToggleLike={onToggleLike}
        post={post}
      />
    </Card>
  );
}
