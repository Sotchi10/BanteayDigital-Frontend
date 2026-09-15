import { useInterfaceTranslation } from "../../../locales/useInterfaceTranslation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "../../../components/ui";
import {
  apiErrorMessage,
  createPostComment,
  deleteCommunityComment,
  listPostComments,
  moderateCommunityComment,
  reportCommunityComment,
  updateCommunityComment,
} from "../api/communityApi";
import { CommentComposer } from "./CommentComposer";

const reportReasons = ["SPAM", "HARASSMENT", "DANGEROUS_LINK", "MISINFORMATION", "OTHER"];

function commentTimestamp(value, locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function CommentItem({
  comment: initialComment,
  currentUser,
  postId,
  onCountChange,
}) {
  const tr = useInterfaceTranslation();
  const { i18n, t } = useTranslation();
  const [comment, setComment] = useState(initialComment);
  const [replies, setReplies] = useState(initialComment.replies || []);
  const [repliesMeta, setRepliesMeta] = useState({
    hasMore:
      (initialComment.replyCount || 0) > (initialComment.replies?.length || 0),
    nextCursor: initialComment.replies?.at(-1)?.id || null,
  });
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(initialComment.content || "");
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("SPAM");
  const [reportDetails, setReportDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isOwner = currentUser?.id === comment.authorId;
  const isAdmin = currentUser?.role === "ADMIN";
  const isActive = comment.status === "ACTIVE";

  const run = async (work, fallback) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      return await work();
    } catch (requestError) {
      setError(apiErrorMessage(requestError, fallback));
      return null;
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    const response = await run(
      () => updateCommunityComment(comment.id, trimmed),
      t("community.comment"),
    );
    if (response) {
      setComment((value) => ({ ...value, ...response.comment }));
      setEditing(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`${t("community.delete")} ${t("community.comments")}?`))
      return;
    const response = await run(
      () => deleteCommunityComment(comment.id),
      t("community.delete"),
    );
    if (response) {
      setComment((value) => ({
        ...value,
        status: "DELETED",
        content: null,
        author: null,
      }));
      if (isActive) onCountChange(-1);
    }
  };

  const submitReport = async () => {
    const response = await run(
      () =>
        reportCommunityComment(comment.id, reportReason, reportDetails.trim()),
      t("community.report"),
    );
    if (response) {
      setReporting(false);
      setNotice(t("community.reportSubmitted"));
    }
  };

  const moderate = async (status) => {
    const response = await run(
      () => moderateCommunityComment(comment.id, status),
      t("community.comment"),
    );
    if (response) {
      const wasActive = comment.status === "ACTIVE";
      setComment((value) => ({ ...value, status }));
      if (wasActive !== (status === "ACTIVE"))
        onCountChange(status === "ACTIVE" ? 1 : -1);
    }
  };

  const addReply = async (content) => {
    const response = await createPostComment(postId, {
      content,
      parentId: comment.id,
    });
    setReplies((value) => [...value, response.comment]);
    setComment((value) => ({
      ...value,
      replyCount: (value.replyCount || 0) + 1,
    }));
    onCountChange(1);
  };

  const loadMoreReplies = async () => {
    const response = await run(
      () =>
        listPostComments(postId, {
          parentId: comment.id,
          cursor: repliesMeta.nextCursor,
          limit: 20,
        }),
      t("community.reply"),
    );
    if (response) {
      setReplies((value) => [
        ...value,
        ...response.comments.filter(
          (item) => !value.some((known) => known.id === item.id),
        ),
      ]);
      setRepliesMeta(response.meta);
    }
  };

  return (
    <article>
      <div className="flex gap-2">
        {comment.author ? (
          <Avatar
            name={comment.author.name || t("community.communityMember")}
            size="sm"
            tone="indigo"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          {isActive ? (
            <>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <strong className="text-[13px]">
                  {comment.author?.name || t("community.communityMember")}
                </strong>
                <time
                  className="text-[10px] text-[#8a96a8]"
                  dateTime={comment.createdAt}
                >
                  {commentTimestamp(comment.createdAt, i18n.language)}
                </time>
              </div>
              {editing ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    className="min-h-16 w-full resize-y rounded-lg border border-line p-2 text-[13px] outline-none focus:border-brand-600"
                    maxLength={1000}
                    onChange={(event) => setEditContent(event.target.value)}
                    value={editContent}
                  />
                  <div className="flex gap-2">
                    <button
                      className="rounded-md bg-brand-700 px-2.5 py-1 text-[11px] font-semibold text-white"
                      disabled={busy}
                      onClick={saveEdit}
                      type="button"
                    >
                      {t("community.save")}
                    </button>
                    <button
                      className="rounded-md border border-line bg-white px-2.5 py-1 text-[11px]"
                      onClick={() => setEditing(false)}
                      type="button"
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="my-1 whitespace-pre-wrap wrap-break-words text-[13px] leading-relaxed text-[#3f4f66]">
                  {comment.content}
                </p>
              )}
            </>
          ) : (
            <p className="my-1 text-[12px] italic text-[#8a96a8]">
              {comment.status === "HIDDEN"
                ? t("community.commentHidden")
                : t("community.commentDeleted")}
            </p>
          )}

          <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-[#68778d]">
            {currentUser && isActive && !comment.parentId ? (
              <button
                className="border-0 bg-transparent p-0 hover:text-brand-700"
                onClick={() => setReplying(true)}
                type="button"
              >
                {t("community.reply")}
              </button>
            ) : null}
            {isOwner && isActive ? (
              <button
                className="border-0 bg-transparent p-0 hover:text-brand-700"
                onClick={() => setEditing(true)}
                type="button"
              >
                {t("community.edit")}
              </button>
            ) : null}
            {isOwner && comment.status !== "DELETED" ? (
              <button
                className="border-0 bg-transparent p-0 hover:text-red-600"
                onClick={remove}
                type="button"
              >
                {t("community.delete")}
              </button>
            ) : null}
            {currentUser && !isOwner && isActive ? (
              <button
                className="border-0 bg-transparent p-0 hover:text-red-600"
                onClick={() => setReporting((value) => !value)}
                type="button"
              >
                {t("community.report")}
              </button>
            ) : null}
            {isAdmin && comment.status !== "DELETED" ? (
              <button
                className="border-0 bg-transparent p-0 hover:text-brand-700"
                onClick={() => moderate(isActive ? "HIDDEN" : "ACTIVE")}
                type="button"
              >
                {isActive ? t("community.hide") : t("community.restore")}
              </button>
            ) : null}
          </div>

          {reporting ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-[#fff7f7] p-2">
              <select
                className="rounded-md border border-line bg-white px-2 py-1 text-[11px]"
                onChange={(event) => setReportReason(event.target.value)}
                value={reportReason}
              >
                {reportReasons.map((value) => (
                  <option key={value} value={value}>
                    {t(`community.reportReasons.${value}`)}
                  </option>
                ))}
              </select>
              <input
                className="min-w-48 flex-1 rounded-md border border-line bg-white px-2 py-1 text-[11px]"
                maxLength={500}
                onChange={(event) => setReportDetails(event.target.value)}
                placeholder={t("community.optionalDetails")}
                value={reportDetails}
              />
              <button
                className="rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white"
                disabled={busy}
                onClick={submitReport}
                type="button"
              >
                {t("community.submitReport")}
              </button>
              <button
                className="text-[11px]"
                onClick={() => setReporting(false)}
                type="button"
              >
                {t("common.cancel")}
              </button>
            </div>
          ) : null}
          {replying ? (
            <div className="mt-3">
              <CommentComposer
                autoFocus
                compact
                currentUser={currentUser}
                onCancel={() => setReplying(false)}
                onSubmit={addReply}
              />
            </div>
          ) : null}
          {error ? (
            <p className="my-1 text-[11px] text-red-600">{tr(error)}</p>
          ) : null}
          {notice ? (
            <p className="my-1 text-[11px] text-green-700">{notice}</p>
          ) : null}
        </div>
      </div>

      {replies.length ? (
        <div className="mt-3 space-y-3 pl-3">
          {replies.map((reply) => (
            <CommentItem
              comment={reply}
              currentUser={currentUser}
              key={reply.id}
              onCountChange={onCountChange}
              postId={postId}
            />
          ))}
        </div>
      ) : null}
      {repliesMeta.hasMore ? (
        <button
          className="ml-12 mt-2 border-0 bg-transparent text-[11px] font-semibold text-brand-700"
          disabled={busy}
          onClick={loadMoreReplies}
          type="button"
        >
          {busy
            ? t("community.loading")
            : t("community.viewMoreReplies", { count: Math.max(0, (comment.replyCount || 0) - replies.length) })}
        </button>
      ) : null}
    </article>
  );
}
