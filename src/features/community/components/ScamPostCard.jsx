import { useInterfaceTranslation } from "../../../locales/useInterfaceTranslation";
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

function ImageEvidence({ src, alt, onOpen }) {
  if (!src) return null;
  return (
    <button
      type="button"
      className="group mt-3 block w-full overflow-hidden rounded-lg border border-[#e1e6ed] bg-[#f5f8fc] text-left"
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
    >
      <img
        alt={alt}
        className="h-80 w-full object-cover transition duration-200 group-hover:scale-[1.01]"
        onError={({ currentTarget }) => {
          currentTarget.onerror = null;
          currentTarget.parentElement?.classList.add("hidden");
        }}
        loading="lazy"
        referrerPolicy="no-referrer"
        src={src}
      />
    </button>
  );
}

function ImageLightbox({ alt, src, onClose }) {
  const { t } = useTranslation();

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#071a33]/90 p-4 sm:p-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section className="relative flex h-full w-full items-center justify-center" role="dialog" aria-modal="true" aria-label={alt}>
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          referrerPolicy="no-referrer"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="absolute right-0 top-0 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-brand-900 shadow-lg transition hover:bg-white"
        >
          <Icon name="close" size={22} />
        </button>
      </section>
    </div>
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
        className={`mb-1 whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-[#44536a] ${expanded ? "" : "line-clamp-3"}`}
      >
        {children}
      </p>
      {hasOverflow || expanded ? (
        <button
          aria-expanded={expanded}
          className="border-0 bg-transparent p-0 text-sm font-semibold text-brand-700 hover:text-brand-900"
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((value) => !value);
          }}
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

export function PostActions({
  onShare,
  onOpenComments,
  onToggleSave,
  onToggleLike,
  post,
}) {
  const tr = useInterfaceTranslation();
  const { t } = useTranslation();
  const [likePending, setLikePending] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePending, setSharePending] = useState(false);
  const [savePending, setSavePending] = useState(false);
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

  const toggleSave = async () => {
    if (savePending) return;
    setSavePending(true);
    setError("");
    try {
      await onToggleSave();
    } catch (requestError) {
      setError(apiErrorMessage(requestError, t("community.save")));
    } finally {
      setSavePending(false);
    }
  };

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
      <div className="flex min-h-8 flex-wrap items-center gap-1 px-3 pb-3 sm:pb-4">
        <button
          aria-label={`${t("community.like")}: ${post.interaction.likeCount}`}
          aria-pressed={post.interaction.likedByMe}
          title={t("community.like")}
          className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition hover:bg-[#f2f5f8] ${post.interaction.likedByMe ? "text-red-600 [&_svg]:fill-current" : "text-[#61718a] hover:text-brand-700"}`}
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
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold text-[#61718a] transition hover:bg-[#f2f5f8] hover:text-brand-700"
          onClick={onOpenComments}
          type="button"
        >
          <Icon name="message" size={15} />
          <span className="text-xs">{post.interaction.commentCount}</span>
        </button>
        {onToggleSave ? (
          <button
            aria-label={post.interaction.savedByMe ? t("Remove saved post") : t("Save post")}
            aria-pressed={post.interaction.savedByMe}
            title={post.interaction.savedByMe ? t("Remove saved post") : t("Save post")}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition hover:bg-[#f2f5f8] ${post.interaction.savedByMe ? "text-brand-800 [&_svg]:fill-current" : "text-[#61718a] hover:text-brand-700"}`}
            disabled={savePending}
            onClick={toggleSave}
            type="button"
          >
            <Icon name="bookmark" size={15} />
          </button>
        ) : null}
        <div className="relative">
          <button
            aria-label={t("community.share")}
            aria-expanded={shareOpen}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold text-[#61718a] transition hover:bg-[#f2f5f8] hover:text-brand-700"
            disabled={sharePending}
            onClick={openShareOptions}
            title={t("community.share")}
            type="button"
          >
            <Icon name="share" size={15} />
          </button>
          {shareOpen ? (
            <div className="absolute bottom-full right-0 sm:right-2 z-10 mb-2 min-w-40 rounded-lg border border-line bg-white p-1.5 shadow-lg">
              <button
                className="w-full rounded-md border-0 bg-transparent px-3 py-2 text-left text-xs font-semibold text-[#3f4e66] hover:bg-brand-100 hover:text-brand-800"
                onClick={shareToTelegram}
                type="button"
              >
                {t("community.shareToTelegram")}
              </button>
              <button
                className="w-full rounded-md border-0 bg-transparent px-3 py-2 text-left text-xs font-semibold text-[#3f4e66] hover:bg-brand-100 hover:text-brand-800"
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
        <p className="mx-3 mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 sm:mx-5 sm:mb-4">
          {tr(error)}
        </p>
      ) : null}
      {notice ? (
        <p className="mx-3 mb-3 rounded-md bg-green-50 px-3 py-2 text-xs text-green-700 sm:mx-5 sm:mb-4">
          {notice}
        </p>
      ) : null}
    </>
  );
}

export function ScamPostCard({
  onOpenPost,
  onOpenComments,
  onShare,
  onToggleSave,
  onToggleLike,
  post,
}) {
  const { i18n, t } = useTranslation();
  const authorName = post.author?.username || post.author?.name || t("community.safetyTeam");
  const imageSource = post.imageUrl || post.image;
  const [imageOpen, setImageOpen] = useState(false);

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
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2670c9]">
                <Icon name="shield" size={12} />
                {t("community.verifiedBy")}
              </span>
            </div>
            <p className="m-0 text-xs text-[#8490a2]">
              {postTimestamp(post.publishedAt, i18n.language)} · {t("community.public")}
            </p>
          </div>
          <IconButton label={t("community.moreOptions")} icon="more" />
        </header>
        <div className=" flex flex-wrap items-center gap-2">
          <RiskBadge level={post.risk} />
          <CategoryBadge category={post.category} />
        </div>
        <section
          className={`mt-2 flex flex-col ${onOpenPost ? "cursor-pointer" : ""}`}
          onClick={onOpenPost}
        >
          <h2 className="m-0 text-sm font-bold leading-6 text-ink">
            {post.title}
          </h2>
          <ExpandableDescription>{post.content}</ExpandableDescription>
          <ImageEvidence alt={post.title} src={imageSource} onOpen={() => setImageOpen(true)} />
        </section>
      </article>
      <PostActions
        onShare={onShare}
        onToggleSave={onToggleSave}
        onOpenComments={onOpenComments}
        onToggleLike={onToggleLike}
        post={post}
      />
      {imageOpen && imageSource ? <ImageLightbox alt={post.title} src={imageSource} onClose={() => setImageOpen(false)} /> : null}
    </Card>
  );
}
