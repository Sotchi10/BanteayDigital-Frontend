import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { useTranslation } from "react-i18next";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui";
import {
  apiErrorMessage,
  likeCommunityPost,
  listSavedCommunityPosts,
  recordCommunityPostShare,
  saveCommunityPost,
  unlikeCommunityPost,
  unsaveCommunityPost,
} from "./api/communityApi";
import { ScamPostCard } from "./components/ScamPostCard";

export function SavedPostsPage() {
  const tr = useInterfaceTranslation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listSavedCommunityPosts()
      .then((response) => {
        if (!active) return;
        setPosts(response.posts);
        setMeta(response.meta);
      })
      .catch((requestError) => {
        if (active) setError(apiErrorMessage(requestError, "Could not load saved posts."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const updateInteraction = (postId, transform) => {
    setPosts((current) => current.map((post) => (
      post.id === postId ? { ...post, interaction: transform(post.interaction) } : post
    )));
  };

  const toggleLike = async (postId) => {
    const post = posts.find((item) => item.id === postId);
    if (!post) return;
    const previous = post.interaction;
    const nextLiked = !previous.likedByMe;
    updateInteraction(postId, () => ({
      ...previous,
      likedByMe: nextLiked,
      likeCount: Math.max(0, previous.likeCount + (nextLiked ? 1 : -1)),
    }));
    try {
      const result = nextLiked ? await likeCommunityPost(postId) : await unlikeCommunityPost(postId);
      updateInteraction(postId, (interaction) => ({ ...interaction, likedByMe: result.liked, likeCount: result.likeCount }));
    } catch (requestError) {
      updateInteraction(postId, () => previous);
      throw requestError;
    }
  };

  const toggleSave = async (postId) => {
    const post = posts.find((item) => item.id === postId);
    if (!post) return;
    const previous = post.interaction;
    const nextSaved = !previous.savedByMe;
    updateInteraction(postId, () => ({ ...previous, savedByMe: nextSaved }));
    try {
      const result = nextSaved ? await saveCommunityPost(postId) : await unsaveCommunityPost(postId);
      if (!result.saved) {
        setPosts((current) => current.filter((item) => item.id !== postId));
        setMeta((current) => {
          if (!current) return current;
          const total = Math.max(0, current.total - 1);
          return { ...current, total, totalPages: Math.max(1, Math.ceil(total / current.limit)) };
        });
        const refreshLimit = Math.min(100, Math.max(meta?.limit || 20, posts.length));
        try {
          const refreshed = await listSavedCommunityPosts({ page: 1, limit: refreshLimit });
          setPosts(refreshed.posts);
          setMeta(refreshed.meta);
        } catch {
          // The post was already removed on the server; keep the local list consistent.
        }
      } else {
        updateInteraction(postId, (interaction) => ({ ...interaction, savedByMe: true }));
      }
    } catch (requestError) {
      updateInteraction(postId, () => previous);
      throw requestError;
    }
  };

  const recordShare = async (postId, channel) => {
    const result = await recordCommunityPostShare(postId, channel);
    updateInteraction(postId, (interaction) => ({ ...interaction, shareCount: result.shareCount }));
    return result;
  };

  const loadMore = async () => {
    if (!meta || meta.page >= meta.totalPages) return;
    setLoadingMore(true);
    setError("");
    try {
      const response = await listSavedCommunityPosts({ page: meta.page + 1, limit: meta.limit });
      setPosts((current) => [...current, ...response.posts.filter((post) => !current.some((known) => known.id === post.id))]);
      setMeta(response.meta);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Could not load more saved posts."));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <main className="flex min-w-0 flex-col gap-4 lg:px-6" id="main-content">
      <header className="rounded-xl border border-line bg-white p-5 sm:p-6">
        <p className="mb-1 mt-0 text-xs font-bold uppercase tracking-wider text-brand-700">{tr("Your saved items")}</p>
        <h1 className="m-0 text-2xl font-bold text-brand-900">{tr("Saved")}</h1>
        <p className="mb-0 mt-2 text-sm leading-6 text-muted">{tr("Keep useful scam alerts, community posts, and safety resources here for quick reference.")}</p>
      </header>

      {loading ? <LoadingState message="Loading saved posts..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> : null}
      {!loading && !error && posts.length === 0 ? (
        <EmptyState
          actionLabel="Return to community feed"
          actionTo="/"
          icon="bookmark"
          message="Save useful community alerts and they will appear here."
          title="No saved posts yet"
        />
      ) : null}

      {posts.map((post) => (
        <ScamPostCard
          key={post.id}
          onOpenComments={() => navigate(`/posts/${encodeURIComponent(post.id)}`)}
          onOpenPost={() => navigate(`/posts/${encodeURIComponent(post.id)}`)}
          onShare={(channel) => recordShare(post.id, channel)}
          onToggleLike={() => toggleLike(post.id)}
          onToggleSave={() => toggleSave(post.id)}
          post={post}
        />
      ))}

      {meta && meta.page < meta.totalPages ? (
        <button className="mb-2 rounded-xl border border-line bg-white py-3 text-sm font-semibold text-brand-700" disabled={loadingMore} onClick={loadMore} type="button">
          {loadingMore ? t("community.loading") : t("community.loadMoreAlerts")}
        </button>
      ) : null}
    </main>
  );
}
