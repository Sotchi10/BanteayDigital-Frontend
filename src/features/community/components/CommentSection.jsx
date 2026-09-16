import { useInterfaceTranslation } from "../../../locales/useInterfaceTranslation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  apiErrorMessage,
  createPostComment,
  listPostComments,
} from "../api/communityApi";
import { CommentComposer } from "./CommentComposer";
import { CommentItem } from "./CommentItem";

export function CommentSection({
  className = "",
  compact = false,
  currentUser,
  dense = false,
  minimalComposer = false,
  onCountChange,
  composerAfter = false,
  pinnedComposer = false,
  postId,
}) {
  const tr = useInterfaceTranslation();
  const { t } = useTranslation();
  const [comments, setComments] = useState([]);
  const [meta, setMeta] = useState({ hasMore: false, nextCursor: null });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    listPostComments(postId)
      .then((response) => {
        if (!active) return;
        setComments(response.comments);
        setMeta(response.meta);
      })
      .catch((requestError) => {
        if (active)
          setError(apiErrorMessage(requestError, t("community.comments")));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [postId, retryKey, t]);

  const addComment = async (content) => {
    const response = await createPostComment(postId, { content });
    setComments((value) => [
      ...value,
      { ...response.comment, replies: [], replyCount: 0 },
    ]);
    onCountChange(1);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    setError("");
    try {
      const response = await listPostComments(postId, {
        cursor: meta.nextCursor,
      });
      setComments((value) => [
        ...value,
        ...response.comments.filter(
          (item) => !value.some((known) => known.id === item.id),
        ),
      ]);
      setMeta(response.meta);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, t("community.comments")));
    } finally {
      setLoadingMore(false);
    }
  };

  const commentList = (
    <>
      {loading ? (
        <p className="community-meta py-4 text-center">
          {t("community.loadingComments")}
        </p>
      ) : null}
      {error ? (
        <div className="community-meta flex items-center justify-between gap-3 py-2 text-red-600">
          <span>{tr(error)}</span>
          {!comments.length ? (
            <button className="shrink-0 font-semibold text-brand-800" onClick={() => { setError(""); setLoading(true); setRetryKey((value) => value + 1); }} type="button">
              {tr("Try again")}
            </button>
          ) : null}
        </div>
      ) : null}
      {!loading && !error && comments.length === 0 ? (
        <p className="community-meta py-4 text-center">
          {t("community.noComments")}
        </p>
      ) : null}
      <div className={dense ? "space-y-3" : "space-y-4"}>
        {comments.map((comment) => (
          <CommentItem
            comment={comment}
            currentUser={currentUser}
            key={comment.id}
            onCountChange={onCountChange}
            postId={postId}
          />
        ))}
      </div>
      {meta.hasMore ? (
        <button
          className="mt-4 w-full rounded-lg border border-line bg-white py-2 text-sm font-semibold text-brand-700"
          disabled={loadingMore}
          onClick={loadMore}
          type="button"
        >
          {loadingMore ? t("community.loading") : t("community.loadMoreComments")}
        </button>
      ) : null}
    </>
  );
  const composer = (
    <CommentComposer
      compact={compact}
      currentUser={currentUser}
      minimal={minimalComposer}
      onSubmit={addComment}
    />
  );

  return (
    <section
      className={` border-line bg-[#fbfcfe] px-1 py-4 ${className}`}
      aria-label={t("community.comments")}
    >
      {pinnedComposer ? (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {commentList}
          </div>
          <div className="mt-3 shrink-0 border-t border-line bg-[#fbfcfe] pt-3">
            {composer}
          </div>
        </>
      ) : (
        <>
          {composerAfter ? (
            <>
              {commentList}
              <div className={`${dense ? "mt-3 pt-3" : "mt-5 pt-4"} border-t border-line`}>{composer}</div>
            </>
          ) : (
            <>
              {composer}
              {commentList}
            </>
          )}
        </>
      )}
    </section>
  );
}
