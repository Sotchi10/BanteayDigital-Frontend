import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, Badge, Card, Icon } from "../../components/ui";
import {
  getCommunityPost,
  getCurrentUser,
  likeCommunityPost,
  recordCommunityPostShare,
  saveCommunityPost,
  unlikeCommunityPost,
  unsaveCommunityPost,
} from "./api/communityApi";
import { CommentSection } from "./components/CommentSection";
import {
  CategoryBadge,
  PostActions,
  RiskBadge,
} from "./components/ScamPostCard";

const publishedDate = (value, locale) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
};

export function PostDetailPage() {
  const { postId } = useParams();
  const { i18n, t } = useTranslation();
  const [post, setPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadPost = async () => {
      setLoading(true);
      setError("");
      try {
        const [response, user] = await Promise.all([getCommunityPost(postId), getCurrentUser()]);
        if (!active) return;
        setPost(response.post);
        setCurrentUser(user);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || t("community.noAlerts"));
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadPost();
    return () => {
      active = false;
    };
  }, [postId, t]);

  const updateInteraction = (transform) => {
    setPost((current) =>
      current
        ? { ...current, interaction: transform(current.interaction) }
        : current,
    );
  };

  const toggleLike = async () => {
    if (!post) return;
    if (!currentUser) {
      const unauthenticated = new Error(t("community.signInToLike"));
      unauthenticated.response = {
        status: 401,
        data: { message: t("community.signInToLike") },
      };
      throw unauthenticated;
    }
    const previous = post.interaction;
    const nextLiked = !previous.likedByMe;
    updateInteraction(() => ({
      ...previous,
      likedByMe: nextLiked,
      likeCount: Math.max(0, previous.likeCount + (nextLiked ? 1 : -1)),
    }));
    try {
      const result = nextLiked
        ? await likeCommunityPost(post.id)
        : await unlikeCommunityPost(post.id);
      updateInteraction((interaction) => ({
        ...interaction,
        likedByMe: result.liked,
        likeCount: result.likeCount,
      }));
    } catch (requestError) {
      updateInteraction(() => previous);
      throw requestError;
    }
  };

  const recordShare = async (channel) => {
    const result = await recordCommunityPostShare(post.id, channel);
    updateInteraction((interaction) => ({
      ...interaction,
      shareCount: result.shareCount,
    }));
    return result;
  };

  const toggleSave = async () => {
    if (!post) return;
    if (!currentUser) {
      const unauthenticated = new Error(t("community.signInToSave"));
      unauthenticated.response = {
        status: 401,
        data: { message: t("community.signInToSave") },
      };
      throw unauthenticated;
    }
    const previous = post.interaction;
    const nextSaved = !previous.savedByMe;
    updateInteraction(() => ({ ...previous, savedByMe: nextSaved }));
    try {
      const result = nextSaved
        ? await saveCommunityPost(post.id)
        : await unsaveCommunityPost(post.id);
      updateInteraction((interaction) => ({
        ...interaction,
        savedByMe: result.saved,
      }));
    } catch (requestError) {
      updateInteraction(() => previous);
      throw requestError;
    }
  };

  const changeCommentCount = (amount) => {
    updateInteraction((interaction) => ({
      ...interaction,
      commentCount: Math.max(0, interaction.commentCount + amount),
    }));
  };

  if (loading) {
    return (
      <main className="min-w-0 lg:px-6" id="main-content">
        <Card className="p-8 text-center text-sm text-muted">
          {t("community.loadingAlerts")}
        </Card>
      </main>
    );
  }
  if (error || !post) {
    return (
      <main className="min-w-0 lg:px-6" id="main-content">
        <Card className="p-8 text-center">
          <p className="m-0 text-sm text-risk-high">
            {error || t("community.noAlerts")}
          </p>
          <Link
            className="mt-5 inline-flex min-h-10 items-center rounded-lg bg-brand-800 px-4 text-sm font-bold text-white"
            to="/"
          >
            {t("community.feed")}
          </Link>
        </Card>
      </main>
    );
  }

  const authorName =
    post.author?.username || post.author?.name || t("community.safetyTeam");
  const imageSource = post.imageUrl || post.image;
  return (
    <main
      className="mx-auto flex min-w-0 max-w-3xl flex-col gap-4"
      id="main-content"
    >
      <Link
        to="/"
        className="inline-flex min-h-10 w-fit items-center gap-2 text-sm font-bold text-brand-800 hover:text-brand-700"
      >
        <Icon name="chevron" size={17} className="rotate-180" />
        {t("community.feed")}
      </Link>

      <Card className="overflow-hidden rounded-lg p-0 shadow-none">
        <header className="flex items-center gap-3 border-b border-line bg-white p-5 sm:p-6">
          <Avatar
            imageUrl={post.author?.avatarUrl}
            name={authorName}
            tone="indigo"
            size="sm"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <strong className="community-author text-ink">
                {authorName}
              </strong>
              <span className="community-author inline-flex items-center gap-1 text-[#2670c9]">
                <Icon name="shield" size={12} />
                {t("community.verified")}
              </span>
            </div>
            <p className="community-meta mb-0 mt-0.5">
              {t("community.published", {
                date: publishedDate(post.publishedAt, i18n.language),
              })}
            </p>
          </div>
        </header>

        <article className="bg-white p-5 sm:p-6">
          <div className="flex flex-wrap gap-1.5">
            <RiskBadge level={post.risk} />
            <CategoryBadge category={post.category} />
          </div>
          <h1 className="community-post-title m-0 mt-2">
            {post.title}
          </h1>
          <p className="community-body mb-3 whitespace-pre-wrap wrap-break-word text-[#40546b]">
            {post.content}
          </p>
          {imageSource ? (
            <figure className="m-0 overflow-hidden rounded-md border border-line bg-canvas">
              <img
                alt={post.title}
                className="max-h-[400px] w-full object-contain"
                loading="lazy"
                src={imageSource}
              />
              <figcaption className="community-meta border-t border-line bg-white px-3 py-2">
                {t("community.attachedEvidence")}
              </figcaption>
            </figure>
          ) : null}
        </article>

        <div className="bg-white">
          <PostActions
            post={post}
            onToggleLike={toggleLike}
            onToggleSave={toggleSave}
            onShare={recordShare}
            onOpenComments={() =>
              document
                .getElementById("post-discussion")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        </div>
      </Card>

      <Card className="overflow-hidden p-0 shadow-none" id="post-discussion">
        <header className="flex items-center justify-between border-b border-line bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 className="community-section-title m-0 mt-1">
              {t("community.comments")}
            </h2>
          </div>
          <Badge tone="blue">{post.interaction.commentCount}</Badge>
        </header>
        <CommentSection
          key={post.id}
          className="border-0 bg-[#fbfcfe] px-5 py-5 sm:px-6"
          compact
          composerAfter
          currentUser={currentUser}
          onCountChange={changeCommentCount}
          postId={post.id}
        />
      </Card>
    </main>
  );
}
