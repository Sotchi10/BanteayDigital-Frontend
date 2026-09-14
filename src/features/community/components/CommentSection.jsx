import { useEffect, useState } from "react";
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
  minimalComposer = false,
  onCountChange,
  pinnedComposer = false,
  postId,
}) {
  const [comments, setComments] = useState([]);
  const [meta, setMeta] = useState({ hasMore: false, nextCursor: null });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

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
          setError(apiErrorMessage(requestError, "Could not load comments."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [postId]);

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
      setError(apiErrorMessage(requestError, "Could not load more comments."));
    } finally {
      setLoadingMore(false);
    }
  };

  const commentList = (
    <>
      {loading ? (
        <p className="py-4 text-center text-[12px] text-muted">
          Loading comments…
        </p>
      ) : null}
      {error ? <p className="py-2 text-[12px] text-red-600">{error}</p> : null}
      {!loading && comments.length === 0 ? (
        <p className="py-4 text-center text-[12px] text-muted">
          No comments yet. Start a helpful discussion.
        </p>
      ) : null}
      <div className="space-y-4">
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
          className="mt-4 w-full rounded-lg border border-line bg-white py-2 text-[12px] font-semibold text-brand-700"
          disabled={loadingMore}
          onClick={loadMore}
          type="button"
        >
          {loadingMore ? "Loading…" : "Load more comments"}
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
      className={`border-t border-[#e5eaf1] bg-[#fbfcfe] px-1 py-4 ${className}`}
      aria-label="Comments"
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
          {composer}
          {commentList}
        </>
      )}
    </section>
  );
}
